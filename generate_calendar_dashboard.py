import json
import os
import sys
from datetime import datetime, timedelta, date
from pathlib import Path
from zoneinfo import ZoneInfo

from unified_calendar import (
    get_unified_events,
    find_unified_free_slots,
    detect_training_clashes,
    calculate_deep_work_blocks
)
from macro_orchestrator import (
    init_or_load_inventory,
    get_daily_macro_targets,
    generate_aisle_grocery_list,
    get_apple_reminders_export_text
)
from meeting_intelligence import (
    load_biological_readiness,
    classify_event,
    generate_morning_standup
)

LOCAL_TZ = ZoneInfo("Europe/Paris")
BASE_DIR = Path(__file__).resolve().parent

def build_dashboard():
    now = datetime.now(LOCAL_TZ)
    start_dt = (now - timedelta(days=14)).replace(hour=0, minute=0, second=0)
    end_dt = (now + timedelta(days=28)).replace(hour=23, minute=59, second=59)

    print("Fetching unified events across all calendars...")
    events = get_unified_events(start_dt, end_dt)
    
    # Enrich and serialize events for JavaScript
    json_events = []
    for ev in events:
        s = ev["start"]
        e = ev["end"]
        intel = classify_event(ev["summary"], ev.get("source", ""))
        json_events.append({
            "source": ev["source"],
            "summary": ev["summary"],
            "start": s.isoformat(),
            "end": e.isoformat(),
            "date": s.strftime("%Y-%m-%d"),
            "startTime": s.strftime("%H:%M"),
            "endTime": e.strftime("%H:%M"),
            "durationMin": int((e - s).total_seconds() // 60),
            "location": ev.get("location", ""),
            "isAllDay": ev.get("is_all_day", False),
            "intel": intel
        })

    # Compute free slots for today, tomorrow, and surrounding days
    free_slots_data = {}
    for d_offset in range(-2, 14):
        cur_d = (now + timedelta(days=d_offset)).date()
        slots = find_unified_free_slots(cur_d, min_minutes=45, preloaded_events=events)
        free_slots_data[cur_d.strftime("%Y-%m-%d")] = [
            {
                "start": s.strftime("%H:%M"),
                "end": e.strftime("%H:%M"),
                "durationMin": int((e - s).total_seconds() // 60)
            }
            for s, e in slots
        ]

    # Compute Pillar 3: Routine Armor & Deep Work
    clashes = detect_training_clashes(events)
    deep_work = calculate_deep_work_blocks(events, now.date())

    # Compute Pillar 1: Standup & Biological Readiness
    standup = generate_morning_standup(events)

    # Compute Pillar 2: Macro-to-Cart & Fridge Inventory
    inventory = init_or_load_inventory()
    macro_targets = get_daily_macro_targets(now.weekday())
    aisles = generate_aisle_grocery_list(inventory)
    apple_reminders_text = get_apple_reminders_export_text(inventory)

    events_json_str = json.dumps(json_events, ensure_ascii=False)
    free_slots_json_str = json.dumps(free_slots_data, ensure_ascii=False)
    clashes_json_str = json.dumps(clashes, ensure_ascii=False)
    deep_work_json_str = json.dumps(deep_work, ensure_ascii=False)
    standup_json_str = json.dumps(standup, ensure_ascii=False)
    inventory_json_str = json.dumps(inventory, ensure_ascii=False)
    macro_targets_json_str = json.dumps(macro_targets, ensure_ascii=False)
    aisles_json_str = json.dumps(aisles, ensure_ascii=False)
    apple_reminders_json_str = json.dumps(apple_reminders_text, ensure_ascii=False)
    today_str = now.strftime("%Y-%m-%d")

    html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARTEFACT • Executive Multi-Calendar & Fueling OS (V2)</title>
    <!-- Artefact Brand Typography: IBM Plex Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-base: #080c1a;
            --bg-surface: #0d1634;
            --bg-surface-elevated: #131f47;
            --bg-card: rgba(19, 31, 71, 0.7);
            --border-color: rgba(39, 50, 117, 0.5);
            --border-hover: rgba(255, 0, 102, 0.4);
            
            /* Artefact Signature Brand Palette */
            --artefact-pink: #ff0066;
            --artefact-pink-glow: rgba(255, 0, 102, 0.25);
            --artefact-blue: #1f65ff;
            --artefact-navy: #0d1634;
            --artefact-dark-blue: #273275;
            
            /* Category Accents */
            --col-work: #1f65ff;
            --col-work-bg: rgba(31, 101, 255, 0.15);
            --col-personal: #10b981;
            --col-personal-bg: rgba(16, 185, 129, 0.15);
            --col-client: #f59e0b;
            --col-client-bg: rgba(245, 158, 11, 0.15);
            --col-training: #ff0066;
            --col-training-bg: rgba(255, 0, 102, 0.15);
            --col-free: #06b6d4;
            --col-free-bg: rgba(6, 182, 212, 0.12);
            --col-macro: #8b5cf6;
            --col-macro-bg: rgba(139, 92, 246, 0.15);

            --text-primary: #ffffff;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            background: var(--bg-base);
            color: var(--text-primary);
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
        }}

        /* Header & Main Nav */
        header {{
            background: rgba(13, 22, 52, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 100;
            padding: 0.85rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
        }}

        .brand-container {{
            display: flex;
            align-items: center;
            gap: 1.25rem;
        }}

        .brand-logo {{
            font-weight: 700;
            font-size: 1.35rem;
            letter-spacing: -0.02em;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }}

        .brand-logo .dot {{
            width: 8px;
            height: 8px;
            background: var(--artefact-pink);
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 10px var(--artefact-pink);
        }}

        .brand-tag {{
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            color: var(--artefact-blue);
            text-transform: uppercase;
            padding: 0.25rem 0.6rem;
            background: rgba(31, 101, 255, 0.12);
            border: 1px solid rgba(31, 101, 255, 0.3);
            border-radius: 4px;
        }}

        .nav-controls {{
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
        }}

        .top-mode-tabs {{
            display: flex;
            background: rgba(8, 12, 26, 0.6);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.25rem;
            gap: 0.25rem;
        }}

        .mode-tab-btn {{
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 0.85rem;
            font-weight: 600;
            padding: 0.45rem 0.95rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }}

        .mode-tab-btn:hover {{
            color: #ffffff;
            background: rgba(255, 255, 255, 0.05);
        }}

        .mode-tab-btn.active {{
            background: var(--artefact-pink);
            color: #ffffff;
            box-shadow: 0 0 12px var(--artefact-pink-glow);
        }}

        .date-stepper {{
            display: flex;
            align-items: center;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            overflow: hidden;
        }}

        .stepper-btn {{
            background: transparent;
            border: none;
            color: var(--text-secondary);
            padding: 0.4rem 0.75rem;
            cursor: pointer;
            transition: all 0.15s;
        }}

        .stepper-btn:hover {{
            background: var(--bg-surface-elevated);
            color: #ffffff;
        }}

        .current-date-display {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.85rem;
            font-weight: 600;
            padding: 0.4rem 0.85rem;
            border-left: 1px solid var(--border-color);
            border-right: 1px solid var(--border-color);
            min-width: 145px;
            text-align: center;
        }}

        .pill-btn {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-size: 0.8rem;
            font-weight: 500;
            padding: 0.4rem 0.85rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .pill-btn:hover {{
            border-color: var(--artefact-blue);
            background: var(--bg-surface-elevated);
        }}

        /* Main Container */
        main {{
            max-width: 1600px;
            width: 100%;
            margin: 0 auto;
            padding: 1.5rem 2rem;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }}

        /* Routine Armor Banner */
        .armor-banner {{
            background: linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(31, 101, 255, 0.08) 100%);
            border: 1px solid rgba(16, 185, 129, 0.4);
            border-radius: 8px;
            padding: 0.85rem 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }}

        .armor-banner.has-clash {{
            background: linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%);
            border-color: rgba(239, 68, 68, 0.5);
        }}

        .armor-left {{
            display: flex;
            align-items: center;
            gap: 0.85rem;
        }}

        .armor-icon {{
            font-size: 1.35rem;
        }}

        .armor-text {{
            font-size: 0.9rem;
            font-weight: 500;
        }}

        .armor-stats {{
            display: flex;
            align-items: center;
            gap: 1.25rem;
            font-size: 0.85rem;
            font-family: 'IBM Plex Mono', monospace;
        }}

        /* KPI Grid */
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 1rem;
        }}

        .kpi-card {{
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1.1rem;
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            transition: transform 0.2s, border-color 0.2s;
            position: relative;
            overflow: hidden;
        }}

        .kpi-card:hover {{
            transform: translateY(-2px);
            border-color: var(--border-hover);
        }}

        .kpi-card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
        }}

        .kpi-card.work::before {{ background: var(--col-work); }}
        .kpi-card.client::before {{ background: var(--col-client); }}
        .kpi-card.training::before {{ background: var(--col-training); }}
        .kpi-card.personal::before {{ background: var(--col-personal); }}
        .kpi-card.deep::before {{ background: #10b981; }}
        .kpi-card.macro::before {{ background: var(--col-macro); }}

        .kpi-title {{
            font-size: 0.8rem;
            color: var(--text-secondary);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
        }}

        .kpi-value {{
            font-size: 1.65rem;
            font-weight: 700;
            font-family: 'IBM Plex Mono', monospace;
            color: #ffffff;
        }}

        .kpi-subtext {{
            font-size: 0.75rem;
            color: var(--text-muted);
        }}

        /* Sub Navigation for Calendar View */
        .sub-calendar-nav {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }}

        .view-tabs {{
            display: flex;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 0.2rem;
            gap: 0.2rem;
        }}

        .tab-btn {{
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 0.82rem;
            font-weight: 500;
            padding: 0.35rem 0.85rem;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s;
        }}

        .tab-btn.active {{
            background: var(--bg-surface-elevated);
            color: #ffffff;
            font-weight: 600;
        }}

        /* Filter Toolbar */
        .toolbar {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }}

        .filter-pills {{
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }}

        .filter-pills .pill-btn {{
            display: flex;
            align-items: center;
            gap: 0.45rem;
            font-size: 0.78rem;
        }}

        .indicator {{
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
        }}

        .pill-btn.work .indicator {{ background: var(--col-work); }}
        .pill-btn.client .indicator {{ background: var(--col-client); }}
        .pill-btn.training .indicator {{ background: var(--col-training); }}
        .pill-btn.personal .indicator {{ background: var(--col-personal); }}
        .pill-btn.free .indicator {{ background: var(--col-free); }}

        .search-input {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            color: #ffffff;
            border-radius: 6px;
            padding: 0.45rem 0.85rem;
            font-size: 0.82rem;
            min-width: 260px;
            outline: none;
            transition: border-color 0.2s;
        }}

        .search-input:focus {{
            border-color: var(--artefact-blue);
        }}

        /* Main View Containers */
        .mode-container {{
            display: none;
            flex-direction: column;
            gap: 1.5rem;
        }}

        .mode-container.active {{
            display: flex;
        }}

        .view-content {{
            display: none;
        }}

        .view-content.active {{
            display: block;
        }}

        /* Day Timeline */
        .timeline-container {{
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1.25rem;
            overflow-x: auto;
        }}

        .hours-grid {{
            display: flex;
            flex-direction: column;
            position: relative;
            min-height: 850px;
        }}

        .hour-row {{
            height: 52px;
            border-top: 1px solid rgba(39, 50, 117, 0.25);
            display: flex;
            align-items: flex-start;
            position: relative;
        }}

        .hour-label {{
            width: 60px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.75rem;
            color: var(--text-muted);
            transform: translateY(-8px);
        }}

        .event-card {{
            position: absolute;
            left: 70px;
            right: 15px;
            border-radius: 6px;
            padding: 0.55rem 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            border-left: 4px solid #ffffff;
        }}

        .event-card:hover {{
            transform: translateX(3px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            z-index: 10;
        }}

        .event-card.work {{ background: var(--col-work-bg); border-left-color: var(--col-work); }}
        .event-card.client {{ background: var(--col-client-bg); border-left-color: var(--col-client); }}
        .event-card.training {{ background: var(--col-training-bg); border-left-color: var(--col-training); }}
        .event-card.personal {{ background: var(--col-personal-bg); border-left-color: var(--col-personal); }}

        .event-summary {{
            font-size: 0.85rem;
            font-weight: 600;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }}

        .event-meta {{
            font-size: 0.72rem;
            color: var(--text-secondary);
            font-family: 'IBM Plex Mono', monospace;
            margin-top: 2px;
        }}

        /* Week Grid */
        .week-grid {{
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 0.75rem;
        }}

        .day-column {{
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.85rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            min-height: 520px;
        }}

        .day-column.is-today {{
            border-color: var(--artefact-pink);
            background: rgba(255, 0, 102, 0.04);
        }}

        .day-header {{
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
        }}

        .day-name {{
            font-size: 0.85rem;
            font-weight: 600;
            color: #ffffff;
        }}

        .day-date {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.75rem;
            color: var(--text-secondary);
        }}

        .week-events-list {{
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex: 1;
        }}

        /* Pillar 1: Standup & Meeting Intelligence */
        .standup-layout {{
            display: grid;
            grid-template-columns: 1.1fr 1fr;
            gap: 1.5rem;
        }}

        .readiness-box {{
            background: linear-gradient(135deg, rgba(255, 0, 102, 0.1) 0%, rgba(31, 101, 255, 0.1) 100%);
            border: 1px solid rgba(255, 0, 102, 0.3);
            border-radius: 8px;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
        }}

        .readiness-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .readiness-score {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--artefact-pink);
        }}

        .readiness-badge {{
            padding: 0.25rem 0.65rem;
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10b981;
            color: #10b981;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }}

        .priority-radar-list {{
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }}

        .priority-item {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 0.85rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }}

        .priority-badge {{
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.2rem 0.55rem;
            border-radius: 4px;
            text-transform: uppercase;
        }}

        .priority-badge.high {{ background: rgba(239, 68, 68, 0.2); color: #ef4444; }}
        .priority-badge.non-negotiable {{ background: rgba(255, 0, 102, 0.2); color: var(--artefact-pink); }}
        .priority-badge.medium {{ background: rgba(245, 158, 11, 0.2); color: #f59e0b; }}

        /* Pillar 2: Macro-to-Cart & Fridge Hub */
        .macro-header-panel {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1.25rem;
        }}

        .macro-target-card {{
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
        }}

        .macro-progress-bar {{
            height: 8px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }}

        .macro-progress-fill {{
            height: 100%;
            background: linear-gradient(90deg, var(--col-macro) 0%, var(--artefact-pink) 100%);
            border-radius: 4px;
        }}

        .fridge-inventory-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1rem;
        }}

        .stock-card {{
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            transition: border-color 0.2s;
        }}

        .stock-card:hover {{
            border-color: var(--border-hover);
        }}

        .stock-card.low {{
            border-color: rgba(245, 158, 11, 0.5);
            background: rgba(245, 158, 11, 0.04);
        }}

        .stock-card.empty {{
            border-color: rgba(239, 68, 68, 0.5);
            background: rgba(239, 68, 68, 0.04);
        }}

        .stock-top {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }}

        .stock-title {{
            font-size: 0.9rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }}

        .stock-badge {{
            font-size: 0.7rem;
            font-weight: 600;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
        }}

        .stock-badge.ok {{ background: rgba(16, 185, 129, 0.15); color: #10b981; }}
        .stock-badge.warning {{ background: rgba(245, 158, 11, 0.15); color: #f59e0b; }}
        .stock-badge.danger {{ background: rgba(239, 68, 68, 0.15); color: #ef4444; }}

        .stock-qty {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 1.35rem;
            font-weight: 700;
        }}

        .aisle-checklist-section {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.25rem;
        }}

        .aisle-card {{
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
        }}

        .aisle-title {{
            font-size: 0.95rem;
            font-weight: 600;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
            color: #ffffff;
        }}

        .checklist-items {{
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }}

        .check-item {{
            display: flex;
            align-items: center;
            gap: 0.65rem;
            font-size: 0.85rem;
            color: var(--text-secondary);
            cursor: pointer;
            user-select: none;
        }}

        .check-item input[type="checkbox"] {{
            accent-color: var(--artefact-pink);
            cursor: pointer;
        }}

        /* Slide-over Meeting Dossier Drawer */
        .drawer-overlay {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(4px);
            z-index: 200;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
        }}

        .drawer-overlay.open {{
            opacity: 1;
            pointer-events: auto;
        }}

        .drawer-panel {{
            position: fixed;
            top: 0;
            right: -600px;
            width: 550px;
            max-width: 90vw;
            height: 100vh;
            background: #0d1634;
            border-left: 1px solid var(--border-color);
            box-shadow: -10px 0 30px rgba(0, 0, 0, 0.7);
            z-index: 201;
            transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            padding: 2rem;
            gap: 1.5rem;
        }}

        .drawer-overlay.open .drawer-panel {{
            right: 0;
        }}

        .drawer-close {{
            position: absolute;
            top: 1.25rem;
            right: 1.25rem;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
        }}

        .drawer-close:hover {{
            color: #ffffff;
        }}

        .tag-pill {{
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.25rem 0.65rem;
            border-radius: 4px;
            display: inline-block;
        }}

        .dossier-section {{
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }}

        .dossier-label {{
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            font-weight: 600;
        }}

        .dossier-box {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 0.85rem;
            font-size: 0.88rem;
            line-height: 1.5;
        }}

        .attendee-chips {{
            display: flex;
            flex-wrap: wrap;
            gap: 0.45rem;
        }}

        .attendee-chip {{
            background: var(--bg-surface-elevated);
            border: 1px solid var(--border-color);
            border-radius: 9999px;
            padding: 0.25rem 0.65rem;
            font-size: 0.78rem;
            color: #ffffff;
        }}

        .scratchpad {{
            width: 100%;
            height: 110px;
            background: var(--bg-base);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            color: #ffffff;
            padding: 0.75rem;
            font-family: inherit;
            font-size: 0.85rem;
            resize: vertical;
            outline: none;
        }}

        .scratchpad:focus {{
            border-color: var(--artefact-pink);
        }}

        .toast-notify {{
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #10b981;
            color: #ffffff;
            padding: 0.75rem 1.25rem;
            border-radius: 6px;
            font-size: 0.88rem;
            font-weight: 600;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 300;
        }}

        .toast-notify.show {{
            transform: translateY(0);
            opacity: 1;
        }}

        @media (max-width: 900px) {{
            .week-grid {{ grid-template-columns: 1fr; }}
            .standup-layout {{ grid-template-columns: 1fr; }}
            header {{ flex-direction: column; align-items: flex-start; }}
        }}
    </style>
</head>
<body>

    <!-- Header Navigation -->
    <header>
        <div class="brand-container">
            <div class="brand-logo">
                ARTEFACT<span class="dot"></span>
            </div>
            <div class="brand-tag">EXECUTIVE OS • V2</div>
        </div>

        <div class="nav-controls">
            <!-- 3 Core Mode Tabs -->
            <div class="top-mode-tabs">
                <button class="mode-tab-btn active" id="modeBtnCalendar" onclick="switchMode('calendar')">
                    📅 Calendar & Armor
                </button>
                <button class="mode-tab-btn" id="modeBtnStandup" onclick="switchMode('standup')">
                    ⚡ Standup & Meeting Dossiers
                </button>
                <button class="mode-tab-btn" id="modeBtnMacro" onclick="switchMode('macro')">
                    🛒 Macro-to-Cart & Fridge
                </button>
            </div>

            <div class="date-stepper">
                <button class="stepper-btn" onclick="shiftDate(-1)">◀</button>
                <div class="current-date-display" id="currentDateDisplay">Loading...</div>
                <button class="stepper-btn" onclick="shiftDate(1)">▶</button>
            </div>

            <button class="pill-btn" onclick="goToToday()">Today</button>
            <a href="garmin_workout.html" class="pill-btn" style="text-decoration: none; color: #ffd700; border: 1px solid rgba(255, 215, 0, 0.4); display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.82rem; font-weight: 600; background: rgba(255, 215, 0, 0.08);">🏋️ ATHX Dashboard ↗</a>
        </div>
    </header>

    <main>
        <!-- PILLAR 3: Routine Armor Clash Banner -->
        <div class="armor-banner" id="armorBanner">
            <div class="armor-left">
                <span class="armor-icon" id="armorIcon">🛡️</span>
                <span class="armor-text" id="armorText">Auditing routine armor across all calendars...</span>
            </div>
            <div class="armor-stats">
                <span>ATHX SESSIONS: <strong style="color: var(--artefact-pink);">9/9 PROTECTED</strong></span>
                <span>DEEP WORK: <strong style="color: #10b981;" id="armorDeepPct">100%</strong></span>
            </div>
        </div>

        <!-- KPI Summary Cards -->
        <div class="kpi-grid">
            <div class="kpi-card work">
                <div class="kpi-title">
                    <span>💼 Artefact Work</span>
                    <span id="kpiWorkCount">0 events</span>
                </div>
                <div class="kpi-value" id="kpiWorkHours">0.0 hrs</div>
                <div class="kpi-subtext">Internal syncs & Chapter AI</div>
            </div>

            <div class="kpi-card client">
                <div class="kpi-title">
                    <span>🏥 Clariane / Clients</span>
                    <span id="kpiClientCount">0 events</span>
                </div>
                <div class="kpi-value" id="kpiClientHours">0.0 hrs</div>
                <div class="kpi-subtext">Clariane F360, Ferrero, Crédit Agricole</div>
            </div>

            <div class="kpi-card training">
                <div class="kpi-title">
                    <span>⚡ ATHX Training</span>
                    <span id="kpiTrainingCount">0 sessions</span>
                </div>
                <div class="kpi-value" id="kpiTrainingHours" style="color: var(--artefact-pink);">0.0 hrs</div>
                <div class="kpi-subtext">4× CrossFit • 2× Gym • 3× Run</div>
            </div>

            <div class="kpi-card deep">
                <div class="kpi-title">
                    <span>🚀 Deep Work Index</span>
                    <span id="kpiDeepSlots">0 blocks</span>
                </div>
                <div class="kpi-value" id="kpiDeepHours" style="color: #10b981;">0.0 hrs</div>
                <div class="kpi-subtext">Uninterrupted ≥90min focus blocks</div>
            </div>

            <div class="kpi-card macro">
                <div class="kpi-title">
                    <span>🛒 Macro Target (Day)</span>
                    <span id="kpiMacroCal">2,750 kcal</span>
                </div>
                <div class="kpi-value" id="kpiMacroProtein" style="color: var(--col-macro);">176g PRO</div>
                <div class="kpi-subtext">Fueling ATHX 80.1kg target accretion</div>
            </div>
        </div>

        <!-- ================= MODE 1: CALENDAR & ROUTINE ARMOR ================= -->
        <div class="mode-container active" id="mode-calendar">
            <div class="sub-calendar-nav">
                <div class="view-tabs">
                    <button class="tab-btn active" onclick="switchCalendarSubView('day')">Day Timeline</button>
                    <button class="tab-btn" onclick="switchCalendarSubView('week')">Week Grid</button>
                    <button class="tab-btn" onclick="switchCalendarSubView('agenda')">Agenda List</button>
                    <button class="tab-btn" onclick="switchCalendarSubView('free')">⚡ Free Slots & Armor</button>
                </div>

                <div class="filter-pills">
                    <button class="pill-btn work active" id="filterWork" onclick="toggleFilter('work')">
                        <span class="indicator"></span> Artefact
                    </button>
                    <button class="pill-btn client active" id="filterClient" onclick="toggleFilter('client')">
                        <span class="indicator"></span> Clariane/Clients
                    </button>
                    <button class="pill-btn training active" id="filterTraining" onclick="toggleFilter('training')">
                        <span class="indicator"></span> ⚡ ATHX Training
                    </button>
                    <button class="pill-btn personal active" id="filterPersonal" onclick="toggleFilter('personal')">
                        <span class="indicator"></span> Personal
                    </button>
                    <button class="pill-btn free active" id="filterFree" onclick="toggleFilter('free')">
                        <span class="indicator"></span> Open Focus
                    </button>
                </div>

                <input type="text" class="search-input" id="eventSearch" placeholder="🔍 Search meetings, clients, workouts..." oninput="handleSearch()">
            </div>

            <!-- SUB VIEW: DAY TIMELINE -->
            <div class="view-content active" id="view-day">
                <div class="timeline-container">
                    <div class="hours-grid" id="hoursGrid">
                        <!-- Rendered dynamically -->
                    </div>
                </div>
            </div>

            <!-- SUB VIEW: WEEK GRID -->
            <div class="view-content" id="view-week">
                <div class="week-grid" id="weekGrid">
                    <!-- 7 columns rendered dynamically -->
                </div>
            </div>

            <!-- SUB VIEW: AGENDA LIST -->
            <div class="view-content" id="view-agenda">
                <div class="timeline-container" id="agendaList" style="display: flex; flex-direction: column; gap: 0.85rem;">
                    <!-- Rendered dynamically -->
                </div>
            </div>

            <!-- SUB VIEW: FREE SLOTS & ARMOR -->
            <div class="view-content" id="view-free">
                <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 1.5rem;">
                    <div class="timeline-container">
                        <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: var(--col-free);">⚡ Open Workout & Deep Focus Windows</h3>
                        <div id="freeSlotsRadar" style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <!-- Populated dynamically -->
                        </div>
                    </div>

                    <div class="timeline-container">
                        <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: #ffffff;">🛡️ Routine Armor Policy</h3>
                        <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.85rem;">
                            <p>• <strong>Morning Non-Negotiables:</strong> Mon/Wed/Fri (06:30-07:30 CrossFit) and Tue/Thu (06:30-07:25 Gym Squats/Deadlifts) are protected from incoming work calls.</p>
                            <p>• <strong>Evening Aerobic Windows:</strong> Wed/Fri (18:30 Running Base & Threshold Intervals) are locked for post-office flush.</p>
                            <p>• <strong>Deep Work Quotas:</strong> Any gap ≥90 min is isolated as high-focus time for agentic engineering, BigQuery marts, and slides generation.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ================= MODE 2: STANDUP & MEETING DOSSIERS ================= -->
        <div class="mode-container" id="mode-standup">
            <div class="standup-layout">
                <!-- Left: Biological Readiness & Priorities -->
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div class="readiness-box">
                        <div class="readiness-header">
                            <div>
                                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">ATHX BIOLOGICAL TELEMETRY</div>
                                <h3 style="font-size: 1.2rem; color: #ffffff; margin-top: 0.2rem;" id="readinessVerdictTitle">Optimal Adaptation Band</h3>
                            </div>
                            <span class="readiness-badge" id="readinessScoreBadge">96.9% READY</span>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;" id="readinessDesc">
                            Biological recovery bandwidth is adequate to support high cognitive work and lower-body training density.
                        </p>
                        <div style="display: flex; gap: 1.5rem; font-family: 'IBM Plex Mono', monospace; font-size: 0.82rem; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 0.75rem;">
                            <span>SLEEP: <strong style="color: #ffffff;" id="readinessSleep">7.0 hrs</strong></span>
                            <span>ACWR: <strong style="color: #10b981;" id="readinessAcwr">1.14 (Sweet Spot)</strong></span>
                            <span>MONOTONY: <strong style="color: #ffffff;">0.82</strong></span>
                        </div>
                    </div>

                    <div class="timeline-container">
                        <h3 style="font-size: 1.05rem; margin-bottom: 0.85rem; color: #ffffff;">🎯 Active Client Priority Radar</h3>
                        <div class="priority-radar-list" id="priorityRadarList">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>

                <!-- Right: Today's Meetings & Quick Dossiers -->
                <div class="timeline-container">
                    <h3 style="font-size: 1.05rem; margin-bottom: 0.85rem; color: #ffffff;">📋 Today's Meetings & Executive Dossiers</h3>
                    <div id="standupMeetingList" style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <!-- Populated dynamically -->
                    </div>
                </div>
            </div>
        </div>

        <!-- ================= MODE 3: MACRO-TO-CART & FRIDGE HUB ================= -->
        <div class="mode-container" id="mode-macro">
            <!-- Training Demand Header -->
            <div class="macro-header-panel">
                <div class="macro-target-card">
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">TODAY'S FUELING PROFILE</div>
                    <div style="font-size: 1.15rem; font-weight: 700; color: #ffffff;" id="macroDayType">Lower/Upper Strength Day</div>
                    <div style="font-size: 0.82rem; color: var(--text-secondary);" id="macroFuelingWindow">Post-workout high protein pulse (45g) + Leucine threshold</div>
                </div>

                <div class="macro-target-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">CALORIES TARGET</span>
                        <span style="font-family: 'IBM Plex Mono', monospace; font-weight: 700; color: #ffffff;" id="macroCalTarget">2,750 kcal</span>
                    </div>
                    <div class="macro-progress-bar">
                        <div class="macro-progress-fill" style="width: 78%;"></div>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Caloric surplus for +0.22 kg/wk lean accretion</div>
                </div>

                <div class="macro-target-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">PROTEIN TARGET (2.2g/kg)</span>
                        <span style="font-family: 'IBM Plex Mono', monospace; font-weight: 700; color: var(--col-macro);" id="macroProTarget">176 g</span>
                    </div>
                    <div class="macro-progress-bar">
                        <div class="macro-progress-fill" style="width: 82%; background: var(--col-macro);"></div>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">80.1 kg bodyweight • Target 85.0 kg competition</div>
                </div>

                <div class="macro-target-card" style="justify-content: center; align-items: flex-start;">
                    <button class="action-btn" onclick="copyAppleReminders()" style="margin-top: 0; width: 100%; justify-content: center;">
                        📋 Copy to Apple Reminders
                    </button>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.4rem; text-align: center; width: 100%;">
                        Grouped by supermarket aisle • Intermarché 26-Oct
                    </div>
                </div>
            </div>

            <!-- Fridge & Stock Inventory (Intermarché Seed) -->
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
                    <div>
                        <h3 style="font-size: 1.15rem; color: #ffffff;">🧊 Live Fridge & Pantry Stock</h3>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Seeded from Intermarché Drive ticket (26-Oct-2026 • 193.94 € • Paris 19e)</div>
                    </div>
                </div>

                <div class="fridge-inventory-grid" id="fridgeGrid">
                    <!-- Populated dynamically -->
                </div>
            </div>

            <!-- Aisle-by-Aisle Grocery Checklist -->
            <div>
                <h3 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 0.85rem;">🛒 Supermarket Aisle Checklist</h3>
                <div class="aisle-checklist-section" id="aisleChecklistSection">
                    <!-- Populated dynamically -->
                </div>
            </div>
        </div>
    </main>

    <!-- Slide-over Meeting Dossier Drawer (Pillars 1 & 3) -->
    <div class="drawer-overlay" id="drawerOverlay" onclick="closeDrawer()">
        <div class="drawer-panel" onclick="event.stopPropagation()">
            <button class="drawer-close" onclick="closeDrawer()">&times;</button>
            
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                <div id="drawerClientBadge"></div>
                <h2 id="drawerTitle" style="font-size: 1.35rem; color: #ffffff; margin-top: 0.25rem;"></h2>
                <div id="drawerTime" style="font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; color: var(--artefact-pink);"></div>
            </div>

            <div class="dossier-section">
                <div class="dossier-label">🎯 Expected Outcome & Mission Objective</div>
                <div class="dossier-box" id="drawerOutcome"></div>
            </div>

            <div class="dossier-section">
                <div class="dossier-label">👥 Attendees & Roles</div>
                <div class="attendee-chips" id="drawerAttendees"></div>
            </div>

            <div class="dossier-section">
                <div class="dossier-label">💬 Key Talking Points & Topics</div>
                <div class="dossier-box" style="padding: 0.5rem 0.85rem;">
                    <ul id="drawerTalkingPoints" style="padding-left: 1.25rem; font-size: 0.85rem; line-height: 1.6;"></ul>
                </div>
            </div>

            <div class="dossier-section">
                <div class="dossier-label">✅ Deliverables Checklist</div>
                <div class="dossier-box" style="padding: 0.5rem 0.85rem;">
                    <ul id="drawerDeliverables" style="padding-left: 1.25rem; font-size: 0.85rem; line-height: 1.6;"></ul>
                </div>
            </div>

            <div class="dossier-section">
                <div class="dossier-label">📝 Ayrton's Quick Notes (Saved Locally)</div>
                <textarea class="scratchpad" id="drawerNotes" placeholder="Type quick notes, action items, or decisions taken..." oninput="saveEventNotes()"></textarea>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-notify" id="toastNotify">Copied to Apple Reminders!</div>

    <!-- Embedded Dynamic JSON Data -->
    <script>
        const RAW_EVENTS = {events_json_str};
        const FREE_SLOTS = {free_slots_json_str};
        const CLASHES = {clashes_json_str};
        const DEEP_WORK = {deep_work_json_str};
        const STANDUP = {standup_json_str};
        const INVENTORY = {inventory_json_str};
        const MACRO_TARGETS = {macro_targets_json_str};
        const AISLES = {aisles_json_str};
        const APPLE_REMINDERS_TEXT = {apple_reminders_json_str};

        let currentDate = "{today_str}";
        let currentMode = "calendar";
        let currentCalendarSubView = "day";
        let searchQuery = "";
        let currentOpenEventId = null;

        const filters = {{
            work: true,
            client: true,
            training: true,
            personal: true,
            free: true
        }};

        // Mode Navigation
        function switchMode(mode) {{
            currentMode = mode;
            document.querySelectorAll('.mode-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.mode-container').forEach(c => c.classList.remove('active'));

            if (mode === 'calendar') {{
                document.getElementById('modeBtnCalendar').classList.add('active');
                document.getElementById('mode-calendar').classList.add('active');
            }} else if (mode === 'standup') {{
                document.getElementById('modeBtnStandup').classList.add('active');
                document.getElementById('mode-standup').classList.add('active');
                renderStandupView();
            }} else if (mode === 'macro') {{
                document.getElementById('modeBtnMacro').classList.add('active');
                document.getElementById('mode-macro').classList.add('active');
                renderMacroView();
            }}
        }}

        function switchCalendarSubView(view) {{
            currentCalendarSubView = view;
            document.querySelectorAll('.sub-calendar-nav .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('#mode-calendar .view-content').forEach(c => c.classList.remove('active'));

            const targetBtn = Array.from(document.querySelectorAll('.sub-calendar-nav .tab-btn')).find(b => b.textContent.toLowerCase().includes(view));
            if (targetBtn) targetBtn.classList.add('active');

            const viewEl = document.getElementById('view-' + view);
            if (viewEl) viewEl.classList.add('active');

            renderCalendar();
        }}

        function parseEventSource(src) {{
            if (src.includes("Training") || src.includes("ATHX")) return "training";
            if (src.includes("Artefact")) return "work";
            if (src.includes("Clariane")) return "client";
            if (src.includes("Personal") || src.includes("Ma vie")) return "personal";
            return "work";
        }}

        function getEventsForDate(dateStr) {{
            return RAW_EVENTS.filter(e => {{
                if (e.date !== dateStr) return false;
                const cat = parseEventSource(e.source);
                if (!filters[cat]) return false;
                if (searchQuery) {{
                    const q = searchQuery.toLowerCase();
                    return e.summary.toLowerCase().includes(q) || (e.location && e.location.toLowerCase().includes(q));
                }}
                return true;
            }});
        }}

        // Render Calendar
        function renderCalendar() {{
            document.getElementById('currentDateDisplay').textContent = currentDate;
            updateKPIs();
            updateArmorBanner();

            if (currentCalendarSubView === 'day') renderDayView();
            else if (currentCalendarSubView === 'week') renderWeekView();
            else if (currentCalendarSubView === 'agenda') renderAgendaView();
            else if (currentCalendarSubView === 'free') renderFreeView();
        }}

        function updateArmorBanner() {{
            const banner = document.getElementById('armorBanner');
            const icon = document.getElementById('armorIcon');
            const text = document.getElementById('armorText');
            const deepPct = document.getElementById('armorDeepPct');

            deepPct.textContent = (DEEP_WORK.focus_quotient_percent || 100) + "%";

            if (CLASHES && CLASHES.length > 0) {{
                banner.classList.add('has-clash');
                icon.textContent = "⚠️";
                text.innerHTML = `<strong>Attention Clash Détecté :</strong> ${{CLASHES.length}} conflit(s) entre séance ATHX et réunion client.`;
            }} else {{
                banner.classList.remove('has-clash');
                icon.textContent = "🛡️";
                text.innerHTML = `<strong>Routine Armor Active :</strong> Les 9 séances de ton microcycle d'entraînement sont 100% sanctuarisées.`;
            }}
        }}

        function updateKPIs() {{
            const dayEvents = getEventsForDate(currentDate);
            let workCount = 0, workMins = 0;
            let clientCount = 0, clientMins = 0;
            let trainCount = 0, trainMins = 0;

            dayEvents.forEach(e => {{
                const cat = parseEventSource(e.source);
                if (cat === 'work') {{ workCount++; workMins += e.durationMin; }}
                else if (cat === 'client') {{ clientCount++; clientMins += e.durationMin; }}
                else if (cat === 'training') {{ trainCount++; trainMins += e.durationMin; }}
            }});

            document.getElementById('kpiWorkCount').textContent = `${{workCount}} events`;
            document.getElementById('kpiWorkHours').textContent = `${{(workMins/60).toFixed(1)}} hrs`;

            document.getElementById('kpiClientCount').textContent = `${{clientCount}} events`;
            document.getElementById('kpiClientHours').textContent = `${{(clientMins/60).toFixed(1)}} hrs`;

            document.getElementById('kpiTrainingCount').textContent = `${{trainCount}} sessions`;
            document.getElementById('kpiTrainingHours').textContent = `${{(trainMins/60).toFixed(1)}} hrs`;

            const deepBlocks = DEEP_WORK.blocks || [];
            document.getElementById('kpiDeepSlots').textContent = `${{deepBlocks.length}} blocks`;
            document.getElementById('kpiDeepHours').textContent = `${{((DEEP_WORK.total_deep_work_minutes || 0)/60).toFixed(1)}} hrs`;
        }}

        function renderDayView() {{
            const grid = document.getElementById('hoursGrid');
            grid.innerHTML = '';
            const dayEvents = getEventsForDate(currentDate);

            // Render hourly grid from 06:00 to 22:00
            for (let h = 6; h <= 22; h++) {{
                const row = document.createElement('div');
                row.className = 'hour-row';
                const label = document.createElement('div');
                label.className = 'hour-label';
                label.textContent = String(h).padStart(2, '0') + ':00';
                row.appendChild(label);
                grid.appendChild(row);
            }}

            // Render event cards
            dayEvents.forEach(ev => {{
                if (ev.isAllDay) return;
                const [sh, sm] = ev.startTime.split(':').map(Number);
                const [eh, em] = ev.endTime.split(':').map(Number);
                
                const startMinFrom6 = (sh - 6) * 60 + sm;
                const topPx = (startMinFrom6 / 60) * 52;
                const heightPx = Math.max(34, (ev.durationMin / 60) * 52);

                const card = document.createElement('div');
                const cat = parseEventSource(ev.source);
                card.className = `event-card ${{cat}}`;
                card.style.top = topPx + 'px';
                card.style.height = heightPx + 'px';
                card.onclick = () => openDrawer(ev);

                card.innerHTML = `
                    <div class="event-summary">${{ev.summary}}</div>
                    <div class="event-meta">${{ev.startTime}} - ${{ev.endTime}} (${{ev.durationMin}}m) • ${{ev.intel.client_badge || ev.source}}</div>
                `;
                grid.appendChild(card);
            }});
        }}

        function renderWeekView() {{
            const grid = document.getElementById('weekGrid');
            grid.innerHTML = '';

            const curr = new Date(currentDate);
            const dayOfWeek = curr.getDay(); // 0 is Sun
            const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
            const monday = new Date(curr);
            monday.setDate(curr.getDate() + diffToMon);

            for (let i = 0; i < 7; i++) {{
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                const dStr = d.toISOString().split('T')[0];
                const dayName = d.toLocaleDateString('fr-FR', {{ weekday: 'short' }});

                const col = document.createElement('div');
                col.className = 'day-column' + (dStr === currentDate ? ' is-today' : '');
                
                col.innerHTML = `
                    <div class="day-header">
                        <div class="day-name">${{dayName.toUpperCase()}}</div>
                        <div class="day-date">${{d.toLocaleDateString('fr-FR', {{ day: 'numeric', month: 'short' }})}}</div>
                    </div>
                    <div class="week-events-list" id="week-events-${{dStr}}"></div>
                `;
                grid.appendChild(col);

                const listEl = col.querySelector(`#week-events-${{dStr}}`);
                const evs = getEventsForDate(dStr);
                evs.forEach(ev => {{
                    const card = document.createElement('div');
                    const cat = parseEventSource(ev.source);
                    card.className = `event-card ${{cat}}`;
                    card.style.position = 'relative';
                    card.style.left = '0';
                    card.style.right = '0';
                    card.style.height = 'auto';
                    card.onclick = () => openDrawer(ev);
                    card.innerHTML = `
                        <div class="event-summary" style="font-size: 0.78rem;">${{ev.summary}}</div>
                        <div class="event-meta" style="font-size: 0.68rem;">${{ev.startTime}} - ${{ev.endTime}}</div>
                    `;
                    listEl.appendChild(card);
                }});
            }}
        }}

        function renderAgendaView() {{
            const list = document.getElementById('agendaList');
            list.innerHTML = '';
            const evs = getEventsForDate(currentDate);
            if (evs.length === 0) {{
                list.innerHTML = '<div style="color: var(--text-muted); padding: 2rem; text-align: center;">Aucun événement programmé pour cette journée.</div>';
                return;
            }}

            evs.forEach(ev => {{
                const item = document.createElement('div');
                const cat = parseEventSource(ev.source);
                item.className = `event-card ${{cat}}`;
                item.style.position = 'relative';
                item.style.left = '0';
                item.style.right = '0';
                item.style.height = 'auto';
                item.onclick = () => openDrawer(ev);
                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="event-summary" style="font-size: 0.95rem;">${{ev.summary}}</span>
                        <span class="tag-pill" style="background: rgba(255, 255, 255, 0.1); color: #fff;">${{ev.intel.client_badge || ev.source}}</span>
                    </div>
                    <div class="event-meta" style="font-size: 0.8rem; margin-top: 0.35rem;">
                        ⏰ ${{ev.startTime}} - ${{ev.endTime}} (${{ev.durationMin}} min) ${{ev.location ? '• 📍 ' + ev.location : ''}}
                    </div>
                `;
                list.appendChild(item);
            }});
        }}

        function renderFreeView() {{
            const container = document.getElementById('freeSlotsRadar');
            container.innerHTML = '';
            const slots = FREE_SLOTS[currentDate] || [];

            if (slots.length === 0) {{
                container.innerHTML = '<div style="color: var(--text-muted);">Aucun créneau continu libre sur cette journée.</div>';
                return;
            }}

            slots.forEach(s => {{
                const div = document.createElement('div');
                div.style.background = 'rgba(6, 182, 212, 0.08)';
                div.style.border = '1px solid rgba(6, 182, 212, 0.3)';
                div.style.borderRadius = '6px';
                div.style.padding = '0.75rem 1rem';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';

                div.innerHTML = `
                    <div>
                        <strong style="color: var(--col-free); font-family: 'IBM Plex Mono', monospace;">⚡ ${{s.start}} - ${{s.end}}</strong>
                        <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Focus & Workout Window Libre</div>
                    </div>
                    <span style="font-family: 'IBM Plex Mono', monospace; font-weight: 600; color: #ffffff;">${{s.durationMin}} min</span>
                `;
                container.appendChild(div);
            }});
        }}

        // Render Standup View
        function renderStandupView() {{
            const radarContainer = document.getElementById('priorityRadarList');
            radarContainer.innerHTML = '';
            STANDUP.priority_radar.forEach(p => {{
                const div = document.createElement('div');
                div.className = 'priority-item';
                div.innerHTML = `
                    <div>
                        <strong style="color: #ffffff; font-size: 0.9rem;">${{p.client}}</strong>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${{p.focus}}</div>
                    </div>
                    <span class="priority-badge ${{p.urgency.toLowerCase().replace(' ', '-')}}">${{p.urgency}}</span>
                `;
                radarContainer.appendChild(div);
            }});

            const meetingList = document.getElementById('standupMeetingList');
            meetingList.innerHTML = '';
            const dayEvs = getEventsForDate(currentDate);

            if (dayEvs.length === 0) {{
                meetingList.innerHTML = '<div style="color: var(--text-muted); padding: 1rem;">Aucun point prévu pour aujourd\\'hui.</div>';
                return;
            }}

            dayEvs.forEach(ev => {{
                const box = document.createElement('div');
                box.style.background = 'var(--bg-surface)';
                box.style.border = '1px solid var(--border-color)';
                box.style.borderRadius = '6px';
                box.style.padding = '0.85rem';
                box.style.display = 'flex';
                box.style.justifyContent = 'space-between';
                box.style.alignItems = 'center';
                box.style.cursor = 'pointer';
                box.onclick = () => openDrawer(ev);

                box.innerHTML = `
                    <div>
                        <div style="font-weight: 600; font-size: 0.9rem; color: #ffffff;">${{ev.summary}}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 3px; font-family: 'IBM Plex Mono', monospace;">
                            ${{ev.startTime}} - ${{ev.endTime}} • ${{ev.intel.client_tag}}
                        </div>
                    </div>
                    <button class="pill-btn" style="font-size: 0.75rem;">Voir Dossier ↗</button>
                `;
                meetingList.appendChild(box);
            }});
        }}

        // Render Macro & Fridge Hub View
        function renderMacroView() {{
            // Render Fridge Stock
            const fridge = document.getElementById('fridgeGrid');
            fridge.innerHTML = '';

            INVENTORY.forEach(item => {{
                const card = document.createElement('div');
                const isLow = item.current_qty <= item.min_qty;
                const isEmpty = item.current_qty === 0;
                card.className = 'stock-card' + (isEmpty ? ' empty' : (isLow ? ' low' : ''));

                card.innerHTML = `
                    <div class="stock-top">
                        <span class="stock-title">${{item.icon}} ${{item.name}}</span>
                        <span class="stock-badge ${{isEmpty ? 'danger' : (isLow ? 'warning' : 'ok')}}">
                            ${{isEmpty ? 'RUPTURE' : (isLow ? 'BAS' : 'EN STOCK')}}
                        </span>
                    </div>
                    <div class="stock-qty" style="color: ${{isEmpty ? '#ef4444' : (isLow ? '#f59e0b' : '#ffffff')}}">
                        ${{item.current_qty}} <span style="font-size: 0.85rem; font-weight: 400; color: var(--text-muted);">${{item.unit}}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                        <span>${{item.brand}}</span>
                        <span>${{item.storage}}</span>
                    </div>
                `;
                fridge.appendChild(card);
            }});

            // Render Aisle Checklist
            const aisleSec = document.getElementById('aisleChecklistSection');
            aisleSec.innerHTML = '';

            for (const [aisleName, items] of Object.entries(AISLES)) {{
                const card = document.createElement('div');
                card.className = 'aisle-card';
                card.innerHTML = `
                    <div class="aisle-title">${{aisleName}}</div>
                    <div class="checklist-items" id="aisle-items-${{btoa(unescape(encodeURIComponent(aisleName))).substring(0, 8)}}"></div>
                `;
                aisleSec.appendChild(card);

                const itemsEl = card.querySelector('.checklist-items');
                items.forEach(it => {{
                    const row = document.createElement('label');
                    row.className = 'check-item';
                    row.innerHTML = `
                        <input type="checkbox" id="chk-${{it.id}}" ${{it.is_low ? '' : 'checked'}} onchange="toggleCheckItem('${{it.id}}')">
                        <span style="${{it.is_low ? 'color: #ff0066; font-weight: 600;' : ''}}">
                            ${{it.icon}} ${{it.name}} (${{it.current}} ${{it.unit}})
                        </span>
                    `;
                    itemsEl.appendChild(row);
                }});
            }}
        }}

        // Slide-over Dossier Drawer logic
        function openDrawer(ev) {{
            currentOpenEventId = ev.date + '_' + ev.startTime + '_' + ev.summary.replace(/[^a-zA-Z0-9]/g, '');
            document.getElementById('drawerTitle').textContent = ev.summary;
            document.getElementById('drawerTime').textContent = `📅 ${{ev.date}} • ⏰ ${{ev.startTime}} - ${{ev.endTime}} (${{ev.durationMin}} min)`;

            const badgeEl = document.getElementById('drawerClientBadge');
            badgeEl.innerHTML = `<span class="tag-pill" style="background: ${{ev.intel.client_color}}20; color: ${{ev.intel.client_color}}; border: 1px solid ${{ev.intel.client_color}};">${{ev.intel.client_badge}} • ${{ev.intel.role_category}}</span>`;

            document.getElementById('drawerOutcome').textContent = ev.intel.expected_outcome;

            const attEl = document.getElementById('drawerAttendees');
            attEl.innerHTML = '';
            ev.intel.attendees.forEach(a => {{
                const chip = document.createElement('span');
                chip.className = 'attendee-chip';
                chip.textContent = a;
                attEl.appendChild(chip);
            }});

            const tpEl = document.getElementById('drawerTalkingPoints');
            tpEl.innerHTML = '';
            ev.intel.talking_points.forEach(tp => {{
                const li = document.createElement('li');
                li.textContent = tp;
                tpEl.appendChild(li);
            }});

            const delEl = document.getElementById('drawerDeliverables');
            delEl.innerHTML = '';
            ev.intel.deliverables.forEach(d => {{
                const li = document.createElement('li');
                li.textContent = d;
                delEl.appendChild(li);
            }});

            // Load saved notes from localStorage
            const savedNotes = localStorage.getItem('notes_' + currentOpenEventId) || '';
            document.getElementById('drawerNotes').value = savedNotes;

            document.getElementById('drawerOverlay').classList.add('open');
        }}

        function closeDrawer() {{
            document.getElementById('drawerOverlay').classList.remove('open');
            currentOpenEventId = null;
        }}

        function saveEventNotes() {{
            if (!currentOpenEventId) return;
            const val = document.getElementById('drawerNotes').value;
            localStorage.setItem('notes_' + currentOpenEventId, val);
        }}

        // Apple Reminders Clipboard Copy
        function copyAppleReminders() {{
            navigator.clipboard.writeText(APPLE_REMINDERS_TEXT).then(() => {{
                const toast = document.getElementById('toastNotify');
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2500);
            }}).catch(err => {{
                alert('Erreur lors de la copie');
            }});
        }}

        function toggleCheckItem(itemId) {{
            // Optional local toggle persistence
        }}

        function shiftDate(offset) {{
            const d = new Date(currentDate);
            d.setDate(d.getDate() + offset);
            currentDate = d.toISOString().split('T')[0];
            renderCalendar();
            if (currentMode === 'standup') renderStandupView();
        }}

        function goToToday() {{
            currentDate = "{today_str}";
            renderCalendar();
            if (currentMode === 'standup') renderStandupView();
        }}

        function toggleFilter(cat) {{
            filters[cat] = !filters[cat];
            const btn = document.getElementById('filter' + cat.charAt(0).toUpperCase() + cat.slice(1));
            if (btn) btn.classList.toggle('active', filters[cat]);
            renderCalendar();
        }}

        function handleSearch() {{
            searchQuery = document.getElementById('eventSearch').value;
            renderCalendar();
        }}

        // Initial setup
        window.onload = () => {{
            renderCalendar();
        }};
    </script>
</body>
</html>
"""

    out_file = BASE_DIR / "calendar_dashboard.html"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Generated Calendar Dashboard V2 at: {out_file}")

if __name__ == "__main__":
    build_dashboard()
