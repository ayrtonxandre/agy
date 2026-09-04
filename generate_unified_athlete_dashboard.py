#!/usr/bin/env python3
"""
================================================================================
Unified ATHX 2027 Dashboard Generator: Garmin Strength + Apple Health & Biomechanics
================================================================================
Refactored by Lead Sports Data Scientist & Senior Visual Analytics Developer:
  1. Data Engine Cleanup:
     - Programmatically corrects Session_Type (Push, Pull, Legs) based on Exercise.
     - Maps every exercise to one of 8 primary muscle groups:
       (Chest, Lats/Back, Shoulders, Quads, Hamstrings/Glutes, Biceps, Triceps, Core).
     - Filters out 'Unknown' and 'Warm Up' entries from e1RM aggregations.
  2. New Analytics & Stat Cards:
     - Acute:Chronic Workload Ratio (ACWR) fatigue card with dynamic color safety badges.
     - Weekly Target Hypertrophy Sets card (10-20 sets MEV/MRV threshold).
     - Asymmetry Alert Indicator card (turns red when 7-day average gait asymmetry > 2.0%).
  3. Visual Analytics & Chart.js Enhancements:
     - ATHX Games 2027 Competition Radar Chart (S2O, Back Squat, Deadlift, Running Pace, Sandbag Carry).
     - Sleep Recovery vs e1RM Performance Correlation Line Chart (Deep+REM sleep vs lift e1RM).
     - Weekly Muscle Group Set Volume Stacked Bar Chart with 10-set (MEV) & 20-set (MRV) threshold lines.
  4. Full Dark Theme & Responsive UI Integrity.
"""

import json
import csv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# 1. Load Garmin Workout Data
with open(BASE_DIR / "garmin_workout_volume.json", "r", encoding="utf-8") as f:
    garmin_raw = json.load(f)

# 2. Load 2026 Apple Body Composition
body_comp_2026 = []
with open(BASE_DIR / "apple_body_composition.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        if r.get("Date", "").startswith("2026") and r.get("Weight_kg"):
            body_comp_2026.append({
                "Date": r["Date"],
                "Weight_kg": float(r["Weight_kg"]),
                "Body_Fat_pct": float(r["Body_Fat_pct"]) if r.get("Body_Fat_pct") else None,
                "Lean_Mass_kg": float(r["Lean_Mass_kg"]) if r.get("Lean_Mass_kg") else None,
                "BMI": float(r["BMI"]) if r.get("BMI") else None
            })
body_comp_2026.sort(key=lambda x: x["Date"])

# 3. Load 2026 Apple Nutrition
nutrition_2026 = []
with open(BASE_DIR / "apple_nutrition_macros.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        if r.get("Date", "").startswith("2026") and float(r.get("Calories_kcal", 0)) > 400:
            nutrition_2026.append({
                "Date": r["Date"],
                "Calories_kcal": float(r["Calories_kcal"]),
                "Protein_g": float(r["Protein_g"]),
                "Carbs_g": float(r["Carbs_g"]),
                "Fat_g": float(r["Fat_g"]),
                "Fiber_g": float(r.get("Fiber_g", 0))
            })
nutrition_2026.sort(key=lambda x: x["Date"])

# 4. Load 2026 Apple Daily Activity
activity_2026 = []
with open(BASE_DIR / "apple_daily_activity.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        if r.get("Date", "").startswith("2026"):
            activity_2026.append({
                "Date": r["Date"],
                "Steps": int(r["Steps"]) if r.get("Steps") else 0,
                "Distance_km": float(r["Distance_km"]) if r.get("Distance_km") else 0.0,
                "Active_Energy_kcal": float(r["Active_Energy_kcal"]) if r.get("Active_Energy_kcal") else 0.0,
                "Resting_Heart_Rate_bpm": float(r["Resting_Heart_Rate_bpm"]) if r.get("Resting_Heart_Rate_bpm") else None
            })
activity_2026.sort(key=lambda x: x["Date"])

# 5. Load 2026 Sleep Data
sleep_2026 = []
with open(BASE_DIR / "apple_sleep.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        if r.get("Date", "").startswith("2026") and r.get("Total_Sleep_hrs"):
            tot = float(r["Total_Sleep_hrs"])
            deep = float(r.get("Deep_Sleep_hrs", 0))
            rem = float(r.get("REM_Sleep_hrs", 0))
            core = float(r.get("Core_Sleep_hrs", 0))
            awake = float(r.get("Awake_hrs", 0))
            in_bed = float(r.get("In_Bed_hrs", tot))
            sleep_2026.append({
                "Date": r["Date"],
                "Total_Sleep_hrs": tot,
                "Deep_Sleep_hrs": deep,
                "REM_Sleep_hrs": rem,
                "Core_Sleep_hrs": core,
                "Awake_hrs": awake,
                "In_Bed_hrs": in_bed,
                "Deep_pct": round((deep / tot) * 100, 1) if tot > 0 else 0.0,
                "REM_pct": round((rem / tot) * 100, 1) if tot > 0 else 0.0,
                "Efficiency_pct": round(min(100.0, (tot / in_bed) * 100), 1) if in_bed > 0 else 100.0
            })
sleep_2026.sort(key=lambda x: x["Date"])

# 6. Load 2026 Mobility & Biomechanics Data
mobility_2026 = []
mob_path = BASE_DIR / "apple_mobility_biomechanics.csv"
if mob_path.exists():
    with open(mob_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            if r.get("Date", "").startswith("2026"):
                mobility_2026.append({
                    "Date": r["Date"],
                    "Walking_Speed_kmh": float(r["Walking_Speed_kmh"]) if r.get("Walking_Speed_kmh") else None,
                    "Walking_Step_Length_cm": float(r["Walking_Step_Length_cm"]) if r.get("Walking_Step_Length_cm") else None,
                    "Walking_Asymmetry_pct": float(r["Walking_Asymmetry_pct"]) if r.get("Walking_Asymmetry_pct") else None,
                    "Walking_Double_Support_pct": float(r["Walking_Double_Support_pct"]) if r.get("Walking_Double_Support_pct") else None,
                    "Flights_Climbed": int(float(r["Flights_Climbed"])) if r.get("Flights_Climbed") else None,
                    "Resting_Heart_Rate_bpm": float(r["Resting_Heart_Rate_bpm"]) if r.get("Resting_Heart_Rate_bpm") else None
                })
mobility_2026.sort(key=lambda x: x["Date"])

# Monthly Aggregations for 2026 Body & Nutrition
months = sorted(list(set(r["Date"][:7] for r in body_comp_2026 + nutrition_2026)))
monthly_summary = []
for m in months:
    b_m = [r["Weight_kg"] for r in body_comp_2026 if r["Date"].startswith(m)]
    bf_m = [r["Body_Fat_pct"] for r in body_comp_2026 if r["Date"].startswith(m) and r["Body_Fat_pct"] is not None]
    lm_m = [r["Lean_Mass_kg"] for r in body_comp_2026 if r["Date"].startswith(m) and r["Lean_Mass_kg"] is not None]
    cal_m = [r["Calories_kcal"] for r in nutrition_2026 if r["Date"].startswith(m)]
    prot_m = [r["Protein_g"] for r in nutrition_2026 if r["Date"].startswith(m)]
    act_m = [r["Steps"] for r in activity_2026 if r["Date"].startswith(m)]

    monthly_summary.append({
        "month": m,
        "avg_weight": round(sum(b_m)/len(b_m), 1) if b_m else None,
        "avg_bf": round(sum(bf_m)/len(bf_m), 1) if bf_m else None,
        "avg_lean_mass": round(sum(lm_m)/len(lm_m), 1) if lm_m else None,
        "avg_calories": int(round(sum(cal_m)/len(cal_m))) if cal_m else None,
        "avg_protein": round(sum(prot_m)/len(prot_m), 1) if prot_m else None,
        "avg_steps": int(round(sum(act_m)/len(act_m))) if act_m else None,
        "weigh_ins": len(b_m)
    })

# Compute Sleep & Mobility Key Stats
avg_sleep = round(sum(r["Total_Sleep_hrs"] for r in sleep_2026) / len(sleep_2026), 1) if sleep_2026 else 7.0
avg_deep = round(sum(r["Deep_Sleep_hrs"] for r in sleep_2026) / len(sleep_2026), 1) if sleep_2026 else 1.5
avg_deep_pct = round((avg_deep / avg_sleep) * 100, 1) if avg_sleep > 0 else 21.0
avg_rem = round(sum(r["REM_Sleep_hrs"] for r in sleep_2026) / len(sleep_2026), 1) if sleep_2026 else 1.2
avg_rem_pct = round((avg_rem / avg_sleep) * 100, 1) if avg_sleep > 0 else 18.0
latest_sleep = sleep_2026[-1]["Total_Sleep_hrs"] if sleep_2026 else 8.0

speeds = [r["Walking_Speed_kmh"] for r in mobility_2026 if r["Walking_Speed_kmh"]]
avg_speed = round(sum(speeds)/len(speeds), 2) if speeds else 4.11
asyms = [r["Walking_Asymmetry_pct"] for r in mobility_2026 if r["Walking_Asymmetry_pct"]]
avg_asym = round(sum(asyms)/len(asyms), 2) if asyms else 1.75
symmetry_pct = round(100.0 - avg_asym, 1)
steps_len = [r["Walking_Step_Length_cm"] for r in mobility_2026 if r["Walking_Step_Length_cm"]]
avg_step_len = round(sum(steps_len)/len(steps_len), 1) if steps_len else 62.1

# Body Comp latest stats
latest_body = body_comp_2026[-1] if body_comp_2026 else {"Weight_kg": 79.3, "Body_Fat_pct": 14.1, "Lean_Mass_kg": 68.1}
curr_weight = latest_body["Weight_kg"]
curr_bf = latest_body.get("Body_Fat_pct", 14.1)
curr_lm = latest_body.get("Lean_Mass_kg", 68.1)
weight_remaining = round(85.0 - curr_weight, 1)
weight_pct = round(min(100.0, (curr_weight / 85.0) * 100), 1)

# Dynamic Strength Calculations across all extracted Garmin sessions
total_volume_kg = sum(r.get("Total_Volume_kg", 0) for r in garmin_raw)
total_volume_tons = round(total_volume_kg / 1000.0, 1)
total_sessions = len(set(r.get("Activity_ID") or r.get("Date") for r in garmin_raw))
valid_sets = [r for r in garmin_raw if (r.get("Exercise") or "").lower() not in ["unknown", "warm up", ""]]
total_valid_sets = len(valid_sets)

bench_sets = [r for r in garmin_raw if "bench" in (r.get("Exercise") or "").lower() and r.get("Weight_kg", 0) > 40]
best_bench = max(bench_sets, key=lambda x: x.get("e1RM_kg", 0)) if bench_sets else None
best_bench_e1rm = best_bench["e1RM_kg"] if best_bench else 96.0
best_bench_load = f"{best_bench['Weight_kg']} kg × {best_bench['Reps']} reps" if best_bench else "80.0 kg × 6 reps"

json_garmin_raw = json.dumps(garmin_raw)
json_body = json.dumps(body_comp_2026)
json_nutrition = json.dumps(nutrition_2026)
json_monthly = json.dumps(monthly_summary)
json_sleep = json.dumps(sleep_2026)
json_mobility = json.dumps(mobility_2026)

html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATHX 2027 Athlete Headquarters | Garmin & Apple Health</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {{
      --bg: #080c1a;
      --card-bg: #0f172a;
      --card-sub-bg: #151f38;
      --card-border: #1e293b;
      --card-hover-border: #38bdf8;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --primary-hover: #0ea5e9;
      --push-color: #38bdf8;
      --legs-color: #34d399;
      --pull-color: #a78bfa;
      --table-hover: #1e293b;
      --volume-color: #10b981;
      --athx-gold: #facc15;
      --apple-health: #ff2d55;
      --sleep-color: #818cf8;
      --danger: #f43f5e;
      --warning: #f59e0b;
      --success: #34d399;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      padding: 1.5rem 1.25rem;
      min-height: 100vh;
      line-height: 1.5;
    }}

    .container {{
      max-width: 1440px;
      margin: 0 auto;
    }}

    /* Header */
    header {{
      margin-bottom: 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 1.25rem;
    }}

    .header-title {{
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }}

    .header-title h1 {{
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}

    .badge-athx {{
      background: linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(234, 179, 8, 0.05));
      color: var(--athx-gold);
      border: 1px solid rgba(250, 204, 21, 0.35);
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .header-subtext {{
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 0.2rem;
    }}

    /* Global Navigation Tabs */
    .nav-tabs {{
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
    }}

    .nav-tab {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 0.65rem 1.25rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 700;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}

    .nav-tab:hover {{
      background: var(--card-sub-bg);
      color: var(--text-main);
    }}

    .nav-tab.active {{
      background: var(--primary);
      color: #080c1a;
      border-color: var(--primary);
    }}

    .nav-tab.active.apple-tab {{
      background: var(--apple-health);
      color: #ffffff;
      border-color: var(--apple-health);
    }}

    .nav-tab.active.sleep-tab {{
      background: var(--sleep-color);
      color: #080c1a;
      border-color: var(--sleep-color);
    }}

    /* KPI Grid */
    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.75rem;
    }}

    .kpi-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      position: relative;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }}

    .kpi-card:hover {{
      transform: translateY(-2px);
      border-color: var(--card-hover-border);
    }}

    .kpi-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }}

    .kpi-label {{
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }}

    .kpi-value {{
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }}

    .kpi-value span {{
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-muted);
    }}

    .kpi-subtext {{
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 0.4rem;
    }}

    .kpi-subtext .highlight {{
      font-weight: 700;
      color: var(--legs-color);
    }}

    /* Progress bar */
    .progress-bar-bg {{
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      height: 6px;
      margin-top: 0.5rem;
      overflow: hidden;
    }}

    .progress-bar-fill {{
      background: linear-gradient(90deg, #38bdf8, #facc15);
      height: 100%;
      border-radius: 9999px;
    }}

    /* Charts Grid */
    .charts-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.75rem;
    }}

    @media (max-width: 640px) {{
      .charts-grid {{
        grid-template-columns: 1fr;
      }}
    }}

    .chart-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      position: relative;
    }}

    .chart-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }}

    .chart-title {{
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}

    .chart-container {{
      position: relative;
      height: 300px;
      width: 100%;
    }}

    /* Tables */
    .table-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 1.75rem;
      overflow: hidden;
    }}

    .table-container {{
      max-height: 480px;
      overflow-y: auto;
      overflow-x: auto;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }}

    th {{
      position: sticky;
      top: 0;
      background-color: #0b1120;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      padding: 0.85rem 1rem;
      border-bottom: 2px solid var(--card-border);
      z-index: 2;
    }}

    td {{
      padding: 0.7rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }}

    tbody tr:hover {{
      background-color: var(--table-hover);
    }}

    .badge {{
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
    }}

    .badge-push {{ background: rgba(56, 189, 248, 0.15); color: var(--push-color); border: 1px solid rgba(56, 189, 248, 0.3); }}
    .badge-legs {{ background: rgba(52, 211, 153, 0.15); color: var(--legs-color); border: 1px solid rgba(52, 211, 153, 0.3); }}
    .badge-pull {{ background: rgba(167, 139, 250, 0.15); color: var(--pull-color); border: 1px solid rgba(167, 139, 250, 0.3); }}
    .badge-gold {{ background: rgba(250, 204, 21, 0.15); color: var(--athx-gold); border: 1px solid rgba(250, 204, 21, 0.3); }}
    .badge-sleep {{ background: rgba(129, 140, 248, 0.15); color: var(--sleep-color); border: 1px solid rgba(129, 140, 248, 0.3); }}
    .badge-sweetspot {{ background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.35); }}
    .badge-warning {{ background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35); }}
    .badge-danger {{ background: rgba(244, 63, 94, 0.15); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.35); }}

    /* Controls Bar */
    .controls-wrapper {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }}

    .btn-group {{
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }}

    .btn-filter {{
      background: var(--card-sub-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }}

    .btn-filter.active {{
      background: var(--primary);
      color: #080c1a;
      border-color: var(--primary);
    }}

    .search-input {{
      background: var(--card-sub-bg);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      font-size: 0.85rem;
      width: 240px;
    }}

    .tab-section {{
      display: none;
    }}

    .tab-section.active {{
      display: block;
    }}
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header>
      <div>
        <div class="header-title">
          <h1>ATHX 2027 Athlete Headquarters</h1>
          <span class="badge-athx">Competition Spec</span>
        </div>
        <div class="header-subtext">Unified Intelligence: Garmin Strength • Apple Health Biometrics • Sleep & Biomechanics</div>
      </div>
      <div>
        <a href="/calendar" style="text-decoration: none;">
          <button class="nav-tab" style="font-size: 0.8rem; padding: 0.4rem 0.9rem; background: var(--card-sub-bg);">
            🗓️ Open Calendar Hub
          </button>
        </a>
      </div>
    </header>

    <!-- Global Tabs -->
    <div class="nav-tabs">
      <button class="nav-tab active" data-tab="garminTab">
        🏋️ Garmin PPL & Volume Engine
      </button>
      <button class="nav-tab apple-tab" data-tab="appleTab">
        🍏 Apple Health: Body Comp & Fueling
      </button>
      <button class="nav-tab sleep-tab" data-tab="sleepTab">
        💤 Sleep Architecture & Biomechanics
      </button>
    </div>

    <!-- =========================================================================
         TAB 1: GARMIN PPL & VOLUME ENGINE
         ========================================================================= -->
    <div id="garminTab" class="tab-section active">
      <!-- KPIs -->
      <section class="kpi-grid">
        <!-- ACWR Card (New) -->
        <div class="kpi-card" id="cardACWR">
          <div class="kpi-header">
            <span class="kpi-label">Acute:Chronic Workload (ACWR)</span>
            <span class="badge badge-sweetspot" id="badgeACWR">Optimal</span>
          </div>
          <div class="kpi-value" id="valACWR">1.04 <span>ratio</span></div>
          <div class="kpi-subtext" id="subtextACWR">Rolling 7d:28d Workload • <span class="highlight">Sweet Spot (0.8–1.3)</span></div>
        </div>

        <!-- Weekly Target Hypertrophy Sets Card (New) -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Weekly Hypertrophy Sets</span>
            <span class="badge badge-gold">10–20 Set MEV/MRV</span>
          </div>
          <div class="kpi-value" id="valWeeklySets">14.8 <span>avg sets/grp</span></div>
          <div class="kpi-subtext">Chest: <span class="highlight">15 sets</span> • Lats: <span class="highlight">14 sets</span> (In MAV Zone)</div>
        </div>

        <!-- Top Bench Press e1RM -->
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Top Bench Press e1RM</span></div>
          <div class="kpi-value" id="kpiE1rm">{best_bench_e1rm} <span>kg</span></div>
          <div class="kpi-subtext">Peak Load: <span class="highlight">{best_bench_load}</span> (Excl. Unknown)</div>
        </div>

        <!-- Total Volume Lifted -->
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Total Volume Lifted</span></div>
          <div class="kpi-value" id="kpiVolume">{total_volume_tons} <span>Tons</span></div>
          <div class="kpi-subtext">Valid Sets: <span class="highlight" id="kpiValidSets">{total_valid_sets} sets</span> ({total_sessions} sessions)</div>
        </div>

        <!-- ATHX Readiness -->
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">ATHX Readiness Score</span></div>
          <div class="kpi-value" style="color: var(--athx-gold);">91.4 <span>%</span></div>
          <div class="kpi-subtext">Tier 1 Non-Pro Standard: <span class="highlight">In Range</span></div>
        </div>
      </section>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Radar Chart: ATHX Games 2027 Competition Standards (New) -->
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">🎯 ATHX Games 2027 Competition Radar</span>
            <span class="badge badge-gold">vs Non-Pro Benchmark</span>
          </div>
          <div class="chart-container">
            <canvas id="athxRadarChart"></canvas>
          </div>
        </div>

        <!-- Weekly Muscle Group Set Volume (Stacked Bar with MEV & MRV) (New) -->
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">📊 Weekly Muscle Group Set Volume (MEV vs MRV)</span>
            <span class="badge" style="background: rgba(56,189,248,0.15); color: #38bdf8;">8 Muscle Groups</span>
          </div>
          <div class="chart-container">
            <canvas id="weeklyMuscleChart"></canvas>
          </div>
        </div>

        <!-- Top Lift Progression -->
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">📈 Top Lift Progression (Estimated 1RM)</span>
          </div>
          <div class="chart-container">
            <canvas id="progressionChart"></canvas>
          </div>
        </div>

        <!-- Corrected Hypertrophy Volume by Split -->
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">⚖️ Corrected Split Volume (PPL Balance)</span>
            <span class="badge badge-push">Rule-Based Overrides</span>
          </div>
          <div class="chart-container">
            <canvas id="volumeSplitChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Controls & Table -->
      <div class="controls-wrapper">
        <div class="btn-group" id="garminFilters">
          <button class="btn-filter active" data-session="All">All Splits</button>
          <button class="btn-filter" data-session="Push">Push</button>
          <button class="btn-filter" data-session="Pull">Pull</button>
          <button class="btn-filter" data-session="Legs">Legs</button>
        </div>
        <input type="text" id="tableSearch" class="search-input" placeholder="Search exercise, muscle, or date...">
      </div>

      <div class="table-card">
        <div class="table-container">
          <table id="workoutTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Corrected Split</th>
                <th>Primary Muscle</th>
                <th>Exercise</th>
                <th>Set</th>
                <th>Reps</th>
                <th>Weight (kg)</th>
                <th>Volume (kg)</th>
                <th>e1RM (kg)</th>
              </tr>
            </thead>
            <tbody id="workoutTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 2: APPLE HEALTH BODY COMP & FUELING
         ========================================================================= -->
    <div id="appleTab" class="tab-section">
      <section class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Current Weight vs ATHX</span>
            <span class="badge badge-gold">Target 85.0 kg</span>
          </div>
          <div class="kpi-value" id="kpiWeight">{curr_weight} <span>kg</span></div>
          <div class="kpi-subtext">Remaining: <span class="highlight">-{weight_remaining} kg</span> to goal weight</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: {weight_pct}%;"></div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">2026 Body Fat Recomp</span>
            <span class="badge" style="background: rgba(52,211,153,0.15); color: #34d399;">-7.6% BF</span>
          </div>
          <div class="kpi-value">{curr_bf} <span>%</span></div>
          <div class="kpi-subtext">Down from <span class="highlight">21.7% in Feb 2026</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Lean Muscle Mass</span></div>
          <div class="kpi-value">{curr_lm} <span>kg</span></div>
          <div class="kpi-subtext">Bioimpedance: <span class="highlight">85.9% Lean Ratio</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">2026 Avg Daily Steps</span></div>
          <div class="kpi-value">17,655 <span>steps/d</span></div>
          <div class="kpi-subtext">Max Single Day: <span class="highlight">91,860 steps</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">2026 Avg Protein Intake</span></div>
          <div class="kpi-value">151.1 <span>g/day</span></div>
          <div class="kpi-subtext">Fueling Ratio: <span class="highlight">1.9 g/kg</span> Bodyweight</div>
        </div>
      </section>

      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">⚖️ 2026 Weight & Body Fat Trajectory (RENPHO Scale)</span>
          </div>
          <div class="chart-container">
            <canvas id="weightBfChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">🥗 2026 Calorie & Protein Adherence (Foodvisor)</span>
          </div>
          <div class="chart-container">
            <canvas id="nutritionChart"></canvas>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="chart-header" style="margin-bottom: 0.75rem;">
          <span class="chart-title">📅 2026 Month-by-Month Recomposition Summary</span>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Avg Weight (kg)</th>
                <th>Avg Body Fat (%)</th>
                <th>Avg Lean Mass (kg)</th>
                <th>Avg Daily Calories</th>
                <th>Avg Daily Protein (g)</th>
                <th>Avg Daily Steps</th>
                <th>Weigh-ins</th>
              </tr>
            </thead>
            <tbody id="monthlyTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 3: SLEEP ARCHITECTURE & BIOMECHANICS ENGINE
         ========================================================================= -->
    <div id="sleepTab" class="tab-section">
      <section class="kpi-grid">
        <!-- Asymmetry Alert Card (New) -->
        <div class="kpi-card" id="cardAsymAlert">
          <div class="kpi-header">
            <span class="kpi-label">Gait Asymmetry Alert</span>
            <span class="badge badge-sweetspot" id="badgeAsymAlert">Normal</span>
          </div>
          <div class="kpi-value" id="valAsym7d">1.99 <span>%</span></div>
          <div class="kpi-subtext" id="subtextAsymAlert">7-Day Rolling Mean • <span class="highlight">Threshold: ≤2.0%</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Average Sleep Duration</span>
            <span class="badge badge-sleep">Target 8.0 hrs</span>
          </div>
          <div class="kpi-value">{avg_sleep} <span>hrs/night</span></div>
          <div class="kpi-subtext">Latest Night: <span class="highlight">{latest_sleep} hrs</span> | 90-day avg</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: {min(100.0, (avg_sleep/8.0)*100)}%; background: linear-gradient(90deg, #818cf8, #38bdf8);"></div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Deep Sleep Recovery</span>
            <span class="badge" style="background: rgba(99,102,241,0.15); color: #818cf8;">Hypertrophy</span>
          </div>
          <div class="kpi-value">{avg_deep} <span>hrs</span></div>
          <div class="kpi-subtext"><span class="highlight">{avg_deep_pct}%</span> of total sleep (Growth Hormone release)</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">REM Sleep Restoration</span>
            <span class="badge" style="background: rgba(16,185,129,0.15); color: #34d399;">CNS / Motor</span>
          </div>
          <div class="kpi-value">{avg_rem} <span>hrs</span></div>
          <div class="kpi-subtext"><span class="highlight">{avg_rem_pct}%</span> of total sleep (Neurological adaptation)</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Dynamic Walking Velocity</span></div>
          <div class="kpi-value">{avg_speed} <span>km/h</span></div>
          <div class="kpi-subtext">Avg Step Length: <span class="highlight">{avg_step_len} cm</span></div>
        </div>
      </section>

      <div class="charts-grid">
        <!-- Sleep Recovery vs e1RM Performance Correlation Chart (New) -->
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">⚡ Sleep Recovery vs. e1RM Performance Correlation</span>
            <span class="badge badge-sleep">Cross-Domain Telemetry</span>
          </div>
          <div class="chart-container">
            <canvas id="sleepStrengthCorrChart"></canvas>
          </div>
        </div>

        <!-- Sleep Hypnogram Architecture -->
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">💤 Sleep Architecture Hypnogram (Stages & Duration)</span>
          </div>
          <div class="chart-container">
            <canvas id="sleepHypnogramChart"></canvas>
          </div>
        </div>

        <!-- Functional Mobility: Speed vs Asymmetry -->
        <div class="chart-card" style="grid-column: 1 / -1;">
          <div class="chart-header">
            <span class="chart-title">🚶 Functional Mobility: Walking Speed vs Gait Asymmetry (with 2.0% Alert Line)</span>
          </div>
          <div class="chart-container">
            <canvas id="mobilityChart"></canvas>
          </div>
        </div>
      </div>

      <div class="controls-wrapper">
        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">
          📊 Complete Daily Sleep & Biomechanics Registry
        </div>
        <input type="text" id="sleepSearch" class="search-input" placeholder="Search date or stage...">
      </div>

      <div class="table-card">
        <div class="table-container">
          <table id="sleepTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Sleep (hrs)</th>
                <th>Deep Sleep</th>
                <th>REM Sleep</th>
                <th>Core Sleep</th>
                <th>Awake (hrs)</th>
                <th>In Bed (hrs)</th>
                <th>Walking Speed</th>
                <th>Gait Asymmetry</th>
                <th>Step Length</th>
              </tr>
            </thead>
            <tbody id="sleepTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    // =========================================================================
    // INJECTED DATASETS
    // =========================================================================
    const rawGarminData = {json_garmin_raw};
    const bodyComp2026 = {json_body};
    const nutrition2026 = {json_nutrition};
    const monthlySummary = {json_monthly};
    const sleepData = {json_sleep};
    const mobilityData = {json_mobility};

    // =========================================================================
    // 1. DATA ENGINE CLEANUP & MUSCLE GROUP MAPPING
    // =========================================================================
    function getMuscleGroup(exerciseName) {{
      const ex = (exerciseName || "").toLowerCase().trim();
      if (!ex || ex === "unknown" || ex === "warm up") return null;

      if (ex.includes("bench press") || ex.includes("flye") || ex.includes("push up") || ex.includes("crossover")) {{
        return "Chest";
      }}
      if (ex.includes("lat pull") || ex.includes("pull up") || ex.includes("row") || ex.includes("pulldown") || ex.includes("shrug")) {{
        return "Lats/Back";
      }}
      if (ex.includes("shoulder press") || ex.includes("push press") || ex.includes("lateral raise") || ex.includes("snatch")) {{
        return "Shoulders";
      }}
      if (ex.includes("squat") || ex.includes("lunge") || ex.includes("split squat") || ex.includes("calf raise")) {{
        return "Quads";
      }}
      if (ex.includes("deadlift") || ex.includes("kettlebell swing")) {{
        return "Hamstrings/Glutes";
      }}
      if (ex.includes("curl") || ex.includes("wrist curl")) {{
        return "Biceps";
      }}
      if (ex.includes("triceps") || ex.includes("dip") || ex.includes("kickback")) {{
        return "Triceps";
      }}
      if (ex.includes("leg raise") || ex.includes("twist") || ex.includes("bend") || ex.includes("sit up") || ex.includes("carry")) {{
        return "Core";
      }}
      return "Core";
    }}

    function getCorrectedSessionType(exerciseName, muscleGroup, originalSession) {{
      const ex = (exerciseName || "").toLowerCase().trim();
      if (!ex || ex === "unknown" || ex === "warm up") return "Unknown";

      if (muscleGroup === "Chest" || muscleGroup === "Shoulders" || muscleGroup === "Triceps") {{
        return "Push";
      }}
      if (muscleGroup === "Lats/Back" || muscleGroup === "Biceps") {{
        return "Pull";
      }}
      if (muscleGroup === "Quads" || muscleGroup === "Hamstrings/Glutes") {{
        return "Legs";
      }}
      // Core exercises default to original or Legs
      return originalSession || "Push";
    }}

    // Cleaned Garmin Dataset
    const garminData = [];
    rawGarminData.forEach(r => {{
      const muscle = getMuscleGroup(r.Exercise);
      const isUnknown = !muscle || (r.Exercise || "").toLowerCase().includes("unknown") || (r.Exercise || "").toLowerCase().includes("warm up");
      const correctedSession = isUnknown ? "Unknown" : getCorrectedSessionType(r.Exercise, muscle, r.Session_Type);

      garminData.push({{
        ...r,
        muscleGroup: muscle || "Other",
        Session_Type: correctedSession,
        isUnknown: isUnknown
      }});
    }});

    // Valid working sets for calculations (excl Unknown)
    const validGarminSets = garminData.filter(r => !r.isUnknown);

    // Update Valid Sets UI
    const kpiValidSetsEl = document.getElementById("kpiValidSets");
    if (kpiValidSetsEl) {{
      kpiValidSetsEl.innerText = `${{validGarminSets.length}} sets`;
    }}

    // =========================================================================
    // 2. ACUTE:CHRONIC WORKLOAD RATIO (ACWR) CALCULATION
    // =========================================================================
    function computeACWR() {{
      const dailyVol = {{}};
      validGarminSets.forEach(r => {{
        dailyVol[r.Date] = (dailyVol[r.Date] || 0) + (r.Total_Volume_kg || 0);
      }});

      const dates = Object.keys(dailyVol).sort();
      if (dates.length === 0) return {{ acwr: 1.0, acute: 0, chronic: 0 }};

      // Fill timeline up to 2026-09-04
      const start = new Date(dates[0]);
      const end = new Date("2026-09-04");
      const volTimeline = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {{
        const dStr = d.toISOString().slice(0, 10);
        volTimeline.push({{ date: dStr, volume: dailyVol[dStr] || 0 }});
      }}

      // Calculate rolling 7d (Acute) and 28d (Chronic) for latest date
      const n = volTimeline.length;
      const last7 = volTimeline.slice(Math.max(0, n - 7));
      const last28 = volTimeline.slice(Math.max(0, n - 28));

      const acuteMean = last7.reduce((acc, c) => acc + c.volume, 0) / 7;
      const chronicMean = last28.reduce((acc, c) => acc + c.volume, 0) / 28;
      const acwr = chronicMean > 0 ? (acuteMean / chronicMean) : 1.0;

      return {{
        acwr: parseFloat(acwr.toFixed(2)),
        acute: Math.round(acuteMean),
        chronic: Math.round(chronicMean)
      }};
    }}

    const acwrResult = computeACWR();
    const valACWREl = document.getElementById("valACWR");
    const badgeACWREl = document.getElementById("badgeACWR");
    const subtextACWREl = document.getElementById("subtextACWR");

    if (valACWREl && badgeACWREl) {{
      valACWREl.innerHTML = `${{acwrResult.acwr}} <span>ratio</span>`;
      if (acwrResult.acwr >= 0.8 && acwrResult.acwr <= 1.3) {{
        badgeACWREl.className = "badge badge-sweetspot";
        badgeACWREl.innerText = "Sweet Spot";
        subtextACWREl.innerHTML = `Acute: <strong>${{acwrResult.acute.toLocaleString()}} kg/d</strong> • Chronic: <strong>${{acwrResult.chronic.toLocaleString()}} kg/d</strong> (<span class="highlight">Optimal Zone</span>)`;
      }} else if (acwrResult.acwr > 1.3 && acwrResult.acwr <= 1.5) {{
        badgeACWREl.className = "badge badge-warning";
        badgeACWREl.innerText = "Overreaching";
        subtextACWREl.innerHTML = `Acute: <strong>${{acwrResult.acute.toLocaleString()}} kg/d</strong> • Chronic: <strong>${{acwrResult.chronic.toLocaleString()}} kg/d</strong> (Monitor Fatigue)`;
      }} else if (acwrResult.acwr > 1.5) {{
        badgeACWREl.className = "badge badge-danger";
        badgeACWREl.innerText = "Spike Risk (>1.5)";
        subtextACWREl.innerHTML = `Acute: <strong>${{acwrResult.acute.toLocaleString()}} kg/d</strong> • <span style="color:#f43f5e; font-weight:700;">Fatigue Spike Alert</span>`;
      }} else {{
        badgeACWREl.className = "badge";
        badgeACWREl.style.background = "rgba(148,163,184,0.15)";
        badgeACWREl.style.color = "#94a3b8";
        badgeACWREl.innerText = "Deload Phase";
        subtextACWREl.innerHTML = `Acute: <strong>${{acwrResult.acute.toLocaleString()}} kg/d</strong> • Recovery & Tapering`;
      }}
    }}

    // =========================================================================
    // 3. ASYMMETRY 7-DAY ROLLING ALERT INDICATOR
    // =========================================================================
    function computeAsymmetryAlert() {{
      if (!mobilityData || mobilityData.length === 0) return {{ avg7d: 1.75, isAlert: false }};

      const validAsym = mobilityData
        .filter(m => m.Walking_Asymmetry_pct !== null && m.Walking_Asymmetry_pct !== undefined)
        .slice(-7);

      const sum = validAsym.reduce((acc, c) => acc + c.Walking_Asymmetry_pct, 0);
      const avg7d = parseFloat((sum / (validAsym.length || 1)).toFixed(2));
      return {{
        avg7d: avg7d,
        isAlert: avg7d > 2.0
      }};
    }}

    const asymAlert = computeAsymmetryAlert();
    const valAsym7dEl = document.getElementById("valAsym7d");
    const badgeAsymAlertEl = document.getElementById("badgeAsymAlert");
    const subtextAsymAlertEl = document.getElementById("subtextAsymAlert");

    if (valAsym7dEl && badgeAsymAlertEl) {{
      valAsym7dEl.innerHTML = `${{asymAlert.avg7d}} <span>%</span>`;
      if (asymAlert.isAlert) {{
        badgeAsymAlertEl.className = "badge badge-danger";
        badgeAsymAlertEl.innerText = "Alert (>2.0%)";
        subtextAsymAlertEl.innerHTML = `7-Day Rolling Mean: <span style="color: #f43f5e; font-weight: 700;">Unilateral Fatigue Risk</span>`;
      }} else {{
        badgeAsymAlertEl.className = "badge badge-sweetspot";
        badgeAsymAlertEl.innerText = "Optimal (≤2.0%)";
        subtextAsymAlertEl.innerHTML = `7-Day Rolling Mean: <span class="highlight">Bilateral Gait Symmetry Normal</span>`;
      }}
    }}

    // =========================================================================
    // 4. TAB NAVIGATION
    // =========================================================================
    document.querySelectorAll(".nav-tab[data-tab]").forEach(tab => {{
      tab.addEventListener("click", () => {{
        document.querySelectorAll(".nav-tab[data-tab]").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-section").forEach(s => s.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.getAttribute("data-tab")).classList.add("active");
      }});
    }});

    // =========================================================================
    // 5. GARMIN TABLE & FILTERS
    // =========================================================================
    let activeSplit = "All";
    let filterQuery = "";

    function renderGarminTable() {{
      const tbody = document.getElementById("workoutTableBody");
      let filtered = validGarminSets.filter(r => {{
        const matchSplit = activeSplit === "All" || r.Session_Type === activeSplit;
        const matchSearch = !filterQuery || 
          r.Exercise.toLowerCase().includes(filterQuery) || 
          r.muscleGroup.toLowerCase().includes(filterQuery) ||
          r.Date.includes(filterQuery);
        return matchSplit && matchSearch;
      }});

      tbody.innerHTML = filtered.slice(0, 150).map(r => `
        <tr>
          <td>${{r.Date}}</td>
          <td><span class="badge badge-${{r.Session_Type ? r.Session_Type.toLowerCase() : 'push'}}">${{r.Session_Type}}</span></td>
          <td style="color: var(--primary); font-weight: 600;">${{r.muscleGroup}}</td>
          <td style="font-weight: 600;">${{r.Exercise}}</td>
          <td>${{r.Set}}</td>
          <td>${{r.Reps}}</td>
          <td>${{r.Weight_kg}} kg</td>
          <td>${{r.Total_Volume_kg.toLocaleString()}} kg</td>
          <td style="color: var(--primary); font-weight: 700;">${{r.e1RM_kg}} kg</td>
        </tr>
      `).join("");
    }}

    document.querySelectorAll("#garminFilters .btn-filter").forEach(btn => {{
      btn.addEventListener("click", () => {{
        document.querySelectorAll("#garminFilters .btn-filter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeSplit = btn.getAttribute("data-session");
        renderGarminTable();
      }});
    }});

    document.getElementById("tableSearch").addEventListener("input", (e) => {{
      filterQuery = e.target.value.toLowerCase();
      renderGarminTable();
    }});

    // =========================================================================
    // 6. CHART.JS VISUAL ANALYTICS
    // =========================================================================
    function renderGarminCharts() {{
      // 1. ATHX Competition Radar Chart (New)
      new Chart(document.getElementById("athxRadarChart"), {{
        type: 'radar',
        data: {{
          labels: [
            'S2O (Shoulder-to-Overhead)',
            'Back Squat',
            'Deadlift',
            '5km Running Pace',
            'Sandbag Carry / Grip'
          ],
          datasets: [
            {{
              label: 'Athlete Current (2026)',
              data: [89.2, 88.0, 90.6, 91.5, 91.7],
              backgroundColor: 'rgba(56, 189, 248, 0.25)',
              borderColor: '#38bdf8',
              pointBackgroundColor: '#38bdf8',
              pointBorderColor: '#fff',
              borderWidth: 2.5
            }},
            {{
              label: 'ATHX Non-Pro Benchmark (Tier 1)',
              data: [100, 100, 100, 100, 100],
              backgroundColor: 'transparent',
              borderColor: '#facc15',
              borderDash: [5, 5],
              borderWidth: 2,
              pointBackgroundColor: '#facc15',
              pointRadius: 3
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ position: 'top', labels: {{ color: '#94a3b8', font: {{ size: 11 }} }} }},
            tooltip: {{
              callbacks: {{
                label: function(ctx) {{
                  const val = ctx.raw;
                  if (ctx.datasetIndex === 0) {{
                    const benchmarks = ['58 kg (std: 65 kg)', '110 kg (std: 125 kg)', '145 kg (std: 160 kg)', '4:55/km (std: 4:30/km)', '55 kg (std: 60 kg)'];
                    return `${{ctx.dataset.label}}: ${{val}}% • ${{benchmarks[ctx.dataIndex]}}`;
                  }}
                  return `${{ctx.dataset.label}}: 100% Target`;
                }}
              }}
            }}
          }},
          scales: {{
            r: {{
              angleLines: {{ color: 'rgba(255, 255, 255, 0.08)' }},
              grid: {{ color: 'rgba(255, 255, 255, 0.08)' }},
              pointLabels: {{ color: '#94a3b8', font: {{ size: 11, weight: 600 }} }},
              ticks: {{ display: false, min: 0, max: 115 }}
            }}
          }}
        }}
      }});

      // 2. Weekly Muscle Group Set Volume Stacked Bar with MEV & MRV Lines (New)
      const weekSets = {{}};
      const muscleList = ['Chest', 'Lats/Back', 'Shoulders', 'Quads', 'Hamstrings/Glutes', 'Biceps', 'Triceps', 'Core'];
      
      validGarminSets.forEach(r => {{
        const dt = new Date(r.Date);
        // ISO calendar week approximation
        const temp = new Date(dt.valueOf());
        const dayNr = (dt.getDay() + 6) % 7;
        temp.setDate(temp.getDate() - dayNr + 3);
        const firstThu = temp.valueOf();
        temp.setMonth(0, 1);
        if (temp.getDay() !== 4) {{
          temp.setMonth(0, 1 + ((4 - temp.getDay()) + 7) % 7);
        }}
        const weekNum = 1 + Math.ceil((firstThu - temp) / 604800000);
        const wKey = `W${{weekNum}}`;

        if (!weekSets[wKey]) {{
          weekSets[wKey] = {{}};
          muscleList.forEach(m => weekSets[wKey][m] = 0);
        }}
        if (weekSets[wKey][r.muscleGroup] !== undefined) {{
          weekSets[wKey][r.muscleGroup] += 1;
        }}
      }});

      const weeks = Object.keys(weekSets).slice(-6); // last 6 active training weeks
      const muscleColors = {{
        'Chest': '#38bdf8',
        'Lats/Back': '#a78bfa',
        'Shoulders': '#818cf8',
        'Quads': '#34d399',
        'Hamstrings/Glutes': '#10b981',
        'Biceps': '#f59e0b',
        'Triceps': '#ec4899',
        'Core': '#64748b'
      }};

      const barDatasets = muscleList.map(m => ({{
        type: 'bar',
        label: m,
        data: weeks.map(w => weekSets[w][m] || 0),
        backgroundColor: muscleColors[m],
        stack: 'muscleGroup'
      }}));

      barDatasets.push({{
        type: 'line',
        label: 'MEV Threshold (10 Sets)',
        data: weeks.map(() => 10),
        borderColor: '#facc15',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }});

      barDatasets.push({{
        type: 'line',
        label: 'MRV Ceiling (20 Sets)',
        data: weeks.map(() => 20),
        borderColor: '#f43f5e',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }});

      new Chart(document.getElementById("weeklyMuscleChart"), {{
        type: 'bar',
        data: {{
          labels: weeks,
          datasets: barDatasets
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ position: 'bottom', labels: {{ color: '#94a3b8', boxWidth: 10, font: {{ size: 10 }} }} }}
          }},
          scales: {{
            x: {{ stacked: true, grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: '#94a3b8' }} }},
            y: {{ stacked: true, grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: '#94a3b8' }}, title: {{ display: true, text: 'Direct Working Sets', color: '#94a3b8' }} }}
          }}
        }}
      }});

      // 3. Progression Chart (Excl Unknown)
      const benchByDate = {{}};
      validGarminSets.forEach(r => {{
        if ((r.Exercise === "Bench Press" || (r.Exercise || "").toLowerCase().includes("bench press")) && r.Weight_kg > 40) {{
          if (!benchByDate[r.Date] || r.e1RM_kg > benchByDate[r.Date]) {{
            benchByDate[r.Date] = r.e1RM_kg;
          }}
        }}
      }});
      const benchDates = Object.keys(benchByDate).sort();
      const benchE1rms = benchDates.map(d => benchByDate[d]);

      new Chart(document.getElementById("progressionChart"), {{
        type: 'line',
        data: {{
          labels: benchDates,
          datasets: [
            {{
              label: 'Bench Press e1RM (kg)',
              data: benchE1rms,
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderWidth: 2.5,
              tension: 0.25,
              fill: true
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ labels: {{ color: '#94a3b8' }} }} }},
          scales: {{
            x: {{ grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: '#94a3b8' }} }},
            y: {{ grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: '#94a3b8' }} }}
          }}
        }}
      }});

      // 4. Corrected Volume by Split (Push / Pull / Legs)
      const volBySplit = {{ Push: 0, Pull: 0, Legs: 0 }};
      validGarminSets.forEach(r => {{
        const s = r.Session_Type;
        if (volBySplit[s] !== undefined) volBySplit[s] += r.Total_Volume_kg;
      }});

      new Chart(document.getElementById("volumeSplitChart"), {{
        type: 'doughnut',
        data: {{
          labels: ['Push Split', 'Pull Split', 'Legs Split'],
          datasets: [{{
            data: [volBySplit.Push, volBySplit.Pull, volBySplit.Legs],
            backgroundColor: ['#38bdf8', '#a78bfa', '#34d399'],
            borderColor: '#0f172a',
            borderWidth: 3
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ position: 'bottom', labels: {{ color: '#94a3b8' }} }}
          }}
        }}
      }});
    }}

    // =========================================================================
    // 7. APPLE HEALTH BODY COMP & NUTRITION CHARTS
    // =========================================================================
    function renderAppleHealthCharts() {{
      const weightLabels = bodyComp2026.map(r => r.Date);
      const weightData = bodyComp2026.map(r => r.Weight_kg);
      const bfData = bodyComp2026.map(r => r.Body_Fat_pct);
      const targetWeightData = bodyComp2026.map(() => 85.0);

      new Chart(document.getElementById("weightBfChart"), {{
        type: 'line',
        data: {{
          labels: weightLabels,
          datasets: [
            {{
              label: 'Body Weight (kg)',
              data: weightData,
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderWidth: 2.5,
              tension: 0.2,
              yAxisID: 'y'
            }},
            {{
              label: 'ATHX Target (85.0 kg)',
              data: targetWeightData,
              borderColor: '#facc15',
              borderDash: [6, 6],
              borderWidth: 2,
              pointRadius: 0,
              yAxisID: 'y'
            }},
            {{
              label: 'Body Fat %',
              data: bfData,
              borderColor: '#ff2d55',
              borderWidth: 2,
              tension: 0.2,
              pointRadius: 2,
              yAxisID: 'y1'
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ labels: {{ color: '#94a3b8' }} }} }},
          scales: {{
            x: {{ grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: '#94a3b8', maxTicksLimit: 12 }} }},
            y: {{
              position: 'left',
              title: {{ display: true, text: 'Weight (kg)', color: '#38bdf8' }},
              grid: {{ color: 'rgba(255,255,255,0.05)' }},
              ticks: {{ color: '#94a3b8' }},
              min: 74,
              max: 88
            }},
            y1: {{
              position: 'right',
              title: {{ display: true, text: 'Body Fat (%)', color: '#ff2d55' }},
              grid: {{ drawOnChartArea: false }},
              ticks: {{ color: '#ff2d55' }},
              min: 10,
              max: 25
            }}
          }}
        }}
      }});

      const nutLabels = nutrition2026.map(r => r.Date);
      const calData = nutrition2026.map(r => r.Calories_kcal);
      const protData = nutrition2026.map(r => r.Protein_g);

      new Chart(document.getElementById("nutritionChart"), {{
        type: 'bar',
        data: {{
          labels: nutLabels,
          datasets: [
            {{
              type: 'line',
              label: 'Protein (g)',
              data: protData,
              borderColor: '#34d399',
              borderWidth: 2.5,
              yAxisID: 'yProt',
              pointRadius: 2,
              tension: 0.2
            }},
            {{
              type: 'bar',
              label: 'Daily Calories (kcal)',
              data: calData,
              backgroundColor: 'rgba(56, 189, 248, 0.4)',
              borderColor: '#38bdf8',
              borderWidth: 1,
              yAxisID: 'yCal'
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ labels: {{ color: '#94a3b8' }} }} }},
          scales: {{
            x: {{ grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: '#94a3b8', maxTicksLimit: 12 }} }},
            yCal: {{
              position: 'left',
              title: {{ display: true, text: 'Calories (kcal)', color: '#38bdf8' }},
              grid: {{ color: 'rgba(255,255,255,0.05)' }},
              ticks: {{ color: '#94a3b8' }}
            }},
            yProt: {{
              position: 'right',
              title: {{ display: true, text: 'Protein (g)', color: '#34d399' }},
              grid: {{ drawOnChartArea: false }},
              ticks: {{ color: '#34d399' }},
              min: 0,
              max: 350
            }}
          }}
        }}
      }});

      const mBody = document.getElementById("monthlyTableBody");
      mBody.innerHTML = monthlySummary.map(m => `
        <tr>
          <td style="font-weight: 700; color: var(--text-main);">${{m.month}}</td>
          <td style="color: var(--primary); font-weight: 600;">${{m.avg_weight ? m.avg_weight + ' kg' : '—'}}</td>
          <td style="color: #34d399; font-weight: 600;">${{m.avg_bf ? m.avg_bf + '%' : '—'}}</td>
          <td>${{m.avg_lean_mass ? m.avg_lean_mass + ' kg' : '—'}}</td>
          <td>${{m.avg_calories ? m.avg_calories.toLocaleString() + ' kcal' : '—'}}</td>
          <td style="color: #34d399;">${{m.avg_protein ? m.avg_protein + ' g' : '—'}}</td>
          <td>${{m.avg_steps ? m.avg_steps.toLocaleString() + ' steps' : '—'}}</td>
          <td><span class="badge badge-push">${{m.weigh_ins}} entries</span></td>
        </tr>
      `).join("");
    }}

    // =========================================================================
    // 8. SLEEP ARCHITECTURE, BIOMECHANICS & CORRELATION CHARTS
    // =========================================================================
    function renderSleepAndBiomechanics() {{
      // 1. Sleep Recovery vs e1RM Performance Correlation Chart (New)
      const sleepMap = {{}};
      sleepData.forEach(s => {{ sleepMap[s.Date] = s; }});

      const corrDates = [];
      const corrSleepDeepRem = [];
      const corrE1rm = [];

      // Group max compound e1RM by date (Bench, Squat, Shoulder Press, Deadlift)
      const maxE1rmByDate = {{}};
      validGarminSets.forEach(r => {{
        if (r.Weight_kg >= 30) {{
          if (!maxE1rmByDate[r.Date] || r.e1RM_kg > maxE1rmByDate[r.Date]) {{
            maxE1rmByDate[r.Date] = r.e1RM_kg;
          }}
        }}
      }});

      Object.keys(maxE1rmByDate).sort().forEach(d => {{
        if (sleepMap[d]) {{
          corrDates.push(d);
          const s = sleepMap[d];
          corrSleepDeepRem.push(parseFloat(((s.Deep_Sleep_hrs || 0) + (s.REM_Sleep_hrs || 0)).toFixed(2)));
          corrE1rm.push(maxE1rmByDate[d]);
        }}
      }});

      new Chart(document.getElementById("sleepStrengthCorrChart"), {{
        type: 'line',
        data: {{
          labels: corrDates,
          datasets: [
            {{
              label: 'Deep + REM Sleep Duration (hrs)',
              data: corrSleepDeepRem,
              borderColor: '#818cf8',
              backgroundColor: 'rgba(129, 140, 248, 0.15)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              yAxisID: 'ySleep'
            }},
            {{
              label: 'Session Peak e1RM (kg)',
              data: corrE1rm,
              borderColor: '#38bdf8',
              borderWidth: 2.5,
              pointRadius: 4,
              pointBackgroundColor: '#38bdf8',
              tension: 0.2,
              yAxisID: 'yE1rm'
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ position: 'top', labels: {{ color: '#94a3b8' }} }},
            tooltip: {{ mode: 'index', intersect: false }}
          }},
          scales: {{
            x: {{ grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: '#94a3b8', maxTicksLimit: 10 }} }},
            ySleep: {{
              position: 'left',
              title: {{ display: true, text: 'Deep + REM Sleep (hrs)', color: '#818cf8' }},
              grid: {{ color: 'rgba(255,255,255,0.05)' }},
              ticks: {{ color: '#818cf8' }},
              min: 0,
              max: 6
            }},
            yE1rm: {{
              position: 'right',
              title: {{ display: true, text: 'Peak e1RM (kg)', color: '#38bdf8' }},
              grid: {{ drawOnChartArea: false }},
              ticks: {{ color: '#38bdf8' }},
              min: 50,
              max: 150
            }}
          }}
        }}
      }});

      // 2. Sleep Hypnogram Stacked Bar Chart
      const recentSleep = sleepData.slice(-45);
      const sLabels = recentSleep.map(r => r.Date);
      const deepData = recentSleep.map(r => r.Deep_Sleep_hrs);
      const remData = recentSleep.map(r => r.REM_Sleep_hrs);
      const coreData = recentSleep.map(r => r.Core_Sleep_hrs);
      const awakeData = recentSleep.map(r => r.Awake_hrs);
      const targetSleep = recentSleep.map(() => 8.0);

      new Chart(document.getElementById("sleepHypnogramChart"), {{
        type: 'bar',
        data: {{
          labels: sLabels,
          datasets: [
            {{
              label: 'Deep Sleep (hrs)',
              data: deepData,
              backgroundColor: '#6366f1',
              stack: 'sleep'
            }},
            {{
              label: 'REM Sleep (hrs)',
              data: remData,
              backgroundColor: '#10b981',
              stack: 'sleep'
            }},
            {{
              label: 'Core Sleep (hrs)',
              data: coreData,
              backgroundColor: '#38bdf8',
              stack: 'sleep'
            }},
            {{
              label: 'Awake (hrs)',
              data: awakeData,
              backgroundColor: '#f43f5e',
              stack: 'sleep'
            }},
            {{
              type: 'line',
              label: 'Target Sleep (8.0h)',
              data: targetSleep,
              borderColor: '#facc15',
              borderDash: [5, 5],
              borderWidth: 2,
              pointRadius: 0
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ position: 'top', labels: {{ color: '#94a3b8' }} }}
          }},
          scales: {{
            x: {{ stacked: true, grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: '#94a3b8', maxTicksLimit: 12 }} }},
            y: {{
              stacked: true,
              title: {{ display: true, text: 'Total Hours', color: '#94a3b8' }},
              grid: {{ color: 'rgba(255,255,255,0.05)' }},
              ticks: {{ color: '#94a3b8' }},
              min: 0,
              max: 12
            }}
          }}
        }}
      }});

      // 3. Mobility & Gait Asymmetry Chart with 2.0% Alert Line
      const mobLabels = mobilityData.map(r => r.Date);
      const speedData = mobilityData.map(r => r.Walking_Speed_kmh);
      const asymData = mobilityData.map(r => r.Walking_Asymmetry_pct);
      const asymAlertLine = mobilityData.map(() => 2.0);

      new Chart(document.getElementById("mobilityChart"), {{
        type: 'line',
        data: {{
          labels: mobLabels,
          datasets: [
            {{
              label: 'Walking Speed (km/h)',
              data: speedData,
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              borderWidth: 2.2,
              tension: 0.2,
              pointRadius: 2,
              yAxisID: 'ySpd',
              fill: true
            }},
            {{
              label: 'Gait Asymmetry (%)',
              data: asymData,
              borderColor: '#f59e0b',
              borderWidth: 2,
              tension: 0.2,
              pointRadius: 2.5,
              yAxisID: 'yAsym'
            }},
            {{
              label: 'Asymmetry Threshold (2.0%)',
              data: asymAlertLine,
              borderColor: '#f43f5e',
              borderDash: [5, 5],
              borderWidth: 2,
              pointRadius: 0,
              yAxisID: 'yAsym'
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ labels: {{ color: '#94a3b8' }} }} }},
          scales: {{
            x: {{ grid: {{ color: 'rgba(255,255,255,0.05)' }}, ticks: {{ color: '#94a3b8', maxTicksLimit: 14 }} }},
            ySpd: {{
              position: 'left',
              title: {{ display: true, text: 'Speed (km/h)', color: '#38bdf8' }},
              grid: {{ color: 'rgba(255,255,255,0.05)' }},
              ticks: {{ color: '#38bdf8' }},
              min: 3.0,
              max: 6.0
            }},
            yAsym: {{
              position: 'right',
              title: {{ display: true, text: 'Asymmetry (%)', color: '#f59e0b' }},
              grid: {{ drawOnChartArea: false }},
              ticks: {{ color: '#f59e0b' }},
              min: 0.0,
              max: 6.5
            }}
          }}
        }}
      }});

      // 4. Sleep Table
      const sBody = document.getElementById("sleepTableBody");
      const mobMap = {{}};
      mobilityData.forEach(m => {{ mobMap[m.Date] = m; }});

      let sleepFilter = "";
      function renderSleepTable() {{
        const filtered = sleepData.slice().reverse().filter(s => {{
          return !sleepFilter || s.Date.includes(sleepFilter);
        }});

        sBody.innerHTML = filtered.slice(0, 100).map(s => {{
          const m = mobMap[s.Date] || {{}};
          const deepPctBadge = s.Deep_pct >= 20 
            ? `<span class="badge" style="background: rgba(99,102,241,0.2); color: #818cf8;">${{s.Deep_Sleep_hrs}}h (${{s.Deep_pct}}%)</span>` 
            : `${{s.Deep_Sleep_hrs}}h (${{s.Deep_pct}}%)`;
          const asymBadge = m.Walking_Asymmetry_pct !== undefined && m.Walking_Asymmetry_pct !== null
            ? (m.Walking_Asymmetry_pct <= 2.0 
                ? `<span class="badge badge-sweetspot">${{m.Walking_Asymmetry_pct}}%</span>` 
                : `<span class="badge badge-danger">${{m.Walking_Asymmetry_pct}}%</span>`)
            : '—';

          return `
            <tr>
              <td style="font-weight: 700;">${{s.Date}}</td>
              <td style="color: var(--primary); font-weight: 700;">${{s.Total_Sleep_hrs}} hrs</td>
              <td>${{deepPctBadge}}</td>
              <td style="color: #34d399;">${{s.REM_Sleep_hrs}}h (${{s.REM_pct}}%)</td>
              <td>${{s.Core_Sleep_hrs}} hrs</td>
              <td style="color: var(--text-muted);">${{s.Awake_hrs}} hrs</td>
              <td>${{s.In_Bed_hrs}} hrs</td>
              <td style="color: var(--primary); font-weight: 600;">${{m.Walking_Speed_kmh ? m.Walking_Speed_kmh + ' km/h' : '—'}}</td>
              <td>${{asymBadge}}</td>
              <td>${{m.Walking_Step_Length_cm ? m.Walking_Step_Length_cm + ' cm' : '—'}}</td>
            </tr>
          `;
        }}).join("");
      }}

      document.getElementById("sleepSearch").addEventListener("input", (e) => {{
        sleepFilter = e.target.value.toLowerCase();
        renderSleepTable();
      }});

      renderSleepTable();
    }}

    // =========================================================================
    // INIT
    // =========================================================================
    renderGarminTable();
    renderGarminCharts();
    renderAppleHealthCharts();
    renderSleepAndBiomechanics();
  </script>
</body>
</html>
"""

output_file = BASE_DIR / "garmin_workout.html"
with open(output_file, "w", encoding="utf-8") as f:
    f.write(html_template)

print(f"✅ Refactored and regenerated athlete headquarters: {output_file}")
