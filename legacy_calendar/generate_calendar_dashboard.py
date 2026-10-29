import json
import os
import sys
import re
from datetime import datetime, timedelta, date
from pathlib import Path
from zoneinfo import ZoneInfo

from unified_calendar import (
    get_unified_events,
    find_unified_free_slots,
    detect_training_clashes,
    calculate_deep_work_blocks
)

LOCAL_TZ = ZoneInfo("Europe/Paris")
BASE_DIR = Path(__file__).resolve().parent

def build_dashboard():
    now = datetime.now(LOCAL_TZ)
    # 6-week horizon: 2 weeks past, 4 weeks future
    start_dt = (now - timedelta(days=14)).replace(hour=0, minute=0, second=0)
    end_dt = (now + timedelta(days=28)).replace(hour=23, minute=59, second=59)

    print("Fetching unified events across all 3 calendars + ATHX...")
    events = get_unified_events(start_dt, end_dt)
    print(f"Total unified events extracted: {len(events)}")

    # Enrich and serialize events for JavaScript
    json_events = []
    source_counts = {"Artefact": 0, "Clariane": 0, "Personal": 0, "ATHX": 0}

    for ev in events:
        s = ev["start"]
        e = ev["end"]
        duration_min = max(0, int((e - s).total_seconds() // 60))
        src = ev["source"]

        if "Artefact" in src:
            source_counts["Artefact"] += 1
            src_key = "work"
        elif "Clariane" in src:
            source_counts["Clariane"] += 1
            src_key = "client"
        elif "Personal" in src or "Ma vie" in src:
            source_counts["Personal"] += 1
            src_key = "personal"
        elif "ATHX" in src or "CrossFit" in ev["summary"]:
            source_counts["ATHX"] += 1
            src_key = "training"
        else:
            source_counts["Artefact"] += 1
            src_key = "work"

        # Determine video call platform
        vlink = ev.get("video_link", "")
        vplatform = ""
        if "teams.microsoft.com" in vlink or "teams.live.com" in vlink:
            vplatform = "Teams"
        elif "meet.google.com" in vlink:
            vplatform = "Google Meet"
        elif "zoom.us" in vlink:
            vplatform = "Zoom"
        elif vlink:
            vplatform = "Video Call"

        # Categorize meeting type for visual tagging
        sum_lower = ev["summary"].lower()
        if "athx" in sum_lower or "crossfit" in sum_lower or "wod" in sum_lower or "gym" in sum_lower:
            m_type = "Workout"
        elif "run" in sum_lower:
            m_type = "Run"
        elif "1:1" in sum_lower or "1-1" in sum_lower or "1 on 1" in sum_lower or "synchro" in sum_lower:
            m_type = "1-on-1"
        elif "standup" in sum_lower or "daily" in sum_lower or "point d'avancement" in sum_lower:
            m_type = "Standup"
        elif "workshop" in sum_lower or "atelier" in sum_lower or "formation" in sum_lower:
            m_type = "Workshop"
        elif "client" in sum_lower or "clariane" in sum_lower or "ferrero" in sum_lower or "netsoins" in sum_lower:
            m_type = "Client Call"
        elif "all hands" in sum_lower or "town hall" in sum_lower:
            m_type = "All-Hands"
        elif vlink:
            m_type = "Meeting"
        else:
            m_type = "Calendar Block"

        json_events.append({
            "id": ev.get("id", ""),
            "source": src,
            "srcKey": src_key,
            "summary": ev["summary"],
            "start": s.isoformat(),
            "end": e.isoformat(),
            "date": s.strftime("%Y-%m-%d"),
            "startTime": s.strftime("%H:%M"),
            "endTime": e.strftime("%H:%M"),
            "durationMin": duration_min,
            "location": ev.get("location", ""),
            "description": ev.get("description", ""),
            "videoLink": vlink,
            "videoPlatform": vplatform,
            "htmlLink": ev.get("html_link", ""),
            "attendees": ev.get("attendees", []),
            "organizer": ev.get("organizer", {}),
            "status": ev.get("status", "confirmed"),
            "isAllDay": ev.get("is_all_day", False),
            "meetingType": m_type
        })

    # Compute free slots for the horizon
    free_slots_data = {}
    for d_offset in range(-7, 21):
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

    # Routine Armor & Deep Work Calculations
    clashes = detect_training_clashes(events)
    deep_work = calculate_deep_work_blocks(events, now.date())

    events_json_str = json.dumps(json_events, ensure_ascii=False)
    free_slots_json_str = json.dumps(free_slots_data, ensure_ascii=False)
    clashes_json_str = json.dumps(clashes, ensure_ascii=False)
    deep_work_json_str = json.dumps(deep_work, ensure_ascii=False)
    source_counts_json_str = json.dumps(source_counts, ensure_ascii=False)
    today_str = now.strftime("%Y-%m-%d")

    html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARTEFACT • Unified Multi-Calendar & Events Extraction OS</title>
    <!-- Artefact Brand Typography: IBM Plex Sans & IBM Plex Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
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
            --col-teams: #6264a7;
            --col-meet: #00897b;

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

        /* Header Navigation */
        header {{
            background: rgba(13, 22, 52, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 100;
            padding: 0.75rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
            flex-wrap: wrap;
        }}

        .brand-container {{
            display: flex;
            align-items: center;
            gap: 1rem;
        }}

        .brand-logo {{
            font-size: 1.35rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }}

        .brand-logo .dot {{
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--artefact-pink);
            box-shadow: 0 0 10px var(--artefact-pink-glow);
            display: inline-block;
        }}

        .brand-tag {{
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(255, 0, 102, 0.12);
            color: var(--artefact-pink);
            border: 1px solid rgba(255, 0, 102, 0.3);
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }}

        .nav-controls {{
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
        }}

        .date-navigator {{
            display: flex;
            align-items: center;
            background: var(--bg-surface-elevated);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
        }}

        .stepper-btn {{
            background: none;
            border: none;
            color: var(--text-secondary);
            padding: 0.5rem 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
        }}

        .stepper-btn:hover {{
            color: #ffffff;
            background: rgba(255, 255, 255, 0.08);
        }}

        .current-date-display {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.88rem;
            font-weight: 600;
            color: #ffffff;
            padding: 0.4rem 1rem;
            border-left: 1px solid var(--border-color);
            border-right: 1px solid var(--border-color);
            white-space: nowrap;
        }}

        .pill-btn {{
            background: var(--bg-surface-elevated);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 0.45rem 0.95rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
        }}

        .pill-btn:hover {{
            border-color: var(--border-hover);
            background: rgba(255, 0, 102, 0.1);
        }}

        .pill-btn.primary {{
            background: var(--artefact-pink);
            border-color: var(--artefact-pink);
            color: #ffffff;
            font-weight: 600;
        }}

        .pill-btn.primary:hover {{
            box-shadow: 0 0 15px var(--artefact-pink-glow);
        }}

        /* Calendar Stream Sync Bar */
        .sync-streams-bar {{
            background: rgba(13, 22, 52, 0.4);
            border-bottom: 1px solid rgba(39, 50, 117, 0.35);
            padding: 0.55rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
            font-size: 0.82rem;
        }}

        .sync-streams-list {{
            display: flex;
            align-items: center;
            gap: 1.25rem;
            flex-wrap: wrap;
        }}

        .stream-status {{
            display: flex;
            align-items: center;
            gap: 0.45rem;
            color: var(--text-secondary);
        }}

        .status-dot {{
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }}

        .stream-count {{
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 600;
            color: #ffffff;
            background: rgba(255, 255, 255, 0.08);
            padding: 0.1rem 0.45rem;
            border-radius: 4px;
        }}

        /* Main Container */
        main {{
            max-width: 1720px;
            margin: 0 auto;
            width: 100%;
            padding: 1.5rem 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            flex: 1;
        }}

        /* Routine Armor Banner */
        .armor-banner {{
            background: linear-gradient(90deg, rgba(31, 101, 255, 0.12) 0%, rgba(13, 22, 52, 0.4) 100%);
            border: 1px solid rgba(31, 101, 255, 0.3);
            border-radius: 10px;
            padding: 0.75rem 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }}

        .armor-banner.has-clash {{
            background: linear-gradient(90deg, rgba(239, 68, 68, 0.18) 0%, rgba(13, 22, 52, 0.4) 100%);
            border-color: rgba(239, 68, 68, 0.5);
        }}

        .armor-left {{
            display: flex;
            align-items: center;
            gap: 0.85rem;
            font-size: 0.92rem;
        }}

        .armor-icon {{
            font-size: 1.35rem;
        }}

        .armor-stats {{
            display: flex;
            align-items: center;
            gap: 1.5rem;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.82rem;
        }}

        /* KPI Metric Cards */
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 1rem;
        }}

        .kpi-card {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 1rem 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            transition: all 0.2s;
        }}

        .kpi-card:hover {{
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }}

        .kpi-title {{
            font-size: 0.82rem;
            color: var(--text-secondary);
            font-weight: 500;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .kpi-value {{
            font-size: 1.65rem;
            font-weight: 700;
            color: #ffffff;
            font-family: 'IBM Plex Mono', monospace;
        }}

        .kpi-subtext {{
            font-size: 0.74rem;
            color: var(--text-muted);
        }}

        /* Calendar Navigation & View Tabs */
        .view-navigation-bar {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 0.6rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }}

        .view-tabs {{
            display: flex;
            background: var(--bg-base);
            padding: 3px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }}

        .tab-btn {{
            background: none;
            border: none;
            color: var(--text-secondary);
            padding: 0.5rem 1.15rem;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.45rem;
        }}

        .tab-btn.active {{
            background: var(--bg-surface-elevated);
            color: #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }}

        .tab-btn:hover:not(.active) {{
            color: #ffffff;
        }}

        .tab-badge {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.72rem;
            background: rgba(255, 255, 255, 0.12);
            padding: 0.1rem 0.45rem;
            border-radius: 9999px;
        }}

        /* Filter Pills */
        .filter-group {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }}

        .filter-pill {{
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            padding: 0.35rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.78rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
        }}

        .filter-pill .indicator {{
            width: 7px;
            height: 7px;
            border-radius: 50%;
        }}

        .filter-pill.work .indicator {{ background: var(--col-work); }}
        .filter-pill.client .indicator {{ background: var(--col-client); }}
        .filter-pill.training .indicator {{ background: var(--col-training); }}
        .filter-pill.personal .indicator {{ background: var(--col-personal); }}
        .filter-pill.video .indicator {{ background: #a855f7; }}

        .filter-pill.active {{
            background: var(--bg-surface-elevated);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.25);
        }}

        .search-box {{
            display: flex;
            align-items: center;
            background: var(--bg-base);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.35rem 0.85rem;
            min-width: 260px;
        }}

        .search-input {{
            background: none;
            border: none;
            outline: none;
            color: #ffffff;
            font-size: 0.85rem;
            width: 100%;
        }}

        .search-input::placeholder {{
            color: var(--text-muted);
        }}

        /* Content Views */
        .view-content {{
            display: none;
        }}

        .view-content.active {{
            display: block;
        }}

        /* VIEW 1: DAY TIMELINE */
        .timeline-container {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            position: relative;
            overflow-x: auto;
        }}

        .hours-grid {{
            position: relative;
            min-height: 950px;
            margin-left: 65px;
            border-left: 1px solid var(--border-color);
        }}

        .hour-row {{
            position: relative;
            height: 56px;
            border-bottom: 1px dashed rgba(39, 50, 117, 0.35);
        }}

        .hour-label {{
            position: absolute;
            left: -65px;
            top: -10px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.76rem;
            color: var(--text-muted);
            width: 50px;
            text-align: right;
        }}

        .event-card {{
            position: absolute;
            left: 12px;
            right: 12px;
            border-radius: 8px;
            padding: 0.55rem 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            border-left-width: 4px;
            border-left-style: solid;
        }}

        .event-card:hover {{
            transform: translateX(4px);
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
            filter: brightness(1.15);
        }}

        .event-card.work {{
            background: rgba(31, 101, 255, 0.16);
            border-color: rgba(31, 101, 255, 0.4);
            border-left-color: var(--col-work);
        }}

        .event-card.client {{
            background: rgba(245, 158, 11, 0.16);
            border-color: rgba(245, 158, 11, 0.4);
            border-left-color: var(--col-client);
        }}

        .event-card.training {{
            background: rgba(255, 0, 102, 0.16);
            border-color: rgba(255, 0, 102, 0.4);
            border-left-color: var(--col-training);
        }}

        .event-card.personal {{
            background: rgba(16, 185, 129, 0.16);
            border-color: rgba(16, 185, 129, 0.4);
            border-left-color: var(--col-personal);
        }}

        .event-summary {{
            font-size: 0.88rem;
            font-weight: 600;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }}

        .event-meta {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.74rem;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 0.6rem;
            flex-wrap: wrap;
            margin-top: 2px;
        }}

        .tag-pill {{
            font-size: 0.68rem;
            padding: 0.15rem 0.45rem;
            border-radius: 4px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }}

        .btn-join-call {{
            background: #6264a7;
            color: #ffffff;
            border: none;
            padding: 0.2rem 0.55rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            text-decoration: none;
            transition: all 0.2s;
        }}

        .btn-join-call:hover {{
            background: #7376c7;
        }}

        .btn-join-call.meet {{
            background: #00897b;
        }}

        .btn-join-call.meet:hover {{
            background: #009688;
        }}

        /* VIEW 2: WEEK GRID */
        .week-grid {{
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 0.75rem;
        }}

        .day-column {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            min-height: 650px;
        }}

        .day-column.is-today {{
            border-color: var(--artefact-pink);
            box-shadow: 0 0 16px var(--artefact-pink-glow);
        }}

        .day-header {{
            padding: 0.85rem 0.75rem;
            background: var(--bg-surface-elevated);
            border-bottom: 1px solid var(--border-color);
            text-align: center;
        }}

        .day-column.is-today .day-header {{
            background: rgba(255, 0, 102, 0.15);
        }}

        .day-name {{
            font-size: 0.76rem;
            text-transform: uppercase;
            font-weight: 600;
            color: var(--text-secondary);
            letter-spacing: 0.5px;
        }}

        .day-date {{
            font-size: 1.1rem;
            font-weight: 700;
            color: #ffffff;
            margin-top: 2px;
        }}

        .week-events-list {{
            padding: 0.65rem;
            display: flex;
            flex-direction: column;
            gap: 0.55rem;
            flex: 1;
            overflow-y: auto;
        }}

        /* VIEW 3: EVENTS EXTRACTION FORENSIC TABLE */
        .table-container {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
        }}

        .table-toolbar {{
            padding: 1rem 1.5rem;
            background: var(--bg-surface-elevated);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }}

        .extraction-table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.85rem;
        }}

        .extraction-table th {{
            background: rgba(8, 12, 26, 0.7);
            color: var(--text-secondary);
            font-weight: 600;
            padding: 0.85rem 1rem;
            border-bottom: 1px solid var(--border-color);
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.5px;
        }}

        .extraction-table td {{
            padding: 0.85rem 1rem;
            border-bottom: 1px solid rgba(39, 50, 117, 0.3);
            color: var(--text-primary);
            vertical-align: middle;
        }}

        .extraction-table tr:hover {{
            background: rgba(255, 255, 255, 0.03);
            cursor: pointer;
        }}

        .extraction-table tr.selected {{
            background: rgba(255, 0, 102, 0.1);
        }}

        .source-badge {{
            font-size: 0.74rem;
            font-weight: 600;
            padding: 0.25rem 0.6rem;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            white-space: nowrap;
        }}

        .source-badge.work {{
            background: var(--col-work-bg);
            color: #93c5fd;
            border: 1px solid rgba(31, 101, 255, 0.3);
        }}

        .source-badge.client {{
            background: var(--col-client-bg);
            color: #fcd34d;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }}

        .source-badge.training {{
            background: var(--col-training-bg);
            color: #f472b6;
            border: 1px solid rgba(255, 0, 102, 0.3);
        }}

        .source-badge.personal {{
            background: var(--col-personal-bg);
            color: #6ee7b7;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }}

        .attendee-badge-count {{
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.72rem;
            padding: 0.15rem 0.45rem;
            border-radius: 9999px;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }}

        /* VIEW 4: ROUTINE ARMOR & FREE SLOTS */
        .armor-layout {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }}

        @media (max-width: 900px) {{
            .armor-layout {{
                grid-template-columns: 1fr;
            }}
        }}

        .armor-section-card {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }}

        .clash-card {{
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.35);
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }}

        .free-slot-card {{
            background: rgba(6, 182, 212, 0.08);
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 8px;
            padding: 0.85rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        /* Slide-over Event Dossier Drawer */
        .drawer-overlay {{
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            z-index: 200;
            display: none;
            justify-content: flex-end;
        }}

        .drawer-overlay.open {{
            display: flex;
        }}

        .drawer-panel {{
            width: 100%;
            max-width: 600px;
            background: var(--bg-surface-elevated);
            height: 100%;
            border-left: 1px solid var(--border-color);
            box-shadow: -10px 0 30px rgba(0, 0, 0, 0.6);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            padding: 2rem;
            gap: 1.5rem;
            animation: slideIn 0.25s ease-out;
        }}

        @keyframes slideIn {{
            from {{ transform: translateX(100%); }}
            to {{ transform: translateX(0); }}
        }}

        .drawer-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
        }}

        .drawer-close {{
            background: rgba(255, 255, 255, 0.08);
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }}

        .drawer-close:hover {{
            background: rgba(255, 0, 102, 0.2);
            color: #ffffff;
        }}

        .dossier-section {{
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
        }}

        .dossier-label {{
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 600;
            color: var(--text-muted);
            letter-spacing: 0.5px;
        }}

        .dossier-box {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.85rem 1rem;
            font-size: 0.88rem;
            line-height: 1.5;
            color: var(--text-primary);
        }}

        .attendee-list {{
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
            max-height: 220px;
            overflow-y: auto;
        }}

        .attendee-item {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.45rem 0.65rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            font-size: 0.82rem;
        }}

        .attendee-status {{
            font-size: 0.72rem;
            font-weight: 600;
            padding: 0.15rem 0.45rem;
            border-radius: 4px;
        }}

        .attendee-status.accepted {{ background: rgba(16, 185, 129, 0.2); color: #34d399; }}
        .attendee-status.declined {{ background: rgba(239, 68, 68, 0.2); color: #f87171; }}
        .attendee-status.needsAction {{ background: rgba(245, 158, 11, 0.2); color: #fbbf24; }}
        .attendee-status.tentative {{ background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }}

        .raw-json-inspector {{
            background: #050814;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.74rem;
            color: #93c5fd;
            max-height: 250px;
            overflow: auto;
            white-space: pre-wrap;
            word-break: break-all;
        }}

        .scratchpad {{
            width: 100%;
            height: 90px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.75rem;
            color: #ffffff;
            font-family: 'IBM Plex Sans', sans-serif;
            font-size: 0.85rem;
            resize: none;
            outline: none;
        }}

        .scratchpad:focus {{
            border-color: var(--border-hover);
        }}

        /* Toast notification */
        .toast-notify {{
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--bg-surface-elevated);
            color: #ffffff;
            border: 1px solid var(--artefact-pink);
            box-shadow: 0 4px 20px var(--artefact-pink-glow);
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            display: none;
            z-index: 300;
        }}

        .toast-notify.show {{
            display: block;
            animation: fadeIn 0.2s;
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
            <div class="brand-tag">UNIFIED CALENDAR & EXTRACTIONS OS</div>
        </div>

        <div class="nav-controls">
            <div class="date-navigator">
                <button class="stepper-btn" onclick="shiftDate(-1)" title="Previous Day">◀</button>
                <div class="current-date-display" id="currentDateDisplay">Loading...</div>
                <button class="stepper-btn" onclick="shiftDate(1)" title="Next Day">▶</button>
            </div>

            <button class="pill-btn" onclick="goToToday()">Today</button>
            <input type="date" id="datePickerInput" class="pill-btn" style="cursor: pointer; color-scheme: dark;" onchange="handleDatePicker(this.value)">

            <a href="garmin_workout.html" class="pill-btn" style="text-decoration: none; color: #ffd700; border: 1px solid rgba(255, 215, 0, 0.4); background: rgba(255, 215, 0, 0.08);">
                🏋️ ATHX Dashboard ↗
            </a>
        </div>
    </header>

    <!-- Calendar Stream Synchronization Diagnostics Bar -->
    <div class="sync-streams-bar">
        <div class="sync-streams-list">
            <div class="stream-status">
                <span class="status-dot"></span>
                <span>💼 Artefact (Google Primary):</span>
                <span class="stream-count" id="countArtefact">{source_counts['Artefact']}</span>
            </div>
            <div class="stream-status">
                <span class="status-dot"></span>
                <span>🏥 Clariane (Outlook ICS + Google Sync):</span>
                <span class="stream-count" id="countClariane">{source_counts['Clariane']}</span>
            </div>
            <div class="stream-status">
                <span class="status-dot"></span>
                <span>🍏 Personal (Ma vie iCloud):</span>
                <span class="stream-count" id="countPersonal">{source_counts['Personal']}</span>
            </div>
            <div class="stream-status">
                <span class="status-dot" style="background: var(--artefact-pink); box-shadow: 0 0 8px var(--artefact-pink-glow);"></span>
                <span>⚡ ATHX Performance Microcycle:</span>
                <span class="stream-count" id="countATHX">{source_counts['ATHX']}</span>
            </div>
        </div>

        <div style="color: var(--text-muted); font-size: 0.78rem;">
            Horizon: <strong>-14 to +28 Days</strong> (Total: <span id="totalEventsCount" style="color: #ffffff; font-weight: 600;">{len(json_events)}</span> events extracted)
        </div>
    </div>

    <main>
        <!-- Routine Armor & Conflict Banner -->
        <div class="armor-banner" id="armorBanner">
            <div class="armor-left">
                <span class="armor-icon" id="armorIcon">🛡️</span>
                <span class="armor-text" id="armorText">Auditing routine armor across all 3 calendar streams...</span>
            </div>
            <div class="armor-stats">
                <span>ATHX SESSIONS: <strong style="color: var(--artefact-pink);">9/9 SANCTUARISÉES</strong></span>
                <span>DEEP WORK QUOTIENT: <strong style="color: #10b981;" id="armorDeepPct">100%</strong></span>
            </div>
        </div>

        <!-- KPI Metric Cards for Current View -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-title">
                    <span>💼 Artefact Work</span>
                    <span id="kpiWorkCount">0 events</span>
                </div>
                <div class="kpi-value" id="kpiWorkHours" style="color: var(--col-work);">0.0 hrs</div>
                <div class="kpi-subtext">Internal syncs & Chapter AI meetings</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-title">
                    <span>🏥 Clariane / Clients</span>
                    <span id="kpiClientCount">0 events</span>
                </div>
                <div class="kpi-value" id="kpiClientHours" style="color: var(--col-client);">0.0 hrs</div>
                <div class="kpi-subtext">Clariane F360, Netsoins, Ferrero calls</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-title">
                    <span>⚡ ATHX Training</span>
                    <span id="kpiTrainingCount">0 sessions</span>
                </div>
                <div class="kpi-value" id="kpiTrainingHours" style="color: var(--col-training);">0.0 hrs</div>
                <div class="kpi-subtext">4× CrossFit • 2× Gym • 3× Run</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-title">
                    <span>🚀 Deep Work Index</span>
                    <span id="kpiDeepSlots">0 blocks</span>
                </div>
                <div class="kpi-value" id="kpiDeepHours" style="color: #10b981;">0.0 hrs</div>
                <div class="kpi-subtext">Uninterrupted ≥90min focus blocks</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-title">
                    <span>⚠️ Clashes Detected</span>
                    <span id="kpiClashCount" style="color: #ef4444;">0 overlaps</span>
                </div>
                <div class="kpi-value" id="kpiClashMinutes" style="color: #ef4444;">0 min</div>
                <div class="kpi-subtext">Work/Client vs. Training collisions</div>
            </div>
        </div>

        <!-- View Navigation Bar & Filters -->
        <div class="view-navigation-bar">
            <!-- 4 Views Focused on Calendar & Extractions -->
            <div class="view-tabs">
                <button class="tab-btn active" id="tabBtnDay" onclick="switchMainView('day')">
                    📅 Day Timeline
                </button>
                <button class="tab-btn" id="tabBtnWeek" onclick="switchMainView('week')">
                    🗓️ Week Grid (Mon–Sun)
                </button>
                <button class="tab-btn" id="tabBtnTable" onclick="switchMainView('table')">
                    🔍 Events Extraction Inspector <span class="tab-badge" id="tableTabCount">{len(json_events)}</span>
                </button>
                <button class="tab-btn" id="tabBtnArmor" onclick="switchMainView('armor')">
                    🛡️ Routine Armor & Focus
                </button>
            </div>

            <!-- Filters -->
            <div class="filter-group">
                <button class="filter-pill work active" id="filterWork" onclick="toggleFilter('work')">
                    <span class="indicator"></span> Artefact
                </button>
                <button class="filter-pill client active" id="filterClient" onclick="toggleFilter('client')">
                    <span class="indicator"></span> Clariane
                </button>
                <button class="filter-pill training active" id="filterTraining" onclick="toggleFilter('training')">
                    <span class="indicator"></span> ⚡ ATHX
                </button>
                <button class="filter-pill personal active" id="filterPersonal" onclick="toggleFilter('personal')">
                    <span class="indicator"></span> Ma vie
                </button>
                <button class="filter-pill video active" id="filterVideoOnly" onclick="toggleFilter('videoOnly')">
                    <span class="indicator"></span> 🎥 Video Call
                </button>
            </div>

            <div class="search-box">
                <input type="text" class="search-input" id="globalSearch" placeholder="🔍 Search summary, attendees, rooms..." oninput="handleSearch()">
            </div>
        </div>

        <!-- ================= VIEW 1: DAY TIMELINE ================= -->
        <div class="view-content active" id="view-day">
            <div class="timeline-container">
                <div class="hours-grid" id="hoursGrid">
                    <!-- Rendered dynamically -->
                </div>
            </div>
        </div>

        <!-- ================= VIEW 2: WEEK GRID ================= -->
        <div class="view-content" id="view-week">
            <div class="week-grid" id="weekGrid">
                <!-- 7 columns rendered dynamically -->
            </div>
        </div>

        <!-- ================= VIEW 3: EVENTS EXTRACTION FORENSIC TABLE ================= -->
        <div class="view-content" id="view-table">
            <div class="table-container">
                <div class="table-toolbar">
                    <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                        <span style="font-weight: 600; font-size: 0.95rem; color: #ffffff;">Forensic Events Extraction Registry</span>
                        <span id="filteredTableCount" style="color: var(--text-muted); font-size: 0.82rem;">Showing 0 events</span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <button class="pill-btn" onclick="exportEventsJSON()" title="Export filtered events as JSON">
                            📥 Export JSON
                        </button>
                        <button class="pill-btn" onclick="exportEventsCSV()" title="Export filtered events as CSV">
                            📄 Export CSV
                        </button>
                    </div>
                </div>

                <div style="overflow-x: auto;">
                    <table class="extraction-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Source Stream</th>
                                <th>Event Summary & Type</th>
                                <th>Video Call</th>
                                <th>Attendees</th>
                                <th>Location / Room</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="extractionTableBody">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ================= VIEW 4: ROUTINE ARMOR & FREE SLOTS ================= -->
        <div class="view-content" id="view-armor">
            <div class="armor-layout">
                <!-- Left: Collisions & Clash Radar -->
                <div class="armor-section-card">
                    <div>
                        <h3 style="font-size: 1.15rem; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
                            <span>⚠️</span> Collision & Clash Radar
                        </h3>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.25rem;">
                            Detects direct schedule conflicts between non-negotiable ATHX training and work/client meetings.
                        </p>
                    </div>

                    <div id="clashesList" style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <!-- Right: Free Deep Work Slots -->
                <div class="armor-section-card">
                    <div>
                        <h3 style="font-size: 1.15rem; color: var(--col-free); display: flex; align-items: center; gap: 0.5rem;">
                            <span>⚡</span> Free Focus & Deep Work Blocks
                        </h3>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.25rem;">
                            Uninterrupted windows (≥45 min) across all 3 calendars for high-leverage cognitive work.
                        </p>
                    </div>

                    <div id="freeSlotsList" style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <!-- Populated dynamically -->
                    </div>
                </div>
            </div>
        </div>

    </main>

    <!-- Slide-over Event Dossier Drawer -->
    <div class="drawer-overlay" id="drawerOverlay" onclick="closeDrawer()">
        <div class="drawer-panel" onclick="event.stopPropagation()">
            <div class="drawer-header">
                <div>
                    <div id="drawerSourceBadge"></div>
                    <h2 id="drawerTitle" style="font-size: 1.35rem; color: #ffffff; margin-top: 0.35rem; line-height: 1.3;"></h2>
                    <div id="drawerTime" style="font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; color: var(--artefact-pink); margin-top: 0.25rem;"></div>
                </div>
                <button class="drawer-close" onclick="closeDrawer()">&times;</button>
            </div>

            <!-- Video Call & Google Calendar Action Buttons -->
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <a id="drawerVideoBtn" href="#" target="_blank" class="btn-join-call" style="padding: 0.55rem 1rem; font-size: 0.85rem; display: none;">
                    🎥 Join Video Call
                </a>
                <a id="drawerGCalBtn" href="#" target="_blank" class="pill-btn" style="padding: 0.55rem 1rem; font-size: 0.85rem; display: none;">
                    🌐 Open in Google Calendar
                </a>
            </div>

            <!-- Organizer -->
            <div class="dossier-section" id="drawerOrganizerSection">
                <div class="dossier-label">👤 Organizer</div>
                <div class="dossier-box" id="drawerOrganizer"></div>
            </div>

            <!-- Attendees Roster -->
            <div class="dossier-section">
                <div class="dossier-label" style="display: flex; justify-content: space-between;">
                    <span>👥 Attendees Roster</span>
                    <span id="drawerAttendeeCount" style="font-family: 'IBM Plex Mono', monospace;"></span>
                </div>
                <div class="attendee-list" id="drawerAttendees"></div>
            </div>

            <!-- Location & Physical Room -->
            <div class="dossier-section" id="drawerLocationSection">
                <div class="dossier-label">📍 Location / Physical Room</div>
                <div class="dossier-box" id="drawerLocation"></div>
            </div>

            <!-- Description / Agenda -->
            <div class="dossier-section">
                <div class="dossier-label">📝 Description & Agenda</div>
                <div class="dossier-box" id="drawerDescription" style="white-space: pre-wrap; font-size: 0.82rem; max-height: 180px; overflow-y: auto;"></div>
            </div>

            <!-- Raw JSON Extraction Payload Viewer -->
            <div class="dossier-section">
                <div class="dossier-label" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>🔍 Raw Extraction Payload (Forensics)</span>
                    <button class="pill-btn" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;" onclick="toggleRawPayload()">Toggle Raw</button>
                </div>
                <pre class="raw-json-inspector" id="drawerRawPayload" style="display: none;"></pre>
            </div>

            <!-- Ayrton's Notes Scratchpad -->
            <div class="dossier-section">
                <div class="dossier-label">✏️ Ayrton's Meeting Notes (Saved Locally)</div>
                <textarea class="scratchpad" id="drawerNotes" placeholder="Type quick notes, action items, or decisions taken..." oninput="saveEventNotes()"></textarea>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-notify" id="toastNotify">Copied!</div>

    <!-- Embedded Dynamic JSON Data -->
    <script>
        const RAW_EVENTS = {events_json_str};
        const FREE_SLOTS = {free_slots_json_str};
        const CLASHES = {clashes_json_str};
        const DEEP_WORK = {deep_work_json_str};
        const SOURCE_COUNTS = {source_counts_json_str};

        let currentDate = "{today_str}";
        let currentMainView = "day";
        let searchQuery = "";
        let currentOpenEventId = null;

        const filters = {{
            work: true,
            client: true,
            training: true,
            personal: true,
            videoOnly: false
        }};

        // View Switching
        function switchMainView(view) {{
            currentMainView = view;
            document.querySelectorAll('.view-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(c => c.classList.remove('active'));

            if (view === 'day') {{
                document.getElementById('tabBtnDay').classList.add('active');
                document.getElementById('view-day').classList.add('active');
            }} else if (view === 'week') {{
                document.getElementById('tabBtnWeek').classList.add('active');
                document.getElementById('view-week').classList.add('active');
            }} else if (view === 'table') {{
                document.getElementById('tabBtnTable').classList.add('active');
                document.getElementById('view-table').classList.add('active');
            }} else if (view === 'armor') {{
                document.getElementById('tabBtnArmor').classList.add('active');
                document.getElementById('view-armor').classList.add('active');
            }}

            renderActiveView();
        }}

        function getEventsForDate(dateStr) {{
            return RAW_EVENTS.filter(e => {{
                if (e.date !== dateStr) return false;
                if (!filters[e.srcKey]) return false;
                if (filters.videoOnly && !e.videoLink) return false;

                if (searchQuery) {{
                    const q = searchQuery.toLowerCase();
                    const inSummary = e.summary.toLowerCase().includes(q);
                    const inLoc = (e.location || '').toLowerCase().includes(q);
                    const inDesc = (e.description || '').toLowerCase().includes(q);
                    const inAtt = (e.attendees || []).some(a => (a.name || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q));
                    return inSummary || inLoc || inDesc || inAtt;
                }}
                return true;
            }});
        }}

        function getAllFilteredEvents() {{
            return RAW_EVENTS.filter(e => {{
                if (!filters[e.srcKey]) return false;
                if (filters.videoOnly && !e.videoLink) return false;

                if (searchQuery) {{
                    const q = searchQuery.toLowerCase();
                    const inSummary = e.summary.toLowerCase().includes(q);
                    const inLoc = (e.location || '').toLowerCase().includes(q);
                    const inDesc = (e.description || '').toLowerCase().includes(q);
                    const inAtt = (e.attendees || []).some(a => (a.name || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q));
                    return inSummary || inLoc || inDesc || inAtt;
                }}
                return true;
            }});
        }}

        function renderActiveView() {{
            document.getElementById('currentDateDisplay').textContent = currentDate;
            updateKPIs();
            updateArmorBanner();

            if (currentMainView === 'day') renderDayView();
            else if (currentMainView === 'week') renderWeekView();
            else if (currentMainView === 'table') renderTableView();
            else if (currentMainView === 'armor') renderArmorView();
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
                text.innerHTML = `<strong>Attention Clash Détecté :</strong> ${{CLASHES.length}} conflit(s) direct(s) entre séance ATHX et réunion client.`;
            }} else {{
                banner.classList.remove('has-clash');
                icon.textContent = "🛡️";
                text.innerHTML = `<strong>Routine Armor Active :</strong> Toutes les séances d'entraînement sont sanctuarisées.`;
            }}
        }}

        function updateKPIs() {{
            const dayEvents = getEventsForDate(currentDate);
            let workCount = 0, workMins = 0;
            let clientCount = 0, clientMins = 0;
            let trainCount = 0, trainMins = 0;

            dayEvents.forEach(e => {{
                if (e.srcKey === 'work') {{ workCount++; workMins += e.durationMin; }}
                else if (e.srcKey === 'client') {{ clientCount++; clientMins += e.durationMin; }}
                else if (e.srcKey === 'training') {{ trainCount++; trainMins += e.durationMin; }}
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

            const totalOverlap = (CLASHES || []).reduce((acc, c) => acc + (c.overlap_min || 0), 0);
            document.getElementById('kpiClashCount').textContent = `${{(CLASHES || []).length}} overlaps`;
            document.getElementById('kpiClashMinutes').textContent = `${{totalOverlap}} min`;
        }}

        // ================= VIEW 1: DAY TIMELINE =================
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
                const topPx = (startMinFrom6 / 60) * 56;
                const heightPx = Math.max(38, (ev.durationMin / 60) * 56);

                const card = document.createElement('div');
                card.className = `event-card ${{ev.srcKey}}`;
                card.style.top = topPx + 'px';
                card.style.height = heightPx + 'px';
                card.onclick = () => openDrawer(ev);

                let videoBadge = '';
                if (ev.videoLink) {{
                    const isMeet = ev.videoPlatform === 'Google Meet';
                    videoBadge = `<a href="${{ev.videoLink}}" target="_blank" onclick="event.stopPropagation()" class="btn-join-call ${{isMeet ? 'meet' : ''}}">🎥 Join ${{ev.videoPlatform}}</a>`;
                }}

                const attCount = ev.attendees ? ev.attendees.length : 0;
                const attBadge = attCount > 0 ? `<span class="attendee-badge-count">👥 ${{attCount}}</span>` : '';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                        <span class="event-summary">${{ev.summary}}</span>
                        <div style="display: flex; align-items: center; gap: 0.35rem; flex-shrink: 0;">
                            ${{videoBadge}}
                            ${{attBadge}}
                        </div>
                    </div>
                    <div class="event-meta">
                        <span>⏰ ${{ev.startTime}} - ${{ev.endTime}} (${{ev.durationMin}}m)</span>
                        <span>•</span>
                        <span>${{ev.source}}</span>
                        ${{ev.location ? `<span>• 📍 ${{ev.location}}</span>` : ''}}
                    </div>
                `;
                grid.appendChild(card);
            }});
        }}

        // ================= VIEW 2: WEEK GRID =================
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
                    <div class="day-header" style="cursor: pointer;" onclick="setDateAndSwitchDay('${{dStr}}')">
                        <div class="day-name">${{dayName.toUpperCase()}}</div>
                        <div class="day-date">${{d.toLocaleDateString('fr-FR', {{ day: 'numeric', month: 'short' }})}}</div>
                    </div>
                    <div class="week-events-list" id="week-events-${{dStr}}"></div>
                `;
                grid.appendChild(col);

                const listEl = col.querySelector(`#week-events-${{dStr}}`);
                const evs = getEventsForDate(dStr);
                if (evs.length === 0) {{
                    listEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.72rem; text-align: center; margin-top: 2rem;">No events</div>';
                }} else {{
                    evs.forEach(ev => {{
                        const card = document.createElement('div');
                        card.className = `event-card ${{ev.srcKey}}`;
                        card.style.position = 'relative';
                        card.style.left = '0';
                        card.style.right = '0';
                        card.style.height = 'auto';
                        card.onclick = () => openDrawer(ev);

                        const attCount = ev.attendees ? ev.attendees.length : 0;
                        card.innerHTML = `
                            <div class="event-summary" style="font-size: 0.78rem;">${{ev.summary}}</div>
                            <div class="event-meta" style="font-size: 0.68rem; justify-content: space-between;">
                                <span>${{ev.startTime}} - ${{ev.endTime}}</span>
                                ${{attCount > 0 ? `<span>👥 ${{attCount}}</span>` : ''}}
                            </div>
                        `;
                        listEl.appendChild(card);
                    }});
                }}
            }}
        }}

        // ================= VIEW 3: EVENTS EXTRACTION FORENSIC TABLE =================
        function renderTableView() {{
            const tbody = document.getElementById('extractionTableBody');
            tbody.innerHTML = '';

            const allEvents = getAllFilteredEvents();
            document.getElementById('filteredTableCount').textContent = `Showing ${{allEvents.length}} of ${{RAW_EVENTS.length}} extracted events`;

            if (allEvents.length === 0) {{
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No events found matching your filter criteria.</td></tr>';
                return;
            }}

            allEvents.forEach(ev => {{
                const tr = document.createElement('tr');
                tr.onclick = () => openDrawer(ev);

                // Video Call Link Button
                let videoCol = '<span style="color: var(--text-muted); font-size: 0.76rem;">—</span>';
                if (ev.videoLink) {{
                    const isMeet = ev.videoPlatform === 'Google Meet';
                    videoCol = `<a href="${{ev.videoLink}}" target="_blank" onclick="event.stopPropagation()" class="btn-join-call ${{isMeet ? 'meet' : ''}}">🎥 Join ${{ev.videoPlatform}}</a>`;
                }}

                // Attendees info
                const attList = ev.attendees || [];
                let attCol = '<span style="color: var(--text-muted); font-size: 0.76rem;">—</span>';
                if (attList.length > 0) {{
                    const firstAtt = attList[0].name || attList[0].email;
                    const others = attList.length > 1 ? ` <span class="attendee-badge-count">+${{attList.length - 1}}</span>` : '';
                    attCol = `<span title="${{attList.map(a => a.name + ' (' + a.status + ')').join('\\n')}}">${{firstAtt}}${{others}}</span>`;
                }}

                // Source Badge
                const srcBadge = `<span class="source-badge ${{ev.srcKey}}">${{ev.source}}</span>`;

                tr.innerHTML = `
                    <td style="font-family: 'IBM Plex Mono', monospace; font-size: 0.8rem; white-space: nowrap;">
                        <strong style="color: #ffffff;">${{ev.date}}</strong><br>
                        <span style="color: var(--text-secondary); font-size: 0.74rem;">${{ev.startTime}} - ${{ev.endTime}} (${{ev.durationMin}}m)</span>
                    </td>
                    <td>${{srcBadge}}</td>
                    <td>
                        <strong style="color: #ffffff;">${{ev.summary}}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${{ev.meetingType}}</div>
                    </td>
                    <td>${{videoCol}}</td>
                    <td>${{attCol}}</td>
                    <td style="font-size: 0.78rem; color: var(--text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${{ev.location || '—'}}
                    </td>
                    <td>
                        <button class="pill-btn" style="font-size: 0.72rem; padding: 0.25rem 0.55rem;">Inspect ↗</button>
                    </td>
                `;
                tbody.appendChild(tr);
            }});
        }}

        // ================= VIEW 4: ROUTINE ARMOR & FREE SLOTS =================
        function renderArmorView() {{
            // Render Clashes
            const clashesList = document.getElementById('clashesList');
            clashesList.innerHTML = '';
            if (!CLASHES || CLASHES.length === 0) {{
                clashesList.innerHTML = '<div style="color: #10b981; padding: 1rem; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px;">✅ Aucune collision détectée. Votre microcycle ATHX est parfaitement protégé.</div>';
            }} else {{
                CLASHES.forEach(c => {{
                    const div = document.createElement('div');
                    div.className = 'clash-card';
                    div.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <strong style="color: #ef4444; font-size: 0.92rem;">🚨 Collision : ${{c.overlap_min}} min d'empiètement</strong>
                            <span style="font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; color: #ffffff;">${{c.training_date}}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: #ffffff;">
                            🏋️ <strong>${{c.training_summary}}</strong> (${{c.training_time}})<br>
                            ⚔️ <strong>${{c.conflicting_event}}</strong> (${{c.conflicting_time}}) [${{c.conflicting_source}}]
                        </div>
                        <div style="font-size: 0.78rem; color: var(--text-secondary); border-top: 1px dashed rgba(239, 68, 68, 0.3); padding-top: 0.4rem;">
                            💡 Résolution : ${{c.resolution}}
                        </div>
                    `;
                    clashesList.appendChild(div);
                }});
            }}

            // Render Free Slots
            const freeSlotsList = document.getElementById('freeSlotsList');
            freeSlotsList.innerHTML = '';
            const slots = FREE_SLOTS[currentDate] || [];

            if (slots.length === 0) {{
                freeSlotsList.innerHTML = '<div style="color: var(--text-muted); padding: 1rem;">Aucun créneau continu ≥45 min libre sur cette date.</div>';
            }} else {{
                slots.forEach(s => {{
                    const div = document.createElement('div');
                    div.className = 'free-slot-card';
                    div.innerHTML = `
                        <div>
                            <strong style="color: var(--col-free); font-family: 'IBM Plex Mono', monospace; font-size: 0.95rem;">
                                ⚡ ${{s.start}} - ${{s.end}}
                            </strong>
                            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                                Fenêtre Focus & Deep Work disponible
                            </div>
                        </div>
                        <span style="font-family: 'IBM Plex Mono', monospace; font-weight: 700; color: #ffffff; font-size: 1rem;">
                            ${{s.durationMin}} min
                        </span>
                    `;
                    freeSlotsList.appendChild(div);
                }});
            }}
        }}

        // Slide-over Event Dossier Drawer
        function openDrawer(ev) {{
            currentOpenEventId = ev.date + '_' + ev.startTime + '_' + ev.summary.replace(/[^a-zA-Z0-9]/g, '');
            document.getElementById('drawerTitle').textContent = ev.summary;
            document.getElementById('drawerTime').textContent = `📅 ${{ev.date}} • ⏰ ${{ev.startTime}} - ${{ev.endTime}} (${{ev.durationMin}} min)`;

            const badgeEl = document.getElementById('drawerSourceBadge');
            badgeEl.innerHTML = `<span class="source-badge ${{ev.srcKey}}">${{ev.source}} • ${{ev.status.toUpperCase()}}</span>`;

            // Video button
            const vBtn = document.getElementById('drawerVideoBtn');
            if (ev.videoLink) {{
                vBtn.href = ev.videoLink;
                vBtn.textContent = `🎥 Join ${{ev.videoPlatform}}`;
                vBtn.className = `btn-join-call ${{ev.videoPlatform === 'Google Meet' ? 'meet' : ''}}`;
                vBtn.style.display = 'inline-flex';
            }} else {{
                vBtn.style.display = 'none';
            }}

            // Google Calendar Button
            const gBtn = document.getElementById('drawerGCalBtn');
            if (ev.htmlLink) {{
                gBtn.href = ev.htmlLink;
                gBtn.style.display = 'inline-flex';
            }} else {{
                gBtn.style.display = 'none';
            }}

            // Organizer
            const org = ev.organizer || {{}};
            document.getElementById('drawerOrganizer').innerHTML = org.name ? `<strong>${{org.name}}</strong> (${{org.email || '—'}})` : '<span style="color: var(--text-muted);">Non spécifié</span>';

            // Attendees
            const attList = ev.attendees || [];
            document.getElementById('drawerAttendeeCount').textContent = `${{attList.length}} invité(s)`;
            const attEl = document.getElementById('drawerAttendees');
            attEl.innerHTML = '';
            if (attList.length === 0) {{
                attEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.82rem; padding: 0.5rem;">Aucun invité externe enregistré.</div>';
            }} else {{
                attList.forEach(a => {{
                    const div = document.createElement('div');
                    div.className = 'attendee-item';
                    div.innerHTML = `
                        <div>
                            <strong>${{a.name}}</strong>
                            <div style="font-size: 0.72rem; color: var(--text-muted);">${{a.email}}</div>
                        </div>
                        <span class="attendee-status ${{a.status}}">${{a.status}}</span>
                    `;
                    attEl.appendChild(div);
                }});
            }}

            // Location
            document.getElementById('drawerLocation').innerHTML = ev.location ? `📍 ${{ev.location}}` : '<span style="color: var(--text-muted);">Aucun lieu physique spécifié</span>';

            // Description
            document.getElementById('drawerDescription').textContent = ev.description || 'Aucune description fournie.';

            // Raw JSON Payload Inspector
            document.getElementById('drawerRawPayload').textContent = JSON.stringify(ev, null, 2);

            // Local Notes Scratchpad
            const savedNotes = localStorage.getItem('notes_' + currentOpenEventId) || '';
            document.getElementById('drawerNotes').value = savedNotes;

            document.getElementById('drawerOverlay').classList.add('open');
        }}

        function closeDrawer() {{
            document.getElementById('drawerOverlay').classList.remove('open');
            currentOpenEventId = null;
        }}

        function toggleRawPayload() {{
            const rawEl = document.getElementById('drawerRawPayload');
            rawEl.style.display = rawEl.style.display === 'none' ? 'block' : 'none';
        }}

        function saveEventNotes() {{
            if (!currentOpenEventId) return;
            const val = document.getElementById('drawerNotes').value;
            localStorage.setItem('notes_' + currentOpenEventId, val);
        }}

        // Date Controls
        function shiftDate(offset) {{
            const d = new Date(currentDate);
            d.setDate(d.getDate() + offset);
            currentDate = d.toISOString().split('T')[0];
            renderActiveView();
        }}

        function goToToday() {{
            currentDate = "{today_str}";
            renderActiveView();
        }}

        function handleDatePicker(val) {{
            if (val) {{
                currentDate = val;
                renderActiveView();
            }}
        }}

        function setDateAndSwitchDay(dateStr) {{
            currentDate = dateStr;
            switchMainView('day');
        }}

        // Filters
        function toggleFilter(key) {{
            filters[key] = !filters[key];
            const btn = document.getElementById('filter' + key.charAt(0).toUpperCase() + key.slice(1));
            if (btn) btn.classList.toggle('active', filters[key]);
            renderActiveView();
        }}

        function handleSearch() {{
            searchQuery = document.getElementById('globalSearch').value;
            renderActiveView();
        }}

        // Export Functions
        function exportEventsJSON() {{
            const data = getAllFilteredEvents();
            const blob = new Blob([JSON.stringify(data, null, 2)], {{ type: 'application/json' }});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `artefact_events_extraction_${{currentDate}}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }}

        function exportEventsCSV() {{
            const data = getAllFilteredEvents();
            const headers = ['date', 'startTime', 'endTime', 'durationMin', 'source', 'summary', 'meetingType', 'location', 'videoPlatform', 'videoLink'];
            let csv = headers.join(',') + '\\n';
            data.forEach(e => {{
                const row = [
                    e.date,
                    e.startTime,
                    e.endTime,
                    e.durationMin,
                    `"${{(e.source || '').replace(/"/g, '""')}}"`,
                    `"${{(e.summary || '').replace(/"/g, '""')}}"`,
                    `"${{(e.meetingType || '').replace(/"/g, '""')}}"`,
                    `"${{(e.location || '').replace(/"/g, '""')}}"`,
                    `"${{(e.videoPlatform || '').replace(/"/g, '""')}}"`,
                    `"${{(e.videoLink || '').replace(/"/g, '""')}}"`
                ];
                csv += row.join(',') + '\\n';
            }});
            const blob = new Blob([csv], {{ type: 'text/csv;charset=utf-8;' }});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `artefact_events_extraction_${{currentDate}}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }}

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {{
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'ArrowLeft') shiftDate(-1);
            else if (e.key === 'ArrowRight') shiftDate(1);
            else if (e.key === 'Escape') closeDrawer();
            else if (e.key === 't' || e.key === 'T') goToToday();
            else if (e.key === '1') switchMainView('day');
            else if (e.key === '2') switchMainView('week');
            else if (e.key === '3') switchMainView('table');
            else if (e.key === '4') switchMainView('armor');
        }});

        window.onload = () => {{
            renderActiveView();
        }};
    </script>
</body>
</html>
"""

    out_file = BASE_DIR / "calendar_dashboard.html"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Generated focused Calendar & Event Extractions OS at: {out_file}")

if __name__ == "__main__":
    build_dashboard()
