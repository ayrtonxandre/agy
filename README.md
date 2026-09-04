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
                             ├───►│  Master Orchestrator   │───►│ Google Drive Cloud Hub │
 ⌚ Garmin Cloud             │    │  (Python :8080 launchd)│    │ ("AGY-Intelligence-Hub")
    (Garth OAuth / MFA) ─────┘    └───────────┬────────────┘    └────────────────────────┘
                                              │
                                              ▼
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

2. **`drive_sync.py`**:
   * Decoupled cloud storage layer connecting to Google Drive v3 API.
   * Manages dedicated cloud folder: **`AGY - Intelligence Hub`**.
   * `push`: Uploads biometrics, workout volume, and HTML dashboards.
   * `pull`: Downloads latest datasets and dashboards on demand on any machine.
   * `status`: Compares local vs remote files and timestamps.

3. **`excalidraw_tool.py`**:
   * Bridges Google Cloud Discovery Engine (Data Store: `excalidraw_1787583517655_diagrams`) and the federated Excalidraw MCP server (`https://mcp.excalidraw.com/mcp`).
   * Programmatically builds hand-drawn architecture diagrams and exports them to live shareable URLs.

4. **`unified_calendar.py` & `generate_calendar_dashboard.py`**:
   * Synchronizes Artefact Google Calendar, iCloud CalDAV, and Client M365 schedules.
   * Injects structured workout plans (Push, Pull, Legs) with warmup sets, top working weights, reps, and rest intervals.

5. **`extract_garmin_strength.py` & `generate_unified_athlete_dashboard.py`**:
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

## 🔐 Security & Secrets
All tokens, OAuth credentials, and private keys (`credentials.json`, `token.json`, `drive_token.json`, `gcp_token.json`, `garmin_tokens/`) are strictly git-ignored and never committed to version control.
