import os
import re
import ssl
import urllib.request
from datetime import datetime, date, timedelta, timezone
from zoneinfo import ZoneInfo

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_ICS_PATH = os.path.join(BASE_DIR, "calendar_data", "[ARTEFACT]_ayrton.andre@artefact.com.ics")
REMOTE_ICS_URL = "https://calendar.google.com/calendar/ical/ayrton.andre%40artefact.com/public/basic.ics"

def unfold_ical_lines(raw_text: str) -> list[str]:
    """Unfolds iCal lines wrapped by CRLF/LF followed by whitespace according to RFC 5545."""
    lines = []
    for line in raw_text.splitlines():
        if (line.startswith(" ") or line.startswith("\t")) and lines:
            lines[-1] += line[1:]
        else:
            lines.append(line)
    return lines

def clean_ical_text(val: str) -> str:
    """Unescapes backslashed characters in iCal text."""
    return val.replace(r"\,", ",").replace(r"\;", ";").replace(r"\n", "\n").replace(r"\\", "\\").strip()

def fetch_calendar_events(source_path: str = LOCAL_ICS_PATH, remote_url: str = REMOTE_ICS_URL) -> list[dict]:
    """Fetches and parses iCal events, preferring local unredacted export if available."""
    content = ""
    is_local = os.path.exists(source_path)

    if is_local:
        with open(source_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    else:
        req = urllib.request.Request(
            remote_url,
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
        )
        ctx = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=ctx) as resp:
            content = resp.read().decode("utf-8")

    unfolded_lines = unfold_ical_lines(content)

    events = []
    current = {}
    for line in unfolded_lines:
        line = line.strip()
        if line.startswith("BEGIN:VEVENT"):
            current = {}
        elif line.startswith("DTSTART"):
            current["dtstart_raw"] = line.split(":")[-1]
        elif line.startswith("DTEND"):
            current["dtend_raw"] = line.split(":")[-1]
        elif line.startswith("SUMMARY:"):
            current["summary"] = clean_ical_text(line[len("SUMMARY:"):])
        elif line.startswith("LOCATION:"):
            current["location"] = clean_ical_text(line[len("LOCATION:"):])
        elif line.startswith("DESCRIPTION:"):
            current["description"] = clean_ical_text(line[len("DESCRIPTION:"):])
        elif line.startswith("UID:"):
            current["uid"] = line.split(":")[-1]
        elif line.startswith("END:VEVENT"):
            if "dtstart_raw" in current:
                events.append(current)

    parsed_events = []
    for ev in events:
        start_dt = parse_ical_datetime(ev["dtstart_raw"])
        end_dt = parse_ical_datetime(ev.get("dtend_raw", ev["dtstart_raw"]))
        if start_dt and end_dt:
            # Extract meeting links if present
            desc = ev.get("description", "")
            meet_link = None
            meet_match = re.search(r"https://(meet\.google\.com/[a-z-]+|teams\.microsoft\.com/l/meetup-join/[^\s\>]+)", desc)
            if meet_match:
                meet_link = meet_match.group(0)

            parsed_events.append({
                "start": start_dt.astimezone(LOCAL_TZ),
                "end": end_dt.astimezone(LOCAL_TZ),
                "summary": ev.get("summary", "Busy"),
                "location": ev.get("location", ""),
                "description": desc,
                "meet_link": meet_link
            })

    # Deduplicate events with same summary & start time
    seen = set()
    unique_events = []
    for ev in sorted(parsed_events, key=lambda x: x["start"]):
        key = (ev["start"], ev["end"], ev["summary"])
        if key not in seen:
            seen.add(key)
            unique_events.append(ev)

    return unique_events

def parse_ical_datetime(dt_str: str) -> datetime | None:
    """Parses iCal datetime formats into timezone-aware datetime."""
    try:
        # UTC format: 20260903T093000Z
        if dt_str.endswith("Z"):
            dt = datetime.strptime(dt_str, "%Y%m%dT%H%M%SZ")
            return dt.replace(tzinfo=timezone.utc)
        # Date only: 20260903
        elif len(dt_str) == 8:
            dt = datetime.strptime(dt_str, "%Y%m%d")
            return dt.replace(tzinfo=LOCAL_TZ)
        # Standard: 20260903T093000
        else:
            dt = datetime.strptime(dt_str, "%Y%m%dT%H%M%S")
            return dt.replace(tzinfo=LOCAL_TZ)
    except Exception:
        return None

def get_day_schedule(target_date: date | None = None) -> list[dict]:
    """Returns all events on target date (default today)."""
    if target_date is None:
        target_date = datetime.now(LOCAL_TZ).date()
    
    all_events = fetch_calendar_events()
    return [e for e in all_events if e["start"].date() == target_date]

def find_free_workout_slots(target_date: date | None = None, min_duration_minutes: int = 60) -> list[tuple[datetime, datetime]]:
    """Calculates free blocks of time between 07:00 and 21:00 on the target date."""
    if target_date is None:
        target_date = datetime.now(LOCAL_TZ).date()

    day_events = get_day_schedule(target_date)
    
    day_start = datetime(target_date.year, target_date.month, target_date.day, 7, 0, tzinfo=LOCAL_TZ)
    day_end = datetime(target_date.year, target_date.month, target_date.day, 21, 0, tzinfo=LOCAL_TZ)

    busy_intervals = []
    for ev in day_events:
        # Ignore zero-duration reminder events or all-day banners (>=12h)
        if ev["end"] <= ev["start"] or (ev["end"] - ev["start"]) >= timedelta(hours=12):
            continue
        start = max(day_start, ev["start"])
        end = min(day_end, ev["end"])
        if start < end:
            busy_intervals.append((start, end))

    busy_intervals.sort(key=lambda x: x[0])
    merged = []
    for start, end in busy_intervals:
        if not merged:
            merged.append([start, end])
        else:
            prev_start, prev_end = merged[-1]
            if start <= prev_end:
                merged[-1][1] = max(prev_end, end)
            else:
                merged.append([start, end])

    free_slots = []
    curr = day_start
    for b_start, b_end in merged:
        if (b_start - curr) >= timedelta(minutes=min_duration_minutes):
            free_slots.append((curr, b_start))
        curr = max(curr, b_end)

    if (day_end - curr) >= timedelta(minutes=min_duration_minutes):
        free_slots.append((curr, day_end))

    return free_slots

if __name__ == "__main__":
    today = datetime.now(LOCAL_TZ).date()
    print(f"==================================================")
    print(f"📅 Detailed Schedule for {today.strftime('%A, %b %d, %Y')} (Paris Time)")
    print(f"==================================================")
    
    events = get_day_schedule(today)
    if events:
        for ev in events:
            s = ev['start'].strftime('%H:%M')
            e = ev['end'].strftime('%H:%M')
            loc = f" 📍 {ev['location']}" if ev['location'] else ""
            meet = " 🔗 Video Call" if ev['meet_link'] else ""
            print(f"• {s} - {e} : {ev['summary']}{loc}{meet}")
    else:
        print("  No meetings scheduled for today!")

    print(f"\n==================================================")
    print(f"⚡ Available Workout Windows (>= 60 min)")
    print(f"==================================================")
    free_slots = find_free_workout_slots(today, min_duration_minutes=60)
    for start, end in free_slots:
        dur = int((end - start).total_seconds() // 60)
        print(f"• {start.strftime('%H:%M')} - {end.strftime('%H:%M')} ({dur} min open block)")
