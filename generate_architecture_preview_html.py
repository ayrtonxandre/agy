#!/usr/bin/env python3
"""
Generate a standalone, high-aesthetic HTML visual preview of the ATHX Architecture Diagram.
Allows instant viewing in any web browser, alongside the native .drawio file.
"""

def generate_html_preview():
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATHX High-Performance Athlete Intelligence Platform • Architecture</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --card-border: #1f2937;
      --text-main: #f9fafb;
      --text-muted: #9ca3af;
      --accent-blue: #38bdf8;
      --accent-purple: #c084fc;
      --accent-emerald: #34d399;
      --accent-amber: #fbbf24;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f8fafc;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
      padding: 30px 24px 60px 24px;
      line-height: 1.5;
    }

    .container {
      max-width: 1740px;
      margin: 0 auto;
    }

    /* Top Banner */
    .banner {
      background: #0f172a;
      border-radius: 14px;
      padding: 24px 32px;
      color: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      border: 1px solid #1e293b;
    }

    .banner-text .pretitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #38bdf8;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .banner-text h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }

    .banner-text p {
      font-size: 13px;
      color: #94a3b8;
    }

    .banner-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .btn-primary {
      background: #0284c7;
      color: #ffffff;
      border: 1px solid #0369a1;
    }
    .btn-primary:hover { background: #0369a1; }

    .btn-secondary {
      background: #1e293b;
      color: #f8fafc;
      border: 1px solid #334155;
    }
    .btn-secondary:hover { background: #334155; }

    /* Columns Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 24px;
    }

    .column {
      background: #ffffff;
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-width: 2px;
      border-style: solid;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .col-step1 { background: #f0f9ff; border-color: #38bdf8; }
    .col-step2 { background: #faf5ff; border-color: #c084fc; }
    .col-step3 { background: #f0fdf4; border-color: #4ade80; }
    .col-step4 { background: #fffbeb; border-color: #fbbf24; }

    .col-header {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .step-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      padding: 3px 8px;
      border-radius: 5px;
      margin-bottom: 6px;
      color: #ffffff;
    }

    .badge-step1 { background: #0284c7; }
    .badge-step2 { background: #9333ea; }
    .badge-step3 { background: #059669; }
    .badge-step4 { background: #d97706; }

    .col-header h2 {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    .col-header p {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    /* Cards */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      position: relative;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.08);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .card-title {
      font-size: 14.5px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pill {
      font-size: 9.5px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pill-blue { background: #e0f2fe; color: #0284c7; }
    .pill-rose { background: #ffe4e6; color: #e11d48; }
    .pill-amber { background: #fef3c7; color: #d97706; }
    .pill-purple { background: #f3e8ff; color: #7e22ce; }
    .pill-emerald { background: #d1fae5; color: #047857; }

    .card-subtitle {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 8px;
    }

    .card-bullets {
      font-size: 11.5px;
      color: #334155;
      line-height: 1.55;
      list-style: none;
    }

    .card-bullets li {
      position: relative;
      padding-left: 14px;
      margin-bottom: 4px;
    }

    .card-bullets li::before {
      content: "•";
      position: absolute;
      left: 2px;
      color: #94a3b8;
      font-weight: bold;
    }

    .card-highlight {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    /* Footer status strip */
    .status-strip {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .status-item {
      text-align: center;
      flex: 1;
    }

    .status-item .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .status-item .val {
      font-size: 17px;
      font-weight: 800;
    }

    .val-emerald { color: #059669; }
    .val-blue { color: #0284c7; }
    .val-purple { color: #7c3aed; }
    .val-amber { color: #d97706; }

    .divider {
      width: 1px;
      height: 36px;
      background: #e2e8f0;
    }

    /* Responsive */
    @media (max-width: 1280px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
      .banner { flex-direction: column; align-items: flex-start; gap: 16px; }
      .status-strip { flex-direction: column; gap: 16px; }
      .divider { display: none; }
    }
  </style>
</head>
<body>

<div class="container">

  <!-- Header Banner -->
  <header class="banner">
    <div class="banner-text">
      <div class="pretitle">ATHX 2027 • Athlete Intelligence Platform</div>
      <h1>How Everyday Wearable Data Powers Elite Coaching Decisions</h1>
      <p>Non-Technical Executive Overview • Connecting Smart Wearables, Advanced Sports Science, and Interactive Web Hub</p>
    </div>
    <div class="banner-actions">
      <a href="athx_architecture.drawio" download class="btn btn-primary">
        <span>💾 Download .drawio File</span>
      </a>
      <a href="https://app.diagrams.net/" target="_blank" rel="noopener" class="btn btn-secondary">
        <span>🌐 Open Diagrams.net</span>
      </a>
    </div>
  </header>

  <!-- 4-Column Grid -->
  <main class="grid">

    <!-- Column 1: Wearables & Logs -->
    <section class="column col-step1">
      <div class="col-header">
        <span class="step-badge badge-step1">Step 1 • Inputs</span>
        <h2>Wearables &amp; Workout Logs</h2>
        <p>What the athlete wears &amp; logs daily</p>
      </div>

      <!-- 1.1 Garmin -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #0284c7;">⌚ Garmin Smartwatch</span>
          <span class="pill pill-blue">AUTOMATIC</span>
        </div>
        <div class="card-subtitle">High-Frequency Biometrics &amp; Lifting</div>
        <ul class="card-bullets">
          <li><b>Authentic Overnight HRV:</b> Millisecond vagal recovery from raw sensor</li>
          <li><b>GPS Running:</b> Exact splits, elevation, tempo &amp; VO2Max</li>
          <li><b>Strength Lifting:</b> 1,513 sets, exercises, reps &amp; weights</li>
          <li><b>Metabolic Burn:</b> 28,960 kcal tracked with live heart rate zones</li>
        </ul>
      </article>

      <!-- 1.2 Apple Health -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #e11d48;">📱 Apple Health &amp; Scales</span>
          <span class="pill pill-rose">DAILY SYNC</span>
        </div>
        <div class="card-subtitle">Lifestyle, Sleep Stages &amp; Body Weight</div>
        <ul class="card-bullets">
          <li><b>Sleep Architecture:</b> Deep, Core, REM &amp; awake time (7.0h avg)</li>
          <li><b>Body Weight Trajectory:</b> 79.7 kg live vs. 85.0 kg target</li>
          <li><b>Resting Heart Rate:</b> 56.8 bpm autonomic baseline</li>
          <li><b>Ambient Steps:</b> Daily active recovery walking volume</li>
        </ul>
      </article>

      <!-- 1.3 CrossFit WODs -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #d97706;">🏋️ CrossFit &amp; Gym Notes</span>
          <span class="pill pill-amber">STRUCTURED</span>
        </div>
        <div class="card-subtitle">Conditioning METCONs &amp; Training Details</div>
        <ul class="card-bullets">
          <li><b>METCON Formats:</b> AMRAP, For Time, EMOM, Chipper</li>
          <li><b>Movement Splits:</b> Ergs, thrusters, pull-ups, heavy carries</li>
          <li><b>Perceived Exertion (RPE):</b> Subjective fatigue context</li>
          <li><b>Coach Session Notes:</b> Focus cues &amp; scaling variations</li>
        </ul>
      </article>

      <!-- 1.4 Pipe Box -->
      <div class="card-highlight" style="background: #e0f2fe; border-color: #38bdf8;">
        <strong style="color: #0284c7; font-size: 13px;">⚡ Zero-Friction Sync Layer</strong>
        <p style="font-size: 11.5px; color: #475569; margin-top: 4px;">
          100% automated background extraction. Zero manual spreadsheets or human data entry errors.
        </p>
      </div>
    </section>

    <!-- Column 2: The ATHX Brain -->
    <section class="column col-step2">
      <div class="col-header">
        <span class="step-badge badge-step2">Step 2 • Intelligence</span>
        <h2>The ATHX Brain (Sports Science)</h2>
        <p>Physiological models &amp; AI reasoning</p>
      </div>

      <!-- 2.1 Recovery Model -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #9333ea;">🌙 Autonomic Recovery Model</span>
          <span class="pill pill-purple">PHYSIOLOGY</span>
        </div>
        <div class="card-subtitle">Plews &amp; Buchheit Vagal Model (Garmin HRV)</div>
        <ul class="card-bullets">
          <li><b>28-Day Baseline Corridor:</b> Personalized vagal normal band</li>
          <li><b>Smallest Worthwhile Change (SWC):</b> Spots true physiological strain</li>
          <li><b>7-Day Rolling Sleep Debt:</b> Deficit vs. 7.5h target</li>
          <li><b>Early Warning:</b> Detects central fatigue days before symptoms</li>
        </ul>
      </article>

      <!-- 2.2 Strength & Muscle -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #7c3aed;">💪 Strength &amp; Fatigue Engine</span>
          <span class="pill pill-purple">LOAD GUARD</span>
        </div>
        <div class="card-subtitle">Brzycki 1RM Modeling &amp; ACWR Sweet Spot</div>
        <ul class="card-bullets">
          <li><b>Estimated 1RM (e1RM):</b> Trailing curves for Squat, Bench, Deadlift</li>
          <li><b>Workload Ratio (ACWR = 0.84):</b> Optimal injury-safe sweet spot</li>
          <li><b>597.7 Audited Tons:</b> Intelligent missing rep imputation</li>
          <li><b>Targeted Muscle Attribution:</b> Maps lifts to anatomical groups</li>
        </ul>
      </article>

      <!-- 2.3 Conditioning & Durability -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #6366f1;">⚡ Conditioning &amp; Durability</span>
          <span class="pill pill-purple">ENDURANCE</span>
        </div>
        <div class="card-subtitle">Critical Speed &amp; METCON Work-Rate</div>
        <ul class="card-bullets">
          <li><b>Critical Speed (CS = 5:09/km):</b> Sustainable aerobic ceiling</li>
          <li><b>Anaerobic Tank (D' = 62.9m):</b> High-intensity sprint reserve</li>
          <li><b>CrossFit Durability Index (87.5%):</b> Pace retention across rounds</li>
          <li><b>Pacing Calibration:</b> Prevents early redlining in competition</li>
        </ul>
      </article>

      <!-- 2.4 AI Coach -->
      <div class="card-highlight" style="background: #f3e8ff; border-color: #a855f7; text-align: left; padding: 12px 14px;">
        <strong style="color: #581c87; font-size: 13px;">🤖 AI Performance Coach ("Why Engine")</strong>
        <p style="font-size: 11.5px; color: #4b5563; margin-top: 4px;">
          Audits recovery against planned volume to output clear advice:
          <span style="font-weight: 700; color: #059669;">Push Hard 🟢</span> |
          <span style="font-weight: 700; color: #d97706;">Maintain 🟡</span> |
          <span style="font-weight: 700; color: #dc2626;">Rest &amp; Deload 🔴</span>
        </p>
      </div>
    </section>

    <!-- Column 3: Unified Athlete Dashboard -->
    <section class="column col-step3">
      <div class="col-header">
        <span class="step-badge badge-step3">Step 3 • Visualization</span>
        <h2>Unified Athlete Dashboard</h2>
        <p>Interactive single-screen web command hub</p>
      </div>

      <!-- 3.1 "Today" Tab -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #059669;">🎯 "Today" Command Center</span>
          <span class="pill pill-emerald">DAILY BRIEF</span>
        </div>
        <div class="card-subtitle">Morning Readiness &amp; Coach Guidance</div>
        <ul class="card-bullets">
          <li><b>Composite Readiness Gauge:</b> 96.9% Optimal green badge</li>
          <li><b>Today's Prescribed Session:</b> Focus lifts, reps &amp; pace targets</li>
          <li><b>AI Coach Decision Feed:</b> Transparent physiological rationale</li>
          <li><b>Live Safety Checks:</b> Alerts if weekly workload spikes</li>
        </ul>
      </article>

      <!-- 3.2 Strength & Anatomy -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #10b981;">🧬 Strength &amp; Visual Anatomy</span>
          <span class="pill pill-emerald">AESTHETICS</span>
        </div>
        <div class="card-subtitle">Interactive 2D Body Map &amp; 1RM Curves</div>
        <ul class="card-bullets">
          <li><b>Interactive 2D Body Map:</b> Muscles glow per selected session</li>
          <li><b>Compound 1RM Curves:</b> Trailing progress for Bench, Squat, Deadlift</li>
          <li><b>Volume Balance:</b> Audits chest vs. back and quad vs. hamstring</li>
          <li><b>Tonnage Timeline:</b> Objective proof of progressive overload</li>
        </ul>
      </article>

      <!-- 3.3 Engine Tab -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #047857;">🏃 Engine &amp; Conditioning Hub</span>
          <span class="pill pill-emerald">PACING</span>
        </div>
        <div class="card-subtitle">Running Thresholds &amp; CrossFit Stamina</div>
        <ul class="card-bullets">
          <li><b>Critical Speed Zones:</b> Exact paces for intervals vs. threshold</li>
          <li><b>CrossFit Stamina Retention:</b> Pace preservation across WODs</li>
          <li><b>VO2Max Tracking:</b> 55.0 ml/kg/min aerobic fitness score</li>
          <li><b>Ergometer Benchmarks:</b> Row, Ski, and Bike power metrics</li>
        </ul>
      </article>

      <!-- 3.4 Recovery Tab -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #059669;">🛌 Recovery &amp; Sleep Monitor</span>
          <span class="pill pill-emerald">RESTORATION</span>
        </div>
        <div class="card-subtitle">Sleep Debt &amp; Autonomic HRV Corridor</div>
        <ul class="card-bullets">
          <li><b>7-Night Deficit Bars:</b> Nightly sleep shortfall vs. 7.5h baseline</li>
          <li><b>Garmin HRV Corridor:</b> 43–60ms safe zone vs. 76ms latest boost</li>
          <li><b>Sleep Stage Ratios:</b> Deep &amp; REM restoration tracking</li>
        </ul>
      </article>
    </section>

    <!-- Column 4: Real-World Impact -->
    <section class="column col-step4">
      <div class="col-header">
        <span class="step-badge badge-step4">Step 4 • Real-World Impact</span>
        <h2>Elite Outcomes &amp; Value</h2>
        <p>Measurable results for athlete &amp; coach</p>
      </div>

      <!-- 4.1 Injury Prevention -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #d97706;">🛡️ Injury Shield &amp; Durability</span>
          <span class="pill pill-amber">PREVENTION</span>
        </div>
        <div class="card-subtitle">Stops Overtraining Before Breakdown</div>
        <ul class="card-bullets">
          <li><b>Zero Spike Risk:</b> Automatically warns if training ramps too fast</li>
          <li><b>Structural Balance:</b> Catches neglected antagonist muscles</li>
          <li><b>Nervous System Protection:</b> Backs off when HRV dips steeply</li>
        </ul>
      </article>

      <!-- 4.2 Guaranteed Progression -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #b45309;">📈 Guaranteed Progression</span>
          <span class="pill pill-amber">PEAK PHYSIQUE</span>
        </div>
        <div class="card-subtitle">Data-Calibrated Progressive Overload</div>
        <ul class="card-bullets">
          <li><b>Precise Barbell Weights:</b> Calculated percentages, not guesses</li>
          <li><b>Aesthetic Targeting:</b> Direct visual proof of muscle development</li>
          <li><b>Endurance Pacing:</b> Race at threshold without burning out</li>
        </ul>
      </article>

      <!-- 4.3 Total Coaching Alignment -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #92400e;">🤝 Total Coaching Alignment</span>
          <span class="pill pill-amber">EFFORTLESS</span>
        </div>
        <div class="card-subtitle">One Link Replaces 4 Disconnected Apps</div>
        <ul class="card-bullets">
          <li><b>Single Shared Truth:</b> Athlete &amp; Coach see the identical numbers</li>
          <li><b>Saves 5+ Hours/Week:</b> No manual spreadsheet updating</li>
          <li><b>Instant Accessibility:</b> Opens on mobile, tablet, or browser</li>
        </ul>
      </article>

      <!-- 4.4 Road to ATHX 2027 -->
      <article class="card">
        <div class="card-top">
          <span class="card-title" style="color: #78350f;">🏆 Road to ATHX 2027 Ready</span>
          <span class="pill pill-amber">THE GOAL</span>
        </div>
        <div class="card-subtitle">31-Week Structured Competition Countdown</div>
        <ul class="card-bullets">
          <li><b>Target Date:</b> May 27, 2027 Hybrid Competition Peak</li>
          <li><b>Compound Capacity:</b> Peak strength + 5k aerobic speed</li>
          <li><b>Maximum Confidence:</b> Arrive on the start line in top form</li>
        </ul>
      </article>
    </section>

  </main>

  <!-- Bottom Live Metrics Strip -->
  <footer class="status-strip">
    <div class="status-item">
      <div class="label">Morning Readiness</div>
      <div class="val val-emerald">96.9% • Optimal</div>
    </div>
    <div class="divider"></div>
    <div class="status-item">
      <div class="label">Workload Ratio (ACWR)</div>
      <div class="val val-blue">0.84 • Sweet Spot</div>
    </div>
    <div class="divider"></div>
    <div class="status-item">
      <div class="label">Audited Volume</div>
      <div class="val val-purple">597.7 Tons • 1,513 Sets</div>
    </div>
    <div class="divider"></div>
    <div class="status-item">
      <div class="label">Garmin Overnight HRV</div>
      <div class="val val-emerald">76.0 ms • Restored Vagal Tone</div>
    </div>
    <div class="divider"></div>
    <div class="status-item">
      <div class="label">Road to ATHX 2027</div>
      <div class="val val-amber">31 Weeks Countdown</div>
    </div>
  </footer>

</div>

</body>
</html>
"""
    output_path = '/Users/ayrtonandre/Documents/work/AGY/athx_architecture_preview.html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"✅ Generated Architecture HTML Preview: {output_path} ({len(html_content)} bytes)")

if __name__ == '__main__':
    generate_html_preview()
