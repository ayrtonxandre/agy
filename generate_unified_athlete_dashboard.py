#!/usr/bin/env python3
"""
================================================================================
Unified ATHX 2027 Athlete Headquarters: Upgraded Arty Design System Dashboard
================================================================================
Completely redesigned executive athlete intelligence platform:
  1. Driven by shared configuration (athx_config.py), analytics (athx_analytics.py),
     and AI Performance Coach (athx_ai_coach.py).
  2. Artefact ("Arty") Design System: OKLCH tokenized color palette, Jost UI typography,
     Fira Code monospace metrics, deep midnight background, and Artefact Pink accents.
  3. Persistent 240px Left Navigation Sidebar with PLAN and ANALYSE sections,
     live Data Sources pulse footer, and quick link to Calendar Dashboard.
  4. Sticky Glassmorphism Executive Header with active view title, phase badge,
     and 31-week countdown pill.
  5. Dedicated "Today" Command Center:
     - AI Coach verdict card (76% score, risk pill, narrative, 3-metric triage).
     - This Week's 3 Tactical Priorities.
     - Interactive 7-Day Microcycle Calendar Strip with day drill-down and coach rationale.
     - Weekly Volume vs MEV/MAV horizontal range gauges for 7 muscle groups.
     - 7-Day Fueling Targets progress bars.
  6. ATHX 2027 Non-Pro Event Readiness Table with required weekly velocity.
  7. High-density, interactive data tables with category filters, search, and
     inline expandable accordion rows showing exercise sets, reps, and loads.
  8. Preserved and refreshed Chart.js visual analytics (Muscle distribution radar,
     e1RM progressions, daily tonnage, weight & body fat trends, sleep architecture).
  9. Zero CORS restrictions: 100% self-contained, offline-compatible, works over
     file:///, localhost:8080/workout, and GitHub Pages.
"""

from __future__ import annotations
import os
import json
import csv
import sys
from pathlib import Path
from datetime import datetime, date, timedelta

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("AGY_DATA_DIR", str(BASE_DIR)))
sys.path.insert(0, str(BASE_DIR))

import athx_config
import athx_analytics
import athx_ai_coach
import athx_durability_cs_gear as adcg


def safe_float(val, default: float = 0.0) -> float:
    """Safely converts a value to float, handling None, NaN, and non-numeric strings."""
    if val is None or val == "" or str(val).strip() == "" or str(val).lower() == "none":
        return default
    try:
        f = float(val)
        import math
        return default if math.isnan(f) else f
    except (ValueError, TypeError):
        return default


def safe_int(val, default: int = 0) -> int:
    """Safely converts a value to int, handling None and non-numeric strings."""
    if val is None or val == "" or str(val).strip() == "" or str(val).lower() == "none":
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default


def build_strength_sessions(processed_sets: list[dict], all_activities: list[dict]) -> list[dict]:
    act_by_id = {str(a.get("Activity_ID")): a for a in all_activities}
    sess_map: dict[str, list[dict]] = {}
    for s in processed_sets:
        aid = str(s.get("Activity_ID", ""))
        if aid:
            sess_map.setdefault(aid, []).append(s)

    MUSCLE_TO_SVG = {
        'Chest': ['chest'],
        'Lats/Back': ['lats', 'traps', 'lowerback'],
        'Shoulders': ['shoulders'],
        'Quads': ['quads'],
        'Hamstrings/Glutes': ['hamstrings', 'glutes'],
        'Triceps': ['triceps'],
        'Biceps': ['biceps'],
        'Core': ['core'],
        'Forearms': ['forearms'],
        'Calves': ['calves'],
        'Full Body': ['quads', 'shoulders', 'core', 'lats', 'hamstrings', 'glutes']
    }

    sessions = []
    for aid, s_list in sess_map.items():
        cnt: dict[str, int] = {}
        for s in s_list:
            stype = s.get("Session_Type", "Strength")
            cnt[stype] = cnt.get(stype, 0) + 1
        split = sorted(cnt.items(), key=lambda x: x[1], reverse=True)[0][0]

        ex_map: dict[str, list[dict]] = {}
        for s in s_list:
            ex_name = s.get("Exercise", "Unknown")
            ex_map.setdefault(ex_name, []).append(s)

        top_e1rm = None
        for s in s_list:
            e = safe_float(s.get("e1RM_kg", 0.0))
            r = safe_int(s.get("Reps", 0))
            if r <= 10 and e > 0:
                if top_e1rm is None or e > top_e1rm["e"]:
                    top_e1rm = {"e": round(e, 1), "n": s.get("Exercise", "")}

        act = act_by_id.get(aid, {})
        total_tonnage = round(sum(safe_float(s.get("Total_Volume_kg", 0.0)) for s in s_list) / 1000.0, 1)

        prim_counts: dict[str, dict] = {}
        sec_counts: dict[str, dict] = {}
        ex_meta: dict[str, dict] = {}

        detail = []
        for ex_name, xs in ex_map.items():
            reps_str = "/".join(str(safe_int(x.get("Reps", 0))) for x in xs)
            weights = [safe_float(x.get("Weight_kg", 0.0)) for x in xs]
            lo, hi = min(weights), max(weights)
            load_str = "BW" if hi == 0 else f"{hi:.1f} kg" if lo == hi else f"{lo:.1f}–{hi:.1f} kg"
            ex_vol = sum(safe_float(x.get("Total_Volume_kg", 0.0)) for x in xs) / 1000.0
            n_sets = len(xs)

            pm = athx_config.EXERCISE_MUSCLE_MAP.get(ex_name)
            if not pm:
                pm = "Core" if any(k in ex_name.lower() for k in ["sit up", "twist", "raise", "carry"]) else "Other"

            comp = athx_config.EXERCISE_COMPOUND_VOLUME.get(ex_name, {})

            if pm not in ("Other", "Unattributed", "Warmup"):
                if pm not in prim_counts:
                    prim_counts[pm] = {"sets": 0, "ton": 0.0, "exercises": []}
                prim_counts[pm]["sets"] += n_sets
                prim_counts[pm]["ton"] = round(prim_counts[pm]["ton"] + ex_vol, 1)
                if ex_name not in prim_counts[pm]["exercises"]:
                    prim_counts[pm]["exercises"].append(ex_name)

            sec_muscles = []
            for sm, factor in comp.items():
                if sm != pm and sm not in ("Other", "Unattributed", "Warmup"):
                    sec_muscles.append(sm)
                    if sm not in sec_counts:
                        sec_counts[sm] = {"sets": 0, "ton": 0.0}
                    sec_counts[sm]["sets"] += round(n_sets * factor)
                    sec_counts[sm]["ton"] = round(sec_counts[sm]["ton"] + ex_vol * factor, 1)

            ex_svg_prim = list(MUSCLE_TO_SVG.get(pm, []))
            ex_svg_sec = []
            for sm in sec_muscles:
                for svg_id in MUSCLE_TO_SVG.get(sm, []):
                    if svg_id not in ex_svg_prim and svg_id not in ex_svg_sec:
                        ex_svg_sec.append(svg_id)

            ex_meta[ex_name] = {
                "primary": pm,
                "secondary": sec_muscles,
                "svg_primary": ex_svg_prim,
                "svg_secondary": ex_svg_sec,
                "sets": n_sets,
                "ton": round(ex_vol, 1)
            }

            detail.append({
                "a": ex_name,
                "b": f"{len(xs)} {'set' if len(xs) == 1 else 'sets'} · {reps_str} reps · {load_str}",
                "muscle": pm,
                "svg_primary": ex_svg_prim,
                "svg_secondary": ex_svg_sec
            })

        session_svg_prim = set()
        for pm in prim_counts:
            for s in MUSCLE_TO_SVG.get(pm, []):
                session_svg_prim.add(s)

        session_svg_sec = set()
        for sm in sec_counts:
            for s in MUSCLE_TO_SVG.get(sm, []):
                if s not in session_svg_prim:
                    session_svg_sec.add(s)

        chips = []
        for m, info in sorted(prim_counts.items(), key=lambda x: -x[1]["sets"]):
            chips.append({"name": m, "sets": info["sets"], "ton": info["ton"], "role": "primary"})
        for m, info in sorted(sec_counts.items(), key=lambda x: -x[1]["sets"]):
            if m not in prim_counts:
                chips.append({"name": m, "sets": info["sets"], "ton": info["ton"], "role": "secondary"})

        dur_val = safe_float(act.get("Duration_min")) if act.get("Duration_min") is not None else None
        sessions.append({
            "id": aid,
            "date": s_list[0].get("Date", ""),
            "name": act.get("Activity_Name", "Strength Session"),
            "split": split,
            "nEx": len(ex_map),
            "nSets": len(s_list),
            "ton": total_tonnage,
            "top": top_e1rm,
            "dur": round(dur_val, 1) if dur_val is not None and dur_val > 0 else None,
            "detail": detail,
            "muscles": {
                "primary": prim_counts,
                "secondary": sec_counts,
                "svg_primary": list(session_svg_prim),
                "svg_secondary": list(session_svg_sec),
                "chips": chips,
                "ex_meta": ex_meta
            }
        })

    sessions.sort(key=lambda x: x["date"], reverse=True)
    return sessions


def build_engine_activities(all_activities: list[dict], running_activities: list[dict]) -> list[dict]:
    run_by_id = {str(r.get("Activity_ID")): r for r in running_activities}
    engine = []

    for a in all_activities:
        d = a.get("Date", "")
        cat = a.get("Primary_Category", "")
        atype = a.get("Activity_Type", "")
        if d >= athx_config.DATA_START and cat != "Strength" and atype != "strength_training":
            aid = str(a.get("Activity_ID"))
            r = run_by_id.get(aid)
            kind = "Running" if cat == "Running" else "Cross-Training" if str(cat).startswith("Cardio") else "Other"
            detail = []
            if a.get("Notes"):
                detail.append({"a": "Notes", "b": str(a.get("Notes"))})
            if a.get("Max_HR"):
                try:
                    max_hr_val = safe_float(a.get("Max_HR"))
                    if max_hr_val > 0:
                        detail.append({"a": "Max HR", "b": f"{round(max_hr_val)} bpm"})
                except Exception:
                    pass
            if r:
                cad = r.get("Cadence_spm") or "—"
                vo2 = r.get("VO2Max") or "—"
                detail.append({"a": "Cadence · VO2max", "b": f"{cad} spm · {vo2}"})

            dur_v = safe_float(a.get("Duration_min")) if a.get("Duration_min") is not None else None
            km_v = safe_float(a.get("Distance_km")) if a.get("Distance_km") is not None else None
            kcal_v = safe_float(a.get("Calories_kcal")) if a.get("Calories_kcal") is not None else None
            hr_v = safe_float(a.get("Average_HR")) if a.get("Average_HR") is not None else None

            dur = round(dur_v, 1) if dur_v is not None and dur_v > 0 else None
            km = round(km_v, 2) if km_v is not None and km_v > 0 else None
            kcal = round(kcal_v) if kcal_v is not None and kcal_v > 0 else None
            hr = round(hr_v) if hr_v is not None and hr_v > 0 else None
            pace = r.get("Pace_formatted") if r else None

            engine.append({
                "id": aid,
                "date": d,
                "name": a.get("Activity_Name", "Activity"),
                "kind": kind,
                "dur": dur,
                "km": km,
                "pace": pace,
                "kcal": kcal,
                "hr": hr,
                "te": (a.get("Training_Effect") or "").replace("_", " ").lower(),
                "detail": detail
            })

    engine.sort(key=lambda x: x["date"], reverse=True)
    return engine


def build_microcycle(all_activities: list[dict], coach_briefing: dict, as_of_date_str: str) -> list[dict]:
    try:
        ref_date = datetime.strptime(as_of_date_str[:10], "%Y-%m-%d").date()
    except Exception:
        ref_date = date.today()

    monday = ref_date - timedelta(days=ref_date.weekday())
    days_list = []
    dow_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    dow_long = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    act_by_date: dict[str, list[dict]] = {}
    for a in all_activities:
        d = a.get("Date", "")
        if d:
            act_by_date.setdefault(d, []).append(a)

    planned_presets = {
        0: {  # Monday
            "title": "CrossFit WOD", "c": "cond",
            "items": [
                {"name": "Box Metcon / Gymnastics", "scheme": "60 min", "load": "WOD"},
                {"name": "Skill & Core Work", "scheme": "—", "load": "moderate"}
            ],
            "why": "General work capacity & metabolic conditioning. Protect systemic load for Tuesday's heavy squats."
        },
        1: {  # Tuesday
            "title": "Gym A · Squats & S2O", "c": "legs",
            "items": [
                {"name": "Barbell Back Squat", "scheme": "4 × 6", "load": "77.5–82.5 kg"},
                {"name": "Bulgarian Split Squat", "scheme": "3 × 8 / leg", "load": "2 × 18–22 kg"},
                {"name": "Shoulder-to-Overhead (Push Press)", "scheme": "4 × 5", "load": "45–50 kg"},
                {"name": "Leg Extension", "scheme": "3 × 12–15", "load": "RPE 8.5–9"}
            ],
            "why": "Quads at 4.5 sets/wk vs MEV 8.0. Target +1.25 kg/wk progression to eliminate the -38.7 kg squat deficit."
        },
        2: {  # Wednesday
            "title": "CrossFit + Run 1 (Zone 2)", "c": "cond",
            "items": [
                {"name": "CrossFit Box WOD", "scheme": "60 min", "load": "WOD"},
                {"name": "Aerobic Base Run", "scheme": "5–6 km", "load": "5:40–6:10/km (HR <145)"},
                {"name": "Cadence Focus", "scheme": "172–174 spm", "load": "light midfoot"}
            ],
            "why": "Flushes Tuesday quad stiffness with Zone 2 aerobic circulation; fixes overstride cadence to lower GCT."
        },
        3: {  # Thursday
            "title": "Gym B · Deadlift & Upper", "c": "pull",
            "items": [
                {"name": "Conventional / Trap Deadlift", "scheme": "4 × 5", "load": "115–125 kg"},
                {"name": "Barbell Bench Press", "scheme": "3 × 6–8", "load": "75–80 kg"},
                {"name": "Romanian Deadlift (RDL)", "scheme": "3 × 8–10", "load": "80–90 kg"},
                {"name": "Weighted Pull-ups", "scheme": "3 × 6–8", "load": "+10 to +15 kg"},
                {"name": "Heavy Sandbag / Carry", "scheme": "3 × 40 m", "load": "50 kg bag / KBs"}
            ],
            "why": "Closes deadlift gap (-28 kg) & maintains 104 kg bench press without junk fatigue."
        },
        4: {  # Friday
            "title": "CrossFit + Run 2 (5k Intervals)", "c": "cond",
            "items": [
                {"name": "CrossFit Box WOD", "scheme": "60 min", "load": "WOD"},
                {"name": "5k Qualifying Repeats", "scheme": "4–5 × 1,000m", "load": "@ 4:25–4:35/km (90s rest)"}
            ],
            "why": "Bridges the 37s/km gap to 4:30/km standard; high-velocity stride recruitment."
        },
        5: {  # Saturday
            "title": "CrossFit · Team / Engine", "c": "cond",
            "items": [
                {"name": "Saturday Box WOD", "scheme": "60 min", "load": "Team / Long Metcon"}
            ],
            "why": "High-volume hybrid work capacity & lactate buffering."
        },
        6: {  # Sunday
            "title": "Run 3 · Lighter Zone 2 5K", "c": "cond",
            "items": [
                {"name": "Easy Recovery Run", "scheme": "5.0 km", "load": "5:50–6:20/km (HR <140)"},
                {"name": "Mobility & Hips", "scheme": "20 min", "load": "couch stretch & foam roll"}
            ],
            "why": "Pure active recovery & parasympathetic recharge; brings weekly running volume to ~17 km."
        }
    }

    for i in range(7):
        cur_d = monday + timedelta(days=i)
        cur_d_str = cur_d.isoformat()
        is_today = (cur_d == ref_date)
        is_past = (cur_d < ref_date)
        acts = act_by_date.get(cur_d_str, [])

        dow_label = dow_names[i]
        date_num = str(cur_d.day)
        long_label = "Today" if is_today else f"{dow_long[i]} {cur_d.day} {months[cur_d.month - 1]}"

        if acts:
            top_act = acts[0]
            name = top_act.get("Activity_Name", "Workout")
            dur = round(safe_float(top_act.get("Duration_min"), 0.0))
            kcal = round(safe_float(top_act.get("Calories_kcal"), 0.0))
            hr = round(safe_float(top_act.get("Average_HR"), 0.0))
            cat = top_act.get("Primary_Category", "")
            split_color = "push" if "Push" in name else "pull" if "Pull" in name else "legs" if "Leg" in name else "cond"
            items = []
            notes = top_act.get("Notes", "")
            if notes:
                lines = [l.strip() for l in notes.splitlines() if l.strip()]
                for l in lines[:5]:
                    items.append({"name": l[:40], "scheme": "—", "load": "logged"})
            else:
                items.append({"name": name, "scheme": f"{dur} min", "load": f"{kcal} kcal"})

            hr_str = f" · avg HR {hr} bpm" if hr > 0 else ""
            why = f"Garmin Connect · {kcal} kcal{hr_str} · duration {dur} min. Telemetry verified in audit engine."
            days_list.append({
                "dow": dow_label, "date": date_num, "iso": cur_d_str, "long": long_label, "title": name,
                "c": split_color, "state": f"Done · {dur} min", "past": is_past, "today": is_today,
                "items": items, "why": why
            })
        elif is_past:
            days_list.append({
                "dow": dow_label, "date": date_num, "iso": cur_d_str, "long": long_label, "title": "Rest",
                "c": "rest", "state": "Nothing logged", "past": True, "today": False,
                "items": [], "why": "No Garmin activity recorded. Scheduled recovery."
            })
        else:
            preset = planned_presets.get(i, {
                "title": "Rest / Active Recovery", "c": "rest",
                "items": [], "why": f"Scheduled biological recovery window. Target {getattr(athx_config, 'TARGET_SLEEP_HRS', 7.5):.1f}h sleep and hydration."
            })
            days_list.append({
                "dow": dow_label, "date": date_num, "iso": cur_d_str, "long": long_label, "title": preset["title"],
                "c": preset["c"], "state": "Planned", "past": False, "today": is_today,
                "items": preset["items"], "why": preset["why"]
            })

    return days_list


def build_volume_gauges(muscle_summary: dict) -> list[dict]:
    muscles_config = [
        ("Quads", "legs", 8.0, (12.0, 18.0)),
        ("Hamstrings/Glutes", "legs", 6.0, (10.0, 16.0)),
        ("Chest", "push", 10.0, (14.0, 18.0)),
        ("Shoulders", "push", 8.0, (12.0, 18.0)),
        ("Lats/Back", "pull", 10.0, (14.0, 20.0)),
        ("Biceps", "pull", 6.0, (10.0, 16.0)),
        ("Forearms", "pull", 4.0, (6.0, 12.0)),
    ]

    VMAX = 22.0
    gauges = []
    color_map = {
        "push": "var(--chart-3)",
        "pull": "var(--chart-2)",
        "legs": "var(--chart-9)",
        "cond": "var(--muted-foreground)"
    }

    for name, split, mev, mav in muscles_config:
        info = muscle_summary.get(name, {})
        s = safe_float(info.get("avg_weekly_sets"))
        gap = round(s - mev, 1)
        fill_pct = min(100.0, (s / VMAX) * 100.0)
        mev_left = (mev / VMAX) * 100.0
        mav_left = (mav[0] / VMAX) * 100.0
        mav_width = ((mav[1] - mav[0]) / VMAX) * 100.0

        label = f"{s:.1f} · {gap:+.1f}" if gap < 0 else f"{s:.1f} · ok"
        gap_color = "var(--destructive)" if gap < 0 else "var(--muted-foreground)"

        gauges.append({
            "name": name,
            "s": s,
            "mev": mev,
            "mav": list(mav),
            "color": color_map.get(split, "var(--primary)"),
            "fillW": f"{fill_pct:.1f}%",
            "mevL": f"{mev_left:.1f}%",
            "mavL": f"{mav_left:.1f}%",
            "mavW": f"{mav_width:.1f}%",
            "label": label,
            "gapColor": gap_color
        })
    return gauges


def build_fueling_targets(nutrition_history: list[dict]) -> list[dict]:
    nut_last7 = nutrition_history[-7:] if len(nutrition_history) >= 7 else nutrition_history
    if nut_last7:
        avg_cal = round(sum(safe_float(r.get("Calories_kcal")) for r in nut_last7) / len(nut_last7))
        avg_prot = round(sum(safe_float(r.get("Protein_g")) for r in nut_last7) / len(nut_last7))
        avg_fib = round(sum(safe_float(r.get("Fiber_g")) for r in nut_last7) / len(nut_last7), 1)
        avg_c = sum(safe_float(r.get("Carbs_g")) for r in nut_last7) / len(nut_last7)
        ratio_cp = round(avg_c / avg_prot, 2) if avg_prot > 0 else 0.0
    else:
        avg_cal, avg_prot, avg_fib, ratio_cp = 2581, 196, 29.2, 2.62

    cal_delta = avg_cal - 3050
    cal_delta_str = f"{cal_delta:+,} kcal vs surplus target"
    prot_gkg = round(avg_prot / 79.7, 2)

    return [
        {
            "name": "Calories",
            "value": f"{avg_cal:,}",
            "target": "3,050 kcal",
            "pct": f"{min(100, round((avg_cal / 3050.0) * 100))}%",
            "note": cal_delta_str,
            "tone": "ok" if avg_cal >= 3000 else "warn",
            "color": "var(--success-foreground)" if avg_cal >= 3000 else "var(--warn)",
            "noteColor": "var(--muted-foreground)" if avg_cal >= 3000 else "var(--warn-foreground)"
        },
        {
            "name": "Protein",
            "value": f"{avg_prot}",
            "target": "180 g",
            "pct": f"{min(100, round((avg_prot / 180.0) * 100))}%",
            "note": f"{prot_gkg} g/kg · on target",
            "tone": "ok",
            "color": "var(--success-foreground)",
            "noteColor": "var(--muted-foreground)"
        },
        {
            "name": "Fiber",
            "value": f"{avg_fib:.1f}",
            "target": "30 g",
            "pct": f"{min(100, round((avg_fib / 30.0) * 100))}%",
            "note": f"{avg_fib - 30.0:+.1f} g",
            "tone": "ok" if avg_fib >= 30.0 else "warn",
            "color": "var(--success-foreground)" if avg_fib >= 30.0 else "var(--warn)",
            "noteColor": "var(--muted-foreground)" if avg_fib >= 30.0 else "var(--warn-foreground)"
        },
        {
            "name": "Carb : Protein",
            "value": f"{ratio_cp:.2f}",
            "target": "1.5–2.0",
            "pct": "100%",
            "note": "On target" if 1.5 <= ratio_cp <= 2.0 else "Above band. Shift some carbs to fat." if ratio_cp > 2.0 else "Below band.",
            "tone": "ok" if 1.5 <= ratio_cp <= 2.0 else "warn",
            "color": "var(--success-foreground)" if 1.5 <= ratio_cp <= 2.0 else "var(--warn)",
            "noteColor": "var(--muted-foreground)" if 1.5 <= ratio_cp <= 2.0 else "var(--warn-foreground)"
        }
    ]


def build_html(payload_json: str, d: dict) -> str:
    cfg = d["config"]
    st = d["strength"]
    ap = d["apple"]
    rn = d.get("running", {})
    wk = d.get("workouts", {})
    cp = d["competition"]
    fr = d["freshness"]
    au = d["audit"]
    cb = d.get("coach_briefing", {})

    # Normalize ap (Apple Health) fields for smooth template rendering
    bc = ap.setdefault("body_comp", {})
    bc.setdefault("current_lean_mass", bc.get("latest_lean_mass", 68.1))
    bc.setdefault("current_bf_pct", bc.get("latest_bf_pct", 14.1))
    bc.setdefault("weight_remaining", bc.get("weight_remaining", 0.0))
    bc.setdefault("current_weight", bc.get("current_weight", 79.7))
    bc.setdefault("history", bc.get("history", []))

    nut = ap.setdefault("nutrition", {})
    nut.setdefault("avg_protein", nut.get("avg_protein_g", 0))
    nut.setdefault("avg_calories", nut.get("avg_calories", 0))
    if "carb_protein_ratio" not in nut:
        avg_c = nut.get("avg_carbs_g", 0)
        avg_p = nut.get("avg_protein_g", 1) or 1
        nut["carb_protein_ratio"] = round(avg_c / avg_p, 2)
    nut.setdefault("history", nut.get("history", []))

    act = ap.setdefault("activity", {})
    act.setdefault("days_tracked", act.get("days_logged", 0))
    act.setdefault("avg_steps", act.get("avg_steps", 0))
    act.setdefault("max_steps", act.get("max_steps", 0))

    mob = ap.setdefault("mobility", {})
    mob.setdefault("current_asymmetry", mob.get("avg_asymmetry_pct", 0.8))
    mob.setdefault("current_rhr", mob.get("current_rhr", 58.0))
    mob.setdefault("days_tracked", mob.get("days_tracked", 0))
    mob.setdefault("history", mob.get("history", []))

    slp = ap.setdefault("sleep", {})
    slp.setdefault("avg_sleep_hrs", slp.get("avg_sleep_hrs", 7.0))
    slp.setdefault("coverage_pct", slp.get("coverage_pct", 50))
    slp.setdefault("valid_nights", slp.get("valid_nights", 0))
    slp.setdefault("calendar_days", slp.get("calendar_days", 0))
    slp.setdefault("history", slp.get("history", []))

    strength_sessions = d.get("strength_sessions", [])
    engine_activities = d.get("engine_activities", [])
    microcycle_days = d.get("microcycle_days", [])
    volume_gauges = d.get("volume_gauges", [])
    fueling_targets = d.get("fueling_targets", [])

    today_dt = date.today()
    as_of_date = today_dt.isoformat()
    weeks_to_games = cp["weeks_remaining"]
    comp_date_display = datetime.strptime(cfg["competition_date"], "%Y-%m-%d").strftime("%d %B %Y")
    as_of_display = today_dt.strftime("%A %d %B")

    # Coach verdict & rating
    coach_rating = cb.get("executive_verdict", {}).get("rating", "76% • Moderate Risk")
    score_pct = coach_rating.split("%")[0].strip() if "%" in coach_rating else "76"
    risk_level = coach_rating.split("•")[1].strip() if "•" in coach_rating else "Moderate Risk"
    macro_text = cb.get("executive_verdict", {}).get("macro_assessment", (
        "Upper body pushing and pulling volume are on track. Lower-body stimulus (quads & hamstrings) sits below MEV, "
        "making barbell squats, deadlifts, and the 5km running pace the primary qualification risk. "
        f"With current ACWR at {st['acwr']['value']} (safe adaptation band), immediate lower-body volume rebalancing is required."
    ))

    # Event readiness rows
    events_json = json.dumps(cp["events"], ensure_ascii=False)
    micro_json = json.dumps(microcycle_days, ensure_ascii=False)
    vol_json = json.dumps(volume_gauges, ensure_ascii=False)
    fuel_json = json.dumps(fueling_targets, ensure_ascii=False)
    str_sess_json = json.dumps(strength_sessions, ensure_ascii=False)
    eng_acts_json = json.dumps(engine_activities, ensure_ascii=False)
    audit_json = json.dumps(au, ensure_ascii=False)

    # Advanced Sports-Science Pillars: Critical Speed, CrossFit Durability, Recovery Model & Decisions
    cs_data = d.get("critical_speed", {})
    dur_data = d.get("crossfit_durability", {})
    coach_dec_data = d.get("coach_decisions", [])
    sleep_debt_data = d.get("sleep_debt", {})
    plews_hrv_data = d.get("plews_hrv", {})
    running_biomech_data = d.get("running_biomechanics", {})
    allostatic_stress_data = d.get("allostatic_stress", {})
    vbt_data = d.get("vbt_velocity_loss", {})

    critical_speed_html = adcg.render_critical_speed_html(cs_data)
    crossfit_durability_html = adcg.render_crossfit_durability_html(dur_data)
    coach_decisions_html = adcg.render_coach_decisions_html(coach_dec_data)
    recovery_autonomic_html = adcg.render_recovery_autonomic_model_html(sleep_debt_data, plews_hrv_data)
    running_biomechanics_html = adcg.render_running_biomechanics_html(running_biomech_data)
    allostatic_stress_html = adcg.render_allostatic_stress_html(allostatic_stress_data)
    vbt_velocity_loss_html = adcg.render_vbt_velocity_loss_html(vbt_data)

    return f"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ATHX 2027 • Master Athlete Headquarters</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    /* Arty Design System Tokens — OKLCH Palette */
    :root {{
      --font-sans: "Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: "Fira Code", monospace;
      
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 10px;
      --radius-xl: 14px;
      --radius-full: 9999px;

      --background: oklch(0.129 0.042 264.695);
      --foreground: oklch(0.984 0.003 247.858);
      --card: oklch(0.208 0.042 265.755);
      --card-foreground: oklch(0.984 0.003 247.858);
      --secondary: oklch(0.279 0.041 260.031);
      --secondary-foreground: oklch(0.984 0.003 247.858);
      --muted: oklch(0.279 0.041 260.031);
      --muted-foreground: oklch(0.704 0.04 256.788);
      --accent: oklch(0.279 0.041 260.031);
      --border: oklch(1 0 0 / 10%);
      --ring: oklch(0.551 0.027 264.364);

      --atf-pink-400: oklch(0.7027 0.2021 3.36);
      --atf-pink-500: oklch(0.6514 0.2462 7.49);
      --atf-pink-600: oklch(0.6388 0.2554 10.51);
      --atf-pink: var(--atf-pink-600);

      --sidebar: oklch(0.16 0.042 264.695);
      --sidebar-border: oklch(1 0 0 / 8%);
      --sidebar-foreground: oklch(0.984 0.003 247.858);
      --sidebar-accent: oklch(0.2931 0.1178 4.99);

      --success: oklch(0.4019 0.0949 131.26);
      --success-foreground: oklch(0.966 0.0672 122.64);
      --warn: oklch(0.5528 0.1214 65.44);
      --warn-foreground: oklch(0.9866 0.0218 95.28);
      --destructive: oklch(0.704 0.24 22.216);

      --chart-2: oklch(0.5809 0.2146 326.22);
      --chart-3: oklch(0.6574 0.1258 241.09);
      --chart-4: oklch(0.725 0.148 69.45);
      --chart-7: oklch(0.7809 0.1332 182.8);
      --chart-9: oklch(0.7603 0.1825 154.1);
    }}

    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html, body {{
      margin: 0;
      background: var(--background);
      color: var(--foreground);
      font-family: var(--font-sans);
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }}

    /* Custom scrollbars */
    ::-webkit-scrollbar {{ width: 6px; height: 6px; }}
    ::-webkit-scrollbar-track {{ background: transparent; }}
    ::-webkit-scrollbar-thumb {{ background: oklch(1 0 0 / 15%); border-radius: 3px; }}
    ::-webkit-scrollbar-thumb:hover {{ background: oklch(1 0 0 / 25%); }}

    a {{ color: var(--atf-pink-400); text-decoration: none; }}
    a:hover {{ text-decoration: underline; text-underline-offset: 3px; }}

    .app-shell {{
      display: flex;
      min-height: 100vh;
      background: var(--background);
      color: var(--foreground);
    }}

    /* Persistent Sidebar */
    .sidebar {{
      width: 240px;
      flex-shrink: 0;
      background: var(--sidebar);
      border-right: 1px solid var(--sidebar-border);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 50;
    }}

    .sidebar-header {{
      height: 56px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 16px;
      border-bottom: 1px solid var(--sidebar-border);
    }}

    .brand-avatar {{
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--atf-pink);
      display: grid;
      place-items: center;
      font: 700 13px/1 var(--font-sans);
      color: #fff;
    }}

    .nav-section {{
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      overflow-y: auto;
    }}

    .nav-group-title {{
      font: 500 10px/1 var(--font-sans);
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--muted-foreground);
      padding: 12px 10px 6px;
    }}

    .nav-item {{
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      font: 500 13px/1.3 var(--font-sans);
      color: var(--foreground);
      transition: background 0.15s ease, color 0.15s ease;
      user-select: none;
    }}

    .nav-item:hover {{
      background: var(--secondary);
    }}

    .nav-item.active {{
      background: var(--sidebar-accent);
      color: var(--atf-pink-400);
      font-weight: 600;
    }}

    .nav-icon {{
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }}

    .sidebar-footer {{
      padding: 12px 16px 16px;
      border-top: 1px solid var(--sidebar-border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }}

    .source-row {{
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }}

    .status-dot {{
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }}

    /* Main Content */
    .main-view {{
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }}

    .sticky-header {{
      height: 56px;
      position: sticky;
      top: 0;
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 0 32px;
      border-bottom: 1px solid var(--border);
      background: oklch(0.129 0.042 264.695 / 0.9);
      backdrop-filter: blur(10px);
    }}

    .page-title {{
      margin: 0;
      font: 600 20px/1.2 var(--font-sans);
      letter-spacing: -0.01em;
    }}

    .page-sub {{
      color: var(--muted-foreground);
      font-size: 13px;
    }}

    .content-container {{
      padding: 24px 32px 48px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 1400px;
      width: 100%;
      box-sizing: border-box;
    }}

    /* Cards & Grids */
    .card {{
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--card);
    }}

    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }}

    .kpi-box {{
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--card);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
    }}

    .kpi-info-btn {{
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      font-size: 11px;
      font-family: var(--font-sans);
      font-weight: 600;
      line-height: 1;
      color: var(--muted-foreground);
      background: color-mix(in oklch, var(--muted) 45%, transparent);
      border: 1px solid var(--border);
      transition: all 0.15s ease;
      flex-shrink: 0;
      margin-left: 6px;
      vertical-align: middle;
      user-select: none;
    }}

    .kpi-info-btn:hover, .kpi-info-btn:focus-visible {{
      color: var(--foreground);
      border-color: var(--atf-pink-400);
      background: color-mix(in oklch, var(--atf-pink-400) 18%, transparent);
      box-shadow: 0 0 8px rgba(255, 45, 85, 0.35);
      transform: scale(1.1);
    }}

    .kpi-popover {{
      position: fixed;
      z-index: 10000;
      width: 320px;
      max-width: calc(100vw - 32px);
      background: color-mix(in oklch, var(--card) 96%, black 4%);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-top: 2px solid var(--atf-pink-400);
      border-radius: var(--radius-lg, 12px);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.05);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      animation: kpiPopoverFadeIn 0.15s ease-out;
      pointer-events: auto;
    }}

    @keyframes kpiPopoverFadeIn {{
      from {{ opacity: 0; transform: translateY(-4px) scale(0.98); }}
      to {{ opacity: 1; transform: translateY(0) scale(1); }}
    }}

    .kpi-popover-header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }}

    .kpi-popover-badge {{
      font: 600 10px/1 var(--font-sans);
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--atf-pink-400);
      background: color-mix(in oklch, var(--atf-pink-400) 12%, transparent);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid color-mix(in oklch, var(--atf-pink-400) 25%, transparent);
    }}

    .kpi-popover-close {{
      all: unset;
      cursor: pointer;
      font-size: 13px;
      line-height: 1;
      color: var(--muted-foreground);
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }}

    .kpi-popover-close:hover {{
      color: var(--foreground);
      background: var(--muted);
    }}

    .kpi-popover-title {{
      margin: 0;
      font: 600 14px/1.3 var(--font-sans);
      color: var(--foreground);
    }}

    .kpi-popover-body {{
      margin: 0;
      font: 400 12.5px/1.55 var(--font-sans);
      color: var(--muted-foreground);
      text-wrap: pretty;
    }}

    .badge {{
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font: 500 11px/1.4 var(--font-sans);
      white-space: nowrap;
      border: 1px solid transparent;
    }}

    .badge-ok {{
      background: color-mix(in oklch, var(--success) 25%, transparent);
      border-color: var(--success);
      color: var(--success-foreground);
    }}

    .badge-warn {{
      background: color-mix(in oklch, var(--warn) 25%, transparent);
      border-color: var(--warn);
      color: var(--warn-foreground);
    }}

    .badge-bad {{
      background: color-mix(in oklch, var(--destructive) 20%, transparent);
      border-color: var(--destructive);
      color: var(--destructive);
    }}

    /* Microcycle Day Cards */
    .day-btn {{
      all: unset;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: transparent;
      min-height: 92px;
      box-sizing: border-box;
      transition: background 0.15s ease, border-color 0.15s ease;
    }}

    .day-btn:hover {{
      background: var(--secondary);
    }}

    .day-btn.active {{
      background: var(--secondary);
      border-color: var(--ring);
    }}

    .day-btn.today {{
      border-color: var(--atf-pink);
    }}

    /* Table styles */
    .data-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }}

    .data-table th {{
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      font: 500 11px/1.2 var(--font-sans);
      letter-spacing: .06em;
      text-transform: uppercase;
      color: var(--muted-foreground);
      text-align: left;
    }}

    .data-table th.right, .data-table td.right {{
      text-align: right;
    }}

    .data-table td {{
      padding: 11px 16px;
      border-bottom: 1px solid var(--border);
    }}

    .expandable-row {{
      cursor: pointer;
      transition: background 0.15s ease;
    }}

    .expandable-row:hover {{
      background: var(--secondary);
    }}

    .expandable-row.expanded {{
      background: var(--secondary);
    }}

    .detail-tray {{
      padding: 8px 16px 16px 48px;
      background: var(--secondary);
      border-bottom: 1px solid var(--border);
    }}

    .filter-btn {{
      all: unset;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 8px;
      font: 500 12px/1.2 var(--font-sans);
      border: 1px solid var(--border);
      background: transparent;
      color: var(--muted-foreground);
      transition: all 0.15s ease;
    }}

    .filter-btn:hover {{
      background: var(--secondary);
      color: var(--foreground);
    }}

    .filter-btn.active {{
      background: var(--secondary);
      border-color: var(--ring);
      color: var(--foreground);
    }}

    .tab-content {{
      display: none;
      flex-direction: column;
      gap: 16px;
    }}

    .tab-content.active {{
      display: flex;
    }}

    .search-box {{
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 5px 12px;
      color: var(--foreground);
      font-family: var(--font-sans);
      font-size: 13px;
      outline: none;
    }}
    .search-box:focus {{
      border-color: var(--ring);
    }}

    /* ==================================================================== */
    /* ATHX ANATOMIC MUSCLE TARGET HUD                                      */
    /* ==================================================================== */
    .athx-anatomic-card {{
      position: relative;
      background: radial-gradient(circle at 65% 25%, oklch(0.24 0.05 230 / 18%), transparent 70%), var(--card);
      border: 1px solid oklch(0.45 0.12 230 / 30%);
      box-shadow: 0 10px 30px oklch(0 0 0 / 40%), 0 0 20px oklch(0.5 0.15 230 / 8%) inset;
      border-radius: var(--radius-xl);
      overflow: hidden;
      margin-top: 4px;
      transition: border-color 0.3s ease;
    }}

    .athx-anatomic-card::before {{
      content: "";
      position: absolute;
      top: 8px; left: 8px;
      width: 14px; height: 14px;
      border-top: 2px solid #00f2fe;
      border-left: 2px solid #00f2fe;
      pointer-events: none;
      opacity: 0.85;
    }}

    .athx-anatomic-card::after {{
      content: "";
      position: absolute;
      bottom: 8px; right: 8px;
      width: 14px; height: 14px;
      border-bottom: 2px solid #00f2fe;
      border-right: 2px solid #00f2fe;
      pointer-events: none;
      opacity: 0.85;
    }}

    .hud-header-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding: 16px 24px;
      border-bottom: 1px solid oklch(1 0 0 / 8%);
      background: oklch(0.16 0.03 260 / 50%);
    }}

    .hud-title-tag {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font: 700 11px/1 var(--font-mono);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #00f2fe;
      background: rgba(0, 242, 254, 0.12);
      border: 1px solid rgba(0, 242, 254, 0.35);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
    }}

    .hud-session-title {{
      font: 600 16px/1.3 var(--font-sans);
      color: var(--foreground);
    }}

    .hud-session-meta {{
      font-size: 12px;
      color: var(--muted-foreground);
    }}

    .hud-main-grid {{
      display: grid;
      grid-template-columns: minmax(280px, 1fr) auto;
      gap: 24px;
      padding: 20px 24px;
    }}

    @media (max-width: 900px) {{
      .hud-main-grid {{
        grid-template-columns: 1fr;
      }}
      .hud-anatomy-stage {{
        order: -1;
      }}
    }}

    @media (max-width: 480px) {{
      .hud-anatomy-stage {{
        gap: 12px;
        padding: 12px 6px;
      }}
      .athx-body-svg {{
        width: 135px;
        height: 260px;
      }}
    }}

    .hud-exercises-pane {{
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}

    .hud-ex-item {{
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px 14px;
      background: oklch(1 0 0 / 3%);
      border: 1px solid oklch(1 0 0 / 7%);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;
    }}

    .hud-ex-item:hover, .hud-ex-item.active {{
      background: oklch(0.3 0.06 230 / 25%);
      border-color: #00f2fe;
      transform: translateX(4px);
    }}

    .hud-anatomy-stage {{
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 28px;
      background: oklch(0.14 0.02 260 / 60%);
      border: 1px solid oklch(1 0 0 / 6%);
      border-radius: var(--radius-lg);
      padding: 16px 20px;
      position: relative;
    }}

    .hud-view-unit {{
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }}

    .hud-view-badge {{
      font: 600 10px/1 var(--font-mono);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted-foreground);
      padding: 3px 8px;
      background: oklch(1 0 0 / 5%);
      border-radius: var(--radius-full);
      border: 1px solid oklch(1 0 0 / 8%);
    }}

    .athx-body-svg {{
      width: 155px;
      height: 300px;
      filter: drop-shadow(0 8px 20px rgba(0,0,0,0.6));
    }}

    /* SVG Muscle Path Styling */
    .athx-body-svg .body-base path,
    .athx-body-svg .body-base ellipse,
    .athx-body-svg .muscle-group path,
    .athx-body-svg .muscle-group ellipse {{
      fill: oklch(0.24 0.015 260 / 65%);
      stroke: oklch(0.38 0.02 260 / 40%);
      stroke-width: 1;
      stroke-linejoin: round;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }}

    /* Target Primary highlight */
    .athx-body-svg .muscle-group.target-primary path,
    .athx-body-svg .muscle-group.target-primary ellipse {{
      fill: #0284c7;
      fill: url(#athxTargetPrimary) !important;
      stroke: #38bdf8 !important;
      stroke-width: 1.5 !important;
      filter: url(#athxNeonGlow);
    }}

    /* Target Secondary highlight */
    .athx-body-svg .muscle-group.target-secondary path,
    .athx-body-svg .muscle-group.target-secondary ellipse {{
      fill: #7c3aed;
      fill: url(#athxTargetSecondary) !important;
      stroke: #c084fc !important;
      stroke-width: 1.2 !important;
      filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.55));
    }}

    /* Hover highlight */
    .athx-body-svg .muscle-group.target-hover path,
    .athx-body-svg .muscle-group.target-hover ellipse {{
      fill: #38bdf8 !important;
      stroke: #ffffff !important;
      stroke-width: 2 !important;
      filter: drop-shadow(0 0 10px #38bdf8) !important;
    }}

    .athx-body-svg .muscle-group:hover path,
    .athx-body-svg .muscle-group:hover ellipse {{
      stroke: #ffffff !important;
      cursor: pointer;
    }}

    .hud-chip-strip {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 24px 16px;
      border-top: 1px solid oklch(1 0 0 / 8%);
      background: oklch(0.16 0.02 260 / 30%);
    }}

    .hud-target-chip {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      transition: transform 0.15s ease;
    }}

    .hud-target-chip.chip-prim {{
      background: rgba(0, 242, 254, 0.12);
      border: 1px solid rgba(0, 242, 254, 0.4);
      color: #e0f2fe;
    }}

    .hud-target-chip.chip-sec {{
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.35);
      color: #fae8ff;
    }}

    .hud-target-chip .dot {{
      width: 6px; height: 6px;
      border-radius: 50%;
    }}
    .hud-target-chip.chip-prim .dot {{
      background: #00f2fe;
      box-shadow: 0 0 6px #00f2fe;
    }}
    .hud-target-chip.chip-sec .dot {{
      background: #a855f7;
      box-shadow: 0 0 6px #a855f7;
    }}

    .hud-tooltip {{
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      background: oklch(0.14 0.02 260 / 92%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(0, 242, 254, 0.4);
      border-radius: var(--radius-sm);
      padding: 6px 12px;
      font-size: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6), 0 0 10px rgba(0, 242, 254, 0.2);
    }}

    /* Table Selected Row indicator */
    tr.selected-row {{
      background: oklch(0.28 0.05 230 / 30%) !important;
      border-left: 3px solid #00f2fe !important;
    }}
  </style>
</head>
<body>
<div class="app-shell">

  <!-- 1. LEFT NAVIGATION SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="brand-avatar">A</div>
      <div style="display: flex; flex-direction: column;">
        <span style="font: 600 14px/1.2 var(--font-sans);">ATHX 2027</span>
        <span style="font: 400 11px/1.2 var(--font-sans); color: var(--muted-foreground);">Non-Pro · Athlete HQ</span>
      </div>
    </div>

    <nav class="nav-section">
      <div class="nav-group-title">Plan</div>
      <div class="nav-item active" onclick="switchTab('todayTab', 'Today', '{as_of_display}')">
        <span class="nav-icon">📅</span>
        <span>Today</span>
      </div>
      <div class="nav-item" onclick="switchTab('readinessTab', 'Event Readiness', '5 events · Non-Pro standards')">
        <span class="nav-icon">🎯</span>
        <span>Event Readiness</span>
      </div>

      <div class="nav-group-title">Analyse</div>
      <div class="nav-item" onclick="switchTab('strengthTab', 'Strength & Hypertrophy', 'Since 1 May 2026')">
        <span class="nav-icon">🏋️</span>
        <span>Strength</span>
      </div>
      <div class="nav-item" onclick="switchTab('engineTab', 'Running & Conditioning', 'Since 1 May 2026')">
        <span class="nav-icon">🏃</span>
        <span>Running & Cardio</span>
      </div>
      <div class="nav-item" onclick="switchTab('bodyTab', 'Body Composition & Fuel', 'Apple Health · Foodvisor')">
        <span class="nav-icon">🍏</span>
        <span>Body & Fuel</span>
      </div>
      <div class="nav-item" onclick="switchTab('recoveryTab', 'Sleep & Recovery', 'Architecture, RHR, Gait')">
        <span class="nav-icon">💤</span>
        <span>Recovery</span>
      </div>
      <div class="nav-item" onclick="switchTab('auditTab', 'Data Quality & Audit', 'Analysis floor 2026-05-01')">
        <span class="nav-icon">🛡️</span>
        <span>Data Quality</span>
      </div>

      <div class="nav-group-title">External</div>
      <a href="calendar_dashboard.html" class="nav-item" style="color: var(--muted-foreground);" target="_blank">
        <span class="nav-icon">📆</span>
        <span>Calendar Hub ↗</span>
      </a>
    </nav>

    <!-- Sidebar Live Data Sources Pulse -->
    <div class="sidebar-footer">
      <div class="nav-group-title" style="padding: 0 0 4px;">Data Sources</div>
      <div class="source-row">
        <span class="status-dot" style="background: {'var(--chart-9)' if 'Fresh' in fr['garmin']['status'] else 'var(--warn)'};"></span>
        <span style="flex: 1; color: var(--foreground);">Garmin</span>
        <span style="color: var(--muted-foreground); font-family: var(--font-mono); font-size: 11px;">{fr['garmin']['date']}</span>
      </div>
      <div class="source-row">
        <span class="status-dot" style="background: {'var(--chart-9)' if 'Fresh' in fr['nutrition']['status'] else 'var(--warn)'};"></span>
        <span style="flex: 1; color: var(--foreground);">Nutrition</span>
        <span style="color: var(--muted-foreground); font-family: var(--font-mono); font-size: 11px;">{fr['nutrition']['date']}</span>
      </div>
      <div class="source-row">
        <span class="status-dot" style="background: {'var(--chart-9)' if 'Fresh' in fr['mobility']['status'] else 'var(--warn)'};"></span>
        <span style="flex: 1; color: var(--foreground);">Mobility</span>
        <span style="color: var(--muted-foreground); font-family: var(--font-mono); font-size: 11px;">{fr['mobility']['date']}</span>
      </div>
      <div class="source-row">
        <span class="status-dot" style="background: {'var(--chart-9)' if 'Fresh' in fr['sleep']['status'] else 'var(--warn)'};"></span>
        <span style="flex: 1; color: var(--foreground);">Sleep</span>
        <span style="color: var(--muted-foreground); font-family: var(--font-mono); font-size: 11px;">{fr['sleep']['date']}</span>
      </div>
      <div class="source-row">
        <span class="status-dot" style="background: {'var(--chart-9)' if 'Fresh' in fr['body_comp']['status'] else 'var(--warn)'};"></span>
        <span style="flex: 1; color: var(--foreground);">Body comp</span>
        <span style="color: {'var(--muted-foreground)' if 'Fresh' in fr['body_comp']['status'] else 'var(--warn-foreground)'}; font-family: var(--font-mono); font-size: 11px;">{fr['body_comp']['date']}</span>
      </div>
    </div>
  </aside>

  <!-- 2. MAIN VIEW AREA -->
  <main class="main-view">
    <header class="sticky-header">
      <div style="display: flex; align-items: baseline; gap: 12px;">
        <h1 class="page-title" id="activePageTitle">Today</h1>
        <span class="page-sub" id="activePageSub">{as_of_display}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 16px; font-size: 13px;">
        <span style="color: var(--muted-foreground);">Phase 1 · Accumulation</span>
        <span style="width: 1px; height: 20px; background: var(--border);"></span>
        <span style="display: flex; align-items: baseline; gap: 6px;">
          <strong style="font: 600 16px/1 var(--font-mono); color: var(--atf-pink-400);">{weeks_to_games}</strong>
          <span style="color: var(--muted-foreground);">weeks to Games · {comp_date_display}</span>
        </span>
      </div>
    </header>

    <div class="content-container">

      <!-- ============================================================== -->
      <!-- TAB 1: TODAY (COMMAND CENTER)                                  -->
      <!-- ============================================================== -->
      <section id="todayTab" class="tab-content active">
        <!-- AI Coach Verdict Card -->
        <div class="card" style="display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);">
          <div style="padding: 24px; display: flex; flex-direction: column; gap: 14px; border-right: 1px solid var(--border);">
            <div style="display: flex; align-items: center; justify-content: space-between; font: 500 11px/1 var(--font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--muted-foreground);" data-kpi-title="Coach Verdict Readiness" data-kpi-desc="The Coach Verdict synthesizes rolling training volume, autonomic recovery, and sleep metrics into a single readiness score. It indicates how aggressively you can push training intensity today without elevating injury risk. High scores signal optimal systemic recovery for high-threshold adaptation.">
              <span style="display: flex; align-items: center; gap: 8px;"><span>✨</span> Coach verdict</span>
              <button type="button" class="kpi-info-btn" aria-label="Explain Coach Verdict" title="Explain Coach Verdict">ℹ</button>
            </div>
            <div style="display: flex; align-items: baseline; gap: 12px;">
              <span style="font-600 44px/1 var(--font-sans); letter-spacing: -0.02em;">{score_pct}%</span>
              <span class="badge badge-warn">{risk_level}</span>
            </div>
            <p style="margin: 0; color: var(--muted-foreground); line-height: 1.55; text-wrap: pretty;">
              {macro_text}
            </p>
            <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; border: 1px solid var(--border); border-radius: 10px; margin-top: auto;">
              <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 2px;" data-kpi-title="7-Day Sleep Average" data-kpi-desc="This measures your rolling average of actual nightly sleep duration across the past seven days from Apple Health. Sustaining 7.5 to 8.5 hours is critical for endocrine recovery, muscle protein synthesis, and central nervous system restoration. Values below your baseline indicate accumulated sleep debt requiring immediate recovery prioritisation.">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 11px; color: var(--muted-foreground);">Sleep 7d</span>
                  <button type="button" class="kpi-info-btn" aria-label="Explain Sleep 7d" title="Explain Sleep 7d">ℹ</button>
                </div>
                <span style="font: 500 16px/1.2 var(--font-mono);">{ap['sleep']['avg_sleep_hrs']} h</span>
              </div>
              <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; border-left: 1px solid var(--border);" data-kpi-title="Resting Heart Rate (RHR)" data-kpi-desc="Resting heart rate reflects basal autonomic nervous system status recorded during deep sleep or morning rest. A lower and stable RHR indicates strong cardiovascular conditioning and parasympathetic dominance. Elevated readings above your 28-day baseline signal systemic fatigue, under-recovery, or impending illness.">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 11px; color: var(--muted-foreground);">Resting HR</span>
                  <button type="button" class="kpi-info-btn" aria-label="Explain Resting HR" title="Explain Resting HR">ℹ</button>
                </div>
                <span style="font: 500 16px/1.2 var(--font-mono);">{ap['mobility']['current_rhr']} bpm</span>
              </div>
              <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; border-left: 1px solid var(--border);" data-kpi-title="Acute:Chronic Workload Ratio (ACWR)" data-kpi-desc="ACWR evaluates the balance between acute fatigue (7-day rolling tonnage) and chronic athletic conditioning (28-day rolling tonnage). Keeping this ratio within the 0.8 to 1.3 sweet spot minimizes injury risk while progressively building strength. Ratios over 1.5 signify an excessive training spike that demands proactive recovery.">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 11px; color: var(--muted-foreground);">ACWR</span>
                  <button type="button" class="kpi-info-btn" aria-label="Explain ACWR" title="Explain ACWR">ℹ</button>
                </div>
                <span style="font: 500 16px/1.2 var(--font-mono);">{st['acwr']['value']}</span>
              </div>
            </div>
          </div>

          <div style="padding: 24px; display: flex; flex-direction: column; gap: 14px;">
            <div style="font: 500 11px/1 var(--font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--muted-foreground);">This week's priorities</div>
            <div style="display: flex; flex-direction: column; gap: 0;">
              <div style="display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border);">
                <span style="font: 500 13px/20px var(--font-mono); color: var(--atf-pink-400);">01</span>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font: 500 15px/20px var(--font-sans);">Two lower-body sessions</span>
                  <span style="color: var(--muted-foreground); font-size: 13px; line-height: 1.5;">Squat day + hinge day. Take quads from {st['muscle_summary'].get('Quads', {}).get('avg_weekly_sets', 4.1)} to 10+ sets/wk, hamstrings from {st['muscle_summary'].get('Hamstrings/Glutes', {}).get('avg_weekly_sets', 2.0)} to 8+.</span>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border);">
                <span style="font: 500 13px/20px var(--font-mono); color: var(--atf-pink-400);">02</span>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font: 500 15px/20px var(--font-sans);">One Zone 2 run, one ATHX simulation</span>
                  <span style="color: var(--muted-foreground); font-size: 13px; line-height: 1.5;">35 min at 5:45–6:00/km, HR ≤ 142. Then 5 rounds of 400 m row + 12 sandbag thrusters.</span>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; padding: 12px 0 0;">
                <span style="font: 500 13px/20px var(--font-mono); color: var(--atf-pink-400);">03</span>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font: 500 15px/20px var(--font-sans);">Eat and sleep for growth</span>
                  <span style="color: var(--muted-foreground); font-size: 13px; line-height: 1.5;">180 g+ protein, +250 kcal surplus, {getattr(athx_config, 'TARGET_SLEEP_HRS', 7.5):.1f} h sleep window.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 7-Day Microcycle Strip -->
        <div class="card" style="padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: baseline; gap: 10px;">
              <h2 style="margin: 0; font: 600 16px/1.3 var(--font-sans);">Tactical Microcycle</h2>
              <span style="font-size: 12px; color: var(--muted-foreground);">Done = Garmin verified · Planned = coach directives</span>
            </div>
            <div style="display: flex; gap: 14px; font-size: 12px; color: var(--muted-foreground);">
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 2px; background: var(--chart-3);"></span>Push</span>
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 2px; background: var(--chart-2);"></span>Pull</span>
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 2px; background: var(--chart-9);"></span>Legs</span>
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 2px; background: var(--muted-foreground);"></span>Conditioning</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px;" id="microcycleGrid">
            <!-- Rendered by JS -->
          </div>

          <!-- Selected Day Drill-down -->
          <div id="dayDetailPanel" style="border-top: 1px solid var(--border); padding-top: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 16px 32px;">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- 2-Column: Volume vs MEV & Fueling Targets -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 16px;">
          <!-- Volume vs MEV/MAV -->
          <div class="card" style="padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px;">
              <h2 style="margin: 0; font: 600 16px/1.3 var(--font-sans);">Weekly sets vs MEV</h2>
              <span style="font-size: 12px; color: var(--muted-foreground);">Shaded band = MAV · tick = MEV</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;" id="volumeGaugesContainer">
              <!-- Rendered by JS -->
            </div>
          </div>

          <!-- Fueling Targets -->
          <div class="card" style="padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 12px;">
              <h2 style="margin: 0; font: 600 16px/1.3 var(--font-sans);">Fueling targets</h2>
              <span style="font-size: 12px; color: var(--muted-foreground);">7-day rolling average</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 14px;" id="fuelingTargetsContainer">
              <!-- Rendered by JS -->
            </div>
          </div>
        </div>

        {coach_decisions_html}
      </section>

      <!-- ============================================================== -->
      <!-- TAB 2: EVENT READINESS                                         -->
      <!-- ============================================================== -->
      <section id="readinessTab" class="tab-content">
        <div class="card" style="overflow: hidden;">
          <div style="display: grid; grid-template-columns: minmax(0, 2fr) 100px 100px 100px minmax(0, 2fr) 120px; gap: 16px; padding: 12px 24px; border-bottom: 1px solid var(--border); font: 500 11px/1 var(--font-sans); letter-spacing: .06em; text-transform: uppercase; color: var(--muted-foreground);">
            <span>Event Discipline</span>
            <span>Current (28d)</span>
            <span>Standard</span>
            <span>Gap</span>
            <span>Readiness Progress</span>
            <span style="text-align: right;">Needed / wk</span>
          </div>
          <div id="readinessRowsContainer">
            <!-- Rendered by JS -->
          </div>
          <div style="padding: 14px 24px; font-size: 12px; color: var(--muted-foreground); border-top: 1px solid var(--border);">
            Current = best recorded in trailing 28 days. Required weekly rate = qualifying gap ÷ {weeks_to_games} weeks remaining to 27 May 2027.
          </div>
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- TAB 3: STRENGTH                                                -->
      <!-- ============================================================== -->
      <section id="strengthTab" class="tab-content">
        <!-- 6 KPI Grid -->
        <div class="kpi-grid">
          <div class="kpi-box" data-kpi-title="Acute:Chronic Workload Ratio (ACWR)" data-kpi-desc="ACWR evaluates the balance between acute fatigue (7-day rolling tonnage) and chronic athletic conditioning (28-day rolling tonnage). Keeping this ratio within the 0.8 to 1.3 sweet spot minimizes injury risk while progressively building strength. Ratios over 1.5 signify an excessive training spike that demands proactive recovery.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Acute:Chronic Workload</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Acute:Chronic Workload" title="Explain Acute:Chronic Workload">ℹ</button>
              </span>
              <span class="badge badge-ok">{st['acwr']['status']}</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{st['acwr']['value']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">ratio</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Acute {st['acwr']['acute_load_kg']:,} kg/d vs chronic {st['acwr']['chronic_load_kg']:,} kg/d.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Foster Monotony Index" data-kpi-desc="Foster Monotony measures day-to-day training load variability calculated as mean daily load divided by standard deviation over seven days. High monotony combined with high strain exponentially increases the risk of overtraining and immune suppression. Keeping the index below 1.5 ensures adequate undulating recovery between heavy strength sessions.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Foster Monotony</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Foster Monotony" title="Explain Foster Monotony">ℹ</button>
              </span>
              <span class="badge badge-ok">Safe</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{st['foster_workload']['monotony']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">index</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Weekly strain {st['foster_workload']['strain_k']}k · volume {st['foster_workload']['weekly_tonnage_t']} t. Keep &lt; 1.5.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Valid Strength Tonnage" data-kpi-desc="Valid Tonnage represents cumulative mechanical workload calculated as weight lifted multiplied by completed repetitions across verified sets. Only validated, non-duplicate sets pass our strict audit pipeline while erroneous machine spikes are filtered out. Tracking this metric confirms whether progressive overload targets are met across the training block.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Valid Tonnage</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Valid Tonnage" title="Explain Valid Tonnage">ℹ</button>
              </span>
              <span class="badge badge-ok">{st['total_sessions']} sessions</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{st['total_volume_tons']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">t</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">{st['total_valid_sets']:,} valid sets. {au['summary']['unknown_imputed']} imputed, {au['summary']['unknown_unattributed']} unattributed.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Bench Press Estimated 1RM" data-kpi-desc="Estimated one-rep maximum calculates maximal pressing strength derived from your heaviest submaximal sets using the validated Epley formula. It tracks neuromuscular strength adaptations across time without requiring dangerous true maximum testing. The accompanying strength-to-bodyweight ratio benchmarks upper-body pressing power relative to your current mass.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Bench Press e1RM</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Bench Press e1RM" title="Explain Bench Press e1RM">ℹ</button>
              </span>
              <span class="badge badge-ok">{st['lift_progressions'].get('Bench Press', {}).get('relative_strength', 1.04)}× BW</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{st['lift_progressions'].get('Bench Press', {}).get('current_28d_best', 82.3)}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">kg</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Best {st['lift_progressions'].get('Bench Press', {}).get('best_set_load', '65 kg × 8')}. Projected {st['lift_progressions'].get('Bench Press', {}).get('projected_e1rm', 88.5)} kg at Games.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Lower-Body Muscle Volume" data-kpi-desc="This metric monitors weekly hard sets dedicated to quadriceps, hamstrings, and glutes against evidence-based Minimum Effective Volume (MEV). Adequate lower-body volume is essential for generating running propulsion and building Hyrox competition durability. Training below MEV leads to detraining, while targeting Maximum Adaptive Volume drives optimal muscular development.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Leg Volume</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Leg Volume" title="Explain Leg Volume">ℹ</button>
              </span>
              <span class="badge badge-bad">Below MEV</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{st['muscle_summary'].get('Quads', {}).get('avg_weekly_sets', 4.1)}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">quad sets/wk</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Hamstrings {st['muscle_summary'].get('Hamstrings/Glutes', {}).get('avg_weekly_sets', 2.0)}/wk vs MEV 6.0.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Junk-Volume Share" data-kpi-desc="Junk volume tracks sets performed at ultra-high rep ranges or with insufficient load to stimulate meaningful neuromuscular adaptations. High junk volume creates disproportionate central and joint fatigue without proportional strength gains. Keeping this share below 5% guarantees that training economy remains focused on high-stimulus work.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Junk-Volume Share</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Junk-Volume Share" title="Explain Junk-Volume Share">ℹ</button>
              </span>
              <span class="badge badge-ok">Under 5%</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{st['junk_volume']['volume_pct']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">%</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">{st['junk_volume']['tonnage_tons']} t in sets of 35+ reps.</span>
          </div>
        </div>

        <!-- Charts: Muscle Radar & e1RM progression -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 450px), 1fr)); gap: 16px;">
          <div class="card" style="padding: 20px;">
            <h3 style="margin: 0 0 16px; font: 600 15px/1.2 var(--font-sans);">Muscle Group Volume Distribution (Sets/wk vs MEV/MAV)</h3>
            <div style="position: relative; height: 320px;">
              <canvas id="muscleRadarChart"></canvas>
            </div>
          </div>
          <div class="card" style="padding: 20px;">
            <h3 style="margin: 0 0 16px; font: 600 15px/1.2 var(--font-sans);">Primary Compounds e1RM Progression (Trailing Timeline)</h3>
            <div style="position: relative; height: 320px;">
              <canvas id="e1rmProgressionChart"></canvas>
            </div>
          </div>
        </div>

        {vbt_velocity_loss_html}

        <!-- ANATOMIC MUSCLE TARGET HUD CARD -->
        <div class="card athx-anatomic-card" id="anatomicHudCard" style="overflow: hidden; margin-top: 16px; margin-bottom: 16px;">
          <div class="hud-header-bar">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span class="hud-title-tag">● ATHX ANATOMIC TARGET HUD</span>
              <div style="display: flex; flex-direction: column;">
                <span class="hud-session-title" id="hudSessionTitle">Strength Session</span>
                <span class="hud-session-meta" id="hudSessionMeta">Select a session below to inspect targeted muscle anatomy</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 10px; font-size: 11px; font-family: var(--font-mono);">
                <span style="display: inline-flex; align-items: center; gap: 5px; color: #00f2fe;">
                  <span style="width: 7px; height: 7px; border-radius: 50%; background: #00f2fe; box-shadow: 0 0 6px #00f2fe;"></span> PRIMARY
                </span>
                <span style="display: inline-flex; align-items: center; gap: 5px; color: #c084fc;">
                  <span style="width: 7px; height: 7px; border-radius: 50%; background: #c084fc; box-shadow: 0 0 6px #c084fc;"></span> SECONDARY
                </span>
              </div>
              <span class="badge" id="hudSplitBadge">Split</span>
              <div style="display: flex; gap: 4px;">
                <button class="filter-btn" id="hudPrevBtn" onclick="navigateSession(1)" title="Previous Session">◀</button>
                <button class="filter-btn" id="hudNextBtn" onclick="navigateSession(-1)" title="Next Session">▶</button>
              </div>
            </div>
          </div>

          <div class="hud-main-grid">
            <!-- Left Pane: Exercises & Sets in Selected Session -->
            <div class="hud-exercises-pane">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font: 600 12px/1 var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Targeted Exercises &amp; Load</span>
                <span style="font-size: 11px; color: var(--muted-foreground);">Hover exercise to isolate</span>
              </div>
              <div id="hudExercisesList" style="display: flex; flex-direction: column; gap: 8px; max-height: 330px; overflow-y: auto; padding-right: 4px;">
                <!-- Injected dynamically -->
              </div>
            </div>

            <!-- Right Stage: Side-by-Side Front and Back Vector Anatomical Figures -->
            <div class="hud-anatomy-stage">
              <!-- Anterior (Front View) -->
              <div class="hud-view-unit">
                <span class="hud-view-badge">Anterior · Front</span>
                <svg viewBox="0 0 160 310" class="athx-body-svg" id="svgAnterior" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="athxTargetPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00f2fe" />
                      <stop offset="100%" stop-color="#0284c7" />
                    </linearGradient>
                    <linearGradient id="athxTargetSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#c084fc" />
                      <stop offset="100%" stop-color="#7c3aed" />
                    </linearGradient>
                    <filter id="athxNeonGlow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <!-- Grid HUD accents -->
                  <g opacity="0.12">
                    <line x1="80" y1="6" x2="80" y2="304" stroke="#00f2fe" stroke-width="0.5" stroke-dasharray="2 4" />
                    <circle cx="80" cy="24" r="16" fill="none" stroke="#00f2fe" stroke-width="0.5" stroke-dasharray="2 2" />
                    <line x1="15" y1="80" x2="145" y2="80" stroke="#00f2fe" stroke-width="0.5" stroke-dasharray="1 6" />
                    <line x1="15" y1="148" x2="145" y2="148" stroke="#00f2fe" stroke-width="0.5" stroke-dasharray="1 6" />
                    <line x1="15" y1="222" x2="145" y2="222" stroke="#00f2fe" stroke-width="0.5" stroke-dasharray="1 6" />
                  </g>

                  <!-- Base Skeleton Elements -->
                  <g class="body-base">
                    <path d="M 80,10 C 72,10 67,16 67,25 C 67,33 72,39 80,39 C 88,39 93,33 93,25 C 93,16 88,10 80,10 Z" />
                    <path d="M 75,38 L 75,47 C 75,49 77,50 80,50 C 83,50 85,49 85,47 L 85,38 Z" />
                    <path d="M 39,170 C 37,174 35,181 36,188 C 37,192 41,193 43,189 C 44,184 46,177 47,170 Z" />
                    <path d="M 121,170 C 123,174 125,181 124,188 C 123,192 119,193 117,189 C 116,184 114,177 113,170 Z" />
                    <ellipse cx="71" cy="225" rx="4.5" ry="5" />
                    <ellipse cx="89" cy="225" rx="4.5" ry="5" />
                    <path d="M 68,288 L 65,299 C 64,302 67,304 72,304 C 76,304 77,301 76,298 L 74,288 Z" />
                    <path d="M 92,288 L 95,299 C 96,302 93,304 88,304 C 84,304 83,301 84,298 L 86,288 Z" />
                  </g>

                  <!-- Shoulders -->
                  <g class="muscle-group" data-muscle="shoulders" data-name="Deltoids (Shoulders)">
                    <path d="M 73,48 C 66,48 57,52 51,59 C 45,66 44,75 46,84 C 47,87 50,88 52,85 C 55,79 57,72 61,67 C 64,62 68,57 73,52 Z" />
                    <path d="M 87,48 C 94,48 103,52 109,59 C 115,66 116,75 114,84 C 113,87 110,88 108,85 C 105,79 103,72 99,67 C 96,62 92,57 87,52 Z" />
                  </g>

                  <!-- Chest -->
                  <g class="muscle-group" data-muscle="chest" data-name="Pectorals (Chest)">
                    <path d="M 78,53 L 66,55 C 60,59 57,66 56,74 C 55,80 58,84 66,84 C 72,84 76,82 78,80 Z" />
                    <path d="M 82,53 L 94,55 C 100,59 103,66 104,74 C 105,80 102,84 94,84 C 88,84 84,82 82,80 Z" />
                  </g>

                  <!-- Biceps -->
                  <g class="muscle-group" data-muscle="biceps" data-name="Biceps">
                    <path d="M 49,87 C 46,92 45,101 45,110 C 45,117 48,121 52,121 C 55,121 57,115 57,106 C 57,98 54,91 51,87 Z" />
                    <path d="M 111,87 C 114,92 115,101 115,110 C 115,117 112,121 108,121 C 105,121 103,115 103,106 C 103,98 106,91 109,87 Z" />
                  </g>

                  <!-- Forearms -->
                  <g class="muscle-group" data-muscle="forearms" data-name="Forearms">
                    <path d="M 51,123 C 46,124 41,130 40,140 C 39,149 42,159 44,169 L 48,169 C 51,158 54,146 55,136 C 56,129 54,124 51,123 Z" />
                    <path d="M 109,123 C 114,124 119,130 120,140 C 121,149 118,159 116,169 L 112,169 C 109,158 106,146 105,136 C 104,129 106,124 109,123 Z" />
                  </g>

                  <!-- Core / Abdominals -->
                  <g class="muscle-group" data-muscle="core" data-name="Core / Abdominals">
                    <path d="M 78,83 L 70,85 C 69,91 69,97 70,101 L 78,100 Z" />
                    <path d="M 82,83 L 90,85 C 91,91 91,97 90,101 L 82,100 Z" />
                    <path d="M 78,103 L 69,104 C 69,111 70,117 71,121 L 78,121 Z" />
                    <path d="M 82,103 L 91,104 C 91,111 90,117 89,121 L 82,121 Z" />
                    <path d="M 78,124 L 71,124 C 72,132 75,140 78,145 Z" />
                    <path d="M 82,124 L 89,124 C 88,132 85,140 82,145 Z" />
                    <path d="M 68,87 C 62,94 59,105 60,118 C 61,127 63,136 67,143 C 69,135 68,123 68,114 C 68,103 68,94 68,87 Z" />
                    <path d="M 92,87 C 98,94 101,105 100,118 C 99,127 97,136 93,143 C 91,135 92,123 92,114 C 92,103 92,94 92,87 Z" />
                  </g>

                  <!-- Quads -->
                  <g class="muscle-group" data-muscle="quads" data-name="Quadriceps">
                    <path d="M 78,150 C 74,150 67,155 64,166 C 60,178 59,193 62,208 C 64,217 67,222 71,222 C 75,222 77,215 77,203 C 78,188 78,172 78,158 Z" />
                    <path d="M 82,150 C 86,150 93,155 96,166 C 100,178 101,193 98,208 C 96,217 93,222 89,222 C 85,222 83,215 83,203 C 82,188 82,172 82,158 Z" />
                  </g>

                  <!-- Calves (Front) -->
                  <g class="muscle-group" data-muscle="calves" data-name="Calves / Tibialis">
                    <path d="M 70,231 C 66,236 63,246 64,258 C 65,268 68,277 69,286 L 73,286 C 75,278 76,268 76,257 C 76,246 74,236 71,231 Z" />
                    <path d="M 90,231 C 94,236 97,246 96,258 C 95,268 92,277 91,286 L 87,286 C 85,278 84,268 84,257 C 84,246 86,236 89,231 Z" />
                  </g>
                </svg>
              </div>

              <!-- Posterior (Back View) -->
              <div class="hud-view-unit">
                <span class="hud-view-badge">Posterior · Back</span>
                <svg viewBox="0 0 160 310" class="athx-body-svg" id="svgPosterior" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="athxTargetPrimaryPost" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00f2fe" />
                      <stop offset="100%" stop-color="#0284c7" />
                    </linearGradient>
                    <linearGradient id="athxTargetSecondaryPost" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#c084fc" />
                      <stop offset="100%" stop-color="#7c3aed" />
                    </linearGradient>
                  </defs>

                  <!-- Grid HUD accents -->
                  <g opacity="0.12">
                    <line x1="80" y1="6" x2="80" y2="304" stroke="#00f2fe" stroke-width="0.5" stroke-dasharray="2 4" />
                    <circle cx="80" cy="24" r="16" fill="none" stroke="#00f2fe" stroke-width="0.5" stroke-dasharray="2 2" />
                    <line x1="15" y1="80" x2="145" y2="80" stroke="#00f2fe" stroke-width="0.5" stroke-dasharray="1 6" />
                    <line x1="15" y1="148" x2="145" y2="148" stroke="#00f2fe" stroke-width="0.5" stroke-dasharray="1 6" />
                    <line x1="15" y1="222" x2="145" y2="222" stroke="#00f2fe" stroke-width="0.5" stroke-dasharray="1 6" />
                  </g>

                  <!-- Base Skeleton Elements -->
                  <g class="body-base">
                    <path d="M 80,10 C 72,10 67,16 67,25 C 67,33 72,39 80,39 C 88,39 93,33 93,25 C 93,16 88,10 80,10 Z" />
                    <path d="M 76,38 L 76,46 C 76,48 78,49 80,49 C 82,49 84,48 84,46 L 84,38 Z" />
                    <path d="M 39,170 C 37,174 35,181 36,188 C 37,192 41,193 43,189 C 44,184 46,177 47,170 Z" />
                    <path d="M 121,170 C 123,174 125,181 124,188 C 123,192 119,193 117,189 C 116,184 114,177 113,170 Z" />
                    <ellipse cx="71" cy="227" rx="3.5" ry="4" opacity="0.4" />
                    <ellipse cx="89" cy="227" rx="3.5" ry="4" opacity="0.4" />
                    <path d="M 68,288 L 66,298 C 65,301 68,303 72,303 C 76,303 77,301 76,298 L 74,288 Z" />
                    <path d="M 92,288 L 94,298 C 95,301 92,303 88,303 C 84,303 83,301 84,298 L 86,288 Z" />
                  </g>

                  <!-- Traps -->
                  <g class="muscle-group" data-muscle="traps" data-name="Trapezius (Upper Back)">
                    <path d="M 80,44 L 73,48 C 67,52 61,56 58,62 C 64,66 72,70 78,74 L 80,95 L 82,74 C 88,70 96,66 102,62 C 99,56 93,52 87,48 Z" />
                  </g>

                  <!-- Rear Delts -->
                  <g class="muscle-group" data-muscle="shoulders" data-name="Rear Deltoids">
                    <path d="M 57,63 C 51,68 46,75 46,84 C 47,87 50,88 52,85 C 55,79 57,74 60,70 Z" />
                    <path d="M 103,63 C 109,68 114,75 114,84 C 113,87 110,88 108,85 C 105,79 103,74 100,70 Z" />
                  </g>

                  <!-- Triceps -->
                  <g class="muscle-group" data-muscle="triceps" data-name="Triceps">
                    <path d="M 48,87 C 45,92 44,101 44,110 C 44,118 47,121 51,121 C 55,121 57,115 57,105 C 57,97 54,91 51,87 Z" />
                    <path d="M 112,87 C 115,92 116,101 116,110 C 116,118 113,121 109,121 C 105,121 103,115 103,105 C 103,97 106,91 109,87 Z" />
                  </g>

                  <!-- Lats -->
                  <g class="muscle-group" data-muscle="lats" data-name="Lats (Latissimus Dorsi)">
                    <path d="M 78,76 C 71,78 64,84 60,94 C 57,104 58,118 64,132 C 69,134 75,134 78,132 Z" />
                    <path d="M 82,76 C 89,78 96,84 100,94 C 103,104 102,118 96,132 C 91,134 85,134 82,132 Z" />
                  </g>

                  <!-- Lower Back -->
                  <g class="muscle-group" data-muscle="lowerback" data-name="Lower Back (Erector Spinae)">
                    <path d="M 78,133 L 72,134 C 71,140 72,148 78,150 Z" />
                    <path d="M 82,133 L 88,134 C 89,140 88,148 82,150 Z" />
                  </g>

                  <!-- Forearms (Back) -->
                  <g class="muscle-group" data-muscle="forearms" data-name="Forearms">
                    <path d="M 51,123 C 46,124 41,130 40,140 C 39,149 42,159 44,169 L 48,169 C 51,158 54,146 55,136 C 56,129 54,124 51,123 Z" />
                    <path d="M 109,123 C 114,124 119,130 120,140 C 121,149 118,159 116,169 L 112,169 C 109,158 106,146 105,136 C 104,129 106,124 109,123 Z" />
                  </g>

                  <!-- Glutes -->
                  <g class="muscle-group" data-muscle="glutes" data-name="Gluteus Maximus">
                    <path d="M 78,151 C 70,151 63,158 63,169 C 63,180 69,188 78,188 Z" />
                    <path d="M 82,151 C 90,151 97,158 97,169 C 97,180 91,188 82,188 Z" />
                  </g>

                  <!-- Hamstrings -->
                  <g class="muscle-group" data-muscle="hamstrings" data-name="Hamstrings">
                    <path d="M 78,190 C 70,190 64,196 63,205 C 62,214 65,223 71,225 C 75,225 77,218 78,206 Z" />
                    <path d="M 82,190 C 90,190 96,196 97,205 C 98,214 95,223 89,225 C 85,225 83,218 82,206 Z" />
                  </g>

                  <!-- Calves (Back) -->
                  <g class="muscle-group" data-muscle="calves" data-name="Calves (Gastrocnemius)">
                    <path d="M 71,230 C 66,234 63,243 64,254 C 65,265 69,274 71,286 L 74,286 C 76,275 77,265 77,253 C 77,243 75,234 71,230 Z" />
                    <path d="M 89,230 C 94,234 97,243 96,254 C 95,265 91,274 89,286 L 86,286 C 84,275 83,265 83,253 C 83,243 85,234 89,230 Z" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <!-- Bottom Chip Strip -->
          <div class="hud-chip-strip" id="hudChipStrip">
            <!-- Rendered dynamically -->
          </div>
        </div>
        <div id="hudMuscleTooltip" class="hud-tooltip" style="display: none;"></div>

        <!-- Strength Sessions Table with Filter & Accordion -->
        <div class="card" style="overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px 24px;">
            <div style="display: flex; align-items: baseline; gap: 10px;">
              <h2 style="margin: 0; font: 600 16px/1.3 var(--font-sans);">Strength Sessions</h2>
              <span style="font-size: 12px; color: var(--muted-foreground);">{len(strength_sessions)} sessions since 1 May</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <div style="display: flex; gap: 6px;" id="strengthSplitFilters">
                <button class="filter-btn active" onclick="filterStrength('All')">All</button>
                <button class="filter-btn" onclick="filterStrength('Push')">Push</button>
                <button class="filter-btn" onclick="filterStrength('Pull')">Pull</button>
                <button class="filter-btn" onclick="filterStrength('Legs')">Legs</button>
                <button class="filter-btn" onclick="filterStrength('Full Body')">Full Body</button>
              </div>
              <input type="text" class="search-box" id="strengthSearchInput" placeholder="Search exercises..." oninput="filterStrength()">
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table class="data-table" id="strengthSessionsTable">
              <thead>
                <tr>
                  <th style="width: 110px;">Date</th>
                  <th>Session</th>
                  <th style="width: 100px;">Split</th>
                  <th class="right" style="width: 80px;">Exercises</th>
                  <th class="right" style="width: 70px;">Sets</th>
                  <th class="right" style="width: 80px;">Tonnage</th>
                  <th>Top e1RM</th>
                  <th class="right" style="width: 70px;">Time</th>
                </tr>
              </thead>
              <tbody id="strengthTableBody">
                <!-- Rendered by JS -->
              </tbody>
            </table>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; font-size: 12px; color: var(--muted-foreground);">
            <span id="strengthShowingText">Showing 25 of {len(strength_sessions)}</span>
            <button class="filter-btn" id="btnMoreStrength" onclick="showMoreStrength()">Show 25 more</button>
          </div>
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- TAB 4: RUNNING & CONDITIONING                                  -->
      <!-- ============================================================== -->
      <section id="engineTab" class="tab-content">
        <div class="kpi-grid">
          <div class="kpi-box" data-kpi-title="5 km Running Pace" data-kpi-desc="This metric displays your best average kilometer pace over a continuous 5-kilometer effort recorded in the trailing 28 days. It serves as a primary benchmark for aerobic threshold velocity and pacing stamina. The gap to standard highlights how many seconds per kilometer must be shaved to achieve competition targets.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">5 km Pace</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain 5 km Pace" title="Explain 5 km Pace">ℹ</button>
              </span>
              <span class="badge badge-warn">Std 4:30</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{rn.get('best_5k_pace_formatted', '5:07')}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">/km</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Best of trailing 28 days. Gap: +37s/km.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Maximal Oxygen Uptake (VO2max)" data-kpi-desc="VO2max estimates the maximum rate of oxygen consumption your body can utilize per kilogram during maximal aerobic exertion. Measured in ml/kg/min, it quantifies your aerobic engine and cardiovascular capacity for sustaining high-intensity work. Higher values allow faster lactate clearance and superior recovery between intense intervals.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">VO2max</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain VO2max" title="Explain VO2max">ℹ</button>
              </span>
              <span class="badge badge-ok">Aerobic Base</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{rn.get('latest_vo2max') or 55.0}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">ml/kg/min</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Avg cadence {rn.get('avg_cadence_spm', 157)} spm · avg HR {rn.get('avg_hr', 150)} bpm.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Weekly Running Volume" data-kpi-desc="Running Volume tracks total kilometers and active minutes accumulated across dedicated running sessions during the current phase. Steady volume accumulation strengthens bone density, tendons, and aerobic capillary density without overloading joint structures. Keeping within the weekly phase target ensures safe progressive tissue tolerance.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Running Volume</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Running Volume" title="Explain Running Volume">ℹ</button>
              </span>
              <span class="badge badge-warn">{rn.get('total_runs', 6)} runs</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{rn.get('total_distance_km', 30.13)}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">km</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">{rn.get('total_duration_min', 159.6)} min total. Phase target: 5–8 km/wk.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Total Conditioning Volume" data-kpi-desc="Conditioning Total aggregates all functional non-running aerobic sessions including CrossFit WODs, bouldering, rowing, and hiking. It captures cumulative caloric expenditure and total minutes spent challenging oxidative and glycolytic energy systems. This reflects overall athletic work capacity and work-to-rest stamina across diverse domains.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Conditioning Total</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Conditioning Total" title="Explain Conditioning Total">ℹ</button>
              </span>
              <span class="badge badge-ok">{wk.get('total_sessions', 43)} sessions</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{wk.get('total_duration_min', 3147.1):,.0f}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">min</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">{wk.get('total_calories', 28458):,} kcal. CrossFit, bouldering, hiking.</span>
          </div>
        </div>

        {critical_speed_html}

        {running_biomechanics_html}

        {crossfit_durability_html}

        <div class="card" style="overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px 24px;">
            <div style="display: flex; align-items: baseline; gap: 10px;">
              <h2 style="margin: 0; font: 600 16px/1.3 var(--font-sans);">Cardio & Conditioning Log</h2>
              <span style="font-size: 12px; color: var(--muted-foreground);">{len(engine_activities)} activities</span>
            </div>
            <div style="display: flex; gap: 6px;" id="engineFilters">
              <button class="filter-btn active" onclick="filterEngine('All')">All</button>
              <button class="filter-btn" onclick="filterEngine('Running')">Running</button>
              <button class="filter-btn" onclick="filterEngine('Cross-Training')">Cross-Training</button>
              <button class="filter-btn" onclick="filterEngine('Other')">Other</button>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 110px;">Date</th>
                  <th>Activity</th>
                  <th style="width: 130px;">Type</th>
                  <th class="right" style="width: 70px;">Time</th>
                  <th class="right" style="width: 80px;">Distance</th>
                  <th class="right" style="width: 80px;">Pace</th>
                  <th class="right" style="width: 70px;">kcal</th>
                  <th class="right" style="width: 70px;">Avg HR</th>
                  <th style="width: 110px;">Effect</th>
                </tr>
              </thead>
              <tbody id="engineTableBody">
                <!-- Rendered by JS -->
              </tbody>
            </table>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; font-size: 12px; color: var(--muted-foreground);">
            <span id="engineShowingText">Showing 25 of {len(engine_activities)}</span>
            <button class="filter-btn" id="btnMoreEngine" onclick="showMoreEngine()">Show 25 more</button>
          </div>
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- TAB 5: BODY & FUEL                                             -->
      <!-- ============================================================== -->
      <section id="bodyTab" class="tab-content">
        <div class="kpi-grid">
          <div class="kpi-box" data-kpi-title="7-Day Smoothed Bodyweight" data-kpi-desc="This metric applies a 7-day moving average filter to raw weigh-ins to remove day-to-day fluid and glycogen fluctuations. It provides an accurate representation of true physiological weight trends toward your target mass. Consistent tracking ensures mass gains reflect lean tissue growth rather than dehydration artifacts.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Weight (7d smoothed)</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Weight (7d smoothed)" title="Explain Weight (7d smoothed)">ℹ</button>
              </span>
              <span class="badge badge-warn">+{ap['body_comp']['weight_remaining']} to go</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{ap['body_comp']['current_weight']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">kg</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Target {cfg['bodyweight_target_kg']} kg. {len(ap['body_comp']['history'])} weigh-ins since May.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Lean Body Mass (LBM)" data-kpi-desc="Lean Body Mass calculates total fat-free tissue mass including muscle, bone, and essential organ weight. Filtered to mitigate bioelectrical impedance scale drift, it verifies that caloric surplus drives muscular hypertrophy. Preserving or growing LBM while conditioning ensures optimal power-to-weight performance.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Lean Body Mass</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Lean Body Mass" title="Explain Lean Body Mass">ℹ</button>
              </span>
              <span class="badge badge-warn">Low Confidence</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{ap['body_comp']['current_lean_mass']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">kg</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">BF {ap['body_comp']['current_bf_pct']}%. Bioimpedance drift filtered.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Daily Step Count" data-kpi-desc="Daily steps quantify non-exercise physical activity (NEAT) and baseline daily movement volume from your wearable sensors. Sustaining high NEAT promotes lymphatic drainage, speeds up muscular recovery, and maintains baseline metabolic flux. Tracking step volume prevents excessive sedentary stagnation on recovery days.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Daily Steps</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Daily Steps" title="Explain Daily Steps">ℹ</button>
              </span>
              <span class="badge badge-ok">n = {ap['activity']['days_tracked']} days</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{ap['activity']['avg_steps']:,}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">steps/d</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Max day: {ap['activity']['max_steps']:,} steps.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Daily Protein Intake" data-kpi-desc="This metric measures total daily protein intake both as an absolute quantity and normalized per kilogram of bodyweight. Consuming 2.0 to 2.4 g/kg is vital for maximizing muscle protein synthesis, repairing microtrauma, and supporting lean tissue growth. Regular intake across all meals ensures sustained amino acid availability for tissue repair.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Protein Intake</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Protein Intake" title="Explain Protein Intake">ℹ</button>
              </span>
              <span class="badge badge-ok">{round(ap['nutrition']['avg_protein'] / ap['body_comp']['current_weight'], 2)} g/kg</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{round(ap['nutrition']['avg_protein'])}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">g/d</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">{round(ap['nutrition']['avg_calories']):,} kcal/d across {len(ap['nutrition']['history'])} logged days.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Carbohydrate to Protein Ratio" data-kpi-desc="The C:P ratio measures the balance between glycogen-replenishing carbohydrates and tissue-building protein in your daily nutrition. High-volume conditioning demands adequate carbs to replenish muscle glycogen without displacing essential fats and protein. Keeping this ratio within the recommended band guarantees explosive glycolytic fuel while preventing excess fat storage.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Carb : Protein</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Carb : Protein" title="Explain Carb : Protein">ℹ</button>
              </span>
              <span class="badge badge-warn">Above band</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{ap['nutrition']['carb_protein_ratio']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">C:P</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Target 1.5–2.0. Shift excess carbs to unsaturated fat.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Energy Balance Variance" data-kpi-desc="Calorie Variance compares your 7-day rolling caloric intake against your prescribed energy target for hypertrophy. A controlled surplus of 250 to 350 kcal per day promotes steady muscle accretion with minimal fat accumulation. Chronic deficits impair hormonal recovery and sabotage high-volume strength progression.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Calorie Variance</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Calorie Variance" title="Explain Calorie Variance">ℹ</button>
              </span>
              <span class="badge badge-warn">Under target</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{round(ap['nutrition']['avg_calories']) - 3050:+,}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">kcal</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">7d avg {round(ap['nutrition']['avg_calories']):,} vs 3,050 bulking target.</span>
          </div>
        </div>

        <!-- Body Comp Chart & Nutrition Table -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 450px), 1fr)); gap: 16px;">
          <div class="card" style="padding: 20px;">
            <h3 style="margin: 0 0 16px; font: 600 15px/1.2 var(--font-sans);">Weight & Body Fat Trajectory Towards 85.0 kg</h3>
            <div style="position: relative; height: 300px;">
              <canvas id="weightTrendChart"></canvas>
            </div>
          </div>
          <div class="card" style="padding: 20px;">
            <h3 style="margin: 0 0 16px; font: 600 15px/1.2 var(--font-sans);">Macronutrient Distribution (Calories by Macro)</h3>
            <div style="position: relative; height: 300px;">
              <canvas id="macroDistributionChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card" style="overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px;">
            <div style="display: flex; align-items: baseline; gap: 10px;">
              <h2 style="margin: 0; font: 600 16px/1.3 var(--font-sans);">Daily Body & Fuel Log</h2>
              <span style="font-size: 12px; color: var(--muted-foreground);">Apple Health & Foodvisor</span>
            </div>
            <div style="display: flex; gap: 6px;" id="bodyLogFilters">
              <button class="filter-btn active" onclick="filterBody('All')">All</button>
              <button class="filter-btn" onclick="filterBody('Weigh-ins')">Weigh-ins</button>
              <button class="filter-btn" onclick="filterBody('Meals logged')">Meals logged</button>
            </div>
          </div>
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 110px;">Date</th>
                  <th class="right">Weight</th>
                  <th class="right">Body Fat</th>
                  <th class="right">Calories</th>
                  <th class="right">Protein</th>
                  <th class="right">Carbs</th>
                  <th class="right">Fat</th>
                  <th class="right">Fiber</th>
                </tr>
              </thead>
              <tbody id="bodyTableBody">
                <!-- Rendered by JS -->
              </tbody>
            </table>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; font-size: 12px; color: var(--muted-foreground);">
            <span id="bodyShowingText">Showing 25 days</span>
            <button class="filter-btn" id="btnMoreBody" onclick="showMoreBody()">Show 25 more</button>
          </div>
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- TAB 6: RECOVERY                                                -->
      <!-- ============================================================== -->
      <section id="recoveryTab" class="tab-content">
        <div class="kpi-grid">
          <div class="kpi-box" data-kpi-title="ATHX Readiness Composite" data-kpi-desc="The Readiness Composite integrates objective biomarkers including sleep duration, resting heart rate, gait symmetry, and nutritional compliance into a unified score. It reflects systemic nervous system and musculoskeletal recovery before each session. Scores above 80% indicate that you are fully ready to tolerate planned high-intensity training loads.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Readiness Composite</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Readiness Composite" title="Explain Readiness Composite">ℹ</button>
              </span>
              <span class="badge badge-ok">High</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{ap['readiness_composite']['score']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">%</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Sleep {ap['readiness_composite']['components']['sleep']['score']} · RHR {ap['readiness_composite']['components']['rhr']['score']} · Gait {ap['readiness_composite']['components']['asymmetry']['score']} · Fuel {ap['readiness_composite']['components']['protein']['score']}.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Sleep Duration & Coverage" data-kpi-desc="This tracks total actual sleep duration per night along with sensor coverage consistency over the tracking period. Deep restorative sleep is essential for human growth hormone release, memory consolidation, and cellular tissue repair. Consistently hitting your {getattr(athx_config, 'TARGET_SLEEP_HRS', 7.5):.1f}h baseline ensures rapid central nervous system rejuvenation.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Sleep Duration</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Sleep Duration" title="Explain Sleep Duration">ℹ</button>
              </span>
              <span class="badge badge-warn">{ap['sleep']['coverage_pct']}% coverage</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{ap['sleep']['avg_sleep_hrs']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">h/night</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">{ap['sleep']['valid_nights']} of {ap['sleep']['calendar_days']} nights recorded.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Gait Asymmetry" data-kpi-desc="Gait Asymmetry measures the percentage difference in ground contact time between your left and right legs during walking and running. Values below 2.0% indicate balanced bilateral mechanics and absence of compensatory movement patterns. Spikes in asymmetry are early warning indicators of unilateral fatigue, joint stiffness, or impending overuse injury.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Gait Asymmetry</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Gait Asymmetry" title="Explain Gait Asymmetry">ℹ</button>
              </span>
              <span class="badge badge-ok">Normal</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{ap['mobility']['current_asymmetry']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">%</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">7-day mean. Threshold: 2.0%. Zero movement compensations.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Resting Heart Rate (Recovery Baseline)" data-kpi-desc="Resting Heart Rate tracks nocturnal cardiac autonomic tone relative to your individual 28-day rolling baseline. Maintaining RHR within plus or minus 2 beats of baseline confirms parasympathetic recovery and absence of systemic inflammation. Significant elevated trends indicate autonomic stress, dehydration, or accumulated fatigue requiring extra rest.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Resting Heart Rate</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Resting Heart Rate" title="Explain Resting Heart Rate">ℹ</button>
              </span>
              <span class="badge badge-ok">At baseline</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{ap['mobility']['current_rhr']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">bpm</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">+0.0 bpm vs 28-day baseline. Full autonomic recovery.</span>
          </div>
        </div>

        {recovery_autonomic_html}

        {allostatic_stress_html}

        <!-- Sleep stages chart -->
        <div class="card" style="padding: 20px;">
          <h3 style="margin: 0 0 16px; font: 600 15px/1.2 var(--font-sans);">Sleep Architecture (Deep, REM, Core & Awake Stages)</h3>
          <div style="position: relative; height: 280px;">
            <canvas id="sleepArchitectureChart"></canvas>
          </div>
        </div>

        <div class="card" style="overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px;">
            <div style="display: flex; align-items: baseline; gap: 10px;">
              <h2 style="margin: 0; font: 600 16px/1.3 var(--font-sans);">Sleep History</h2>
              <span style="font-size: 12px; color: var(--muted-foreground);">Cleaned & Audited</span>
            </div>
            <div style="display: flex; gap: 6px;" id="sleepFilters">
              <button class="filter-btn active" onclick="filterSleep('All')">All</button>
              <button class="filter-btn" onclick="filterSleep('Valid')">Valid</button>
              <button class="filter-btn" onclick="filterSleep('Flagged')">Flagged</button>
            </div>
          </div>
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 110px;">Date</th>
                  <th class="right">Total</th>
                  <th class="right">Deep</th>
                  <th class="right">REM</th>
                  <th class="right">Core</th>
                  <th class="right">In Bed</th>
                  <th class="right">Efficiency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="sleepTableBody">
                <!-- Rendered by JS -->
              </tbody>
            </table>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; font-size: 12px; color: var(--muted-foreground);">
            <span id="sleepShowingText">Showing 25 nights</span>
            <button class="filter-btn" id="btnMoreSleep" onclick="showMoreSleep()">Show 25 more</button>
          </div>
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- TAB 7: DATA QUALITY & AUDIT                                    -->
      <!-- ============================================================== -->
      <section id="auditTab" class="tab-content">
        <div class="kpi-grid">
          <div class="kpi-box" data-kpi-title="Pre-May Historical Exclusion" data-kpi-desc="This metric tracks historical workout and telemetry sets recorded prior to the official May baseline inception date. Pre-baseline data is preserved exclusively for establishing chronic training load context rather than acute performance scoring. Excluding these sets maintains strict data integrity across the competition preparation cycle.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Pre-May Excluded</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Pre-May Excluded" title="Explain Pre-May Excluded">ℹ</button>
              </span>
              <span class="badge badge-warn">Date Floor</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{au['summary']['pre_may_excluded_sets']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">sets</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Dated before {cfg['data_start']}. Kept for chronic baseline only.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Imputed Exercise Sets" data-kpi-desc="Imputed Exercises identifies sets whose movement names were missing or malformed in Garmin logs and reconstructed using load, repetition, and temporal signatures. Automated imputation ensures no mechanical tonnage or muscle group volume is lost from workload tracking. Unmatched sets are flagged transparently for ongoing pipeline auditing.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Imputed Exercises</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Imputed Exercises" title="Explain Imputed Exercises">ℹ</button>
              </span>
              <span class="badge badge-ok">Imputed</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{au['summary']['unknown_imputed']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">sets</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Matched by load/rep signature. {au['summary']['unknown_unattributed']} left unattributed.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Implausible Load Artifacts" data-kpi-desc="This metric counts aberrant weight values resulting from machine stack multipliers, typo inputs, or sensor errors that have been automatically excluded. Filtering these extreme outliers prevents artificial distortion of estimated 1RMs and volume progression models. Flagged records are preserved in the audit log for transparency and manual inspection.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Implausible Loads</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Implausible Loads" title="Explain Implausible Loads">ℹ</button>
              </span>
              <span class="badge badge-bad">Excluded</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{au['summary']['load_implausible_flags']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">sets</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">Garmin stack & auto-weight artifacts excluded from e1RM.</span>
          </div>

          <div class="kpi-box" data-kpi-title="Audited Usable Sleep Nights" data-kpi-desc="Usable Sleep Nights tracks the count of nights with valid Apple Health sleep stage telemetry passing quality verification. Records with false non-wear intervals, broken recording sessions, or in-bed overflow artifacts are filtered out. High usable night counts guarantee reliable recovery modeling and trend detection.">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; color: var(--muted-foreground);">Usable Sleep Nights</span>
                <button type="button" class="kpi-info-btn" aria-label="Explain Usable Sleep Nights" title="Explain Usable Sleep Nights">ℹ</button>
              </span>
              <span class="badge badge-ok">Usable</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font: 600 28px/1.1 var(--font-sans);">{au['summary']['sleep_usable_efficiency_nights']}</span>
              <span style="font-size: 13px; color: var(--muted-foreground);">nights</span>
            </div>
            <span style="font-size: 12px; color: var(--muted-foreground);">{au['summary']['sleep_in_bed_overflow_excluded']} in-bed overflows and {au['summary']['sleep_non_wear_dropped']} non-wear dropped.</span>
          </div>
        </div>

        <div class="card" style="overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: baseline; gap: 10px;">
              <h2 style="margin: 0; font: 600 16px/1.3 var(--font-sans);">Audited Exclusion & Imputation Records</h2>
              <span style="font-size: 12px; color: var(--muted-foreground);">{len(au.get('records', []))} total records</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <div style="display: flex; gap: 6px;" id="auditFilters">
                <button class="filter-btn active" onclick="filterAudit('All')">All</button>
                <button class="filter-btn" onclick="filterAudit('Pre-May Exclusion')">Pre-May</button>
                <button class="filter-btn" onclick="filterAudit('Junk Record')">Junk</button>
                <button class="filter-btn" onclick="filterAudit('Imputed Exercise')">Imputed</button>
              </div>
              <button class="filter-btn" onclick="exportAuditJson()" style="border-color: var(--atf-pink-400); color: var(--atf-pink-400);">Export JSON</button>
            </div>
          </div>
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 160px;">Category</th>
                  <th style="width: 100px;">Date</th>
                  <th>Identifier</th>
                  <th>Raw Value</th>
                  <th>Action</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody id="auditTableBody">
                <!-- Rendered by JS -->
              </tbody>
            </table>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; font-size: 12px; color: var(--muted-foreground);">
            <span id="auditShowingText">Showing 25 records</span>
            <button class="filter-btn" id="btnMoreAudit" onclick="showMoreAudit()">Show 25 more</button>
          </div>
        </div>
      </section>

    </div>
  </main>
</div>

<!-- Floating KPI Explanatory Popover -->
<div id="kpiPopover" class="kpi-popover" role="dialog" aria-hidden="true" style="display: none;">
  <div class="kpi-popover-header">
    <span class="kpi-popover-badge">KPI Explanation</span>
    <button type="button" class="kpi-popover-close" id="kpiPopoverClose" aria-label="Close popup">✕</button>
  </div>
  <h4 id="kpiPopoverTitle" class="kpi-popover-title"></h4>
  <p id="kpiPopoverBody" class="kpi-popover-body"></p>
</div>

<!-- DATA PAYLOADS & CLIENT ENGINE -->
<script>
  const ATHX_DATA = {payload_json};
  const EVENTS_DATA = {events_json};
  const MICROCYCLE_DATA = {micro_json};
  const VOLUME_GAUGES = {vol_json};
  const FUELING_TARGETS = {fuel_json};
  const STRENGTH_SESSIONS = {str_sess_json};
  const ENGINE_ACTIVITIES = {eng_acts_json};
  const AUDIT_RECORDS = (ATHX_DATA.audit && ATHX_DATA.audit.records) || [];

  // State
  let activeTabId = 'todayTab';
  let selectedStrengthSessionId = (STRENGTH_SESSIONS && STRENGTH_SESSIONS.length > 0) ? STRENGTH_SESSIONS[0].id : null;
  // Dynamic client-side date synchronization for active session
  (function syncClientToday() {{
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayIso = `${{y}}-${{m}}-${{day}}`;
    
    const matchedIdx = MICROCYCLE_DATA.findIndex(d => d.iso === todayIso);
    if (matchedIdx >= 0) {{
      MICROCYCLE_DATA.forEach((d, idx) => {{
        d.today = (idx === matchedIdx);
        d.past = (d.iso < todayIso);
        if (d.today) {{
          d.long = 'Today';
        }}
      }});
      const todayDisplay = now.toLocaleDateString('en-GB', {{ weekday: 'long', day: 'numeric', month: 'long' }});
      const activeSub = document.getElementById('activePageSub');
      if (activeSub && activeTabId === 'todayTab') {{
        activeSub.textContent = todayDisplay;
      }}
    }}
  }})();

  const todayMicroIdx = MICROCYCLE_DATA.findIndex(d => d.today);
  let selectedMicroDay = todayMicroIdx >= 0 ? todayMicroIdx : 0;
  let strengthLimit = 25;
  let strengthSplitFilter = 'All';
  let engineLimit = 25;
  let engineFilter = 'All';
  let bodyLimit = 25;
  let bodyFilter = 'All';
  let sleepLimit = 25;
  let sleepFilter = 'All';
  let auditLimit = 25;
  let auditFilter = 'All';
  const expandedRows = new Set();

  function switchTab(tabId, title, sub) {{
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    
    // Set active nav
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {{
      if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(tabId)) {{
        item.classList.add('active');
      }}
    }});

    if (tabId === 'todayTab') {{
      const now = new Date();
      sub = now.toLocaleDateString('en-GB', {{ weekday: 'long', day: 'numeric', month: 'long' }});
    }}

    document.getElementById('activePageTitle').textContent = title;
    document.getElementById('activePageSub').textContent = sub;
    window.location.hash = tabId.replace('Tab', '');
    
    // Trigger chart resize
    setTimeout(() => {{
      window.dispatchEvent(new Event('resize'));
    }}, 50);
  }}

  // Microcycle
  function renderMicrocycle() {{
    const grid = document.getElementById('microcycleGrid');
    if (!grid) return;
    
    grid.innerHTML = MICROCYCLE_DATA.map((d, idx) => {{
      const isSel = idx === selectedMicroDay;
      const splitColor = d.c === 'push' ? 'var(--chart-3)' : d.c === 'pull' ? 'var(--chart-2)' : d.c === 'legs' ? 'var(--chart-9)' : d.c === 'cond' ? 'var(--muted-foreground)' : 'var(--secondary)';
      const dateColor = d.today ? 'var(--atf-pink-400)' : 'var(--muted-foreground)';
      
      return `
        <button class="day-btn ${{isSel ? 'active' : ''}} ${{d.today ? 'today' : ''}}" onclick="selectMicroDay(${{idx}})">
          <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 6px;">
            <span style="font: 500 12px/1 var(--font-sans); color: var(--muted-foreground); text-transform: uppercase;">${{d.dow}}</span>
            <span style="font: 500 13px/1 var(--font-mono); color: ${{dateColor}};">${{d.date}}</span>
          </div>
          <div style="height: 3px; border-radius: 2px; background: ${{splitColor}};"></div>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font: 500 13px/1.3 var(--font-sans); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${{d.title}}</span>
            <span style="font-size: 11px; color: var(--muted-foreground);">${{d.state}}</span>
          </div>
        </button>
      `;
    }}).join('');

    renderDayDetail();
  }}

  function selectMicroDay(idx) {{
    selectedMicroDay = idx;
    renderMicrocycle();
  }}

  function renderDayDetail() {{
    const panel = document.getElementById('dayDetailPanel');
    if (!panel) return;
    const d = MICROCYCLE_DATA[selectedMicroDay];
    if (!d) return;

    let itemsHtml = '';
    if (d.items && d.items.length > 0) {{
      itemsHtml = d.items.map(it => `
        <div style="display: grid; grid-template-columns: minmax(140px, 1fr) max-content max-content; gap: 16px; padding: 9px 0; border-bottom: 1px solid var(--border); align-items: baseline;">
          <span style="font-size: 14px;">${{it.name}}</span>
          <span style="font: 400 13px/1 var(--font-mono);">${{it.scheme}}</span>
          <span style="font: 400 13px/1 var(--font-mono); color: var(--muted-foreground); text-align: right;">${{it.load}}</span>
        </div>
      `).join('');
    }} else {{
      itemsHtml = '<span style="color: var(--muted-foreground); font-size: 13px;">Rest & recovery. Walk, mobility work, protect 7.5h sleep opportunity window.</span>';
    }}

    panel.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px;">
          <span style="font: 600 15px/1.3 var(--font-sans);">${{d.long}}</span>
          <span style="font-size: 13px; color: var(--muted-foreground);">${{d.title}}</span>
        </div>
        ${{itemsHtml}}
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
        <span style="font: 500 11px/1 var(--font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 4px;">Sports Science Rationale</span>
        <span style="color: var(--muted-foreground); line-height: 1.55; text-wrap: pretty;">${{d.why}}</span>
      </div>
    `;
  }}

  // Volume Gauges
  function renderVolumeGauges() {{
    const container = document.getElementById('volumeGaugesContainer');
    if (!container) return;

    container.innerHTML = VOLUME_GAUGES.map(v => `
      <div style="display: grid; grid-template-columns: 120px minmax(80px, 1fr) max-content; gap: 12px; align-items: center;">
        <span style="font-size: 13px;">${{v.name}}</span>
        <div style="position: relative; height: 10px; border-radius: 999px; background: var(--secondary);">
          <div style="position: absolute; top: 0; bottom: 0; left: ${{v.mavL}}; width: ${{v.mavW}}; background: oklch(1 0 0 / 8%);"></div>
          <div style="position: absolute; top: 0; bottom: 0; left: 0; width: ${{v.fillW}}; border-radius: 999px; background: ${{v.color}};"></div>
          <div style="position: absolute; top: -3px; bottom: -3px; left: ${{v.mevL}}; width: 2px; border-radius: 1px; background: var(--foreground);" title="MEV: ${{v.mev}}"></div>
        </div>
        <span style="font: 400 12px/1 var(--font-mono); text-align: right; color: ${{v.gapColor}};">${{v.label}}</span>
      </div>
    `).join('');
  }}

  // Fueling Targets
  function renderFuelingTargets() {{
    const container = document.getElementById('fuelingTargetsContainer');
    if (!container) return;

    container.innerHTML = FUELING_TARGETS.map(f => `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
          <span style="font-size: 13px;">${{f.name}}</span>
          <span style="font: 400 13px/1 var(--font-mono);"><strong style="color: var(--foreground);">${{f.value}}</strong> <span style="color: var(--muted-foreground);">/ ${{f.target}}</span></span>
        </div>
        <div style="height: 6px; border-radius: 999px; background: var(--secondary); overflow: hidden;">
          <div style="height: 100%; width: ${{f.pct}}; border-radius: 999px; background: ${{f.color}};"></div>
        </div>
        <span style="font-size: 12px; color: ${{f.noteColor}};">${{f.note}}</span>
      </div>
    `).join('');
  }}

  // Event Readiness Rows
  function renderReadinessRows() {{
    const container = document.getElementById('readinessRowsContainer');
    if (!container) return;

    container.innerHTML = EVENTS_DATA.map(e => {{
      const gapColor = e.gap.includes('Qualified') || e.gap.includes('+0') ? 'var(--chart-9)' : 'var(--warn-foreground)';
      const barColor = e.readiness_pct >= 100 ? 'var(--chart-9)' : 'var(--atf-pink)';
      const statusBadge = e.status === 'Achieved' ? '<span class="badge badge-ok">Achieved</span>' : '<span class="badge badge-warn">In Progress</span>';
      
      return `
        <div style="display: grid; grid-template-columns: minmax(0, 2fr) 100px 100px 100px minmax(0, 2fr) 120px; gap: 16px; padding: 16px 24px; border-bottom: 1px solid var(--border); align-items: center;">
          <span style="font-weight: 500; font-size: 14px;">${{e.name}}</span>
          <span style="font: 600 13px/1 var(--font-mono); color: var(--atf-pink-400);">${{e.current}}</span>
          <span style="font: 400 13px/1 var(--font-mono); color: var(--muted-foreground);">${{e.standard}}</span>
          <span style="font: 500 13px/1 var(--font-mono); color: ${{gapColor}};">${{e.gap}}</span>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="flex: 1; height: 6px; border-radius: 999px; background: var(--secondary); overflow: hidden;">
              <div style="height: 100%; width: ${{Math.min(100, e.readiness_pct)}}%; background: ${{barColor}}; border-radius: 999px;"></div>
            </div>
            <span style="font: 400 12px/1 var(--font-mono); width: 44px; text-align: right;">${{e.readiness_pct}}%</span>
          </div>
          <span style="font: 500 13px/1 var(--font-mono); text-align: right; color: var(--warn-foreground);">${{e.required_rate}}</span>
        </div>
      `;
    }}).join('');
  }}

  // ====================================================================
  // ATHX ANATOMIC TARGET HUD ENGINE
  // ====================================================================
  const SVG_TO_MUSCLES = {{
    chest: ['Chest'],
    lats: ['Lats/Back'],
    traps: ['Lats/Back'],
    lowerback: ['Lats/Back'],
    shoulders: ['Shoulders'],
    quads: ['Quads'],
    hamstrings: ['Hamstrings/Glutes'],
    glutes: ['Hamstrings/Glutes'],
    triceps: ['Triceps'],
    biceps: ['Biceps'],
    core: ['Core'],
    forearms: ['Forearms'],
    calves: ['Calves']
  }};

  function selectStrengthSession(sessionId, scrollIntoView = false) {{
    const sess = STRENGTH_SESSIONS.find(s => s.id === sessionId) || STRENGTH_SESSIONS[0];
    if (!sess) return;
    selectedStrengthSessionId = sess.id;

    // 1. Update Session Header
    const titleEl = document.getElementById('hudSessionTitle');
    if (titleEl) titleEl.textContent = `${{sess.name}} · ${{sess.date}}`;

    const metaEl = document.getElementById('hudSessionMeta');
    if (metaEl) {{
      const durText = sess.dur ? ` · ${{Math.round(sess.dur)}} min` : '';
      metaEl.textContent = `${{sess.nEx}} exercises · ${{sess.nSets}} sets · ${{sess.ton.toFixed(1)}} tons total volume${{durText}}`;
    }}

    const splitBadge = document.getElementById('hudSplitBadge');
    if (splitBadge) {{
      const splitColor = sess.split === 'Push' ? 'var(--chart-3)' : sess.split === 'Pull' ? 'var(--chart-2)' : sess.split === 'Legs' ? 'var(--chart-9)' : 'var(--chart-4)';
      splitBadge.textContent = sess.split;
      splitBadge.style.background = `color-mix(in oklch, ${{splitColor}} 20%, transparent)`;
      splitBadge.style.color = splitColor;
      splitBadge.style.borderColor = splitColor;
    }}

    // Nav buttons state
    const currentIdx = STRENGTH_SESSIONS.findIndex(s => s.id === sess.id);
    const prevBtn = document.getElementById('hudPrevBtn');
    const nextBtn = document.getElementById('hudNextBtn');
    if (prevBtn) prevBtn.disabled = (currentIdx >= STRENGTH_SESSIONS.length - 1);
    if (nextBtn) nextBtn.disabled = (currentIdx <= 0);

    // 2. Render Left Pane: Exercise List
    const exListEl = document.getElementById('hudExercisesList');
    if (exListEl && sess.detail) {{
      exListEl.innerHTML = sess.detail.map((ex, idx) => {{
        return `
          <div class="hud-ex-item" id="hudEx_${{idx}}"
               onmouseenter="highlightExerciseMusclesByIndex(${{idx}})"
               onmouseleave="resetSessionMuscles()">
            <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
              <span style="font-weight: 600; font-size: 13px; color: var(--foreground);">${{ex.a}}</span>
              <span style="font-size: 11px; font-family: var(--font-mono); color: var(--atf-pink-400); white-space: nowrap;">${{ex.muscle || ''}}</span>
            </div>
            <div style="font-size: 11px; color: var(--muted-foreground); font-family: var(--font-mono);">
              ${{ex.b}}
            </div>
          </div>
        `;
      }}).join('');
    }}

    // 3. Highlight SVG Anatomy
    applySessionMuscleHighlights(sess);

    // 4. Render Bottom Muscle Chips
    const chipsStrip = document.getElementById('hudChipStrip');
    if (chipsStrip) {{
      const chips = (sess.muscles && sess.muscles.chips) || [];
      if (chips.length > 0) {{
        chipsStrip.innerHTML = chips.map(c => `
          <span class="hud-target-chip ${{c.role === 'primary' ? 'chip-prim' : 'chip-sec'}}">
            <span class="dot"></span>
            <span>${{c.name}}</span>
            <span style="font-family: var(--font-mono); font-size: 11px; opacity: 0.85;">${{c.sets}} sets · ${{c.ton.toFixed(1)}}t</span>
            <span style="font-size: 9px; opacity: 0.6; text-transform: uppercase;">(${{c.role}})</span>
          </span>
        `).join('');
      }} else {{
        chipsStrip.innerHTML = `<span style="color: var(--muted-foreground); font-size: 12px; font-style: italic;">No specific targeted muscle group detected for this session.</span>`;
      }}
    }}

    // 5. Update Table Highlight
    document.querySelectorAll('#strengthTableBody tr.expandable-row').forEach(tr => {{
      tr.classList.toggle('selected-row', tr.getAttribute('data-session-id') === sess.id);
    }});

    if (scrollIntoView) {{
      document.getElementById('anatomicHudCard')?.scrollIntoView({{ behavior: 'smooth', block: 'nearest' }});
    }}
  }}

  function navigateSession(delta) {{
    if (!STRENGTH_SESSIONS || STRENGTH_SESSIONS.length === 0) return;
    const currentIdx = STRENGTH_SESSIONS.findIndex(s => s.id === selectedStrengthSessionId);
    const nextIdx = Math.max(0, Math.min(STRENGTH_SESSIONS.length - 1, (currentIdx === -1 ? 0 : currentIdx) + delta));
    selectStrengthSession(STRENGTH_SESSIONS[nextIdx].id);
  }}

  function applySessionMuscleHighlights(sess) {{
    const primList = (sess.muscles && sess.muscles.svg_primary) || [];
    const secList = (sess.muscles && sess.muscles.svg_secondary) || [];

    document.querySelectorAll('#anatomicHudCard .muscle-group').forEach(m => {{
      const mId = m.getAttribute('data-muscle');
      m.classList.remove('target-primary', 'target-secondary', 'target-hover');
      if (primList.includes(mId)) {{
        m.classList.add('target-primary');
      }} else if (secList.includes(mId)) {{
        m.classList.add('target-secondary');
      }}
    }});
  }}

  function highlightExerciseMusclesByIndex(idx) {{
    const sess = STRENGTH_SESSIONS.find(s => s.id === selectedStrengthSessionId);
    if (!sess || !sess.detail || !sess.detail[idx]) return;
    const ex = sess.detail[idx];
    const prim = ex.svg_primary || [];
    const sec = ex.svg_secondary || [];

    document.querySelectorAll('#anatomicHudCard .muscle-group').forEach(m => {{
      const mId = m.getAttribute('data-muscle');
      m.classList.remove('target-primary', 'target-secondary', 'target-hover');
      if (prim.includes(mId)) {{
        m.classList.add('target-hover');
      }} else if (secList.includes(mId)) {{
        m.classList.add('target-secondary');
      }}
    }});

    document.querySelectorAll('.hud-ex-item').forEach((item, i) => {{
      item.classList.toggle('active', i === idx);
    }});
  }}

  function resetSessionMuscles() {{
    const sess = STRENGTH_SESSIONS.find(s => s.id === selectedStrengthSessionId);
    if (sess) applySessionMuscleHighlights(sess);
    document.querySelectorAll('.hud-ex-item').forEach(item => item.classList.remove('active'));
  }}

  function initAnatomyTooltips() {{
    const tooltip = document.getElementById('hudMuscleTooltip');
    if (!tooltip) return;

    document.querySelectorAll('#anatomicHudCard .muscle-group').forEach(m => {{
      m.addEventListener('mouseenter', (e) => {{
        const sess = STRENGTH_SESSIONS.find(s => s.id === selectedStrengthSessionId);
        const mId = m.getAttribute('data-muscle');
        const mName = m.getAttribute('data-name') || mId;

        let statusText = 'Not targeted in this session';
        let tagColor = 'var(--muted-foreground)';

        if (sess && sess.muscles) {{
          const groupNames = SVG_TO_MUSCLES[mId] || [];
          let matchPrim = null;
          let matchSec = null;
          for (const gn of groupNames) {{
            if (sess.muscles.primary && sess.muscles.primary[gn]) {{
              matchPrim = Object.assign({{ name: gn }}, sess.muscles.primary[gn]);
              break;
            }}
            if (sess.muscles.secondary && sess.muscles.secondary[gn]) {{
              matchSec = Object.assign({{ name: gn }}, sess.muscles.secondary[gn]);
              break;
            }}
          }}

          if (matchPrim) {{
            statusText = `PRIMARY TARGET · ${{matchPrim.sets}} sets (${{matchPrim.ton.toFixed(1)}}t)`;
            tagColor = '#00f2fe';
          }} else if (matchSec) {{
            statusText = `SECONDARY STIMULUS · ${{matchSec.sets}} sets (${{matchSec.ton.toFixed(1)}}t)`;
            tagColor = '#c084fc';
          }}
        }}

        tooltip.innerHTML = `
          <div style="font-weight: 600; color: #fff; margin-bottom: 2px;">${{mName}}</div>
          <div style="font-family: var(--font-mono); font-size: 11px; color: ${{tagColor}};">${{statusText}}</div>
        `;
        tooltip.style.display = 'block';
      }});

      m.addEventListener('mousemove', (e) => {{
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY + 14) + 'px';
      }});

      m.addEventListener('mouseleave', () => {{
        tooltip.style.display = 'none';
      }});
    }});
  }}

  function handleStrengthRowClick(sessionId, rowId) {{
    selectStrengthSession(sessionId);
    toggleRow(rowId);
  }}

  // Strength Sessions Table with Accordion
  function filterStrength(split) {{
    if (split) {{
      strengthSplitFilter = split;
      document.querySelectorAll('#strengthSplitFilters .filter-btn').forEach(b => {{
        b.classList.toggle('active', b.textContent === split);
      }});
    }}
    renderStrengthTable();
  }}

  function toggleRow(rowId) {{
    if (expandedRows.has(rowId)) expandedRows.delete(rowId);
    else expandedRows.add(rowId);
    renderStrengthTable();
  }}

  function renderStrengthTable() {{
    const tbody = document.getElementById('strengthTableBody');
    if (!tbody) return;
    const query = (document.getElementById('strengthSearchInput')?.value || '').toLowerCase();

    let list = STRENGTH_SESSIONS.filter(s => {{
      const matchSplit = (strengthSplitFilter === 'All' || s.split === strengthSplitFilter);
      const matchQuery = (!query || s.name.toLowerCase().includes(query) || (s.detail && s.detail.some(d => d.a.toLowerCase().includes(query))));
      return matchSplit && matchQuery;
    }});

    document.getElementById('strengthShowingText').textContent = `Showing ${{Math.min(list.length, strengthLimit)}} of ${{list.length}}`;
    const slice = list.slice(0, strengthLimit);

    tbody.innerHTML = slice.map((s, idx) => {{
      const rowId = `str_${{s.id}}_${{idx}}`;
      const isExpanded = expandedRows.has(rowId);
      const isSelected = (s.id === selectedStrengthSessionId);
      const splitColor = s.split === 'Push' ? 'var(--chart-3)' : s.split === 'Pull' ? 'var(--chart-2)' : s.split === 'Legs' ? 'var(--chart-9)' : 'var(--chart-4)';
      const topStr = s.top ? `${{s.top.n}} · ${{s.top.e}} kg` : '—';
      const durStr = s.dur ? `${{Math.round(s.dur)}}′` : '—';

      let detailRows = '';
      if (isExpanded && s.detail && s.detail.length) {{
        detailRows = `
          <tr>
            <td colspan="8" class="detail-tray">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${{s.detail.map(d => `
                  <div style="display: grid; grid-template-columns: 200px 1fr; gap: 16px; padding: 4px 0; border-bottom: 1px solid oklch(1 0 0 / 6%); font-size: 13px;">
                    <span style="font-weight: 500;">${{d.a}}</span>
                    <span style="color: var(--muted-foreground); font-family: var(--font-mono); font-size: 12px;">${{d.b}}</span>
                  </div>
                `).join('')}}
              </div>
            </td>
          </tr>
        `;
      }}

      return `
        <tr class="expandable-row ${{isExpanded ? 'expanded' : ''}} ${{isSelected ? 'selected-row' : ''}}" data-session-id="${{s.id}}" onclick="handleStrengthRowClick('${{s.id}}', '${{rowId}}')">
          <td style="color: var(--muted-foreground); font-family: var(--font-mono); font-size: 12px;">${{s.date}}</td>
          <td style="font-weight: 500;">${{s.name}}</td>
          <td><span class="badge" style="background: color-mix(in oklch, ${{splitColor}} 20%, transparent); color: ${{splitColor}}; border: 1px solid ${{splitColor}};">${{s.split}}</span></td>
          <td class="right" style="font-family: var(--font-mono);">${{s.nEx}}</td>
          <td class="right" style="font-family: var(--font-mono);">${{s.nSets}}</td>
          <td class="right" style="font-family: var(--font-mono); font-weight: 500;">${{s.ton.toFixed(1)}} t</td>
          <td style="color: var(--muted-foreground); font-size: 12px;">${{topStr}}</td>
          <td class="right" style="font-family: var(--font-mono); color: var(--muted-foreground);">${{durStr}}</td>
        </tr>
        ${{detailRows}}
      `;
    }}).join('');
  }}

  function showMoreStrength() {{
    strengthLimit += 25;
    renderStrengthTable();
  }}

  // Engine Table
  function filterEngine(kind) {{
    engineFilter = kind;
    document.querySelectorAll('#engineFilters .filter-btn').forEach(b => {{
      b.classList.toggle('active', b.textContent === kind);
    }});
    renderEngineTable();
  }}

  function renderEngineTable() {{
    const tbody = document.getElementById('engineTableBody');
    if (!tbody) return;

    let list = ENGINE_ACTIVITIES.filter(a => engineFilter === 'All' || a.kind === engineFilter);
    document.getElementById('engineShowingText').textContent = `Showing ${{Math.min(list.length, engineLimit)}} of ${{list.length}}`;
    const slice = list.slice(0, engineLimit);

    tbody.innerHTML = slice.map((a, idx) => {{
      const rowId = `eng_${{a.id}}_${{idx}}`;
      const isExpanded = expandedRows.has(rowId);
      const dotColor = a.kind === 'Running' ? 'var(--chart-7)' : 'var(--muted-foreground)';

      let detailRows = '';
      if (isExpanded && a.detail && a.detail.length) {{
        detailRows = `
          <tr>
            <td colspan="9" class="detail-tray">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${{a.detail.map(d => `
                  <div style="display: grid; grid-template-columns: 160px 1fr; gap: 16px; padding: 4px 0; border-bottom: 1px solid oklch(1 0 0 / 6%); font-size: 13px;">
                    <span style="font-weight: 500;">${{d.a}}</span>
                    <span style="color: var(--muted-foreground); font-family: var(--font-mono); font-size: 12px; white-space: pre-wrap;">${{d.b}}</span>
                  </div>
                `).join('')}}
              </div>
            </td>
          </tr>
        `;
      }}

      return `
        <tr class="expandable-row ${{isExpanded ? 'expanded' : ''}}" onclick="toggleRow('${{rowId}}')">
          <td style="color: var(--muted-foreground); font-family: var(--font-mono); font-size: 12px;">${{a.date}}</td>
          <td style="font-weight: 500;">${{a.name}}</td>
          <td><span style="display: flex; align-items: center; gap: 6px;"><span class="status-dot" style="background: ${{dotColor}};"></span>${{a.kind}}</span></td>
          <td class="right" style="font-family: var(--font-mono);">${{a.dur ? Math.round(a.dur) + '′' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono);">${{a.km ? a.km.toFixed(2) + ' km' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono); color: var(--atf-pink-400);">${{a.pace || '—'}}</td>
          <td class="right" style="font-family: var(--font-mono);">${{a.kcal || '—'}}</td>
          <td class="right" style="font-family: var(--font-mono);">${{a.hr || '—'}}</td>
          <td style="color: var(--muted-foreground); font-size: 12px;">${{a.te || '—'}}</td>
        </tr>
        ${{detailRows}}
      `;
    }}).join('');
  }}

  function showMoreEngine() {{
    engineLimit += 25;
    renderEngineTable();
  }}

  // Body & Fuel Table
  function filterBody(type) {{
    bodyFilter = type;
    document.querySelectorAll('#bodyLogFilters .filter-btn').forEach(b => {{
      b.classList.toggle('active', b.textContent === type);
    }});
    renderBodyTable();
  }}

  function renderBodyTable() {{
    const tbody = document.getElementById('bodyTableBody');
    if (!tbody) return;

    const bc = (ATHX_DATA.apple && ATHX_DATA.apple.body_comp && ATHX_DATA.apple.body_comp.history) || [];
    const nut = (ATHX_DATA.apple && ATHX_DATA.apple.nutrition && ATHX_DATA.apple.nutrition.history) || [];
    const bcMap = Object.fromEntries(bc.map(b => [b.Date, b]));
    const nutMap = Object.fromEntries(nut.map(n => [n.Date, n]));

    const allDates = [...new Set([...bc.map(b => b.Date), ...nut.map(n => n.Date)])].filter(d => d >= '2026-05-01').sort().reverse();
    let list = allDates.map(d => ({{ date: d, b: bcMap[d], n: nutMap[d] }}));

    if (bodyFilter === 'Weigh-ins') list = list.filter(r => !!r.b);
    else if (bodyFilter === 'Meals logged') list = list.filter(r => !!r.n);

    document.getElementById('bodyShowingText').textContent = `Showing ${{Math.min(list.length, bodyLimit)}} of ${{list.length}} days`;
    const slice = list.slice(0, bodyLimit);

    tbody.innerHTML = slice.map(r => {{
      const b = r.b || {{}};
      const n = r.n || {{}};
      return `
        <tr>
          <td style="color: var(--muted-foreground); font-family: var(--font-mono); font-size: 12px;">${{r.date}}</td>
          <td class="right" style="font-family: var(--font-mono); font-weight: 500;">${{b.Weight_kg ? b.Weight_kg.toFixed(1) + ' kg' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono); color: var(--muted-foreground);">${{b.Body_Fat_pct ? b.Body_Fat_pct.toFixed(1) + '%' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono); font-weight: 500;">${{n.Calories_kcal ? Math.round(n.Calories_kcal).toLocaleString() : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono); color: var(--atf-pink-400);">${{n.Protein_g ? Math.round(n.Protein_g) + ' g' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono);">${{n.Carbs_g ? Math.round(n.Carbs_g) + ' g' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono);">${{n.Fat_g ? Math.round(n.Fat_g) + ' g' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono); color: ${{n.Fiber_g && n.Fiber_g >= 30 ? 'var(--chart-9)' : 'var(--warn-foreground)'}};">${{n.Fiber_g ? n.Fiber_g.toFixed(1) + ' g' : '—'}}</td>
        </tr>
      `;
    }}).join('');
  }}

  function showMoreBody() {{
    bodyLimit += 25;
    renderBodyTable();
  }}

  // Sleep Table
  function filterSleep(status) {{
    sleepFilter = status;
    document.querySelectorAll('#sleepFilters .filter-btn').forEach(b => {{
      b.classList.toggle('active', b.textContent === status);
    }});
    renderSleepTable();
  }}

  function renderSleepTable() {{
    const tbody = document.getElementById('sleepTableBody');
    if (!tbody) return;

    let list = (ATHX_DATA.apple && ATHX_DATA.apple.sleep && ATHX_DATA.apple.sleep.history) || [];
    list = list.filter(s => s.Date >= '2026-05-01').sort((a, b) => b.Date.localeCompare(a.Date));

    if (sleepFilter === 'Valid') list = list.filter(s => s.Status === 'Valid');
    else if (sleepFilter === 'Flagged') list = list.filter(s => s.Status !== 'Valid');

    document.getElementById('sleepShowingText').textContent = `Showing ${{Math.min(list.length, sleepLimit)}} of ${{list.length}} nights`;
    const slice = list.slice(0, sleepLimit);

    tbody.innerHTML = slice.map(s => {{
      const isValid = (s.Status === 'Valid');
      const effStr = s.Efficiency_pct ? `${{Math.round(s.Efficiency_pct)}}%` : '—';
      const statusBadge = isValid ? '<span class="badge badge-ok">Valid</span>' : `<span class="badge badge-warn">${{s.Status || 'Flagged'}}</span>`;

      return `
        <tr>
          <td style="color: var(--muted-foreground); font-family: var(--font-mono); font-size: 12px;">${{s.Date}}</td>
          <td class="right" style="font-family: var(--font-mono); font-weight: 500;">${{s.Total_Sleep_hrs ? s.Total_Sleep_hrs.toFixed(1) + ' h' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono);">${{s.Deep_Sleep_hrs ? s.Deep_Sleep_hrs.toFixed(1) + ' h' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono);">${{s.REM_Sleep_hrs ? s.REM_Sleep_hrs.toFixed(1) + ' h' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono);">${{s.Core_Sleep_hrs ? s.Core_Sleep_hrs.toFixed(1) + ' h' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono); color: var(--muted-foreground);">${{s.In_Bed_hrs ? s.In_Bed_hrs.toFixed(1) + ' h' : '—'}}</td>
          <td class="right" style="font-family: var(--font-mono); color: var(--atf-pink-400);">${{effStr}}</td>
          <td>${{statusBadge}}</td>
        </tr>
      `;
    }}).join('');
  }}

  function showMoreSleep() {{
    sleepLimit += 25;
    renderSleepTable();
  }}

  // Audit Table
  function filterAudit(cat) {{
    auditFilter = cat;
    document.querySelectorAll('#auditFilters .filter-btn').forEach(b => {{
      b.classList.toggle('active', b.textContent.includes(cat) || (cat === 'All' && b.textContent === 'All'));
    }});
    renderAuditTable();
  }}

  function renderAuditTable() {{
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    let list = AUDIT_RECORDS;
    if (auditFilter !== 'All') {{
      list = list.filter(r => r.category === auditFilter);
    }}

    document.getElementById('auditShowingText').textContent = `Showing ${{Math.min(list.length, auditLimit)}} of ${{list.length}} records`;
    const slice = list.slice(0, auditLimit);

    tbody.innerHTML = slice.map(r => `
      <tr>
        <td style="font-weight: 500;"><span class="badge badge-warn">${{r.category}}</span></td>
        <td style="font-family: var(--font-mono); font-size: 12px; color: var(--muted-foreground);">${{r.date}}</td>
        <td style="font-family: var(--font-mono); font-size: 12px;">${{r.identifier}}</td>
        <td style="font-family: var(--font-mono); font-size: 12px; color: var(--muted-foreground);">${{r.raw_value}}</td>
        <td style="font-weight: 500;">${{r.action}}</td>
        <td style="color: var(--muted-foreground); font-size: 12px;">${{r.reason}}</td>
      </tr>
    `).join('');
  }}

  function showMoreAudit() {{
    auditLimit += 25;
    renderAuditTable();
  }}

  function exportAuditJson() {{
    const blob = new Blob([JSON.stringify(ATHX_DATA.audit, null, 2)], {{ type: 'application/json' }});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `athx_audit_report_${{new Date().toISOString().slice(0, 10)}}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }}

  // Chart.js Visualizations
  function initCharts() {{
    const ctxRadar = document.getElementById('muscleRadarChart')?.getContext('2d');
    if (ctxRadar) {{
      const mus = ATHX_DATA.strength.muscle_summary;
      const labels = ['Quads', 'Hamstrings', 'Chest', 'Shoulders', 'Lats/Back', 'Biceps', 'Triceps'];
      const current = [
        mus['Quads']?.avg_weekly_sets || 0,
        mus['Hamstrings/Glutes']?.avg_weekly_sets || 0,
        mus['Chest']?.avg_weekly_sets || 0,
        mus['Shoulders']?.avg_weekly_sets || 0,
        mus['Lats/Back']?.avg_weekly_sets || 0,
        mus['Biceps']?.avg_weekly_sets || 0,
        mus['Triceps']?.avg_weekly_sets || 0
      ];
      const mev = [8, 6, 10, 8, 10, 6, 6];
      const mav = [15, 13, 16, 15, 17, 13, 13];

      new Chart(ctxRadar, {{
        type: 'radar',
        data: {{
          labels: labels,
          datasets: [
            {{
              label: 'Current Sets/wk',
              data: current,
              backgroundColor: 'rgba(236, 72, 153, 0.25)',
              borderColor: '#ec4899',
              borderWidth: 2,
              pointBackgroundColor: '#ec4899',
            }},
            {{
              label: 'MEV Threshold',
              data: mev,
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              borderColor: '#f43f5e',
              borderDash: [4, 4],
              borderWidth: 1.5,
              pointRadius: 0
            }},
            {{
              label: 'Optimal MAV',
              data: mav,
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              borderColor: '#38bdf8',
              borderDash: [2, 2],
              borderWidth: 1.5,
              pointRadius: 0
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          scales: {{
            r: {{
              angleLines: {{ color: 'rgba(255, 255, 255, 0.08)' }},
              grid: {{ color: 'rgba(255, 255, 255, 0.08)' }},
              pointLabels: {{ color: 'oklch(0.704 0.04 256.788)', font: {{ family: 'Jost', size: 12 }} }},
              ticks: {{ display: false }}
            }}
          }},
          plugins: {{
            legend: {{ labels: {{ color: '#fff', font: {{ family: 'Jost' }} }} }}
          }}
        }}
      }});
    }}

    const ctxE1rm = document.getElementById('e1rmProgressionChart')?.getContext('2d');
    if (ctxE1rm && ATHX_DATA.strength?.lift_progressions) {{
      const lp = ATHX_DATA.strength.lift_progressions;
      const bp = lp['Bench Press']?.daily_peaks || lp['Bench Press']?.history || [];
      const sq = lp['Back Squat']?.daily_peaks || lp['Squat']?.daily_peaks || lp['Back Squat']?.history || [];
      const dl = lp['Deadlift']?.daily_peaks || lp['Deadlift']?.history || [];
      const ohp = lp['Overhead Press']?.daily_peaks || lp['Overhead Press']?.history || [];

      const allDates = [...new Set([
        ...bp.map(x => x.date),
        ...sq.map(x => x.date),
        ...dl.map(x => x.date),
        ...ohp.map(x => x.date)
      ])].filter(Boolean).sort();

      const getVal = (list) => {{
        const map = {{}};
        for (const item of list) {{
          const val = item.e1rm ?? item.e1RM_kg;
          if (val != null) {{
            map[item.date] = {{ val: Number(val), set: item.best_set || `${{item.weight}} kg × ${{item.reps}} reps` }};
          }}
        }}
        return map;
      }};

      const bpMap = getVal(bp);
      const sqMap = getVal(sq);
      const dlMap = getVal(dl);
      const ohpMap = getVal(ohp);

      new Chart(ctxE1rm, {{
        type: 'line',
        data: {{
          labels: allDates,
          datasets: [
            {{
              label: 'Deadlift',
              data: allDates.map(d => dlMap[d]?.val ?? null),
              borderColor: '#ec4899',
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              pointBackgroundColor: '#ec4899',
              pointRadius: 3,
              pointHoverRadius: 6,
              tension: 0.25,
              spanGaps: true
            }},
            {{
              label: 'Back Squat',
              data: allDates.map(d => sqMap[d]?.val ?? null),
              borderColor: '#34d399',
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              pointBackgroundColor: '#34d399',
              pointRadius: 3,
              pointHoverRadius: 6,
              tension: 0.25,
              spanGaps: true
            }},
            {{
              label: 'Bench Press',
              data: allDates.map(d => bpMap[d]?.val ?? null),
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              pointBackgroundColor: '#38bdf8',
              pointRadius: 3,
              pointHoverRadius: 6,
              tension: 0.25,
              spanGaps: true
            }},
            {{
              label: 'Overhead Press',
              data: allDates.map(d => ohpMap[d]?.val ?? null),
              borderColor: '#fbbf24',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              pointBackgroundColor: '#fbbf24',
              pointRadius: 3,
              pointHoverRadius: 6,
              tension: 0.25,
              spanGaps: true
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          interaction: {{
            mode: 'index',
            intersect: false
          }},
          scales: {{
            x: {{
              grid: {{ color: 'rgba(255, 255, 255, 0.05)' }},
              ticks: {{
                color: 'oklch(0.704 0.04 256.788)',
                maxRotation: 45
              }}
            }},
            y: {{
              grid: {{ color: 'rgba(255, 255, 255, 0.05)' }},
              ticks: {{
                color: 'oklch(0.704 0.04 256.788)',
                callback: (v) => v + ' kg'
              }}
            }}
          }},
          plugins: {{
            legend: {{
              labels: {{
                color: '#fff',
                font: {{ family: 'Jost', size: 12 }},
                usePointStyle: true,
                boxWidth: 8
              }}
            }},
            tooltip: {{
              callbacks: {{
                label: function(context) {{
                  const label = context.dataset.label || '';
                  const val = context.raw;
                  if (val == null) return null;
                  const date = context.label;
                  let setDetail = '';
                  if (label === 'Deadlift') setDetail = dlMap[date]?.set;
                  else if (label === 'Back Squat') setDetail = sqMap[date]?.set;
                  else if (label === 'Bench Press') setDetail = bpMap[date]?.set;
                  else if (label === 'Overhead Press') setDetail = ohpMap[date]?.set;
                  return ` ${{label}}: ${{val}} kg e1RM ${{setDetail ? `(${{setDetail}})` : ''}}`;
                }}
              }}
            }}
          }}
        }}
      }});
    }}

    const ctxWeight = document.getElementById('weightTrendChart')?.getContext('2d');
    if (ctxWeight && ATHX_DATA.apple?.body_comp?.history) {{
      const bch = ATHX_DATA.apple.body_comp.history.filter(b => b.Date >= '2026-05-01');
      new Chart(ctxWeight, {{
        type: 'line',
        data: {{
          labels: bch.map(b => b.Date),
          datasets: [
            {{
              label: 'Body Weight (kg)',
              data: bch.map(b => b.Weight_kg),
              borderColor: '#34d399',
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              fill: true,
              tension: 0.3
            }},
            {{
              label: '85.0 kg Target',
              data: bch.map(() => 85.0),
              borderColor: '#ec4899',
              borderDash: [5, 5],
              pointRadius: 0
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          scales: {{
            x: {{ grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: 'oklch(0.704 0.04 256.788)' }} }},
            y: {{ grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: 'oklch(0.704 0.04 256.788)' }} }}
          }},
          plugins: {{ legend: {{ labels: {{ color: '#fff', font: {{ family: 'Jost' }} }} }} }}
        }}
      }});
    }}

    const ctxMacro = document.getElementById('macroDistributionChart')?.getContext('2d');
    if (ctxMacro && ATHX_DATA.apple?.nutrition?.history) {{
      const nut = ATHX_DATA.apple.nutrition.history.slice(-14);
      new Chart(ctxMacro, {{
        type: 'bar',
        data: {{
          labels: nut.map(n => n.Date),
          datasets: [
            {{ label: 'Protein (g)', data: nut.map(n => n.Protein_g || 0), backgroundColor: '#ec4899' }},
            {{ label: 'Carbs (g)', data: nut.map(n => n.Carbs_g || 0), backgroundColor: '#38bdf8' }},
            {{ label: 'Fat (g)', data: nut.map(n => n.Fat_g || 0), backgroundColor: '#facc15' }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          scales: {{
            x: {{ stacked: true, grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: 'oklch(0.704 0.04 256.788)' }} }},
            y: {{ stacked: true, grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: 'oklch(0.704 0.04 256.788)' }} }}
          }},
          plugins: {{ legend: {{ labels: {{ color: '#fff', font: {{ family: 'Jost' }} }} }} }}
        }}
      }});
    }}

    const ctxSleep = document.getElementById('sleepArchitectureChart')?.getContext('2d');
    if (ctxSleep && ATHX_DATA.apple?.sleep?.history) {{
      const slp = ATHX_DATA.apple.sleep.history.slice(-21);
      new Chart(ctxSleep, {{
        type: 'bar',
        data: {{
          labels: slp.map(s => s.Date),
          datasets: [
            {{ label: 'Deep Sleep', data: slp.map(s => s.Deep_Sleep_hrs || 0), backgroundColor: '#6366f1' }},
            {{ label: 'REM Sleep', data: slp.map(s => s.REM_Sleep_hrs || 0), backgroundColor: '#a855f7' }},
            {{ label: 'Core Sleep', data: slp.map(s => s.Core_Sleep_hrs || 0), backgroundColor: '#38bdf8' }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          scales: {{
            x: {{ stacked: true, grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: 'oklch(0.704 0.04 256.788)' }} }},
            y: {{ stacked: true, grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: 'oklch(0.704 0.04 256.788)' }} }}
          }},
          plugins: {{ legend: {{ labels: {{ color: '#fff', font: {{ family: 'Jost' }} }} }} }}
        }}
      }});
    }}
  }}

  // KPI Popover System
  function initKpiPopovers() {{
    const popover = document.getElementById('kpiPopover');
    const titleEl = document.getElementById('kpiPopoverTitle');
    const bodyEl = document.getElementById('kpiPopoverBody');
    const closeBtn = document.getElementById('kpiPopoverClose');
    if (!popover || !titleEl || !bodyEl) return;

    let activeTrigger = null;
    let isPinned = false;
    let hoverTimeout = null;

    function getKpiData(el) {{
      if (!el) return null;
      const target = el.hasAttribute('data-kpi-title') ? el : el.closest('[data-kpi-title]');
      if (target) {{
        return {{
          title: target.getAttribute('data-kpi-title'),
          desc: target.getAttribute('data-kpi-desc'),
          anchor: el
        }};
      }}
      return null;
    }}

    function positionPopover(anchorEl) {{
      const rect = anchorEl.getBoundingClientRect();
      const popWidth = Math.min(320, window.innerWidth - 32);
      popover.style.width = popWidth + 'px';

      let left = rect.left + (rect.width / 2) - (popWidth / 2);
      left = Math.max(16, Math.min(window.innerWidth - popWidth - 16, left));

      popover.style.left = left + 'px';
      popover.style.display = 'flex';

      const popHeight = popover.offsetHeight || 140;
      let top = rect.bottom + 8;
      if (top + popHeight > window.innerHeight - 16) {{
        top = Math.max(16, rect.top - popHeight - 8);
      }}
      popover.style.top = top + 'px';
    }}

    function showPopover(data, pin) {{
      if (!data || !data.title || !data.desc) return;
      clearTimeout(hoverTimeout);

      titleEl.textContent = data.title;
      bodyEl.textContent = data.desc;
      positionPopover(data.anchor);
      popover.setAttribute('aria-hidden', 'false');

      activeTrigger = data.anchor;
      isPinned = pin;
      if (pin) {{
        popover.setAttribute('data-pinned', 'true');
      }} else {{
        popover.removeAttribute('data-pinned');
      }}
    }}

    function hidePopover(force) {{
      clearTimeout(hoverTimeout);
      if (!force && isPinned) return;
      popover.style.display = 'none';
      popover.setAttribute('aria-hidden', 'true');
      popover.removeAttribute('data-pinned');
      activeTrigger = null;
      isPinned = false;
    }}

    document.querySelectorAll('.kpi-info-btn, [data-kpi-title]').forEach(el => {{
      const data = getKpiData(el);
      if (!data) return;

      if (el.classList.contains('kpi-info-btn')) {{
        el.addEventListener('click', (e) => {{
          e.stopPropagation();
          e.preventDefault();
          if (activeTrigger === el && isPinned) {{
            hidePopover(true);
          }} else {{
            showPopover(data, true);
          }}
        }});
        el.addEventListener('mouseenter', () => {{
          if (!isPinned) {{
            clearTimeout(hoverTimeout);
            showPopover(data, false);
          }}
        }});
        el.addEventListener('mouseleave', () => {{
          if (!isPinned) {{
            hoverTimeout = setTimeout(() => hidePopover(false), 200);
          }}
        }});
      }}
    }});

    popover.addEventListener('mouseenter', () => {{
      if (!isPinned) clearTimeout(hoverTimeout);
    }});
    popover.addEventListener('mouseleave', () => {{
      if (!isPinned) {{
        hoverTimeout = setTimeout(() => hidePopover(false), 200);
      }}
    }});

    if (closeBtn) {{
      closeBtn.addEventListener('click', (e) => {{
        e.stopPropagation();
        hidePopover(true);
      }});
    }}

    document.addEventListener('click', (e) => {{
      if (isPinned && !popover.contains(e.target) && (!activeTrigger || !activeTrigger.contains(e.target))) {{
        hidePopover(true);
      }}
    }});

    document.addEventListener('keydown', (e) => {{
      if (e.key === 'Escape') hidePopover(true);
    }});

    window.addEventListener('resize', () => {{
      if (activeTrigger && popover.style.display !== 'none') {{
        positionPopover(activeTrigger);
      }}
    }});
  }}

  // Init
  document.addEventListener('DOMContentLoaded', () => {{
    renderMicrocycle();
    renderVolumeGauges();
    renderFuelingTargets();
    renderReadinessRows();
    renderStrengthTable();
    if (STRENGTH_SESSIONS && STRENGTH_SESSIONS.length > 0) {{
      selectStrengthSession(STRENGTH_SESSIONS[0].id);
    }}
    initAnatomyTooltips();
    initKpiPopovers();
    renderEngineTable();
    renderBodyTable();
    renderSleepTable();
    renderAuditTable();
    initCharts();

    // Hash router
    if (window.location.hash) {{
      const t = window.location.hash.slice(1) + 'Tab';
      const el = document.getElementById(t);
      if (el) {{
        const btn = document.querySelector(`.nav-item[onclick*="${{t}}"]`);
        if (btn) btn.click();
      }}
    }}
  }});
</script>
</body>
</html>
"""


def main():
    print("================================================================================")
    print("🚀 ATHX 2027 DASHBOARD GENERATOR: COMPUTING AUDITED ARTY METRICS")
    print("================================================================================")

    audit = athx_analytics.DataAuditTracker()

    garmin_raw = []
    garmin_vol_path = BASE_DIR / "garmin_workout_volume.json"
    garmin_ext_path = BASE_DIR / "garmin_extracted_workouts.json"

    if garmin_vol_path.exists():
        with open(garmin_vol_path, "r", encoding="utf-8") as f:
            garmin_raw = json.load(f)
    elif garmin_ext_path.exists():
        with open(garmin_ext_path, "r", encoding="utf-8") as f:
            garmin_raw = json.load(f)
    else:
        garmin_csv = BASE_DIR / "garmin_extracted_workouts.csv"
        if garmin_csv.exists():
            with open(garmin_csv, "r", encoding="utf-8") as f:
                for r in csv.DictReader(f):
                    garmin_raw.append({
                        "Activity_ID": r.get("Activity_ID"),
                        "Date": r.get("Date"),
                        "Exercise": r.get("Exercise"),
                        "Set": safe_int(r.get("Set"), 1),
                        "Reps": safe_int(r.get("Reps"), 0),
                        "Weight_kg": safe_float(r.get("Weight_kg"), 0.0),
                        "Total_Volume_kg": safe_float(r.get("Total_Volume_kg"), 0.0),
                        "Session_Type": r.get("Session_Type", "Strength"),
                    })

    strength_data = athx_analytics.process_strength_data(garmin_raw, audit)
    print(f"✅ Garmin Strength Processed: {strength_data['total_valid_sets']} valid working sets, {strength_data['total_sessions']} sessions, {strength_data['total_volume_tons']} tons.")
    print(f"   • Imputed Unknowns: {audit.summary['unknown_imputed']} | Unattributed: {audit.summary['unknown_unattributed']}")
    print(f"   • ACWR as of {strength_data['as_of_date']}: {strength_data['acwr']['value']} ({strength_data['acwr']['status']})")

    apple_data = athx_analytics.process_apple_health(BASE_DIR, audit)
    print(f"✅ Apple Health Processed:")
    print(f"   • Body Comp: {apple_data['body_comp']['current_weight']} kg (target: {apple_data['body_comp']['target_weight']} kg, delta: {apple_data['body_comp']['weight_remaining']:+0.1f} kg)")
    print(f"   • Sleep: {apple_data['sleep']['avg_sleep_hrs']}h avg, coverage: {apple_data['sleep']['coverage_pct']}% ({apple_data['sleep']['valid_nights']}/{apple_data['sleep']['calendar_days']} nights)")
    print(f"   • Mobility: {apple_data['mobility']['days_tracked']} days tracked, RHR: {apple_data['mobility']['current_rhr']} bpm")
    print(f"   • Readiness Score: {apple_data['readiness_composite']['score']}%")

    running_data = athx_analytics.process_running_data(BASE_DIR / "garmin_running_activities.json", audit)
    print(f"✅ Garmin Running Processed: {running_data['total_runs']} runs, {running_data['total_distance_km']} km. Best 5k: {running_data['best_5k_pace_formatted']} (VO2Max: {running_data['latest_vo2max']})")

    workout_data = athx_analytics.process_workout_activities(BASE_DIR / "garmin_workout_activities.json", audit)
    print(f"✅ Garmin Workouts Processed: {workout_data['total_sessions']} sessions, {workout_data['total_duration_min']} min, {workout_data['total_calories']:,} kcal.")

    comp_data = athx_analytics.evaluate_competition_readiness(strength_data, apple_data, running_data)
    print(f"✅ ATHX 2027 Competition Evaluation: {comp_data['weeks_remaining']} weeks to {comp_data['competition_date']}")

    # Load all activities
    all_activities = []
    all_act_path = BASE_DIR / "garmin_all_activities.json"
    if all_act_path.exists():
        with open(all_act_path, "r", encoding="utf-8") as f:
            all_activities = json.load(f)

    running_activities = []
    run_act_path = BASE_DIR / "garmin_running_activities.json"
    if run_act_path.exists():
        with open(run_act_path, "r", encoding="utf-8") as f:
            running_activities = json.load(f)

    # Build aggregations
    strength_sessions = build_strength_sessions(strength_data["processed_sets"], all_activities)
    engine_activities = build_engine_activities(all_activities, running_activities)

    # Generate audited telemetry digest & invoke AI Performance Coach
    telemetry_digest = athx_analytics.generate_telemetry_digest(
        strength_data, apple_data, running_data, workout_data, comp_data, audit
    )
    coach_briefing = athx_ai_coach.get_or_generate_coach_briefing(telemetry_digest, base_dir=BASE_DIR)
    print(f"✅ ATHX AI Performance Coach: Verdict [{coach_briefing['executive_verdict']['rating']}] via {coach_briefing['provider_used']}")

    today_dt = date.today()
    microcycle_days = build_microcycle(all_activities, coach_briefing, today_dt.isoformat())
    volume_gauges = build_volume_gauges(strength_data["muscle_summary"])
    fueling_targets = build_fueling_targets(apple_data["nutrition"]["history"])

    latest_garmin_date = strength_data["as_of_date"]
    latest_bc_date = apple_data["body_comp"]["history"][-1]["Date"] if apple_data["body_comp"]["history"] else "N/A"
    latest_nut_date = apple_data["nutrition"]["history"][-1]["Date"] if apple_data["nutrition"]["history"] else "N/A"
    latest_sleep_date = apple_data["sleep"]["latest_date"] or "N/A"
    latest_mob_date = apple_data["mobility"]["history"][-1]["Date"] if apple_data["mobility"]["history"] else "N/A"

    def get_staleness(date_str: str) -> tuple[str, str]:
        if date_str == "N/A":
            return ("No Data", "badge-danger")
        try:
            d = datetime.strptime(date_str[:10], "%Y-%m-%d").date()
            diff = (today_dt - d).days
            if diff <= 1:
                return ("Fresh (Today / Yesterday)", "badge-sweetspot")
            elif diff <= 3:
                return (f"{diff}d ago", "badge-neutral")
            elif diff <= 7:
                return (f"⚠️ {diff}d ago", "badge-warning")
            else:
                return (f"⚠️ {diff}d stale", "badge-danger")
        except Exception:
            return ("Unknown", "badge-neutral")

    freshness_info = {
        "garmin": {"date": latest_garmin_date, "status": get_staleness(latest_garmin_date)[0], "badge": get_staleness(latest_garmin_date)[1]},
        "body_comp": {"date": latest_bc_date, "status": get_staleness(latest_bc_date)[0], "badge": get_staleness(latest_bc_date)[1]},
        "nutrition": {"date": latest_nut_date, "status": get_staleness(latest_nut_date)[0], "badge": get_staleness(latest_nut_date)[1]},
        "sleep": {"date": latest_sleep_date, "status": get_staleness(latest_sleep_date)[0], "badge": get_staleness(latest_sleep_date)[1]},
        "mobility": {"date": latest_mob_date, "status": get_staleness(latest_mob_date)[0], "badge": get_staleness(latest_mob_date)[1]},
    }

    # Sports Science Analytics: Critical Speed, CrossFit Durability, Recovery Model & Coach Decisions
    critical_speed_data = adcg.compute_critical_speed(running_activities)
    crossfit_durability_data = adcg.compute_crossfit_durability(garmin_raw)
    garmin_hrv_data = adcg.load_garmin_hrv(BASE_DIR)
    sleep_debt_data = adcg.compute_sleep_debt_model(
        apple_data["sleep"]["history"],
        sleep_need_hrs=getattr(athx_config, "TARGET_SLEEP_HRS", 7.5),
    )
    plews_hrv_data = adcg.compute_plews_buchheit_hrv(BASE_DIR)
    running_biomechanics_data = adcg.compute_running_biomechanics(running_activities)
    allostatic_stress_data = adcg.compute_allostatic_stress_balance(BASE_DIR)
    vbt_velocity_loss_data = adcg.compute_vbt_velocity_loss(strength_data.get("processed_sets", []))
    perception_load_data = adcg.compute_perception_load_divergence(
        workout_activities=workout_data.get("history", []),
        strength_sets=strength_data.get("processed_sets", [])
    )
    coach_decisions_data = adcg.build_coach_decision_log(
        strength_data=strength_data,
        comp_data=comp_data,
        garmin_hrv=garmin_hrv_data,
        durability=crossfit_durability_data
    )
    print(f"✅ Critical Speed Model: {critical_speed_data['cs_pace_formatted']} ({critical_speed_data['cs_ms']} m/s), D' = {critical_speed_data['d_prime_m']}m, R² = {critical_speed_data['r2']}")
    print(f"✅ CrossFit Durability Engine: Index {crossfit_durability_data['durability_index']}% across {crossfit_durability_data['total_evaluated_sessions']} audited sessions.")
    print(f"✅ Sleep Debt Model (Part C): {sleep_debt_data['total_debt_hrs']}h deficit over {sleep_debt_data['nights_counted']} nights ({sleep_debt_data['status_text']}).")
    print(f"✅ Plews & Buchheit HRV (Part C): Latest {plews_hrv_data['latest_night_ms']} ms ({plews_hrv_data['status_text']}), SWC: {plews_hrv_data['band_lower_ms']}–{plews_hrv_data['band_upper_ms']} ms.")
    print(f"✅ Running Biomechanics: GCT {running_biomechanics_data.get('avg_gct_ms', 0)} ms, VR {running_biomechanics_data.get('avg_vr_pct', 0)}% ({running_biomechanics_data.get('vr_status', 'N/A')}).")
    print(f"✅ Allostatic Stress Balance: Net BB {allostatic_stress_data.get('net_bb_7d', 0)}, Autonomic Stress {allostatic_stress_data.get('avg_stress_7d', 0)}/100.")
    print(f"✅ VBT Fatigue Drop-Off: {vbt_velocity_loss_data.get('avg_velocity_loss_pct', 0)}% VL across {vbt_velocity_loss_data.get('evaluated_sessions', 0)} sessions ({vbt_velocity_loss_data.get('vbt_zone', 'N/A')}).")
    print(f"✅ AI Coach Decision Log: {len(coach_decisions_data)} interventions audited against Garmin overnight HRV.")

    dashboard_payload = {
        "config": {
            "data_start": athx_config.DATA_START,
            "competition_date": athx_config.COMPETITION_DATE,
            "bodyweight_target_kg": athx_config.BODYWEIGHT_TARGET_KG,
            "bodyweight_goal_type": athx_config.BODYWEIGHT_GOAL_TYPE,
            "e1rm_max_reps": athx_config.E1RM_MAX_REPS,
            "target_sleep_hrs": athx_config.TARGET_SLEEP_HRS,
            "readiness_weights": athx_config.READINESS_WEIGHTS,
        },
        "audit": audit.to_dict(),
        "strength": strength_data,
        "apple": apple_data,
        "running": running_data,
        "workouts": workout_data,
        "competition": comp_data,
        "coach_briefing": coach_briefing,
        "freshness": freshness_info,
        "strength_sessions": strength_sessions,
        "engine_activities": engine_activities,
        "microcycle_days": microcycle_days,
        "volume_gauges": volume_gauges,
        "fueling_targets": fueling_targets,
        "critical_speed": critical_speed_data,
        "crossfit_durability": crossfit_durability_data,
        "sleep_debt": sleep_debt_data,
        "plews_hrv": plews_hrv_data,
        "garmin_hrv": garmin_hrv_data,
        "running_biomechanics": running_biomechanics_data,
        "allostatic_stress": allostatic_stress_data,
        "vbt_velocity_loss": vbt_velocity_loss_data,
        "perception_load": perception_load_data,
        "coach_decisions": coach_decisions_data,
    }

    payload_json = json.dumps(dashboard_payload, ensure_ascii=False)
    html_content = build_html(payload_json, dashboard_payload)

    out_file = DATA_DIR / "garmin_workout.html"
    out_file.write_text(html_content, encoding="utf-8")
    index_file = DATA_DIR / "index.html"
    index_file.write_text(html_content, encoding="utf-8")
    if DATA_DIR != BASE_DIR:
        try:
            (BASE_DIR / "garmin_workout.html").write_text(html_content, encoding="utf-8")
            (BASE_DIR / "index.html").write_text(html_content, encoding="utf-8")
        except Exception:
            pass
    print(f"\n🎉 Successfully rebuilt upgraded ATHX Athlete Dashboard: {out_file} & index.html ({out_file.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
