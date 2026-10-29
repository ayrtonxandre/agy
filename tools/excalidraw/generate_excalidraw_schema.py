import json

def generate_schema():
    elements = []

    # 1. Camera Initial View (Starts on Title & Ingestion)
    elements.append({
        "type": "cameraUpdate",
        "width": 1200,
        "height": 900,
        "x": 0,
        "y": -50
    })

    # Header / Title Block
    elements.append({
        "type": "rectangle",
        "id": "header_card",
        "x": 60,
        "y": -30,
        "width": 1420,
        "height": 85,
        "backgroundColor": "#1e1e2e",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#3b82f6",
        "strokeWidth": 2
    })
    elements.append({
        "type": "text",
        "id": "title_main",
        "x": 85,
        "y": -18,
        "text": "AGY - ATHLETE & WORK INTELLIGENCE HUB",
        "fontSize": 24,
        "strokeColor": "#60a5fa"
    })
    elements.append({
        "type": "text",
        "id": "title_sub",
        "x": 85,
        "y": 14,
        "text": "Full Architecture Reference: Multi-Source Biometrics, Tri-Calendar Sync, Master Orchestrator, & GitHub Central Hub",
        "fontSize": 14,
        "strokeColor": "#cbd5e1"
    })

    # =========================================================================
    # ZONE 1: EXTERNAL SOURCES & WEARABLES (Left)
    # =========================================================================
    elements.append({
        "type": "rectangle",
        "id": "zone_sources",
        "x": 60,
        "y": 80,
        "width": 320,
        "height": 550,
        "backgroundColor": "#dbe4ff",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#4a9eed",
        "strokeWidth": 1,
        "opacity": 30
    })
    elements.append({
        "type": "text",
        "id": "zone_sources_title",
        "x": 80,
        "y": 95,
        "text": "[1] DATA SOURCES & WEARABLES",
        "fontSize": 16,
        "strokeColor": "#1e40af"
    })

    # Source 1: Apple Health / iPhone
    elements.append({
        "type": "rectangle",
        "id": "src_apple_health",
        "x": 80,
        "y": 130,
        "width": 280,
        "height": 95,
        "backgroundColor": "#ffd8a8",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#f59e0b",
        "strokeWidth": 2,
        "label": {
            "text": "Apple Health / iPhone\n(Health Auto Export App)\n• HTTP POST Webhook\n• Weight, Sleep, HR, Steps",
            "fontSize": 14
        }
    })

    # Source 2: Health Auto Export MCP Server
    elements.append({
        "type": "rectangle",
        "id": "src_hae_mcp",
        "x": 80,
        "y": 245,
        "width": 280,
        "height": 95,
        "backgroundColor": "#ffd8a8",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#f59e0b",
        "strokeWidth": 2,
        "label": {
            "text": "Health Auto Export MCP\n(iOS Local MCP :9000)\n• JSON-RPC Protocol\n• get_health_metrics, workouts",
            "fontSize": 14
        }
    })

    # Source 3: Garmin Connect Cloud
    elements.append({
        "type": "rectangle",
        "id": "src_garmin",
        "x": 80,
        "y": 360,
        "width": 280,
        "height": 95,
        "backgroundColor": "#a5d8ff",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#4a9eed",
        "strokeWidth": 2,
        "label": {
            "text": "Garmin Connect Cloud\n(Garmin Connect SSO)\n• Garth Session & MFA\n• 82+ Workouts, 770+ Sets",
            "fontSize": 14
        }
    })

    # Source 4: Client Schedule (M365)
    elements.append({
        "type": "rectangle",
        "id": "src_client_cal",
        "x": 80,
        "y": 475,
        "width": 280,
        "height": 95,
        "backgroundColor": "#eebefa",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#8b5cf6",
        "strokeWidth": 2,
        "label": {
            "text": "Client Calendar Feed\n(Clariane M365 ICS)\n• Corporate Engagements\n• Real-Time Commitments",
            "fontSize": 14
        }
    })

    # =========================================================================
    # ZONE 2: INGESTION & MASTER ORCHESTRATOR (Center-Left)
    # =========================================================================
    elements.append({
        "type": "rectangle",
        "id": "zone_orchestration",
        "x": 420,
        "y": 80,
        "width": 330,
        "height": 550,
        "backgroundColor": "#e5dbff",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#8b5cf6",
        "strokeWidth": 1,
        "opacity": 30
    })
    elements.append({
        "type": "text",
        "id": "zone_orchestration_title",
        "x": 440,
        "y": 95,
        "text": "[2] CORE ENGINES & DAEMONS",
        "fontSize": 16,
        "strokeColor": "#6b21a8"
    })

    # Master Orchestrator
    elements.append({
        "type": "rectangle",
        "id": "engine_orchestrator",
        "x": 440,
        "y": 130,
        "width": 290,
        "height": 115,
        "backgroundColor": "#d0bfff",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#7048e8",
        "strokeWidth": 2,
        "label": {
            "text": "Master Orchestrator (orchestrator.py)\n• Multi-Threaded HTTP :8080 (launchd)\n• Webhook: POST /api/health\n• Serves /workout & /calendar\n• Auto-sync to GitHub origin/main",
            "fontSize": 14
        }
    })

    # MCP Live Sync Engine
    elements.append({
        "type": "rectangle",
        "id": "engine_sync_mcp",
        "x": 440,
        "y": 260,
        "width": 290,
        "height": 85,
        "backgroundColor": "#ffd8a8",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#e8590c",
        "strokeWidth": 2,
        "label": {
            "text": "Health Auto Export Sync (sync_health_mcp.py)\n• Streamable MCP Session Client\n• Ingests 90-day Bio & Activity Diffs",
            "fontSize": 14
        }
    })

    # Garmin Strength Extractor
    elements.append({
        "type": "rectangle",
        "id": "engine_garmin",
        "x": 440,
        "y": 360,
        "width": 290,
        "height": 95,
        "backgroundColor": "#a5d8ff",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#1971c2",
        "strokeWidth": 2,
        "label": {
            "text": "Garmin Strength Engine (extract_garmin.py)\n• Garth OAuth Token Handshake\n• Muscle Group Volume (garmin_volume.py)\n• Historical Set & Rep Parsing",
            "fontSize": 14
        }
    })

    # Unified Tri-Calendar Engine
    elements.append({
        "type": "rectangle",
        "id": "engine_calendar",
        "x": 440,
        "y": 475,
        "width": 290,
        "height": 110,
        "backgroundColor": "#b2f2bb",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#2f9e44",
        "strokeWidth": 2,
        "label": {
            "text": "Tri-Calendar Engine (unified_calendar.py)\n• Aggregates Google, iCloud & M365\n• Deduplicates Shared Work Invites\n• True Free Window Calculation\n• Workout Injection (Push/Legs/Pull)",
            "fontSize": 14
        }
    })

    # =========================================================================
    # ZONE 3: DATASETS & LOCAL DATA HUB (Center-Right)
    # =========================================================================
    elements.append({
        "type": "rectangle",
        "id": "zone_storage",
        "x": 790,
        "y": 80,
        "width": 330,
        "height": 550,
        "backgroundColor": "#c3fae8",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#20c997",
        "strokeWidth": 1,
        "opacity": 30
    })
    elements.append({
        "type": "text",
        "id": "zone_storage_title",
        "x": 810,
        "y": 95,
        "text": "[3] DATASETS & AUTH VAULT",
        "fontSize": 16,
        "strokeColor": "#087f5b"
    })

    # Apple Health CSV Datasets
    elements.append({
        "type": "rectangle",
        "id": "ds_apple_csv",
        "x": 810,
        "y": 130,
        "width": 290,
        "height": 115,
        "backgroundColor": "#ffffff",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#0ca678",
        "strokeWidth": 2,
        "label": {
            "text": "Apple Health Datasets (CSV)\n• apple_body_composition.csv (Weight, Fat %)\n• apple_daily_activity.csv (Steps, Burn, HR)\n• apple_sleep.csv (Deep, REM, Core)\n• apple_mobility_biomechanics.csv\n• apple_workouts_history.csv",
            "fontSize": 13
        }
    })

    # Garmin Extracted Datasets
    elements.append({
        "type": "rectangle",
        "id": "ds_garmin_data",
        "x": 810,
        "y": 260,
        "width": 290,
        "height": 95,
        "backgroundColor": "#ffffff",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#1971c2",
        "strokeWidth": 2,
        "label": {
            "text": "Garmin Strength Datasets\n• garmin_extracted_workouts.csv (Sets)\n• garmin_extracted_workouts.json\n• garmin_workout_volume.json (Tonnage)",
            "fontSize": 14
        }
    })

    # Secrets & Config Store
    elements.append({
        "type": "rectangle",
        "id": "ds_secrets",
        "x": 810,
        "y": 370,
        "width": 290,
        "height": 105,
        "backgroundColor": "#ffc9c9",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#e03131",
        "strokeWidth": 2,
        "label": {
            "text": "Secure Secrets & Configs (.gitignore)\n• credentials.json & token.json (Google Cal)\n• drive_token.json (Drive v3 API)\n• garmin_tokens/ (Garth OAuth1/2)\n• ~/.icloud_calendar_config.json (CalDAV)",
            "fontSize": 13
        }
    })

    # Local System & Logging
    elements.append({
        "type": "rectangle",
        "id": "ds_logs",
        "x": 810,
        "y": 490,
        "width": 290,
        "height": 80,
        "backgroundColor": "#ffffff",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#495057",
        "strokeWidth": 2,
        "label": {
            "text": "System Logs & Diagnostic State\n• server_access.log (HTTP audit trace)\n• last_payload.json (Raw webhook cache)",
            "fontSize": 14
        }
    })

    # =========================================================================
    # ZONE 4: CLOUD ECOSYSTEM & INTEGRATIONS (Right)
    # =========================================================================
    elements.append({
        "type": "rectangle",
        "id": "zone_cloud",
        "x": 1160,
        "y": 80,
        "width": 320,
        "height": 550,
        "backgroundColor": "#fff3bf",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#f59e0b",
        "strokeWidth": 1,
        "opacity": 30
    })
    elements.append({
        "type": "text",
        "id": "zone_cloud_title",
        "x": 1180,
        "y": 95,
        "text": "[4] CLOUD & ENTERPRISE HUB",
        "fontSize": 16,
        "strokeColor": "#b45309"
    })

    # GitHub Central Hub & Pages
    elements.append({
        "type": "rectangle",
        "id": "cloud_gdrive",
        "x": 1180,
        "y": 130,
        "width": 280,
        "height": 135,
        "backgroundColor": "#ffd8a8",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#d9480f",
        "strokeWidth": 2,
        "label": {
            "text": "GitHub Central Hub & Pages\nRepo: 'ayrtonxandre/agy'\n• Single source of truth (origin/main)\n• Automated git commit & push\n• Live Pages: ayrtonxandre.github.io/agy\n• Complete commit history & diff safety",
            "fontSize": 13
        }
    })

    # Multi-Calendar Live APIs
    elements.append({
        "type": "rectangle",
        "id": "cloud_cal_apis",
        "x": 1180,
        "y": 280,
        "width": 280,
        "height": 115,
        "backgroundColor": "#b2f2bb",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#2b8a3e",
        "strokeWidth": 2,
        "label": {
            "text": "Calendar APIs (Live Read/Write)\n• Google Calendar API v3 (google_calendar_api.py)\n  Full edit rights on Artefact Work Cal\n• iCloud CalDAV API (icloud_calendar.py)\n  Personal schedule sync & workout injection",
            "fontSize": 13
        }
    })

    # GCP Discovery Engine & Excalidraw MCP
    elements.append({
        "type": "rectangle",
        "id": "cloud_enterprise",
        "x": 1180,
        "y": 410,
        "width": 280,
        "height": 140,
        "backgroundColor": "#eebefa",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#7048e8",
        "strokeWidth": 2,
        "label": {
            "text": "GCP Vertex & Excalidraw Tooling\n• GCP privategpt-437907 Discovery Engine\n  (excalidraw_1787583517655_diagrams)\n• Federated Excalidraw MCP Connector\n  (mcp.excalidraw.com/mcp)\n• Programmatic Diagram Export URL",
            "fontSize": 13
        }
    })

    # =========================================================================
    # ZONE 5: LIVE DASHBOARDS & CONSUMER APPS (Bottom)
    # =========================================================================
    elements.append({
        "type": "rectangle",
        "id": "zone_dashboards",
        "x": 60,
        "y": 660,
        "width": 1420,
        "height": 210,
        "backgroundColor": "#d3f9d8",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#22c55e",
        "strokeWidth": 1,
        "opacity": 30
    })
    elements.append({
        "type": "text",
        "id": "zone_dashboards_title",
        "x": 80,
        "y": 675,
        "text": "[5] INTERACTIVE INTELLIGENCE DASHBOARDS (Served by Orchestrator :8080)",
        "fontSize": 16,
        "strokeColor": "#15803d"
    })

    # Dashboard 1: ATHX Unified Athlete Dashboard
    elements.append({
        "type": "rectangle",
        "id": "dash_athx",
        "x": 80,
        "y": 705,
        "width": 660,
        "height": 145,
        "backgroundColor": "#ffffff",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#1971c2",
        "strokeWidth": 2,
        "label": {
            "text": "ATHX 2027 Athlete Performance Dashboard (garmin_workout.html)\nGenerated by: generate_unified_athlete_dashboard.py\n• ACWR Fatigue Engine: Acute (7d) vs Chronic (28d) Workload Monitoring\n• Muscle Group Volume Radar & 82-session progressive overload curves\n• 90-day Apple Health Ingestion: Body Fat, Lean Mass, Sleep Architecture, Resting HR\n• Live Browser UI: http://localhost:8080/workout",
            "fontSize": 14
        }
    })

    # Dashboard 2: Tri-Calendar Dashboard
    elements.append({
        "type": "rectangle",
        "id": "dash_calendar",
        "x": 780,
        "y": 705,
        "width": 680,
        "height": 145,
        "backgroundColor": "#ffffff",
        "fillStyle": "solid",
        "roundness": {"type": 3},
        "strokeColor": "#2f9e44",
        "strokeWidth": 2,
        "label": {
            "text": "Smart Unified Calendar Dashboard (calendar_dashboard.html)\nGenerated by: generate_calendar_dashboard.py\n• 3-Way Schedule Consolidation: Artefact (Google) + Personal (iCloud) + Client (M365)\n• Open Training Window Detection: Auto-aligns Gym & Crossfit routines\n• Live Workout Injection with warmups, working sets & target intensities\n• Live Browser UI: http://localhost:8080/calendar",
            "fontSize": 14
        }
    })

    # =========================================================================
    # CONNECTING ARROWS & DATA FLOWS
    # =========================================================================

    # 1. Apple Health Webhook -> Orchestrator
    elements.append({
        "type": "arrow",
        "id": "arr_wh_orch",
        "x": 360,
        "y": 175,
        "width": 80,
        "height": 0,
        "points": [[0, 0], [80, 0]],
        "strokeColor": "#f59e0b",
        "strokeWidth": 2,
        "endArrowhead": "arrow",
        "label": {"text": "POST /api/health", "fontSize": 13}
    })

    # 2. Apple Health MCP -> sync_health_mcp.py
    elements.append({
        "type": "arrow",
        "id": "arr_mcp_sync",
        "x": 360,
        "y": 290,
        "width": 80,
        "height": 0,
        "points": [[0, 0], [80, 0]],
        "strokeColor": "#e8590c",
        "strokeWidth": 2,
        "endArrowhead": "arrow",
        "label": {"text": "MCP :9000 Stream", "fontSize": 13}
    })

    # 3. Garmin Cloud -> extract_garmin.py
    elements.append({
        "type": "arrow",
        "id": "arr_garmin_ext",
        "x": 360,
        "y": 405,
        "width": 80,
        "height": 0,
        "points": [[0, 0], [80, 0]],
        "strokeColor": "#1971c2",
        "strokeWidth": 2,
        "endArrowhead": "arrow",
        "label": {"text": "Garth SSO Auth", "fontSize": 13}
    })

    # 4. Client ICS -> Unified Calendar Engine
    elements.append({
        "type": "arrow",
        "id": "arr_client_cal",
        "x": 360,
        "y": 520,
        "width": 80,
        "height": 0,
        "points": [[0, 0], [80, 0]],
        "strokeColor": "#8b5cf6",
        "strokeWidth": 2,
        "endArrowhead": "arrow",
        "label": {"text": "ICS Feed Import", "fontSize": 13}
    })

    # 5. Orchestrator -> Apple Health Datasets (Write CSVs)
    elements.append({
        "type": "arrow",
        "id": "arr_orch_csv",
        "x": 730,
        "y": 175,
        "width": 80,
        "height": 0,
        "points": [[0, 0], [80, 0]],
        "strokeColor": "#0ca678",
        "strokeWidth": 2,
        "endArrowhead": "arrow",
        "label": {"text": "Update CSVs", "fontSize": 13}
    })

    # 6. Garmin Engine -> Garmin Datasets
    elements.append({
        "type": "arrow",
        "id": "arr_garmin_ds",
        "x": 730,
        "y": 305,
        "width": 80,
        "height": 0,
        "points": [[0, 0], [80, 0]],
        "strokeColor": "#1971c2",
        "strokeWidth": 2,
        "endArrowhead": "arrow",
        "label": {"text": "Dump JSON/CSV", "fontSize": 13}
    })

    # 7. Calendar Engine <-> Calendar APIs
    elements.append({
        "type": "arrow",
        "id": "arr_cal_api",
        "x": 730,
        "y": 525,
        "width": 450,
        "height": -185,
        "points": [[0, 0], [150, 0], [450, -185]],
        "strokeColor": "#2b8a3e",
        "strokeWidth": 2,
        "endArrowhead": "arrow",
        "label": {"text": "OAuth / CalDAV Sync", "fontSize": 13}
    })

    # 8. Orchestrator auto-sync -> GitHub Hub
    elements.append({
        "type": "arrow",
        "id": "arr_orch_gdrive",
        "x": 730,
        "y": 150,
        "width": 450,
        "height": 0,
        "points": [[0, 0], [450, 0]],
        "strokeColor": "#d9480f",
        "strokeWidth": 2,
        "endArrowhead": "arrow",
        "label": {"text": "git_auto_commit_and_push()", "fontSize": 13}
    })

    # 9. Local Datasets -> ATHX Athlete Dashboard
    elements.append({
        "type": "arrow",
        "id": "arr_ds_athx",
        "x": 810,
        "y": 200,
        "width": -400,
        "height": 505,
        "points": [[0, 0], [-30, 250], [-400, 505]],
        "strokeColor": "#1971c2",
        "strokeWidth": 2,
        "endArrowhead": "arrow",
        "strokeStyle": "dashed",
        "label": {"text": "Biometrics + Garmin Sets Ingest", "fontSize": 13}
    })

    # 10. Calendar Engine -> Calendar Dashboard
    elements.append({
        "type": "arrow",
        "id": "arr_cal_dash",
        "x": 720,
        "y": 585,
        "width": 380,
        "height": 120,
        "points": [[0, 0], [200, 60], [380, 120]],
        "strokeColor": "#2f9e44",
        "strokeWidth": 2,
        "endArrowhead": "arrow",
        "strokeStyle": "dashed",
        "label": {"text": "Inject Open Windows & Workouts", "fontSize": 13}
    })

    # Final Camera Overview (Camera XXL: 1600x1200)
    elements.append({
        "type": "cameraUpdate",
        "width": 1600,
        "height": 1200,
        "x": -30,
        "y": -80
    })

    return elements

if __name__ == "__main__":
    els = generate_schema()
    with open("excalidraw_elements.json", "w", encoding="utf-8") as f:
        json.dump(els, f, indent=2)
    diag = {
        "type": "excalidraw",
        "version": 2,
        "source": "https://excalidraw.com",
        "elements": els,
        "appState": {"viewBackgroundColor": "#0f172a", "gridSize": 20}
    }
    with open("AGY_ARCHITECTURE_DIAGRAM.excalidraw", "w", encoding="utf-8") as f:
        json.dump(diag, f, indent=2)
    print(f"Generated {len(els)} elements successfully into excalidraw_elements.json & AGY_ARCHITECTURE_DIAGRAM.excalidraw")
