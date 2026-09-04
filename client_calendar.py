from __future__ import annotations
import urllib.request
import ssl
from datetime import datetime, date, timedelta, timezone
from zoneinfo import ZoneInfo
import re

CLARIANE_ICS_URL = "https://outlook.office365.com/owa/calendar/cf318fa9f88446bcb937d30e78497e4e@clariane.fr/8d702179f72a4b29b58adc2b5e8d6ccd6100697737592675614/calendar.ics"
LOCAL_TZ = ZoneInfo("Europe/Paris")

def unfold_lines(text: str) -> list[str]:
    lines = []
    for line in text.splitlines():
        if (line.startswith(" ") or line.startswith("\t")) and lines:
            lines[-1] += line[1:]
        else:
            lines.append(line)
    return lines

def clean_text(val: str) -> str:
    return val.replace(r"\,", ",").replace(r"\;", ";").replace(r"\n", "\n").replace(r"\\", "\\").strip()

def parse_outlook_datetime(dt_str: str) -> datetime | None:
    try:
        # e.g., 20260903T103000Z or TZID=W. Europe Standard Time:20260903T120000
        val = dt_str.split(":")[-1].strip()
        if val.endswith("Z"):
            dt = datetime.strptime(val, "%Y%m%dT%H%M%SZ")
            return dt.replace(tzinfo=timezone.utc).astimezone(LOCAL_TZ)
        elif len(val) == 8:
            dt = datetime.strptime(val, "%Y%m%d")
            return dt.replace(tzinfo=LOCAL_TZ)
        elif "T" in val:
            dt = datetime.strptime(val[:15], "%Y%m%dT%H%M%S")
            return dt.replace(tzinfo=LOCAL_TZ)
    except Exception:
        return None
    return None

def fetch_client_events() -> list[dict]:
    """Fetches and parses events from Clariane Outlook 365."""
    req = urllib.request.Request(CLARIANE_ICS_URL, headers={"User-Agent": "Mozilla/5.0"})
    ctx = ssl._create_unverified_context()
    with urllib.request.urlopen(req, context=ctx) as resp:
        content = resp.read().decode("utf-8", errors="ignore")

    lines = unfold_lines(content)
    events = []
    current = {}

    for line in lines:
        line = line.strip()
        if line.startswith("BEGIN:VEVENT"):
            current = {}
        elif line.startswith("DTSTART"):
            current["dtstart_raw"] = line
        elif line.startswith("DTEND"):
            current["dtend_raw"] = line
        elif line.startswith("SUMMARY:"):
            current["summary"] = clean_text(line[len("SUMMARY:"):])
        elif line.startswith("LOCATION:"):
            current["location"] = clean_text(line[len("LOCATION:"):])
        elif line.startswith("DESCRIPTION:"):
            current["description"] = clean_text(line[len("DESCRIPTION:"):])
        elif line.startswith("END:VEVENT"):
            if "dtstart_raw" in current and "summary" in current:
                start_dt = parse_outlook_datetime(current["dtstart_raw"])
                end_dt = parse_outlook_datetime(current.get("dtend_raw", current["dtstart_raw"]))
                if start_dt and end_dt:
                    events.append({
                        "source": "Clariane (Client)",
                        "summary": current.get("summary", "Client Meeting"),
                        "start": start_dt,
                        "end": end_dt,
                        "location": current.get("location", ""),
                        "description": current.get("description", "")
                    })

    return sorted(events, key=lambda x: x["start"])

def get_client_day_schedule(target_date: date | None = None) -> list[dict]:
    if target_date is None:
        target_date = datetime.now(LOCAL_TZ).date()
    all_events = fetch_client_events()
    return [e for e in all_events if e["start"].date() == target_date]

if __name__ == "__main__":
    today = datetime.now(LOCAL_TZ).date()
    print("==================================================")
    print(f"🏥 Clariane Client Calendar Events for {today}")
    print("==================================================")
    events = get_client_day_schedule(today)
    if events:
        for ev in events:
            s = ev["start"].strftime("%H:%M")
            e = ev["end"].strftime("%H:%M")
            loc = f" 📍 {ev['location']}" if ev['location'] else ""
            print(f"• {s} - {e} : {ev['summary']}{loc}")
    else:
        print("  No Clariane client meetings scheduled for today!")
