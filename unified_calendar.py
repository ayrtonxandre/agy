from __future__ import annotations
import os
import sys
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo

from google_calendar_api import list_upcoming_events, get_calendar_service
from icloud_calendar import list_icloud_events
from client_calendar import fetch_client_events

LOCAL_TZ = ZoneInfo("Europe/Paris")

def get_unified_events(start_dt: datetime, end_dt: datetime) -> list[dict]:
    """Aggregates and deduplicates events across Artefact (Google), Personal (iCloud), and Client (Clariane)."""
    unified = []

    # 1. Artefact (Google API)
    try:
        service = get_calendar_service()
        g_events = service.events().list(
            calendarId="primary",
            timeMin=start_dt.isoformat(),
            timeMax=end_dt.isoformat(),
            singleEvents=True,
            orderBy="startTime"
        ).execute().get("items", [])

        for ev in g_events:
            start_raw = ev["start"].get("dateTime", ev["start"].get("date"))
            end_raw = ev["end"].get("dateTime", ev["end"].get("date"))
            
            # All-day or datetime
            if "T" in start_raw:
                s_dt = datetime.fromisoformat(start_raw).astimezone(LOCAL_TZ)
                e_dt = datetime.fromisoformat(end_raw).astimezone(LOCAL_TZ)
            else:
                d = date.fromisoformat(start_raw)
                s_dt = datetime.combine(d, datetime.min.time(), tzinfo=LOCAL_TZ)
                e_dt = s_dt + timedelta(days=1)

            unified.append({
                "source": "💼 Artefact (Work)",
                "summary": ev.get("summary", "Work Event"),
                "start": s_dt,
                "end": e_dt,
                "location": ev.get("location", ""),
                "is_all_day": "T" not in start_raw
            })
    except Exception as e:
        print(f"Warning: Could not fetch Google events: {e}", file=sys.stderr)

    # 2. Personal (iCloud)
    try:
        icloud_evs = list_icloud_events(start_dt, end_dt)
        for ev in icloud_evs:
            s_dt = ev["start"]
            e_dt = ev["end"]
            if not isinstance(s_dt, datetime):
                s_dt = datetime.combine(s_dt, datetime.min.time(), tzinfo=LOCAL_TZ)
            if not isinstance(e_dt, datetime):
                e_dt = datetime.combine(e_dt, datetime.min.time(), tzinfo=LOCAL_TZ)

            unified.append({
                "source": f"🍏 Personal ({ev['calendar']})",
                "summary": ev["summary"],
                "start": s_dt,
                "end": e_dt,
                "location": ev.get("location", ""),
                "is_all_day": (e_dt - s_dt) >= timedelta(hours=18)
            })
    except Exception as e:
        print(f"Warning: Could not fetch iCloud events: {e}", file=sys.stderr)

    # 3. Client (Clariane)
    try:
        clariane_evs = fetch_client_events()
        for ev in clariane_evs:
            if ev["start"] >= start_dt and ev["start"] <= end_dt:
                unified.append({
                    "source": "🏥 Clariane (Client)",
                    "summary": ev["summary"],
                    "start": ev["start"],
                    "end": ev["end"],
                    "location": ev.get("location", ""),
                    "is_all_day": (ev["end"] - ev["start"]) >= timedelta(hours=18)
                })
    except Exception as e:
        print(f"Warning: Could not fetch Clariane events: {e}", file=sys.stderr)

    # Sort chronologically
    unified.sort(key=lambda x: x["start"])

    # Intelligent deduplication for shared meetings (e.g. cross-calendar invites)
    deduped = []
    seen = set()
    for ev in unified:
        # Normalize summary for duplicate detection
        clean_name = "".join(c for c in ev["summary"].lower() if c.isalnum())
        s_rounded = ev["start"].strftime("%Y%m%d%H%M")
        key = (s_rounded, clean_name)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(ev)

    return deduped

def get_day_unified_schedule(target_date: date | None = None) -> list[dict]:
    if target_date is None:
        target_date = datetime.now(LOCAL_TZ).date()
    start_dt = datetime(target_date.year, target_date.month, target_date.day, 0, 0, tzinfo=LOCAL_TZ)
    end_dt = start_dt + timedelta(days=1)
    return get_unified_events(start_dt, end_dt)

def find_unified_free_slots(target_date: date | None = None, min_minutes: int = 60, day_start_hour: int = 7, day_end_hour: int = 21) -> list[tuple[datetime, datetime]]:
    """Calculates true open windows where all 3 calendars are completely free."""
    if target_date is None:
        target_date = datetime.now(LOCAL_TZ).date()

    events = get_day_unified_schedule(target_date)

    day_start = datetime(target_date.year, target_date.month, target_date.day, day_start_hour, 0, tzinfo=LOCAL_TZ)
    day_end = datetime(target_date.year, target_date.month, target_date.day, day_end_hour, 0, tzinfo=LOCAL_TZ)

    busy = []
    for ev in events:
        if ev.get("is_all_day"):
            continue
        s = max(day_start, ev["start"])
        e = min(day_end, ev["end"])
        if s < e:
            busy.append((s, e))

    busy.sort(key=lambda x: x[0])
    merged = []
    for s, e in busy:
        if not merged:
            merged.append([s, e])
        else:
            if s <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], e)
            else:
                merged.append([s, e])

    free = []
    curr = day_start
    for s, e in merged:
        if (s - curr) >= timedelta(minutes=min_minutes):
            free.append((curr, s))
        curr = max(curr, e)

    if (day_end - curr) >= timedelta(minutes=min_minutes):
        free.append((curr, day_end))

    return free

if __name__ == "__main__":
    today = datetime.now(LOCAL_TZ).date()
    print("================================================================================")
    print(f"🌐 UNIFIED MULTI-CALENDAR SCHEDULE: {today.strftime('%A, %b %d, %Y')}")
    print("================================================================================")
    
    events = get_day_unified_schedule(today)
    for ev in events:
        if ev.get("is_all_day"):
            print(f"• [ALL DAY] {ev['source']} : {ev['summary']}")
        else:
            s = ev["start"].strftime("%H:%M")
            e = ev["end"].strftime("%H:%M")
            print(f"• {s} - {e} | {ev['source']} : {ev['summary']}")

    print("\n================================================================================")
    print("⚡ TRUE UNIFIED FREE TRAINING WINDOWS (Across Work, Client & Personal)")
    print("================================================================================")
    free_slots = find_unified_free_slots(today, min_minutes=60)
    for s, e in free_slots:
        dur = int((e - s).total_seconds() // 60)
        print(f"⚡ {s.strftime('%H:%M')} - {e.strftime('%H:%M')} ({dur} min open block)")
