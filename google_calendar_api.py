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

def create_calendar_event(
    summary: str,
    start_iso: str,
    end_iso: str,
    description: str = "",
    location: str = "",
    attendees: list[str] | None = None,
    with_meet: bool = False,
    send_updates: str = "all",
):
    """Creates a new event with full edit rights, optional attendees and Google Meet."""
    service = get_calendar_service()
    event_body = {
        "summary": summary,
        "location": location,
        "description": description,
        "start": {"dateTime": start_iso, "timeZone": "Europe/Paris"},
        "end": {"dateTime": end_iso, "timeZone": "Europe/Paris"},
    }
    if attendees:
        event_body["attendees"] = [{"email": email} for email in attendees]
    if with_meet:
        event_body["conferenceData"] = {
            "createRequest": {
                "requestId": f"meet_{int(datetime.now().timestamp())}",
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        }
    created_event = service.events().insert(
        calendarId="primary",
        body=event_body,
        conferenceDataVersion=1 if with_meet else 0,
        sendUpdates=send_updates,
    ).execute()
    return created_event

def query_freebusy(emails: list[str], time_min_iso: str, time_max_iso: str):
    """Queries Free/Busy schedules for multiple email addresses."""
    service = get_calendar_service()
    body = {
        "timeMin": time_min_iso,
        "timeMax": time_max_iso,
        "timeZone": "Europe/Paris",
        "items": [{"id": email} for email in emails],
    }
    return service.freebusy().query(body=body).execute()

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
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Google Calendar CLI Manager")
    subparsers = parser.add_subparsers(dest="subcommand", help="Subcommand to run")

    # list
    list_parser = subparsers.add_parser("list", help="List upcoming events")
    list_parser.add_argument("--limit", type=int, default=5, help="Max events to display")

    # freebusy
    fb_parser = subparsers.add_parser("freebusy", help="Query free/busy slots")
    fb_parser.add_argument("--emails", nargs="+", required=True, help="List of email addresses")
    fb_parser.add_argument("--time-min", required=True, help="Start time ISO (e.g. 2026-09-10T08:00:00+02:00)")
    fb_parser.add_argument("--time-max", required=True, help="End time ISO (e.g. 2026-09-10T20:00:00+02:00)")

    # create
    create_parser = subparsers.add_parser("create", help="Create calendar event")
    create_parser.add_argument("--summary", required=True, help="Event summary/title")
    create_parser.add_argument("--start", required=True, help="Start datetime ISO")
    create_parser.add_argument("--end", required=True, help="End datetime ISO")
    create_parser.add_argument("--attendees", nargs="*", default=[], help="Attendee emails")
    create_parser.add_argument("--description", default="", help="Event description")
    create_parser.add_argument("--location", default="", help="Event location")
    create_parser.add_argument("--meet", action="store_true", help="Attach Google Meet link")
    create_parser.add_argument("--send-updates", default="all", choices=["all", "externalOnly", "none"], help="Send email notifications")

    # delete
    del_parser = subparsers.add_parser("delete", help="Delete event by ID")
    del_parser.add_argument("--event-id", required=True, help="Calendar event ID")

    args = parser.parse_args()

    if args.subcommand == "freebusy":
        res = query_freebusy(args.emails, args.time_min, args.time_max)
        print(json.dumps(res, indent=2))
    elif args.subcommand == "create":
        ev = create_calendar_event(
            summary=args.summary,
            start_iso=args.start,
            end_iso=args.end,
            description=args.description,
            location=args.location,
            attendees=args.attendees,
            with_meet=args.meet,
            send_updates=args.send_updates,
        )
        print(f"Created event ID: {ev.get('id')}")
        print(f"Link: {ev.get('htmlLink')}")
        if "conferenceData" in ev:
            for ep in ev["conferenceData"].get("entryPoints", []):
                if ep.get("entryPointType") == "video":
                    print(f"Google Meet: {ep.get('uri')}")
    elif args.subcommand == "delete":
        delete_calendar_event(args.event_id)
        print(f"Deleted event {args.event_id}")
    else:
        # Default behavior: list
        limit = args.limit if hasattr(args, "limit") else 5
        events = list_upcoming_events(limit)
        print("==================================================")
        print("⚡ Live Google Calendar Connected with FULL EDIT RIGHTS")
        print("==================================================")
        for ev in events:
            start = ev["start"].get("dateTime", ev["start"].get("date"))
            summary = ev.get("summary", "No title")
            print(f"• {start} : {summary}")

