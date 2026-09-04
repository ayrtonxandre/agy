from __future__ import annotations
import json
import os
from datetime import datetime, timedelta, date
from zoneinfo import ZoneInfo
import caldav
from icalendar import Event, Calendar

CONFIG_PATH = os.path.expanduser("~/.icloud_calendar_config.json")
LOCAL_TZ = ZoneInfo("Europe/Paris")

def get_caldav_client() -> caldav.DAVClient:
    """Creates an authenticated CalDAV client for iCloud."""
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    return caldav.DAVClient(
        url=conf["caldav_url"],
        username=conf["username"],
        password=conf["app_specific_password"]
    )

def get_icloud_calendars():
    """Returns all calendars under the iCloud account."""
    client = get_caldav_client()
    return client.principal().calendars()

def get_target_calendar(calendar_name: str = "Ma vie"):
    """Finds a specific calendar by display name."""
    for cal in get_icloud_calendars():
        if cal.get_display_name().lower() == calendar_name.lower():
            return cal
    # Default to first calendar if not matched
    calendars = get_icloud_calendars()
    return calendars[0] if calendars else None

def list_icloud_events(start_dt: datetime, end_dt: datetime, calendar_name: str | None = None) -> list[dict]:
    """Lists events across specified calendar or all calendars."""
    calendars = [get_target_calendar(calendar_name)] if calendar_name else get_icloud_calendars()
    
    results = []
    for cal in calendars:
        c_name = cal.get_display_name()
        try:
            events = cal.search(start=start_dt, end=end_dt, event=True, expand=True)
            for ev in events:
                comp = ev.icalendar_component
                dtstart = comp.get("dtstart").dt
                dtend = comp.get("dtend").dt if comp.get("dtend") else dtstart
                summary = str(comp.get("summary", "No Title"))
                location = str(comp.get("location", "")) if comp.get("location") else ""
                
                # Normalize timezones
                if isinstance(dtstart, datetime) and dtstart.tzinfo is None:
                    dtstart = dtstart.replace(tzinfo=LOCAL_TZ)
                elif isinstance(dtstart, datetime):
                    dtstart = dtstart.astimezone(LOCAL_TZ)

                if isinstance(dtend, datetime) and dtend.tzinfo is None:
                    dtend = dtend.replace(tzinfo=LOCAL_TZ)
                elif isinstance(dtend, datetime):
                    dtend = dtend.astimezone(LOCAL_TZ)

                results.append({
                    "calendar": c_name,
                    "summary": summary,
                    "start": dtstart,
                    "end": dtend,
                    "location": location,
                    "raw_event": ev
                })
        except Exception:
            continue

    return sorted(results, key=lambda x: x["start"] if isinstance(x["start"], datetime) else datetime.combine(x["start"], datetime.min.time(), tzinfo=LOCAL_TZ))

def add_icloud_event(summary: str, start_dt: datetime, end_dt: datetime, description: str = "", location: str = "", calendar_name: str = "Ma vie"):
    """Adds a new event to iCloud calendar."""
    cal = get_target_calendar(calendar_name)
    if not cal:
        raise ValueError(f"Calendar '{calendar_name}' not found.")

    cal_obj = Calendar()
    cal_obj.add("prodid", "-//Antigravity Agent//iCloud//EN")
    cal_obj.add("version", "2.0")

    ev = Event()
    ev.add("summary", summary)
    ev.add("dtstart", start_dt)
    ev.add("dtend", end_dt)
    if description:
        ev.add("description", description)
    if location:
        ev.add("location", location)

    cal_obj.add_component(ev)
    return cal.add_event(cal_obj.to_ical().decode("utf-8"))

if __name__ == "__main__":
    now = datetime.now(LOCAL_TZ)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=7)
    
    print("==================================================")
    print("🍏 Personal iCloud Calendar Connected")
    print("==================================================")
    events = list_icloud_events(start, end)
    for ev in events:
        s_str = ev["start"].strftime("%a %b %d @ %H:%M") if isinstance(ev["start"], datetime) else str(ev["start"])
        print(f"• [{ev['calendar']}] {s_str} : {ev['summary']}")
