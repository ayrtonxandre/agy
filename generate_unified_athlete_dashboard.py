#!/usr/bin/env python3
"""
================================================================================
Unified ATHX 2027 Dashboard Generator: Garmin Strength + Apple Health 2026
================================================================================
Combines:
  1. Garmin Connect: 771 sets, 35 workouts, PPL split, Volume, e1RMs, PRs.
  2. Apple Health (2026 Only):
     - RENPHO Body Composition (Weight, Body Fat %, Lean Mass, 85 kg Goal)
     - Foodvisor Nutrition & Macros (Calories, Protein, Carbs, Fat)
     - Daily Steps, Active Energy, and Activity volume
"""

import json
import csv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# 1. Load Garmin Workout Data
with open(BASE_DIR / "garmin_workout_volume.json", "r", encoding="utf-8") as f:
    garmin_data = json.load(f)

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

# Monthly Aggregations for 2026
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

json_garmin = json.dumps(garmin_data)
json_body = json.dumps(body_comp_2026)
json_nutrition = json.dumps(nutrition_2026)
json_monthly = json.dumps(monthly_summary)

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
      --danger: #f43f5e;
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

    .title-group h1 {{
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }}

    .title-group p {{
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }}

    .target-badge {{
      background: rgba(250, 204, 21, 0.12);
      border: 1px solid rgba(250, 204, 21, 0.3);
      color: var(--athx-gold);
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}

    /* Navigation Tabs */
    .nav-tabs {{
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.75rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.75rem;
    }}

    .nav-tab {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 0.6rem 1.25rem;
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

    /* KPI Grid */
    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
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
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.75rem;
    }}

    .chart-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
    }}

    .chart-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }}

    .chart-title {{
      font-size: 1.05rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}

    .chart-container {{
      position: relative;
      height: 310px;
      width: 100%;
    }}

    /* Tables */
    .table-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 1.75rem;
    }}

    .table-container {{
      overflow-x: auto;
      max-height: 520px;
      overflow-y: auto;
      border-radius: 8px;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
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
    <header>
      <div class="title-group">
        <h1>⚡ ATHX 2027 Athlete Headquarters</h1>
        <p>Garmin PPL Engine (35 Sessions, 771 Sets) • Apple Health 2026 Biometrics & Fueling</p>
      </div>
      <div class="target-badge">
        <span>🏆</span> Target: 85.0 kg Individual Non-Pro
      </div>
    </header>

    <!-- Top Navigation Tabs -->
    <div class="nav-tabs">
      <button class="nav-tab active" data-tab="garminTab">
        🏋️ Garmin PPL & Volume Engine
      </button>
      <button class="nav-tab apple-tab" data-tab="appleTab">
        🍏 Apple Health: 2026 Body Comp & Fueling
      </button>
    </div>

    <!-- =========================================================================
         TAB 1: GARMIN PPL & VOLUME ENGINE
         ========================================================================= -->
    <div id="garminTab" class="tab-section active">
      <!-- KPIs -->
      <section class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Top Bench Press e1RM</span></div>
          <div class="kpi-value" id="kpiE1rm">95.0 <span>kg</span></div>
          <div class="kpi-subtext">Peak Load: <span class="highlight">75.0 kg × 8 reps</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Total Volume Lifted</span></div>
          <div class="kpi-value">273.4 <span>Tons</span></div>
          <div class="kpi-subtext">Cumulative: <span class="highlight">273,409 kg</span> (35 sessions)</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Total Working Sets</span></div>
          <div class="kpi-value">771 <span>Sets</span></div>
          <div class="kpi-subtext">Total Reps: <span class="highlight">10,563 reps</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">ATHX Readiness</span></div>
          <div class="kpi-value" style="color: var(--athx-gold);">93.3 <span>%</span></div>
          <div class="kpi-subtext">Competition Alignment: <span class="highlight">Tier 1 Spec</span></div>
        </div>
      </section>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">📈 Top Lift Progression (Estimated 1RM)</span>
          </div>
          <div class="chart-container">
            <canvas id="progressionChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">⚖️ Hypertrophy Volume by Split (kg)</span>
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
        <input type="text" id="tableSearch" class="search-input" placeholder="Search exercise or date...">
      </div>

      <div class="table-card">
        <div class="table-container">
          <table id="workoutTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Split</th>
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
         TAB 2: APPLE HEALTH 2026 BIOMETRICS & FUELING
         ========================================================================= -->
    <div id="appleTab" class="tab-section">
      <!-- 2026 Core Biometrics KPIs -->
      <section class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Current Weight vs ATHX</span>
            <span class="badge badge-gold">Target 85.0 kg</span>
          </div>
          <div class="kpi-value" id="kpiWeight">80.2 <span>kg</span></div>
          <div class="kpi-subtext">Remaining: <span class="highlight">-4.8 kg</span> to goal weight</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: 94.3%;"></div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">2026 Body Fat Recomp</span>
            <span class="badge" style="background: rgba(52,211,153,0.15); color: #34d399;">-7.4% BF</span>
          </div>
          <div class="kpi-value">14.3 <span>%</span></div>
          <div class="kpi-subtext">Down from <span class="highlight">21.7% in Feb 2026</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Lean Muscle Mass</span></div>
          <div class="kpi-value">68.7 <span>kg</span></div>
          <div class="kpi-subtext">Bioimpedance: <span class="highlight">85.7% Lean Ratio</span></div>
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

      <!-- 2026 Charts Grid -->
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

      <!-- 2026 Monthly Breakdown Table -->
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
  </div>

  <script>
    // Injected Data
    const garminData = {json_garmin};
    const bodyComp2026 = {json_body};
    const nutrition2026 = {json_nutrition};
    const monthlySummary = {json_monthly};

    // Tab Switching
    document.querySelectorAll(".nav-tab").forEach(tab => {{
      tab.addEventListener("click", () => {{
        document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-section").forEach(s => s.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.getAttribute("data-tab")).classList.add("active");
      }});
    }});

    // =========================================================================
    // GARMIN TABLE & CHARTS
    // =========================================================================
    let activeSplit = "All";
    let filterQuery = "";

    function renderGarminTable() {{
      const tbody = document.getElementById("workoutTableBody");
      let filtered = garminData.filter(r => {{
        const matchSplit = activeSplit === "All" || r.Session_Type === activeSplit;
        const matchSearch = !filterQuery || 
          r.Exercise.toLowerCase().includes(filterQuery) || 
          r.Date.includes(filterQuery);
        return matchSplit && matchSearch;
      }});

      tbody.innerHTML = filtered.slice(0, 150).map(r => `
        <tr>
          <td>${{r.Date}}</td>
          <td><span class="badge badge-${{r.Session_Type ? r.Session_Type.toLowerCase() : 'push'}}">${{r.Session_Type || 'Strength'}}</span></td>
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

    // Garmin Charts
    function renderGarminCharts() {{
      // Progression Chart (Bench, Squat, Shoulder Press)
      const benchDates = [];
      const benchE1rms = [];
      const squatDates = [];
      const squatE1rms = [];

      garminData.forEach(r => {{
        if (r.Exercise === "Bench Press" && r.Weight_kg > 40) {{
          benchDates.push(r.Date);
          benchE1rms.push(r.e1RM_kg);
        }} else if (r.Exercise === "Barbell Back Squat" && r.Weight_kg > 40) {{
          squatDates.push(r.Date);
          squatE1rms.push(r.e1RM_kg);
        }}
      }});

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

      // Volume by Split
      const volBySplit = {{ Push: 0, Pull: 0, Legs: 0 }};
      garminData.forEach(r => {{
        const s = r.Session_Type || "Push";
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
    // APPLE HEALTH CHARTS & MONTHLY SUMMARY
    // =========================================================================
    function renderAppleHealthCharts() {{
      // 1. Weight & Body Fat Chart
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

      // 2. Nutrition Chart
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

      // 3. Monthly Table
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

    // Init
    renderGarminTable();
    renderGarminCharts();
    renderAppleHealthCharts();
  </script>
</body>
</html>
"""

with open(BASE_DIR / "garmin_workout.html", "w", encoding="utf-8") as f:
    f.write(html_template)

print(f"✅ Generated unified athlete headquarters in: {BASE_DIR / 'garmin_workout.html'}")
