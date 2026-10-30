# ⚡ AGY • Master Work & Athlete Intelligence Hub

An autonomous agentic intelligence platform integrating three core pillars:
1. **Meeting Hub (`meeting`)**: Desktop-first meeting preparation, deterministic minutes intelligence, 9 multi-initiative project bases, cross-meeting decision registers, and honest coverage metrics.
2. **ATHX Athletic Engine (`athx`)**: Multi-source athletic biometrics (Garmin Connect & Apple Health), LLM-powered workout note parsing, strength and hypertrophy volume analytics (MEV/MRV), sports science recovery models, and automated GitHub continuous synchronization for the **ATHX Games 2027**.
3. **End of Mission Engine (`eom`)**: Google Cloud Vertex AI Reasoning Engine powering automated architectural synthesis, knowledge handover, and executive wrap-up dossiers.

> [!WARNING]
> **Legacy Calendar Deprecation Notice:**  
> The standalone single-file calendar view (`calendar_dashboard.html`, `generate_calendar_dashboard.py`, `unified_calendar.py`) has been **officially deprecated** and archived to `legacy_calendar/`. All scheduling, initiative filtering, and agenda preparation now run through **Meeting Hub** (`http://localhost:8080/meeting`).

---

## 📑 Table of Contents
- [⚡ Quick Start & Master Commands (`meeting` & `athx`)](#-quick-start--master-commands)
- [📁 Repository Architecture & Domain Organization](#-repository-architecture--domain-organization)
- [🏛️ Meeting Hub: Work Intelligence Architecture](#️-meeting-hub-work-intelligence-architecture)
  - [Core Principles & Design Rules](#core-principles--design-rules)
  - [9 Configured Project Initiatives & Bracket Matching](#9-configured-project-initiatives--bracket-matching)
  - [Minutes Intelligence & Decision Deduplication](#minutes-intelligence--decision-deduplication)
  - [Honest Coverage & 48h Preparation Checklists](#honest-coverage--48h-preparation-checklists)
  - [Keyboard Navigation & App Controls](#keyboard-navigation--app-controls)
- [🎯 End of Mission (EOM) Reasoning Engine](#-end-of-mission-eom-reasoning-engine)
- [⚠️ Deprecated Legacy Systems (Calendar Dashboard)](#️-deprecated-legacy-systems-calendar-dashboard)
- [🤖 Claude / AI Guidance & Strategic Consultation](#-claude--ai-guidance--strategic-consultation)
  - [Current State & Verification](#current-state--verification)
  - [Targeted Guidance Questions for Claude](#targeted-guidance-questions-for-claude)
- [🏗️ Overall Architecture Diagram](#️-overall-architecture-diagram)
- [⚡ ATHX One-Word Master Command: `athx`](#-one-word-master-command-athx)
- [🧠 ATHX 2027 Core Intelligence & Analytics](#-athx-2027-core-intelligence--analytics)
- [🧬 Advanced Sports-Science Engines & KPIs](#-advanced-sports-science-engines--kpis)
- [🤖 LLM Activity Note & WOD Parser](#-llm-activity-note--wod-parser)
- [🦾 ATHX AI Performance Coach & Sports Scientist](#-athx-ai-performance-coach--sports-scientist)
- [🚀 Key Modules](#-key-modules)
- [⚙️ Environment Variables & Configuration](#️-environment-variables--configuration)
- [🐳 Docker & SWAG Remote Server Deployment](#-docker--swag-remote-server-deployment)
- [💻 Cross-Machine Setup Guide](#-cross-machine-setup-guide)
- [📲 Health Auto Export Automated REST Webhook Setup](#-health-auto-export-automated-rest-webhook-setup)
- [📊 Executive Reporting & Slide Decks](#-executive-reporting--slide-decks)
- [🔐 Security & Secrets](#-security--secrets)

---

## ⚡ Quick Start & Master Commands

Launch either intelligence hub instantly from any terminal directory:

| Master Command | Destination | Description |
| :--- | :--- | :--- |
| `meeting` | `http://localhost:8080/meeting` | Launches the **Meeting Hub** desktop dashboard, ensures background Python server is running, and opens browser |
| `athx` | `file:///.../garmin_workout.html` | Runs full ATHX sync (Garmin + Apple Health biometrics), rebuilds athlete headquarters, and commits to GitHub |
| `athx serve` | `http://localhost:8080` | Starts or inspects the local webhook and API bridge server (`/api/health`, `/api/docs/fetch`, `/meeting`) |

---

## 📁 Repository Architecture & Domain Organization

The `AGY` codebase is cleanly decoupled into dedicated domains:

```text
Documents/work/AGY/
├── athx/                       # Pillar 1: ATHX Athletic Intelligence Engine
│   ├── athx_*.py               # Sports-science & analytical telemetry engines
│   ├── garmin_*.py             # Garmin Personal API clients, sync pipelines & note parsers
│   ├── apple_*.csv             # Active Apple Health biometrics datasets
│   ├── macro_orchestrator.py   # Training-to-Cart grocery inventory manager
│   ├── garmin_workout.html     # Interactive Athlete Headquarters dashboard
│   └── index.html              # ATHX web interface
├── bin/                        # Master Executables
│   └── athx                    # Single-word CLI orchestrator (aliased via ~/.local/bin/athx)
├── docker/                     # Docker & SWAG Deployment
│   ├── Dockerfile              # Container definition for orchestrator & webhooks
│   ├── docker-compose.yml      # Local container orchestration
│   ├── docker-compose.prod.yml # Production compose with SWAG reverse proxy
│   ├── docker-entrypoint.sh    # Container initialization & seed volume script
│   └── swag/                   # Nginx reverse proxy subdomain configuration
├── docs/                       # Documentation & Architecture Decks
│   ├── athx/                   # ATHX Architecture diagrams (.drawio, .html) and PPTX decks
│   └── how-to/                 # Deployment and sync guides
├── eom/                        # Pillar 2: End of Mission (EOM) Engine
│   ├── agent_eom.py            # Vertex AI Reasoning Engine handover synthesizer
│   └── README.md               # EOM architecture and GCP deployment reference
├── legacy_calendar/            # ⚠️ [DEPRECATED] Retired Standalone Calendar System
│   ├── calendar_dashboard.html # Legacy 620 KB single-file calendar view
│   ├── generate_calendar_dashboard.py # Legacy builder
│   ├── unified_calendar.py     # Tri-calendar ICS aggregator
│   ├── credentials.json        # Google Calendar OAuth client credentials
│   ├── token.json              # Active Google Calendar OAuth token
│   ├── calendar_data/          # Cached ICS files and raw calendars
│   └── DEPRECATED.md           # Formal deprecation and migration guide
├── logs/                       # Runtime Logs & Daemon States
│   ├── server_access.log       # Orchestrator HTTP & webhook request logs
│   └── server.pid              # Active background process PID
├── meeting_hub/                # Pillar 3: Meeting Hub Application Core
│   ├── index.html              # Meeting Hub desktop & browser runner (/meeting)
│   ├── meeting_hub.app.js      # Bundled zero-dependency frontend distribution
│   ├── meeting_intelligence.py # Executive intelligence & ATHX biological readiness bridge
│   ├── model/                  # Data engines (Store, ProjectEngine, MinutesEngine, PrepScore)
│   ├── views/                  # View renderers (Today, Projects, Decisions)
│   ├── ui/                     # Presentation shell, icons, styles, meeting panel
│   ├── data/                   # Bundled events, local docs cache, importer
│   └── tests/                  # Verification test suite
├── tools/                      # Ancillary & retired tools
│   ├── excalidraw/             # Excalidraw MCP diagram generation scripts
│   ├── google_drive/           # Legacy Drive archive synchronization
│   └── legacy_dashboards/      # Experimental v1 HTML dashboards
├── orchestrator.py             # Master multi-engine background server (:8080)
├── README.md                   # Complete repository documentation
└── requirements.txt            # Python dependencies
```

---

## 🏛️ Meeting Hub: Work Intelligence Architecture

**Meeting Hub** is an executive-grade desktop web application replacing legacy single-file calendar dashboards with a structured preparation and capture system: *"Walk into every meeting prepared, walk out with actions captured."*

### Core Principles & Design Rules
1. **Generic Engine**: Zero hardcoded client names, counts, ratios, or workstreams in codebase logic. Domain knowledge is decoupled into plain Markdown mission repositories (`/Users/ayrtonandre/Documents/work/Missions/`) referenced via `missions.yaml`.
2. **Honest Coverage Only**: Never displays misleading percentages that imply completeness. Shows exact metrics (e.g. *"2 of 20 meetings folded"*), distinguishing meetings whose minutes have been folded into the system of record from pending raw minutes.
3. **Markdown as Single Source of Truth**: Mission notes (`Mission Overview.md`, `Actions.md`, facility notes) are the authoritative system of record. Meeting Hub captures raw minutes to `_inbox/` and reads live summaries via `/api/missions/*`. Actions cite `Actions.md` with 1-click clipboard copy of IDs (`ACT-CLAR-01`).
4. **Data Stays Local & Private**: No client minutes or credentials are baked into the frontend bundle (`meeting_hub.app.js`). All mission APIs are strictly localhost-only (`_is_localhost` guard blocking remote LAN or Docker access).
5. **Arty Design System**: Jost typography for readable text, Fira Code for IDs and dates, OKLCH color palette with dark navy `#0B132B` background, flat 1px borders, and pure Lucide stroke SVG icons (zero emojis).

### Mission System of Record & The Fold Workflow
- **System of Record**: Each mission lives under `/Users/ayrtonandre/Documents/work/Missions/<Mission Name>/` with structured notes (`Agent brief.md`, `Mission Overview.md`, `Actions.md`, `_inbox/`, `_inbox/_folded/`, and facility workstream notes).
- **Capture Seam**: Meeting Hub connects to Google Docs via `/api/docs/fetch` or accepts manual text/Granola notes. Clicking **"Send to mission inbox"** creates an idempotent Markdown file in `_inbox/` with YAML metadata.
- **The Fold Routine**: The user or AI agent executes the fold routine (`POST /api/missions/<id>/fold` or `execute_fold.py`), extracting decisions into workstream notes, assigning open points, updating `Actions.md`, and archiving processed minutes to `_folded/`.
- **Honest Prep Checklist**: Prep score evaluates whether prior meetings of a series were folded into notes, and warns if unprocessed raw minutes are pending in the mission inbox.
- **Action Matrix**: The Hub acts as a read-only viewport on `Actions.md`. To complete an action, the user copies the ID with 1 click and updates the note directly, preventing browser storage divergence.

### 9 Configured Project Initiatives & Bracket Matching
The system categorizes 259 calendar events across 9 active initiatives. Meeting titles with bracket tags (`[TAG]`) receive top matching priority:

| Initiative | ID | Bracket & Keyword Matchers | Typical Event Tracks |
| :--- | :--- | :--- | :--- |
| **HDJ Planning Manager** | `clariane` | `[Planning HDJ]`, `[Planning Manager]`, `hdj`, `arbelles`, `mariéna` | Clinical sessions, hospital workflow, pilot reviews (17 meetings) |
| **Molécules Onéreuses** | `clariane-mo` | `[MO]`, `[Molécules Onéreuses]`, `mo -`, `passation molécules` | COPIL déploiement, suivi anomalies, vagues formation (25 meetings) |
| **Invoicing & Facturation** | `clariane-invoicing` | `[Invoicing]`, `facturation`, `weekly facturation` | Weekly Facturation x Data alignment (6 meetings) |
| **F360 Médical** | `clariane-f360` | `[F360]`, `f360`, `dashboard médical` | Medical dashboard iteration & RS reviews (2 meetings) |
| **Clariane Data & Coproj** | `clariane-data` | `[Coproj Data Inicea]`, `coproj`, `équipe parisienne` | Transverse data project committees & team syncs (15 meetings) |
| **GE Enterprise / UC Wizard** | `ge-uc-wizard` | `[GE]`, `[Wizard]`, `ge enterprise`, `uc wizard`, `ge drive` | GE Enterprise stream, Datastore GE Drive, UC Wizard app (13 meetings) |
| **Healthcare & Care Dispensing** | `healthcare-mandate` | `[Care Dispensing]`, `care dispensing`, `healthoween`, Friday sessions | Healthcare offering design & community events (7 meetings) |
| **PrideFact - Mandat RSE** | `pridefact` | `[PrideFact]`, `mandat rse`, `women@artefact` | RSE mandate coordination & inclusion workshops (8 meetings) |
| **Counseling & Talent Review** | `counseling` | `[ITW]`, `counseling`, `comités d'évaluation`, `eval h2` | Counseling 1-to-1s, peer reviews, committee arbitration (22 meetings) |

- **Auto-Discovery**: `store.getSuggestedProjects()` automatically parses `[TAG]` strings in upcoming meeting titles and suggests new initiatives in the sidebar with 1-click confirmation.

### Minutes Intelligence & Decision Deduplication
- **Deterministic Parser (`MinutesEngine`)**: Ingests minutes from connected Google Docs (via `/api/docs/fetch`) or manual text inputs. Extracts participants, action items with owners and due dates, validated decisions, and knowledge entities.
- **Source Quotes & Meeting Links**: Every extracted action and decision permanently stores its exact source quote and link (`#/meeting/:id`). The Review Card presents proposed items with verbatim quotes before committing to the project base.
- **Cross-Meeting Decision Register**: Deduplicates identical decisions across consecutive meetings, surfacing both `firstDecidedOn` and chronological `restatedOn` audit history.

### Honest Coverage & 48h Preparation Checklists
- **48-Hour Prep Checklist**: For meetings occurring within the next 48 hours, percentage scores are replaced by an actionable missing items checklist:
  - 📝 **Agenda**: Written objectives drafted.
  - 🔗 **Last Minutes**: Prior meeting linked with minutes found.
  - ☑️ **Open Actions**: Carried-over action items reviewed.
- **Project Base Wire-In**: "Next up" cards display total open actions and validated decisions for the associated project initiative.

### Keyboard Navigation & App Controls
| Shortcut | Action |
| :--- | :--- |
| `j` / `ArrowDown` | Select next meeting in timeline |
| `k` / `ArrowUp` | Select previous meeting in timeline |
| `a` | Quick-focus action item input in meeting drawer |
| `/` | Focus global search bar |
| `\` | Toggle right meeting drawer (expand / collapse) |
| `Escape` | Clear search, close modal, or collapse drawer |

---

## 🤖 Claude / AI Guidance & Strategic Consultation

> [!NOTE]
> This section provides full architectural context for **Claude** (or any strategic AI reviewer) to advise on next development phases.

### Current State & Verification
- **Step 1 (Trustworthy Data)**: Completed & verified. Multi-engine adapter (`IndexedDB` → `LocalStorage` → `Memory`), idempotent 259-event ingestion, deterministic series clustering, and LinkEngine with user accept/reject control.
- **Step 2 (Project Config & Honest Minutes)**: Completed & verified. Generic `{ id, name, clientMatch[], docSources[], workstreams[], parserHints[] }` schema, 9 seeded initiatives, title bracket prioritization, collapsible right panel, 48h prep checklist, honest coverage bars, and automated test suite ([`test_step2.js`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/tests/test_step2.js): 7/7 passing).
- **Compilation**: Standalone bundle compiled via [`node meeting_hub/build.js`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/build.js) (317.3 KB) with offline fallback cache (`docs_cache.json`).

### Targeted Guidance Questions for Claude
When reviewing the codebase and planning future iterations, consider advising on:

1. **Step 3 / Phase 3: Hybrid LLM + Deterministic Intelligence**:
   - Currently, `MinutesEngine` runs client-side deterministic regex/heuristic parsing. Where should an LLM pass (via local Python server on port 8080 or Vertex AI) augment this?
   - What is the best pattern to preserve deterministic speed for routine tasks while delegating semantic synthesis (e.g., latent risk detection across projects, contradictory decision alerts) to an LLM?
2. **Bi-directional Sync & Meeting Notes Export**:
   - Currently, notes are ingested into local storage from Google Docs. How should we architect exporting captured actions and follow-up recaps back into external tools (Google Docs, Notion, or Slack) while respecting the "client data stays local" principle?
3. **Macro Cart Re-integration**:
   - The Macro Cart (collecting items across meetings into a unified export basket) was preserved in `ui/cart.js` but deferred from the UI. How should it be re-integrated into the 9-project workflow (e.g. generating a weekly executive briefing across multiple initiatives)?
4. **Deprecating Legacy `calendar_dashboard.html`**:
   - With `meeting_hub.html` providing Today, Week, Meetings, Open Actions, Series & Links, and Projects & Knowledge, the legacy calendar dashboard is officially retired.

---

## 🎯 End of Mission (EOM) Reasoning Engine

The **EOM (End of Mission)** engine synthesizes project history, technical decisions, and architecture deliverables into clean handover dossiers when concluding client or corporate mandates.

- **Directory**: [`eom/`](file:///Users/ayrtonandre/Documents/work/AGY/eom/)
- **Documentation**: [`eom/README.md`](file:///Users/ayrtonandre/Documents/work/AGY/eom/README.md)
- **Infrastructure**: Google Cloud Vertex AI Reasoning Engines (`europe-west1`)
- **GCP Project**: `privategpt-437907`
- **Resource ID**: `projects/981078856173/locations/europe-west1/reasoningEngines/4533231465739059200`
- **Execution**:
  ```bash
  python eom/agent_eom.py
  ```
  *(A compatibility shim at the repository root delegates directly to `eom/agent_eom.py`).*
- **Cross-Pillar Synergy**: Synthesizes minutes, action registers, and decision history captured across Meeting Hub's 9 project initiatives into formal client transition dossiers.

---

## ⚠️ Deprecated Legacy Systems (Calendar Dashboard)

> [!WARNING]
> **RETIREMENT NOTICE: STANDALONE CALENDAR DASHBOARD IS DEPRECATED**  
> The single-file HTML calendar view (`calendar_dashboard.html`, 620 KB) and its associated generator scripts have been retired and archived.

- **Archive Location**: [`legacy_calendar/`](file:///Users/ayrtonandre/Documents/work/AGY/legacy_calendar/)
- **Deprecation Guide**: [`legacy_calendar/DEPRECATED.md`](file:///Users/ayrtonandre/Documents/work/AGY/legacy_calendar/DEPRECATED.md)
- **Superseded By**: **Meeting Hub** (`http://localhost:8080/meeting` or [`meeting_hub.html`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub.html))
- **Why Deprecated**: The legacy calendar was a static day/week/grid event viewer with hardcoded events and no preparation or capture workflow. Meeting Hub replaces it with active 48h prep checklists, 9 project initiatives, deterministic minutes intelligence, and live decision registers.
- **Backward Compatibility**:
  - `calendar` CLI alias (`~/.local/bin/calendar`) notifies the user and automatically redirects to `meeting`.
  - Orchestrator endpoint `/calendar` logs a deprecation warning and displays an alert banner pointing to `/meeting`.
  - Root scripts `generate_calendar_dashboard.py` and `unified_calendar.py` provide forwarding stubs with `DeprecationWarning` so existing automated tasks continue without crashing.

---

## 🏗️ Overall Architecture Diagram

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
    • Automated REST Webhook ├───►│     ATHX Orchestrator     ├───►│     GitHub Repository     │
    • :8080/api/health       │    │  (Python :8080 / launchd) │    │  • Single Source of Truth │
                             │    └─────────────┬─────────────┘    │  • Auto-Sync & History    │
 ⌚ Garmin Cloud             │                  │                  │  • GitHub Pages Hosting   │
    (Garth OAuth / MFA) ─────┤                  ▼                  └───────────────────────────┘
    • Strength & Running Sets │    ┌───────────────────────────┐
    • Overnight HRV Telemetry│    │   ATHX Analytics Engine   │
    • Shoe & Gear Lifecycle  │    │   • MEV / MAV / MRV Bands │
    • Multi-Provider LLM     │    │   • e1RM (Reps <= 10)     │
      WOD & Note Decipherer  │    │   • ACWR & Foster Monotony│
                             │    │   • Full Data Audit Trail │
                             │    └─────────────┬─────────────┘
                             │                  │
                             │                  ▼
                             │    ┌───────────────────────────┐
                             │    │   Sports-Science Engine   │
                             │    │   • Critical Speed (CS/D')│
                             │    │   • CrossFit Durability   │
                             │    │   • Sleep Debt & Plews HRV│
                             │    │   • AI Coach Decision Log │
                             │    │   • Anatomic Muscle HUD   │
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

### 🎛️ CLI Commands & Flags
| Command | Action |
| :--- | :--- |
| `athx` | Standard full sync, dashboard rebuild, automated GitHub push, and browser launch |
| `athx sync` | Explicit command to run the 5-step athlete synchronization pipeline |
| `athx serve` | Starts or inspects local HTTP server on `http://localhost:8080` (`/workout`, `/calendar`, `/api/health`, `/api/coach`) |
| `athx serve -d` | Launches the orchestrator webhook server in background daemon mode with PID tracking (`server.pid`) |
| `athx serve --stop` / `athx stop` | Terminates any running ATHX background webhook daemon |
| `athx serve --restart` / `athx restart` | Restarts the background webhook server cleanly |
| `athx status` | Comprehensive ecosystem diagnostics (Webhook daemon, 6 Apple Health CSVs, Garmin Developer API tokens & activities, Dashboards, Git) |
| `athx doctor` | End-to-end 9-point system health diagnostic (Python runtime, Garmin API & JWT, Apple Health CSVs, Webhook server, Calendar, Dashboard, Git) |
| `athx garmin` / `athx --garmin` | Inspects official Garmin Developer Personal API connection, 24h Bearer token TTL, and extracted biometric counts |
| `athx garmin --sync` | Forces live sync of activities, strength sets, running biomechanics, overnight HRV, sleep need, and daily wellness from Garmin Personal API |
| `athx health` | Step-by-step iOS Health Auto Export setup guide, target URLs (`.local` & LAN IP), metrics checklist, and payload inspector |
| `athx health -r` / `--reingest` | Re-ingests the latest cached payload (`last_payload.json`) across all 6 Apple Health CSV datasets |
| `athx sleep` | Inspects recent sleep records, stage distribution, and 7-day rolling cumulative sleep debt |
| `athx sleep <hours>` | Manually logs sleep duration and stages directly into `apple_sleep.csv` (e.g. `athx sleep 7.5 --deep 1.5 --rem 1.8`) |
| `athx coach` | Displays AI Coach executive verdict and 7-day tactical microcycle prescription |
| `athx coach --full` | Renders comprehensive ANSI-colorized sports science debriefing |
| `athx coach --ask "<question>"` | Direct consultation with the AI Coach grounded in audited telemetry |
| `athx ask "<question>"` | Fast alias to query the AI Coach (`-q` flag supported) |
| `athx coach --force` | Re-generates sports science briefing bypassing telemetry cache |
| `athx coach --json` | Outputs raw briefing or Q&A consultation payload in JSON format |
| `athx --no-push` | Skips pushing updated datasets & HTML to GitHub after sync |
| `athx --no-open` | Runs headless (skips opening the browser) |
| `athx install` / `athx --install` | Installs/symlinks `athx` into `~/.local/bin/athx` and configures shell `$PATH` |
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
- **5-Component Recovery Composite**: Transparent score combining resting heart rate (RHR), sleep duration vs 7.5h baseline (`TARGET_SLEEP_HRS`), sleep efficiency %, step volume, and workout strain.

### 5. Transparent Data Audit Trail
- Enforces an analysis floor at **`2026-05-01`** (excluding pre-cycle test records from active KPIs while maintaining baseline chronic lookback).
- Imputes "Unknown" watch sets within a session when load/rep signatures match preceding sets.
- Interactive audit panel on the dashboard with exportable JSON audit reports.

---

## 🧬 Advanced Sports-Science Engines & KPIs

Implemented in [`athx_durability_cs_gear.py`](file:///Users/ayrton.andre/Documents/work/AGY/athx_durability_cs_gear.py) and seamlessly integrated into [`generate_unified_athlete_dashboard.py`](file:///Users/ayrton.andre/Documents/work/AGY/generate_unified_athlete_dashboard.py), these sports-science models provide rigorous, evidence-grounded athletic intelligence:

### 1. Critical Speed (CS) & $D'$ Anaerobic Capacity Hyperbolic Model
Fitted against Pareto-maximal running efforts across the severe domain (180s to 3,600s) using the classical **Monod & Scherrer 2-parameter hyperbolic model**:

$$d = CS \cdot t + D'$$

* **Critical Speed ($CS$)** *(m/s & min/km)*: The mathematical asymptote of sustainable aerobic velocity (e.g. `3.24 m/s` / `5:09/km`). Running below $CS$ preserves glycogen and minimizes neuromuscular fatigue; exceeding $CS$ depletes the finite anaerobic battery ($D'$).
* **Supra-Critical Reserve ($D'$)** *(meters)*: Finite anaerobic work capacity (e.g. `62.9 m`), quantifying available reserve energy above $CS$ before severe metabolic acidosis and failure occur.
* **Goodness of Fit ($R^2$) & SEE**: Statistical precision validation ($R^2 \approx 0.9999$, Standard Error of Estimate in meters).
* **Deterministic ATHX Target Splits**: Derived algorithmically ($t = \frac{d - D'}{CS}$) to establish pacing anchors:
  * **1,000m Split**: High-velocity glycolytic repeats.
  * **2,000m Split**: $\text{VO}_2\text{max}$ aerobic capacity.
  * **5,000m Split**: Continuous aerobic threshold anchor.

### 2. CrossFit Work-Rate Durability Engine (3-Tier Fade Model)
Adapts Marco Mornati’s durability framework to quantify work-rate maintenance across multi-set functional fitness and CrossFit workouts:
* **3-Tier Volume Density Partition**: Working sets in a session are partitioned chronologically into **Tier 1** (initial 33%), **Tier 2** (transition 33%), and **Tier 3** (climax 33%).
* **Work Fade %**:
  $$\text{Work Fade} = \frac{\text{Tier 1 kg/set} - \text{Tier 3 kg/set}}{\text{Tier 1 kg/set}} \times 100\%$$
* **Durability Index (%)**: Composite pacing health score across all evaluated sessions (e.g. `87.5%`).
* **Pacing Classifications**:
  * **Elite Stamina ($\le 3.0\%$ fade)**: Negative-split or sustained round density.
  * **Controlled Degradation ($3.0\% - 10.0\%$ fade)**: Expected metabolic decay.
  * **Late-Round Breakdown ($> 10.0\%$ fade)**: Flagged for pacing correction (opening too fast in Tier 1).

### 3. Evidence-Based Sleep Debt & Plews–Buchheit Autonomic HRV Model
Grounded in sports science research (Plews, Buchheit, et al., 2013) and Marco Mornati's `arc_metrics`:
* **7-Day Rolling Sleep Debt**:
  * Calculates nightly deficit against a 7.5h baseline (`TARGET_SLEEP_HRS`): $\max(0, 7.5 - \text{Actual Sleep})$.
  * Surplus sleep is floored at 0h (cellular recovery cannot be pre-banked).
  * **Severity Tiers**: `< 3.0h` (Restored / Low Debt), `3.0h - 7.0h` (Moderate Debt / Watch), `> 7.0h` (Material Fatigue Alert / 20% Volume Reduction).
* **Garmin Connect Overnight HRV Baseline**:
  * Ingests authentic overnight rMSSD telemetry from `garmin_hrv_summary.json`.
  * **Natural Logarithm Normalization**: Computes $\ln(\text{rMSSD})$ and 28-day baseline mean/SD.
  * **Smallest Worthwhile Change (SWC) Corridor**: $\text{Baseline Mean} \pm 0.5 \times \text{SD}$ (e.g. `43.1 – 59.7 ms`).
  * **7-Day Rolling Mean & CV %**: Rolling 7-day vagal stability ($\text{CV} = \frac{\text{SD}_{\ln}}{\text{Mean}_{\ln}} \times 100\%$).
  * **Autonomic Tone Diagnostics**:
    * **Balanced Homeostasis**: Inside SWC corridor (optimal vagal modulation; cleared for maximal loading).
    * **Sympathetic Dominance / Vagal Withdrawal**: Below SWC corridor (autonomic strain; prioritize active deload).
    * **Parasympathetic Hyperactivation**: Above SWC corridor (fatigue rebound / vagal saturation).

### 4. ATHX Anatomic Muscle Target HUD & Compound Factors
* **Interactive Dual-View SVG Anatomy**: Embedded in the **Strength** tab, featuring real-time anterior and posterior heatmaps.
* **Primary vs. Secondary Muscular Stimulus**: Visually distinguishes prime movers (`#00f2fe`) from secondary synergists/stabilizers (`#c084fc`).
* **Session Tonnage Breakdown**: Real-time metric tonnage ($t$) and working sets per targeted muscle group for any selected workout, synchronized bidirectionally with strength table rows.
* **Renaissance Periodization Multi-Muscle Multipliers**: Configured in [`athx_config.py`](file:///Users/ayrton.andre/Documents/work/AGY/athx_config.py), multi-joint exercises distribute proportional volume across muscle groups (e.g. Thrusters allocate 1.0 to Quads and 1.0 to Shoulders; Deadlifts allocate 1.0 to Hamstrings/Glutes and 0.75 to Lats/Back).

### 5. Audited AI Coach Decision Log & Impact Verification
Embedded on the **Today** tab, this ledger audits autonomous coach interventions:
* **Trigger**: Quantitative biomarker alerting the system (e.g. *Garmin overnight HRV dip to 28 ms*, *Quad volume starvation below 8.0 MEV*).
* **Action & Classification**: Volume Infusion, Active Deload, Threshold Architecture, or Pacing Stabilization.
* **Physiological "Why"**: Biological mechanism (e.g. preventing mTOR blunting, protecting $D'$ tank, managing ACWR).
* **Pre- vs. Post-Metric Impact**: Empirical audit verifying outcome against Garmin overnight HRV (e.g. +171% vagal rebound to 76 ms).

### 6. Garmin Shoe & Gear Lifecycle Tracking
* **Odometer Tracking**: Live distance tracking against maximum manufacturer wear limits (e.g. New Balance 740 at `61.8 / 650.0 km`, 9.5% wear).
* **Foam Compression Health**: Categorized as *Optimal Cushioning* (<50%), *Moderate Foam Compression* (50–80%), or *Retirement Warning* (>80%).
* **Equipment Rotation Strategy**: Specific shoe assignment rules (e.g. daily road trainer vs. zero-drop flat lifters for heavy squats and Olympic lifts).

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

## 🚀 Key Modules by Domain

### 💼 Pillar 1: Meeting Hub Core
| Module | Description |
| :--- | :--- |
| **[`meeting_hub/index.html`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/index.html)** | Production runner loading compiled Meeting Hub bundle (`/meeting`) with dark navy theme and collapsible panels. |
| **[`meeting_hub/`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/)** | Modular frontend application directory: `model/` (Store, ProjectEngine, MinutesEngine, PrepScore), `views/` (Today, Projects, Decisions), `ui/` (Shell, MeetingPanel, Icons, Styles), and `data/` (events, docs cache, importer). |
| **[`meeting_hub/meeting_intelligence.py`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/meeting_intelligence.py)** | Executive briefing engine integrating biological readiness (sleep, HRV, ACWR) with daily meeting agendas. |
| **[`meeting_hub/build.js`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/build.js)** | Zero-dependency ES-module concatenator compiling clean standalone production distribution (317 KB). |
| **[`meeting_hub/tests/`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/tests/)** | Automated test suite verifying project models, 48h checklists, honest coverage, and decision deduplication. |

### 🏋️ Pillar 2: ATHX Athletic Intelligence
| Module | Description |
| :--- | :--- |
| **[`bin/athx`](file:///Users/ayrtonandre/Documents/work/AGY/bin/athx)** | Single-word master CLI orchestrator with fluid progress display, cross-machine path resolution, and full ecosystem diagnostics (`athx doctor`, `athx garmin`). |
| **[`athx/athx_config.py`](file:///Users/ayrtonandre/Documents/work/AGY/athx/athx_config.py)** | Single source of truth: 2027 benchmarks, 62 exercise mappings, MEV/MAV/MRV bands, compound stimulus volume factors, and plausible load boundaries. |
| **[`athx/athx_analytics.py`](file:///Users/ayrtonandre/Documents/work/AGY/athx/athx_analytics.py)** | Core analytical telemetry engine: data cleaning, unknown imputation, e1RM restrictions, ACWR, Foster strain, and recovery composite. |
| **[`athx/athx_ai_coach.py`](file:///Users/ayrtonandre/Documents/work/AGY/athx/athx_ai_coach.py)** | Autonomous Sports Science AI briefing generator synthesizing telemetry into elite coaching debriefs and microcycle prescriptions. |
| **[`athx/athx_durability_cs_gear.py`](file:///Users/ayrtonandre/Documents/work/AGY/athx/athx_durability_cs_gear.py)** | Advanced sports-science engine: Critical Speed ($CS$/$D'$), CrossFit 3-tier durability, Dynamic Mornati Sleep Debt, Plews & Buchheit overnight HRV ($cv\text{lnRMSSD}$), Running Biomechanics ($VR\%$, $GCT$), and VBT Fatigue Drop-Off. |
| **[`athx/extract_garmin_strength.py`](file:///Users/ayrtonandre/Documents/work/AGY/athx/extract_garmin_strength.py)** | Headless Garmin Connect bridge auto-delegating to the official Developer Personal API (`garmin_personal_sync.py`) with legacy OAuth fallback. |
| **[`athx/garmin_personal_client.py`](file:///Users/ayrtonandre/Documents/work/AGY/athx/garmin_personal_client.py)** | Official Garmin Connect Developer Program Personal API client exchanging `GARMIN_PERSONAL_API_KEY` for RS256 JWT Bearer token and querying activity, HRV, sleep, and wellness endpoints. |
| **[`athx/garmin_personal_sync.py`](file:///Users/ayrtonandre/Documents/work/AGY/athx/garmin_personal_sync.py)** | High-throughput synchronization pipeline extracting strength sets, running biomechanics, overnight HRV, sleep summaries with dynamic need, and 90-day daily wellness. |
| **[`athx/garmin_note_parser.py`](file:///Users/ayrtonandre/Documents/work/AGY/athx/garmin_note_parser.py)** | Multi-provider LLM parser extracting structured exercise sets and splits from free-text workout notes and CrossFit WODs. |
| **[`athx/generate_unified_athlete_dashboard.py`](file:///Users/ayrtonandre/Documents/work/AGY/athx/generate_unified_athlete_dashboard.py)** | Zero-hardcoded dashboard generator outputting `garmin_workout.html` and `index.html` (interactive Anatomic Target HUD, Critical Speed, Biomechanics, and VBT Fatigue). |
| **[`athx/macro_orchestrator.py`](file:///Users/ayrtonandre/Documents/work/AGY/athx/macro_orchestrator.py)** | Connects training demand to daily macronutrients and generates aisle-organized grocery restock lists with Apple Reminders export. |
| **[`orchestrator.py`](file:///Users/ayrtonandre/Documents/work/AGY/orchestrator.py)** | Local HTTP daemon (port 8080) with automated Apple Health REST webhook ingestion (`POST /api/health`), multi-day historical upsert into 6 CSVs, mDNS discovery, and debounced GitHub auto-push. |

### 🐳 Deployment & Container Infrastructure
| Module | Description |
| :--- | :--- |
| **[`docker/Dockerfile`](file:///Users/ayrtonandre/Documents/work/AGY/docker/Dockerfile)** | Multi-stage Docker container definition with Python 3.12, volume initialisation, and auto-compilation. |
| **[`docker/docker-compose.yml`](file:///Users/ayrtonandre/Documents/work/AGY/docker/docker-compose.yml)** | Development and standalone container composition. |
| **[`docker/docker-compose.prod.yml`](file:///Users/ayrtonandre/Documents/work/AGY/docker/docker-compose.prod.yml)** | Production deployment configuration integrated with LinuxServer.io SWAG. |
| **[`docker/swag/agy.subdomain.conf`](file:///Users/ayrtonandre/Documents/work/AGY/docker/swag/agy.subdomain.conf)** | Nginx reverse proxy configuration with SSL termination and 50M payload limit for Health Auto Export. |

### 🎯 Pillar 3: End of Mission (EOM) Engine
| Module | Description |
| :--- | :--- |
| **[`eom/agent_eom.py`](file:///Users/ayrtonandre/Documents/work/AGY/eom/agent_eom.py)** | Google Cloud Vertex AI Reasoning Engine query client for End of Mission handovers (`privategpt-437907`, `europe-west1`). |
| **[`eom/README.md`](file:///Users/ayrtonandre/Documents/work/AGY/eom/README.md)** | Dedicated EOM architecture, configuration, and execution documentation. |

### ⚠️ Deprecated & Archived Systems
| Module | Description |
| :--- | :--- |
| **[`legacy_calendar/`](file:///Users/ayrtonandre/Documents/work/AGY/legacy_calendar/)** | **[DEPRECATED]** Retired standalone calendar dashboard (`calendar_dashboard.html`, `generate_calendar_dashboard.py`, `unified_calendar.py`, `calendar_data/`). Superseded by Meeting Hub. |
| **[`docs/athx/`](file:///Users/ayrtonandre/Documents/work/AGY/docs/athx/)** | Presentation slide decks (`ATHX_Garmin_Dashboard_Presentation.pptx`), XML Draw.io architecture diagrams, and previews. |
| **[`tools/`](file:///Users/ayrtonandre/Documents/work/AGY/tools/)** | Ancillary scripts: Excalidraw MCP diagram generation (`tools/excalidraw/`), legacy HTML dashboard builders (`tools/legacy_dashboards/`), and retired Google Drive sync (`tools/google_drive/`). |

### 📈 Current Dataset Footprint
* **Garmin Developer Personal API**: 100 master activities, 1,300 strength sets categorized by movement split, 6 running dynamics records (GCT, VO, VR), and 38 conditioning sessions.
* **Overnight HRV Telemetry**: 43 nights authentic Garmin overnight HRV (`garmin_hrv_summary.json`) driving Plews & Buchheit $cv\text{lnRMSSD}$ rolling baselines.
* **Sleep & Allostatic Stress**: 31 days with dynamic `sleepNeed`, nap credits, and nadir SpO2 (`garmin_sleep_summary.json`), plus 91 days of Body Battery and stress dynamics (`garmin_daily_summaries.json`).
* **Apple Health Coverage**: 6 automated continuous CSV datasets (weight, body fat %, sleep stages, daily steps, nutrition macros, and mobility/gait biomechanics).

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

# Official Garmin Connect Developer Program Personal API
GARMIN_PERSONAL_API_KEY=GCDC_your-personal-api-key-here

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
cp docker/swag/agy.subdomain.conf ${DOCKER_ROOT}/swag/nginx/proxy-confs/

# 2. Launch AGY on the 'lsio' external docker network
docker compose -f docker/docker-compose.prod.yml up -d
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

## 📲 Health Auto Export Automated REST Webhook Setup

Apple Health telemetry (biometrics, sleep stages, activity, nutrition, and mobility) is automatically pushed in the background from your iPhone/Apple Watch to your Mac via the **Health Auto Export** app's **Automated REST API** integration.

### Why Automated REST Webhook over Local MCP Server?
* **Zero iPhone Battery Drain**: The iPhone does not need to run a persistent server in the foreground/background listening for socket queries.
* **Continuous Background Sync**: Health Auto Export automatically triggers an HTTP POST export whenever Apple Health records new workouts, sleep, or weight entries.
* **Zero IP Drift Friction**: By using the Mac's Multicast DNS hostname (`http://Ayrtons-MacBook-Air.local:8080/api/health`), the iPhone seamlessly delivers data on your home or office Wi-Fi even if the Mac's LAN IP changes dynamically via DHCP.

### 📱 Step-by-Step iPhone Configuration
1. Open **Health Auto Export** on your iPhone.
2. Tap **Automations** (in the bottom navigation or sidebar) $\rightarrow$ Tap **Add Automation** $\rightarrow$ select **REST API**.
3. In the automation settings, configure:
   - **URL**: `http://Ayrtons-MacBook-Air.local:8080/api/health`
     *(Fallback if your router blocks mDNS / .local domains: `http://10.40.3.213:8080/api/health`)*
   - **Method**: `POST`
   - **Payload Type**: `JSON`
   - **Sync Cadence**: Background / Hourly / On Activity Complete (recommended)
4. Under **Metrics & Datasets**, select the ATHX required telemetry:
   - ✅ **Workouts & Exercise Sessions** (duration, heart rate, distance, calories)
   - ✅ **Active Energy & Resting Heart Rate (RHR)**
   - ✅ **Step Count & Walking/Running Distance**
   - ✅ **Body Mass (Weight) & Body Fat Percentage**
   - ✅ **Sleep Analysis** (In Bed, Core, Deep, REM sleep stages)
   - ✅ **Dietary Energy & Macronutrients** (Protein, Carbs, Fat)
   - ✅ **Mobility & Biomechanics** (Walking Speed, Step Length, Double Support Percentage)
5. Tap **Save**.
6. Tap **Test Connection** or **Export Now** to dispatch an initial payload to your Mac.

### 💻 Managing the Daemon on Your Mac
```bash
# Start webhook server in background daemon mode
athx serve -d

# Check ecosystem status, active port, and ingested CSV rows
athx status

# View setup guide, exact target URLs, and inspect latest received payload
athx health

# Re-ingest the last cached payload into CSVs
athx health --reingest

# Stop background server daemon
athx stop
```

---

## 📊 Executive Reporting & Slide Decks

- **[`ATHX_Garmin_Dashboard_Presentation.pptx`](file:///Users/ayrton.andre/Documents/work/AGY/ATHX_Garmin_Dashboard_Presentation.pptx)**: High-level executive presentation covering the Garmin athletic telemetry, hypertrophy progression, and ATHX 2027 roadmap.
- **Interactive Headquarters**: Hosted live on GitHub Pages at [`https://ayrtonxandre.github.io/agy/`](https://ayrtonxandre.github.io/agy/).
- **Official Draw.io Architecture Schema**: Complete platform system architecture diagrams in [`athx_architecture.drawio`](file:///Users/ayrton.andre/Documents/work/AGY/athx_architecture.drawio) and standalone HTML viewer in [`athx_architecture_preview.html`](file:///Users/ayrton.andre/Documents/work/AGY/athx_architecture_preview.html).

---

## 🔐 Security & Secrets
All tokens, OAuth credentials, and private keys (`credentials.json`, `token.json`, `drive_token.json`, `gcp_token.json`, `garmin_tokens/`, `hae_token.txt`, `.env`) are strictly git-ignored and never committed to version control.
