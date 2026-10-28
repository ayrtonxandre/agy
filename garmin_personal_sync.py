#!/usr/bin/env python3
"""
================================================================================
ATHX 2027 — Official Garmin Connect Personal API Synchronizer
================================================================================

Performs end-to-end headless synchronization with Garmin Connect via the official
Personal API:
  1. Synchronizes activities (Strength sets, Running dynamics, Cardio/CrossFit).
  2. Extracts native `SummarizedExerciseSet` with reps, volume, maxWeight & velocity.
  3. Deciphers WOD notes via `garmin_note_parser`.
  4. Ingests continuous multi-day overnight HRV records into `garmin_hrv_summary.json`.
  5. Ingests continuous multi-day sleep records with dynamic `sleepNeed` and naps
     into `garmin_sleep_summary.json`.
  6. Ingests 90-day daily wellness summaries into `garmin_daily_summaries.json`.
  7. Updates all CSV and JSON data contracts for ATHX 2027 Dashboard.
================================================================================
"""

from __future__ import annotations
import os
import sys
import json
import csv
from datetime import datetime, date, timedelta, timezone
from pathlib import Path

import athx_config
import garmin_note_parser
from garmin_personal_client import GarminPersonalClient


SCRIPT_DIR = Path(__file__).resolve().parent
TOKEN_DIR = SCRIPT_DIR / "garmin_tokens"

OUTPUT_CSV = SCRIPT_DIR / "garmin_extracted_workouts.csv"
OUTPUT_JSON = SCRIPT_DIR / "garmin_extracted_workouts.json"
OUTPUT_VOL_JSON = SCRIPT_DIR / "garmin_workout_volume.json"
OUTPUT_RUNNING_CSV = SCRIPT_DIR / "garmin_running_activities.csv"
OUTPUT_RUNNING_JSON = SCRIPT_DIR / "garmin_running_activities.json"
OUTPUT_WORKOUTS_CSV = SCRIPT_DIR / "garmin_workout_activities.csv"
OUTPUT_WORKOUTS_JSON = SCRIPT_DIR / "garmin_workout_activities.json"
OUTPUT_ALL_CSV = SCRIPT_DIR / "garmin_all_activities.csv"
OUTPUT_ALL_JSON = SCRIPT_DIR / "garmin_all_activities.json"

OUTPUT_HRV_JSON = SCRIPT_DIR / "garmin_hrv_summary.json"
OUTPUT_SLEEP_JSON = SCRIPT_DIR / "garmin_sleep_summary.json"
OUTPUT_DAILY_SUMMARIES_JSON = SCRIPT_DIR / "garmin_daily_summaries.json"


def format_exercise_name(raw_name: str) -> str:
    """Standardizes exercise names into clean Title Case."""
    if not raw_name:
        return "Strength Exercise"
    clean = raw_name.replace("_", " ").strip()
    words = clean.split()
    return " ".join(w.capitalize() for w in words)


def infer_session_type(activity_name: str, exercises: list[str]) -> str:
    """Classifies strength session into training split."""
    lower_name = activity_name.lower()
    if "gym session a" in lower_name or "leg" in lower_name or "squat" in lower_name:
        return "Lower Body (Squat Focus)"
    if "gym session b" in lower_name or "deadlift" in lower_name or "pull" in lower_name:
        return "Upper / Posterior Pull"
    if "push" in lower_name or "bench" in lower_name or "s2o" in lower_name:
        return "Upper Push / Shoulders"
    if "crossfit" in lower_name or "wod" in lower_name:
        return "CrossFit WOD"

    ex_text = " ".join(exercises).lower()
    if any(k in ex_text for k in ["squat", "leg press", "lunge", "calf"]):
        return "Lower Body"
    if any(k in ex_text for k in ["bench", "press", "push", "dip"]):
        return "Upper Push"
    if any(k in ex_text for k in ["pull", "row", "chin", "curl", "deadlift"]):
        return "Upper Pull"
    return "Full Body / Hypertrophy"


def clean_workout_category(type_key: str, name: str) -> str:
    """Maps activity type keys to athlete display categories."""
    t = type_key.lower()
    n = name.lower()
    if "crossfit" in n or "indoor_cardio" in t:
        return "CrossFit"
    if "strength" in t or "strength" in n:
        return "Strength"
    if "running" in t or "run" in t:
        return "Running"
    if "rowing" in t:
        return "Rowing / Erg"
    if "paddel" in t or "squash" in t or "tennis" in t:
        return "Racket Sports"
    if "hike" in t or "walk" in t:
        return "Outdoor / Endurance"
    return "Conditioning / Cardio"


def sync_garmin_personal(limit: int = 100, days_history: int = 45) -> dict:
    """Executes full sync against the official Garmin Personal API."""
    print("================================================================================")
    print("🚀 ATHX 2027 — GARMIN CONNECT OFFICIAL PERSONAL API SYNC")
    print("================================================================================")

    client = GarminPersonalClient(tokens_dir=TOKEN_DIR)
    tok = client.get_token()
    print(f"🔑 Official Garmin Personal Bearer Token Active (TTL: {round((client._expires_at - datetime.now().timestamp())/3600, 1)}h)")

    # 1. Load local cache to preserve notes/history
    cached_sets_by_id: dict[int, list[dict]] = {}
    if OUTPUT_JSON.exists():
        try:
            with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
                c_sets = json.load(f)
            for r in c_sets:
                aid = r.get("Activity_ID")
                if aid:
                    cached_sets_by_id.setdefault(aid, []).append(r)
        except Exception:
            pass

    # 2. Query Activities
    print(f"\n📡 Querying last {limit} activities from official Personal API...")
    activities = client.search_activities(start=0, limit=limit)
    print(f"📥 Received {len(activities)} activities from Garmin Connect.")

    all_strength_sets: list[dict] = []
    all_running_records: list[dict] = []
    all_workout_records: list[dict] = []
    all_master_activities: list[dict] = []

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
        desc = (act.get("description") or "").strip()

        # Master Category
        master_category = "Workout"
        if "running" in type_key or "run" in type_key:
            master_category = "Running"
        elif "strength" in type_key or "strength" in act_name.lower():
            master_category = "Strength"
        elif "walk" in type_key or "hike" in type_key:
            master_category = "Outdoor / Endurance"
        elif "cardio" in type_key or "training" in type_key or "indoor_cardio" in type_key:
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
        if desc:
            master_entry["Notes"] = desc
        all_master_activities.append(master_entry)

        # ----------------------------------------------------------------------
        # Case A: RUNNING ACTIVITIES (with Biomechanics)
        # ----------------------------------------------------------------------
        is_running = "running" in type_key or (type_key in ["treadmill_running", "trail_running", "track_running"]) or ("run" in type_key and "strength" not in type_key)
        if is_running:
            avg_speed = float(act.get("averageSpeed", 0.0) or 0.0)
            pace_s_per_km = round(1000.0 / avg_speed, 1) if avg_speed > 0 else (round(dur_s / dist_km, 1) if dist_km > 0 else None)
            pace_formatted = "N/A"
            if pace_s_per_km and pace_s_per_km > 0:
                p_min = int(pace_s_per_km // 60)
                p_sec = int(round(pace_s_per_km % 60))
                pace_formatted = f"{p_min}:{p_sec:02d}/km"

            cadence_spm = round(float(act.get("averageRunningCadenceInStepsPerMinute", 0.0) or 0.0), 1)
            gct_ms = act.get("avgGroundContactTime")
            vert_osc_cm = act.get("avgVerticalOscillation")
            vert_ratio = act.get("avgVerticalRatio")
            gct_balance = act.get("avgGroundContactBalance")
            gap_speed = act.get("avgGradeAdjustedSpeed")

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
                "VO2Max": act.get("vO2MaxValue"),
                "Elevation_Gain_m": round(float(act.get("elevationGain", 0.0) or 0.0), 1),
                "Elevation_Loss_m": round(float(act.get("elevationLoss", 0.0) or 0.0), 1),
                "Calories_kcal": calories,
                "Training_Effect_Label": act.get("trainingEffectLabel", ""),
                "Aerobic_TE_Message": act.get("aerobicTrainingEffectMessage", ""),
                "Anaerobic_TE_Message": act.get("anaerobicTrainingEffectMessage", ""),
                "Fastest_1k_s": act.get("fastestSplit_1000"),
                "Fastest_5k_s": act.get("fastestSplit_5000"),
                "Steps": act.get("steps", 0),
                # Advanced Garmin Biometrics
                "Ground_Contact_Time_ms": round(float(gct_ms), 1) if gct_ms is not None else None,
                "Vertical_Oscillation_cm": round(float(vert_osc_cm), 2) if vert_osc_cm is not None else None,
                "Vertical_Ratio_pct": round(float(vert_ratio), 2) if vert_ratio is not None else None,
                "Ground_Contact_Balance_pct": round(float(gct_balance), 1) if gct_balance is not None else None,
                "Grade_Adjusted_Speed_ms": round(float(gap_speed), 3) if gap_speed is not None else None,
                "Training_Load": act.get("activityTrainingLoad"),
            }
            all_running_records.append(run_entry)
            print(f"🏃 [{idx}/{len(activities)}] Running: '{act_name}' on {date_str} — {dist_km} km in {dur_min} min ({pace_formatted})")
            continue

        # ----------------------------------------------------------------------
        # Case B: STRENGTH TRAINING (Native SummarizedExerciseSets + WOD Notes)
        # ----------------------------------------------------------------------
        is_strength = ("strength" in type_key or "strength" in act_name.lower())
        if is_strength:
            summarized_sets = act.get("summarizedExerciseSets", [])

            session_extracted_sets: list[dict] = []
            all_exercises_in_session: list[str] = []

            if summarized_sets:
                for s in summarized_sets:
                    cat = s.get("subCategory") or s.get("category") or "Strength Exercise"
                    ex_name = format_exercise_name(cat)
                    sets_count = int(s.get("sets", 1) or 1)
                    tot_reps = int(s.get("reps", 0) or 0)
                    reps_per_set = max(1, tot_reps // sets_count) if sets_count > 0 else tot_reps
                    raw_max_weight = float(s.get("maxWeight", 0.0) or 0.0)
                    weight_kg = round(raw_max_weight / 1000.0, 1) if raw_max_weight > 500 else round(raw_max_weight, 1)

                    raw_vol = float(s.get("volume", 0.0) or 0.0)
                    total_vol_kg = round(raw_vol / 1000.0, 1) if raw_vol > 500 else round(reps_per_set * sets_count * weight_kg, 1)

                    mean_vel = s.get("concentricMeanVelocity")
                    peak_power = s.get("peakPower")

                    # Generate individual set entries
                    for s_idx in range(1, sets_count + 1):
                        all_exercises_in_session.append(ex_name)
                        e1rm = round(weight_kg * (1.0 + reps_per_set / 30.0), 1) if (weight_kg > 0 and 0 < reps_per_set <= 30) else None
                        set_record = {
                            "Activity_ID": act_id,
                            "Date": date_str,
                            "Activity_Name": act_name,
                            "Exercise": ex_name,
                            "Set": s_idx,
                            "Reps": reps_per_set,
                            "Weight_kg": weight_kg,
                            "Total_Volume_kg": round(total_vol_kg / sets_count, 1) if sets_count > 0 else total_vol_kg,
                            "e1RM_kg": e1rm,
                            "Duration_s": round(float(s.get("duration", 0.0) or 0.0) / 1000.0, 1) if s.get("duration") else None,
                            "Concentric_Velocity_cm_ms": round(float(mean_vel), 3) if mean_vel is not None else None,
                            "Peak_Power_W": round(float(peak_power), 1) if peak_power is not None else None,
                        }
                        session_extracted_sets.append(set_record)

            # If no sets recorded on watch, check if user wrote exercises in note/description
            if not session_extracted_sets and desc:
                note_sets, parsed_info = garmin_note_parser.convert_note_to_strength_records(
                    act_id, date_str, act_name, desc
                )
                if note_sets:
                    session_extracted_sets.extend(note_sets)
                    print(f"   🏋️ [{idx}/{len(activities)}] [WOD Note Deciphered ({parsed_info.get('parser_used', 'LLM')})]: {len(note_sets)} sets from '{act_name}'")

            if session_extracted_sets:
                session_type = infer_session_type(act_name, all_exercises_in_session)
                for r in session_extracted_sets:
                    r["Session_Type"] = session_type
                all_strength_sets.extend(session_extracted_sets)
                session_vol = sum(r["Total_Volume_kg"] for r in session_extracted_sets)
                print(f"🏋️ [{idx}/{len(activities)}] Strength: '{act_name}' on {date_str} — {len(session_extracted_sets)} sets ({session_vol:,.0f} kg volume) [Split: {session_type}]")
                continue

            # If strength activity has no sets, record as workout
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
            if desc:
                w_entry["Notes"] = desc
            all_workout_records.append(w_entry)
            continue

        # ----------------------------------------------------------------------
        # Case C: OTHER WORKOUTS (Cardio, CrossFit WODs, Rowing)
        # ----------------------------------------------------------------------
        if desc:
            note_sets, parsed_info = garmin_note_parser.convert_note_to_strength_records(
                act_id, date_str, act_name, desc
            )
            if note_sets:
                all_strength_sets.extend(note_sets)
                print(f"🏋️ [{idx}/{len(activities)}] [CrossFit WOD Note Deciphered ({parsed_info.get('parser_used', 'LLM')})]: {len(note_sets)} sets from '{act_name}'")

        category = clean_workout_category(type_key, act_name)
        workout_entry = {
            "Activity_ID": act_id,
            "Date": date_str,
            "Start_Time": start_time_local,
            "Activity_Name": act_name,
            "Activity_Type": type_key,
            "Category": category,
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
        if desc:
            workout_entry["Notes"] = desc
        all_workout_records.append(workout_entry)

    # 3. Synchronize HRV Range
    print(f"\n💓 Querying overnight HRV range for last {days_history} days...")
    today = date.today()
    start_history = today - timedelta(days=days_history)
    try:
        hrv_records = client.get_hrv_range(start_history, today)
        valid_hrvs = [h for h in hrv_records if h.get("lastNightAvg")]
        print(f"📥 Received {len(hrv_records)} HRV records ({len(valid_hrvs)} nights with lastNightAvg).")
        with open(OUTPUT_HRV_JSON, "w", encoding="utf-8") as f:
            json.dump(hrv_records, f, indent=2)
        print(f"💾 Saved overnight HRV dataset to: {OUTPUT_HRV_JSON.name}")
    except Exception as e:
        print(f"⚠️ Could not sync HRV range: {e}")
        hrv_records = []

    # 4. Synchronize Sleep Range
    print(f"\n💤 Querying daily sleep range for last {min(31, days_history)} days...")
    start_sleep = today - timedelta(days=min(30, days_history))
    try:
        sleep_records = client.get_sleep_range(start_sleep, today)
        valid_sleeps = [s for s in sleep_records if s.get("sleepTimeSeconds")]
        print(f"📥 Received {len(sleep_records)} sleep records ({len(valid_sleeps)} nights recorded).")
        with open(OUTPUT_SLEEP_JSON, "w", encoding="utf-8") as f:
            json.dump(sleep_records, f, indent=2)
        print(f"💾 Saved daily sleep dataset to: {OUTPUT_SLEEP_JSON.name}")
    except Exception as e:
        print(f"⚠️ Could not sync sleep range: {e}")
        sleep_records = []

    # 5. Synchronize Longitudinal Daily Wellness Summaries (90 days)
    print(f"\n📊 Querying longitudinal wellness summaries for last 90 days...")
    start_wellness = today - timedelta(days=90)
    try:
        daily_summaries = client.get_daily_summaries(start_wellness, today)
        print(f"📥 Received {len(daily_summaries)} daily wellness summaries.")
        with open(OUTPUT_DAILY_SUMMARIES_JSON, "w", encoding="utf-8") as f:
            json.dump(daily_summaries, f, indent=2)
        print(f"💾 Saved daily wellness dataset to: {OUTPUT_DAILY_SUMMARIES_JSON.name}")
    except Exception as e:
        print(f"⚠️ Could not sync daily summaries: {e}")
        daily_summaries = []

    # 6. Save Activities Datasets
    print("\n💾 Saving structured activity feeds...")
    # Strength Sets
    all_strength_sets.sort(key=lambda x: (x.get("Date", ""), x.get("Activity_ID", 0), x.get("Set", 0)), reverse=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_strength_sets, f, indent=2)
    with open(OUTPUT_VOL_JSON, "w", encoding="utf-8") as f:
        json.dump(all_strength_sets, f, indent=2)
    if all_strength_sets:
        with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(all_strength_sets[0].keys()), extrasaction="ignore")
            writer.writeheader()
            writer.writerows(all_strength_sets)
    print(f"✔ Strength sets: {len(all_strength_sets)} records -> {OUTPUT_JSON.name} & {OUTPUT_VOL_JSON.name}")

    # Running Activities
    all_running_records.sort(key=lambda x: x.get("Start_Time", ""), reverse=True)
    with open(OUTPUT_RUNNING_JSON, "w", encoding="utf-8") as f:
        json.dump(all_running_records, f, indent=2)
    if all_running_records:
        with open(OUTPUT_RUNNING_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(all_running_records[0].keys()), extrasaction="ignore")
            writer.writeheader()
            writer.writerows(all_running_records)
    print(f"✔ Running activities: {len(all_running_records)} records -> {OUTPUT_RUNNING_JSON.name}")

    # Workout Activities
    all_workout_records.sort(key=lambda x: x.get("Start_Time", ""), reverse=True)
    with open(OUTPUT_WORKOUTS_JSON, "w", encoding="utf-8") as f:
        json.dump(all_workout_records, f, indent=2)
    if all_workout_records:
        with open(OUTPUT_WORKOUTS_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(all_workout_records[0].keys()), extrasaction="ignore")
            writer.writeheader()
            writer.writerows(all_workout_records)
    print(f"✔ Other workouts: {len(all_workout_records)} records -> {OUTPUT_WORKOUTS_JSON.name}")

    # Master Activities
    all_master_activities.sort(key=lambda x: x.get("Start_Time", ""), reverse=True)
    with open(OUTPUT_ALL_JSON, "w", encoding="utf-8") as f:
        json.dump(all_master_activities, f, indent=2)
    if all_master_activities:
        with open(OUTPUT_ALL_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(all_master_activities[0].keys()), extrasaction="ignore")
            writer.writeheader()
            writer.writerows(all_master_activities)
    print(f"✔ Master activity feed: {len(all_master_activities)} records -> {OUTPUT_ALL_JSON.name}")

    print("\n✅ Garmin Personal API Synchronization completed successfully!")
    return {
        "strength_sets": len(all_strength_sets),
        "running_activities": len(all_running_records),
        "workout_activities": len(all_workout_records),
        "master_activities": len(all_master_activities),
        "hrv_records": len(hrv_records),
        "sleep_records": len(sleep_records),
        "daily_summaries": len(daily_summaries),
    }


if __name__ == "__main__":
    sync_garmin_personal()
