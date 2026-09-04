from __future__ import annotations
import os
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events"
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE = os.path.join(BASE_DIR, "credentials.json")
TOKEN_FILE = os.path.join(BASE_DIR, "token.json")
LOCAL_TZ = ZoneInfo("Europe/Paris")

def get_calendar_service():
    """Authenticates and returns the Google Calendar API service with full edit rights."""
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0, open_browser=True)
        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())

    return build("calendar", "v3", credentials=creds)

def list_upcoming_events(max_results=10):
    """Lists upcoming events using live Google Calendar API."""
    service = get_calendar_service()
    now = datetime.now(timezone.utc).isoformat()
    
    events_result = service.events().list(
        calendarId="primary",
        timeMin=now,
        maxResults=max_results,
        singleEvents=True,
        orderBy="startTime"
    ).execute()
    
    return events_result.get("items", [])

def create_calendar_event(summary: str, start_iso: str, end_iso: str, description: str = "", location: str = ""):
    """Creates a new event with full edit rights."""
    service = get_calendar_service()
    event_body = {
        "summary": summary,
        "location": location,
        "description": description,
        "start": {"dateTime": start_iso, "timeZone": "Europe/Paris"},
        "end": {"dateTime": end_iso, "timeZone": "Europe/Paris"},
    }
    created_event = service.events().insert(calendarId="primary", body=event_body).execute()
    return created_event

def delete_calendar_event(event_id: str):
    """Deletes an event by ID."""
    service = get_calendar_service()
    service.events().delete(calendarId="primary", eventId=event_id).execute()
    return True

def schedule_workout(title: str, start_time: datetime, duration_minutes: int = 75, notes: str = ""):
    """Convenience helper to schedule a workout in Europe/Paris timezone."""
    end_time = start_time + timedelta(minutes=duration_minutes)
    start_iso = start_time.isoformat()
    end_iso = end_time.isoformat()
    desc = f"ATHX 2027 Training Block\nTarget BW: 85kg\n\n{notes}".strip()
    return create_calendar_event(
        summary=title,
        start_iso=start_iso,
        end_iso=end_iso,
        description=desc,
        location="Gym"
    )

if __name__ == "__main__":
    service = get_calendar_service()
    events = list_upcoming_events(5)
    print("==================================================")
    print("⚡ Live Google Calendar Connected with FULL EDIT RIGHTS")
    print("==================================================")
    for ev in events:
        start = ev["start"].get("dateTime", ev["start"].get("date"))
        summary = ev.get("summary", "No title")
        print(f"• {start} : {summary}")
