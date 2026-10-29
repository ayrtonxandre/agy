#!/usr/bin/env python3
"""
================================================================================
Health Auto Export Ingestion & Merge Engine: Sleep, Biometrics & Biomechanics
================================================================================

Ingests HealthAutoExport zip files from iOS/watchOS:
  1. Updates `apple_sleep.csv` with high-resolution sleep hypnogram stages (Deep, REM, Core, Awake, Total, In Bed).
  2. Updates `apple_body_composition.csv` with smart scale & Apple Health body metrics (Weight, Body Fat %, Lean Mass, BMI).
  3. Updates `apple_daily_activity.csv` with steps, distance, active calories, and resting HR.
  4. Generates `apple_mobility_biomechanics.csv` with gait symmetry, walking speed, step length, and double support %.
"""

import os
import sys
import zipfile
import io
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def ingest_health_export(zip_path: Path):
    if not zip_path.exists():
        print(f"Error: {zip_path} not found.")
        sys.exit(1)

    print(f"📦 Extracting health metrics from: {zip_path.name}...")
    with zipfile.ZipFile(zip_path) as z:
        csv_files = [f for f in z.namelist() if f.startswith("HealthAutoExport") and f.endswith(".csv")]
        if not csv_files:
            print("Error: No HealthAutoExport-*.csv found in archive.")
            sys.exit(1)
        csv_name = csv_files[0]
        with z.open(csv_name) as f:
            export_df = pd.read_csv(f)

    export_df["Date"] = export_df["Date/Time"].str[:10]
    print(f"  • Found {len(export_df)} daily records spanning {export_df['Date'].min()} to {export_df['Date'].max()}")

    # --------------------------------------------------------------------------
    # 1. UPDATE SLEEP DATA (`apple_sleep.csv`)
    # --------------------------------------------------------------------------
    sleep_path = BASE_DIR / "apple_sleep.csv"
    existing_sleep = pd.read_csv(sleep_path) if sleep_path.exists() else pd.DataFrame()

    export_sleep = export_df.dropna(subset=["Sleep Analysis [Total] (hr)"]).copy()
    new_sleep_rows = []
    for _, r in export_sleep.iterrows():
        new_sleep_rows.append({
            "Date": r["Date"],
            "Total_Sleep_hrs": round(float(r["Sleep Analysis [Total] (hr)"]), 1),
            "Deep_Sleep_hrs": round(float(r["Sleep Analysis [Deep] (hr)"]), 1),
            "REM_Sleep_hrs": round(float(r["Sleep Analysis [REM] (hr)"]), 1),
            "Core_Sleep_hrs": round(float(r["Sleep Analysis [Core] (hr)"]), 1),
            "Awake_hrs": round(float(r["Sleep Analysis [Awake] (hr)"]), 1),
            "In_Bed_hrs": round(float(r["Sleep Analysis [In Bed] (hr)"]), 1)
        })
    new_sleep_df = pd.DataFrame(new_sleep_rows)

    if not existing_sleep.empty:
        # Keep earlier dates not in new export, then overwrite / append with export
        cutoff_date = new_sleep_df["Date"].min()
        hist_sleep = existing_sleep[existing_sleep["Date"] < cutoff_date]
        merged_sleep = pd.concat([hist_sleep, new_sleep_df], ignore_index=True)
    else:
        merged_sleep = new_sleep_df

    merged_sleep.drop_duplicates(subset=["Date"], keep="last", inplace=True)
    merged_sleep.sort_values(by="Date", inplace=True)
    merged_sleep.to_csv(sleep_path, index=False)
    print(f"✅ Updated `apple_sleep.csv`: {len(merged_sleep)} total nights (latest: {merged_sleep['Date'].max()})")

    # --------------------------------------------------------------------------
    # 2. UPDATE BODY COMPOSITION (`apple_body_composition.csv`)
    # --------------------------------------------------------------------------
    body_path = BASE_DIR / "apple_body_composition.csv"
    existing_body = pd.read_csv(body_path) if body_path.exists() else pd.DataFrame()

    export_body = export_df.dropna(subset=["Weight (kg)"]).copy()
    new_body_rows = []
    for _, r in export_body.iterrows():
        new_body_rows.append({
            "Date": r["Date"],
            "Weight_kg": round(float(r["Weight (kg)"]), 1),
            "Body_Fat_pct": round(float(r["Body Fat Percentage (%)"]), 1) if pd.notna(r.get("Body Fat Percentage (%)")) else None,
            "Lean_Mass_kg": round(float(r["Lean Body Mass (kg)"]), 1) if pd.notna(r.get("Lean Body Mass (kg)")) else None,
            "BMI": round(float(r["Body Mass Index (count)"]), 1) if pd.notna(r.get("Body Mass Index (count)")) else None
        })
    new_body_df = pd.DataFrame(new_body_rows)

    if not existing_body.empty:
        merged_body = pd.concat([existing_body, new_body_df], ignore_index=True)
    else:
        merged_body = new_body_df

    merged_body.drop_duplicates(subset=["Date"], keep="last", inplace=True)
    merged_body.sort_values(by="Date", inplace=True)
    merged_body.to_csv(body_path, index=False)
    print(f"✅ Updated `apple_body_composition.csv`: {len(merged_body)} total weigh-ins (latest: {merged_body['Date'].max()} @ {merged_body.iloc[-1]['Weight_kg']} kg)")

    # --------------------------------------------------------------------------
    # 3. UPDATE DAILY ACTIVITY (`apple_daily_activity.csv`)
    # --------------------------------------------------------------------------
    act_path = BASE_DIR / "apple_daily_activity.csv"
    existing_act = pd.read_csv(act_path) if act_path.exists() else pd.DataFrame()

    new_act_rows = []
    for _, r in export_df.iterrows():
        # Active Energy in kJ -> kcal (1 kJ = 0.239006 kcal)
        active_kcal = round(float(r["Active Energy (kJ)"]) * 0.239006, 1) if pd.notna(r.get("Active Energy (kJ)")) else 0.0
        steps = int(r["Step Count (count)"]) if pd.notna(r.get("Step Count (count)")) else 0
        dist = round(float(r["Walking + Running Distance (km)"]), 2) if pd.notna(r.get("Walking + Running Distance (km)")) else 0.0
        rhr = round(float(r["Resting Heart Rate (count/min)"]), 1) if pd.notna(r.get("Resting Heart Rate (count/min)")) else None

        new_act_rows.append({
            "Date": r["Date"],
            "Steps": steps,
            "Distance_km": dist,
            "Active_Energy_kcal": active_kcal,
            "Resting_Heart_Rate_bpm": rhr
        })
    new_act_df = pd.DataFrame(new_act_rows)

    if not existing_act.empty:
        cutoff_date = new_act_df["Date"].min()
        hist_act = existing_act[existing_act["Date"] < cutoff_date]
        merged_act = pd.concat([hist_act, new_act_df], ignore_index=True)
    else:
        merged_act = new_act_df

    merged_act.drop_duplicates(subset=["Date"], keep="last", inplace=True)
    merged_act.sort_values(by="Date", inplace=True)
    merged_act.to_csv(act_path, index=False)
    print(f"✅ Updated `apple_daily_activity.csv`: {len(merged_act)} days of activity (latest: {merged_act['Date'].max()})")

    # --------------------------------------------------------------------------
    # 4. GENERATE MOBILITY & BIOMECHANICS (`apple_mobility_biomechanics.csv`)
    # --------------------------------------------------------------------------
    mob_path = BASE_DIR / "apple_mobility_biomechanics.csv"
    mob_rows = []
    for _, r in export_df.iterrows():
        spd = round(float(r["Walking Speed (km/hr)"]), 2) if pd.notna(r.get("Walking Speed (km/hr)")) else None
        step_len = round(float(r["Walking Step Length (cm)"]), 1) if pd.notna(r.get("Walking Step Length (cm)")) else None
        asym = round(float(r["Walking Asymmetry Percentage (%)"]), 2) if pd.notna(r.get("Walking Asymmetry Percentage (%)")) else None
        dbl_sup = round(float(r["Walking Double Support Percentage (%)"]), 1) if pd.notna(r.get("Walking Double Support Percentage (%)")) else None
        flights = int(r["Flights Climbed (count)"]) if pd.notna(r.get("Flights Climbed (count)")) else None
        rhr = round(float(r["Resting Heart Rate (count/min)"]), 1) if pd.notna(r.get("Resting Heart Rate (count/min)")) else None
        
        mob_rows.append({
            "Date": r["Date"],
            "Walking_Speed_kmh": spd,
            "Walking_Step_Length_cm": step_len,
            "Walking_Asymmetry_pct": asym,
            "Walking_Double_Support_pct": dbl_sup,
            "Flights_Climbed": flights,
            "Resting_Heart_Rate_bpm": rhr
        })
    mob_df = pd.DataFrame(mob_rows)
    mob_df.drop_duplicates(subset=["Date"], keep="last", inplace=True)
    mob_df.sort_values(by="Date", inplace=True)
    mob_df.to_csv(mob_path, index=False)
    print(f"✅ Generated `apple_mobility_biomechanics.csv`: {len(mob_df)} days of gait & mobility metrics.")

    # --------------------------------------------------------------------------
    # 5. UPDATE NUTRITION MACROS (`apple_nutrition_macros.csv`)
    # --------------------------------------------------------------------------
    nut_path = BASE_DIR / "apple_nutrition_macros.csv"
    existing_nut = pd.read_csv(nut_path) if nut_path.exists() else pd.DataFrame()

    export_nut = export_df.dropna(subset=["Dietary Energy (kJ)"]).copy() if "Dietary Energy (kJ)" in export_df.columns else pd.DataFrame()
    if not export_nut.empty:
        new_nut_rows = []
        for _, r in export_nut.iterrows():
            cals = round(float(r["Dietary Energy (kJ)"]) * 0.239006, 1) if pd.notna(r.get("Dietary Energy (kJ)")) else 0.0
            prot = round(float(r["Protein (g)"]), 1) if pd.notna(r.get("Protein (g)")) else 0.0
            carbs = round(float(r["Carbohydrates (g)"]), 1) if pd.notna(r.get("Carbohydrates (g)")) else 0.0
            fat = round(float(r["Total Fat (g)"]), 1) if pd.notna(r.get("Total Fat (g)")) else 0.0
            fiber = round(float(r["Dietary Fiber (g)"]), 1) if pd.notna(r.get("Dietary Fiber (g)")) else (round(float(r["Fiber (g)"]), 1) if pd.notna(r.get("Fiber (g)")) else 0.0)

            new_nut_rows.append({
                "Date": r["Date"],
                "Calories_kcal": cals,
                "Protein_g": prot,
                "Carbs_g": carbs,
                "Fat_g": fat,
                "Fiber_g": fiber
            })
        new_nut_df = pd.DataFrame(new_nut_rows)
        if not existing_nut.empty:
            merged_nut = pd.concat([existing_nut, new_nut_df], ignore_index=True)
        else:
            merged_nut = new_nut_df
        merged_nut.drop_duplicates(subset=["Date"], keep="last", inplace=True)
        merged_nut.sort_values(by="Date", inplace=True)
        merged_nut.to_csv(nut_path, index=False)
        print(f"✅ Updated `apple_nutrition_macros.csv`: {len(merged_nut)} days logged (latest: {merged_nut['Date'].max()})")

if __name__ == "__main__":
    default_zip = Path("/Users/ayrtonandre/Downloads/HealthAutoExport_20260904160946.zip")
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else default_zip
    ingest_health_export(target)
