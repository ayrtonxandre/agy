"""
Sync ATHX 2027 Training Schedule directly to Google Calendar.
Audits and synchronizes the 9-session microcycle onto the primary Google Calendar.
"""

from __future__ import annotations
import sys
import argparse
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
import google_calendar_api

LOCAL_TZ = ZoneInfo("Europe/Paris")
UNTIL_DATE = "20270527T235959Z"

# Anchored on current week (starting Monday 2026-10-26)
ANCHOR_MONDAY = date(2026, 10, 26)

RUN_SESSIONS = [
    {
        "key": "wed_run_1",
        "day_of_week": "WE",
        "dow_offset": 2,  # Wednesday 2026-10-28
        "start_time": (18, 30),
        "end_time": (19, 15),
        "summary": "🏃 ATHX Run 1: Zone 2 Aerobic Base & Cadence Drill",
        "description": "Distance: 5.0–6.0 km @ 5:40–6:10/km\n• Heart Rate: Strictly Zone 2 (<145 bpm)\n• Cadence Focus: 172–174 spm (metronome cue)\n• Purpose: Flush Tuesday quad stiffness & lower GCT <265 ms.",
        "location": "Road / Track",
        "master_id": None  # New event to create
    },
    {
        "key": "fri_run_2",
        "day_of_week": "FR",
        "dow_offset": 4,  # Friday 2026-10-30
        "start_time": (18, 30),
        "end_time": (19, 20),
        "summary": "🏃 ATHX Run 2: 5km Qualifying Threshold Intervals",
        "description": "Warm-up: 1.0 km easy jog\nMain Work: 4–5 × 1,000m @ 4:25–4:35/km (90s rest)\nCool-down: 1.0 km jog (~6.5 km total)\nPurpose: Bridge 37s/km gap to 4:30/km standard.",
        "location": "Track / Flat Course",
        "master_id": None  # New event to create
    },
    {
        "key": "sun_run_3",
        "day_of_week": "SU",
        "dow_offset": 6,  # Sunday 2026-11-01
        "start_time": (9, 30),
        "end_time": (10, 15),
        "summary": "🏃 ATHX Run 3: Lighter Zone 2 5K (Active Recovery)",
        "description": "Distance: Exactly 5.0 km easy continuous run @ 5:50–6:20/km\n• Heart Rate: Strictly Zone 2 (<140 bpm, conversational)\n• Purpose: Active recovery flush, bringing weekly mileage to ~17 km\n• Follow with 20 min hip/ankle mobility.",
        "location": "Park / Easy Trail",
        "master_id": "tqd3a0td1dv5vi13vck5rsepkk"  # Existing event to update
    }
]

GYM_SESSIONS = [
    {
        "key": "tue_gym_a",
        "day_of_week": "TU",
        "dow_offset": 1,  # Tuesday
        "start_time": (6, 30),
        "end_time": (7, 30),
        "summary": "🏋️ ATHX 2027: Gym Session A (Squats & S2O Overhead Power)",
        "description": "🎯 ATHX 2027: Gym Session A (Squats & S2O Overhead Power)\nRationale: Quads at 4.5 sets/wk vs MEV 8.0. Target +1.25 kg/wk progression to eliminate the -38.7 kg squat deficit.\n\n⚡ Warm-up (5–8 min):\n• Dynamic hip mobility, ankle dorsiflexion, and bodyweight squats\n\n🏋️ Working Sets & Target Weights:\n1. Barbell Back Squat: 4 × 6 @ 77.5–82.5 kg (75–80% e1RM)\n2. Bulgarian Split Squat: 3 × 8 / leg @ 2 × 18–22 kg DBs\n3. Shoulder-to-Overhead (Push Press): 4 × 5 @ 45–50 kg (dip-drive & explosive lockout)\n4. Leg Extension: 3 × 12–15 @ RPE 8.5–9 (strict quad hypertrophy)\n5. Hanging Leg Raises / Ab Wheel: 3 × 12–15\n\n⏱️ Rest: 2–3 min on Back Squat & Push Press; 60–90s on accessories.",
        "location": "Gym",
        "master_id": "62qd0ee1tmr4q1j7mtv6brn0bk"
    },
    {
        "key": "thu_gym_b",
        "day_of_week": "TH",
        "dow_offset": 3,  # Thursday
        "start_time": (6, 30),
        "end_time": (7, 30),
        "summary": "🏋️ ATHX 2027: Gym Session B (Deadlift Floor Pull & Upper Maintenance)",
        "description": "🎯 ATHX 2027: Gym Session B (Deadlift Floor Pull & Upper Maintenance)\nRationale: Closes deadlift gap (-28 kg) & maintains 104 kg bench press without junk fatigue.\n\n⚡ Warm-up (5–8 min):\n• Thoracic mobility, band pull-aparts, light hinge warm-up\n\n🏋️ Working Sets & Target Weights:\n1. Conventional / Trap Bar Deadlift: 4 × 5 @ 75–80% e1RM (115–125 kg)\n2. Barbell Bench Press: 3 × 6–8 @ 75–80 kg (preserve 104 kg e1RM)\n3. Romanian Deadlift (RDL): 3 × 8–10 @ 80–90 kg\n4. Weighted Pull-ups: 3 × 6–8 (+10 to +15 kg)\n5. Heavy Sandbag / Farmer Carries: 3 × 40 m (50 kg bag / KBs)\n\n⏱️ Rest: 2–3 min on Deadlifts & Bench; 60–90s on accessories.",
        "location": "Gym",
        "master_id": "1iris9llq3bqjgr7o7b65bdrs8"
    }
]

OTHER_SESSIONS = [
    {
        "key": "sat_crossfit",
        "day_of_week": "SA",
        "dow_offset": 5,  # Saturday 2026-10-31
        "start_time": (10, 0),
        "end_time": (11, 15),
        "summary": "🏋️‍♂️ CrossFit (Session 4 - Team / Engine WOD)",
        "description": "Saturday Box WOD\n• Partner / Team / Long Aerobic Metcon\n• Lactate threshold and mental durability.",
        "location": "CrossFit Box",
        "master_id": "r5eh4321u0cliesjctmk4q80hk"  # Update from 16:15 to 10:00
    }
]

def audit():
    service = google_calendar_api.get_calendar_service()
    events = []
    page_token = None
    while True:
        res = service.events().list(calendarId="primary", q="ATHX", pageToken=page_token).execute()
        events.extend(res.get("items", []))
        page_token = res.get("nextPageToken")
        if not page_token:
            break
    
    active_masters = {ev["id"]: ev for ev in events if ev.get("recurrence")}
    print(f"Audit Result: Found {len(active_masters)} recurring series.")
    
    # Check gym
    tue_gym = active_masters.get("62qd0ee1tmr4q1j7mtv6brn0bk")
    thu_gym = active_masters.get("1iris9llq3bqjgr7o7b65bdrs8")
    print(f"  • Tuesday Gym A:   {'PRESENT' if tue_gym else '❌ MISSING'}")
    print(f"  • Thursday Gym B:  {'PRESENT' if thu_gym else '❌ MISSING'}")
    # Check runs
    wed_run = any("Run 1" in ev.get("summary", "") for ev in active_masters.values())
    fri_run = any("Run 2" in ev.get("summary", "") for ev in active_masters.values())
    sun_run = active_masters.get("tqd3a0td1dv5vi13vck5rsepkk")
    sat_cf = active_masters.get("r5eh4321u0cliesjctmk4q80hk")
    
    print(f"  • Wednesday Run 1: {'PRESENT' if wed_run else '❌ MISSING'}")
    print(f"  • Friday Run 2:    {'PRESENT' if fri_run else '❌ MISSING'}")
    print(f"  • Sunday Run 3:    {'PRESENT (old title/duration)' if sun_run else '❌ MISSING'}")
    if sat_cf:
        start_time_str = sat_cf["start"].get("dateTime", "")
        print(f"  • Saturday CrossFit: PRESENT at {start_time_str[-14:-6]} (Should be 10:00 AM)")

def sync_runs(apply: bool = False):
    service = google_calendar_api.get_calendar_service()
    print(f"Syncing Run Sessions (Apply mode: {apply})...")
    
    for session in RUN_SESSIONS:
        ev_date = ANCHOR_MONDAY + timedelta(days=session["dow_offset"])
        s_dt = datetime(ev_date.year, ev_date.month, ev_date.day, session["start_time"][0], session["start_time"][1], tzinfo=LOCAL_TZ)
        e_dt = datetime(ev_date.year, ev_date.month, ev_date.day, session["end_time"][0], session["end_time"][1], tzinfo=LOCAL_TZ)
        rrule = f"RRULE:FREQ=WEEKLY;UNTIL={UNTIL_DATE};BYDAY={session['day_of_week']}"
        
        body = {
            "summary": session["summary"],
            "description": session["description"],
            "location": session["location"],
            "start": {"dateTime": s_dt.isoformat(), "timeZone": "Europe/Paris"},
            "end": {"dateTime": e_dt.isoformat(), "timeZone": "Europe/Paris"},
            "recurrence": [rrule]
        }
        
        if session["master_id"]:
            # Update existing event
            print(f"  -> UPDATE {session['summary']} (ID: {session['master_id']})")
            if apply:
                res = service.events().patch(calendarId="primary", eventId=session["master_id"], body=body).execute()
                print(f"     ✅ Updated: {res.get('htmlLink')}")
        else:
            # Check if an event with this summary already exists
            existing = service.events().list(calendarId="primary", q=session["summary"], maxResults=5).execute().get("items", [])
            already_exists = [e for e in existing if e.get("summary") == session["summary"] and e.get("recurrence")]
            if already_exists:
                print(f"  -> ALREADY EXISTS: {session['summary']} (ID: {already_exists[0]['id']})")
            else:
                print(f"  -> INSERT {session['summary']} starting {s_dt.isoformat()}")
                if apply:
                    res = service.events().insert(calendarId="primary", body=body).execute()
                    print(f"     ✅ Created ID: {res.get('id')} ({res.get('htmlLink')})")

def sync_gym(apply: bool = False):
    service = google_calendar_api.get_calendar_service()
    print(f"Syncing Gym Sessions (Apply mode: {apply})...")
    for session in GYM_SESSIONS:
        ev_date = ANCHOR_MONDAY + timedelta(days=session["dow_offset"])
        s_dt = datetime(ev_date.year, ev_date.month, ev_date.day, session["start_time"][0], session["start_time"][1], tzinfo=LOCAL_TZ)
        e_dt = datetime(ev_date.year, ev_date.month, ev_date.day, session["end_time"][0], session["end_time"][1], tzinfo=LOCAL_TZ)
        rrule = f"RRULE:FREQ=WEEKLY;UNTIL={UNTIL_DATE};BYDAY={session['day_of_week']}"
        body = {
            "summary": session["summary"],
            "description": session["description"],
            "location": session["location"],
            "start": {"dateTime": s_dt.isoformat(), "timeZone": "Europe/Paris"},
            "end": {"dateTime": e_dt.isoformat(), "timeZone": "Europe/Paris"},
            "recurrence": [rrule]
        }
        if session["master_id"]:
            print(f"  -> UPDATE {session['summary']} (ID: {session['master_id']})")
            if apply:
                res = service.events().patch(calendarId="primary", eventId=session["master_id"], body=body).execute()
                print(f"     ✅ Updated: {res.get('htmlLink')}")

def sync_saturday(apply: bool = False):
    service = google_calendar_api.get_calendar_service()
    print(f"Syncing Saturday CrossFit (Apply mode: {apply})...")
    for session in OTHER_SESSIONS:
        ev_date = ANCHOR_MONDAY + timedelta(days=session["dow_offset"])
        s_dt = datetime(ev_date.year, ev_date.month, ev_date.day, session["start_time"][0], session["start_time"][1], tzinfo=LOCAL_TZ)
        e_dt = datetime(ev_date.year, ev_date.month, ev_date.day, session["end_time"][0], session["end_time"][1], tzinfo=LOCAL_TZ)
        rrule = f"RRULE:FREQ=WEEKLY;UNTIL={UNTIL_DATE};BYDAY={session['day_of_week']}"
        body = {
            "summary": session["summary"],
            "description": session["description"],
            "location": session["location"],
            "start": {"dateTime": s_dt.isoformat(), "timeZone": "Europe/Paris"},
            "end": {"dateTime": e_dt.isoformat(), "timeZone": "Europe/Paris"},
            "recurrence": [rrule]
        }
        if session["master_id"]:
            print(f"  -> UPDATE {session['summary']} to 10:00–11:15 (ID: {session['master_id']})")
            if apply:
                res = service.events().patch(calendarId="primary", eventId=session["master_id"], body=body).execute()
                print(f"     ✅ Updated: {res.get('htmlLink')}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", action="store_true", help="Audit calendar")
    parser.add_argument("--sync-runs", action="store_true", help="Sync only the 3 run sessions")
    parser.add_argument("--sync-gym", action="store_true", help="Sync Gym Sessions A & B")
    parser.add_argument("--sync-all", action="store_true", help="Sync gym, runs and Saturday morning CrossFit")
    parser.add_argument("--apply", action="store_true", help="Apply changes to Google Calendar (default is dry-run)")
    args = parser.parse_args()
    
    if args.sync_gym:
        sync_gym(apply=args.apply)
    elif args.sync_runs:
        sync_runs(apply=args.apply)
    elif args.sync_all:
        sync_gym(apply=args.apply)
        sync_runs(apply=args.apply)
        sync_saturday(apply=args.apply)
    else:
        audit()
