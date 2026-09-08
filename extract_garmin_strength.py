#!/usr/bin/env python3
"""
================================================================================
Garmin Connect Unofficial Extraction Script: Strength Training & Exercise Sets
================================================================================

This script extracts your personal strength workout data from Garmin Connect
without requiring enterprise API access:
  1. Authenticates via email/password using the unofficial `garminconnect` + `garth` library.
  2. Supports Multi-Factor Authentication (MFA) prompts.
  3. Caches session tokens locally so MFA and credentials aren't required every time.
  4. Filters for Strength Training activities.
  5. Extracts individual exercise sets, reps, and weights (handling Garmin's grams-to-kg units).
  6. Exports directly into CSV/JSON ready for the ATHX 2027 Hypertrophy Dashboard.

Prerequisites:
  pip install garminconnect
  or run with: uv run --with garminconnect python extract_garmin_strength.py
"""

from __future__ import annotations
import os
import sys
import json
import csv
import getpass
from datetime import datetime, timezone
from pathlib import Path

try:
    import garth
    from garminconnect import (
        Garmin,
        GarminConnectAuthenticationError,
        GarminConnectConnectionError,
        GarminConnectTooManyRequestsError,
    )
except ImportError:
    print("Error: 'garminconnect' library is not installed.")
    print("Please install it using: pip install garminconnect")
    print("Or run using uv: uv run --with garminconnect python extract_garmin_strength.py")
    sys.exit(1)

import athx_config


# ==============================================================================
# 1. CONFIGURATION & CREDENTIALS
# ==============================================================================
# You can set these directly, or export them in your terminal:
# export GARMIN_EMAIL="your_email@domain.com"
# export GARMIN_PASSWORD="your_password"
GARMIN_EMAIL = os.getenv("GARMIN_EMAIL", "your_garmin_email@example.com")
GARMIN_PASSWORD = os.getenv("GARMIN_PASSWORD", "")

# Directory where authentication tokens will be securely saved
SCRIPT_DIR = Path(__file__).resolve().parent
TOKEN_DIR = SCRIPT_DIR / "garmin_tokens"

# How many recent activities to inspect (Garmin returns activities in reverse chronological order)
ACTIVITIES_LIMIT = 250

# Output filenames — Strength Sets (Backward-compatible with dashboards)
OUTPUT_CSV = SCRIPT_DIR / "garmin_extracted_workouts.csv"
OUTPUT_JSON = SCRIPT_DIR / "garmin_extracted_workouts.json"
OUTPUT_VOL_JSON = SCRIPT_DIR / "garmin_workout_volume.json"

# Output filenames — Running Activities
OUTPUT_RUNNING_CSV = SCRIPT_DIR / "garmin_running_activities.csv"
OUTPUT_RUNNING_JSON = SCRIPT_DIR / "garmin_running_activities.json"

# Output filenames — Cardio / Other Workouts
OUTPUT_WORKOUTS_CSV = SCRIPT_DIR / "garmin_workout_activities.csv"
OUTPUT_WORKOUTS_JSON = SCRIPT_DIR / "garmin_workout_activities.json"

# Output filenames — Master Unified Activity Feed
OUTPUT_ALL_CSV = SCRIPT_DIR / "garmin_all_activities.csv"
OUTPUT_ALL_JSON = SCRIPT_DIR / "garmin_all_activities.json"



# ==============================================================================
# 2. AUTHENTICATION & MFA HANDLER
# ==============================================================================
def authenticate_garmin(email: str, password: str, token_dir: Path) -> Garmin:
    """
    Authenticates with Garmin Connect using token caching and MFA support.
    
    If tokens already exist in `token_dir`, it logs in immediately without prompting.
    Otherwise, it logs in with email/password, prompts for MFA if required,
    and caches the resulting OAuth tokens.
    """
    token_str = str(token_dir)
    garmin = Garmin(email, password)

    # Step 2a: Try logging in with cached session tokens
    if token_dir.exists():
        try:
            print(f"🔄 Found cached Garmin tokens in '{token_dir.name}'. Logging in...")
            garmin.login(tokenstore=token_str)
            print(f"✅ Successfully authenticated as: {garmin.display_name} ({garmin.full_name})")
            return garmin
        except Exception as e:
            print(f"⚠️  Cached tokens were expired or invalid ({e}). Proceeding to full login...")

    # Step 2b: Prompt for password if not provided in code or env
    if not password:
        if email == "your_garmin_email@example.com":
            email = input("Enter your Garmin Connect Email: ").strip()
            garmin.username = email
        password = getpass.getpass("Enter your Garmin Connect Password: ")
        garmin.password = password

    # Step 2c: Execute login with MFA prompt support
    print(f"\n🔐 Connecting to Garmin SSO for {email}...")
    try:
        # Garmin's SSO uses garth under the hood. If MFA is active, garth will automatically
        # invoke its MFA prompt callback (`input("MFA code: ")`).
        def mfa_callback():
            return input("\n📩 Enter the 6-digit MFA / Verification code sent to your email or SMS: ").strip()

        # Garth login with explicit custom MFA callback
        garmin.garth.login(email, password, prompt_mfa=mfa_callback)
        
        # Complete profile setup inside garminconnect
        garmin.display_name = garmin.garth.profile.get("displayName", "Athlete")
        garmin.full_name = garmin.garth.profile.get("fullName", garmin.display_name)

        # Save tokens for subsequent runs
        token_dir.mkdir(parents=True, exist_ok=True)
        garmin.garth.dump(token_str)
        print(f"💾 Session tokens successfully cached at: {token_dir}")
        print(f"✅ Logged in successfully as: {garmin.display_name} ({garmin.full_name})")
        return garmin

    except GarminConnectAuthenticationError as err:
        print(f"❌ Authentication failed: Invalid email, password, or MFA code: {err}")
        sys.exit(1)
    except GarminConnectTooManyRequestsError:
        print("❌ Garmin rate limit exceeded (Too many requests). Please wait a few minutes before retrying.")
        sys.exit(1)
    except Exception as err:
        print(f"❌ Unexpected error during login: {err}")
        sys.exit(1)


# ==============================================================================
# 3. HELPER FUNCTIONS: CLEANING & CONVERTING EXERCISES
# ==============================================================================
def format_exercise_name(raw_name: str | None) -> str:
    """Converts Garmin raw enum (e.g. 'BENCH_PRESS' or 'BARBELL_BENCH_PRESS') to Title Case."""
    if not raw_name:
        return "Unknown Exercise"
    clean = raw_name.replace("_", " ").title()
    return clean

def infer_session_type(activity_name: str, exercises: list[str]) -> str:
    """Infers Push, Pull, Legs, or Full Body split based on activity title or dominant muscle group."""
    name_low = activity_name.lower()
    if "push" in name_low:
        return "Push"
    if "pull" in name_low:
        return "Pull"
    if "leg" in name_low or "squat" in name_low:
        return "Legs"

    # Tally sets by muscle group split association
    tallies = {"Push": 0, "Pull": 0, "Legs": 0}
    for ex in exercises:
        m = athx_config.EXERCISE_MUSCLE_MAP.get(ex)
        if m:
            split = athx_config.MUSCLE_TO_SPLIT_MAP.get(m)
            if split in tallies:
                tallies[split] += 1

    total = sum(tallies.values())
    if total == 0:
        return "Full Body"

    top_split, count = max(tallies.items(), key=lambda x: x[1])
    if count / total >= 0.45:
        return top_split
    return "Full Body"



def clean_workout_category(type_key: str, name: str) -> str:
    """Maps raw Garmin activity types to clean human-readable categories."""
    t = (type_key or "").lower()
    n = (name or "").lower()
    if "cross" in n or "cross" in t or "hiit" in t:
        return "Cross-Training"
    if "indoor_cardio" in t or "cardio" in t:
        return "Cardio"
    if "bouldering" in t or "climbing" in t:
        return "Bouldering / Grip"
    if "hiking" in t or "hike" in n:
        return "Hiking / Ruck"
    if "walking" in t or "walk" in n:
        return "Walking / Active Recovery"
    if "cycling" in t or "bike" in n:
        return "Cycling"
    if "swimming" in t or "swim" in n:
        return "Swimming"
    if "mobility" in n or "stretch" in n or "yoga" in t:
        return "Mobility / Recovery"
    return type_key.replace("_", " ").title() if type_key else "Workout"


# ==============================================================================
# 4. EXTRACTION: STRENGTH, RUNNING, WORKOUTS & ALL ACTIVITIES
# ==============================================================================
def extract_all_garmin_activities(garmin: Garmin, limit: int = 250) -> dict[str, list[dict]]:
    """
    Pulls recent activities from Garmin Connect, and processes:
      1. Strength sets (with individual exercises, loads, reps, e1RM).
      2. Running activities (distance, duration, pace s/km, cadence, HR, VO2Max).
      3. Other workouts (indoor cardio, cross-training, hiking, bouldering).
      4. Unified master activities log.

    Uses smart local caching so existing sessions are not re-queried unnecessarily.
    """
    # 4a. Load existing caches
    cached_sets_by_id: dict[int, list[dict]] = {}
    if OUTPUT_JSON.exists():
        try:
            with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
                c_sets = json.load(f)
            for r in c_sets:
                aid = r.get("Activity_ID")
                if aid:
                    cached_sets_by_id.setdefault(aid, []).append(r)
            print(f"📦 Loaded {len(c_sets)} cached strength sets across {len(cached_sets_by_id)} sessions.")
        except Exception as e:
            print(f"⚠️ Could not read strength cache: {e}")

    cached_runs_by_id: dict[int, dict] = {}
    if OUTPUT_RUNNING_JSON.exists():
        try:
            with open(OUTPUT_RUNNING_JSON, "r", encoding="utf-8") as f:
                c_runs = json.load(f)
            for r in c_runs:
                aid = r.get("Activity_ID")
                if aid:
                    cached_runs_by_id[aid] = r
            print(f"📦 Loaded {len(c_runs)} cached running activities.")
        except Exception as e:
            print(f"⚠️ Could not read running cache: {e}")

    cached_workouts_by_id: dict[int, dict] = {}
    if OUTPUT_WORKOUTS_JSON.exists():
        try:
            with open(OUTPUT_WORKOUTS_JSON, "r", encoding="utf-8") as f:
                c_w = json.load(f)
            for r in c_w:
                aid = r.get("Activity_ID")
                if aid:
                    cached_workouts_by_id[aid] = r
            print(f"📦 Loaded {len(c_w)} cached workout activities.")
        except Exception as e:
            print(f"⚠️ Could not read workout cache: {e}")

    # 4b. Query activities list from Garmin Connect
    print(f"\n📡 Querying last {limit} activities from Garmin Connect...")
    activities = garmin.get_activities(0, limit)
    print(f"📥 Received {len(activities)} activities from Garmin Connect.")

    all_strength_sets: list[dict] = []
    all_running_records: list[dict] = []
    all_workout_records: list[dict] = []
    all_master_activities: list[dict] = []

    # 4c. Process each activity
    for idx, act in enumerate(activities, 1):
        act_id = act.get("activityId")
        act_name = act.get("activityName", "Activity")
        type_key = act.get("activityType", {}).get("typeKey", "").lower()
        start_time_local = act.get("startTimeLocal", "")
        date_str = start_time_local.split(" ")[0] if start_time_local else datetime.now().strftime("%Y-%m-%d")

        dur_s = float(act.get("duration", 0.0) or 0.0)
        dur_min = round(dur_s / 60.0, 1)
        dist_m = float(act.get("distance", 0.0) or 0.0)
        dist_km = round(dist_m / 1000.0, 2)
        calories = int(round(float(act.get("calories", 0.0) or 0.0)))
        avg_hr = act.get("averageHR")
        max_hr = act.get("maxHR")

        # Master Category
        master_category = "Workout"
        if "running" in type_key or "run" in type_key:
            master_category = "Running"
        elif "strength" in type_key or "strength" in act_name.lower():
            master_category = "Strength"
        elif "walk" in type_key or "hike" in type_key:
            master_category = "Outdoor / Endurance"
        elif "cardio" in type_key or "training" in type_key:
            master_category = "Cardio / Cross-Training"

        master_entry = {
            "Activity_ID": act_id,
            "Date": date_str,
            "Start_Time": start_time_local,
            "Activity_Name": act_name,
            "Activity_Type": type_key,
            "Primary_Category": master_category,
            "Duration_min": dur_min,
            "Distance_km": dist_km,
            "Calories_kcal": calories,
            "Average_HR": avg_hr,
            "Max_HR": max_hr,
            "Training_Effect": act.get("trainingEffectLabel", ""),
        }
        all_master_activities.append(master_entry)

        # ----------------------------------------------------------------------
        # Case A: RUNNING ACTIVITIES
        # ----------------------------------------------------------------------
        if "running" in type_key or (type_key in ["treadmill_running", "trail_running", "track_running"]) or ("run" in type_key and "strength" not in type_key):
            if act_id in cached_runs_by_id:
                all_running_records.append(cached_runs_by_id[act_id])
                continue

            avg_speed = float(act.get("averageSpeed", 0.0) or 0.0)
            pace_s_per_km = round(1000.0 / avg_speed, 1) if avg_speed > 0 else (round(dur_s / dist_km, 1) if dist_km > 0 else None)
            
            pace_formatted = "N/A"
            if pace_s_per_km and pace_s_per_km > 0:
                p_min = int(pace_s_per_km // 60)
                p_sec = int(round(pace_s_per_km % 60))
                pace_formatted = f"{p_min}:{p_sec:02d}/km"

            vo2_max = act.get("vO2MaxValue")
            cadence_spm = round(float(act.get("averageRunningCadenceInStepsPerMinute", 0.0) or 0.0), 1)
            fastest_1k = round(float(act.get("fastestSplit_1000", 0.0) or 0.0), 1) if act.get("fastestSplit_1000") else None
            fastest_5k = round(float(act.get("fastestSplit_5000", 0.0) or 0.0), 1) if act.get("fastestSplit_5000") else None

            run_entry = {
                "Activity_ID": act_id,
                "Date": date_str,
                "Start_Time": start_time_local,
                "Activity_Name": act_name,
                "Activity_Type": type_key,
                "Distance_km": dist_km,
                "Duration_min": dur_min,
                "Duration_s": round(dur_s, 1),
                "Average_Speed_ms": round(avg_speed, 3),
                "Pace_s_per_km": pace_s_per_km,
                "Pace_formatted": pace_formatted,
                "Average_HR": avg_hr,
                "Max_HR": max_hr,
                "Cadence_spm": cadence_spm,
                "VO2Max": vo2_max,
                "Elevation_Gain_m": round(float(act.get("elevationGain", 0.0) or 0.0), 1),
                "Elevation_Loss_m": round(float(act.get("elevationLoss", 0.0) or 0.0), 1),
                "Calories_kcal": calories,
                "Training_Effect_Label": act.get("trainingEffectLabel", ""),
                "Aerobic_TE_Message": act.get("aerobicTrainingEffectMessage", ""),
                "Anaerobic_TE_Message": act.get("anaerobicTrainingEffectMessage", ""),
                "Fastest_1k_s": fastest_1k,
                "Fastest_5k_s": fastest_5k,
                "Steps": act.get("steps", 0),
            }
            all_running_records.append(run_entry)
            print(f"🏃 [{idx}/{len(activities)}] Running: '{act_name}' on {date_str} — {dist_km} km in {dur_min} min ({pace_formatted}, HR: {avg_hr}, VO2Max: {vo2_max})")
            continue

        # ----------------------------------------------------------------------
        # Case B: STRENGTH TRAINING (Detailed Exercise Sets)
        # ----------------------------------------------------------------------
        is_strength = ("strength" in type_key or "strength" in act_name.lower())
        if is_strength:
            if act_id in cached_sets_by_id:
                all_strength_sets.extend(cached_sets_by_id[act_id])
                continue

            print(f"🏋️ [{idx}/{len(activities)}] Fetching sets: '{act_name}' (ID: {act_id}) on {date_str}...")
            try:
                exercise_data = garmin.get_activity_exercise_sets(act_id)
                exercise_sets = (exercise_data or {}).get("exerciseSets", [])
            except Exception as e:
                print(f"   ⚠️ Could not fetch exercise sets for {act_id}: {e}")
                exercise_sets = []

            active_sets = [
                s for s in exercise_sets
                if s.get("setType") == "ACTIVE" or (s.get("repetitionCount") and s.get("repetitionCount") > 0)
            ]

            if not active_sets:
                w_cat = clean_workout_category(type_key, act_name)
                w_entry = {
                    "Activity_ID": act_id,
                    "Date": date_str,
                    "Start_Time": start_time_local,
                    "Activity_Name": act_name,
                    "Activity_Type": type_key,
                    "Category": w_cat,
                    "Duration_min": dur_min,
                    "Calories_kcal": calories,
                    "Average_HR": avg_hr,
                    "Max_HR": max_hr,
                    "Training_Effect_Label": act.get("trainingEffectLabel", ""),
                    "Moderate_Intensity_Min": act.get("moderateIntensityMinutes", 0),
                    "Vigorous_Intensity_Min": act.get("vigorousIntensityMinutes", 0),
                    "Steps": act.get("steps", 0),
                    "Distance_km": dist_km,
                }
                all_workout_records.append(w_entry)
                continue

            exercise_counter: dict[str, int] = {}
            all_exercises_in_session: list[str] = []
            session_extracted_sets: list[dict] = []

            for s in active_sets:
                ex_list = s.get("exercises", [])
                raw_ex = None
                if ex_list:
                    for ex_item in ex_list:
                        raw_ex = ex_item.get("name") or ex_item.get("category")
                        if raw_ex:
                            break
                if not raw_ex:
                    raw_ex = "Strength Exercise"

                ex_name = format_exercise_name(raw_ex)
                all_exercises_in_session.append(ex_name)
                exercise_counter[ex_name] = exercise_counter.get(ex_name, 0) + 1
                set_num = exercise_counter[ex_name]

                reps = s.get("repetitionCount", 0) or 0
                raw_weight = s.get("weight") or 0.0
                if raw_weight > 500:
                    weight_kg = round(raw_weight / 1000.0, 1)
                elif raw_weight > 0:
                    weight_kg = round(float(raw_weight), 1)
                else:
                    weight_kg = 0.0

                duration_set_s = s.get("duration", 0.0) or 0.0

                plausible = True
                if ex_name in athx_config.PLAUSIBLE_LOAD_RANGES:
                    min_p, max_p = athx_config.PLAUSIBLE_LOAD_RANGES[ex_name]
                    if weight_kg < min_p or weight_kg > max_p:
                        plausible = False

                if plausible and 0 < reps <= athx_config.E1RM_MAX_REPS and weight_kg > 0:
                    e1rm = round(weight_kg * (1.0 + reps / 30.0), 1)
                else:
                    e1rm = None

                record = {
                    "Activity_ID": act_id,
                    "Date": date_str,
                    "Activity_Name": act_name,
                    "Exercise": ex_name,
                    "Set": set_num,
                    "Reps": reps,
                    "Weight_kg": weight_kg,
                    "Total_Volume_kg": round(reps * weight_kg, 1),
                    "e1RM_kg": e1rm,
                    "Duration_s": round(duration_set_s, 1),
                }
                session_extracted_sets.append(record)

            session_type = infer_session_type(act_name, all_exercises_in_session)
            for r in session_extracted_sets:
                r["Session_Type"] = session_type

            all_strength_sets.extend(session_extracted_sets)
            session_vol = sum(r["Total_Volume_kg"] for r in session_extracted_sets)
            print(f"   ✅ Extracted {len(active_sets)} sets across {len(exercise_counter)} exercises ({session_vol:,.0f} kg volume) [Split: {session_type}]")
            continue

        # ----------------------------------------------------------------------
        # Case C: OTHER WORKOUTS (Cardio, Cross-Training, Hiking, Bouldering, Walking)
        # ----------------------------------------------------------------------
        if act_id in cached_workouts_by_id:
            all_workout_records.append(cached_workouts_by_id[act_id])
            continue

        category = clean_workout_category(type_key, act_name)
        workout_entry = {
            "Activity_ID": act_id,
            "Date": date_str,
            "Start_Time": start_time_local,
            "Activity_Name": act_name,
            "Activity_Type": type_key,
            "Category": category,
            "Duration_min": dur_min,
            "Distance_km": dist_km,
            "Calories_kcal": calories,
            "Average_HR": avg_hr,
            "Max_HR": max_hr,
            "Training_Effect_Label": act.get("trainingEffectLabel", ""),
            "Moderate_Intensity_Min": act.get("moderateIntensityMinutes", 0),
            "Vigorous_Intensity_Min": act.get("vigorousIntensityMinutes", 0),
            "Steps": act.get("steps", 0),
        }
        all_workout_records.append(workout_entry)
        print(f"⚡ [{idx}/{len(activities)}] Workout: '{act_name}' ({category}) on {date_str} — {dur_min} min, {calories} kcal, HR: {avg_hr}")

    return {
        "strength_sets": all_strength_sets,
        "running_activities": all_running_records,
        "workout_activities": all_workout_records,
        "all_activities": all_master_activities,
    }


# ==============================================================================
# 5. BACKWARD-COMPATIBLE WRAPPER
# ==============================================================================
def extract_strength_workouts(garmin: Garmin, limit: int = 250) -> list[dict]:
    """Preserves full backward compatibility with scripts expecting only strength sets."""
    data = extract_all_garmin_activities(garmin, limit=limit)
    return data["strength_sets"]


# ==============================================================================
# 6. EXPORT & REPORTING
# ==============================================================================
def save_results(records: list[dict], csv_path: Path, json_path: Path):
    """Backward-compatible strength sets exporter."""
    if not records:
        print("\nNo workout sets to save.")
        return

    fieldnames = [
        "Date", "Session_Type", "Exercise", "Set", "Reps", 
        "Weight_kg", "Total_Volume_kg", "e1RM_kg", "Duration_s", "Activity_ID"
    ]
    records.sort(key=lambda x: (x.get("Date", ""), x.get("Set", 0)))
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)
    print(f"\n💾 Saved {len(records)} workout sets to CSV: {csv_path}")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    print(f"💾 Saved JSON export to: {json_path}")

    with open(OUTPUT_VOL_JSON, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    print(f"💾 Saved Volume JSON export to: {OUTPUT_VOL_JSON}")


def save_all_results(data: dict[str, list[dict]]):
    """Saves strength, running, workouts, and unified datasets to CSV and JSON."""
    strength_records = data.get("strength_sets", [])
    running_records = data.get("running_activities", [])
    workout_records = data.get("workout_activities", [])
    all_activities = data.get("all_activities", [])

    # 1. Save Strength Sets
    save_results(strength_records, OUTPUT_CSV, OUTPUT_JSON)

    # 2. Save Running Activities
    running_records.sort(key=lambda x: x.get("Start_Time", ""), reverse=True)
    if running_records:
        fieldnames_running = list(running_records[0].keys())
        with open(OUTPUT_RUNNING_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames_running, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(running_records)
        print(f"💾 Saved {len(running_records)} running sessions to CSV: {OUTPUT_RUNNING_CSV.name}")

        with open(OUTPUT_RUNNING_JSON, "w", encoding="utf-8") as f:
            json.dump(running_records, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved Running JSON: {OUTPUT_RUNNING_JSON.name}")

    # 3. Save Workout Activities
    workout_records.sort(key=lambda x: x.get("Start_Time", ""), reverse=True)
    if workout_records:
        fieldnames_workouts = list(workout_records[0].keys())
        with open(OUTPUT_WORKOUTS_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames_workouts, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(workout_records)
        print(f"💾 Saved {len(workout_records)} cardio/workout sessions to CSV: {OUTPUT_WORKOUTS_CSV.name}")

        with open(OUTPUT_WORKOUTS_JSON, "w", encoding="utf-8") as f:
            json.dump(workout_records, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved Workout JSON: {OUTPUT_WORKOUTS_JSON.name}")

    # 4. Save Master Unified Activities
    all_activities.sort(key=lambda x: x.get("Start_Time", ""), reverse=True)
    if all_activities:
        fieldnames_all = list(all_activities[0].keys())
        with open(OUTPUT_ALL_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames_all, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(all_activities)
        print(f"💾 Saved {len(all_activities)} master activities to CSV: {OUTPUT_ALL_CSV.name}")

        with open(OUTPUT_ALL_JSON, "w", encoding="utf-8") as f:
            json.dump(all_activities, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved Master Activities JSON: {OUTPUT_ALL_JSON.name}")

    # --------------------------------------------------------------------------
    # Console Summary Table
    # --------------------------------------------------------------------------
    total_vol = sum(r.get("Total_Volume_kg", 0.0) for r in strength_records)
    total_reps = sum(r.get("Reps", 0) for r in strength_records)
    strength_sessions = len(set(r.get("Activity_ID") for r in strength_records))
    
    total_run_dist = sum(r.get("Distance_km", 0.0) for r in running_records)
    total_run_time = sum(r.get("Duration_min", 0.0) for r in running_records)
    best_pace_str = min((r.get("Pace_formatted") for r in running_records if r.get("Pace_formatted") and r.get("Pace_formatted") != "N/A"), default="N/A")
    latest_vo2 = next((r.get("VO2Max") for r in running_records if r.get("VO2Max")), "N/A")

    total_workout_time = sum(r.get("Duration_min", 0.0) for r in workout_records)
    total_workout_cals = sum(r.get("Calories_kcal", 0) for r in workout_records)

    print("\n" + "=" * 80)
    print("📊 UNIFIED GARMIN CONNECT EXTRACTION SUMMARY")
    print("=" * 80)
    print(f"🏋️  STRENGTH SESSIONS   : {strength_sessions} sessions | {len(strength_records)} sets | {total_reps:,} reps | {total_vol:,.1f} kg volume")
    print(f"🏃  RUNNING SESSIONS    : {len(running_records)} runs | {total_run_dist:.2f} km | {total_run_time:.1f} min | Best Pace: {best_pace_str} | VO2Max: {latest_vo2}")
    print(f"⚡  OTHER WORKOUTS      : {len(workout_records)} sessions | {total_workout_time:.1f} min | {total_workout_cals:,} kcal burned")
    print(f"📁  ALL RECORDED SESSIONS: {len(all_activities)} activities indexed across Garmin ecosystem")
    print("=" * 80)


# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================
if __name__ == "__main__":
    print("================================================================================")
    print("🚀 GARMIN CONNECT UNIFIED TRAINING EXTRACTOR (STRENGTH, RUNNING & WORKOUTS)")
    print("================================================================================")
    
    garmin_client = authenticate_garmin(GARMIN_EMAIL, GARMIN_PASSWORD, TOKEN_DIR)
    extracted_data = extract_all_garmin_activities(garmin_client, limit=ACTIVITIES_LIMIT)
    save_all_results(extracted_data)

