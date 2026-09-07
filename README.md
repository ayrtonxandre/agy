# ⚡ AGY - Athlete & Work Intelligence Hub

An autonomous agentic intelligence platform integrating multi-source athletic biometrics, strength analytics, smart multi-calendar scheduling, Excalidraw architecture generation, and on-demand Google Drive cloud synchronization.

---

## 🏗️ Architecture Overview

```
                                  ┌────────────────────────┐
                                  │   Google Cloud GCP     │
                                  │   (privategpt-437907)  │
                                  │   • Vertex AI / Search │
                                  │   • Excalidraw MCP     │
                                  └───────────┬────────────┘
                                              │
 📱 iPhone / Apple Watch                      ▼
    (Health Auto Export) ────┐    ┌────────────────────────┐    ┌────────────────────────┐
    • Live MCP :9000/mcp     ├───►│  Master Orchestrator   │───►│ Google Drive Cloud Hub │
    • Webhook :8080/api      │    │  (Python :8080 launchd)│    │ ("AGY-Intelligence-Hub")
                             │    └───────────┬────────────┘    └────────────────────────┘
 ⌚ Garmin Cloud             │                │
    (Garth OAuth / MFA) ─────┘                ▼
                                  ┌────────────────────────┐
                                  │  Tri-Calendar Sync     │
                                  │  • Artefact Google Cal │
                                  │  • iCloud Private Cal  │
                                  │  • Microsoft 365 ICS   │
                                  └────────────────────────┘
```

---

## 🚀 Key Modules

1. **`orchestrator.py`**:
   * Multi-threaded HTTP daemon listening on port `8080`.
   * Webhook endpoint: `POST /api/health` for real-time ingestion of iOS Health Auto Export payloads (weight, body fat %, sleep stages, steps).
   * Serves local dashboards at `/workout` and `/calendar`.
   * Automatically triggers background Google Drive cloud sync (`auto_push`) on incoming data.

2. **`sync_health_mcp.py`**:
   * Model Context Protocol (MCP) client connecting directly to the Health Auto Export server running on iOS (`http://<iPhone-IP>:9000/mcp`).
   * Queries real-time Apple Health biometrics (`get_health_metrics`) and workouts (`get_workouts`) on demand over local Wi-Fi.
   * Directly updates `apple_body_composition.csv`, `apple_sleep.csv`, `apple_daily_activity.csv`, and `apple_workouts_history.csv`.
   * Supports optional `--push` flag to trigger immediate cloud synchronization to Google Drive.

3. **`drive_sync.py`**:
   * Decoupled cloud storage layer connecting to Google Drive v3 API.
   * Manages dedicated cloud folder: **`AGY - Intelligence Hub`**.
   * `push`: Uploads biometrics, workout volume, and HTML dashboards.
   * `pull`: Downloads latest datasets and dashboards on demand on any machine.
   * `status`: Compares local vs remote files and timestamps.

4. **`excalidraw_tool.py`**:
   * Bridges Google Cloud Discovery Engine (Data Store: `excalidraw_1787583517655_diagrams`) and the federated Excalidraw MCP server (`https://mcp.excalidraw.com/mcp`).
   * Programmatically builds hand-drawn architecture diagrams and exports them to live shareable URLs.

5. **`unified_calendar.py` & `generate_calendar_dashboard.py`**:
   * Synchronizes Artefact Google Calendar, iCloud CalDAV, and Client M365 schedules.
   * Injects structured workout plans (Push, Pull, Legs) with warmup sets, top working weights, reps, and rest intervals.

6. **`extract_garmin_strength.py` & `generate_unified_athlete_dashboard.py`**:
   * Extracts historical strength sets (771+ sets) from Garmin Connect.
   * Generates interactive Chart.js analytics dashboard (`garmin_workout.html`).

---

## 💻 Cross-Machine Setup Guide

### Setting up on Machine 2 (Other Computer)

1. **Clone Repository**:
   ```bash
   git clone git@github.com:ayrtonxandre/agy.git
   cd agy
   ```

2. **Add Credentials**:
   * Copy `credentials.json` and `drive_token.json` from Machine 1 (or run OAuth login on first execution).

3. **Pull All Cloud Data & Dashboards on Demand**:
   ```bash
   python drive_sync.py pull
   ```
   *Instantly downloads all Apple Health CSVs, Garmin volumes, and HTML dashboards from Google Drive.*

4. **Run Local Orchestrator (Optional)**:
   ```bash
   python orchestrator.py serve
   ```
   Open `http://localhost:8080/workout` or `http://localhost:8080/calendar` in your browser.

---

## 📲 Live Health Auto Export MCP Ingestion

You can query your live Apple Health metrics and workouts directly from your iPhone over your local Wi-Fi via the built-in MCP server in the **Health Auto Export** app.

### 1. Start Server on iPhone
1. Open **Health Auto Export** on your iPhone.
2. Navigate to **Automations** (or sidebar) $\rightarrow$ **Server**.
3. Choose **HTTP** (recommended) or **TCP**.
4. Tap **Start Server**.
5. Copy the **Bearer Token** displayed under your server URL (e.g., `http://192.168.1.163:9000/mcp`).
   > *Note: Keep the app open in the foreground on your iPhone while querying, as iOS suspends background network sockets when locked or backgrounded.*

### 2. Run Live Sync
Pull the latest metrics (sleep stages, weight, body fat %, steps, workouts) into your local AGY CSVs:
```bash
# Pass token directly
python sync_health_mcp.py --url http://192.168.1.163:9000/mcp --token "<YOUR_BEARER_TOKEN>"

# Or set as environment variable
export HAE_MCP_TOKEN="<YOUR_BEARER_TOKEN>"
python sync_health_mcp.py

# Pull data and automatically push updates to Google Drive Cloud Hub
python sync_health_mcp.py --push
```

---

## 🔐 Security & Secrets
All tokens, OAuth credentials, and private keys (`credentials.json`, `token.json`, `drive_token.json`, `gcp_token.json`, `garmin_tokens/`, `hae_token.txt`) are strictly git-ignored and never committed to version control.
