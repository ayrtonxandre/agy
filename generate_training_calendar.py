"""
Generates the official ATHX 2027 Hybrid Training Schedule iCalendar (.ics).
Schedules recurring sessions across the 31-week runway to ATHX Games 2027:
- Mon: CrossFit (06:30)
- Tue: Gym Session A - Squats & S2O Power (06:30)
- Wed: CrossFit (06:30) + Run 1 - Zone 2 Base & Cadence (18:30)
- Thu: Gym Session B - Deadlift & Upper Body (06:30)
- Fri: CrossFit (06:30) + Run 2 - 5k Threshold Intervals (18:30)
- Sat: CrossFit - Team/Long WOD (10:00)
- Sun: Run 3 - Lighter Zone 2 5K Recovery (09:30)
"""

from datetime import datetime, date, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CAL_DATA_DIR = BASE_DIR / "calendar_data"
CAL_DATA_DIR.mkdir(exist_ok=True)

def generate_ics():
    now_utc = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    
    # Anchor to the current week starting Monday 2026-10-19 so this week and upcoming weeks are active
    start_monday = date(2026, 10, 19)
    
    # Template header
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ATHX 2027//Athlete Headquarters//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:ATHX 2027 Training Schedule",
        "X-WR-TIMEZONE:Europe/Paris",
        "X-WR-CALDESC:ATHX 2027 Microcycle (4x CrossFit • 2x Gym • 3x Run)",
    ]

    events = [
        # Monday
        {
            "dow_offset": 0,
            "start_time": (6, 30),
            "end_time": (7, 30),
            "summary": "🏋️‍♂️ CrossFit (Session 1)",
            "description": "CrossFit Box WOD\\n• Focus: Metabolic conditioning, gymnastics & work capacity\\n• Directive: Protect systemic fatigue for Tuesday heavy squats.",
            "location": "CrossFit Box",
            "uid": "athx-mon-crossfit-2026",
            "byday": "MO"
        },
        # Tuesday
        {
            "dow_offset": 1,
            "start_time": (6, 30),
            "end_time": (7, 25),
            "summary": "🦵 ATHX Gym A: Squats & S2O Overhead Power",
            "description": "1. Barbell Back Squat: 4×6 @ 75–80% e1RM (77.5–82.5 kg)\\n2. Bulgarian Split Squat: 3×8–10 / leg (2×18–22 kg DBs)\\n3. Shoulder-to-Overhead (Push Press): 4×5 @ 45–50 kg\\n4. Leg Extensions: 3×12–15 (strict quad hypertrophy)\\n5. Hanging Leg Raises / Ab Wheel: 3×12–15",
            "location": "Gym / Strength Facility",
            "uid": "athx-tue-squat-s2o-2026",
            "byday": "TU"
        },
        # Wednesday CrossFit
        {
            "dow_offset": 2,
            "start_time": (6, 30),
            "end_time": (7, 30),
            "summary": "🏋️‍♂️ CrossFit (Session 2)",
            "description": "CrossFit Box WOD\\n• Focus: Work capacity and functional fitness.",
            "location": "CrossFit Box",
            "uid": "athx-wed-crossfit-2026",
            "byday": "WE"
        },
        # Wednesday Run
        {
            "dow_offset": 2,
            "start_time": (18, 30),
            "end_time": (19, 15),
            "summary": "🏃 ATHX Run 1: Zone 2 Aerobic Base & Cadence Drill",
            "description": "Distance: 5.0–6.0 km @ 5:40–6:10/km\\n• Heart Rate: Strictly Zone 2 (<145 bpm)\\n• Cadence Focus: 172–174 spm (metronome cue)\\n• Purpose: Flush Tuesday quad stiffness & lower GCT <265 ms.",
            "location": "Road / Track",
            "uid": "athx-wed-run1-z2-2026",
            "byday": "WE"
        },
        # Thursday
        {
            "dow_offset": 3,
            "start_time": (6, 30),
            "end_time": (7, 25),
            "summary": "🏋️ ATHX Gym B: Deadlift Floor Pull & Upper Maintenance",
            "description": "1. Conventional / Trap Bar Deadlift: 4×5 @ 75–80% e1RM (115–125 kg)\\n2. Barbell Bench Press: 3×6–8 @ 75–80 kg (preserve 104 kg e1RM)\\n3. Romanian Deadlifts (RDLs): 3×8–10 @ 80–90 kg\\n4. Weighted Pull-ups: 3×6–8 (+10 to +15 kg)\\n5. Heavy Sandbag / Farmer Carries: 3×40 m",
            "location": "Gym / Strength Facility",
            "uid": "athx-thu-deadlift-upper-2026",
            "byday": "TH"
        },
        # Friday CrossFit
        {
            "dow_offset": 4,
            "start_time": (6, 30),
            "end_time": (7, 30),
            "summary": "🏋️‍♂️ CrossFit (Session 3)",
            "description": "CrossFit Box WOD\\n• Focus: High-intensity conditioning and gymnastics.",
            "location": "CrossFit Box",
            "uid": "athx-fri-crossfit-2026",
            "byday": "FR"
        },
        # Friday Run
        {
            "dow_offset": 4,
            "start_time": (18, 30),
            "end_time": (19, 20),
            "summary": "🏃 ATHX Run 2: 5km Qualifying Threshold Intervals",
            "description": "Warm-up: 1.0 km easy jog\\nMain Work: 4–5 × 1,000m @ 4:25–4:35/km (90s rest)\\nCool-down: 1.0 km jog (~6.5 km total)\\nPurpose: Bridge 37s/km gap to 4:30/km standard.",
            "location": "Track / Flat Course",
            "uid": "athx-fri-run2-intervals-2026",
            "byday": "FR"
        },
        # Saturday CrossFit
        {
            "dow_offset": 5,
            "start_time": (10, 0),
            "end_time": (11, 15),
            "summary": "🏋️‍♂️ CrossFit (Session 4 - Team / Engine WOD)",
            "description": "Saturday Box WOD\\n• Partner / Team / Long Aerobic Metcon\\n• Lactate threshold and mental durability.",
            "location": "CrossFit Box",
            "uid": "athx-sat-crossfit-2026",
            "byday": "SA"
        },
        # Sunday Run
        {
            "dow_offset": 6,
            "start_time": (9, 30),
            "end_time": (10, 15),
            "summary": "🏃 ATHX Run 3: Lighter Zone 2 5K (Active Recovery)",
            "description": "Distance: Exactly 5.0 km easy continuous run @ 5:50–6:20/km\\n• Heart Rate: Strictly Zone 2 (<140 bpm, conversational)\\n• Purpose: Active recovery flush, bringing weekly mileage to ~17 km\\n• Follow with 20 min hip/ankle mobility.",
            "location": "Park / Easy Trail",
            "uid": "athx-sun-run3-z2-recovery-2026",
            "byday": "SU"
        }
    ]

    until_str = "20270527T235959Z"

    for ev in events:
        ev_date = start_monday + timedelta(days=ev["dow_offset"])
        dtstart = f"{ev_date.strftime('%Y%m%d')}T{ev['start_time'][0]:02d}{ev['start_time'][1]:02d}00"
        dtend = f"{ev_date.strftime('%Y%m%d')}T{ev['end_time'][0]:02d}{ev['end_time'][1]:02d}00"

        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{ev['uid']}@athx2027.internal",
            f"DTSTAMP:{now_utc}",
            f"DTSTART;TZID=Europe/Paris:{dtstart}",
            f"DTEND;TZID=Europe/Paris:{dtend}",
            f"RRULE:FREQ=WEEKLY;UNTIL={until_str};BYDAY={ev['byday']}",
            f"SUMMARY:{ev['summary']}",
            f"DESCRIPTION:{ev['description']}",
            f"LOCATION:{ev['location']}",
            "STATUS:CONFIRMED",
            "TRANSP:OPAQUE",
            "END:VEVENT"
        ])

    lines.append("END:VCALENDAR")
    ics_str = "\r\n".join(lines) + "\r\n"

    # Write both to calendar_data and repository root
    p1 = CAL_DATA_DIR / "athx_training_schedule.ics"
    p2 = BASE_DIR / "athx_training_schedule.ics"
    p1.write_text(ics_str, encoding="utf-8")
    p2.write_text(ics_str, encoding="utf-8")
    print(f"✅ Generated ATHX Training Schedule iCal at:\n   • {p1}\n   • {p2}")

if __name__ == "__main__":
    generate_ics()
