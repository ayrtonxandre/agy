from __future__ import annotations
import os
import sys
import re
from datetime import datetime, date, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from google_calendar_api import list_upcoming_events, get_calendar_service
from icloud_calendar import list_icloud_events
from client_calendar import fetch_client_events

LOCAL_TZ = ZoneInfo("Europe/Paris")
BASE_DIR = Path(__file__).resolve().parent
CAL_DATA_DIR = BASE_DIR / "calendar_data"

def parse_cached_ics_events(ics_file_path: Path, start_dt: datetime, end_dt: datetime, source_label: str = "💼 Artefact (Work)") -> list[dict]:
    """Lightweight pure-python RFC 5545 iCalendar parser for offline fallback."""
    events = []
    if not ics_file_path.exists():
        return events

    try:
        content = ics_file_path.read_text(encoding="utf-8", errors="ignore")
        # Split into VEVENT blocks
        raw_events = re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", content, re.DOTALL)
        for raw in raw_events:
            # Parse Summary
            sum_m = re.search(r"SUMMARY:(.*)", raw)
            summary = sum_m.group(1).strip().replace("\\,", ",") if sum_m else "Event"

            # Parse Start
            dtstart_m = re.search(r"DTSTART(?:;[^:]+)?:([0-9TZ]+)", raw)
            dtend_m = re.search(r"DTEND(?:;[^:]+)?:([0-9TZ]+)", raw)
            if not dtstart_m:
                continue

            dtstart_str = dtstart_m.group(1)
            dtend_str = dtend_m.group(1) if dtend_m else dtstart_str

            is_all_day = len(dtstart_str) == 8  # YYYYMMDD
            try:
                if is_all_day:
                    d_start = datetime.strptime(dtstart_str, "%Y%m%d").date()
                    s_dt = datetime.combine(d_start, datetime.min.time(), tzinfo=LOCAL_TZ)
                    if dtend_str and len(dtend_str) == 8:
                        d_end = datetime.strptime(dtend_str, "%Y%m%d").date()
                        e_dt = datetime.combine(d_end, datetime.min.time(), tzinfo=LOCAL_TZ)
                    else:
                        e_dt = s_dt + timedelta(days=1)
                else:
                    if "T" in dtstart_str:
                        clean_start = dtstart_str.replace("Z", "")
                        clean_end = dtend_str.replace("Z", "") if dtend_str else clean_start
                        s_dt = datetime.strptime(clean_start[:15], "%Y%m%dT%H%M%S").replace(tzinfo=LOCAL_TZ)
                        e_dt = datetime.strptime(clean_end[:15], "%Y%m%dT%H%M%S").replace(tzinfo=LOCAL_TZ)
                    else:
                        continue
            except Exception:
                continue

            # Check time range
            if s_dt < end_dt and e_dt > start_dt:
                events.append({
                    "source": source_label,
                    "summary": summary,
                    "start": s_dt,
                    "end": e_dt,
                    "location": "",
                    "is_all_day": is_all_day
                })
    except Exception as e:
        print(f"Warning: Could not parse cached ics {ics_file_path}: {e}", file=sys.stderr)

    return events

def get_unified_events(start_dt: datetime, end_dt: datetime) -> list[dict]:
    """Aggregates and deduplicates events across Artefact (Google), Personal (iCloud / Ma vie), Client (Clariane), and ATHX Training."""
    unified = []

    # 1. Google Calendar API (Multi-calendar: Primary Artefact, Ma vie Personal, Calendrier Client)
    google_fetched = False
    try:
        service = get_calendar_service()
        
        # Calendar ID mapping
        cal_sources = [
            ("primary", "💼 Artefact (Work)"),
            ("1p64vtkrnbvcc8b617hltje9h748d6se@import.calendar.google.com", "🍏 Personal (Ma vie)"),
            ("qgb89hlt9v6l7m9o8tujl2bok6a9dgf3@import.calendar.google.com", "🏥 Clariane (Client)"),
        ]

        for cid, default_source in cal_sources:
            try:
                g_events = service.events().list(
                    calendarId=cid,
                    timeMin=start_dt.isoformat(),
                    timeMax=end_dt.isoformat(),
                    singleEvents=True,
                    orderBy="startTime"
                ).execute().get("items", [])

                for ev in g_events:
                    start_raw = ev["start"].get("dateTime", ev["start"].get("date"))
                    end_raw = ev["end"].get("dateTime", ev["end"].get("date"))
                    
                    if "T" in start_raw:
                        s_dt = datetime.fromisoformat(start_raw).astimezone(LOCAL_TZ)
                        e_dt = datetime.fromisoformat(end_raw).astimezone(LOCAL_TZ)
                    else:
                        d = date.fromisoformat(start_raw)
                        s_dt = datetime.combine(d, datetime.min.time(), tzinfo=LOCAL_TZ)
                        e_dt = s_dt + timedelta(days=1)

                    summary = ev.get("summary", "Work Event")
                    # If Tuesday gym has empty summary but emoji
                    if summary.strip() == "🏋️":
                        summary = "🏋️ ATHX 2027: Gym Session A (Squat, S2O & Power)"

                    # Classify ATHX training events
                    src = default_source
                    if any(prefix in summary for prefix in ["⚡ ATHX", "🏋️ ATHX", "🏃 ATHX"]) or summary.strip().startswith("🏋️"):
                        src = "⚡ ATHX (Training)"

                    unified.append({
                        "source": src,
                        "summary": summary,
                        "start": s_dt,
                        "end": e_dt,
                        "location": ev.get("location", ""),
                        "description": ev.get("description", ""),
                        "is_all_day": "T" not in start_raw
                    })
                if g_events:
                    google_fetched = True
            except Exception as e_cal:
                print(f"Notice: Google calendar '{default_source}' fetch failed: {e_cal}", file=sys.stderr)

    except Exception as e:
        print(f"Notice: Google API unavailable ({e}), using cached Artefact calendar.", file=sys.stderr)

    # Fallback to cached Artefact .ics if Google API returned nothing or threw
    if not google_fetched:
        # Check json cache first
        json_cache = CAL_DATA_DIR / "cached_unified_events.json"
        if json_cache.exists():
            try:
                import json
                with open(json_cache, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                for item in cached_data:
                    s_dt = datetime.fromisoformat(item["start"])
                    e_dt = datetime.fromisoformat(item["end"])
                    if s_dt < end_dt and e_dt > start_dt:
                        unified.append({
                            "source": item["source"],
                            "summary": item["summary"],
                            "start": s_dt,
                            "end": e_dt,
                            "location": item.get("location", ""),
                            "description": item.get("description", ""),
                            "is_all_day": item.get("is_all_day", False)
                        })
            except Exception as e_cache:
                print(f"Warning: Could not read json cache: {e_cache}", file=sys.stderr)

        if not unified:
            cached_ics = CAL_DATA_DIR / "[ARTEFACT]_ayrton.andre@artefact.com.ics"
            if cached_ics.exists():
                ics_evs = parse_cached_ics_events(cached_ics, start_dt, end_dt, "💼 Artefact (Work)")
                unified.extend(ics_evs)

    # 2. Personal (Direct iCloud via caldav if config exists)
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
                "source": f"🍏 Personal ({ev.get('calendar', 'iCloud')})",
                "summary": ev["summary"],
                "start": s_dt,
                "end": e_dt,
                "location": ev.get("location", ""),
                "description": ev.get("description", ""),
                "is_all_day": (e_dt - s_dt) >= timedelta(hours=18)
            })
    except Exception:
        pass

    # 3. Client (Direct Clariane Outlook ICS feed)
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
                    "description": ev.get("description", ""),
                    "is_all_day": (ev["end"] - ev["start"]) >= timedelta(hours=18)
                })
    except Exception:
        pass

    # 4. ATHX Training Schedule Fallback (only if not already loaded from Google Calendar)
    has_live_athx = any("⚡ ATHX" in ev["summary"] or "🏃 ATHX" in ev["summary"] or "🏋️ ATHX" in ev["summary"] for ev in unified)
    if not has_live_athx:
        try:
            cur_day = start_dt.date()
            end_day = end_dt.date()
            while cur_day <= end_day:
                dow = cur_day.weekday()  # 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
                day_sessions = []
                if dow == 0:  # Monday
                    day_sessions.append(("06:30", "07:30", "🏋️‍♂️ CrossFit (Session 1)", "CrossFit Box WOD · Conditioning & Gymnastics", "CrossFit Box"))
                elif dow == 1:  # Tuesday
                    day_sessions.append(("06:30", "07:25", "🦵 ATHX Gym A: Squats & S2O Overhead Power", "Barbell Back Squat 4×6 (77.5–82.5kg) + Bulgarian Split Squat 3×8 + Push Press 4×5 + Leg Ext 3×15", "Gym / Strength Facility"))
                elif dow == 2:  # Wednesday
                    day_sessions.append(("06:30", "07:30", "🏋️‍♂️ CrossFit (Session 2)", "CrossFit Box WOD programming", "CrossFit Box"))
                    day_sessions.append(("18:30", "19:15", "🏃 ATHX Run 1: Zone 2 Aerobic Base & Cadence Drill", "Distance: 5.0–6.0 km @ 5:40–6:10/km (HR <145 bpm) · 172-174 spm cadence cue", "Road / Track"))
                elif dow == 3:  # Thursday
                    day_sessions.append(("06:30", "07:25", "🏋️ ATHX Gym B: Deadlift Floor Pull & Upper Maintenance", "Deadlift 4×5 (115–125kg) + Bench Press 3×6–8 + RDL 3×8–10 + Weighted Pull-ups 3×6–8 + Carries", "Gym / Strength Facility"))
                elif dow == 4:  # Friday
                    day_sessions.append(("06:30", "07:30", "🏋️‍♂️ CrossFit (Session 3)", "CrossFit Box WOD programming", "CrossFit Box"))
                    day_sessions.append(("18:30", "19:20", "🏃 ATHX Run 2: 5km Qualifying Threshold Intervals", "Warm-up + 4–5×1,000m @ 4:25–4:35/km (90s rest) + Cool-down (~6.5 km total)", "Track / Flat Course"))
                elif dow == 5:  # Saturday
                    day_sessions.append(("16:15", "17:45", "🏋️ ATHX 2027: CrossFit Big WOD", "Saturday Box WOD · High Volume Metcon Engine", "CrossFit Box"))
                elif dow == 6:  # Sunday
                    day_sessions.append(("09:30", "10:15", "🏃 ATHX Run 3: Lighter Zone 2 5K (Active Recovery)", "Distance: Exactly 5.0 km easy conversational run @ 5:50–6:20/km (HR <140 bpm)", "Park / Easy Trail"))

                for start_s, end_s, summary, desc, loc in day_sessions:
                    s_h, s_m = map(int, start_s.split(":"))
                    e_h, e_m = map(int, end_s.split(":"))
                    s_dt = datetime(cur_day.year, cur_day.month, cur_day.day, s_h, s_m, tzinfo=LOCAL_TZ)
                    e_dt = datetime(cur_day.year, cur_day.month, cur_day.day, e_h, e_m, tzinfo=LOCAL_TZ)
                    unified.append({
                        "source": "⚡ ATHX (Training)",
                        "summary": summary,
                        "description": desc,
                        "start": s_dt,
                        "end": e_dt,
                        "location": loc,
                        "is_all_day": False
                    })
                cur_day += timedelta(days=1)
        except Exception as e:
            print(f"Warning: Could not project ATHX training schedule: {e}", file=sys.stderr)

    # Sort chronologically
    unified.sort(key=lambda x: x["start"])

    # Intelligent deduplication for shared meetings
    deduped = []
    seen = set()
    for ev in unified:
        clean_name = "".join(c for c in ev["summary"].lower() if c.isalnum())
        s_rounded = ev["start"].strftime("%Y%m%d%H%M")
        key = (s_rounded, clean_name)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(ev)

    # Cache fresh events to json for offline resilience
    if google_fetched:
        try:
            import json
            cache_payload = [
                {
                    "source": ev["source"],
                    "summary": ev["summary"],
                    "start": ev["start"].isoformat(),
                    "end": ev["end"].isoformat(),
                    "location": ev.get("location", ""),
                    "description": ev.get("description", ""),
                    "is_all_day": ev.get("is_all_day", False)
                }
                for ev in deduped
            ]
            json_cache = CAL_DATA_DIR / "cached_unified_events.json"
            with open(json_cache, "w", encoding="utf-8") as f:
                json.dump(cache_payload, f, ensure_ascii=False, indent=2)
        except Exception as e_save:
            print(f"Notice: Could not write json cache: {e_save}", file=sys.stderr)

    return deduped

def detect_training_clashes(events: list[dict]) -> list[dict]:
    """Audits potential collisions between ATHX training sessions and incoming meetings."""
    training_evs = [ev for ev in events if "ATHX" in ev.get("source", "") and not ev.get("is_all_day")]
    other_evs = [ev for ev in events if "ATHX" not in ev.get("source", "") and not ev.get("is_all_day")]

    clashes = []
    for t_ev in training_evs:
        t_start, t_end = t_ev["start"], t_ev["end"]
        for o_ev in other_evs:
            o_start, o_end = o_ev["start"], o_ev["end"]
            if max(t_start, o_start) < min(t_end, o_end):
                overlap_min = int((min(t_end, o_end) - max(t_start, o_start)).total_seconds() // 60)
                clashes.append({
                    "training_summary": t_ev["summary"],
                    "training_time": f"{t_start.strftime('%H:%M')} - {t_end.strftime('%H:%M')}",
                    "training_date": t_start.strftime("%Y-%m-%d"),
                    "conflicting_event": o_ev["summary"],
                    "conflicting_source": o_ev["source"],
                    "conflicting_time": f"{o_start.strftime('%H:%M')} - {o_end.strftime('%H:%M')}",
                    "overlap_min": overlap_min,
                    "resolution": "Protéger la séance ATHX : décaler l'appel ou reprogrammer sur un créneau libre."
                })
    return clashes

def calculate_deep_work_blocks(events: list[dict], target_date: date | None = None, min_minutes: int = 90) -> dict:
    """Calculates uninterrupted deep work focus blocks (≥90 min) during business hours."""
    if target_date is None:
        target_date = datetime.now(LOCAL_TZ).date()

    work_start = datetime(target_date.year, target_date.month, target_date.day, 8, 30, tzinfo=LOCAL_TZ)
    work_end = datetime(target_date.year, target_date.month, target_date.day, 18, 30, tzinfo=LOCAL_TZ)

    day_meetings = []
    for ev in events:
        if ev.get("is_all_day") or "ATHX" in ev.get("source", ""):
            continue
        s = max(work_start, ev["start"])
        e = min(work_end, ev["end"])
        if s < e:
            day_meetings.append((s, e, ev["summary"]))

    day_meetings.sort(key=lambda x: x[0])

    busy = []
    for s, e, _ in day_meetings:
        if not busy:
            busy.append([s, e])
        else:
            if s <= busy[-1][1]:
                busy[-1][1] = max(busy[-1][1], e)
            else:
                busy.append([s, e])

    deep_work_blocks = []
    curr = work_start
    for s, e in busy:
        diff_min = int((s - curr).total_seconds() // 60)
        if diff_min >= min_minutes:
            deep_work_blocks.append({
                "start": curr.strftime("%H:%M"),
                "end": s.strftime("%H:%M"),
                "duration_min": diff_min,
                "type": "🚀 Prime Deep Work Window" if diff_min >= 120 else "⚡ High-Focus Sprint"
            })
        curr = max(curr, e)

    diff_min = int((work_end - curr).total_seconds() // 60)
    if diff_min >= min_minutes:
        deep_work_blocks.append({
            "start": curr.strftime("%H:%M"),
            "end": work_end.strftime("%H:%M"),
            "duration_min": diff_min,
            "type": "🚀 Prime Deep Work Window" if diff_min >= 120 else "⚡ High-Focus Sprint"
        })

    total_deep_min = sum(b["duration_min"] for b in deep_work_blocks)
    focus_quotient = round((total_deep_min / (10 * 60)) * 100, 1)

    return {
        "date": target_date.strftime("%Y-%m-%d"),
        "blocks": deep_work_blocks,
        "total_deep_work_minutes": total_deep_min,
        "focus_quotient_percent": focus_quotient
    }

def get_day_unified_schedule(target_date: date | None = None) -> list[dict]:
    if target_date is None:
        target_date = datetime.now(LOCAL_TZ).date()
    start_dt = datetime(target_date.year, target_date.month, target_date.day, 0, 0, tzinfo=LOCAL_TZ)
    end_dt = start_dt + timedelta(days=1)
    return get_unified_events(start_dt, end_dt)

def find_unified_free_slots(target_date: date | None = None, min_minutes: int = 60, day_start_hour: int = 7, day_end_hour: int = 21, preloaded_events: list[dict] | None = None) -> list[tuple[datetime, datetime]]:
    """Calculates true open windows where all calendars are completely free."""
    if target_date is None:
        target_date = datetime.now(LOCAL_TZ).date()

    if preloaded_events is not None:
        events = [ev for ev in preloaded_events if ev["start"].date() <= target_date <= ev["end"].date()]
    else:
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

    clashes = detect_training_clashes(events)
    print(f"\n🛡️ Routine Armor Clashes Detected: {len(clashes)}")
    for c in clashes:
        print(f"  ⚠️ {c['training_summary']} clashes with {c['conflicting_event']} ({c['overlap_min']} min)")

    deep = calculate_deep_work_blocks(events, today)
    print(f"\n🚀 Deep Work Focus Quotient: {deep['focus_quotient_percent']}% ({deep['total_deep_work_minutes']} min)")
    for b in deep["blocks"]:
        print(f"  • {b['start']} - {b['end']} ({b['duration_min']} min) : {b['type']}")
