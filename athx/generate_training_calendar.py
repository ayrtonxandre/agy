"""
Generates the official ATHX 2027 Hybrid Training Schedule iCalendar (.ics).
Schedules recurring sessions across the runway to ATHX Games 2027 (May 27, 2027):
- Past Series: Oct 19, 2026 to Nov 08, 2026 (Standard Recurring)
- Special Week (Nov 09 to Nov 15, 2026): CHAD 1000X Adapted Microcycle (Safe ACWR & Knee Protection)
- Future Series: Nov 16, 2026 to May 27, 2027 (Standard Recurring resumes)
"""

from datetime import datetime, date, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CAL_DATA_DIR = BASE_DIR / "calendar_data"
CAL_DATA_DIR.mkdir(exist_ok=True)

def generate_ics():
    now_utc = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    until_str = "20270527T235959Z"
    
    # Template header
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ATHX 2027//Athlete Headquarters//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:ATHX 2027 Training Schedule",
        "X-WR-TIMEZONE:Europe/Paris",
        "X-WR-CALDESC:ATHX 2027 Microcycle (CHAD 1000X Week: Nov 9-15 • Standard Series Rest)",
    ]

    # Standard weekly event definitions
    standard_template = [
        # Monday
        {
            "dow_offset": 0,
            "start_time": (6, 30),
            "end_time": (7, 30),
            "summary": "🏋️‍♂️ CrossFit (Session 1)",
            "description": "CrossFit Box WOD\\n• Focus: Metabolic conditioning, gymnastics & work capacity\\n• Directive: Protect systemic fatigue for Tuesday heavy squats.",
            "location": "CrossFit Box",
            "uid_prefix": "athx-mon-crossfit",
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
            "uid_prefix": "athx-tue-squat-s2o",
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
            "uid_prefix": "athx-wed-crossfit",
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
            "uid_prefix": "athx-wed-run1-z2",
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
            "uid_prefix": "athx-thu-deadlift-upper",
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
            "uid_prefix": "athx-fri-crossfit",
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
            "uid_prefix": "athx-fri-run2-intervals",
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
            "uid_prefix": "athx-sat-crossfit",
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
            "uid_prefix": "athx-sun-run3-z2-recovery",
            "byday": "SU"
        }
    ]

    # 1. Past Recurring Series: Oct 19 to Nov 8, 2026
    start_monday_past = date(2026, 10, 19)
    until_past = "20261108T235959Z"
    for ev in standard_template:
        ev_date = start_monday_past + timedelta(days=ev["dow_offset"])
        dtstart = f"{ev_date.strftime('%Y%m%d')}T{ev['start_time'][0]:02d}{ev['start_time'][1]:02d}00"
        dtend = f"{ev_date.strftime('%Y%m%d')}T{ev['end_time'][0]:02d}{ev['end_time'][1]:02d}00"
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{ev['uid_prefix']}-past@athx2027.internal",
            f"DTSTAMP:{now_utc}",
            f"DTSTART;TZID=Europe/Paris:{dtstart}",
            f"DTEND;TZID=Europe/Paris:{dtend}",
            f"RRULE:FREQ=WEEKLY;UNTIL={until_past};BYDAY={ev['byday']}",
            f"SUMMARY:{ev['summary']}",
            f"DESCRIPTION:{ev['description']}",
            f"LOCATION:{ev['location']}",
            "STATUS:CONFIRMED",
            "TRANSP:OPAQUE",
            "END:VEVENT"
        ])

    # 2. NEXT WEEK ONLY: Monday Nov 9 to Sunday Nov 15, 2026 (CHAD 1000X Microcycle)
    special_week_events = [
        # Monday Nov 9
        {
            "date": date(2026, 11, 9),
            "start_time": (6, 30),
            "end_time": (7, 30),
            "summary": "🏋️‍♂️ CrossFit (Session 1) - Upper & Pull Focus",
            "description": "CrossFit Box WOD\\n• Focus: Metabolic conditioning, gymnastics & upper-body pulling.\\n• DIRECTIVE: Save quads and Achilles for Wednesday's HERO WOD 'CHAD 1000X'. Avoid heavy box jumps, heavy wall balls, or sprint lunges.",
            "location": "CrossFit Box",
            "uid": "athx-20261109-mon-cf"
        },
        # Tuesday Nov 10 (Rest Day)
        {
            "date": date(2026, 11, 10),
            "start_time": (8, 0),
            "end_time": (9, 0),
            "summary": "🛌 REST DAY: Full Passive Recovery & CHAD Eve Prep",
            "description": "COMPLETE BREAK DAY (Core & Run Replaced)\\n• Focus: 100% biological, tendon, and glycogen recovery.\\n• Strategy: Zero training strain. Hydrate with electrolytes (sodium + magnesium) and top off liver/muscle glycogen with complex carbohydrates at dinner.\\n• Purpose: Caps ACWR strictly at 1.48 and guarantees 100% knee/hip extensor freshness for Wednesday's HERO WOD CHAD 1000X.",
            "location": "Home / Rest",
            "uid": "athx-20261110-tue-core"
        },
        # Tuesday Nov 10 Evening (Run Cancelled)
        {
            "date": date(2026, 11, 10),
            "start_time": (18, 30),
            "end_time": (19, 0),
            "summary": "🚫 PM RUN CANCELLED: Rest Day",
            "description": "EVENING RUN CANCELLED\\n• Replaced by full rest day to protect knees and Achilles tendon before 1,000 box step-ups.",
            "location": "Home / Rest",
            "uid": "athx-20261110-tue-run1"
        },
        # Wednesday Nov 11 Morning
        {
            "date": date(2026, 11, 11),
            "start_time": (6, 30),
            "end_time": (7, 45),
            "summary": "🎖️ HERO WOD: CHAD 1000X",
            "description": "HERO WOD 'CHAD 1000X'\\n• Work: 1,000 Box Step-ups onto 20\" Box (weighted vest/ruck if scaled/prescribed)\\n• Target Time: 48–60 minutes steady pace\\n• Strategy: Lock in 20 reps/min (3s per step). Alternate lead leg every 10–20 reps to prevent calf cramping. Full hip lockout at top of box.",
            "location": "CrossFit Box",
            "uid": "athx-20261111-wed-chad"
        },
        # Wednesday Nov 11 Evening (Cancelled Alert)
        {
            "date": date(2026, 11, 11),
            "start_time": (18, 30),
            "end_time": (19, 0),
            "summary": "🚫 PM RUN CANCELLED: Active Recovery & Elevation",
            "description": "EVENING RUN CANCELLED\\n• Purpose: Mitigate eccentric muscle damage from 1,000 box step-ups.\\n• Protocol: Legs elevated 15–20 min, hydrate with electrolytes, targeted quad/glute foam rolling. Target 8.5h sleep opportunity.",
            "location": "Home / Recovery Suite",
            "uid": "athx-20261111-wed-recovery"
        },
        # Thursday Nov 12 Morning
        {
            "date": date(2026, 11, 12),
            "start_time": (6, 30),
            "end_time": (7, 25),
            "summary": "🏋️ ATHX Gym B: Upper Power & S2O Overhead",
            "description": "1. Shoulder-to-Overhead (S2O Push Press): 4×5 @ 45–50 kg\\n2. Barbell Bench Press: 3×6–8 @ 75–80 kg\\n3. Weighted Pull-ups: 3×6–8 (+10 to +15 kg)\\n4. Dumbbell Scapular & Face Pulls: 3×12–15\\n• Optional: 20 min Zone 1 spin on BikeErg (<115 bpm) for quad drainage.\\n• DIRECTIVE: Quads in peak DOMS post-CHAD. Zero lower-body axial loading. Hits upper ATHX power benchmarks cleanly.",
            "location": "Gym / Strength Facility",
            "uid": "athx-20261112-thu-upper"
        },
        # Friday Nov 13 Morning
        {
            "date": date(2026, 11, 13),
            "start_time": (6, 30),
            "end_time": (7, 30),
            "summary": "🏋️‍♂️ CrossFit (Session 3) - Paced Engine",
            "description": "CrossFit Box WOD\\n• Focus: Aerobic engine & gymnastics.\\n• DIRECTIVE: Cap intensity at 80% effort (RPE 7.5). Avoid redlining.",
            "location": "CrossFit Box",
            "uid": "athx-20261113-fri-cf"
        },
        # Friday Nov 13 Evening
        {
            "date": date(2026, 11, 13),
            "start_time": (18, 30),
            "end_time": (19, 15),
            "summary": "🏃 ATHX Run 2: Zone 2 Tendon Elasticity Check",
            "description": "Distance: 5.0 km continuous @ 5:45–6:00/km\\n• Heart Rate: Strictly Zone 2 (<138 bpm)\\n• DIRECTIVE: Skip high-impact threshold intervals this week. Use steady Z2 to verify calf and Achilles elasticity 48h after CHAD.",
            "location": "Road / Flat Course",
            "uid": "athx-20261113-fri-run2"
        },
        # Saturday Nov 14 Morning
        {
            "date": date(2026, 11, 14),
            "start_time": (9, 30),
            "end_time": (10, 45),
            "summary": "🦵 ATHX Gym A: Heavy Squats & Deadlifts (72h Post-CHAD)",
            "description": "1. Barbell Back Squat: 4×5 @ 75–80 kg\\n2. Conventional / Trap Bar Deadlift: 3×5 @ 115–125 kg\\n3. Lying / Seated Hamstring Curls: 3×12–15\\n4. Hanging Knee Raises / Anti-Rotation: 3×12\\n• DIRECTIVE: 72 hours post-CHAD, quads and connective tissue are fully remodeled. Reclaims weekly heavy compound MEV safely inside ACWR sweet spot (1.05).",
            "location": "Gym / Strength Facility",
            "uid": "athx-20261114-sat-squat-dl"
        },
        # Sunday Nov 15 Morning
        {
            "date": date(2026, 11, 15),
            "start_time": (9, 30),
            "end_time": (10, 30),
            "summary": "🏃 ATHX Run 3: Long Aerobic Engine",
            "description": "Distance: 6.0–7.0 km continuous steady run @ 5:40–6:00/km\\n• Heart Rate: Strictly Zone 2 (<142 bpm)\\n• Purpose: Solidify aerobic foundation and cap weekly running at ~16–17 km with zero structural overload.",
            "location": "Park / Easy Trail",
            "uid": "athx-20261115-sun-run3"
        }
    ]

    for sev in special_week_events:
        d_str = sev["date"].strftime("%Y%m%d")
        dtstart = f"{d_str}T{sev['start_time'][0]:02d}{sev['start_time'][1]:02d}00"
        dtend = f"{d_str}T{sev['end_time'][0]:02d}{sev['end_time'][1]:02d}00"
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{sev['uid']}@athx2027.internal",
            f"DTSTAMP:{now_utc}",
            f"LAST-MODIFIED:{now_utc}",
            "SEQUENCE:3",
            f"DTSTART;TZID=Europe/Paris:{dtstart}",
            f"DTEND;TZID=Europe/Paris:{dtend}",
            f"SUMMARY:{sev['summary']}",
            f"DESCRIPTION:{sev['description']}",
            f"LOCATION:{sev['location']}",
            "STATUS:CONFIRMED",
            "TRANSP:OPAQUE",
            "END:VEVENT"
        ])

    # 3. Future Recurring Series: Resuming Monday Nov 16, 2026 to May 27, 2027
    start_monday_future = date(2026, 11, 16)
    for ev in standard_template:
        ev_date = start_monday_future + timedelta(days=ev["dow_offset"])
        dtstart = f"{ev_date.strftime('%Y%m%d')}T{ev['start_time'][0]:02d}{ev['start_time'][1]:02d}00"
        dtend = f"{ev_date.strftime('%Y%m%d')}T{ev['end_time'][0]:02d}{ev['end_time'][1]:02d}00"
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{ev['uid_prefix']}-future@athx2027.internal",
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
    
    # Also sync legacy calendar cache if present
    p3 = BASE_DIR.parent / "legacy_calendar" / "calendar_data" / "athx_training_schedule.ics"
    if p3.parent.exists():
        p3.write_text(ics_str, encoding="utf-8")
        
    print(f"✅ Generated ATHX Training Schedule iCal at:\n   • {p1}\n   • {p2}")

if __name__ == "__main__":
    generate_ics()
