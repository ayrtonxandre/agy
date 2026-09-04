#!/usr/bin/env python3
"""
drive_sync.py - Cross-Machine Data & Dashboard Synchronization via Google Drive.
Enables Machine 1 (Mac) and Machine 2 to share, push, and query on-demand:
  - Apple Health & Biometrics CSVs
  - Garmin Strength Volumes & Extracted Workouts
  - Interactive ATHX & Calendar HTML Dashboards

Usage:
  python drive_sync.py push    # Uploads local datasets & dashboards to Google Drive
  python drive_sync.py pull    # Downloads latest datasets & dashboards from Google Drive
  python drive_sync.py list    # Lists files in the cloud hub folder
  python drive_sync.py status  # Compares local vs remote files
"""

from __future__ import annotations
import os
import sys
import io
import json
from datetime import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE = os.path.join(BASE_DIR, "credentials.json")
TOKEN_FILE = os.path.join(BASE_DIR, "drive_token.json")

# Scopes: drive.file allows creating and managing files created by this app
SCOPES = ["https://www.googleapis.com/auth/drive.file"]

FOLDER_NAME = "AGY - Intelligence Hub"

# Target files to synchronize
SYNC_TARGETS = [
    # Biometrics & Health Datasets
    "apple_body_composition.csv",
    "apple_daily_activity.csv",
    "apple_nutrition_macros.csv",
    "apple_sleep.csv",
    "apple_workouts_history.csv",
    # Garmin Extracted Datasets
    "garmin_extracted_workouts.csv",
    "garmin_extracted_workouts.json",
    "garmin_workout_volume.json",
    # Live Dashboards
    "garmin_workout.html",
    "calendar_dashboard.html"
]

MIME_MAP = {
    ".csv": "text/csv",
    ".json": "application/json",
    ".html": "text/html",
    ".txt": "text/plain"
}

def get_drive_service():
    """Authenticates and returns the Google Drive v3 service."""
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                raise FileNotFoundError(f"Missing {CREDENTIALS_FILE}. Required for OAuth authentication.")
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=8086, open_browser=True)
        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())

    return build("drive", "v3", credentials=creds)

def get_or_create_hub_folder(service) -> str:
    """Finds or creates the target folder in Google Drive."""
    query = f"name = '{FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    res = service.files().list(q=query, spaces="drive", fields="files(id, name)").execute()
    files = res.get("files", [])
    if files:
        return files[0]["id"]

    # Create folder
    folder_metadata = {
        "name": FOLDER_NAME,
        "mimeType": "application/vnd.google-apps.folder",
        "description": "AGY Athlete & Work Intelligence Hub (Auto-synced data and dashboards)"
    }
    folder = service.files().create(body=folder_metadata, fields="id").execute()
    print(f"📁 Created new Google Drive folder: '{FOLDER_NAME}' (ID: {folder.get('id')})")
    return folder.get("id")

def list_cloud_files(service, folder_id: str) -> dict[str, dict]:
    """Returns a dict of filename -> {id, name, modifiedTime, size} in the hub folder."""
    query = f"'{folder_id}' in parents and trashed = false"
    res = service.files().list(q=query, spaces="drive", fields="files(id, name, modifiedTime, size)").execute()
    return {f["name"]: f for f in res.get("files", [])}

def push_files(specific_files: list[str] | None = None):
    """Pushes local datasets and dashboards to the Google Drive Hub folder."""
    service = get_drive_service()
    folder_id = get_or_create_hub_folder(service)
    cloud_files = list_cloud_files(service, folder_id)

    targets = specific_files if specific_files else SYNC_TARGETS
    print(f"🚀 Pushing files to Google Drive Hub ('{FOLDER_NAME}')...\n")

    pushed_count = 0
    for filename in targets:
        local_path = os.path.join(BASE_DIR, filename)
        if not os.path.exists(local_path):
            continue

        ext = os.path.splitext(filename)[1].lower()
        mime_type = MIME_MAP.get(ext, "application/octet-stream")
        file_size = os.path.getsize(local_path)
        media = MediaFileUpload(local_path, mimetype=mime_type, resumable=True)

        if filename in cloud_files:
            # Update existing file
            file_id = cloud_files[filename]["id"]
            service.files().update(
                fileId=file_id,
                media_body=media,
                fields="id, name, modifiedTime"
            ).execute()
            print(f"  🔄 Updated: {filename} ({file_size:,} bytes)")
        else:
            # Create new file in folder
            file_metadata = {
                "name": filename,
                "parents": [folder_id]
            }
            service.files().create(
                body=file_metadata,
                media_body=media,
                fields="id, name"
            ).execute()
            print(f"  ✨ Uploaded: {filename} ({file_size:,} bytes)")

        pushed_count += 1

    print(f"\n✅ Push complete! {pushed_count} files synchronized to Google Drive.")

def pull_files(specific_files: list[str] | None = None):
    """Pulls datasets and dashboards from Google Drive to local machine."""
    service = get_drive_service()
    folder_id = get_or_create_hub_folder(service)
    cloud_files = list_cloud_files(service, folder_id)

    if not cloud_files:
        print(f"⚠️ No files found in Google Drive folder '{FOLDER_NAME}'. Run 'push' from Machine 1 first.")
        return

    targets = specific_files if specific_files else list(cloud_files.keys())
    print(f"📥 Pulling files from Google Drive Hub ('{FOLDER_NAME}')...\n")

    pulled_count = 0
    for filename in targets:
        if filename not in cloud_files:
            continue

        file_id = cloud_files[filename]["id"]
        local_path = os.path.join(BASE_DIR, filename)

        request = service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()

        with open(local_path, "wb") as f:
            f.write(fh.getvalue())

        file_size = os.path.getsize(local_path)
        print(f"  📥 Downloaded: {filename} ({file_size:,} bytes)")
        pulled_count += 1

    print(f"\n✅ Pull complete! {pulled_count} files updated locally.")

def show_status():
    """Compares local vs cloud files."""
    service = get_drive_service()
    folder_id = get_or_create_hub_folder(service)
    cloud_files = list_cloud_files(service, folder_id)

    print(f"📊 Status for Hub Folder: '{FOLDER_NAME}'\n")
    print(f"{'Filename':<35} {'Local Status':<18} {'Drive Status':<20}")
    print("-" * 75)

    all_keys = sorted(set(SYNC_TARGETS) | set(cloud_files.keys()))
    for filename in all_keys:
        local_path = os.path.join(BASE_DIR, filename)
        if os.path.exists(local_path):
            l_size = os.path.getsize(local_path)
            local_str = f"Present ({l_size:,} B)"
        else:
            local_str = "Missing"

        if filename in cloud_files:
            c_size = int(cloud_files[filename].get("size", 0))
            drive_str = f"In Cloud ({c_size:,} B)"
        else:
            drive_str = "Not Uploaded"

        print(f"{filename:<35} {local_str:<18} {drive_str:<20}")

def auto_push():
    """Silent push helper designed to be called asynchronously by orchestrator."""
    try:
        push_files()
    except Exception as e:
        print(f"[DriveSync Error] Background push failed: {e}")

if __name__ == "__main__":
    action = sys.argv[1].lower() if len(sys.argv) > 1 else "status"
    if action == "push":
        push_files()
    elif action == "pull":
        pull_files()
    elif action in ("list", "status"):
        show_status()
    else:
        print("Usage: python drive_sync.py [push|pull|status]")
