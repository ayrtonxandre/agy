import json

with open("garmin_workout_volume.json") as f:
    records = json.load(f)

json_data = json.dumps(records, indent=2)

html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Garmin Workout Volume Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {{
      --bg: #0b0f19;
      --card-bg: #151d2f;
      --card-border: #243049;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --push-color: #38bdf8;
      --legs-color: #34d399;
      --pull-color: #a78bfa;
      --table-hover: #1e293b;
      --volume-color: #10b981;
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
      padding: 2rem 1.5rem;
      min-height: 100vh;
    }}

    .container {{
      max-width: 1200px;
      margin: 0 auto;
    }}

    header {{
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }}

    .title-group h1 {{
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }}

    .title-group p {{
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 0.35rem;
    }}

    .badge-garmin {{
      background: rgba(56, 189, 248, 0.12);
      color: var(--primary);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }}

    /* Stat Cards */
    .stats-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }}

    .stat-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }}

    .stat-card:hover {{
      border-color: #3b82f6;
      transform: translateY(-2px);
    }}

    .stat-label {{
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .stat-value {{
      font-size: 2rem;
      font-weight: 800;
      margin-top: 0.4rem;
      color: var(--text-main);
    }}

    .stat-value span {{
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--text-muted);
    }}

    /* Filters Bar */
    .controls-card {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }}

    .filter-buttons {{
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }}

    .filter-btn {{
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }}

    .filter-btn:hover {{
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
    }}

    .filter-btn.active {{
      background: var(--primary);
      color: #0b0f19;
      border-color: var(--primary);
    }}

    .search-box {{
      position: relative;
      min-width: 250px;
    }}

    .search-box input {{
      width: 100%;
      background: #0f172a;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 0.5rem 1rem;
      color: var(--text-main);
      font-size: 0.9rem;
      outline: none;
    }}

    .search-box input:focus {{
      border-color: var(--primary);
    }}

    /* Charts Layout */
    .charts-grid {{
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }}

    @media (max-width: 900px) {{
      .charts-grid {{
        grid-template-columns: 1fr;
      }}
    }}

    .card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.5rem;
    }}

    .card h2 {{
      font-size: 1.15rem;
      margin-bottom: 1.25rem;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    .chart-container {{
      position: relative;
      height: 280px;
      width: 100%;
    }}

    /* Badges */
    .session-badge {{
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .session-Push {{ background: rgba(56, 189, 248, 0.15); color: var(--push-color); border: 1px solid rgba(56, 189, 248, 0.3); }}
    .session-Legs {{ background: rgba(52, 211, 153, 0.15); color: var(--legs-color); border: 1px solid rgba(52, 211, 153, 0.3); }}
    .session-Pull {{ background: rgba(167, 139, 250, 0.15); color: var(--pull-color); border: 1px solid rgba(167, 139, 250, 0.3); }}

    /* Table */
    .table-responsive {{
      overflow-x: auto;
      max-height: 520px;
      overflow-y: auto;
      border-radius: 8px;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.92rem;
    }}

    th {{
      position: sticky;
      top: 0;
      background-color: #111827;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      padding: 0.85rem 1rem;
      border-bottom: 2px solid var(--card-border);
      z-index: 2;
    }}

    td {{
      padding: 0.8rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }}

    tbody tr:hover {{
      background-color: var(--table-hover);
    }}

    .volume-col {{
      font-weight: 700;
      color: var(--volume-color);
      font-feature-settings: "tnum";
    }}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-group">
        <h1>📊 Garmin Workout Volume</h1>
        <p>Comprehensive tracking of exercises, sets, reps, and cumulative volume</p>
      </div>
      <span class="badge-garmin">Garmin Connect</span>
    </header>

    <!-- Key Metrics -->
    <section class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Volume</div>
        <div class="stat-value" id="statVolume">0 <span>kg</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Sets</div>
        <div class="stat-value" id="statSets">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Reps</div>
        <div class="stat-value" id="statReps">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sessions</div>
        <div class="stat-value" id="statSessions">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Exercises</div>
        <div class="stat-value" id="statExercises">0</div>
      </div>
    </section>

    <!-- Controls / Filters -->
    <div class="controls-card">
      <div class="filter-buttons" id="sessionFilters">
        <button class="filter-btn active" data-type="All">All Sessions</button>
        <button class="filter-btn" data-type="Push">Push</button>
        <button class="filter-btn" data-type="Legs">Legs</button>
        <button class="filter-btn" data-type="Pull">Pull</button>
      </div>
      <div class="search-box">
        <input type="text" id="exerciseSearch" placeholder="🔍 Search exercise, date...">
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <div class="card">
        <h2>Volume by Workout Session (kg)</h2>
        <div class="chart-container">
          <canvas id="timelineChart"></canvas>
        </div>
      </div>
      <div class="card">
        <h2>Volume Split by Split</h2>
        <div class="chart-container">
          <canvas id="splitDoughnutChart"></canvas>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 2rem;">
      <h2>Top Exercises by Total Volume (kg)</h2>
      <div class="chart-container" style="height: 320px;">
        <canvas id="topExercisesChart"></canvas>
      </div>
    </div>

    <!-- Detailed Table -->
    <section class="card">
      <h2>
        <span>Workout Log (<span id="rowCount">0</span> sets)</span>
      </h2>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Session</th>
              <th>Exercise</th>
              <th>Set</th>
              <th>Reps</th>
              <th>Weight</th>
              <th>Total Volume</th>
            </tr>
          </thead>
          <tbody id="tableBody">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <script>
    const workoutData = {json_data};

    let activeSession = "All";
    let searchQuery = "";

    let timelineChart, splitChart, topExercisesChart;

    function getFilteredData() {{
      return workoutData.filter(row => {{
        const matchesSession = (activeSession === "All") || (row.Session_Type === activeSession);
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || 
          row.Exercise.toLowerCase().includes(q) || 
          row.Date.toLowerCase().includes(q) ||
          row.Session_Type.toLowerCase().includes(q);
        return matchesSession && matchesSearch;
      }});
    }}

    function updateStats(data) {{
      const totalVol = data.reduce((sum, d) => sum + d.Total_Volume_kg, 0);
      const totalReps = data.reduce((sum, d) => sum + d.Reps, 0);
      const uniqueDates = new Set(data.map(d => d.Date + d.Session_Type)).size;
      const uniqueExercises = new Set(data.map(d => d.Exercise)).size;

      document.getElementById("statVolume").innerHTML = `${{totalVol.toLocaleString(undefined, {{maximumFractionDigits: 1}})}} <span>kg</span>`;
      document.getElementById("statSets").innerText = data.length;
      document.getElementById("statReps").innerText = totalReps.toLocaleString();
      document.getElementById("statSessions").innerText = uniqueDates;
      document.getElementById("statExercises").innerText = uniqueExercises;
      document.getElementById("rowCount").innerText = data.length;
    }}

    function renderTable(data) {{
      const tbody = document.getElementById("tableBody");
      tbody.innerHTML = "";

      if (data.length === 0) {{
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching sets found.</td></tr>`;
        return;
      }}

      data.forEach(row => {{
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="color: var(--text-muted);">${{row.Date}}</td>
          <td><span class="session-badge session-${{row.Session_Type}}">${{row.Session_Type}}</span></td>
          <td style="font-weight: 600;">${{row.Exercise}}</td>
          <td>Set ${{row.Set}}</td>
          <td>${{row.Reps}}</td>
          <td>${{row.Weight_kg.toFixed(1)}} kg</td>
          <td class="volume-col">${{row.Total_Volume_kg.toLocaleString()}} kg</td>
        `;
        tbody.appendChild(tr);
      }});
    }}

    function renderCharts(data) {{
      // 1. Session Volume by Date
      const sessionMap = {{}};
      data.forEach(d => {{
        const key = `${{d.Date}} (${{d.Session_Type}})`;
        sessionMap[key] = (sessionMap[key] || 0) + d.Total_Volume_kg;
      }});
      const sessionLabels = Object.keys(sessionMap);
      const sessionVolumes = Object.values(sessionMap);

      if (timelineChart) timelineChart.destroy();
      timelineChart = new Chart(document.getElementById("timelineChart"), {{
        type: "bar",
        data: {{
          labels: sessionLabels,
          datasets: [{{
            label: "Volume (kg)",
            data: sessionVolumes,
            backgroundColor: sessionLabels.map(l => {{
              if (l.includes("Push")) return "#38bdf8";
              if (l.includes("Legs")) return "#34d399";
              return "#a78bfa";
            }}),
            borderRadius: 8
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ display: false }}
          }},
          scales: {{
            y: {{ grid: {{ color: "#243049" }}, ticks: {{ color: "#94a3b8" }} }},
            x: {{ grid: {{ display: false }}, ticks: {{ color: "#94a3b8" }} }}
          }}
        }}
      }});

      // 2. Doughnut by Split
      const splitTotals = {{ "Push": 0, "Legs": 0, "Pull": 0 }};
      data.forEach(d => {{
        if (splitTotals[d.Session_Type] !== undefined) {{
          splitTotals[d.Session_Type] += d.Total_Volume_kg;
        }}
      }});

      if (splitChart) splitChart.destroy();
      splitChart = new Chart(document.getElementById("splitDoughnutChart"), {{
        type: "doughnut",
        data: {{
          labels: ["Push", "Legs", "Pull"],
          datasets: [{{
            data: [splitTotals["Push"], splitTotals["Legs"], splitTotals["Pull"]],
            backgroundColor: ["#38bdf8", "#34d399", "#a78bfa"],
            borderColor: "#151d2f",
            borderWidth: 3
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{
              position: "bottom",
              labels: {{ color: "#94a3b8", padding: 15 }}
            }}
          }}
        }}
      }});

      // 3. Top Exercises
      const exMap = {{}};
      data.forEach(d => {{
        exMap[d.Exercise] = (exMap[d.Exercise] || 0) + d.Total_Volume_kg;
      }});
      const sortedExercises = Object.entries(exMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      if (topExercisesChart) topExercisesChart.destroy();
      topExercisesChart = new Chart(document.getElementById("topExercisesChart"), {{
        type: "bar",
        indexAxis: 'y',
        data: {{
          labels: sortedExercises.map(e => e[0]),
          datasets: [{{
            label: "Total Volume (kg)",
            data: sortedExercises.map(e => e[1]),
            backgroundColor: "#38bdf8",
            borderRadius: 6
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ display: false }}
          }},
          scales: {{
            x: {{ grid: {{ color: "#243049" }}, ticks: {{ color: "#94a3b8" }} }},
            y: {{ grid: {{ display: false }}, ticks: {{ color: "#f8fafc", font: {{ weight: 600 }} }} }}
          }}
        }}
      }});
    }}

    function refresh() {{
      const data = getFilteredData();
      updateStats(data);
      renderTable(data);
      renderCharts(data);
    }}

    // Filter Buttons
    document.querySelectorAll(".filter-btn").forEach(btn => {{
      btn.addEventListener("click", () => {{
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeSession = btn.getAttribute("data-type");
        refresh();
      }});
    }});

    // Search Box
    document.getElementById("exerciseSearch").addEventListener("input", (e) => {{
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
    f.write(html_template)
print("garmin_workout.html generated successfully.")
