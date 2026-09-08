# ⚡ AGY - Athlete & Work Intelligence Hub

An autonomous agentic intelligence platform integrating multi-source athletic biometrics, strength analytics, smart multi-calendar scheduling, Excalidraw architecture generation, and automated GitHub continuous synchronization.

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
    • Live MCP :9000/mcp     ├───►│  Master Orchestrator   │───►│ GitHub Repository     │
    • Webhook :8080/api      │    │  (Python :8080 launchd)│    │ • Single Source Truth  │
                             │    └───────────┬────────────┘    │ • Auto-Sync & History  │
 ⌚ Garmin Cloud             │                │                 │ • GitHub Pages Hosting │
    (Garth OAuth / MFA) ─────┘                ▼                 └────────────────────────┘
                                  ┌────────────────────────┐
                                  │  Tri-Calendar Sync     │
                                  │  • Artefact Google Cal │
                                  │  • iCloud Private Cal  │
                                  │  • Microsoft 365 ICS   │
                                  └────────────────────────┘
```

---

## ⚡ One-Word Master Command: `athx`

Launch the complete athlete & work intelligence pipeline with a single word from **any** terminal directory:

```bash
athx
```

### 📺 Visual Progress Display
While running, `athx` renders a live, fluid loading bar and animated spinner:

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
| `athx --no-push` | Skips pushing updated datasets & HTML to GitHub after sync |
| `athx --no-open` | Runs headless (skips opening the browser) |
| `athx --serve` | Starts local HTTP daemon on `http://localhost:8080` (`/workout`, `/calendar`) |
| `athx --install` | Installs/symlinks `athx` into `~/.local/bin/athx` and updates shell `$PATH` |
| `athx --skip-git` | Skips pulling from GitHub |
| `athx --skip-health`| Skips Apple Health biometrics sync |
| `athx --skip-garmin`| Skips Garmin Connect API extraction |
| `athx --skip-cal` | Skips calendar synchronization |

---

## 🚀 Key Modules

1. **`orchestrator.py`**:
   * Multi-threaded HTTP daemon listening on port `8080`.
   * Webhook endpoint: `POST /api/health` for real-time ingestion of iOS Health Auto Export payloads (weight, body fat %, sleep stages, steps).
   * Serves local dashboards at `/workout` and `/calendar`.
   * Automatically triggers debounced background GitHub auto-sync (`git_auto_commit_and_push`) on incoming data.

2. **`sync_health_mcp.py`**:
   * Model Context Protocol (MCP) client connecting directly to the Health Auto Export server running on iOS (`http://<iPhone-IP>:9000/mcp`).
   * Queries real-time Apple Health biometrics (`get_health_metrics`) and workouts (`get_workouts`) on demand over local Wi-Fi.
   * Directly updates `apple_body_composition.csv`, `apple_sleep.csv`, `apple_daily_activity.csv`, and `apple_workouts_history.csv`.
   * Pushes updated datasets directly to GitHub `origin/main`.

3. **`drive_sync.py` [DEPRECATED]**:
   * Retired from automated runtime. GitHub (`git@github.com:ayrtonxandre/agy.git`) is now the single source of truth.
   * Preserved strictly for optional manual cold-archive snapshots (`python drive_sync.py push`).

4. **`excalidraw_tool.py`**:
   * Bridges Google Cloud Discovery Engine (Data Store: `excalidraw_1787583517655_diagrams`) and the federated Excalidraw MCP server (`https://mcp.excalidraw.com/mcp`).
   * Programmatically builds hand-drawn architecture diagrams and exports them to live shareable URLs.

5. **`unified_calendar.py` & `generate_calendar_dashboard.py`**:
   * Synchronizes Artefact Google Calendar, iCloud CalDAV, and Client M365 schedules.
   * Injects structured workout plans (Push, Pull, Legs) with warmup sets, top working weights, reps, and rest intervals.

6. **`athx_config.py` & `athx_analytics.py` (ATHX 2027 Core Intelligence)**:
   * **`athx_config.py`**: Single source of truth for the ATHX Games 2027 preparation (Target Date: `2027-05-27`, Mass Target: `85.0 kg`). Maps all 62 Garmin exercise variations to 8 muscle groups and PPL splits, defines movement-specific plausible load ranges, MEV/MAV/MRV hypertrophy bands (Mike Israetel methodology), and Tier-1 Non-Pro competition standards (S2O, Back Squat, Deadlift, 5km Run, Sandbag Carry).
   * **`athx_analytics.py`**: Robust data-cleaning and athletic telemetry pipeline. Enforces a strict analysis floor at `2026-05-01` with a complete audit trail. Imputes Unknown exercise sets using session load signatures, classifies dominant session splits to eliminate Garmin's `"press" -> Legs` bug, restricts e1RM calculations strictly to sets $\le 10$ reps on plausible loads, computes Foster training monotony and weekly strain, dynamically evaluates ACWR as of latest activity, cleans sleep data by filtering recording overflows ($\text{In\_Bed} > 14\text{h}$) and dropping non-wear periods ($< 3\text{h}$), and computes a transparent 5-component recovery composite score.

7. **`extract_garmin_strength.py` & `generate_unified_athlete_dashboard.py`**:
   * Extracts historical and live strength, running, and conditioning sets from Garmin Connect (83 strength workouts, 8 runs, 45 cardio/hiking workouts, 136 total activities).
   * Generates the zero-hardcoded, fully audited ATHX 2027 Athlete Headquarters (`garmin_workout.html` and `index.html` for GitHub Pages).
   * Features: Top-level ATHX event qualification readiness table, 37-week countdown, 🏃 Running & Conditioning Engine tab, leg hypertrophy deficit alerts (Quads & Hamstrings vs MEV), 28-day trailing best e1RM trajectories, 7-day smoothed weight recomposition curve, default `Date DESC` tables with sorting & pagination, and an interactive Data Quality & Audit trail panel with JSON export.

---

## 💻 Cross-Machine Setup Guide

### Setting up on Machine 2 (Other Computer)

1. **Clone Repository (Single Source of Truth)**:
   ```bash
   git clone git@github.com:ayrtonxandre/agy.git
   cd agy
   ```
   *All datasets (CSVs, JSONs), dashboards (`garmin_workout.html`, `index.html`), and python engines are immediately available.*

2. **One-Command Execution**:
   ```bash
   athx
   ```
   *Instantly pulls latest GitHub changes, syncs local devices, rebuilds headquarters, and pushes updates.*

4. **Transfer Antigravity CLI Permissions & Whitelist**:
   Antigravity CLI stores tool approval permissions in a local configuration file:
   * **macOS / Linux**: `~/.gemini/antigravity-cli/settings.json`
   * **Windows**: `%USERPROFILE%\.gemini\antigravity-cli\settings.json`

   > [!IMPORTANT]
   > **Why Paths Differ Across Machines**:
   > * On Machine 1, the Python virtualenv is `/Users/ayrton.andre/Documents/work/.venv/bin/python`.
   > * On Machine 2, your username, home directory, or repo path will differ (e.g., `/Users/<username>/...`, `/home/<username>/...`, or `C:\Users\<username>\...`).
   > * Corporate accounts enforce Google Cloud enterprise admin controls (`terminal_command_auto_execution_policy: REQUIRE_REVIEW`). Enterprise policy overrides local flags like `--dangerously-skip-permissions`. Commands will prompt interactively on every run unless their exact binary is whitelisted in `settings.json`.

   **Option A: 1-Click Automatic Setup (Recommended)**
   Run the setup helper using Machine 2's virtual environment:
   ```bash
   python setup_antigravity_permissions.py
   ```
   This script automatically:
   * Detects Machine 2's Python and pip binary paths.
   * Adds both the absolute binary path and relative paths (`command(./.venv/bin/python)`, `command(.\.venv\Scripts\python.exe)`).
   * Whitelists 30 standard shell utilities (`git`, `uv`, `python3`, `ls`, `grep`, `cat`, `mkdir`, `ps`, etc.).
   * Copies workspace rules (`AGENTS.md`) to your home root to prevent multiline `-c` prompt friction.
   * Backs up existing settings to `settings.json.bak`.

   **Option B: Manual Configuration**
   1. Locate your virtualenv binary on Machine 2:
      ```bash
      which python
      # Example output: /Users/johndoe/projects/agy/.venv/bin/python
      ```
   2. Edit `~/.gemini/antigravity-cli/settings.json` and add your binary under `permissions.allow`:
      ```json
      {
        "permissions": {
          "allow": [
            "command(git)",
            "command(uv)",
            "command(python)",
            "command(python3)",
            "command(./.venv/bin/python)",
            "command(./.venv/bin/pip)",
            "command(/Users/<your-user>/.../.venv/bin/python)",
            "command(/Users/<your-user>/.../.venv/bin/pip)",
            "command(ls)",
            "command(pwd)",
            "command(cat)",
            "command(mkdir)"
          ]
        }
      }
      ```
   3. Ensure [`AGENTS.md`](AGENTS.md) is present in your repository root to guide agents to use clean single-line script calls.

   > [!TIP]
   > Always restart `agy` after editing `settings.json`, as the whitelist is loaded into memory only at startup.

5. **Install Global `athx` Command (Recommended)**:
   ```bash
   python setup_athx.py
   ```
   *Instantly installs the `athx` executable into `~/.local/bin/athx`, registers shell `$PATH`, verifies required dependencies, and whitelists `athx` in Antigravity settings. You can now launch the full orchestration pipeline with a single word (`athx`) from anywhere!*

6. **Run Local Orchestrator (Optional)**:
   ```bash
   athx --serve
   # Or: python orchestrator.py serve
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

# Pull data and automatically push updates to GitHub origin/main
python sync_health_mcp.py --push
```

---

## 🔐 Security & Secrets
All tokens, OAuth credentials, and private keys (`credentials.json`, `token.json`, `drive_token.json`, `gcp_token.json`, `garmin_tokens/`, `hae_token.txt`) are strictly git-ignored and never committed to version control.
