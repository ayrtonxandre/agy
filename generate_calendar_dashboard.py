import json
import os
from datetime import datetime, timedelta, date
from zoneinfo import ZoneInfo
from unified_calendar import get_unified_events, find_unified_free_slots

LOCAL_TZ = ZoneInfo("Europe/Paris")

def build_dashboard():
    now = datetime.now(LOCAL_TZ)
    start_dt = (now - timedelta(days=14)).replace(hour=0, minute=0, second=0)
    end_dt = (now + timedelta(days=28)).replace(hour=23, minute=59, second=59)

    print("Fetching unified events across all 3 calendars...")
    events = get_unified_events(start_dt, end_dt)
    
    # Serialize events for JavaScript
    json_events = []
    for ev in events:
        s = ev["start"]
        e = ev["end"]
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
            "isAllDay": ev.get("is_all_day", False)
        })

    # Compute free slots for today, tomorrow, and Saturday
    free_slots_data = {}
    for d_offset in range(-2, 8):
        cur_d = (now + timedelta(days=d_offset)).date()
        slots = find_unified_free_slots(cur_d, min_minutes=45)
        free_slots_data[cur_d.strftime("%Y-%m-%d")] = [
            {
                "start": s.strftime("%H:%M"),
                "end": e.strftime("%H:%M"),
                "durationMin": int((e - s).total_seconds() // 60)
            }
            for s, e in slots
        ]

    events_json_str = json.dumps(json_events, ensure_ascii=False)
    free_slots_json_str = json.dumps(free_slots_data, ensure_ascii=False)
    today_str = now.strftime("%Y-%m-%d")

    html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARTEFACT • Unified Multi-Calendar Intelligence</title>
    <!-- Artefact Brand Typography: IBM Plex Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
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
            
            /* Calendar Category Accents */
            --col-work: #1f65ff;
            --col-work-bg: rgba(31, 101, 255, 0.15);
            --col-personal: #10b981;
            --col-personal-bg: rgba(16, 185, 129, 0.15);
            --col-client: #f59e0b;
            --col-client-bg: rgba(245, 158, 11, 0.15);
            --col-free: #06b6d4;
            --col-free-bg: rgba(6, 182, 212, 0.12);

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
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-base);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            background-image: 
                radial-gradient(circle at 15% 10%, rgba(255, 0, 102, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(31, 101, 255, 0.08) 0%, transparent 40%);
        }}

        /* Header / Brand Nav */
        header {{
            background: rgba(13, 22, 52, 0.85);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 100;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1.5rem;
        }}

        .brand-container {{
            display: flex;
            align-items: center;
            gap: 1.25rem;
        }}

        .brand-logo {{
            font-weight: 700;
            font-size: 1.5rem;
            letter-spacing: -0.03em;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }}

        .brand-logo .dot {{
            width: 9px;
            height: 9px;
            background: var(--artefact-pink);
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 12px var(--artefact-pink);
        }}

        .brand-tag {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.75rem;
            color: var(--text-secondary);
            background: rgba(39, 50, 117, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 0.25rem 0.6rem;
            border-radius: 4px;
            letter-spacing: 0.05em;
        }}

        .nav-controls {{
            display: flex;
            align-items: center;
            gap: 1rem;
        }}

        .date-stepper {{
            display: flex;
            align-items: center;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
        }}

        .stepper-btn {{
            background: transparent;
            border: none;
            color: var(--text-primary);
            padding: 0.5rem 0.85rem;
            cursor: pointer;
            font-size: 0.95rem;
            transition: background 0.15s;
        }}

        .stepper-btn:hover {{
            background: rgba(255, 255, 255, 0.08);
            color: var(--artefact-pink);
        }}

        .current-date-display {{
            padding: 0.5rem 1rem;
            font-weight: 600;
            font-size: 0.9rem;
            min-width: 170px;
            text-align: center;
            border-left: 1px solid var(--border-color);
            border-right: 1px solid var(--border-color);
        }}

        .view-tabs {{
            display: flex;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 3px;
        }}

        .tab-btn {{
            background: transparent;
            border: none;
            color: var(--text-secondary);
            padding: 0.45rem 1rem;
            font-size: 0.85rem;
            font-weight: 500;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .tab-btn.active {{
            background: linear-gradient(135deg, var(--artefact-pink) 0%, var(--artefact-blue) 100%);
            color: #ffffff;
            font-weight: 600;
            box-shadow: 0 4px 12px var(--artefact-pink-glow);
        }}

        /* Main Container */
        main {{
            max-width: 1440px;
            margin: 0 auto;
            width: 100%;
            padding: 1.75rem 2rem 3rem 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }}

        /* KPI / Stat Highlights Grid */
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 1rem;
        }}

        .kpi-card {{
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.25rem 1.5rem;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(12px);
            transition: transform 0.2s, border-color 0.2s;
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
            right: 0;
            height: 3px;
        }}

        .kpi-card.work::before {{ background: var(--col-work); }}
        .kpi-card.personal::before {{ background: var(--col-personal); }}
        .kpi-card.client::before {{ background: var(--col-client); }}
        .kpi-card.free::before {{ background: var(--col-free); }}

        .kpi-title {{
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}

        .kpi-value {{
            font-size: 1.85rem;
            font-weight: 700;
            letter-spacing: -0.02em;
        }}

        .kpi-subtext {{
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        }}

        /* Filters and Search Bar */
        .toolbar {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 0.85rem 1.25rem;
        }}

        .filter-pills {{
            display: flex;
            align-items: center;
            gap: 0.65rem;
            flex-wrap: wrap;
        }}

        .pill-btn {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text-secondary);
            padding: 0.4rem 0.85rem;
            border-radius: 20px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .pill-btn.active {{
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.3);
        }}

        .pill-btn .indicator {{
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }}

        .pill-btn.work .indicator {{ background: var(--col-work); }}
        .pill-btn.personal .indicator {{ background: var(--col-personal); }}
        .pill-btn.client .indicator {{ background: var(--col-client); }}
        .pill-btn.free .indicator {{ background: var(--col-free); }}

        .search-input {{
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: #ffffff;
            padding: 0.45rem 1rem;
            font-size: 0.85rem;
            font-family: inherit;
            min-width: 260px;
            outline: none;
            transition: border-color 0.2s;
        }}

        .search-input:focus {{
            border-color: var(--artefact-pink);
        }}

        /* Content Views */
        .view-content {{
            display: none;
        }}

        .view-content.active {{
            display: block;
        }}

        /* Day Hourly Timeline View */
        .timeline-container {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 1.5rem;
            position: relative;
        }}

        .all-day-strip {{
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            border-left: 3px solid var(--artefact-pink);
        }}

        .all-day-label {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.75rem;
            text-transform: uppercase;
            color: var(--artefact-pink);
            font-weight: 600;
        }}

        .hours-grid {{
            position: relative;
            display: grid;
            grid-template-columns: 75px 1fr;
            row-gap: 24px;
        }}

        .hour-row {{
            display: contents;
        }}

        .hour-label {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.75rem;
            color: var(--text-muted);
            text-align: right;
            padding-right: 1.25rem;
            line-height: 1;
            padding-top: 2px;
        }}

        .hour-slot {{
            position: relative;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            min-height: 48px;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding-top: 6px;
        }}

        /* Event Block Cards */
        .event-card {{
            background: var(--bg-card);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            border-left: 4px solid var(--col-work);
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            backdrop-filter: blur(8px);
        }}

        .event-card:hover {{
            transform: translateX(4px);
            background: var(--bg-surface-elevated);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }}

        .event-card.work {{
            border-left-color: var(--col-work);
            background: linear-gradient(90deg, var(--col-work-bg) 0%, rgba(19, 31, 71, 0.5) 100%);
        }}

        .event-card.personal {{
            border-left-color: var(--col-personal);
            background: linear-gradient(90deg, var(--col-personal-bg) 0%, rgba(19, 31, 71, 0.5) 100%);
        }}

        .event-card.client {{
            border-left-color: var(--col-client);
            background: linear-gradient(90deg, var(--col-client-bg) 0%, rgba(19, 31, 71, 0.5) 100%);
        }}

        .event-card.free {{
            border-left-color: var(--col-free);
            background: linear-gradient(90deg, var(--col-free-bg) 0%, rgba(19, 31, 71, 0.3) 100%);
            border: 1px dashed var(--col-free);
            border-left: 4px solid var(--col-free);
        }}

        .card-top {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.25rem;
        }}

        .card-time {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-secondary);
        }}

        .card-source {{
            font-size: 0.7rem;
            padding: 2px 7px;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}

        .card-title {{
            font-weight: 600;
            font-size: 0.95rem;
            color: #ffffff;
            margin-bottom: 0.2rem;
        }}

        .card-meta {{
            font-size: 0.8rem;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }}

        /* Week Grid View */
        .week-grid {{
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1rem;
            align-items: start;
        }}

        .week-col {{
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            min-height: 480px;
        }}

        .week-col.is-today {{
            border-color: var(--artefact-pink);
            box-shadow: 0 0 20px rgba(255, 0, 102, 0.15);
        }}

        .col-header {{
            text-align: center;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border-color);
        }}

        .col-day-name {{
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-secondary);
        }}

        .col-day-num {{
            font-size: 1.4rem;
            font-weight: 700;
            margin-top: 0.2rem;
        }}

        .week-col.is-today .col-day-num {{
            color: var(--artefact-pink);
        }}

        /* Free Slot Radar View */
        .radar-panel {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }}

        .free-slots-list {{
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }}

        .free-slot-badge {{
            background: linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(19, 31, 71, 0.6) 100%);
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-left: 4px solid var(--col-free);
            border-radius: 8px;
            padding: 1rem 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        /* Detail Modal */
        .modal-overlay {{
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            z-index: 1000;
            display: none;
            justify-content: center;
            align-items: center;
            padding: 1.5rem;
        }}

        .modal-box {{
            background: var(--bg-surface-elevated);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            max-width: 540px;
            width: 100%;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
            position: relative;
        }}

        .modal-close {{
            position: absolute;
            top: 1.25rem;
            right: 1.25rem;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 1.35rem;
            cursor: pointer;
        }}

        .modal-close:hover {{
            color: #ffffff;
        }}

        .action-btn {{
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, var(--artefact-pink) 0%, var(--artefact-blue) 100%);
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 0.65rem 1.25rem;
            font-size: 0.85rem;
            font-weight: 600;
            text-decoration: none;
            margin-top: 1.25rem;
            cursor: pointer;
            transition: opacity 0.2s;
        }}

        .action-btn:hover {{
            opacity: 0.9;
        }}

        @media (max-width: 900px) {{
            .week-grid {{
                grid-template-columns: 1fr;
            }}
            .radar-panel {{
                grid-template-columns: 1fr;
            }}
            header {{
                flex-direction: column;
                align-items: flex-start;
            }}
        }}
    </style>
</head>
<body>

    <header>
        <div class="brand-container">
            <div class="brand-logo">
                ARTEFACT<span class="dot"></span>
            </div>
            <div class="brand-tag">UNIFIED CALENDAR INTELLIGENCE</div>
        </div>

        <div class="nav-controls">
            <div class="date-stepper">
                <button class="stepper-btn" onclick="shiftDate(-1)">◀</button>
                <div class="current-date-display" id="currentDateDisplay">Loading...</div>
                <button class="stepper-btn" onclick="shiftDate(1)">▶</button>
            </div>
            <button class="pill-btn" onclick="goToToday()">Today</button>

            <div class="view-tabs">
                <button class="tab-btn active" onclick="switchView('day')">Day Timeline</button>
                <button class="tab-btn" onclick="switchView('week')">Week Grid</button>
                <button class="tab-btn" onclick="switchView('agenda')">Agenda List</button>
                <button class="tab-btn" onclick="switchView('free')">⚡ Free Slots</button>
            </div>
        </div>
    </header>

    <main>
        <!-- KPI Stat Grid -->
        <div class="kpi-grid">
            <div class="kpi-card work">
                <div class="kpi-title">
                    <span>💼 Artefact Work</span>
                    <span id="kpiWorkCount">0 events</span>
                </div>
                <div class="kpi-value" id="kpiWorkHours">0.0 hrs</div>
                <div class="kpi-subtext">Internal syncs, DA team, delivery</div>
            </div>

            <div class="kpi-card client">
                <div class="kpi-title">
                    <span>🏥 Clariane Client</span>
                    <span id="kpiClientCount">0 events</span>
                </div>
                <div class="kpi-value" id="kpiClientHours">0.0 hrs</div>
                <div class="kpi-subtext">Invoicing 2.0 & HDJ coordination</div>
            </div>

            <div class="kpi-card personal">
                <div class="kpi-title">
                    <span>🍏 Personal (iCloud)</span>
                    <span id="kpiPersonalCount">0 events</span>
                </div>
                <div class="kpi-value" id="kpiPersonalSport">0 sessions</div>
                <div class="kpi-subtext">Ma vie, Cross-training, appointments</div>
            </div>

            <div class="kpi-card free">
                <div class="kpi-title">
                    <span>⚡ Collision-Free Blocks</span>
                    <span id="kpiFreeCount">0 windows</span>
                </div>
                <div class="kpi-value" id="kpiFreeHours" style="color: var(--col-free);">0.0 hrs</div>
                <div class="kpi-subtext">Guaranteed open focus & ATHX gym slots</div>
            </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="toolbar">
            <div class="filter-pills">
                <button class="pill-btn work active" id="filterWork" onclick="toggleFilter('work')">
                    <span class="indicator"></span> Artefact (Work)
                </button>
                <button class="pill-btn client active" id="filterClient" onclick="toggleFilter('client')">
                    <span class="indicator"></span> Clariane (Client)
                </button>
                <button class="pill-btn personal active" id="filterPersonal" onclick="toggleFilter('personal')">
                    <span class="indicator"></span> Personal (iCloud)
                </button>
                <button class="pill-btn free active" id="filterFree" onclick="toggleFilter('free')">
                    <span class="indicator"></span> Open Training Windows
                </button>
            </div>

            <input type="text" class="search-input" id="eventSearch" placeholder="🔍 Search meetings, clients, workouts..." oninput="handleSearch()">
        </div>

        <!-- VIEW 1: DAY TIMELINE -->
        <div class="view-content active" id="view-day">
            <div class="timeline-container">
                <div class="all-day-strip" id="allDayStrip" style="display: none;">
                    <div class="all-day-label">All-Day:</div>
                    <div id="allDayContent"></div>
                </div>

                <div class="hours-grid" id="hoursGrid">
                    <!-- Populated dynamically via JS -->
                </div>
            </div>
        </div>

        <!-- VIEW 2: WEEK GRID -->
        <div class="view-content" id="view-week">
            <div class="week-grid" id="weekGrid">
                <!-- 7 days populated dynamically -->
            </div>
        </div>

        <!-- VIEW 3: AGENDA LIST -->
        <div class="view-content" id="view-agenda">
            <div class="timeline-container" id="agendaList" style="display: flex; flex-direction: column; gap: 0.85rem;">
                <!-- Populated dynamically -->
            </div>
        </div>

        <!-- VIEW 4: FREE SLOTS RADAR -->
        <div class="view-content" id="view-free">
            <div class="radar-panel">
                <div class="timeline-container">
                    <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: var(--col-free);">⚡ Open Workout & Focus Windows for Selected Day</h3>
                    <div class="free-slots-list" id="freeSlotsRadar">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <div class="timeline-container">
                    <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: #ffffff;">🎯 ATHX 2027 Training Recommendations</h3>
                    <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.85rem;">
                        <p>• <strong>Optimal Gym Session Duration:</strong> 75 to 90 minutes.</p>
                        <p>• <strong>Today's Pick:</strong> Block <strong>16:00 – 19:00</strong> is completely clear before your 19:00 Cross-training.</p>
                        <p>• <strong>Saturday Target:</strong> Slot <strong>07:00 – 11:30</strong> provides a 270-min window before Saturday Cross-training at 11:30.</p>
                        <div style="margin-top: 1rem; padding: 1rem; background: rgba(255, 0, 102, 0.08); border-left: 3px solid var(--artefact-pink); border-radius: 6px;">
                            <strong>Multi-Calendar Guard:</strong> This radar checks across Google Calendar, Clariane Outlook, and iCloud CalDAV simultaneously to ensure zero double-booking.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal for Event Details -->
    <div class="modal-overlay" id="eventModal" onclick="closeModal(event)">
        <div class="modal-box" onclick="event.stopPropagation()">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div id="modalSourceBadge" style="margin-bottom: 0.5rem;"></div>
            <h2 id="modalTitle" style="font-size: 1.35rem; margin-bottom: 0.75rem;"></h2>
            <div id="modalTime" style="font-family: 'IBM Plex Mono', monospace; color: var(--artefact-pink); margin-bottom: 1rem; font-weight: 600;"></div>
            <div id="modalLocation" style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;"></div>
            <div id="modalActionContainer"></div>
        </div>
    </div>

    <!-- Embedded Dynamic JSON Data -->
    <script>
        const RAW_EVENTS = {events_json_str};
        const FREE_SLOTS = {free_slots_json_str};
        let currentDate = "{today_str}";
        let currentView = "day";
        let searchQuery = "";
        
        const filters = {{
            work: true,
            client: true,
            personal: true,
            free: true
        }};

        function parseEventSource(src) {{
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

        function getFreeSlotsForDate(dateStr) {{
            if (!filters.free) return [];
            return FREE_SLOTS[dateStr] || [];
        }}

        function updateKPIs(dateStr) {{
            const evs = getEventsForDate(dateStr);
            const work = evs.filter(e => parseEventSource(e.source) === 'work');
            const client = evs.filter(e => parseEventSource(e.source) === 'client');
            const personal = evs.filter(e => parseEventSource(e.source) === 'personal');
            const free = getFreeSlotsForDate(dateStr);

            const workMins = work.reduce((acc, e) => acc + (e.isAllDay ? 0 : e.durationMin), 0);
            const clientMins = client.reduce((acc, e) => acc + (e.isAllDay ? 0 : e.durationMin), 0);
            const freeMins = free.reduce((acc, s) => acc + s.durationMin, 0);

            document.getElementById('kpiWorkCount').innerText = `${{work.length}} events`;
            document.getElementById('kpiWorkHours').innerText = `${{(workMins/60).toFixed(1)}} hrs`;

            document.getElementById('kpiClientCount').innerText = `${{client.length}} events`;
            document.getElementById('kpiClientHours').innerText = `${{(clientMins/60).toFixed(1)}} hrs`;

            document.getElementById('kpiPersonalCount').innerText = `${{personal.length}} events`;
            const sports = personal.filter(e => e.summary.toLowerCase().includes('sport') || e.summary.toLowerCase().includes('training')).length;
            document.getElementById('kpiPersonalSport').innerText = `${{sports}} sessions`;

            document.getElementById('kpiFreeCount').innerText = `${{free.length}} windows`;
            document.getElementById('kpiFreeHours').innerText = `${{(freeMins/60).toFixed(1)}} hrs`;
        }}

        function renderDayTimeline() {{
            const grid = document.getElementById('hoursGrid');
            grid.innerHTML = '';

            const dayEvents = getEventsForDate(currentDate);
            const freeSlots = getFreeSlotsForDate(currentDate);

            // All-day banner
            const allDay = dayEvents.filter(e => e.isAllDay);
            const allDayStrip = document.getElementById('allDayStrip');
            const allDayContent = document.getElementById('allDayContent');
            if (allDay.length > 0) {{
                allDayStrip.style.display = 'flex';
                allDayContent.innerHTML = allDay.map(e => `<span style="background: rgba(31, 101, 255, 0.2); padding: 3px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 500;">${{e.summary}}</span>`).join(' ');
            }} else {{
                allDayStrip.style.display = 'none';
            }}

            const startHour = 7;
            const endHour = 22;

            for (let h = startHour; h <= endHour; h++) {{
                const hStr = (h < 10 ? '0' : '') + h + ':00';
                
                // Hour label
                const label = document.createElement('div');
                label.className = 'hour-label';
                label.innerText = hStr;
                grid.appendChild(label);

                // Hour slot
                const slot = document.createElement('div');
                slot.className = 'hour-slot';

                // Find events starting in this hour
                const matchedEvents = dayEvents.filter(e => {{
                    if (e.isAllDay) return false;
                    const eH = parseInt(e.startTime.split(':')[0], 10);
                    return eH === h;
                }});

                matchedEvents.forEach(ev => {{
                    const cat = parseEventSource(ev.source);
                    const card = document.createElement('div');
                    card.className = `event-card ${{cat}}`;
                    card.onclick = () => openModal(ev);
                    card.innerHTML = `
                        <div class="card-top">
                            <span class="card-time">${{ev.startTime}} - ${{ev.endTime}} (${{ev.durationMin}}m)</span>
                            <span class="card-source">${{ev.source}}</span>
                        </div>
                        <div class="card-title">${{ev.summary}}</div>
                        ${{ev.location ? `<div class="card-meta">📍 ${{ev.location}}</div>` : ''}}
                    `;
                    slot.appendChild(card);
                }});

                // Check free slots starting in this hour
                const matchedFree = freeSlots.filter(s => {{
                    const fH = parseInt(s.start.split(':')[0], 10);
                    return fH === h;
                }});

                matchedFree.forEach(fs => {{
                    const card = document.createElement('div');
                    card.className = 'event-card free';
                    card.innerHTML = `
                        <div class="card-top">
                            <span class="card-time" style="color: var(--col-free);">⚡ ${{fs.start}} - ${{fs.end}} (${{fs.durationMin}} min)</span>
                            <span class="card-source" style="color: var(--col-free);">OPEN WINDOW</span>
                        </div>
                        <div class="card-title" style="color: var(--col-free);">Guaranteed Free Block (ATHX Workout / Focus)</div>
                    `;
                    slot.appendChild(card);
                }});

                grid.appendChild(slot);
            }}
        }}

        function renderWeekGrid() {{
            const grid = document.getElementById('weekGrid');
            grid.innerHTML = '';

            const curr = new Date(currentDate + "T12:00:00");
            const dayOfWeek = (curr.getDay() + 6) % 7; // Monday = 0
            const monday = new Date(curr);
            monday.setDate(curr.getDate() - dayOfWeek);

            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

            for (let i = 0; i < 7; i++) {{
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                const dStr = d.toISOString().split('T')[0];

                const isToday = dStr === "{today_str}";
                const col = document.createElement('div');
                col.className = `week-col ${{isToday ? 'is-today' : ''}}`;

                col.innerHTML = `
                    <div class="col-header">
                        <div class="col-day-name">${{dayNames[i]}}</div>
                        <div class="col-day-num">${{d.getDate()}}</div>
                    </div>
                `;

                const dayEvs = getEventsForDate(dStr);
                dayEvs.forEach(ev => {{
                    const cat = parseEventSource(ev.source);
                    const card = document.createElement('div');
                    card.className = `event-card ${{cat}}`;
                    card.style.padding = '0.55rem 0.75rem';
                    card.onclick = () => openModal(ev);
                    card.innerHTML = `
                        <div class="card-time" style="font-size: 0.7rem;">${{ev.startTime}} - ${{ev.endTime}}</div>
                        <div class="card-title" style="font-size: 0.85rem; margin-top: 2px;">${{ev.summary}}</div>
                    `;
                    col.appendChild(card);
                }});

                if (dayEvs.length === 0) {{
                    const emptyNotice = document.createElement('div');
                    emptyNotice.style.fontSize = '0.8rem';
                    emptyNotice.style.color = 'var(--text-muted)';
                    emptyNotice.style.textAlign = 'center';
                    emptyNotice.style.marginTop = '2rem';
                    emptyNotice.innerText = 'No meetings scheduled';
                    col.appendChild(emptyNotice);
                }}

                grid.appendChild(col);
            }}
        }}

        function renderAgendaList() {{
            const list = document.getElementById('agendaList');
            list.innerHTML = '';

            const dayEvs = getEventsForDate(currentDate);
            if (dayEvs.length === 0) {{
                list.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 3rem;">No events match current filters or search.</div>';
                return;
            }}

            dayEvs.forEach(ev => {{
                const cat = parseEventSource(ev.source);
                const card = document.createElement('div');
                card.className = `event-card ${{cat}}`;
                card.onclick = () => openModal(ev);
                card.innerHTML = `
                    <div class="card-top">
                        <span class="card-time">${{ev.startTime}} - ${{ev.endTime}} (${{ev.durationMin}} mins)</span>
                        <span class="card-source">${{ev.source}}</span>
                    </div>
                    <div class="card-title" style="font-size: 1.05rem;">${{ev.summary}}</div>
                    ${{ev.location ? `<div class="card-meta">📍 ${{ev.location}}</div>` : ''}}
                `;
                list.appendChild(card);
            }});
        }}

        function renderFreeRadar() {{
            const radar = document.getElementById('freeSlotsRadar');
            radar.innerHTML = '';
            const free = getFreeSlotsForDate(currentDate);

            if (free.length === 0) {{
                radar.innerHTML = '<div style="color: var(--text-muted); padding: 1rem;">No uninterrupted free blocks >= 45m found today.</div>';
                return;
            }}

            free.forEach(s => {{
                const badge = document.createElement('div');
                badge.className = 'free-slot-badge';
                badge.innerHTML = `
                    <div>
                        <div style="font-weight: 700; font-size: 1.15rem; color: #ffffff;">${{s.start}} – ${{s.end}}</div>
                        <div style="color: var(--col-free); font-size: 0.85rem; margin-top: 3px;">Full ${{s.durationMin}}-minute uninterrupted block</div>
                    </div>
                    <button class="pill-btn free" style="border-radius: 6px; font-weight: 600;">Book Workout</button>
                `;
                radar.appendChild(badge);
            }});
        }}

        function updateUI() {{
            const d = new Date(currentDate + "T12:00:00");
            const options = {{ weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }};
            document.getElementById('currentDateDisplay').innerText = d.toLocaleDateString('en-US', options);

            updateKPIs(currentDate);

            if (currentView === 'day') renderDayTimeline();
            if (currentView === 'week') renderWeekGrid();
            if (currentView === 'agenda') renderAgendaList();
            if (currentView === 'free') renderFreeRadar();
        }}

        function shiftDate(offset) {{
            const d = new Date(currentDate + "T12:00:00");
            d.setDate(d.getDate() + offset);
            currentDate = d.toISOString().split('T')[0];
            updateUI();
        }}

        function goToToday() {{
            currentDate = "{today_str}";
            updateUI();
        }}

        function switchView(viewName) {{
            currentView = viewName;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(c => c.classList.remove('active'));

            event.target.classList.add('active');
            document.getElementById('view-' + viewName).classList.add('active');
            updateUI();
        }}

        function toggleFilter(cat) {{
            filters[cat] = !filters[cat];
            const btn = document.getElementById('filter' + cat.charAt(0).toUpperCase() + cat.slice(1));
            if (filters[cat]) {{
                btn.classList.add('active');
            }} else {{
                btn.classList.remove('active');
            }}
            updateUI();
        }}

        function handleSearch() {{
            searchQuery = document.getElementById('eventSearch').value.trim();
            updateUI();
        }}

        function openModal(ev) {{
            document.getElementById('modalTitle').innerText = ev.summary;
            document.getElementById('modalTime').innerText = `${{ev.date}} • ${{ev.startTime}} - ${{ev.endTime}} (${{ev.durationMin}} mins)`;
            document.getElementById('modalSourceBadge').innerHTML = `<span class="card-source">${{ev.source}}</span>`;
            document.getElementById('modalLocation').innerText = ev.location ? `Location: ${{ev.location}}` : 'No location specified';
            
            const actionContainer = document.getElementById('modalActionContainer');
            if (ev.location && (ev.location.includes('teams') || ev.location.includes('meet') || ev.location.includes('http'))) {{
                actionContainer.innerHTML = `<a href="${{ev.location}}" target="_blank" class="action-btn">🔗 Join Video Meeting</a>`;
            }} else {{
                actionContainer.innerHTML = '';
            }}

            document.getElementById('eventModal').style.display = 'flex';
        }}

        function closeModal(e) {{
            document.getElementById('eventModal').style.display = 'none';
        }}

        // Initialize UI on load
        window.onload = () => {{
            updateUI();
        }};
    </script>
</body>
</html>
"""

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "calendar_dashboard.html")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Generated standalone calendar dashboard at: {output_path}")

if __name__ == "__main__":
    build_dashboard()
