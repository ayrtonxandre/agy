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
ACTIVITIES_LIMIT = 50

# Output filenames
OUTPUT_CSV = SCRIPT_DIR / "garmin_extracted_workouts.csv"
OUTPUT_JSON = SCRIPT_DIR / "garmin_extracted_workouts.json"


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
    """Infers Push, Pull, or Legs split based on activity title or exercises."""
    name_low = activity_name.lower()
    if "push" in name_low:
        return "Push"
    if "pull" in name_low:
        return "Pull"
    if "leg" in name_low or "squat" in name_low:
        return "Legs"

    # Inspect exercise keywords
    ex_str = " ".join(exercises).lower()
    if any(k in ex_str for k in ["squat", "press", "quad", "lunge", "calf", "hamstring"]):
        return "Legs"
    if any(k in ex_str for k in ["curl", "row", "pull", "lat", "chin"]):
        return "Pull"
    if any(k in ex_str for k in ["bench", "chest", "shoulder", "tricep", "dip"]):
        return "Push"
    return "Strength"


# ==============================================================================
# 4. EXTRACTION: STRENGTH ACTIVITIES & DETAILED EXERCISE SETS
# ==============================================================================
def extract_strength_workouts(garmin: Garmin, limit: int = 50) -> list[dict]:
    """
    Pulls recent activities, filters for strength training,
    and calls `get_activity_exercise_sets` for each to extract sets, reps, and weights.
    """
    print(f"\n📡 Querying last {limit} activities from Garmin Connect...")
    activities = garmin.get_activities(0, limit)
    
    # Filter for strength training activities
    strength_activities = [
        act for act in activities
        if act.get("activityType", {}).get("typeKey") in ["strength_training", "training"]
        or "strength" in act.get("activityType", {}).get("typeKey", "").lower()
        or "strength" in act.get("activityName", "").lower()
    ]

    print(f"🏋️  Found {len(strength_activities)} Strength Training sessions out of {len(activities)} activities.")
    if not strength_activities:
        print("No strength training activities found in the requested range.")
        return []

    extracted_records = []

    for idx, act in enumerate(strength_activities, 1):
        act_id = act.get("activityId")
        act_name = act.get("activityName", "Strength Workout")
        start_time_local = act.get("startTimeLocal", "")
        # Format date as YYYY-MM-DD
        date_str = start_time_local.split(" ")[0] if start_time_local else datetime.now().strftime("%Y-%m-%d")

        print(f"\n[{idx}/{len(strength_activities)}] Processing: '{act_name}' (ID: {act_id}) on {date_str}...")

        try:
            # Call Garmin Connect API for set-by-set exercise data
            exercise_data = garmin.get_activity_exercise_sets(act_id)
            exercise_sets = exercise_data.get("exerciseSets", [])
        except Exception as e:
            print(f"   ⚠️ Could not fetch exercise sets for {act_id}: {e}")
            continue

        # Keep only active sets (filter out rest intervals)
        active_sets = [
            s for s in exercise_sets
            if s.get("setType") == "ACTIVE" or (s.get("repetitionCount") and s.get("repetitionCount") > 0)
        ]

        if not active_sets:
            print(f"   ℹ️  No active sets logged on watch for this session.")
            continue

        # Group and track set numbers per exercise
        exercise_counter = {}
        all_exercises_in_session = []

        for s in active_sets:
            # Exercise name resolution from exercises array
            ex_list = s.get("exercises", [])
            raw_ex = None
            if ex_list:
                # Pick the first non-null name or category
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
            
            # Garmin stores weight in GRAMS (e.g. 50,000 g = 50 kg)
            raw_weight = s.get("weight") or 0.0
            if raw_weight > 500:
                weight_kg = round(raw_weight / 1000.0, 1)
            elif raw_weight > 0:
                weight_kg = round(float(raw_weight), 1)
            else:
                weight_kg = 0.0

            duration_s = s.get("duration", 0.0) or 0.0

            # Epley Estimated 1RM
            e1rm = round(weight_kg * (1 + reps / 30.0), 1) if reps > 0 and weight_kg > 0 else weight_kg

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
                "Duration_s": round(duration_s, 1),
            }
            extracted_records.append(record)

        # Infer split (Push, Pull, Legs) for this session
        session_type = infer_session_type(act_name, all_exercises_in_session)
        for r in extracted_records:
            if r["Activity_ID"] == act_id:
                r["Session_Type"] = session_type

        session_vol = sum(r["Total_Volume_kg"] for r in extracted_records if r["Activity_ID"] == act_id)
        print(f"   ✅ Extracted {len(active_sets)} sets across {len(exercise_counter)} exercises ({session_vol:,.0f} kg volume) [Split: {session_type}]")

    return extracted_records


# ==============================================================================
# 5. EXPORT & REPORTING
# ==============================================================================
def save_results(records: list[dict], csv_path: Path, json_path: Path):
    if not records:
        print("\nNo workout sets to save.")
        return

    # Export to CSV (Dashboard compatible)
    fieldnames = [
        "Date", "Session_Type", "Exercise", "Set", "Reps", 
        "Weight_kg", "Total_Volume_kg", "e1RM_kg", "Duration_s", "Activity_ID"
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)
    print(f"\n💾 Saved {len(records)} workout sets to CSV: {csv_path}")

    # Export to JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    print(f"💾 Saved JSON export to: {json_path}")

    # Console Summary Table
    print("\n" + "=" * 80)
    print("📊 RECENT WORKOUT EXTRACTION SUMMARY")
    print("=" * 80)
    total_vol = sum(r["Total_Volume_kg"] for r in records)
    total_reps = sum(r["Reps"] for r in records)
    total_sets = len(records)
    unique_days = len(set(r["Date"] for r in records))
    
    print(f"• Total Sessions Analyzed : {len(set(r['Activity_ID'] for r in records))}")
    print(f"• Unique Training Days    : {unique_days}")
    print(f"• Total Sets Logged       : {total_sets}")
    print(f"• Total Reps Completed    : {total_reps:,}")
    print(f"• Total Tonnage Lifted    : {total_vol:,.1f} kg")
    print("=" * 80)


# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================
if __name__ == "__main__":
    print("================================================================================")
    print("🚀 GARMIN CONNECT STRENGTH WORKOUT EXTRACTOR")
    print("================================================================================")
    
    # 1. Authenticate (handles credentials, MFA prompt, and local token storage)
    garmin_client = authenticate_garmin(GARMIN_EMAIL, GARMIN_PASSWORD, TOKEN_DIR)
    
    # 2. Extract strength workouts & exercise sets
    workout_records = extract_strength_workouts(garmin_client, limit=ACTIVITIES_LIMIT)
    
    # 3. Save to CSV and JSON
    save_results(workout_records, OUTPUT_CSV, OUTPUT_JSON)
