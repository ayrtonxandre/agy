# ⚡ ATHX (AGY) • Master Athlete & Work Intelligence Hub

An autonomous agentic intelligence platform engineered for the **ATHX Games 2027**, integrating multi-source athletic biometrics (Garmin Connect & Apple Health), LLM-powered workout note parsing, strength and hypertrophy volume analytics (MEV/MRV), smart tri-calendar scheduling, Excalidraw architecture generation, and automated GitHub continuous synchronization.

---

## 📑 Table of Contents
- [🏗️ Architecture Overview](#️-architecture-overview)
- [⚡ One-Word Master Command: `athx`](#-one-word-master-command-athx)
- [🧠 ATHX 2027 Core Intelligence & Analytics](#-athx-2027-core-intelligence--analytics)
- [🤖 LLM Activity Note & WOD Parser](#-llm-activity-note--wod-parser)
- [🦾 ATHX AI Performance Coach & Sports Scientist](#-athx-ai-performance-coach--sports-scientist)
- [🚀 Key Modules](#-key-modules)
- [⚙️ Environment Variables & Configuration](#️-environment-variables--configuration)
- [🐳 Docker & SWAG Remote Server Deployment](#-docker--swag-remote-server-deployment)
- [💻 Cross-Machine Setup Guide](#-cross-machine-setup-guide)
- [📲 Live Health Auto Export MCP Ingestion](#-live-health-auto-export-mcp-ingestion)
- [📊 Executive Reporting & Slide Decks](#-executive-reporting--slide-decks)
- [🔐 Security & Secrets](#-security--secrets)

---

## 🏗️ Architecture Overview

```text
                                  ┌───────────────────────────┐
                                  │     Google Cloud GCP      │
                                  │   (privategpt-437907)     │
                                  │   • Vertex AI / Gemini    │
                                  │   • Excalidraw MCP        │
                                  └─────────────┬─────────────┘
                                                │
 📱 iPhone / Apple Watch                        ▼
    (Health Auto Export) ────┐    ┌───────────────────────────┐    ┌───────────────────────────┐
    • Live MCP :9000/mcp     ├───►│     ATHX Orchestrator     ├───►│     GitHub Repository     │
    • Webhook :8080/api      │    │  (Python :8080 / launchd) │    │  • Single Source of Truth │
                             │    └─────────────┬─────────────┘    │  • Auto-Sync & History    │
 ⌚ Garmin Cloud             │                  │                  │  • GitHub Pages Hosting   │
    (Garth OAuth / MFA) ─────┤                  ▼                  └───────────────────────────┘
    • Strength & Running Sets │    ┌───────────────────────────┐
    • Multi-Provider LLM     │    │   ATHX Analytics Engine   │
      WOD & Note Decipherer  │    │   • MEV / MAV / MRV Bands │
                             │    │   • e1RM (Reps <= 10)     │
                             │    │   • ACWR & Foster Monotony│
                             │    │   • Sleep & Recovery Comp │
                             │    │   • Full Data Audit Trail │
                             │    └─────────────┬─────────────┘
                             │                  │
                             │                  ▼
                             │    ┌───────────────────────────┐
                             │    │    Tri-Calendar Sync      │
                             │    │    • Artefact Google Cal  │
                             └───►│    • iCloud Private Cal   │
                                  │    • Microsoft 365 ICS    │
                                  └───────────────────────────┘
```

---

## ⚡ One-Word Master Command: `athx`

Launch the complete athlete & work intelligence pipeline with a single word from **any** terminal directory:

```bash
athx
```

### 📺 Visual Progress Display
While running, `athx` renders a live, fluid loading bar and animated spinner across all sub-pipelines:

```text
⚡ ATHX 2027 • Master Athlete & Intelligence Hub
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📁 Hub Location : /Users/ayrton.andre/Documents/work/AGY
  🐍 Environment  : /Users/ayrton.andre/Documents/work/.venv/bin/python
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [████████████████████░░░░] 83%  ⠋  [5/6] Rebuilding ATHX 2027 Athlete Headquarters...
  ✔ [1/6] GitHub: Branch is up to date with origin/main (1.8s)
  ✔ [2/6] Apple Health: Biometrics up to date (Cloud Hub & Webhook) (0.0s)
  ✔ [3/6] Garmin Connect: Synchronized Strength, Running & Workouts (2.7s)
  ✔ [4/6] Multi-Calendar: 3 calendars synced (calendar_dashboard.html) (11.2s)
  ✔ [5/6] ATHX 2027: Rebuilt athlete headquarters (garmin_workout.html & index.html) (0.2s)
  ✔ [6/6] GitHub: Synced & pushed latest datasets & dashboards to origin/main (1.5s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✨ ATHX Orchestration Complete! (Total time: 17.4s)
  🏆 Athlete Dashboard  : file:///Users/ayrton.andre/Documents/work/AGY/garmin_workout.html
  🌐 Live GitHub Pages  : https://ayrtonxandre.github.io/agy/
  📅 Calendar Dashboard : file:///Users/ayrton.andre/Documents/work/AGY/calendar_dashboard.html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 🎛️ CLI Options & Flags
| Command | Action |
| :--- | :--- |
| `athx` | Standard full sync, dashboard rebuild, automated GitHub push, and browser launch |
| `athx coach` | Displays AI Coach executive verdict and 7-day tactical microcycle prescription |
| `athx coach --full` | Renders comprehensive ANSI-colorized sports science debriefing |
| `athx coach --ask "<question>"` | Direct consultation with the AI Coach grounded in audited telemetry |
| `athx ask "<question>"` | Fast alias to query the AI Coach (`-q` flag supported) |
| `athx coach --force` | Re-generates sports science briefing bypassing telemetry cache |
| `athx coach --json` | Outputs raw briefing or Q&A consultation payload in JSON format |
| `athx --no-push` | Skips pushing updated datasets & HTML to GitHub after sync |
| `athx --no-open` | Runs headless (skips opening the browser) |
| `athx --serve` | Starts local HTTP daemon on `http://localhost:8080` (`/workout`, `/calendar`, `/api/coach`) |
| `athx --install` | Installs/symlinks `athx` into `~/.local/bin/athx` and configures shell `$PATH` |
| `athx --skip-git` | Skips pulling latest commits from GitHub |
| `athx --skip-health` | Skips Apple Health biometrics & sleep sync |
| `athx --skip-garmin` | Skips Garmin Connect API extraction |
| `athx --skip-cal` | Skips multi-calendar synchronization |

---

## 🧠 ATHX 2027 Core Intelligence & Analytics

The intelligence engine is decoupled into a centralized configuration ([`athx_config.py`](file:///Users/ayrton.andre/Documents/work/AGY/athx_config.py)) and a rigorous data-cleaning/telemetry pipeline ([`athx_analytics.py`](file:///Users/ayrton.andre/Documents/work/AGY/athx_analytics.py)).

### 1. Competition Benchmarks (Tier-1 Non-Pro Standards)
Target Date: **`2027-05-27`** | Athlete Mass Target: **`85.0 kg`** (Gain/Recomp from ~79 kg)

| Event | Benchmark Standard | Measurement / Exercises Mapped |
| :--- | :--- | :--- |
| **Shoulder-to-Overhead (S2O)** | **65.0 kg** | Push Press, Strict OHP, Military Press, Clean & Jerk |
| **Back Squat** | **125.0 kg** | Full-depth Barbell Back Squat (e1RM $\le 10$ reps) |
| **Deadlift** | **160.0 kg** | Conventional / Sumo Floor Deadlift |
| **5km Running Pace** | **4:30 / km** (270s/km) | Aerobic threshold continuous running |
| **Sandbag Carry / Grip** | **60.0 kg** | Loaded Carries, Farmer's Walk, Trap Bar Carry |

### 2. Scientific Hypertrophy Tracking (Mike Israetel Methodology)
- Tracks weekly direct working sets per muscle group against calibrated **MEV** (Minimum Effective Volume), **MAV** (Maximum Adaptive Volume), and **MRV** (Maximum Recoverable Volume) bands.
- Exposes real-time volume alerts (e.g. Quads & Hamstrings below MEV thresholds).
- Resolves Garmin's exercise mapping bugs (e.g. preventing `"press"` from misclassifying into Legs).

### 3. Workload, Monotony & Fatigue Monitoring
- **Dynamic ACWR (Acute:Chronic Workload Ratio)**: Evaluated dynamically as of the latest activity date using exponential or rolling 7-day acute vs 28-day chronic volume.
- **Foster Training Monotony & Strain**: Quantifies training variability ($\text{Mean Daily Load} / \text{Standard Deviation}$) and weekly systemic strain ($\text{Weekly Load} \times \text{Monotony}$) to preempt overtraining and injury risks.

### 4. Biometrics, Recomposition & Sleep Hygiene
- **Body Recomposition**: 7-day smoothed rolling average curve isolating true tissue gain from daily hydration fluctuations towards the 85.0 kg target.
- **Sleep Quality Filter**: Drops non-wear periods ($< 3\text{h}$) and excludes recording overflows ($\text{In\_Bed} > 14\text{h}$), computing genuine sleep efficiency and stage distribution.
- **5-Component Recovery Composite**: Transparent score combining resting heart rate (RHR), sleep duration vs 8h baseline, sleep efficiency %, step volume, and workout strain.

### 5. Transparent Data Audit Trail
- Enforces an analysis floor at **`2026-05-01`** (excluding pre-cycle test records from active KPIs while maintaining baseline chronic lookback).
- Imputes "Unknown" watch sets within a session when load/rep signatures match preceding sets.
- Interactive audit panel on the dashboard with exportable JSON audit reports.

---

## 🤖 LLM Activity Note & WOD Parser

[`garmin_note_parser.py`](file:///Users/ayrton.andre/Documents/work/AGY/garmin_note_parser.py) deciphers free-text Garmin activity notes, CrossFit WODs, EMOMs, AMRAPs, and custom gym notes into structured ATHX exercise sets and volume metrics.

### Multi-Provider Architecture with Fallback
The parser evaluates providers in strict priority order based on available API keys:
1. **Google Gemini**: Uses `gemini-1.5-flash` or `gemini-2.0` via `GEMINI_API_KEY` (or `GOOGLE_API_KEY`).
2. **OpenAI**: Uses `gpt-4o-mini` via `OPENAI_API_KEY` (supports custom endpoints via `OPENAI_BASE_URL` / Ollama).
3. **Anthropic**: Uses `claude-3-5-sonnet` via `ANTHROPIC_API_KEY`.
4. **Local Fallback**: Fast deterministic regex & heuristic parser when offline or without API keys.

### Seamless Extraction Integration
Whenever a Garmin activity has notes attached (or was recorded without watch set-tracking), [`extract_garmin_strength.py`](file:///Users/ayrton.andre/Documents/work/AGY/extract_garmin_strength.py) calls `garmin_note_parser`:
- Parses complex syntax: `4 rounds: 15 Front Squats : 60Kg, 500m rowing`, `5x5 Deadlift @ 120kg`, `EMOM 10: 3 Push Press 60kg`.
- Normalizes exercise names to 62+ canonical ATHX exercises (e.g. `"rdl"` $\rightarrow$ `"Romanian Deadlift"`, `"strict press"` $\rightarrow$ `"Overhead Press"`).
- Categorizes dominant session splits (Push, Pull, Legs, Full Body).
- Validates plausible loads and generates structured set records in `garmin_extracted_workouts.json`.

---

## 🦾 ATHX AI Performance Coach & Sports Scientist

[`athx_ai_coach.py`](file:///Users/ayrton.andre/Documents/work/AGY/athx_ai_coach.py) acts as an autonomous high-performance strength coach and sports scientist for the ATHX Games 2027.

### Multi-Provider Gateway & Deterministic Heuristics
- **LLM Gateway**: Queries leading frontier models via REST API: Google Gemini (`gemini-2.5-flash`), OpenAI (`gpt-4o-mini`), and Anthropic (`claude-3-5-haiku`).
- **100% Offline Deterministic Engine**: When offline or without API keys, an authentic sports science expert system evaluates the exact numbers (e1RMs, volume gaps vs MEV/MRV, ACWR, Foster monotony, sleep duration) to produce zero-hallucination, evidence-grounded debriefings.
- **Smart Fingerprint Hashing**: Hashes incoming telemetry digests (`fingerprint` MD5) to prevent redundant API calls; reuses existing briefings when data has not changed.

### Interactive Q&A Consultation Engine
Ask the coach any strategic or tactical question directly from the terminal or REST API:
```bash
athx ask "What should I focus on for today's workout?"
athx ask "How is my 5km running pace progressing toward the 4:30 standard?"
athx coach --ask "What is causing the stagnation in my floor deadlift?"
```
The coach synthesizes an authoritative answer referencing actual numbers from the athlete's telemetry digest, breaking it down into:
- **Bottom-Line**: Current KPI level, event standards, and exact gap.
- **Sports Science Analysis**: Root cause (e.g. quad volume starved below MEV, grip deficit, systemic strain).
- **Microcycle Prescription**: Day-by-day action directive with exact compound exercises, sets, reps, load % e1RM, rest periods, and conditioning tempo.

### Multi-Interface Accessibility
- **Terminal CLI**: Run `athx coach` for the 7-day tactical microcycle or `athx coach --full` for the complete ANSI debriefing. The executive readiness verdict is also automatically displayed at the end of every `athx` pipeline execution.
- **Athlete Headquarters**: An interactive, collapsible HTML briefing card is dynamically embedded at the top of [`garmin_workout.html`](file:///Users/ayrton.andre/Documents/work/AGY/garmin_workout.html) and [`index.html`](file:///Users/ayrton.andre/Documents/work/AGY/index.html).
- **REST Endpoints**: When running `athx --serve` (port 8080), endpoints are exposed for iOS Shortcuts, webhooks, or third-party integrations:
  - `GET /api/coach`: Retrieves the latest structured briefing JSON.
  - `POST /api/coach/ask`: Interactive JSON consultation endpoint (`{"question": "..."}`).
- **Persisted Artifacts**: Briefings are saved locally as [`athlete_coach_briefing.json`](file:///Users/ayrton.andre/Documents/work/AGY/athlete_coach_briefing.json) and formatted Markdown [`athlete_coach_briefing.md`](file:///Users/ayrton.andre/Documents/work/AGY/athlete_coach_briefing.md).

---

## 🚀 Key Modules

| Module | Description |
| :--- | :--- |
| **`athx`** | Single-word master CLI orchestrator with fluid progress display, cross-machine path resolution, and argument parsing. |
| **`athx_ai_coach.py`** | Autonomous Sports Science AI briefing generator synthesizing telemetry into elite coaching debriefs and microcycle prescriptions. |
| **`garmin_note_parser.py`** | Multi-provider LLM parser extracting structured exercise sets and splits from free-text workout notes and CrossFit WODs. |
| **`athx_config.py`** | Single source of truth: 2027 benchmarks, 62 exercise mappings, MEV/MAV/MRV bands, and plausible load boundaries. |
| **`athx_analytics.py`** | Core analytical telemetry engine: data cleaning, unknown imputation, e1RM restrictions, ACWR, Foster strain, and recovery composite. |
| **`extract_garmin_strength.py`** | Unofficial Garmin Connect extractor via `garth` OAuth; handles strength sets, running telemetry, and workout notes. |
| **`generate_unified_athlete_dashboard.py`** | Zero-hardcoded dashboard generator outputting `garmin_workout.html` and `index.html` (for GitHub Pages). |
| **`orchestrator.py`** | Local HTTP daemon (port 8080) with webhook endpoints (`POST /api/health`) and debounced GitHub auto-push. |
| **`sync_health_mcp.py`** | Client querying Apple Health biometrics and workouts over local Wi-Fi from the Health Auto Export iOS MCP server. |
| **`unified_calendar.py` & `generate_calendar_dashboard.py`** | Tri-calendar sync (Artefact Google Cal, iCloud CalDAV, Client M365) injecting structured workout schedules. |
| **`drive_sync.py`** | Manual cold-archive and recovery utility synchronizing datasets, dashboards, briefings, and decks with Google Drive Hub. |
| **`excalidraw_tool.py`** | Generates hand-drawn system architecture diagrams using GCP Discovery Engine and Excalidraw MCP. |
| **`setup_athx.py`** | Automatic installer registering global `athx` command, shell `$PATH`, and Antigravity whitelist permissions. |

### 📈 Current Dataset Footprint
* **Garmin Total Activities**: 158 activities (98 strength sessions, 10 running sessions, 57 cardio/hiking/other).
* **Extracted Strength Sets**: 1,953 individual sets with reps, loads, and volumes.
* **Biometrics Coverage**: 7+ months of continuous weight, body fat %, sleep stages, and daily steps.

---

## ⚙️ Environment Variables & Configuration

Create a `.env` file in the root directory (refer to [`.env.example`](file:///Users/ayrton.andre/Documents/work/AGY/.env.example)):

```bash
# ==============================================================================
# ATHX / AGY Environment Configuration
# ==============================================================================

# Timezone
TZ=Europe/Paris

# Local Daemon Port
PORT=8080

# Optional: Health Auto Export MCP Token (for iOS automation webhook security)
HAE_MCP_TOKEN=your_mcp_secret_token_here

# Optional: LLM Providers for Garmin Activity Notes & WOD Deciphering
# Priority: GEMINI_API_KEY -> OPENAI_API_KEY -> ANTHROPIC_API_KEY -> Local Smart Fallback
GEMINI_API_KEY=AIzaSy...
# OPENAI_API_KEY=sk-...
# OPENAI_BASE_URL=https://api.openai.com/v1
# OPENAI_MODEL=gpt-4o-mini
# ANTHROPIC_API_KEY=sk-ant-...

# Server / Docker Deployment
DOCKER_ROOT=/home/user/docker
AGY_HOST_PORT=8095
SYNC_INTERVAL_HOURS=6
```

---

## 🐳 Docker & SWAG Remote Server Deployment

AGY can be containerized and hosted behind **LinuxServer.io SWAG** (Nginx reverse proxy + SSL) to allow accessing dashboards remotely and receiving automated iOS Health webhooks 24/7.

Detailed instructions: [Docker & SWAG Deployment Guide](file:///Users/ayrton.andre/Documents/work/AGY/docs/how-to/docker-deployment.md)

### Quick Start (Production Server):
```bash
# 1. Place agy.subdomain.conf into SWAG proxy-confs
cp swag/agy.subdomain.conf ${DOCKER_ROOT}/swag/nginx/proxy-confs/

# 2. Launch AGY on the 'lsio' external docker network
docker compose -f docker-compose.prod.yml up -d
```

* **Web UI**: `https://agy.yourdomain.com/` (Athlete Dashboard) and `/calendar`
* **Health Auto Export Webhook**: `https://agy.yourdomain.com/api/health`
* **Docker Healthcheck**: `https://agy.yourdomain.com/health`

---

## 💻 Cross-Machine Setup Guide

### Setting up on Machine 2 (Secondary Laptop / Desktop)

1. **Clone Repository (Single Source of Truth)**:
   ```bash
   git clone git@github.com:ayrtonxandre/agy.git
   cd agy
   ```
   *All datasets (CSVs, JSONs), dashboards (`garmin_workout.html`, `index.html`), and python engines are immediately available.*

2. **One-Command Setup**:
   ```bash
   python setup_athx.py
   ```
   *Installs `athx` into `~/.local/bin/athx`, registers shell `$PATH`, creates `~/.config/agy/config.json`, and configures tool whitelisting.*

3. **Transfer Antigravity CLI Permissions**:
   ```bash
   python setup_antigravity_permissions.py
   ```
   *Whitelists local Python/pip binaries and shell utilities in `~/.gemini/antigravity-cli/settings.json` to eliminate permission friction.*

4. **Execute Pipeline**:
   ```bash
   athx
   ```

---

## 📲 Live Health Auto Export MCP Ingestion

Query live Apple Health metrics and workouts directly from your iPhone over local Wi-Fi via the built-in MCP server in the **Health Auto Export** app:

1. Open **Health Auto Export** on your iPhone.
2. Navigate to **Automations** (or sidebar) $\rightarrow$ **Server**.
3. Choose **HTTP** (recommended) or **TCP** and tap **Start Server**.
4. Copy the **Bearer Token** displayed under the server URL (e.g. `http://192.168.1.163:9000/mcp`).
5. Run the live sync:
   ```bash
   # Using environment variable
   export HAE_MCP_TOKEN="<YOUR_BEARER_TOKEN>"
   python sync_health_mcp.py --push
   ```

---

## 📊 Executive Reporting & Slide Decks

- **[`ATHX_Garmin_Dashboard_Presentation.pptx`](file:///Users/ayrton.andre/Documents/work/AGY/ATHX_Garmin_Dashboard_Presentation.pptx)**: High-level executive presentation covering the Garmin athletic telemetry, hypertrophy progression, and ATHX 2027 roadmap.
- **Interactive Headquarters**: Hosted live on GitHub Pages at [`https://ayrtonxandre.github.io/agy/`](https://ayrtonxandre.github.io/agy/).

---

## 🔐 Security & Secrets
All tokens, OAuth credentials, and private keys (`credentials.json`, `token.json`, `drive_token.json`, `gcp_token.json`, `garmin_tokens/`, `hae_token.txt`, `.env`) are strictly git-ignored and never committed to version control.
