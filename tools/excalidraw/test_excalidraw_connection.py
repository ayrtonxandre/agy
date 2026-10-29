#!/usr/bin/env python3
"""
Test connection to Google Cloud Discovery Engine Excalidraw Data Store.
Project: privategpt-437907
Region: eu
Collection / Data Store: excalidraw_1787583517655
"""

import os
import json
import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE = os.path.join(BASE_DIR, "credentials.json")
GCP_TOKEN_FILE = os.path.join(BASE_DIR, "gcp_token.json")

SCOPES = [
    "https://www.googleapis.com/auth/cloud-platform"
]

PROJECT_ID = "privategpt-437907"
LOCATION = "eu"
DATA_STORE_ID = "excalidraw_1787583517655"

def get_gcp_credentials():
    creds = None
    if os.path.exists(GCP_TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(GCP_TOKEN_FILE, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=8085, open_browser=True)
        with open(GCP_TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
            
    return creds

if __name__ == "__main__":
    print("Initiating GCP OAuth Flow...")
    creds = get_gcp_credentials()
    print("OAuth succeeded! Access token obtained.")
    
    # Test Discovery Engine endpoint
    headers = {
        "Authorization": f"Bearer {creds.token}",
        "Content-Type": "application/json"
    }
    
    # 1. Inspect Data Store / Collection
    endpoints_to_try = [
        f"https://eu-discoveryengine.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{DATA_STORE_ID}",
        f"https://eu-discoveryengine.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/dataStores/{DATA_STORE_ID}",
        f"https://eu-discoveryengine.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/engines",
        f"https://eu-discoveryengine.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores"
    ]
    
    for url in endpoints_to_try:
        print(f"\nGET {url}")
        res = requests.get(url, headers=headers)
        print("Status:", res.status_code)
        if res.status_code == 200:
            print("Response:", json.dumps(res.json(), indent=2)[:500])
        else:
            print("Error:", res.text[:300])
