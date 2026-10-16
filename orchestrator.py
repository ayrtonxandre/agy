#!/usr/bin/env python3
"""
================================================================================
Master ATHX 2027 Orchestrator: Garmin, Apple Health & Multi-Calendar Engine
================================================================================
"""

from __future__ import annotations
import os
import sys
import json
import csv
import shutil
import subprocess
import time
import threading
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from http.server import HTTPServer, ThreadingHTTPServer, BaseHTTPRequestHandler
from zoneinfo import ZoneInfo
import socket
import signal
import atexit

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("AGY_DATA_DIR", str(BASE_DIR)))
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOCAL_TZ = ZoneInfo(os.environ.get("TZ", "Europe/Paris"))
SERVER_PID_FILE = BASE_DIR / "server.pid"

# Paths (check DATA_DIR first, then fallback to BASE_DIR if needed)
GARMIN_CSV = DATA_DIR / "garmin_extracted_workouts.csv"
BODY_COMP_CSV = DATA_DIR / "apple_body_composition.csv"
NUTRITION_CSV = DATA_DIR / "apple_nutrition_macros.csv"
DAILY_ACT_CSV = DATA_DIR / "apple_daily_activity.csv"
SLEEP_CSV = DATA_DIR / "apple_sleep.csv"
MOBILITY_CSV = DATA_DIR / "apple_mobility_biomechanics.csv"
WORKOUTS_CSV = DATA_DIR / "apple_workouts_history.csv"
WORKOUT_HTML = DATA_DIR / "garmin_workout.html"
CALENDAR_HTML = DATA_DIR / "calendar_dashboard.html"
ACCESS_LOG = DATA_DIR / "server_access.log"
LAST_PAYLOAD_FILE = DATA_DIR / "last_payload.json"

def get_python_binary() -> str:
    """Returns the best Python interpreter with all ATHX dependencies installed."""
    conda_py = Path.home() / "anaconda3" / "bin" / "python3"
    if conda_py.exists() and os.access(str(conda_py), os.X_OK):
        return str(conda_py)
    return sys.executable

def log_event(msg: str):
    timestamp = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{timestamp}] {msg}"
    print(entry, flush=True)
    try:
        ACCESS_LOG.parent.mkdir(parents=True, exist_ok=True)
        with open(ACCESS_LOG, "a", encoding="utf-8") as f:
            f.write(entry + "\n")
            f.flush()
    except Exception as e:
        print(f"Failed to write to access log: {e}", flush=True)

GIT_LOCK = threading.Lock()

def git_auto_commit_and_push(reason: str = "apple health webhook sync"):
    """Batches and pushes data and dashboard changes to GitHub origin/main in background."""
    if not GIT_LOCK.acquire(blocking=False):
        log_event("⏳ Git push already in progress, skipping concurrent trigger")
        return

    try:
        git_bin = shutil.which("git")
        if not git_bin:
            log_event("Warning: git binary not found")
            return

        # Check status
        res = subprocess.run(
            [git_bin, "-C", str(BASE_DIR), "status", "--porcelain"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if res.returncode != 0 or not res.stdout.strip():
            log_event("Git: Working tree clean (nothing to commit)")
            return

        subprocess.run(
            [git_bin, "-C", str(BASE_DIR), "add", "-A"],
            capture_output=True,
            text=True,
            timeout=15
        )
        timestamp = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d %H:%M")
        commit_msg = f"chore(data): {reason} [{timestamp}]"
        subprocess.run(
            [git_bin, "-C", str(BASE_DIR), "commit", "-m", commit_msg],
            capture_output=True,
            text=True,
            timeout=15
        )
        push_res = subprocess.run(
            [git_bin, "-C", str(BASE_DIR), "push", "origin", "main"],
            capture_output=True,
            text=True,
            timeout=30
        )
        if push_res.returncode == 0:
            log_event("🚀 Pushed updated data & dashboards to GitHub origin/main")
        else:
            err = push_res.stderr.strip().splitlines()[-1] if push_res.stderr else "unknown error"
            log_event(f"Warning: Git push failed: {err[:60]}")
    except Exception as e:
        log_event(f"Notice: Git auto-push error: {e}")
    finally:
        GIT_LOCK.release()

# Athletic Routine Constraints (Option 1: 4 Gym + 3 CrossFit + Wednesday Light Cardio/Core + Sunday Rest)
ATHLETIC_SCHEDULE = {
    "Monday": [
        {"type": "Gym", "time": "06:30", "duration_min": 45, "split": "Push & Shoulders (S2O)"},
        {"type": "Crossfit", "time": "19:00", "duration_min": 60, "split": "Cross-training"}
    ],
    "Tuesday": {"type": "Gym", "time": "06:30", "duration_min": 48, "split": "Pull & Forearms"},
    "Wednesday": [
        {"type": "Cardio/Core", "time": "06:30", "duration_min": 20, "split": "Light Cardio & Core"},
        {"type": "Crossfit", "time": "19:00", "duration_min": 60, "split": "Cross-training"}
    ],
    "Thursday": {"type": "Gym", "time": "06:30", "duration_min": 50, "split": "Legs A (Squat & Quads)"},
    "Friday": {"type": "Gym", "time": "06:30", "duration_min": 45, "split": "Legs B (Deadlift & Carry)"},
    "Saturday": {"type": "Crossfit", "time": "11:30", "duration_min": 60, "split": "Cross-training"},
    "Sunday": {"type": "Rest", "time": None, "duration_min": 0, "split": "Full Rest & Recovery"}
}

def process_health_auto_export_payload(payload: dict) -> dict:
    """Parses JSON received from Health Auto Export app and updates local CSVs."""
    now_str = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d %H:%M:%S")

    # Save raw payload for debugging
    try:
        with open(LAST_PAYLOAD_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
    except Exception as e:
        log_event(f"Error saving payload to debug file: {e}")

    # Inspect structure (payload might be {"data": {"metrics": [...], "workouts": [...]}} or {"metrics": [...]})
    data = payload.get("data", payload) if isinstance(payload, dict) else {}
    if not isinstance(data, dict):
        data = {}

    metrics = data.get("metrics", [])
    if isinstance(metrics, dict):
        metrics_list = []
        for k, v in metrics.items():
            if isinstance(v, list):
                metrics_list.append({"name": k, "data": v})
            elif isinstance(v, dict):
                v["name"] = k
                metrics_list.append(v)
        metrics = metrics_list
    elif not isinstance(metrics, list):
        metrics = []

    updates = {"body_comp": 0, "nutrition": 0, "activity": 0, "mobility": 0, "sleep": 0, "workouts": 0}

    def _to_float(val, default=None):
        try:
            if val is None or val == "":
                return default
            return float(val)
        except (ValueError, TypeError):
            return default

    def _extract_date(s):
        if not isinstance(s, dict):
            return None
        raw = str(s.get("date", s.get("startDate", s.get("endDate", s.get("Date", ""))))).strip()
        if len(raw) >= 10:
            candidate = raw[:10]
            try:
                datetime.strptime(candidate, "%Y-%m-%d")
                return candidate
            except (ValueError, TypeError):
                pass
        return None

    # --------------------------------------------------------------------------
    # 1. BODY COMPOSITION (Weight, Body Fat %, Lean Mass, BMI)
    # --------------------------------------------------------------------------
    body_comp_days = {}
    for m in metrics:
        name = str(m.get("name", "")).strip().lower()
        samples = m.get("data", [])
        if ("weight" in name and "lean" not in name) or name in ("weight_body_mass", "body_mass"):
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    body_comp_days.setdefault(d, {})["Weight_kg"] = round(val, 1)
        elif "body_fat" in name or "bodyfat" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    pct = round(val if val > 1.0 else val * 100.0, 1)
                    body_comp_days.setdefault(d, {})["Body_Fat_pct"] = pct
        elif "lean_body" in name or "lean_mass" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    body_comp_days.setdefault(d, {})["Lean_Mass_kg"] = round(val, 1)
        elif "mass_index" in name or name == "bmi":
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    body_comp_days.setdefault(d, {})["BMI"] = round(val, 1)

    if body_comp_days:
        rows = []
        if BODY_COMP_CSV.exists():
            with open(BODY_COMP_CSV, "r", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
        day_dict = {r["Date"]: r for r in rows if _extract_date(r)}
        for d, vals in body_comp_days.items():
            if d not in day_dict:
                day_dict[d] = {"Date": d, "Weight_kg": "", "Body_Fat_pct": "", "Lean_Mass_kg": "", "BMI": ""}
            for k in ("Weight_kg", "Body_Fat_pct", "Lean_Mass_kg", "BMI"):
                if k in vals:
                    day_dict[d][k] = vals[k]
            w = _to_float(day_dict[d].get("Weight_kg"))
            bf = _to_float(day_dict[d].get("Body_Fat_pct"))
            if w and bf and not day_dict[d].get("Lean_Mass_kg"):
                day_dict[d]["Lean_Mass_kg"] = round(w * (1 - (bf / 100.0)), 1)
            if w and not day_dict[d].get("BMI"):
                day_dict[d]["BMI"] = round(w / (1.83 ** 2), 1)

        updated_rows = sorted(day_dict.values(), key=lambda x: x["Date"])
        with open(BODY_COMP_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["Date", "Weight_kg", "Body_Fat_pct", "Lean_Mass_kg", "BMI"])
            writer.writeheader()
            writer.writerows(updated_rows)
        updates["body_comp"] = len(body_comp_days)
        log_event(f"🍏 Health Auto Export: Updated body comp for {len(body_comp_days)} dates ({list(body_comp_days.keys())})")

    # --------------------------------------------------------------------------
    # 2. DAILY ACTIVITY (Steps, Distance, Active Energy, Resting HR)
    # --------------------------------------------------------------------------
    activity_days = {}
    for m in metrics:
        name = str(m.get("name", "")).strip().lower()
        samples = m.get("data", [])
        default_unit = m.get("units", "")
        if "step" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    activity_days.setdefault(d, {})["Steps"] = int(round(val))
        elif "distance" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    activity_days.setdefault(d, {})["Distance_km"] = round(val, 2)
        elif "active_energy" in name or name == "activeenergy":
            for s in samples:
                d = _extract_date(s)
                u = str(s.get("unit", s.get("units", default_unit))).lower()
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    activity_days.setdefault(d, {})["Active_Energy_kcal"] = round(val * 0.239006, 1) if "kj" in u else round(val, 1)
        elif "resting" in name and "heart" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    activity_days.setdefault(d, {})["Resting_Heart_Rate_bpm"] = round(val, 1)

    if activity_days:
        rows = []
        if DAILY_ACT_CSV.exists():
            with open(DAILY_ACT_CSV, "r", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
        act_dict = {r["Date"]: r for r in rows if _extract_date(r)}
        for d, vals in activity_days.items():
            if d not in act_dict:
                act_dict[d] = {"Date": d, "Steps": "", "Distance_km": "", "Active_Energy_kcal": "", "Resting_Heart_Rate_bpm": ""}
            for k in ("Steps", "Distance_km", "Active_Energy_kcal", "Resting_Heart_Rate_bpm"):
                if k in vals:
                    act_dict[d][k] = vals[k]

        updated_act = sorted(act_dict.values(), key=lambda x: x["Date"])
        with open(DAILY_ACT_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["Date", "Steps", "Distance_km", "Active_Energy_kcal", "Resting_Heart_Rate_bpm"])
            writer.writeheader()
            writer.writerows(updated_act)
        updates["activity"] = len(activity_days)
        log_event(f"👟 Health Auto Export: Updated daily activity for {len(activity_days)} dates ({list(activity_days.keys())})")

    # --------------------------------------------------------------------------
    # 3. MOBILITY & BIOMECHANICS (Speed, Step Length, Asymmetry, Double Support, Flights)
    # --------------------------------------------------------------------------
    mobility_days = {}
    for m in metrics:
        name = str(m.get("name", "")).strip().lower()
        samples = m.get("data", [])
        if "walking_speed" in name or ("speed" in name and "walking" in name):
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    mobility_days.setdefault(d, {})["Walking_Speed_kmh"] = round(val, 2)
        elif "step_length" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    mobility_days.setdefault(d, {})["Walking_Step_Length_cm"] = round(val, 1)
        elif "asymmetry" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    mobility_days.setdefault(d, {})["Walking_Asymmetry_pct"] = round(val, 2)
        elif "double_support" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    mobility_days.setdefault(d, {})["Walking_Double_Support_pct"] = round(val, 1)
        elif "flights" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    mobility_days.setdefault(d, {})["Flights_Climbed"] = round(val, 1)
        elif "resting" in name and "heart" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    mobility_days.setdefault(d, {})["Resting_Heart_Rate_bpm"] = round(val, 1)

    if mobility_days:
        rows = []
        if MOBILITY_CSV.exists():
            with open(MOBILITY_CSV, "r", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
        mob_dict = {r["Date"]: r for r in rows if _extract_date(r)}
        for d, vals in mobility_days.items():
            if d not in mob_dict:
                mob_dict[d] = {
                    "Date": d,
                    "Walking_Speed_kmh": "",
                    "Walking_Step_Length_cm": "",
                    "Walking_Asymmetry_pct": "",
                    "Walking_Double_Support_pct": "",
                    "Flights_Climbed": "",
                    "Resting_Heart_Rate_bpm": ""
                }
            for k in ("Walking_Speed_kmh", "Walking_Step_Length_cm", "Walking_Asymmetry_pct", "Walking_Double_Support_pct", "Flights_Climbed", "Resting_Heart_Rate_bpm"):
                if k in vals:
                    mob_dict[d][k] = vals[k]

        updated_mob = sorted(mob_dict.values(), key=lambda x: x["Date"])
        with open(MOBILITY_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "Date", "Walking_Speed_kmh", "Walking_Step_Length_cm", "Walking_Asymmetry_pct",
                "Walking_Double_Support_pct", "Flights_Climbed", "Resting_Heart_Rate_bpm"
            ])
            writer.writeheader()
            writer.writerows(updated_mob)
        updates["mobility"] = len(mobility_days)
        log_event(f"🚶 Health Auto Export: Updated mobility/biomechanics for {len(mobility_days)} dates ({list(mobility_days.keys())})")

    # --------------------------------------------------------------------------
    # 4. SLEEP ANALYSIS (Deep, REM, Core, Awake, Total, In Bed)
    # --------------------------------------------------------------------------
    sleep_samples = [m for m in metrics if "sleep" in str(m.get("name", "")).lower()]
    sleep_data = []
    if isinstance(data, dict):
        if "sleep" in data and isinstance(data["sleep"], list):
            sleep_data.extend(data["sleep"])
        if "sleep_analysis" in data and isinstance(data["sleep_analysis"], list):
            sleep_data.extend(data["sleep_analysis"])
    if isinstance(payload, dict):
        if "sleep" in payload and isinstance(payload["sleep"], list):
            sleep_data.extend(payload["sleep"])
        if "sleep_analysis" in payload and isinstance(payload["sleep_analysis"], list):
            sleep_data.extend(payload["sleep_analysis"])
    if sleep_samples:
        for m in sleep_samples:
            d_list = m.get("data", [])
            if isinstance(d_list, list):
                sleep_data.extend(d_list)

    if sleep_data:
        from collections import defaultdict
        daily_sleep = defaultdict(lambda: {"total": 0.0, "deep": 0.0, "rem": 0.0, "core": 0.0, "awake": 0.0, "in_bed": 0.0})

        for s in sleep_data:
            # Prefer wake date (endDate) or explicit date
            s_date = _extract_date({"date": s.get("date", s.get("endDate", s.get("startDate")))})
            if not s_date:
                continue
            val = str(s.get("value", s.get("stage", s.get("sleepStage", "")))).lower()
            qty = _to_float(s.get("qty", s.get("duration", 0)), 0.0)
            dur_hrs = qty / 3600.0 if qty > 60 else qty

            # Check for nested stages (Health Auto Export sends 'stages' or 'sleep_analysis' or 'sleep_stages')
            nested_stages = s.get("stages") or s.get("sleep_analysis") or s.get("sleep_stages") or s.get("sleepStages") or []
            if nested_stages and isinstance(nested_stages, list):
                if dur_hrs > 0:
                    daily_sleep[s_date]["total"] = round(dur_hrs, 2)
                for st in nested_stages:
                    st_val = str(st.get("value", st.get("stage", st.get("sleepStage", "")))).lower()
                    st_start = st.get("startDate", "")
                    st_end = st.get("endDate", "")
                    st_hrs = 0.0
                    if st_start and st_end:
                        try:
                            t1_str = str(st_start).replace("Z", "+00:00").replace("T", " ")[:19]
                            t2_str = str(st_end).replace("Z", "+00:00").replace("T", " ")[:19]
                            t1 = datetime.strptime(t1_str, "%Y-%m-%d %H:%M:%S")
                            t2 = datetime.strptime(t2_str, "%Y-%m-%d %H:%M:%S")
                            st_hrs = (t2 - t1).total_seconds() / 3600.0
                        except Exception:
                            pass
                    if st_hrs <= 0.0:
                        st_qty = _to_float(st.get("qty", st.get("duration", 0)), 0.0)
                        st_hrs = st_qty / 3600.0 if st_qty > 60 else st_qty

                    if "deep" in st_val:
                        daily_sleep[s_date]["deep"] += st_hrs
                    elif "rem" in st_val:
                        daily_sleep[s_date]["rem"] += st_hrs
                    elif "core" in st_val or "light" in st_val:
                        daily_sleep[s_date]["core"] += st_hrs
                    elif "awake" in st_val:
                        daily_sleep[s_date]["awake"] += st_hrs
                    elif "inbed" in st_val or "in_bed" in st_val:
                        daily_sleep[s_date]["in_bed"] += st_hrs

            # Check for pre-aggregated stage fields in dictionary
            elif any(k in s for k in ("asleep", "totalSleep", "deep", "rem", "core", "inBed", "in_bed")):
                tot = _to_float(s.get("totalSleep", s.get("asleep", 0)), 0.0)
                deep = _to_float(s.get("deep", 0), 0.0)
                rem = _to_float(s.get("rem", 0), 0.0)
                core = _to_float(s.get("core", s.get("light", 0)), 0.0)
                awake = _to_float(s.get("awake", 0), 0.0)
                in_bed = _to_float(s.get("inBed", s.get("in_bed", 0)), 0.0)
                daily_sleep[s_date]["total"] += tot
                daily_sleep[s_date]["deep"] += deep
                daily_sleep[s_date]["rem"] += rem
                daily_sleep[s_date]["core"] += core
                daily_sleep[s_date]["awake"] += awake
                daily_sleep[s_date]["in_bed"] += in_bed

            # Discrete stream of sleep records
            else:
                if dur_hrs <= 0.0 and s.get("startDate") and s.get("endDate"):
                    try:
                        t1_str = str(s["startDate"]).replace("Z", "+00:00").replace("T", " ")[:19]
                        t2_str = str(s["endDate"]).replace("Z", "+00:00").replace("T", " ")[:19]
                        t1 = datetime.strptime(t1_str, "%Y-%m-%d %H:%M:%S")
                        t2 = datetime.strptime(t2_str, "%Y-%m-%d %H:%M:%S")
                        dur_hrs = (t2 - t1).total_seconds() / 3600.0
                    except Exception:
                        pass

                if "deep" in val:
                    daily_sleep[s_date]["deep"] += dur_hrs
                elif "rem" in val:
                    daily_sleep[s_date]["rem"] += dur_hrs
                elif "core" in val or "light" in val:
                    daily_sleep[s_date]["core"] += dur_hrs
                elif "awake" in val:
                    daily_sleep[s_date]["awake"] += dur_hrs
                elif "inbed" in val or "in_bed" in val:
                    daily_sleep[s_date]["in_bed"] += dur_hrs
                elif "asleep" in val:
                    daily_sleep[s_date]["total"] += dur_hrs

        rows = []
        if SLEEP_CSV.exists():
            with open(SLEEP_CSV, "r", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
        sleep_dict = {r["Date"]: r for r in rows if _extract_date(r)}

        for d, m in daily_sleep.items():
            if m["total"] == 0.0:
                m["total"] = m["deep"] + m["rem"] + m["core"]
            if m["in_bed"] == 0.0:
                m["in_bed"] = m["total"] + m["awake"]

            sleep_dict[d] = {
                "Date": d,
                "Total_Sleep_hrs": round(m["total"], 1),
                "Deep_Sleep_hrs": round(m["deep"], 1),
                "REM_Sleep_hrs": round(m["rem"], 1),
                "Core_Sleep_hrs": round(m["core"], 1),
                "Awake_hrs": round(m["awake"], 1),
                "In_Bed_hrs": round(m["in_bed"], 1)
            }

        updated_sleep = sorted(sleep_dict.values(), key=lambda x: x["Date"])
        with open(SLEEP_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["Date", "Total_Sleep_hrs", "Deep_Sleep_hrs", "REM_Sleep_hrs", "Core_Sleep_hrs", "Awake_hrs", "In_Bed_hrs"])
            writer.writeheader()
            writer.writerows(updated_sleep)
        updates["sleep"] = len(daily_sleep)
        log_event(f"😴 Health Auto Export: Logged sleep for {len(daily_sleep)} nights ({list(daily_sleep.keys())})")

    # --------------------------------------------------------------------------
    # 5. NUTRITION MACROS (Calories, Protein, Carbs, Fat, Fiber)
    # --------------------------------------------------------------------------
    nutrition_days = {}
    for m in metrics:
        name = str(m.get("name", "")).strip().lower()
        samples = m.get("data", [])
        default_unit = m.get("units", "")
        if "dietary_energy" in name or "dietaryenergy" in name or ("energy" in name and "active" not in name) or "calorie" in name:
            for s in samples:
                d = _extract_date(s)
                u = str(s.get("unit", s.get("units", default_unit))).lower()
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    nutrition_days.setdefault(d, {})["Calories_kcal"] = round(val * 0.239006, 1) if "kj" in u else round(val, 1)
        elif "protein" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    nutrition_days.setdefault(d, {})["Protein_g"] = round(val, 1)
        elif "carb" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    nutrition_days.setdefault(d, {})["Carbs_g"] = round(val, 1)
        elif "total_fat" in name or ("fat" in name and "body" not in name):
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    nutrition_days.setdefault(d, {})["Fat_g"] = round(val, 1)
        elif "fiber" in name:
            for s in samples:
                d = _extract_date(s)
                val = _to_float(s.get("qty", s.get("value")))
                if d and val is not None:
                    nutrition_days.setdefault(d, {})["Fiber_g"] = round(val, 1)

    if nutrition_days:
        rows = []
        if NUTRITION_CSV.exists():
            with open(NUTRITION_CSV, "r", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
        nut_dict = {r["Date"]: r for r in rows if _extract_date(r)}
        for d, vals in nutrition_days.items():
            if d not in nut_dict:
                nut_dict[d] = {"Date": d, "Calories_kcal": "", "Protein_g": "", "Carbs_g": "", "Fat_g": "", "Fiber_g": ""}
            for k in ("Calories_kcal", "Protein_g", "Carbs_g", "Fat_g", "Fiber_g"):
                if k in vals:
                    nut_dict[d][k] = vals[k]

        updated_nut = sorted(nut_dict.values(), key=lambda x: x["Date"])
        with open(NUTRITION_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["Date", "Calories_kcal", "Protein_g", "Carbs_g", "Fat_g", "Fiber_g"])
            writer.writeheader()
            writer.writerows(updated_nut)
        updates["nutrition"] = len(nutrition_days)
        log_event(f"🥗 Health Auto Export: Updated nutrition for {len(nutrition_days)} dates ({list(nutrition_days.keys())})")

    # --------------------------------------------------------------------------
    # 6. WORKOUTS HISTORY (CrossFit, Strength, Running, Cardio)
    # --------------------------------------------------------------------------
    workouts_list = data.get("workouts", []) if isinstance(data, dict) else []
    if not workouts_list and isinstance(payload, dict):
        workouts_list = payload.get("workouts", [])

    if workouts_list:
        rows = []
        if WORKOUTS_CSV.exists():
            with open(WORKOUTS_CSV, "r", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
        workout_keys = {(r.get("Start_Time"), r.get("Workout_Type")) for r in rows}

        added_workouts = 0
        for w in workouts_list:
            st_raw = w.get("start", w.get("startDate", ""))
            d = _extract_date({"startDate": st_raw})
            name = w.get("name", w.get("workoutActivityType", "Workout"))
            if not st_raw or not d:
                continue

            dur_sec = _to_float(w.get("duration", 0), 0.0)
            dur_min = round(dur_sec / 60.0, 1) if dur_sec > 120 else round(dur_sec, 1)

            energy_obj = w.get("activeEnergyBurned", {})
            if isinstance(energy_obj, dict):
                qty = _to_float(energy_obj.get("qty", energy_obj.get("value", 0)), 0.0)
                unit = str(energy_obj.get("units", energy_obj.get("unit", ""))).lower()
                kcal = round(qty * 0.239006, 1) if "kj" in unit else round(qty, 1)
            else:
                kcal = _to_float(energy_obj, 0.0)

            dist_obj = w.get("distance", {})
            if isinstance(dist_obj, dict):
                dist_km = round(_to_float(dist_obj.get("qty", dist_obj.get("value", 0)), 0.0), 2)
            else:
                dist_km = round(_to_float(dist_obj, 0.0), 2)

            src = w.get("source", "Health Auto Export")

            entry = {
                "Date": d,
                "Start_Time": st_raw,
                "Workout_Type": name,
                "Duration_min": dur_min,
                "Active_Energy_kcal": kcal,
                "Distance_km": dist_km,
                "Source": src,
            }

            key = (st_raw, name)
            if key in workout_keys:
                for idx, r in enumerate(rows):
                    if (r.get("Start_Time"), r.get("Workout_Type")) == key:
                        rows[idx] = entry
                        break
            else:
                rows.append(entry)
                workout_keys.add(key)
                added_workouts += 1

        rows.sort(key=lambda x: str(x.get("Start_Time", "")))
        with open(WORKOUTS_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["Date", "Start_Time", "Workout_Type", "Duration_min", "Active_Energy_kcal", "Distance_km", "Source"])
            writer.writeheader()
            writer.writerows(rows)
        updates["workouts"] = added_workouts
        log_event(f"🏋️ Health Auto Export: Logged {added_workouts} workouts")

    # Regenerate dashboard
    try:
        res = subprocess.run(
            [get_python_binary(), str(BASE_DIR / "generate_unified_athlete_dashboard.py")],
            capture_output=True,
            text=True,
            timeout=60
        )
        if res.returncode == 0:
            log_event("⚡ Regenerated athlete dashboard (garmin_workout.html)")
        else:
            err = (res.stderr or res.stdout or "unknown error").strip().splitlines()[-1]
            log_event(f"Warning: Dashboard regeneration error: {err}")
    except Exception as e:
        log_event(f"Warning: Could not regenerate dashboard: {e}")

    # Trigger automatic background sync to GitHub
    try:
        threading.Thread(target=git_auto_commit_and_push, args=("apple health webhook sync",), daemon=True).start()
        log_event("☁️ Triggered background GitHub auto-sync")
    except Exception as e:
        log_event(f"Notice: GitHub auto-sync skipped: {e}")

    return {"status": "success", "updates": updates, "timestamp": now_str}

class AthleteServerHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, X-Requested-With")

    def do_OPTIONS(self):
        log_event(f"OPTIONS request from {self.client_address[0]} to {self.path}")
        self.send_response(200)
        self.send_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_HEAD(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def _get_clean_path(self) -> str:
        clean = urlparse(self.path).path.rstrip("/")
        return clean if clean else "/"

    def do_GET(self):
        client_ip = self.client_address[0]
        clean_path = self._get_clean_path()
        log_event(f"GET request from {client_ip} to {clean_path}")

        # Healthcheck endpoints (used by Docker & SWAG)
        if clean_path in ("/health", "/api/health"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_cors_headers()
            self.end_headers()
            resp = {
                "system": "ATHX 2027 Athlete Intelligence Orchestrator",
                "status": "online",
                "version": "2.0.0",
                "time": datetime.now(LOCAL_TZ).isoformat(),
                "endpoints": {
                    "athlete_headquarters": "/",
                    "workout_dashboard": "/workout",
                    "calendar_dashboard": "/calendar",
                    "coach_briefing": "GET /api/coach",
                    "coach_consultation": "POST /api/coach/ask",
                    "webhook": "POST /api/health",
                    "healthcheck": "GET /health"
                }
            }
            self.wfile.write(json.dumps(resp, indent=2).encode("utf-8"))

        # Main Athlete Headquarters Dashboard
        elif clean_path in ("/", "/workout", "/index.html", "/garmin_workout.html"):
            target_file = WORKOUT_HTML if WORKOUT_HTML.exists() else (BASE_DIR / "garmin_workout.html")
            if not target_file.exists() and (BASE_DIR / "index.html").exists():
                target_file = BASE_DIR / "index.html"

            if target_file.exists():
                content = target_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "Athlete Dashboard not found. Run ATHX dashboard build first.")

        # Multi-Calendar Dashboard
        elif clean_path in ("/calendar", "/calendar.html", "/calendar_dashboard.html"):
            target_file = CALENDAR_HTML if CALENDAR_HTML.exists() else (BASE_DIR / "calendar_dashboard.html")
            if target_file.exists():
                content = target_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "Calendar dashboard not found")

        # AI Coach Briefing API
        elif clean_path in ("/api/coach", "/api/coach/briefing"):
            briefing_file = DATA_DIR / "athlete_coach_briefing.json"
            if not briefing_file.exists():
                briefing_file = BASE_DIR / "athlete_coach_briefing.json"

            if briefing_file.exists():
                try:
                    data = json.loads(briefing_file.read_text(encoding="utf-8"))
                    content = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.send_header("Content-Length", str(len(content)))
                    self.send_cors_headers()
                    self.end_headers()
                    self.wfile.write(content)
                except Exception as e:
                    self.send_error(500, f"Error loading briefing: {e}")
            else:
                self.send_error(404, "Coach briefing not found. Generate dashboard or run 'athx coach' first.")

        else:
            self.send_error(404, f"Path not found: {clean_path}")

    def do_POST(self):
        client_ip = self.client_address[0]
        clean_path = self._get_clean_path()
        log_event(f"POST request received from {client_ip} to {clean_path}")

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(body.decode("utf-8")) if body else {}

            log_event(f"📦 Payload size: {len(body)} bytes from {client_ip}")

            # iOS Health Auto Export webhook ingestion
            if clean_path in ("/api/health", "/health", "/webhook"):
                result = process_health_auto_export_payload(payload)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))

            # On-demand dashboard rebuild API
            elif clean_path in ("/api/rebuild", "/api/sync/rebuild"):
                res = subprocess.run(
                    [get_python_binary(), str(BASE_DIR / "generate_unified_athlete_dashboard.py")],
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                self.send_response(200 if res.returncode == 0 else 500)
                self.send_header("Content-Type", "application/json")
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success" if res.returncode == 0 else "error",
                    "code": res.returncode,
                    "output": res.stdout.strip() if res.returncode == 0 else res.stderr.strip()
                }).encode("utf-8"))

            # On-demand Garmin extraction API
            elif clean_path == "/api/sync/garmin":
                res = subprocess.run(
                    [get_python_binary(), str(BASE_DIR / "extract_garmin_strength.py")],
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                if res.returncode == 0:
                    subprocess.run([get_python_binary(), str(BASE_DIR / "generate_unified_athlete_dashboard.py")], timeout=60)
                self.send_response(200 if res.returncode == 0 else 500)
                self.send_header("Content-Type", "application/json")
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success" if res.returncode == 0 else "error",
                    "output": res.stdout.strip() if res.returncode == 0 else res.stderr.strip()
                }).encode("utf-8"))

            # AI Coach interactive Q&A consultation endpoint
            elif clean_path in ("/api/coach/ask", "/api/coach"):
                question = payload.get("question", "").strip()
                if not question:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Missing 'question' parameter in JSON payload"}).encode("utf-8"))
                else:
                    try:
                        import athx_ai_coach
                        digest = athx_ai_coach.load_telemetry_digest(BASE_DIR)
                        qa_result = athx_ai_coach.ask_coach(question, digest=digest, base_dir=BASE_DIR)
                        content = json.dumps(qa_result, indent=2, ensure_ascii=False).encode("utf-8")
                        self.send_response(200)
                        self.send_header("Content-Type", "application/json; charset=utf-8")
                        self.send_header("Content-Length", str(len(content)))
                        self.send_cors_headers()
                        self.end_headers()
                        self.wfile.write(content)
                    except Exception as e:
                        self.send_response(500)
                        self.send_header("Content-Type", "application/json")
                        self.send_cors_headers()
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": f"Coach consultation error: {e}"}).encode("utf-8"))

            else:
                self.send_error(404, f"API endpoint not found: {clean_path}")

        except Exception as e:
            log_event(f"❌ Error processing POST: {e}")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

def get_network_endpoints(port: int = 8080) -> dict:
    """Returns local, mDNS, and LAN network endpoints for ATHX services."""
    mdns_host = "Ayrtons-MacBook-Air.local"
    try:
        cmd = subprocess.run(["scutil", "--get", "LocalHostName"], capture_output=True, text=True, timeout=2)
        if cmd.returncode == 0 and cmd.stdout.strip():
            mdns_host = f"{cmd.stdout.strip()}.local"
        else:
            h = socket.gethostname().split(".")[0]
            if h:
                mdns_host = f"{h}.local"
    except Exception:
        pass

    lan_ip = "127.0.0.1"
    try:
        res = subprocess.run(["ipconfig", "getifaddr", "en0"], capture_output=True, text=True, timeout=1.5)
        if res.returncode == 0 and res.stdout.strip():
            lan_ip = res.stdout.strip()
        else:
            res1 = subprocess.run(["ipconfig", "getifaddr", "en1"], capture_output=True, text=True, timeout=1.5)
            if res1.returncode == 0 and res1.stdout.strip():
                lan_ip = res1.stdout.strip()
    except Exception:
        pass

    return {
        "port": port,
        "mdns_host": mdns_host,
        "lan_ip": lan_ip,
        "dashboard_local": f"http://localhost:{port}/",
        "webhook_mdns": f"http://{mdns_host}:{port}/api/health",
        "webhook_lan": f"http://{lan_ip}:{port}/api/health",
        "healthcheck": f"http://localhost:{port}/health",
        "coach_api": f"http://localhost:{port}/api/coach"
    }

def run_server(port: int | None = None):
    if port is None:
        port = int(os.environ.get("PORT", os.environ.get("AGY_PORT", "8080")))

    # Check if port is already bound
    try:
        server = ThreadingHTTPServer(("0.0.0.0", port), AthleteServerHandler)
    except OSError as e:
        if e.errno == 48:
            net = get_network_endpoints(port)
            log_event(f"⚠️ Port {port} is already in use.")
            log_event(f"  • Existing Webhook Endpoint: {net['webhook_mdns']}")
            log_event(f"  • To restart the server, run: athx serve --stop (or athx serve --restart)")
            return
        raise

    # Write PID file
    pid = os.getpid()
    try:
        SERVER_PID_FILE.write_text(str(pid), encoding="utf-8")
    except Exception:
        pass

    def cleanup_pid(*args):
        try:
            if SERVER_PID_FILE.exists():
                SERVER_PID_FILE.unlink(missing_ok=True)
        except Exception:
            pass
        sys.exit(0)

    atexit.register(cleanup_pid)
    signal.signal(signal.SIGTERM, cleanup_pid)
    signal.signal(signal.SIGINT, cleanup_pid)

    net = get_network_endpoints(port)
    log_event(f"🚀 Athlete Orchestrator Server running on port {port} (PID: {pid})")
    log_event(f"  • Athlete Dashboard  : {net['dashboard_local']}")
    log_event(f"  • Calendar Dashboard : http://localhost:{port}/calendar")
    log_event(f"  • Webhook (iPhone)   : {net['webhook_mdns']}")
    log_event(f"  • Webhook (LAN IP)   : {net['webhook_lan']}")
    log_event(f"  • Healthcheck        : {net['healthcheck']}")

    # Optional background periodic sync scheduler
    interval_hours = float(os.environ.get("SYNC_INTERVAL_HOURS", "0"))
    if interval_hours > 0:
        def background_scheduler():
            log_event(f"⏰ Background sync scheduler active (every {interval_hours}h)")
            while True:
                time.sleep(interval_hours * 3600)
                log_event("⏰ Running scheduled background sync...")
                try:
                    garmin_tokens = BASE_DIR / "garmin_tokens"
                    if garmin_tokens.exists():
                        subprocess.run([sys.executable, str(BASE_DIR / "extract_garmin_strength.py")], timeout=45)
                    subprocess.run([sys.executable, str(BASE_DIR / "generate_unified_athlete_dashboard.py")], timeout=35)
                    threading.Thread(target=git_auto_commit_and_push, args=("periodic background sync",), daemon=True).start()
                except Exception as ex:
                    log_event(f"Periodic sync warning: {ex}")

        threading.Thread(target=background_scheduler, daemon=True).start()

    try:
        server.serve_forever()
    finally:
        cleanup_pid()

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "status"

    if mode == "serve":
        run_server()
    elif mode == "plan":
        print("ATHX 2027 Schedule (Option 1 - 4 Gym / 3 CrossFit / Sunday Rest):")
        for d, sessions in ATHLETIC_SCHEDULE.items():
            if isinstance(sessions, list):
                sched_str = " + ".join(f"{s['type']} at {s['time']} ({s['split']}, {s['duration_min']}m)" for s in sessions)
                print(f"  • {d:9}: {sched_str}")
            else:
                t = sessions.get('time')
                time_str = f"at {t} ({sessions.get('duration_min', 0)}m)" if t else "OFF"
                print(f"  • {d:9}: {sessions['type']} {time_str} - {sessions['split']}")
    elif mode == "sync-garmin":
        subprocess.run([sys.executable, str(BASE_DIR / "extract_garmin_strength.py")])
    elif mode == "ingest":
        target = Path(sys.argv[2]) if len(sys.argv) > 2 else LAST_PAYLOAD_FILE
        if not target.exists():
            print(f"❌ Error: Payload file not found: {target}")
            sys.exit(1)
        try:
            with open(target, "r", encoding="utf-8") as f:
                payload = json.load(f)
            res = process_health_auto_export_payload(payload)
            print(f"✅ Ingested payload from {target.name}:")
            for k, v in res.get("updates", {}).items():
                print(f"  • {k:12}: {v} records processed")
        except Exception as e:
            print(f"❌ Error ingesting payload: {e}")
            sys.exit(1)
    elif mode == "status":
        port = int(os.environ.get("PORT", os.environ.get("AGY_PORT", "8080")))
        net = get_network_endpoints(port)
        print(f"ATHX Orchestrator Status:")
        print(f"  • Local Dashboard : {net['dashboard_local']}")
        print(f"  • iPhone Webhook  : {net['webhook_mdns']}")
        print(f"  • LAN IP Webhook  : {net['webhook_lan']}")
    else:
        print("Usage: python3 orchestrator.py [serve|plan|sync-garmin|ingest|status]")
