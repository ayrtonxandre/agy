#!/usr/bin/env python3
"""
================================================================================
Apple Health Export Parser: Body Composition, Nutrition, Workouts & Activity
================================================================================

Streams and parses the raw Apple Health `export.zip` archive directly without
extracting hundreds of megabytes to disk.

Extracts:
  1. RENPHO Smart Scale Body Composition: Weight (kg), Body Fat (%), Lean Mass (kg), BMI.
  2. Foodvisor Nutrition & Macros: Calories (kcal), Protein (g), Carbs (g), Fat (g).
  3. Workouts History: Running, CrossTraining, Strength, Cardio with duration & energy.
  4. Daily Activity: Steps, Active Energy, Resting Heart Rate.

Outputs clean CSVs ready for athlete dashboards and ATHX 2027 tracking.
"""

from __future__ import annotations
import os
import sys
import zipfile
import csv
import xml.etree.ElementTree as ET
from datetime import datetime
from collections import defaultdict
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
ZIP_PATH = Path("/Users/ayrton.andre/Downloads/export.zip")

OUTPUT_BODY_COMP = BASE_DIR / "apple_body_composition.csv"
OUTPUT_NUTRITION = BASE_DIR / "apple_nutrition_macros.csv"
OUTPUT_WORKOUTS = BASE_DIR / "apple_workouts_history.csv"
OUTPUT_DAILY_ACT = BASE_DIR / "apple_daily_activity.csv"

def parse_apple_health(zip_file_path: Path):
    if not zip_file_path.exists():
        print(f"Error: {zip_file_path} not found.")
        sys.exit(1)

    print(f"📂 Streaming Apple Health archive from: {zip_file_path}...")
    
    # Data storage
    body_comp_by_date = defaultdict(dict)
    nutrition_by_date = defaultdict(lambda: defaultdict(float))
    daily_activity = defaultdict(lambda: {"steps": 0.0, "distance_km": 0.0, "active_kcal": 0.0, "resting_hr": []})
    workouts = []

    with zipfile.ZipFile(zip_file_path, "r") as z:
        # Find export.xml inside zip
        xml_name = None
        for name in z.namelist():
            if name.endswith("export.xml"):
                xml_name = name
                break
        
        if not xml_name:
            print("Error: export.xml not found inside zip archive.")
            sys.exit(1)

        print(f"⚡ Iteratively parsing '{xml_name}' (streaming mode)...")
        with z.open(xml_name) as f:
            context = ET.iterparse(f, events=("end",))
            for event, elem in context:
                tag = elem.tag
                attrib = elem.attrib

                # -------------------------------------------------------------
                # 1. PROCESS RECORDS
                # -------------------------------------------------------------
                if tag == "Record":
                    rec_type = attrib.get("type", "")
                    start_date = attrib.get("startDate", "")
                    date_str = start_date[:10] if start_date else ""
                    val_str = attrib.get("value", "0")
                    src = attrib.get("sourceName", "")

                    if date_str:
                        # A. RENPHO Body Composition
                        if src == "RENPHO Health":
                            try:
                                val = float(val_str)
                                if "BodyMass" == rec_type.split("Identifier")[-1]:
                                    body_comp_by_date[date_str]["weight_kg"] = round(val, 1)
                                elif "BodyFatPercentage" in rec_type:
                                    # Apple stores body fat percentage as a fraction (e.g. 0.15 = 15%)
                                    pct = val * 100 if val < 1.0 else val
                                    body_comp_by_date[date_str]["body_fat_pct"] = round(pct, 1)
                                elif "LeanBodyMass" in rec_type:
                                    body_comp_by_date[date_str]["lean_mass_kg"] = round(val, 1)
                                elif "BodyMassIndex" in rec_type:
                                    body_comp_by_date[date_str]["bmi"] = round(val, 1)
                            except ValueError:
                                pass

                        # B. Foodvisor Nutrition & Macros
                        elif src == "Foodvisor":
                            try:
                                val = float(val_str)
                                if "DietaryEnergyConsumed" in rec_type:
                                    nutrition_by_date[date_str]["calories_kcal"] += val
                                elif "DietaryProtein" in rec_type:
                                    nutrition_by_date[date_str]["protein_g"] += val
                                elif "DietaryCarbohydrates" in rec_type:
                                    nutrition_by_date[date_str]["carbs_g"] += val
                                elif "DietaryFatTotal" in rec_type:
                                    nutrition_by_date[date_str]["fat_g"] += val
                                elif "DietaryFiber" in rec_type:
                                    nutrition_by_date[date_str]["fiber_g"] += val
                            except ValueError:
                                pass

                        # C. Daily Activity & Biometrics
                        if "StepCount" in rec_type:
                            try: daily_activity[date_str]["steps"] += float(val_str)
                            except ValueError: pass
                        elif "DistanceWalkingRunning" in rec_type:
                            try: daily_activity[date_str]["distance_km"] += float(val_str)
                            except ValueError: pass
                        elif "ActiveEnergyBurned" in rec_type:
                            try: daily_activity[date_str]["active_kcal"] += float(val_str)
                            except ValueError: pass
                        elif "RestingHeartRate" in rec_type:
                            try: daily_activity[date_str]["resting_hr"].append(float(val_str))
                            except ValueError: pass

                # -------------------------------------------------------------
                # 2. PROCESS WORKOUTS
                # -------------------------------------------------------------
                elif tag == "Workout":
                    w_type = attrib.get("workoutActivityType", "").replace("HKWorkoutActivityType", "")
                    s_date = attrib.get("startDate", "")
                    date_str = s_date[:10] if s_date else ""
                    dur = float(attrib.get("duration", "0"))
                    dur_unit = attrib.get("durationUnit", "")
                    # Convert to minutes
                    dur_min = dur if "min" in dur_unit.lower() else dur / 60.0
                    energy = float(attrib.get("totalEnergyBurned", "0") or "0")
                    dist = float(attrib.get("totalDistance", "0") or "0")
                    src = attrib.get("sourceName", "Apple Health")

                    workouts.append({
                        "Date": date_str,
                        "Start_Time": s_date,
                        "Workout_Type": w_type,
                        "Duration_min": round(dur_min, 1),
                        "Active_Energy_kcal": round(energy, 1),
                        "Distance_km": round(dist, 2),
                        "Source": src
                    })

                elem.clear()

    # -------------------------------------------------------------
    # 3. SAVE CSV EXPORTS
    # -------------------------------------------------------------
    print("\n💾 Writing structured CSV exports...")

    # A. Body Composition CSV
    body_comp_rows = []
    for d, metrics in sorted(body_comp_by_date.items()):
        body_comp_rows.append({
            "Date": d,
            "Weight_kg": metrics.get("weight_kg", ""),
            "Body_Fat_pct": metrics.get("body_fat_pct", ""),
            "Lean_Mass_kg": metrics.get("lean_mass_kg", ""),
            "BMI": metrics.get("bmi", "")
        })
    with open(OUTPUT_BODY_COMP, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Weight_kg", "Body_Fat_pct", "Lean_Mass_kg", "BMI"])
        writer.writeheader()
        writer.writerows(body_comp_rows)
    print(f"  • Body Composition: {OUTPUT_BODY_COMP} ({len(body_comp_rows)} weigh-ins)")

    # B. Nutrition Macros CSV
    nutrition_rows = []
    for d, m in sorted(nutrition_by_date.items()):
        nutrition_rows.append({
            "Date": d,
            "Calories_kcal": round(m["calories_kcal"], 0),
            "Protein_g": round(m["protein_g"], 1),
            "Carbs_g": round(m["carbs_g"], 1),
            "Fat_g": round(m["fat_g"], 1),
            "Fiber_g": round(m["fiber_g"], 1)
        })
    with open(OUTPUT_NUTRITION, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Calories_kcal", "Protein_g", "Carbs_g", "Fat_g", "Fiber_g"])
        writer.writeheader()
        writer.writerows(nutrition_rows)
    print(f"  • Nutrition & Macros: {OUTPUT_NUTRITION} ({len(nutrition_rows)} logged days)")

    # C. Workouts CSV
    workouts.sort(key=lambda x: x["Start_Time"])
    with open(OUTPUT_WORKOUTS, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Start_Time", "Workout_Type", "Duration_min", "Active_Energy_kcal", "Distance_km", "Source"])
        writer.writeheader()
        writer.writerows(workouts)
    print(f"  • Workouts History: {OUTPUT_WORKOUTS} ({len(workouts)} sessions)")

    # D. Daily Activity CSV
    act_rows = []
    for d, m in sorted(daily_activity.items()):
        r_hrs = m["resting_hr"]
        avg_rhr = round(sum(r_hrs) / len(r_hrs), 1) if r_hrs else ""
        act_rows.append({
            "Date": d,
            "Steps": int(round(m["steps"])),
            "Distance_km": round(m["distance_km"], 2),
            "Active_Energy_kcal": round(m["active_kcal"], 0),
            "Resting_Heart_Rate_bpm": avg_rhr
        })
    with open(OUTPUT_DAILY_ACT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Steps", "Distance_km", "Active_Energy_kcal", "Resting_Heart_Rate_bpm"])
        writer.writeheader()
        writer.writerows(act_rows)
    print(f"  • Daily Activity: {OUTPUT_DAILY_ACT} ({len(act_rows)} days)")

    # -------------------------------------------------------------
    # 4. PRINT ATHLETE RECOVERY & COMPOSITION HIGHLIGHTS
    # -------------------------------------------------------------
    print("\n" + "=" * 80)
    print("🏆 APPLE HEALTH ATHLETE ANALYTICS SUMMARY")
    print("=" * 80)
    if body_comp_rows:
        latest_comp = [r for r in body_comp_rows if r["Weight_kg"]][-1]
        print(f"• Latest Body Weight     : {latest_comp['Weight_kg']} kg (Date: {latest_comp['Date']}) [Target ATHX: 85.0 kg]")
        if latest_comp["Body_Fat_pct"]:
            print(f"• Latest Body Fat        : {latest_comp['Body_Fat_pct']}%")
        if latest_comp["Lean_Mass_kg"]:
            print(f"• Lean Muscle Mass       : {latest_comp['Lean_Mass_kg']} kg")

    if nutrition_rows:
        recent_nut = nutrition_rows[-10:]
        avg_prot = sum(r["Protein_g"] for r in recent_nut) / len(recent_nut)
        avg_cal = sum(r["Calories_kcal"] for r in recent_nut) / len(recent_nut)
        print(f"• Recent Avg Daily Intake: {avg_cal:,.0f} kcal / {avg_prot:.1f}g Protein")

    print(f"• Total Logged Workouts  : {len(workouts)} workouts across Apple & Garmin")
    print("=" * 80)

if __name__ == "__main__":
    parse_apple_health(ZIP_PATH)
