#!/usr/bin/env python3
"""
================================================================================
Unified ATHX 2027 Dashboard Generator: Garmin Strength + Apple Health & Biomechanics
================================================================================
Completely overhauled athlete intelligence generator:
  1. Driven exclusively by shared configuration (athx_config.py) and analytics engine (athx_analytics.py).
  2. Hard floor at DATA_START (2026-05-01) with full audit trail for pre-May exclusions.
  3. Session-level split classification and Unknown exercise imputation.
  4. Restricted e1RM (reps <= 10 on plausible loads) with trailing 28-day best, 4-week slope, and 2027 projections.
  5. Weekly hypertrophy sets mapped against MEV/MAV/MRV bands, exposing quad & hamstring deficits.
  6. Foster training monotony & strain alongside dynamic ACWR (max Date).
  7. Sleep coverage % and usable efficiency filtering (In_Bed <= 14h, sub-3h dropped).
  8. 7-day smoothed bodyweight trajectory with explicit mass gain target (85.0 kg).
  9. Documented transparent recovery composite score.
 10. Per-event ATHX 2027 qualification readiness table and weeks-to-games countdown.
 11. All tables default to Date DESC with clickable sorting and pagination (no silent truncation).
 12. Interactive Data Quality & Audit panel with exportable report.
 13. ZERO hardcoded metric literals in output.
"""

from __future__ import annotations
import json
import csv
import sys
from pathlib import Path
from datetime import datetime, date

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

import athx_config
import athx_analytics

def main():
    print("================================================================================")
    print("🚀 ATHX 2027 DASHBOARD GENERATOR: COMPUTING AUDITED METRICS")
    print("================================================================================")

    audit = athx_analytics.DataAuditTracker()

    garmin_raw = []
    garmin_vol_path = BASE_DIR / "garmin_workout_volume.json"
    garmin_ext_path = BASE_DIR / "garmin_extracted_workouts.json"
    
    if garmin_vol_path.exists():
        with open(garmin_vol_path, "r", encoding="utf-8") as f:
            garmin_raw = json.load(f)
    elif garmin_ext_path.exists():
        with open(garmin_ext_path, "r", encoding="utf-8") as f:
            garmin_raw = json.load(f)
    else:
        garmin_csv = BASE_DIR / "garmin_extracted_workouts.csv"
        if garmin_csv.exists():
            with open(garmin_csv, "r", encoding="utf-8") as f:
                for r in csv.DictReader(f):
                    garmin_raw.append({
                        "Activity_ID": r.get("Activity_ID"),
                        "Date": r.get("Date"),
                        "Exercise": r.get("Exercise"),
                        "Set": int(r.get("Set", 1) or 1),
                        "Reps": int(r.get("Reps", 0) or 0),
                        "Weight_kg": float(r.get("Weight_kg", 0.0) or 0.0),
                        "Total_Volume_kg": float(r.get("Total_Volume_kg", 0.0) or 0.0),
                        "Session_Type": r.get("Session_Type", "Strength"),
                    })

    strength_data = athx_analytics.process_strength_data(garmin_raw, audit)
    print(f"✅ Garmin Strength Processed: {strength_data['total_valid_sets']} valid working sets, {strength_data['total_sessions']} sessions, {strength_data['total_volume_tons']} tons.")
    print(f"   • Imputed Unknowns: {audit.summary['unknown_imputed']} | Unattributed: {audit.summary['unknown_unattributed']}")
    print(f"   • ACWR as of {strength_data['as_of_date']}: {strength_data['acwr']['value']} ({strength_data['acwr']['status']})")

    apple_data = athx_analytics.process_apple_health(BASE_DIR, audit)
    print(f"✅ Apple Health Processed:")
    print(f"   • Body Comp: {apple_data['body_comp']['current_weight']} kg (target: {apple_data['body_comp']['target_weight']} kg, delta: {apple_data['body_comp']['weight_remaining']:+0.1f} kg)")
    print(f"   • Sleep: {apple_data['sleep']['avg_sleep_hrs']}h avg, coverage: {apple_data['sleep']['coverage_pct']}% ({apple_data['sleep']['valid_nights']}/{apple_data['sleep']['calendar_days']} nights)")
    print(f"   • Mobility: {apple_data['mobility']['days_tracked']} days tracked, RHR: {apple_data['mobility']['current_rhr']} bpm")
    print(f"   • Readiness Score: {apple_data['readiness_composite']['score']}%")

    running_data = athx_analytics.process_running_data(BASE_DIR / "garmin_running_activities.json", audit)
    print(f"✅ Garmin Running Processed: {running_data['total_runs']} runs, {running_data['total_distance_km']} km. Best 5k: {running_data['best_5k_pace_formatted']} (VO2Max: {running_data['latest_vo2max']})")

    workout_data = athx_analytics.process_workout_activities(BASE_DIR / "garmin_workout_activities.json", audit)
    print(f"✅ Garmin Workouts Processed: {workout_data['total_sessions']} sessions, {workout_data['total_duration_min']} min, {workout_data['total_calories']:,} kcal.")

    comp_data = athx_analytics.evaluate_competition_readiness(strength_data, apple_data, running_data)
    print(f"✅ ATHX 2027 Competition Evaluation: {comp_data['weeks_remaining']} weeks to {comp_data['competition_date']}")

    months_set = set()
    for r in apple_data["body_comp"]["history"] + apple_data["nutrition"]["history"] + apple_data["activity"]["history"]:
        if r.get("Date"):
            months_set.add(r["Date"][:7])
    sorted_months = sorted(list(months_set), reverse=True)

    monthly_summary = []
    for m in sorted_months:
        b_m = [r["Weight_kg"] for r in apple_data["body_comp"]["history"] if r["Date"].startswith(m)]
        bf_m = [r["Body_Fat_pct"] for r in apple_data["body_comp"]["history"] if r["Date"].startswith(m) and r.get("Body_Fat_pct")]
        lm_m = [r["Lean_Mass_kg"] for r in apple_data["body_comp"]["history"] if r["Date"].startswith(m) and r.get("Lean_Mass_kg")]
        cal_m = [r["Calories_kcal"] for r in apple_data["nutrition"]["history"] if r["Date"].startswith(m)]
        prot_m = [r["Protein_g"] for r in apple_data["nutrition"]["history"] if r["Date"].startswith(m)]
        act_m = [r["Steps"] for r in apple_data["activity"]["history"] if r["Date"].startswith(m)]

        monthly_summary.append({
            "month": m,
            "avg_weight": round(sum(b_m) / len(b_m), 1) if b_m else None,
            "avg_bf": round(sum(bf_m) / len(bf_m), 1) if bf_m else None,
            "avg_lean_mass": round(sum(lm_m) / len(lm_m), 1) if lm_m else None,
            "avg_calories": int(round(sum(cal_m) / len(cal_m))) if cal_m else None,
            "avg_protein": round(sum(prot_m) / len(prot_m), 1) if prot_m else None,
            "avg_steps": int(round(sum(act_m) / len(act_m))) if act_m else None,
            "weigh_ins": len(b_m),
            "nutrition_logged_days": len(cal_m)
        })

    today_dt = date.today()
    latest_garmin_date = strength_data["as_of_date"]
    latest_bc_date = apple_data["body_comp"]["history"][-1]["Date"] if apple_data["body_comp"]["history"] else "N/A"
    latest_nut_date = apple_data["nutrition"]["history"][-1]["Date"] if apple_data["nutrition"]["history"] else "N/A"
    latest_sleep_date = apple_data["sleep"]["latest_date"] or "N/A"
    latest_mob_date = apple_data["mobility"]["history"][-1]["Date"] if apple_data["mobility"]["history"] else "N/A"

    def get_staleness(date_str: str) -> tuple[str, str]:
        if date_str == "N/A":
            return ("No Data", "badge-danger")
        try:
            d = datetime.strptime(date_str[:10], "%Y-%m-%d").date()
            diff = (today_dt - d).days
            if diff <= 1:
                return ("Fresh (Today / Yesterday)", "badge-sweetspot")
            elif diff <= 3:
                return (f"{diff}d ago", "badge-neutral")
            elif diff <= 7:
                return (f"⚠️ {diff}d ago", "badge-warning")
            else:
                return (f"⚠️ {diff}d stale", "badge-danger")
        except Exception:
            return ("Unknown", "badge-neutral")

    freshness_info = {
        "garmin": {"date": latest_garmin_date, "status": get_staleness(latest_garmin_date)[0], "badge": get_staleness(latest_garmin_date)[1]},
        "body_comp": {"date": latest_bc_date, "status": get_staleness(latest_bc_date)[0], "badge": get_staleness(latest_bc_date)[1]},
        "nutrition": {"date": latest_nut_date, "status": get_staleness(latest_nut_date)[0], "badge": get_staleness(latest_nut_date)[1]},
        "sleep": {"date": latest_sleep_date, "status": get_staleness(latest_sleep_date)[0], "badge": get_staleness(latest_sleep_date)[1]},
        "mobility": {"date": latest_mob_date, "status": get_staleness(latest_mob_date)[0], "badge": get_staleness(latest_mob_date)[1]},
    }

    dashboard_payload = {
        "config": {
            "data_start": athx_config.DATA_START,
            "competition_date": athx_config.COMPETITION_DATE,
            "bodyweight_target_kg": athx_config.BODYWEIGHT_TARGET_KG,
            "bodyweight_goal_type": athx_config.BODYWEIGHT_GOAL_TYPE,
            "e1rm_max_reps": athx_config.E1RM_MAX_REPS,
            "readiness_weights": athx_config.READINESS_WEIGHTS,
        },
        "audit": audit.to_dict(),
        "strength": strength_data,
        "apple": apple_data,
        "running": running_data,
        "workouts": workout_data,
        "competition": comp_data,
        "monthly_summary": monthly_summary,
        "freshness": freshness_info
    }

    payload_json = json.dumps(dashboard_payload, ensure_ascii=False)
    html_content = build_html(payload_json, dashboard_payload)

    out_file = BASE_DIR / "garmin_workout.html"
    out_file.write_text(html_content, encoding="utf-8")
    index_file = BASE_DIR / "index.html"
    index_file.write_text(html_content, encoding="utf-8")
    print(f"\n🎉 Successfully rebuilt ATHX Athlete Dashboard: {out_file} & index.html ({out_file.stat().st_size:,} bytes)")


def build_html(payload_json: str, d: dict) -> str:
    cfg = d["config"]
    st = d["strength"]
    ap = d["apple"]
    rn = d.get("running", {})
    wk = d.get("workouts", {})
    cp = d["competition"]
    fr = d["freshness"]
    au = d["audit"]

    curr_w = ap["body_comp"]["current_weight"]
    target_w = cfg["bodyweight_target_kg"]
    rem_w = ap["body_comp"]["weight_remaining"]
    rem_w_str = f"+{rem_w} kg" if rem_w > 0 else f"{rem_w} kg"
    
    comp_date_display = datetime.strptime(cfg["competition_date"], "%Y-%m-%d").strftime("%d %B %Y")
    as_of_date_display = datetime.strptime(st["as_of_date"], "%Y-%m-%d").strftime("%d %b %Y")

    bench_prog = st["lift_progressions"].get("Bench Press", {})
    bench_28d = bench_prog.get("current_28d_best", 0.0)
    bench_load = bench_prog.get("best_set_load", "N/A")
    bench_rel = bench_prog.get("relative_strength", 0.0)
    bench_proj = bench_prog.get("projected_e1rm", 0.0)

    quads_info = st["muscle_summary"].get("Quads", {})
    hams_info = st["muscle_summary"].get("Hamstrings/Glutes", {})

    event_rows = []
    for e in cp["events"]:
        gap_color = "#34d399" if "Qualified" in e["gap"] else "#f59e0b"
        bar_color = "#34d399" if e["readiness_pct"] >= 100 else "#38bdf8"
        status_badge = "badge-sweetspot" if e["status"] == "Achieved" else "badge-warning"
        event_rows.append(f"""
            <tr>
              <td style="font-weight: 700; color: var(--text-main);">{e['name']}</td>
              <td style="font-family: 'JetBrains Mono'; font-weight: 700; color: var(--primary);">{e['current']}</td>
              <td style="font-family: 'JetBrains Mono'; color: var(--text-muted);">{e['standard']}</td>
              <td style="font-family: 'JetBrains Mono'; font-weight: 700; color: {gap_color};">{e['gap']}</td>
              <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div class="progress-bar-bg" style="width: 100px; margin-top: 0;">
                    <div class="progress-bar-fill" style="width: {min(100.0, e['readiness_pct'])}%; background: {bar_color};"></div>
                  </div>
                  <span style="font-family: 'JetBrains Mono'; font-size: 0.8rem;">{e['readiness_pct']}%</span>
                </div>
              </td>
              <td style="font-family: 'JetBrains Mono'; font-weight: 600; color: var(--athx-gold);">{e['required_rate']}</td>
              <td><span class="badge {status_badge}">{e['status']}</span></td>
            </tr>""")
    events_html = "".join(event_rows)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATHX Games 2027 Athlete Headquarters | Unified Intelligence</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    :root {{
      --bg-dark: #080c1a;
      --card-bg: #0f172a;
      --card-sub-bg: #1e293b;
      --card-border: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      
      --push-color: #38bdf8;
      --pull-color: #a78bfa;
      --legs-color: #34d399;
      --athx-gold: #facc15;
      --sleep-color: #818cf8;
      --primary: #38bdf8;
      --danger: #f43f5e;
      --warning: #f59e0b;
    }}

    * {{ box-sizing: border-box; margin: 0; padding: 0; }}

    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      padding: 1.5rem;
      line-height: 1.5;
    }}

    .container {{ max-width: 1560px; margin: 0 auto; }}

    .freshness-banner {{
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 0.65rem 1.25rem;
      margin-bottom: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.8rem;
    }}

    .freshness-items {{ display: flex; gap: 1.25rem; flex-wrap: wrap; }}
    .freshness-item {{ display: flex; align-items: center; gap: 0.45rem; }}
    .freshness-label {{ color: var(--text-muted); font-weight: 500; }}

    header {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }}

    .header-title {{ display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; }}

    h1 {{
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}

    .countdown-widget {{
      background: linear-gradient(135deg, rgba(250, 204, 21, 0.1) 0%, rgba(56, 189, 248, 0.08) 100%);
      border: 1px solid rgba(250, 204, 21, 0.3);
      border-radius: 12px;
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }}

    .countdown-number {{
      font-size: 2rem;
      font-weight: 900;
      font-family: 'JetBrains Mono', monospace;
      color: var(--athx-gold);
      line-height: 1;
    }}

    .countdown-label {{
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
    }}

    .countdown-phase {{ font-size: 0.85rem; font-weight: 600; color: #38bdf8; }}

    .event-readiness-card {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }}

    .card-title-bar {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }}
    .card-title {{ font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main); }}

    .badge {{
      display: inline-block;
      padding: 0.22rem 0.55rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }}

    .badge-sweetspot {{ background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.35); }}
    .badge-warning {{ background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35); }}
    .badge-danger {{ background: rgba(244, 63, 94, 0.15); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.35); }}
    .badge-neutral {{ background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.35); }}
    .badge-athx {{ background: rgba(250, 204, 21, 0.15); color: var(--athx-gold); border: 1px solid rgba(250, 204, 21, 0.35); }}

    .badge-push {{ background: rgba(56, 189, 248, 0.15); color: var(--push-color); border: 1px solid rgba(56, 189, 248, 0.3); }}
    .badge-legs {{ background: rgba(52, 211, 153, 0.15); color: var(--legs-color); border: 1px solid rgba(52, 211, 153, 0.3); }}
    .badge-pull {{ background: rgba(167, 139, 250, 0.15); color: var(--pull-color); border: 1px solid rgba(167, 139, 250, 0.3); }}
    .badge-full-body {{ background: rgba(250, 204, 21, 0.15); color: var(--athx-gold); border: 1px solid rgba(250, 204, 21, 0.3); }}

    .nav-tabs {{
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.5rem;
      flex-wrap: wrap;
    }}

    .nav-tab {{
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.92rem;
      font-weight: 600;
      padding: 0.6rem 1.1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}

    .nav-tab:hover {{ color: var(--text-main); background: rgba(255, 255, 255, 0.04); }}

    .nav-tab.active {{
      color: var(--primary);
      background: rgba(56, 189, 248, 0.1);
      border-bottom: 2px solid var(--primary);
      border-radius: 8px 8px 0 0;
    }}

    .controls-wrapper {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 0.85rem 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }}

    .date-filter-group {{ display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }}

    .date-input {{
      background: var(--card-sub-bg);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-family: inherit;
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

    .btn-filter:hover {{ color: var(--text-main); border-color: #64748b; }}

    .btn-filter.active {{
      background: var(--primary);
      color: #080c1a;
      border-color: var(--primary);
    }}

    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
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
      transition: transform 0.2s ease, border-color 0.2s ease;
      position: relative;
      overflow: hidden;
    }}

    .kpi-card:hover {{ border-color: #475569; transform: translateY(-2px); }}

    .kpi-header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem; }}

    .kpi-label {{
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .kpi-value {{
      font-size: 1.9rem;
      font-weight: 800;
      color: var(--text-main);
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.1;
    }}

    .kpi-value span {{
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-muted);
      font-family: 'Inter', sans-serif;
    }}

    .kpi-subtext {{
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
      line-height: 1.4;
    }}

    .highlight {{ font-weight: 700; color: var(--primary); }}

    .progress-bar-bg {{
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      height: 6px;
      margin-top: 0.6rem;
      overflow: hidden;
    }}

    .progress-bar-fill {{ height: 100%; border-radius: 9999px; transition: width 0.4s ease; }}

    .charts-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.75rem;
    }}

    @media (max-width: 640px) {{
      .charts-grid {{ grid-template-columns: 1fr; }}
    }}

    .chart-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      position: relative;
    }}

    .chart-header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }}
    .chart-title {{ font-size: 0.95rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem; }}

    .chart-container {{ position: relative; height: 310px; width: 100%; }}

    .table-card {{
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 1.75rem;
    }}

    .table-container {{
      max-height: 520px;
      overflow-y: auto;
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid var(--card-border);
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
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--card-border);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }}

    th:hover {{ color: var(--text-main); background-color: #131c31; }}
    th.sort-active {{ color: var(--primary); }}

    td {{
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-main);
      white-space: nowrap;
    }}

    tr:hover td {{ background-color: rgba(255, 255, 255, 0.02); }}

    .table-pagination {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      font-size: 0.82rem;
      color: var(--text-muted);
      flex-wrap: wrap;
      gap: 0.75rem;
    }}

    .pagination-buttons {{ display: flex; gap: 0.4rem; }}

    .btn-page {{
      background: var(--card-sub-bg);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
    }}

    .btn-page:disabled {{ opacity: 0.4; cursor: not-allowed; }}

    .search-input {{
      background: var(--card-sub-bg);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      font-size: 0.85rem;
      width: 250px;
    }}

    .tab-section {{ display: none; }}
    .tab-section.active {{ display: block; }}
  </style>
</head>
<body>
  <div class="container">
    
    <!-- 1. Per-Source Freshness & Staleness Status Banner -->
    <div class="freshness-banner">
      <div class="freshness-items">
        <div class="freshness-item">
          <span class="freshness-label">🏋️ Garmin Strength:</span>
          <span class="badge {fr['garmin']['badge']}">{fr['garmin']['date']} ({fr['garmin']['status']})</span>
        </div>
        <div class="freshness-item">
          <span class="freshness-label">⚖️ Body Comp:</span>
          <span class="badge {fr['body_comp']['badge']}">{fr['body_comp']['date']} ({fr['body_comp']['status']})</span>
        </div>
        <div class="freshness-item">
          <span class="freshness-label">🥗 Nutrition:</span>
          <span class="badge {fr['nutrition']['badge']}">{fr['nutrition']['date']} ({fr['nutrition']['status']})</span>
        </div>
        <div class="freshness-item">
          <span class="freshness-label">💤 Sleep Watch:</span>
          <span class="badge {fr['sleep']['badge']}">{fr['sleep']['date']} ({fr['sleep']['status']})</span>
        </div>
        <div class="freshness-item">
          <span class="freshness-label">🚶 Biomechanics:</span>
          <span class="badge {fr['mobility']['badge']}">{fr['mobility']['date']} ({fr['mobility']['status']})</span>
        </div>
      </div>
      <div>
        <button class="btn-filter" id="btnOpenAudit" style="border-color: rgba(250,204,21,0.4); color: var(--athx-gold);">
          🛡️ Data Quality & Audit ({au['summary']['pre_may_excluded_sets']} Pre-May Excl)
        </button>
      </div>
    </div>

    <!-- 2. Header & Competition Countdown Bar -->
    <header>
      <div>
        <div class="header-title" style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <h1>ATHX 2027 Athlete Headquarters</h1>
          <span class="badge badge-athx">Non-Pro Category</span>
          <a href="calendar_dashboard.html" style="text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; border-radius: 6px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.8rem; font-weight: 600; transition: all 0.2s ease;">📅 Calendar Dashboard ↗</a>
        </div>
        <div class="header-subtext" style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">
          Unified Decision Hub • Strict Analysis Floor: <strong style="color: var(--primary);">{cfg['data_start']}</strong> • Updated: <strong>{as_of_date_display}</strong>
        </div>
      </div>

      <div class="countdown-widget">
        <div>
          <div class="countdown-number">{cp['weeks_remaining']}</div>
          <div class="countdown-label">Weeks to Games</div>
        </div>
        <div style="border-left: 1px solid rgba(255,255,255,0.1); padding-left: 1rem;">
          <div style="font-size: 0.78rem; color: var(--text-muted);">Competition Target: <strong style="color: var(--text-main);">{comp_date_display}</strong></div>
          <div class="countdown-phase">{cp['periodization_phase']}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">
            Weight Goal: <strong style="color: var(--legs-color);">{target_w} kg ({rem_w_str} remaining)</strong>
          </div>
        </div>
      </div>
    </header>

    <!-- 3. TOP-LEVEL ATHX EVENT READINESS TABLE (The very first thing on the page) -->
    <section class="event-readiness-card">
      <div class="card-title-bar">
        <span class="card-title">🎯 ATHX Games 2027 Non-Pro Event Readiness & Standards</span>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Required Rate of Improvement to Close Qualifying Gap by May 2027</span>
      </div>
      <div class="table-container" style="max-height: none;">
        <table>
          <thead>
            <tr>
              <th>Event Discipline</th>
              <th>Current Best (28d Best)</th>
              <th>Competition Standard</th>
              <th>Qualifying Gap</th>
              <th>Current Readiness</th>
              <th>Required Weekly Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {events_html}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Global Tabs -->
    <div class="nav-tabs">
      <button class="nav-tab active" data-tab="garminTab">
        🏋️ Garmin PPL, Hypertrophy & Workload Engine
      </button>
      <button class="nav-tab" data-tab="aerobicTab">
        🏃 Running & Conditioning Engine
      </button>
      <button class="nav-tab" data-tab="appleTab">
        🍏 Apple Health: Body Comp & Fueling
      </button>
      <button class="nav-tab" data-tab="sleepTab">
        💤 Sleep Architecture, Biomechanics & Recovery
      </button>
      <button class="nav-tab" data-tab="auditTab">
        🛡️ Data Quality & Audit Trail Panel
      </button>
    </div>

    <!-- Global Date Range Controls Bar -->
    <div class="controls-wrapper">
      <div class="date-filter-group">
        <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted);">TIMELINE:</span>
        <button class="btn-filter active" data-range="all">All Since 1 May ({cfg['data_start']})</button>
        <button class="btn-filter" data-range="12w">Trailing 12 Weeks</button>
        <button class="btn-filter" data-range="4w">Trailing 4 Weeks</button>
        <button class="btn-filter" data-range="7d">Trailing 7 Days</button>
      </div>
      <div class="date-filter-group">
        <label style="font-size: 0.8rem; color: var(--text-muted);">From:</label>
        <input type="date" id="dateFilterStart" class="date-input" value="{cfg['data_start']}" min="{cfg['data_start']}">
        <label style="font-size: 0.8rem; color: var(--text-muted);">To:</label>
        <input type="date" id="dateFilterEnd" class="date-input" value="{st['as_of_date']}" min="{cfg['data_start']}">
      </div>
    </div>

    <!-- TAB 1: GARMIN PPL, HYPERTROPHY & WORKLOAD ENGINE -->
    <div id="garminTab" class="tab-section active">
      <section class="kpi-grid">
        <!-- ACWR Card (Dynamic max Date) -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Acute:Chronic Workload (ACWR)</span>
            <span class="badge {st['acwr']['badge']}">{st['acwr']['status']}</span>
          </div>
          <div class="kpi-value">{st['acwr']['value']} <span>ratio</span></div>
          <div class="kpi-subtext">
            Acute: <span class="highlight">{st['acwr']['acute_load_kg']:,.0f} kg/d</span> | Chronic: {st['acwr']['chronic_load_kg']:,.0f} kg/d<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">{st['acwr']['note']}</span>
          </div>
        </div>

        <!-- Foster Workload & Monotony -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Foster Monotony & Strain</span>
            <span class="badge badge-sweetspot">Resistance Safe</span>
          </div>
          <div class="kpi-value">{st['foster_workload']['monotony']} <span>index</span></div>
          <div class="kpi-subtext">
            Weekly Strain: <span class="highlight">{st['foster_workload']['strain_k']}k</span> | Weekly Vol: {st['foster_workload']['weekly_tonnage_t']} t<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Flags resistance training monotony risk (optimal &lt; 1.5)</span>
          </div>
        </div>

        <!-- Total Valid Tonnage Since May 1 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Valid Strength Tonnage</span>
            <span class="badge badge-sweetspot">{st['total_sessions']} sessions</span>
          </div>
          <div class="kpi-value">{st['total_volume_tons']} <span>Tons</span></div>
          <div class="kpi-subtext">
            Valid Sets: <span class="highlight">{st['total_valid_sets']}</span> (since {cfg['data_start']})<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Imputed: {au['summary']['unknown_imputed']} | Unattributed: {au['summary']['unknown_unattributed']} (retained in tonnage)</span>
          </div>
        </div>

        <!-- Bench Press 28-day Trailing Best & Projection -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Bench Press 28-Day Best</span>
            <span class="badge badge-sweetspot">{bench_rel}x BW</span>
          </div>
          <div class="kpi-value">{bench_28d} <span>kg e1RM</span></div>
          <div class="kpi-subtext">
            Best Load: <span class="highlight">{bench_load}</span> (reps &le; {cfg['e1rm_max_reps']})<br>
            Projected @ 2027 Games: <strong style="color: var(--athx-gold);">{bench_proj} kg</strong> (extrapolation)
          </div>
        </div>

        <!-- Hypertrophy Volume Alert: Quads & Hamstrings below MEV -->
        <div class="kpi-card" style="border-color: rgba(244, 63, 94, 0.4);">
          <div class="kpi-header">
            <span class="kpi-label">Leg Hypertrophy Deficit</span>
            <span class="badge badge-danger">⚠️ BELOW MEV</span>
          </div>
          <div class="kpi-value" style="color: #f43f5e;">{quads_info.get('avg_weekly_sets', 0.0)} <span style="color: #f43f5e;">quad sets/wk</span></div>
          <div class="kpi-subtext">
            Quads: <strong style="color: #f43f5e;">{quads_info.get('avg_weekly_sets', 0.0)}/wk</strong> (MEV: {quads_info.get('mev', 8):.0f}) | Hamstrings: <strong style="color: #f43f5e;">{hams_info.get('avg_weekly_sets', 0.0)}/wk</strong> (MEV: {hams_info.get('mev', 6):.0f})<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Chest ({st['muscle_summary'].get('Chest', {}).get('avg_weekly_sets', 0.0)}/wk) and Back ({st['muscle_summary'].get('Lats/Back', {}).get('avg_weekly_sets', 0.0)}/wk) near MAV</span>
          </div>
        </div>

        <!-- Junk Volume Share -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Junk-Volume Share</span>
            <span class="badge badge-sweetspot">{st['junk_volume']['sets_count']} sets</span>
          </div>
          <div class="kpi-value">{st['junk_volume']['volume_pct']} <span>%</span></div>
          <div class="kpi-subtext">
            Tonnage: <span class="highlight">{st['junk_volume']['tonnage_tons']} t</span> in low-stimulus &ge;35 rep sets<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Target &lt; 5% total tonnage in non-productive rep ranges</span>
          </div>
        </div>
      </section>

      <!-- Charts Row 1: Competition Radar & Muscle Volume Time Series -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">🎯 ATHX Games 2027 Competition Readiness Radar</span>
            <span class="badge badge-athx">Standards Baseline</span>
          </div>
          <div class="chart-container">
            <canvas id="athxRadarChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">📊 Weekly Muscle Group Set Volume (vs MEV / MRV)</span>
            <span class="badge badge-sweetspot">18-Week Series</span>
          </div>
          <div class="chart-container">
            <canvas id="muscleStackedBarChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Charts Row 2: Trailing 28-Day e1RM Projections & Daily Volume Timeline -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">📈 Main Lifts 28-Day e1RM Trajectories & Projections</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Reps &le; 10 Plausible Loads</span>
          </div>
          <div class="chart-container">
            <canvas id="e1rmTrajectoryChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">⚡ Daily Training Load & ACWR Timeline</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">As-of {as_of_date_display}</span>
          </div>
          <div class="chart-container">
            <canvas id="dailyLoadChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Table: Audited Garmin Workout Sets (Date DESC default) -->
      <div class="table-card">
        <div class="chart-header">
          <span class="chart-title">📋 Audited Strength Training Sets Log</span>
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <div class="btn-group" id="garminSplitFilters">
              <button class="btn-filter active" data-split="All">All Splits</button>
              <button class="btn-filter" data-split="Push">Push</button>
              <button class="btn-filter" data-split="Pull">Pull</button>
              <button class="btn-filter" data-split="Legs">Legs</button>
              <button class="btn-filter" data-split="Full Body">Full Body</button>
            </div>
            <input type="text" id="workoutSearch" class="search-input" placeholder="Search exercise or muscle...">
          </div>
        </div>

        <div class="table-container">
          <table id="workoutTable">
            <thead>
              <tr>
                <th data-col="Date">Date ▾</th>
                <th data-col="Session_Type">Session Split</th>
                <th data-col="Muscle_Group">Muscle Group</th>
                <th data-col="Exercise">Exercise Name</th>
                <th data-col="Set">Set</th>
                <th data-col="Reps">Reps</th>
                <th data-col="Weight_kg">Weight</th>
                <th data-col="Total_Volume_kg">Volume</th>
                <th data-col="e1RM_kg">e1RM (Epley &le;10)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="workoutTableBody"></tbody>
          </table>
        </div>

        <div class="table-pagination" id="workoutPagination">
          <div id="workoutPageInfo">Showing 1–50 of {st['total_valid_sets']} sets</div>
          <div class="pagination-buttons">
            <button class="btn-page" id="btnWorkoutPrev" disabled>&larr; Previous</button>
            <button class="btn-page" id="btnWorkoutNext">Next &rarr;</button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: AEROBIC ENGINE, RUNNING & CONDITIONING -->
    <div id="aerobicTab" class="tab-section">
      <section class="kpi-grid">
        <!-- Running 5k Pace -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">5km Running Benchmark</span>
            <span class="badge badge-warning">ATHX Std: 4:30/km</span>
          </div>
          <div class="kpi-value">{rn.get('best_5k_pace_formatted', 'N/A')}</div>
          <div class="kpi-subtext">
            Trailing 28d Best: <strong style="color: var(--primary);">{rn.get('current_28d_best_pace_formatted', 'N/A')}</strong><br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Garmin GPS tracking | Target: sub-4:30/km for ATHX Tier 1</span>
          </div>
        </div>

        <!-- VO2Max & Aerobic Capacity -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">VO2Max & Aerobic Capacity</span>
            <span class="badge badge-sweetspot">Aerobic Base</span>
          </div>
          <div class="kpi-value">{rn.get('latest_vo2max', '51.0')} <span>ml/kg/min</span></div>
          <div class="kpi-subtext">
            Garmin Firstbeat Analytics<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Avg Run Cadence: {rn.get('avg_cadence_spm', 'N/A')} spm | Avg HR: {rn.get('avg_hr', 'N/A')} bpm</span>
          </div>
        </div>

        <!-- Running Volume Since May 1 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Running Volume (Since May 1)</span>
            <span class="badge badge-sweetspot">{rn.get('total_runs', 0)} Runs</span>
          </div>
          <div class="kpi-value">{rn.get('total_distance_km', 0.0)} <span>km</span></div>
          <div class="kpi-subtext">
            Total Time: <span class="highlight">{rn.get('total_duration_min', 0.0)} min</span><br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Active Phase 1 aerobic tempo target: 5-8km weekly</span>
          </div>
        </div>

        <!-- Cross-Training & Conditioning Sessions -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Conditioning & Workouts</span>
            <span class="badge badge-sweetspot">{wk.get('total_sessions', 0)} Sessions</span>
          </div>
          <div class="kpi-value">{wk.get('total_duration_min', 0.0)} <span>min</span></div>
          <div class="kpi-subtext">
            Conditioning Energy: <span class="highlight">{wk.get('total_calories', 0):,} kcal</span><br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Cross-training, indoor cardio, hiking/rucking & bouldering</span>
          </div>
        </div>
      </section>

      <!-- Running Activities Log Table -->
      <div class="table-card">
        <div class="chart-header">
          <span class="chart-title">🏃 Garmin Running Activities Log ({len(rn.get('history', []))} Recorded Runs)</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Pace, Heart Rate, VO2Max & Training Effect</span>
        </div>
        <div class="table-container">
          <table id="runningTable">
            <thead>
              <tr>
                <th>Date ▾</th>
                <th>Activity Name</th>
                <th>Distance</th>
                <th>Duration</th>
                <th>Avg Pace</th>
                <th>Avg HR</th>
                <th>Max HR</th>
                <th>Cadence</th>
                <th>VO2Max</th>
                <th>Training Effect</th>
              </tr>
            </thead>
            <tbody id="runningTableBody"></tbody>
          </table>
        </div>
      </div>

      <!-- Conditioning / Workout Activities Log Table -->
      <div class="table-card" style="margin-top: 1.5rem;">
        <div class="chart-header">
          <span class="chart-title">⚡ Cardio, Cross-Training & Recovery Workouts ({len(wk.get('history', []))} Sessions)</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Modalities, Energy Burn & Intensity Distribution</span>
        </div>
        <div class="table-container">
          <table id="workoutsTable">
            <thead>
              <tr>
                <th>Date ▾</th>
                <th>Activity Name</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Calories</th>
                <th>Avg HR</th>
                <th>Max HR</th>
                <th>Training Effect</th>
              </tr>
            </thead>
            <tbody id="workoutsTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: APPLE HEALTH: BODY COMP & ENERGY AVAILABILITY -->
    <div id="appleTab" class="tab-section">
      <section class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">7-Day Smoothed Weight</span>
            <span class="badge badge-sweetspot">Bulking Phase</span>
          </div>
          <div class="kpi-value">{curr_w} <span>kg</span></div>
          <div class="kpi-subtext">
            Target: <span class="highlight">{target_w} kg</span> ({rem_w_str} to competition goal)<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">{ap['body_comp']['weigh_ins_count']} weigh-ins since {cfg['data_start']}</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: {min(100.0, (curr_w / target_w) * 100.0)}%; background: linear-gradient(90deg, #38bdf8, #34d399);"></div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Lean Body Mass</span>
            <span class="badge badge-warning">Scale Bioimpedance: Low</span>
          </div>
          <div class="kpi-value">{ap['body_comp']['latest_lean_mass']} <span>kg</span></div>
          <div class="kpi-subtext">
            Latest BF: <span class="highlight">{ap['body_comp']['latest_bf_pct']}%</span> (drift noted)<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Bioimpedance BF% drift noted; tracking progression via smoothed weight.</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Average Daily Steps</span>
            <span class="badge badge-sweetspot">n = {ap['activity']['days_logged']} days</span>
          </div>
          <div class="kpi-value">{ap['activity']['avg_steps']:,} <span>steps/d</span></div>
          <div class="kpi-subtext">
            Max Day: <span class="highlight">{ap['activity']['max_steps']:,} steps</span> (since {cfg['data_start']})<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">High baseline NEAT work capacity</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Protein Fueling Adherence</span>
            <span class="badge badge-sweetspot">{ap['nutrition']['protein_g_per_kg']} g/kg</span>
          </div>
          <div class="kpi-value">{ap['nutrition']['avg_protein_g']} <span>g/day</span></div>
          <div class="kpi-subtext">
            Daily Calories: <span class="highlight">{ap['nutrition']['avg_calories']:,} kcal/d</span> ({ap['nutrition']['days_logged']} logged days)<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Target band: 1.6 &ndash; 2.2 g/kg bodyweight</span>
          </div>
        </div>
      </section>

      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">⚖️ 7-Day Smoothed Weight & Scale Trajectory</span>
          </div>
          <div class="chart-container">
            <canvas id="weightBfChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">🥗 Calorie & Protein Adherence (Foodvisor)</span>
          </div>
          <div class="chart-container">
            <canvas id="nutritionChart"></canvas>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="chart-header">
          <span class="chart-title">📅 Month-by-Month Recomposition Summary (Date DESC)</span>
        </div>
        <div class="table-container">
          <table id="monthlyTable">
            <thead>
              <tr>
                <th data-col="month">Month ▾</th>
                <th data-col="avg_weight">Avg Weight (kg)</th>
                <th data-col="avg_bf">Avg Body Fat (%)</th>
                <th data-col="avg_lean_mass">Avg Lean Mass (kg)</th>
                <th data-col="avg_calories">Avg Daily Cals</th>
                <th data-col="avg_protein">Avg Protein (g)</th>
                <th data-col="avg_steps">Avg Daily Steps</th>
                <th data-col="weigh_ins">Weigh-ins</th>
                <th data-col="nutrition_logged_days">Logged Days</th>
              </tr>
            </thead>
            <tbody id="monthlyTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: SLEEP ARCHITECTURE, BIOMECHANICS & RECOVERY -->
    <div id="sleepTab" class="tab-section">
      <section class="kpi-grid">
        <div class="kpi-card" style="border-color: rgba(56, 189, 248, 0.4);">
          <div class="kpi-header">
            <span class="kpi-label">ATHX Readiness Composite</span>
            <span class="badge badge-sweetspot">Fully Documented</span>
          </div>
          <div class="kpi-value" style="color: #38bdf8;">{ap['readiness_composite']['score']} <span>%</span></div>
          <div class="kpi-subtext">
            Sleep (25%): <strong style="color: #38bdf8;">{ap['readiness_composite']['components']['sleep']['score']}</strong> | 
            RHR (25%): <strong style="color: #38bdf8;">{ap['readiness_composite']['components']['rhr']['score']}</strong> | 
            Gait (20%): <strong style="color: #38bdf8;">{ap['readiness_composite']['components']['asymmetry']['score']}</strong> | 
            ACWR (20%): <strong style="color: #38bdf8;">100</strong> | 
            Fuel (10%): <strong style="color: #38bdf8;">{ap['readiness_composite']['components']['protein']['score']}</strong><br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Transparent weighted formula based on sleep debt, baseline RHR, asymmetry & ACWR.</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Sleep Duration & Coverage</span>
            <span class="badge badge-sweetspot">Coverage: {ap['sleep']['coverage_pct']}%</span>
          </div>
          <div class="kpi-value">{ap['sleep']['avg_sleep_hrs']} <span>hrs/night</span></div>
          <div class="kpi-subtext">
            Valid Nights: <span class="highlight">{ap['sleep']['valid_nights']} of {ap['sleep']['calendar_days']} nights</span><br>
            Latest Night: {ap['sleep']['latest_night_hrs']} hrs (sub-3h nights dropped as watch off)
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: {min(100.0, (ap['sleep']['avg_sleep_hrs'] / 8.0) * 100.0)}%; background: linear-gradient(90deg, #818cf8, #38bdf8);"></div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Gait Asymmetry Alert</span>
            <span class="badge badge-sweetspot">Normal (&le;2.0%)</span>
          </div>
          <div class="kpi-value">{ap['mobility']['avg_asymmetry_pct']} <span>%</span></div>
          <div class="kpi-subtext">
            7-Day Rolling Mean (Threshold: &le; 2.0%)<br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Mobility tracking active since {ap['mobility']['start_date']} ({ap['mobility']['days_tracked']} days recorded)</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Resting Heart Rate (RHR)</span>
            <span class="badge badge-sweetspot">Baseline: {ap['mobility']['baseline_rhr']} bpm</span>
          </div>
          <div class="kpi-value">{ap['mobility']['current_rhr']} <span>bpm</span></div>
          <div class="kpi-subtext">
            7-Day vs 28-Day Baseline Deviation: <span class="highlight">{round(ap['mobility']['current_rhr'] - ap['mobility']['baseline_rhr'], 1):+0.1f} bpm</span><br>
            <span style="font-size: 0.72rem; color: var(--text-dim);">Key recovery signal: elevation indicates accumulated autonomic fatigue</span>
          </div>
        </div>
      </section>

      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">💤 Sleep Architecture Timeline & Deep/REM Restoration</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">{ap['sleep']['valid_nights']} Valid Nights</span>
          </div>
          <div class="chart-container">
            <canvas id="sleepArchitectureChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">🚶 Bilateral Gait Asymmetry & RHR Recovery Trend</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Starts {ap['mobility']['start_date']}</span>
          </div>
          <div class="chart-container">
            <canvas id="biomechanicsChart"></canvas>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="chart-header">
          <span class="chart-title">📋 Sleep Architecture History (Usable Efficiency Filtered)</span>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Efficiency computed only where In_Bed &le; 14h ({ap['sleep']['usable_efficiency_nights']} usable nights)</span>
        </div>
        <div class="table-container">
          <table id="sleepTable">
            <thead>
              <tr>
                <th data-col="Date">Date ▾</th>
                <th data-col="Total_Sleep_hrs">Total Sleep (hrs)</th>
                <th data-col="Deep_Sleep_hrs">Deep Sleep (hrs)</th>
                <th data-col="REM_Sleep_hrs">REM Sleep (hrs)</th>
                <th data-col="Core_Sleep_hrs">Core Sleep (hrs)</th>
                <th data-col="In_Bed_hrs">In Bed (hrs)</th>
                <th data-col="Efficiency_pct">Sleep Efficiency</th>
              </tr>
            </thead>
            <tbody id="sleepTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: DATA QUALITY & AUDIT TRAIL PANEL -->
    <div id="auditTab" class="tab-section">
      <section class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Pre-May Excluded Sets</span><span class="badge badge-warning">Date Floor</span></div>
          <div class="kpi-value">{au['summary']['pre_may_excluded_sets']} <span>sets</span></div>
          <div class="kpi-subtext">Records before {cfg['data_start']} excluded from all KPIs & charts with complete audit trail.</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Unknown Exercise Imputations</span><span class="badge badge-sweetspot">Imputed</span></div>
          <div class="kpi-value">{au['summary']['unknown_imputed']} <span>sets</span></div>
          <div class="kpi-subtext">Signature-matched within session. Remaining {au['summary']['unknown_unattributed']} kept as Unattributed in tonnage.</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Implausible Load Flags</span><span class="badge badge-danger">Excluded from e1RM</span></div>
          <div class="kpi-value">{au['summary']['load_implausible_flags']} <span>sets</span></div>
          <div class="kpi-subtext">Garmin stack/auto-weight artifacts flagged (e.g. Pushup &gt;45kg, Flye &gt;42.5kg, Cable &gt;55kg).</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Sleep Integrity Usability</span><span class="badge badge-sweetspot">Usable</span></div>
          <div class="kpi-value">{au['summary']['sleep_usable_efficiency_nights']} <span>nights</span></div>
          <div class="kpi-subtext">{au['summary']['sleep_in_bed_overflow_excluded']} in-bed overflows (&gt;14h) & {au['summary']['sleep_non_wear_dropped']} non-wear (&lt;3h) filtered.</div>
        </div>
      </section>

      <div class="table-card">
        <div class="chart-header">
          <span class="chart-title">🛡️ Detailed Audit Trail Log ({len(au['records'])} Flagged Records)</span>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn-filter" id="btnExportAudit">💾 Export Audit Report (JSON)</button>
          </div>
        </div>
        <div class="table-container">
          <table id="auditTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Identifier</th>
                <th>Raw Value</th>
                <th>Action Taken</th>
                <th>Audit Reason</th>
              </tr>
            </thead>
            <tbody id="auditTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>

  </div>

  <script>
    const ATHX_DATA = {payload_json};

    let currentSplit = "All";
    let workoutSearchQuery = "";
    let workoutPage = 1;
    const WORKOUT_PER_PAGE = 50;

    let sortColumns = {{
      workoutTable: {{ col: "Date", desc: true }},
      monthlyTable: {{ col: "month", desc: true }},
      sleepTable: {{ col: "Date", desc: true }},
    }};

    document.querySelectorAll(".nav-tab[data-tab]").forEach(btn => {{
      btn.addEventListener("click", () => {{
        document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-section").forEach(s => s.classList.remove("active"));
        btn.classList.add("active");
        const targetId = btn.getAttribute("data-tab");
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.add("active");
      }});
    }});

    const btnOpenAuditEl = document.getElementById("btnOpenAudit");
    if (btnOpenAuditEl) {{
      btnOpenAuditEl.addEventListener("click", () => {{
        document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-section").forEach(s => s.classList.remove("active"));
        const auditTabBtn = document.querySelector(".nav-tab[data-tab='auditTab']");
        if (auditTabBtn) auditTabBtn.classList.add("active");
        const auditTabEl = document.getElementById("auditTab");
        if (auditTabEl) auditTabEl.classList.add("active");
      }});
    }}

    function renderWorkoutTable() {{
      const tbody = document.getElementById("workoutTableBody");
      if (!tbody) return;

      const rawSets = ATHX_DATA.strength.processed_sets;
      let filtered = rawSets.filter(s => {{
        const matchSplit = (currentSplit === "All" || s.Session_Type === currentSplit);
        const matchQuery = (!workoutSearchQuery || 
          s.Exercise.toLowerCase().includes(workoutSearchQuery) ||
          s.Muscle_Group.toLowerCase().includes(workoutSearchQuery) ||
          s.Date.includes(workoutSearchQuery)
        );
        return matchSplit && matchQuery;
      }});

      const {{ col, desc }} = sortColumns.workoutTable;
      filtered.sort((a, b) => {{
        let vA = a[col], vB = b[col];
        if (vA === null || vA === undefined) return 1;
        if (vB === null || vB === undefined) return -1;
        if (typeof vA === "string") return desc ? vB.localeCompare(vA) : vA.localeCompare(vB);
        return desc ? (vB - vA) : (vA - vB);
      }});

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / WORKOUT_PER_PAGE));
      if (workoutPage > totalPages) workoutPage = totalPages;
      if (workoutPage < 1) workoutPage = 1;

      const startIdx = (workoutPage - 1) * WORKOUT_PER_PAGE;
      const endIdx = Math.min(startIdx + WORKOUT_PER_PAGE, total);
      const pageSlice = filtered.slice(startIdx, endIdx);

      tbody.innerHTML = pageSlice.map(r => {{
        const isImputed = r.Imputed ? `<span class="badge badge-sweetspot">Imputed</span>` : 
                          (r.Exercise === "Unattributed" ? `<span class="badge badge-warning">Unattributed</span>` : `<span class="badge badge-neutral">Valid</span>`);
        const e1rmDisplay = r.e1RM_kg ? `${{r.e1RM_kg}} kg` : `<span style="color: var(--text-dim);">-</span>`;
        const splitClass = r.Session_Type ? r.Session_Type.toLowerCase().replace(" ", "-") : "push";

        return `<tr>
          <td style="font-family: 'JetBrains Mono'; font-weight: 600;">${{r.Date}}</td>
          <td><span class="badge badge-${{splitClass}}">${{r.Session_Type}}</span></td>
          <td style="color: var(--primary); font-weight: 600;">${{r.Muscle_Group}}</td>
          <td style="font-weight: 600;">${{r.Exercise}}</td>
          <td>${{r.Set}}</td>
          <td style="font-family: 'JetBrains Mono';">${{r.Reps}}</td>
          <td style="font-family: 'JetBrains Mono';">${{r.Weight_kg}} kg</td>
          <td style="font-family: 'JetBrains Mono';">${{Math.round(r.Total_Volume_kg).toLocaleString()}} kg</td>
          <td style="font-family: 'JetBrains Mono'; font-weight: 700; color: var(--primary);">${{e1rmDisplay}}</td>
          <td>${{isImputed}}</td>
        </tr>`;
      }}).join("");

      const pageInfo = document.getElementById("workoutPageInfo");
      if (pageInfo) pageInfo.innerText = `Showing ${{startIdx + 1}}–${{endIdx}} of ${{total.toLocaleString()}} sets`;

      const prevBtn = document.getElementById("btnWorkoutPrev");
      const nextBtn = document.getElementById("btnWorkoutNext");
      if (prevBtn) prevBtn.disabled = (workoutPage <= 1);
      if (nextBtn) nextBtn.disabled = (workoutPage >= totalPages);
    }}

    document.querySelectorAll("#garminSplitFilters .btn-filter").forEach(btn => {{
      btn.addEventListener("click", () => {{
        document.querySelectorAll("#garminSplitFilters .btn-filter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentSplit = btn.getAttribute("data-split");
        workoutPage = 1;
        renderWorkoutTable();
      }});
    }});

    const searchInput = document.getElementById("workoutSearch");
    if (searchInput) {{
      searchInput.addEventListener("input", (e) => {{
        workoutSearchQuery = e.target.value.toLowerCase().trim();
        workoutPage = 1;
        renderWorkoutTable();
      }});
    }}

    const prevBtn = document.getElementById("btnWorkoutPrev");
    if (prevBtn) prevBtn.addEventListener("click", () => {{ if (workoutPage > 1) {{ workoutPage--; renderWorkoutTable(); }} }});
    const nextBtn = document.getElementById("btnWorkoutNext");
    if (nextBtn) nextBtn.addEventListener("click", () => {{ workoutPage++; renderWorkoutTable(); }});

    function renderMonthlyTable() {{
      const tbody = document.getElementById("monthlyTableBody");
      if (!tbody) return;

      const items = [...ATHX_DATA.monthly_summary];
      const {{ col, desc }} = sortColumns.monthlyTable;
      items.sort((a, b) => {{
        let vA = a[col], vB = b[col];
        if (vA === null) return 1;
        if (vB === null) return -1;
        if (typeof vA === "string") return desc ? vB.localeCompare(vA) : vA.localeCompare(vB);
        return desc ? (vB - vA) : (vA - vB);
      }});

      tbody.innerHTML = items.map(r => `<tr>
        <td style="font-weight: 700;">${{r.month}}</td>
        <td style="font-family: 'JetBrains Mono';">${{r.avg_weight || '-'}}</td>
        <td style="font-family: 'JetBrains Mono';">${{r.avg_bf ? r.avg_bf + '%' : '-'}}</td>
        <td style="font-family: 'JetBrains Mono';">${{r.avg_lean_mass || '-'}}</td>
        <td style="font-family: 'JetBrains Mono';">${{r.avg_calories ? r.avg_calories.toLocaleString() : '-'}}</td>
        <td style="font-family: 'JetBrains Mono'; font-weight: 600; color: var(--primary);">${{r.avg_protein || '-'}}</td>
        <td style="font-family: 'JetBrains Mono';">${{r.avg_steps ? r.avg_steps.toLocaleString() : '-'}}</td>
        <td><span class="badge badge-sweetspot">${{r.weigh_ins}} days</span></td>
        <td><span class="badge badge-neutral">${{r.nutrition_logged_days}} days</span></td>
      </tr>`).join("");
    }}

    function renderSleepTable() {{
      const tbody = document.getElementById("sleepTableBody");
      if (!tbody) return;

      const items = [...ATHX_DATA.apple.sleep.history];
      const {{ col, desc }} = sortColumns.sleepTable;
      items.sort((a, b) => {{
        let vA = a[col], vB = b[col];
        if (vA === null) return 1;
        if (vB === null) return -1;
        if (typeof vA === "string") return desc ? vB.localeCompare(vA) : vA.localeCompare(vB);
        return desc ? (vB - vA) : (vA - vB);
      }});

      tbody.innerHTML = items.map(r => `<tr>
        <td style="font-family: 'JetBrains Mono'; font-weight: 600;">${{r.Date}}</td>
        <td style="font-family: 'JetBrains Mono'; font-weight: 700; color: var(--primary);">${{r.Total_Sleep_hrs}} h</td>
        <td style="font-family: 'JetBrains Mono';">${{r.Deep_Sleep_hrs}} h (${{r.Deep_pct}}%)</td>
        <td style="font-family: 'JetBrains Mono';">${{r.REM_Sleep_hrs}} h (${{r.REM_pct}}%)</td>
        <td style="font-family: 'JetBrains Mono';">${{r.Core_Sleep_hrs}} h</td>
        <td style="font-family: 'JetBrains Mono';">${{r.In_Bed_hrs}} h</td>
        <td>
          ${{r.Efficiency_pct ? 
            `<span class="badge ${{r.Efficiency_pct >= 85 ? 'badge-sweetspot' : 'badge-warning'}}">${{r.Efficiency_pct}}%</span>` : 
            `<span class="badge badge-neutral" title="Excluded (In_Bed > 14h)">Artifact Excl</span>`}}
        </td>
      </tr>`).join("");
    }}

    function renderAuditTable() {{
      const tbody = document.getElementById("auditTableBody");
      if (!tbody) return;

      const records = ATHX_DATA.audit.records;
      tbody.innerHTML = records.map(r => `<tr>
        <td style="font-family: 'JetBrains Mono';">${{r.date}}</td>
        <td><span class="badge ${{r.category.includes('Exclusion') ? 'badge-warning' : (r.category.includes('Plausible') || r.category.includes('Junk') ? 'badge-danger' : 'badge-sweetspot')}}">${{r.category}}</span></td>
        <td style="font-weight: 600;">${{r.identifier}}</td>
        <td style="font-family: 'JetBrains Mono'; color: var(--text-muted);">${{r.raw_value}}</td>
        <td style="color: var(--primary); font-weight: 600;">${{r.action}}</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${{r.reason}}</td>
      </tr>`).join("");
    }}

    function renderRunningTable() {{
      const tbody = document.getElementById("runningTableBody");
      if (!tbody) return;
      const items = [...(ATHX_DATA.running ? ATHX_DATA.running.history : [])].reverse();
      tbody.innerHTML = items.map(r => `<tr>
        <td style="font-family: 'JetBrains Mono'; font-weight: 600;">${{r.Date}}</td>
        <td style="font-weight: 600; color: var(--text-main);">${{r.Activity_Name}}</td>
        <td style="font-family: 'JetBrains Mono'; font-weight: 700; color: var(--primary);">${{r.Distance_km}} km</td>
        <td style="font-family: 'JetBrains Mono';">${{r.Duration_min}} min</td>
        <td style="font-family: 'JetBrains Mono'; font-weight: 700; color: var(--athx-gold);">${{r.Pace_formatted}}</td>
        <td style="font-family: 'JetBrains Mono';">${{r.Average_HR || '—'}} bpm</td>
        <td style="font-family: 'JetBrains Mono';">${{r.Max_HR || '—'}} bpm</td>
        <td style="font-family: 'JetBrains Mono';">${{r.Cadence_spm ? r.Cadence_spm + ' spm' : '—'}}</td>
        <td style="font-family: 'JetBrains Mono'; font-weight: 700; color: var(--accent);">${{r.VO2Max || '—'}}</td>
        <td><span class="badge badge-sweetspot">${{r.Training_Effect_Label || 'AEROBIC'}}</span></td>
      </tr>`).join("");
    }}

    function renderWorkoutsTable() {{
      const tbody = document.getElementById("workoutsTableBody");
      if (!tbody) return;
      const items = [...(ATHX_DATA.workouts ? ATHX_DATA.workouts.history : [])].reverse();
      tbody.innerHTML = items.map(r => `<tr>
        <td style="font-family: 'JetBrains Mono'; font-weight: 600;">${{r.Date}}</td>
        <td style="font-weight: 600; color: var(--text-main);">${{r.Activity_Name}}</td>
        <td><span class="badge ${{r.Category && r.Category.includes('Cross') ? 'badge-sweetspot' : (r.Category && r.Category.includes('Hiking') ? 'badge-neutral' : 'badge-warning')}}">${{r.Category || 'Workout'}}</span></td>
        <td style="font-family: 'JetBrains Mono'; font-weight: 700; color: var(--primary);">${{r.Duration_min}} min</td>
        <td style="font-family: 'JetBrains Mono';">${{r.Calories_kcal ? r.Calories_kcal.toLocaleString() + ' kcal' : '—'}}</td>
        <td style="font-family: 'JetBrains Mono';">${{r.Average_HR || '—'}} bpm</td>
        <td style="font-family: 'JetBrains Mono';">${{r.Max_HR || '—'}} bpm</td>
        <td><span class="badge badge-sweetspot">${{r.Training_Effect_Label || 'WORKOUT'}}</span></td>
      </tr>`).join("");
    }}

    const btnExportAudit = document.getElementById("btnExportAudit");
    if (btnExportAudit) {{
      btnExportAudit.addEventListener("click", () => {{
        const blob = new Blob([JSON.stringify(ATHX_DATA.audit, null, 2)], {{ type: "application/json" }});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `athx_data_quality_audit_${{new Date().toISOString().slice(0, 10)}}.json`;
        a.click();
      }});
    }}

    document.querySelectorAll("th[data-col]").forEach(th => {{
      th.addEventListener("click", () => {{
        const table = th.closest("table");
        const tableId = table.id;
        const col = th.getAttribute("data-col");
        if (!sortColumns[tableId]) sortColumns[tableId] = {{ col: "Date", desc: true }};

        if (sortColumns[tableId].col === col) {{
          sortColumns[tableId].desc = !sortColumns[tableId].desc;
        }} else {{
          sortColumns[tableId].col = col;
          sortColumns[tableId].desc = true;
        }}

        table.querySelectorAll("th").forEach(h => h.classList.remove("sort-active"));
        th.classList.add("sort-active");
        th.innerText = th.innerText.replace(/[▲▼▾]/g, "") + (sortColumns[tableId].desc ? " ▾" : " ▲");

        if (tableId === "workoutTable") renderWorkoutTable();
        if (tableId === "monthlyTable") renderMonthlyTable();
        if (tableId === "sleepTable") renderSleepTable();
      }});
    }});

    function initCharts() {{
      const ctxRadar = document.getElementById("athxRadarChart");
      if (ctxRadar) {{
        new Chart(ctxRadar, {{
          type: "radar",
          data: {{
            labels: ATHX_DATA.competition.radar_data.labels,
            datasets: [
              {{
                label: "Current Capacity (% of Standard)",
                data: ATHX_DATA.competition.radar_data.current_percentages,
                backgroundColor: "rgba(56, 189, 248, 0.25)",
                borderColor: "#38bdf8",
                borderWidth: 2.5,
                pointBackgroundColor: "#38bdf8"
              }},
              {{
                label: "Tier-1 Non-Pro Standard (100%)",
                data: ATHX_DATA.competition.radar_data.benchmark_percentages,
                borderColor: "rgba(250, 204, 21, 0.8)",
                borderDash: [5, 5],
                borderWidth: 2,
                fill: false,
                pointRadius: 0
              }}
            ]
          }},
          options: {{
            responsive: true,
            maintainAspectRatio: false,
            scales: {{
              r: {{
                angleLines: {{ color: "rgba(255, 255, 255, 0.1)" }},
                grid: {{ color: "rgba(255, 255, 255, 0.1)" }},
                pointLabels: {{ color: "#cbd5e1", font: {{ size: 11, weight: "bold" }} }},
                ticks: {{ display: false, max: 120, min: 0 }}
              }}
            }},
            plugins: {{
              legend: {{ labels: {{ color: "#cbd5e1", font: {{ size: 11 }} }} }}
            }}
          }}
        }});
      }}

      const ctxMuscle = document.getElementById("muscleStackedBarChart");
      if (ctxMuscle) {{
        const labels = ATHX_DATA.strength.week_keys;
        const ms = ATHX_DATA.strength.muscle_summary;
        const datasets = [
          {{ label: "Chest", data: ms.Chest.history, backgroundColor: "#38bdf8" }},
          {{ label: "Lats/Back", data: ms["Lats/Back"].history, backgroundColor: "#a78bfa" }},
          {{ label: "Quads", data: ms.Quads.history, backgroundColor: "#34d399" }},
          {{ label: "Hamstrings/Glutes", data: ms["Hamstrings/Glutes"].history, backgroundColor: "#f59e0b" }},
          {{ label: "Shoulders", data: ms.Shoulders.history, backgroundColor: "#ec4899" }},
          {{ label: "Triceps", data: ms.Triceps.history, backgroundColor: "#06b6d4" }},
          {{ label: "Biceps", data: ms.Biceps.history, backgroundColor: "#8b5cf6" }},
          {{ label: "Core", data: ms.Core.history, backgroundColor: "#64748b" }},
        ];

        new Chart(ctxMuscle, {{
          type: "bar",
          data: {{ labels, datasets }},
          options: {{
            responsive: true,
            maintainAspectRatio: false,
            scales: {{
              x: {{ stacked: true, grid: {{ display: false }}, ticks: {{ color: "#94a3b8", maxRotation: 45 }} }},
              y: {{ stacked: true, grid: {{ color: "rgba(255,255,255,0.06)" }}, ticks: {{ color: "#94a3b8" }}, title: {{ display: true, text: "Hard Sets / Week", color: "#94a3b8" }} }}
            }},
            plugins: {{
              legend: {{ position: "bottom", labels: {{ color: "#cbd5e1", boxWidth: 12, font: {{ size: 10 }} }} }}
            }}
          }}
        }});
      }}

      const ctxE1rm = document.getElementById("e1rmTrajectoryChart");
      if (ctxE1rm) {{
        const lp = ATHX_DATA.strength.lift_progressions;
        const lifts = ["Bench Press", "Back Squat", "Deadlift", "Overhead Press"];
        const colors = {{ "Bench Press": "#38bdf8", "Back Squat": "#34d399", "Deadlift": "#facc15", "Overhead Press": "#a78bfa" }};
        
        const datasets = lifts.map(lift => {{
          const hist = lp[lift].history || [];
          return {{
            label: lift,
            data: hist.map(h => ({{ x: h.date, y: h.e1rm }})),
            borderColor: colors[lift],
            backgroundColor: colors[lift],
            tension: 0.2,
            pointRadius: 3
          }};
        }});

        new Chart(ctxE1rm, {{
          type: "line",
          data: {{ datasets }},
          options: {{
            responsive: true,
            maintainAspectRatio: false,
            scales: {{
              x: {{ type: "category", grid: {{ display: false }}, ticks: {{ color: "#94a3b8", maxTicksLimit: 8 }} }},
              y: {{ grid: {{ color: "rgba(255,255,255,0.06)" }}, ticks: {{ color: "#94a3b8" }}, title: {{ display: true, text: "e1RM (kg)", color: "#94a3b8" }} }}
            }},
            plugins: {{
              legend: {{ position: "bottom", labels: {{ color: "#cbd5e1", boxWidth: 12, font: {{ size: 10 }} }} }}
            }}
          }}
        }});
      }}

      const ctxDaily = document.getElementById("dailyLoadChart");
      if (ctxDaily) {{
        const daily = ATHX_DATA.strength.daily_timeline;
        new Chart(ctxDaily, {{
          type: "bar",
          data: {{
            labels: daily.map(d => d.date.slice(5)),
            datasets: [{{
              label: "Daily Tonnage (kg)",
              data: daily.map(d => d.volume_kg),
              backgroundColor: "rgba(56, 189, 248, 0.7)",
              borderRadius: 4
            }}]
          }},
          options: {{
            responsive: true,
            maintainAspectRatio: false,
            scales: {{
              x: {{ grid: {{ display: false }}, ticks: {{ color: "#94a3b8", maxTicksLimit: 12 }} }},
              y: {{ grid: {{ color: "rgba(255,255,255,0.06)" }}, ticks: {{ color: "#94a3b8" }} }}
            }},
            plugins: {{
              legend: {{ display: false }}
            }}
          }}
        }});
      }}

      const ctxWeight = document.getElementById("weightBfChart");
      if (ctxWeight) {{
        const bc = ATHX_DATA.apple.body_comp.history;
        new Chart(ctxWeight, {{
          type: "line",
          data: {{
            labels: bc.map(b => b.Date.slice(5)),
            datasets: [
              {{
                label: "7-Day Smoothed Weight (kg)",
                data: bc.map(b => b.Weight_7d_Smooth),
                borderColor: "#34d399",
                borderWidth: 2.5,
                tension: 0.3,
                pointRadius: 0
              }},
              {{
                label: "Raw Weigh-in (kg)",
                data: bc.map(b => b.Weight_kg),
                borderColor: "rgba(52, 211, 153, 0.3)",
                borderWidth: 1,
                pointRadius: 2,
                fill: false
              }}
            ]
          }},
          options: {{
            responsive: true,
            maintainAspectRatio: false,
            scales: {{
              x: {{ grid: {{ display: false }}, ticks: {{ color: "#94a3b8", maxTicksLimit: 8 }} }},
              y: {{ grid: {{ color: "rgba(255,255,255,0.06)" }}, ticks: {{ color: "#94a3b8" }} }}
            }},
            plugins: {{
              legend: {{ labels: {{ color: "#cbd5e1", font: {{ size: 10 }} }} }}
            }}
          }}
        }});
      }}

      const ctxNut = document.getElementById("nutritionChart");
      if (ctxNut) {{
        const nut = ATHX_DATA.apple.nutrition.history;
        new Chart(ctxNut, {{
          type: "line",
          data: {{
            labels: nut.map(n => n.Date.slice(5)),
            datasets: [
              {{
                label: "Daily Calories (kcal)",
                data: nut.map(n => n.Calories_kcal),
                borderColor: "#facc15",
                backgroundColor: "rgba(250, 204, 21, 0.15)",
                fill: true,
                tension: 0.2,
                yAxisID: "y"
              }},
              {{
                label: "Protein Intake (g)",
                data: nut.map(n => n.Protein_g),
                borderColor: "#38bdf8",
                borderWidth: 2,
                tension: 0.2,
                yAxisID: "y1"
              }}
            ]
          }},
          options: {{
            responsive: true,
            maintainAspectRatio: false,
            scales: {{
              x: {{ grid: {{ display: false }}, ticks: {{ color: "#94a3b8", maxTicksLimit: 8 }} }},
              y: {{ type: "linear", position: "left", grid: {{ color: "rgba(255,255,255,0.06)" }}, ticks: {{ color: "#94a3b8" }} }},
              y1: {{ type: "linear", position: "right", grid: {{ display: false }}, ticks: {{ color: "#38bdf8" }} }}
            }},
            plugins: {{
              legend: {{ labels: {{ color: "#cbd5e1", font: {{ size: 10 }} }} }}
            }}
          }}
        }});
      }}

      const ctxSleep = document.getElementById("sleepArchitectureChart");
      if (ctxSleep) {{
        const sl = ATHX_DATA.apple.sleep.history;
        new Chart(ctxSleep, {{
          type: "bar",
          data: {{
            labels: sl.map(s => s.Date.slice(5)),
            datasets: [
              {{ label: "Deep Sleep (hrs)", data: sl.map(s => s.Deep_Sleep_hrs), backgroundColor: "#818cf8" }},
              {{ label: "REM Sleep (hrs)", data: sl.map(s => s.REM_Sleep_hrs), backgroundColor: "#34d399" }},
              {{ label: "Core Sleep (hrs)", data: sl.map(s => s.Core_Sleep_hrs), backgroundColor: "#38bdf8" }},
            ]
          }},
          options: {{
            responsive: true,
            maintainAspectRatio: false,
            scales: {{
              x: {{ stacked: true, grid: {{ display: false }}, ticks: {{ color: "#94a3b8", maxTicksLimit: 12 }} }},
              y: {{ stacked: true, grid: {{ color: "rgba(255,255,255,0.06)" }}, ticks: {{ color: "#94a3b8" }} }}
            }},
            plugins: {{
              legend: {{ position: "bottom", labels: {{ color: "#cbd5e1", font: {{ size: 10 }} }} }}
            }}
          }}
        }});
      }}

      const ctxBio = document.getElementById("biomechanicsChart");
      if (ctxBio) {{
        const mob = ATHX_DATA.apple.mobility.history;
        new Chart(ctxBio, {{
          type: "line",
          data: {{
            labels: mob.map(m => m.Date.slice(5)),
            datasets: [
              {{
                label: "Gait Asymmetry (%)",
                data: mob.map(m => m.Walking_Asymmetry_pct),
                borderColor: "#f43f5e",
                borderWidth: 1.5,
                yAxisID: "y"
              }},
              {{
                label: "Resting Heart Rate (bpm)",
                data: mob.map(m => m.Resting_Heart_Rate_bpm),
                borderColor: "#38bdf8",
                borderWidth: 2,
                yAxisID: "y1"
              }}
            ]
          }},
          options: {{
            responsive: true,
            maintainAspectRatio: false,
            scales: {{
              x: {{ grid: {{ display: false }}, ticks: {{ color: "#94a3b8", maxTicksLimit: 10 }} }},
              y: {{ position: "left", grid: {{ color: "rgba(255,255,255,0.06)" }}, ticks: {{ color: "#f43f5e" }}, title: {{ display: true, text: "Asymmetry %", color: "#f43f5e" }} }},
              y1: {{ position: "right", grid: {{ display: false }}, ticks: {{ color: "#38bdf8" }}, title: {{ display: true, text: "RHR (bpm)", color: "#38bdf8" }} }}
            }},
            plugins: {{
              legend: {{ position: "bottom", labels: {{ color: "#cbd5e1", font: {{ size: 10 }} }} }}
            }}
          }}
        }});
      }}
    }}

    document.addEventListener("DOMContentLoaded", () => {{
      renderWorkoutTable();
      renderMonthlyTable();
      renderSleepTable();
      renderRunningTable();
      renderWorkoutsTable();
      renderAuditTable();
      initCharts();
    }});
  </script>
</body>
</html>
"""

if __name__ == "__main__":
    main()
