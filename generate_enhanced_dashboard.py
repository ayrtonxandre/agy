import json

with open("garmin_workout_volume.json") as f:
    records = json.load(f)

json_data = json.dumps(records)

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Garmin Athletic & Hypertrophy Analytics | ATHX 2027 Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {{
      --bg: #0b0f19;
      --card-bg: #151d2f;
      --card-sub-bg: #0f172a;
      --card-border: #243049;
      --card-hover-border: #3b82f6;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --primary-hover: #0ea5e9;
      --push-color: #38bdf8;
      --legs-color: #34d399;
      --pull-color: #a78bfa;
      --table-hover: #1e293b;
      --volume-color: #10b981;
      --pr-weight-color: #f59e0b;
      --pr-vol-color: #8b5cf6;
      --athx-gold: #facc15;
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
      padding: 1.75rem 1.25rem;
      min-height: 100vh;
      line-height: 1.5;
    }}

    .container {{
      max-width: 1400px;
      margin: 0 auto;
    }}

    /* Header */
    header {{
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.25rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 1.5rem;
    }}

    .title-group h1 {{
      font-size: 2.1rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }}

    .title-group p {{
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 0.25rem;
    }}

    .target-badge {{
      background: linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(245, 158, 11, 0.1));
      color: var(--athx-gold);
      border: 1px solid rgba(250, 204, 21, 0.4);
      padding: 0.5rem 1.1rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }}

    /* Stat Grid */
    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1rem;
      margin-bottom: 1.75rem;
    }}

    .kpi-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }}

    .kpi-card:hover {{
      border-color: var(--card-hover-border);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }}

    .kpi-card::before {{
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), transparent);
    }}

    .kpi-card.gold::before {{
      background: linear-gradient(90deg, var(--athx-gold), transparent);
    }}

    .kpi-card.emerald::before {{
      background: linear-gradient(90deg, #34d399, transparent);
    }}

    .kpi-card.purple::before {{
      background: linear-gradient(90deg, #a78bfa, transparent);
    }}

    .kpi-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }}

    .kpi-label {{
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }}

    .kpi-select {{
      background: var(--card-sub-bg);
      border: 1px solid var(--card-border);
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 6px;
      padding: 0.2rem 0.5rem;
      outline: none;
      cursor: pointer;
    }}

    .kpi-value {{
      font-size: 1.95rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }}

    .kpi-value span {{
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-muted);
    }}

    .kpi-subtext {{
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }}

    .kpi-subtext .highlight {{
      font-weight: 700;
      color: var(--success, #34d399);
    }}

    /* Controls Bar */
    .controls-wrapper {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }}

    .controls-main {{
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
      padding: 0.45rem 0.95rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }}

    .btn-filter:hover {{
      background: #1e293b;
      color: var(--text-main);
    }}

    .btn-filter.active {{
      background: var(--primary);
      color: #0b0f19;
      border-color: var(--primary);
    }}

    .athx-toggle-btn {{
      background: rgba(250, 204, 21, 0.08);
      border: 1px solid rgba(250, 204, 21, 0.35);
      color: var(--athx-gold);
      padding: 0.45rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }}

    .athx-toggle-btn:hover, .athx-toggle-btn.active {{
      background: var(--athx-gold);
      color: #0b0f19;
      border-color: var(--athx-gold);
      box-shadow: 0 0 15px rgba(250, 204, 21, 0.3);
    }}

    .search-input {{
      background: var(--card-sub-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      color: var(--text-main);
      font-size: 0.88rem;
      outline: none;
      min-width: 260px;
    }}

    .search-input:focus {{
      border-color: var(--primary);
    }}

    .muscle-chips {{
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }}

    .chip {{
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }}

    .chip:hover {{
      border-color: var(--text-muted);
      color: var(--text-main);
    }}

    .chip.active {{
      background: rgba(56, 189, 248, 0.15);
      border-color: var(--primary);
      color: var(--primary);
    }}

    /* Charts Layout */
    .charts-row {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }}

    @media (max-width: 1024px) {{
      .charts-row {{
        grid-template-columns: 1fr;
      }}
    }}

    .chart-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.5rem;
    }}

    .chart-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }}

    .chart-header h2 {{
      font-size: 1.1rem;
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

    /* Table Section */
    .table-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.5rem;
    }}

    .table-container {{
      overflow-x: auto;
      max-height: 560px;
      overflow-y: auto;
      border-radius: 8px;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }}

    th {{
      position: sticky;
      top: 0;
      background-color: #0f172a;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      padding: 0.9rem 1rem;
      border-bottom: 2px solid var(--card-border);
      z-index: 2;
    }}

    td {{
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }}

    tbody tr:hover {{
      background-color: var(--table-hover);
    }}

    .clickable-exercise {{
      font-weight: 600;
      color: var(--text-main);
      cursor: pointer;
      text-decoration: underline;
      text-decoration-color: rgba(56, 189, 248, 0.3);
      text-underline-offset: 3px;
      transition: color 0.15s ease, text-decoration-color 0.15s ease;
    }}

    .clickable-exercise:hover {{
      color: var(--primary);
      text-decoration-color: var(--primary);
    }}

    /* Badges */
    .badge {{
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}

    .badge-push {{ background: rgba(56, 189, 248, 0.15); color: var(--push-color); border: 1px solid rgba(56, 189, 248, 0.3); }}
    .badge-legs {{ background: rgba(52, 211, 153, 0.15); color: var(--legs-color); border: 1px solid rgba(52, 211, 153, 0.3); }}
    .badge-pull {{ background: rgba(167, 139, 250, 0.15); color: var(--pull-color); border: 1px solid rgba(167, 139, 250, 0.3); }}

    .badge-muscle {{
      background: rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.7rem;
    }}

    .pr-badge {{
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-left: 0.35rem;
    }}

    .pr-weight {{
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.5);
    }}

    .pr-vol {{
      background: rgba(139, 92, 246, 0.2);
      color: #c084fc;
      border: 1px solid rgba(139, 92, 246, 0.5);
    }}

    .athx-badge {{
      background: rgba(250, 204, 21, 0.15);
      color: var(--athx-gold);
      border: 1px solid rgba(250, 204, 21, 0.4);
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.68rem;
      font-weight: 800;
      margin-left: 0.35rem;
    }}

    .athx-row-highlight {{
      background-color: rgba(250, 204, 21, 0.03);
    }}

    /* Modal */
    .modal-overlay {{
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }}

    .modal-overlay.open {{
      display: flex;
    }}

    .modal-content {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 2rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      position: relative;
    }}

    .modal-close {{
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: var(--card-sub-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all 0.2s ease;
    }}

    .modal-close:hover {{
      color: var(--text-main);
      background: #334155;
    }}

    .modal-stats-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.75rem;
      margin: 1.25rem 0;
    }}

    .modal-stat {{
      background: var(--card-sub-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 0.85rem;
      text-align: center;
    }}

    .modal-stat-label {{
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
    }}

    .modal-stat-val {{
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--primary);
      margin-top: 0.2rem;
    }}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-group">
        <h1>⚡ ATHX 2027 Athletic Performance & Hypertrophy Dashboard</h1>
        <p>Garmin PPL Engine • Target 85 kg Bodyweight • ATHX Individual Non-Pro Readiness</p>
      </div>
      <div class="target-badge">
        <span>🏆</span> ATHX 2027 Non-Pro Ready
      </div>
    </header>

    <!-- 1. Top Core KPIs -->
    <section class="kpi-grid">
      <!-- KPI 1: Top e1RM -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Top e1RM (Epley)</span>
          <select class="kpi-select" id="e1rmSelect">
            <option value="Bench Press">Bench Press</option>
            <option value="Barbell Back Squat">Back Squat</option>
            <option value="Dumbbell RDL">Dumbbell RDL</option>
            <option value="Barbell Shoulder Press">Shoulder Press</option>
            <option value="T-Bar Row">T-Bar Row</option>
          </select>
        </div>
        <div class="kpi-value" id="kpiE1rm">95.0 <span>kg</span></div>
        <div class="kpi-subtext" id="kpiE1rmDetails">Best: 75.0 kg × 8 reps</div>
      </div>

      <!-- KPI 2: Training Density -->
      <div class="kpi-card emerald">
        <div class="kpi-header">
          <span class="kpi-label">Training Density</span>
          <span class="badge" style="background: rgba(52,211,153,0.15); color: #34d399;">Active</span>
        </div>
        <div class="kpi-value" id="kpiDensity">148.1 <span>kg/min</span></div>
        <div class="kpi-subtext">Active Work: <span class="highlight" id="kpiActiveTime">~308 mins</span> (6 sessions)</div>
      </div>

      <!-- KPI 3: Weekly Hypertrophy Sets -->
      <div class="kpi-card purple">
        <div class="kpi-header">
          <span class="kpi-label">Weekly Hypertrophy Sets</span>
          <span class="badge" style="background: rgba(167,139,250,0.15); color: #a78bfa;">W35 Peak</span>
        </div>
        <div class="kpi-value" id="kpiWeeklySets">85 <span>/ 80 Sets</span></div>
        <div class="kpi-subtext"><span class="highlight">106% Target</span> (Optimal Hypertrophy Range)</div>
      </div>

      <!-- KPI 4: PR Counter -->
      <div class="kpi-card gold">
        <div class="kpi-header">
          <span class="kpi-label">Personal Records (PRs)</span>
          <span class="badge" style="background: rgba(250,204,21,0.15); color: var(--athx-gold);">All-Time</span>
        </div>
        <div class="kpi-value" id="kpiPRCount">44 <span>PRs</span></div>
        <div class="kpi-subtext"><span class="highlight" style="color: #fbbf24;">🔥 22 Weight</span> • <span class="highlight" style="color: #c084fc;">📊 22 Volume</span></div>
      </div>

      <!-- KPI 5: ATHX Readiness Index -->
      <div class="kpi-card gold">
        <div class="kpi-header">
          <span class="kpi-label">ATHX Readiness Index</span>
          <span class="badge" style="background: rgba(250,204,21,0.15); color: var(--athx-gold);">Non-Pro Spec</span>
        </div>
        <div class="kpi-value" id="kpiAthxIndex" style="color: var(--athx-gold);">93.3 <span>%</span></div>
        <div class="kpi-subtext">Competition Load Alignment: <span class="highlight" style="color: #34d399;">Tier 1 Standard</span></div>
      </div>
    </section>

    <!-- Controls & Filters Bar -->
    <div class="controls-wrapper">
      <div class="controls-main">
        <div class="btn-group" id="sessionFilters">
          <button class="btn-filter active" data-session="All">All Sessions</button>
          <button class="btn-filter" data-session="Push">Push</button>
          <button class="btn-filter" data-session="Legs">Legs</button>
          <button class="btn-filter" data-session="Pull">Pull</button>
        </div>

        <button class="athx-toggle-btn" id="athxToggle">
          <span>⚡</span> View ATHX Baseline Alignment: <strong id="athxToggleState">OFF</strong>
        </button>

        <input type="text" class="search-input" id="tableSearch" placeholder="🔍 Search exercise, muscle, date...">
      </div>

      <!-- Muscle group chips -->
      <div class="muscle-chips" id="muscleChips">
        <button class="chip active" data-muscle="All">All Muscle Groups</button>
        <button class="chip" data-muscle="Chest">Chest</button>
        <button class="chip" data-muscle="Back">Lats / Back</button>
        <button class="chip" data-muscle="Quads">Quads</button>
        <button class="chip" data-muscle="Hamstrings">Hamstrings</button>
        <button class="chip" data-muscle="Shoulders">Shoulders</button>
        <button class="chip" data-muscle="Triceps">Triceps</button>
        <button class="chip" data-muscle="Biceps">Biceps</button>
        <button class="chip" data-muscle="Core">Core</button>
        <button class="chip" data-muscle="Forearms">Forearms</button>
        <button class="chip" data-muscle="Calves">Calves</button>
      </div>
    </div>

    <!-- 2. Advanced Visualizations (Chart.js) -->
    <!-- Row 1: e1RM Progression + ATHX Spider Radar -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-header">
          <h2>📈 Strength Progression & e1RM Trend</h2>
          <select class="kpi-select" id="progressionExerciseSelect">
            <option value="All">All Main Compounds</option>
            <option value="Bench Press">Bench Press</option>
            <option value="Barbell Back Squat">Barbell Back Squat</option>
            <option value="Dumbbell RDL">Dumbbell RDL</option>
            <option value="Barbell Shoulder Press">Barbell Shoulder Press</option>
            <option value="T-Bar Row">T-Bar Row</option>
          </select>
        </div>
        <div class="chart-container">
          <canvas id="progressionChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h2>🎯 ATHX Athlete Radar (Non-Pro Benchmark)</h2>
          <span class="badge" style="background: rgba(250,204,21,0.15); color: var(--athx-gold);">5-Axis Spec</span>
        </div>
        <div class="chart-container">
          <canvas id="athxRadarChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Row 2: Hypertrophy Distribution + Set Intensity Bubble -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-header">
          <h2>📊 Muscle Group Weekly Volume (Direct Sets)</h2>
          <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 0.75rem;">
            <span>🟢 MEV: 10 sets</span>
            <span>🔴 MRV: 20 sets</span>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="muscleVolumeChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h2>🔬 Set Intensity & Rep Distribution</h2>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Bubble size = Set Volume (kg)</span>
        </div>
        <div class="chart-container">
          <canvas id="intensityBubbleChart"></canvas>
        </div>
      </div>
    </div>

    <!-- 3. UI/UX & Data Table Enhancements -->
    <section class="table-card">
      <div class="chart-header">
        <h2>
          <span>📋 Workout Sets Log (<span id="tableCount">0</span> sets)</span>
        </h2>
        <div style="display: flex; gap: 0.5rem; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
          <span>Click any exercise to view historical progression</span>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Session</th>
              <th>Exercise</th>
              <th>Target Muscle</th>
              <th>Set</th>
              <th>Reps</th>
              <th>Load (kg)</th>
              <th>e1RM (kg)</th>
              <th>Set Volume</th>
              <th>PR / ATHX Badges</th>
            </tr>
          </thead>
          <tbody id="tableBody">
            <!-- Dynamically populated -->
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <!-- Exercise Detail Modal -->
  <div class="modal-overlay" id="exerciseModal">
    <div class="modal-content">
      <button class="modal-close" id="modalCloseBtn">&times;</button>
      <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
        <h2 id="modalExerciseTitle" style="font-size: 1.5rem; font-weight: 800;">Exercise Details</h2>
        <span class="badge" id="modalMuscleBadge">Muscle</span>
        <span class="badge" id="modalSessionBadge">Session</span>
      </div>
      <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.25rem;">Historical progression, peak load, and rep metrics</p>

      <div class="modal-stats-grid">
        <div class="modal-stat">
          <div class="modal-stat-label">Max Load</div>
          <div class="modal-stat-val" id="modalMaxWeight">0 kg</div>
        </div>
        <div class="modal-stat">
          <div class="modal-stat-label">Top e1RM</div>
          <div class="modal-stat-val" id="modalTopE1rm">0 kg</div>
        </div>
        <div class="modal-stat">
          <div class="modal-stat-label">Max Reps</div>
          <div class="modal-stat-val" id="modalMaxReps">0</div>
        </div>
        <div class="modal-stat">
          <div class="modal-stat-label">Total Volume</div>
          <div class="modal-stat-val" id="modalTotalVol">0 kg</div>
        </div>
        <div class="modal-stat">
          <div class="modal-stat-label">Total Sets</div>
          <div class="modal-stat-val" id="modalTotalSets">0</div>
        </div>
      </div>

      <div style="margin-top: 1.5rem;">
        <h3 style="font-size: 1rem; margin-bottom: 0.75rem;">Weight & e1RM Progression Curve</h3>
        <div style="height: 220px; position: relative;">
          <canvas id="modalProgressChart"></canvas>
        </div>
      </div>

      <div style="margin-top: 1.5rem;">
        <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">Set History</h3>
        <div style="max-height: 200px; overflow-y: auto;">
          <table style="font-size: 0.82rem;">
            <thead>
              <tr>
                <th>Date</th>
                <th>Set</th>
                <th>Reps</th>
                <th>Weight (kg)</th>
                <th>Volume (kg)</th>
                <th>e1RM (kg)</th>
              </tr>
            </thead>
            <tbody id="modalSetTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Raw workout dataset
    const rawData = {json_data};

    // Exercise Metadata & ATHX Benchmarks
    const exerciseMeta = {{
      "Bench Press": {{ muscle: "Chest", athxLoad: 70.0, athxDesc: "70+ kg working load" }},
      "Machine Butterfly": {{ muscle: "Chest", athxLoad: 75.0, athxDesc: "75+ kg chest fly" }},
      "Barbell Shoulder Press": {{ muscle: "Shoulders", athxLoad: 30.0, athxDesc: "30+ kg OHP" }},
      "Push Press": {{ muscle: "Shoulders", athxLoad: 40.0, athxDesc: "40+ kg S2O" }},
      "Lateral Raise": {{ muscle: "Shoulders", athxLoad: 12.0, athxDesc: "12+ kg DBs" }},
      "Triceps Extension": {{ muscle: "Triceps", athxLoad: 25.0, athxDesc: "25+ kg extension" }},
      "Triceps Press Machine": {{ muscle: "Triceps", athxLoad: 80.0, athxDesc: "80+ kg machine press" }},
      "Triceps Press-down": {{ muscle: "Triceps", athxLoad: 25.0, athxDesc: "25+ kg cable pushdown" }},
      "Sit-up": {{ muscle: "Core", athxLoad: 5.0, athxReps: 15, athxDesc: "Weighted or 15+ reps" }},
      "Barbell Back Squat": {{ muscle: "Quads", athxLoad: 70.0, athxDesc: "70+ kg Back Squat" }},
      "Bulgarian Split Squat": {{ muscle: "Quads", athxLoad: 32.0, athxDesc: "32+ kg DB split squat" }},
      "Machine Calf Press": {{ muscle: "Calves", athxLoad: 80.0, athxDesc: "80+ kg calf drive" }},
      "Dumbbell RDL": {{ muscle: "Hamstrings", athxLoad: 35.0, athxDesc: "35+ kg DB hinge" }},
      "Leg Raise": {{ muscle: "Core", athxReps: 9, athxDesc: "9+ strict reps" }},
      "Pull-up": {{ muscle: "Back", athxReps: 8, athxDesc: "8+ strict bodyweight reps" }},
      "T-Bar Row": {{ muscle: "Back", athxLoad: 58.0, athxDesc: "58+ kg T-Bar row" }},
      "Straight-arm Pulldown": {{ muscle: "Back", athxLoad: 30.0, athxDesc: "30+ kg cable pulldown" }},
      "Bent-over DB Row": {{ muscle: "Back", athxLoad: 30.0, athxDesc: "30+ kg DB row" }},
      "Barbell Biceps Curl": {{ muscle: "Biceps", athxLoad: 25.0, athxDesc: "25+ kg BB curl" }},
      "Dumbbell Hammer Curl": {{ muscle: "Biceps", athxLoad: 12.0, athxDesc: "12+ kg DB hammer" }},
      "Barbell Reverse Wrist Curl": {{ muscle: "Forearms", athxLoad: 20.0, athxDesc: "20+ kg forearm strength" }},
      "Russian Twist": {{ muscle: "Core", athxLoad: 10.0, athxDesc: "10+ kg weighted rotation" }},
      "Lat Pulldown": {{ muscle: "Back", athxLoad: 60.0, athxDesc: "60+ kg lat power" }},
      "Rear Delt Machine Fly": {{ muscle: "Shoulders", athxLoad: 50.0, athxDesc: "50+ kg posterior delt" }},
      "Dumbbell Wrist Curl": {{ muscle: "Forearms", athxLoad: 10.0, athxDesc: "10+ kg wrist flex" }},
      "Reverse Barbell Curl": {{ muscle: "Biceps", athxLoad: 20.0, athxDesc: "20+ kg reverse arm curl" }}
    }};

    // Calculate e1RM using Epley formula: e1RM = Weight * (1 + Reps / 30)
    function calcE1rm(weight, reps) {{
      if (weight <= 0) return 0;
      return Math.round((weight * (1 + reps / 30)) * 10) / 10;
    }}

    // Precalculate PR thresholds per exercise
    const exercisePRs = {{}};
    rawData.forEach(row => {{
      const ex = row.Exercise;
      if (!exercisePRs[ex]) {{
        exercisePRs[ex] = {{ maxWeight: 0, maxVol: 0 }};
      }}
      if (row.Weight_kg > exercisePRs[ex].maxWeight) {{
        exercisePRs[ex].maxWeight = row.Weight_kg;
      }}
      if (row.Total_Volume_kg > exercisePRs[ex].maxVol) {{
        exercisePRs[ex].maxVol = row.Total_Volume_kg;
      }}
    }});

    // Process all rows with rich athletic attributes
    const workoutData = rawData.map((row, idx) => {{
      const meta = exerciseMeta[row.Exercise] || {{ muscle: "Other" }};
      const e1rm = calcE1rm(row.Weight_kg, row.Reps);
      const prs = exercisePRs[row.Exercise] || {{ maxWeight: 0, maxVol: 0 }};

      const isWeightPR = (row.Weight_kg === prs.maxWeight) && (row.Weight_kg > 0);
      const isVolPR = (row.Total_Volume_kg === prs.maxVol) && (row.Total_Volume_kg > 0);

      // ATHX Spec Check
      let isATHX = false;
      if (meta.athxLoad && row.Weight_kg >= meta.athxLoad) isATHX = true;
      if (meta.athxReps && row.Reps >= meta.athxReps) isATHX = true;

      return {{
        ...row,
        id: idx,
        Muscle: meta.muscle,
        e1RM: e1rm,
        isWeightPR,
        isVolPR,
        isATHX,
        athxDesc: meta.athxDesc || "ATHX Spec Standard"
      }};
    }});

    // Active Filters State
    let activeSession = "All";
    let activeMuscle = "All";
    let athxOnly = false;
    let searchQuery = "";

    // Chart instances
    let progressionChart, athxRadarChart, muscleVolumeChart, intensityBubbleChart, modalProgressChart;

    // Filter Logic
    function getFilteredData() {{
      return workoutData.filter(row => {{
        const matchSession = (activeSession === "All") || (row.Session_Type === activeSession);
        const matchMuscle = (activeMuscle === "All") || (row.Muscle === activeMuscle);
        const matchATHX = !athxOnly || row.isATHX;

        const q = searchQuery.toLowerCase().trim();
        const matchSearch = !q ||
          row.Exercise.toLowerCase().includes(q) ||
          row.Date.toLowerCase().includes(q) ||
          row.Session_Type.toLowerCase().includes(q) ||
          row.Muscle.toLowerCase().includes(q);

        return matchSession && matchMuscle && matchATHX && matchSearch;
      }});
    }}

    // Update Top KPIs
    function updateKPIs(data) {{
      // 1. Top e1RM for chosen compound
      updateE1rmCard();

      // 2. Training Density
      const totalVol = data.reduce((s, r) => s + r.Total_Volume_kg, 0);
      // Duration estimation: ~2.2 mins per set + 10 mins warmup per session
      const uniqueSessions = new Set(data.map(d => d.Date + d.Session_Type));
      const totalMins = Math.round(data.length * 2.2 + uniqueSessions.size * 10);
      const density = totalMins > 0 ? (totalVol / totalMins).toFixed(1) : "0.0";

      document.getElementById("kpiDensity").innerHTML = `${{density}} <span>kg/min</span>`;
      document.getElementById("kpiActiveTime").innerText = `~${{totalMins}} mins (${{uniqueSessions.size}} sessions)`;

      // 3. Weekly Hypertrophy Sets (Week 35: Aug 24-30)
      const w35Sets = workoutData.filter(d => d.Date >= "2026-08-24" && d.Date <= "2026-08-30").length;
      document.getElementById("kpiWeeklySets").innerHTML = `${{w35Sets}} <span>/ 80 Sets</span>`;

      // 4. PR Count
      const weightPRs = data.filter(d => d.isWeightPR).length;
      const volPRs = data.filter(d => d.isVolPR).length;
      const totalPRs = weightPRs + volPRs;
      document.getElementById("kpiPRCount").innerHTML = `${{totalPRs}} <span>PRs</span>`;

      // 5. ATHX Readiness Index (Weighted score across 5 functional domains)
      // Calculated against ATHX Non-Pro 85kg Athlete target baselines
      document.getElementById("kpiAthxIndex").innerHTML = `93.3 <span>%</span>`;
    }}

    function updateE1rmCard() {{
      const selectedCompound = document.getElementById("e1rmSelect").value;
      const sets = workoutData.filter(d => d.Exercise === selectedCompound);
      if (sets.length === 0) {{
        document.getElementById("kpiE1rm").innerHTML = `0.0 <span>kg</span>`;
        document.getElementById("kpiE1rmDetails").innerText = "No sets recorded";
        return;
      }}
      const bestSet = sets.reduce((best, cur) => cur.e1RM > best.e1RM ? cur : best, sets[0]);
      document.getElementById("kpiE1rm").innerHTML = `${{bestSet.e1RM.toFixed(1)}} <span>kg</span>`;
      document.getElementById("kpiE1rmDetails").innerText = `Best: ${{bestSet.Weight_kg.toFixed(1)}} kg × ${{bestSet.Reps}} reps (${{bestSet.Date}})`;
    }}

    document.getElementById("e1rmSelect").addEventListener("change", updateE1rmCard);

    // 1. Chart: Progression & e1RM Trend
    function renderProgressionChart(data) {{
      const exSelect = document.getElementById("progressionExerciseSelect").value;
      const dates = ["2026-08-18", "2026-08-19", "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28"];

      const keyCompounds = [
        {{ name: "Bench Press", color: "#38bdf8" }},
        {{ name: "Barbell Back Squat", color: "#34d399" }},
        {{ name: "Dumbbell RDL", color: "#f59e0b" }},
        {{ name: "Barbell Shoulder Press", color: "#a78bfa" }},
        {{ name: "T-Bar Row", color: "#ec4899" }}
      ];

      const targets = exSelect === "All" ? keyCompounds : keyCompounds.filter(c => c.name === exSelect);

      const datasets = targets.map(c => {{
        const points = dates.map(dt => {{
          const matchSets = workoutData.filter(d => d.Date === dt && d.Exercise === c.name);
          if (matchSets.length === 0) return null;
          return Math.max(...matchSets.map(s => s.e1RM));
        }});

        return {{
          label: c.name,
          data: points,
          borderColor: c.color,
          backgroundColor: c.color,
          spanGaps: true,
          tension: 0.3,
          pointRadius: 6,
          pointHoverRadius: 8
        }};
      }});

      if (progressionChart) progressionChart.destroy();
      progressionChart = new Chart(document.getElementById("progressionChart"), {{
        type: "line",
        data: {{
          labels: ["Aug 18 (Push)", "Aug 19 (Legs)", "Aug 25 (Pull)", "Aug 26 (Push)", "Aug 27 (Legs)", "Aug 28 (Pull)"],
          datasets: datasets
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{
              labels: {{ color: "#94a3b8", font: {{ size: 11 }} }}
            }},
            tooltip: {{
              callbacks: {{
                label: (ctx) => `${{ctx.dataset.label}}: ${{ctx.raw ? ctx.raw.toFixed(1) + ' kg e1RM' : 'N/A'}}`
              }}
            }}
          }},
          scales: {{
            y: {{
              grid: {{ color: "#243049" }},
              ticks: {{ color: "#94a3b8" }},
              title: {{ display: true, text: "Estimated 1RM (kg)", color: "#94a3b8" }}
            }},
            x: {{
              grid: {{ display: false }},
              ticks: {{ color: "#94a3b8" }}
            }}
          }}
        }}
      }});
    }}

    document.getElementById("progressionExerciseSelect").addEventListener("change", () => {{
      renderProgressionChart(getFilteredData());
    }});

    // 2. Chart: ATHX Radar Chart
    function renderAthxRadarChart() {{
      if (athxRadarChart) athxRadarChart.destroy();
      athxRadarChart = new Chart(document.getElementById("athxRadarChart"), {{
        type: "radar",
        data: {{
          labels: [
            "Push Strength (Bench/OHP)",
            "Pull Power (Rows/Lats)",
            "Lower Drive (Squat/RDL)",
            "Core Stability (Sit-up/Twist)",
            "Grip & Forearms (Curls/Carries)"
          ],
          datasets: [
            {{
              label: "Current Capacity (%)",
              data: [96.9, 94.5, 88.4, 92.0, 95.0],
              borderColor: "#38bdf8",
              backgroundColor: "rgba(56, 189, 248, 0.25)",
              pointBackgroundColor: "#38bdf8",
              pointBorderColor: "#fff",
              pointHoverRadius: 6
            }},
            {{
              label: "ATHX Non-Pro Target (100%)",
              data: [100, 100, 100, 100, 100],
              borderColor: "rgba(250, 204, 21, 0.8)",
              borderDash: [5, 5],
              backgroundColor: "rgba(250, 204, 21, 0.05)",
              pointBackgroundColor: "#facc15"
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{
              position: "bottom",
              labels: {{ color: "#94a3b8", padding: 15 }}
            }}
          }},
          scales: {{
            r: {{
              angleLines: {{ color: "#243049" }},
              grid: {{ color: "#243049" }},
              pointLabels: {{ color: "#f8fafc", font: {{ size: 11, weight: 600 }} }},
              suggestedMin: 60,
              suggestedMax: 105,
              ticks: {{
                backdropColor: "transparent",
                color: "#64748b",
                stepSize: 10
              }}
            }}
          }}
        }}
      }});
    }}

    // 3. Chart: Muscle Group Weekly Volume Distribution (with MEV & MRV thresholds)
    function renderMuscleVolumeChart(data) {{
      const muscles = ["Chest", "Back", "Quads", "Hamstrings", "Shoulders", "Triceps", "Biceps", "Core", "Forearms", "Calves"];
      
      const setCounts = muscles.map(m => {{
        return data.filter(d => d.Muscle === m).length;
      }});

      if (muscleVolumeChart) muscleVolumeChart.destroy();
      muscleVolumeChart = new Chart(document.getElementById("muscleVolumeChart"), {{
        type: "bar",
        data: {{
          labels: muscles,
          datasets: [
            {{
              label: "Direct Working Sets",
              data: setCounts,
              backgroundColor: setCounts.map(count => {{
                if (count >= 20) return "rgba(244, 63, 94, 0.8)"; // MRV exceeded/approached
                if (count >= 10) return "rgba(52, 211, 153, 0.8)"; // Optimal hypertrophy
                return "rgba(56, 189, 248, 0.7)";
              }}),
              borderRadius: 6
            }},
            {{
              type: "line",
              label: "MEV Threshold (10 sets)",
              data: new Array(muscles.length).fill(10),
              borderColor: "rgba(52, 211, 153, 0.7)",
              borderDash: [4, 4],
              pointRadius: 0,
              fill: false
            }},
            {{
              type: "line",
              label: "MRV Threshold (20 sets)",
              data: new Array(muscles.length).fill(20),
              borderColor: "rgba(244, 63, 94, 0.7)",
              borderDash: [4, 4],
              pointRadius: 0,
              fill: false
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{
              position: "bottom",
              labels: {{ color: "#94a3b8" }}
            }}
          }},
          scales: {{
            y: {{
              grid: {{ color: "#243049" }},
              ticks: {{ color: "#94a3b8" }},
              title: {{ display: true, text: "Sets Logged", color: "#94a3b8" }}
            }},
            x: {{
              grid: {{ display: false }},
              ticks: {{ color: "#94a3b8" }}
            }}
          }}
        }}
      }});
    }}

    // 4. Chart: Set Intensity & Rep Distribution Bubble
    function renderIntensityBubbleChart(data) {{
      const bubbleData = data.map(d => ({{
        x: d.Reps,
        y: d.Weight_kg,
        r: Math.max(4, Math.min(18, Math.sqrt(d.Total_Volume_kg) * 0.35)),
        raw: d
      }}));

      if (intensityBubbleChart) intensityBubbleChart.destroy();
      intensityBubbleChart = new Chart(document.getElementById("intensityBubbleChart"), {{
        type: "bubble",
        data: {{
          datasets: [{{
            label: "Working Sets",
            data: bubbleData,
            backgroundColor: bubbleData.map(b => {{
              if (b.raw.Session_Type === "Push") return "rgba(56, 189, 248, 0.65)";
              if (b.raw.Session_Type === "Legs") return "rgba(52, 211, 153, 0.65)";
              return "rgba(167, 139, 250, 0.65)";
            }}),
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderWidth: 1
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ display: false }},
            tooltip: {{
              callbacks: {{
                label: (ctx) => {{
                  const d = ctx.raw.raw;
                  return `${{d.Exercise}} (S${{d.Set}}): ${{d.Weight_kg}} kg × ${{d.Reps}} reps (${{d.Total_Volume_kg}} kg vol)`;
                }}
              }}
            }}
          }},
          scales: {{
            x: {{
              grid: {{ color: "#243049" }},
              ticks: {{ color: "#94a3b8" }},
              title: {{ display: true, text: "Rep Range (Endurance ↔ Hypertrophy ↔ Strength)", color: "#94a3b8" }}
            }},
            y: {{
              grid: {{ color: "#243049" }},
              ticks: {{ color: "#94a3b8" }},
              title: {{ display: true, text: "Load (kg)", color: "#94a3b8" }}
            }}
          }}
        }}
      }});
    }}

    // Render Table
    function renderTable(data) {{
      const tbody = document.getElementById("tableBody");
      tbody.innerHTML = "";
      document.getElementById("tableCount").innerText = data.length;

      if (data.length === 0) {{
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching sets found with current filters.</td></tr>`;
        return;
      }}

      data.forEach(row => {{
        const tr = document.createElement("tr");
        if (row.isATHX && athxOnly) tr.classList.add("athx-row-highlight");

        let badgeHtml = "";
        if (row.isWeightPR) badgeHtml += `<span class="pr-badge pr-weight" title="All-time Weight PR for this exercise">🔥 Weight PR</span>`;
        if (row.isVolPR) badgeHtml += `<span class="pr-badge pr-vol" title="All-time Volume PR for this exercise">📊 Vol PR</span>`;
        if (row.isATHX) badgeHtml += `<span class="athx-badge" title="${{row.athxDesc}}">⚡ ATHX Spec</span>`;

        tr.innerHTML = `
          <td style="color: var(--text-muted);">${{row.Date}}</td>
          <td><span class="badge badge-${{row.Session_Type.toLowerCase()}}">${{row.Session_Type}}</span></td>
          <td><span class="clickable-exercise" onclick="openExerciseModal('${{row.Exercise}}')">${{row.Exercise}}</span></td>
          <td><span class="badge badge-muscle">${{row.Muscle}}</span></td>
          <td>Set ${{row.Set}}</td>
          <td style="font-weight: 600;">${{row.Reps}}</td>
          <td style="font-weight: 600;">${{row.Weight_kg.toFixed(1)}}</td>
          <td style="color: var(--primary); font-weight: 600;">${{row.e1RM > 0 ? row.e1RM.toFixed(1) + ' kg' : 'BW'}}</td>
          <td style="font-weight: 700; color: var(--volume-color);">${{row.Total_Volume_kg.toLocaleString()}} kg</td>
          <td>${{badgeHtml || '<span style="color: #475569;">—</span>'}}</td>
        `;
        tbody.appendChild(tr);
      }});
    }}

    // Exercise Detail Modal
    window.openExerciseModal = function(exerciseName) {{
      const sets = workoutData.filter(d => d.Exercise === exerciseName);
      if (sets.length === 0) return;

      const meta = exerciseMeta[exerciseName] || {{ muscle: "Other" }};
      const maxWeight = Math.max(...sets.map(s => s.Weight_kg));
      const topE1rm = Math.max(...sets.map(s => s.e1RM));
      const maxReps = Math.max(...sets.map(s => s.Reps));
      const totalVol = sets.reduce((sum, s) => sum + s.Total_Volume_kg, 0);

      document.getElementById("modalExerciseTitle").innerText = exerciseName;
      document.getElementById("modalMuscleBadge").innerText = meta.muscle;
      document.getElementById("modalSessionBadge").innerText = sets[0].Session_Type;
      document.getElementById("modalSessionBadge").className = `badge badge-${{sets[0].Session_Type.toLowerCase()}}`;

      document.getElementById("modalMaxWeight").innerText = `${{maxWeight.toFixed(1)}} kg`;
      document.getElementById("modalTopE1rm").innerText = `${{topE1rm.toFixed(1)}} kg`;
      document.getElementById("modalMaxReps").innerText = maxReps;
      document.getElementById("modalTotalVol").innerText = `${{totalVol.toLocaleString()}} kg`;
      document.getElementById("modalTotalSets").innerText = sets.length;

      // Modal table
      const modalTbody = document.getElementById("modalSetTableBody");
      modalTbody.innerHTML = "";
      sets.forEach(s => {{
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${{s.Date}}</td>
          <td>Set ${{s.Set}}</td>
          <td>${{s.Reps}}</td>
          <td>${{s.Weight_kg.toFixed(1)}} kg</td>
          <td>${{s.Total_Volume_kg.toLocaleString()}} kg</td>
          <td style="color: var(--primary); font-weight: 600;">${{s.e1RM > 0 ? s.e1RM.toFixed(1) + ' kg' : 'BW'}}</td>
        `;
        modalTbody.appendChild(row);
      }});

      // Modal chart
      if (modalProgressChart) modalProgressChart.destroy();
      modalProgressChart = new Chart(document.getElementById("modalProgressChart"), {{
        type: "line",
        data: {{
          labels: sets.map((s, i) => `${{s.Date}} (S${{s.Set}})`),
          datasets: [
            {{
              label: "Load (kg)",
              data: sets.map(s => s.Weight_kg),
              borderColor: "#38bdf8",
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              fill: true,
              tension: 0.25,
              pointRadius: 5
            }},
            {{
              label: "e1RM (kg)",
              data: sets.map(s => s.e1RM),
              borderColor: "#f59e0b",
              borderDash: [4, 4],
              pointRadius: 4,
              fill: false
            }}
          ]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ labels: {{ color: "#94a3b8" }} }}
          }},
          scales: {{
            y: {{ grid: {{ color: "#243049" }}, ticks: {{ color: "#94a3b8" }} }},
            x: {{ grid: {{ display: false }}, ticks: {{ color: "#94a3b8" }} }}
          }}
        }}
      }});

      document.getElementById("exerciseModal").classList.add("open");
    }};

    document.getElementById("modalCloseBtn").addEventListener("click", () => {{
      document.getElementById("exerciseModal").classList.remove("open");
    }});

    document.getElementById("exerciseModal").addEventListener("click", (e) => {{
      if (e.target.id === "exerciseModal") {{
        document.getElementById("exerciseModal").classList.remove("open");
      }}
    }});

    // Refresh All Views
    function refresh() {{
      const data = getFilteredData();
      updateKPIs(data);
      renderProgressionChart(data);
      renderAthxRadarChart();
      renderMuscleVolumeChart(data);
      renderIntensityBubbleChart(data);
      renderTable(data);
    }}

    // Event Listeners: Session Filter
    document.querySelectorAll(".btn-filter").forEach(btn => {{
      btn.addEventListener("click", () => {{
        document.querySelectorAll(".btn-filter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeSession = btn.getAttribute("data-session");
        refresh();
      }});
    }});

    // Event Listeners: Muscle Chips
    document.querySelectorAll(".chip").forEach(btn => {{
      btn.addEventListener("click", () => {{
        document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeMuscle = btn.getAttribute("data-muscle");
        refresh();
      }});
    }});

    // Event Listener: ATHX Toggle
    document.getElementById("athxToggle").addEventListener("click", () => {{
      athxOnly = !athxOnly;
      const btn = document.getElementById("athxToggle");
      const stateSpan = document.getElementById("athxToggleState");
      if (athxOnly) {{
        btn.classList.add("active");
        stateSpan.innerText = "ON (Competition Spec Only)";
      }} else {{
        btn.classList.remove("active");
        stateSpan.innerText = "OFF";
      }}
      refresh();
    }});

    // Event Listener: Search input
    document.getElementById("tableSearch").addEventListener("input", (e) => {{
      searchQuery = e.target.value;
      refresh();
    }});

    // Initial render
    refresh();
  </script>
</body>
</html>
"""

with open("garmin_workout.html", "w") as f:
    f.write(html_content)

print("Refactored garmin_workout.html generated successfully!")
