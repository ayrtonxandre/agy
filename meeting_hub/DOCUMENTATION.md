# Meeting Hub: Architecture, Codebase Guide & Evolution from Original Prompt

This document provides a comprehensive technical overview of the **Meeting Hub** codebase, explaining the role of every file, the current architectural design, and the specific modifications, pivots, and scope expansions made relative to the initial prompt (`AGY_PROMPT.md`). It is structured to give **Claude** (or any reviewer) full context to provide strategic and technical guidance on next steps.

---

## 1. Executive Summary & Purpose

**Meeting Hub** is a desktop-first, meeting-centred productivity web application designed to replace a legacy 600 KB single-file calendar view (`calendar_dashboard.html`). 

- **Core Product Goal**: *"Walk into every meeting prepared, walk out with actions captured."*
- **Design System**: **Arty Design System** (Jost typography for UI, Fira Code for times/IDs, dark navy shell `#0B132B`, OKLCH dark mode tokens, flat 1px borders, strict Lucide stroke SVG icons, zero emojis).
- **Architecture**: Client-side modular vanilla ES modules compiled via `build.js` into a standalone, zero-dependency bundle (`meeting_hub.app.js`) that works seamlessly both under `file://` (Finder double-click) and `http://localhost:8080/meeting`, backed by an optional Python bridge (`orchestrator.py`) on port 8080.
- **Dataset**: 259 real calendar events across 4 calendar streams: Artefact (Google), Clariane (Outlook ICS), Personal (iCloud), and ATHX (Garmin training overlay).

---

## 2. Codebase Directory & File Guide

```
meeting_hub/
├── meeting_hub.html           # Application HTML shell & viewport container
├── meeting_hub.app.js         # Compiled, standalone application bundle (315.4 KB)
├── build.js                   # Node.js bundler (compiles modules, builds missions snapshot)
├── _deprecated/               # Archived domain logic retired in Phase 4
│   ├── minutes_engine.js      # Archived original minutes extraction engine
│   ├── project_engine.js      # Archived in-memory multi-meeting synthesis engine
│   └── project.js             # Archived hardcoded project constants
├── data/
│   ├── adapter.js             # Multi-engine storage adapter (IndexedDB -> LocalStorage -> Memory)
│   ├── db.js                  # Database schema & store initializers
│   ├── importer.js            # Idempotent calendar importer & meeting notes initial seed
│   ├── initial_events.json    # Static JSON of 259 calendar events
│   ├── initial_events.js      # Global JS wrapper for initial events (file:// CORS resilience)
│   ├── missions_snapshot.js   # Offline missions registry snapshot (from Missions/missions.yaml)
│   ├── docs_cache.json        # Pre-cached real meeting minutes from Google Docs (server-only)
│   └── sync.js                # Calendar sync service & stream freshness tracking
├── model/
│   ├── event.js               # Event domain model, date parsing & normalization
│   ├── series.js              # Recurring series clustering & cadence inference
│   ├── links.js               # LinkEngine: deterministic meeting linkage & accept/reject store
│   ├── prep_score.js          # Dynamic meeting readiness calculator (evaluates inbox pending state)
│   ├── minutes_engine.js      # Deterministic minutes parser (metadata, participants, topics, actions)
│   ├── project.js             # Generic decoupled ProjectModel factory & validator
│   └── store.js               # Central reactive state store (wires to /api/missions/* and snapshot)
├── ui/
│   ├── icons.js               # Pure stroke SVG icon library (Lucide/Tabler, no emojis)
│   ├── styles.css             # Arty design tokens (OKLCH, typography, dark mode, layout)
│   ├── shell.js               # Persistent dark navy sidebar, sticky header, theme toggle
│   ├── meeting_panel.js       # Right slide-over drawer (Agenda, Minutes with inbox status, Actions)
│   └── cart.js                # Macro Cart component (logic preserved, UI deferred)
├── views/
│   ├── today.js               # Today timeline, next-up prep card with note context, inbox pending alert
│   ├── week.js                # Multi-day weekly health review & density KPIs
│   ├── meetings.js            # Searchable, filterable calendar directory (259 events)
│   ├── actions.js             # Open actions view reading authoritatively from mission notes (Actions.md)
│   ├── series.js              # Recurring meeting series browser & lineage graphs
│   └── projects.js            # Project Base reading live note summaries (workstreams, decisions, matrix)
└── tests/
    ├── test_step2.js          # Generic decoupled models & honest coverage tests (7/7 pass)
    ├── test_phase3.js         # Store & views integration with mission notes system of record (6/6 pass)
    └── test_mission_notes.py  # Python backend mission notes parser & idempotency tests (6/6 pass)
```

### Detailed File Responsibilities

| File | Responsibilities |
| :--- | :--- |
| **`meeting_hub.html`** | Single HTML entry point. Loads Jost & Fira Code Google Fonts, `styles.css`, `initial_events.js`, and `meeting_hub.app.js`. Mounts `<aside>` (sidebar), `<header>`, and split columns (`#left` main view, `#right` drawer). |
| **`build.js`** | Concatenates modules in topological order, strips ESM `import`/`export` keywords, exports them onto `window.MeetingHub`, auto-generates `data/missions_snapshot.js` from `Missions/missions.yaml`, strips client minutes from bundle for privacy, and wires router and shortcuts. |
| **`data/adapter.js`** | Unified asynchronous key-value database interface (`get`, `put`, `getAll`, `delete`, `clear`). Automatically tests IndexedDB; if blocked by sandbox or browser security, falls back gracefully to `LocalStorageAdapter` or `MemoryAdapter`. |
| **`data/db.js`** | Factory `getDatabase()`. Defines object stores: `events`, `series`, `links`, `meeting_data`, `cart`, `sync_status`. Browser storage strictly retains UI preferences and calendar caches—never mission knowledge. |
| **`data/importer.js`** | Imports the 259 calendar events idempotently. Groups recurring meetings into series entries. Seeds flagship Clariane meetings with their Google Doc URLs. |
| **`data/sync.js`** | `CalendarSyncService`. Manages 4 calendar streams (Google Artefact, Outlook Clariane, iCloud Personal, Garmin ATHX). Tracks per-source `lastSynced` timestamps, relative time strings ("Just now", "2m ago"), and simulated sync re-fetching. |
| **`data/missions_snapshot.js`** | Offline snapshot of `missions.yaml` generated by `build.js` so `file://` mode loads registry metadata without network or CORS restrictions. |
| **`data/docs_cache.json`** | Local cache of real Google Doc meeting minutes used strictly on backend (`/api/docs/fetch`); never baked into the distributed frontend bundle. |
| **`model/event.js`** | Standardizes raw calendar payloads. Normalizes start/end strings (`HH:MM`), calculates `durationMin`, assigns `stream` (`work` vs `life`), cleans titles, detects training/recovery sessions, and extracts `googleDocUrl`. |
| **`model/series.js`** | Groups repetitive meeting subjects into recurring series objects with calculated cadence (weekly, bi-weekly, monthly) and event lists. |
| **`model/links.js`** | `LinkEngine`. Deterministically links meetings based on: (1) series lineage, (2) overlapping attendee sets, (3) matching client tags, (4) explicit parent-child relations. Supports an **Accept / Reject / Unlink** workflow so the user controls connections. |
| **`model/prep_score.js`** | Evaluates meeting readiness (Agenda, previous meeting folded into notes, carried-over actions, and inbox pending status). |
| **`model/minutes_engine.js`** | Minutes parser for meeting metadata (date, facility, title), participants, topics, and meeting-level actions. Decisions and domain knowledge extraction are deprecated in favor of the authoritative note fold workflow. |
| **`model/project.js`** | Generic decoupled `ProjectModel` validator and factory. Hardcoded constants were removed and archived into `_deprecated/`. |
| **`model/store.js`** | `MeetingHubStore` singleton. Orchestrates cache access, loads `/api/missions/*`, builds `ProjectBase` directly from parsed Markdown note summaries, tracks inbox status, and delivers 1-click clipboard action management. |
| **`ui/icons.js`** | SVG stroke icons (no emojis): `calendar`, `week`, `users`, `checkSquare`, `link`, `activity`, `plus`, `refreshCw`, `layers`, `fileText`, `externalLink`, `clock`, `alertCircle`, etc. |
| **`ui/styles.css`** | Arty design system tokens: OKLCH color definitions, CSS variables, typography hierarchy, layout grid, dense KPI metric cells, badge variants, theme toggle styles, meeting drawer slide-over, and responsive breakpoints. |
| **`ui/shell.js`** | Manages persistent sidebar navigation (Today, Week, Meetings, Open Actions, Series & Links, Projects & Knowledge, ATHX Athlete link), calendar stream sync status indicator, Work/Life/All filter pills, theme toggle (Dark/Light), and header updates. |
| **`ui/meeting_panel.js`** | Right-hand drawer routed to `#/meeting/:id`. Minutes tab features mission selector, live inbox status badge (`✓ Folded into mission notes`, `⏳ In inbox, waiting to be folded`, `Not sent`), and `#sendToInboxBtn`. Actions tab displays note-derived decisions and actions citing this meeting. |
| **`ui/cart.js`** | Macro Cart tray component. Manages adding items to a persistent cart for batch recap email, follow-up meeting drafting, or task batch export. |
| **`views/today.js`** | Daily view: Top "Next Up" preparation banner with note-derived workstream context (3–5 open points and recent validated decisions), inbox pending warning alert, all-day events strip, and timed scrollable timeline. |
| **`views/week.js`** | Multi-day review view: 4 KPI summary cards (Meeting Load, Prep Readiness, Open Actions, Life Balance), multi-column day grid showing meeting distribution. |
| **`views/meetings.js`** | Searchable table directory of all 259 events with client badges, stream indicators, date filtering, and quick search. |
| **`views/actions.js`** | Open Actions view aggregating actions from `Actions.md` across all registered missions alongside local items. Renders Action ID badges (`ACT-CLAR-01`), source file badges (`[Actions.md]`), and 1-click `📋 Copy ID` buttons. |
| **`views/series.js`** | Recurring series view: list of recurring series with occurrences count, cadence badge, and visual lineage cards of past/future sessions. |
| **`views/projects.js`** | Project Base & Knowledge Hub driven live by mission note summaries: Top KPI strip with inbox pending alerts, note workstreams with open points lists, cumulative decision register, and action matrix with single-source-of-truth guards. |
| **`mission_notes.py`** | Standalone backend module parsing Markdown tables in `Missions/` (Decisions, Actions, Open Points, Rules), resolving safe paths, enforcing inbox idempotency, and generating full mission summaries. |
| **`orchestrator.py`** | Python backend server on port 8080. Added localhost-only `/api/missions/*` REST endpoints, `/api/docs/fetch`, and static routing for `/meeting`. |

---

## 3. Modifications & Evolution from Original Prompt (`AGY_PROMPT.md`)

The table below contrasts what was originally specified in `AGY_PROMPT.md` against the user-driven decisions and pivots executed during implementation:

| Domain / Feature | Original Prompt Specification (`AGY_PROMPT.md`) | What Was Actually Built & Pivots Made | Rationale / User Direction |
| :--- | :--- | :--- | :--- |
| **1. Primary Focus & Macro Cart** | Step 5 prioritized the **Macro Cart**: basket for collecting actions/decisions to export recap emails or draft meetings. | **Macro Cart deferred.** The cart component code was preserved (`meeting_hub/ui/cart.js`), but removed from active navigation and drawers. | User requested: *"drop the macro cart for now lets keep focus on the calendar for now... the calendar view will be replaced by this meeting tool so drop it"*. Later re-confirmed: *"Lets keep cart for later. i want to work with the minutes from meeting."* |
| **2. Visual Theme & Dark Mode** | Starter template was light mode with navy sidebar. Dark mode was not part of the initial 7 steps. | **Dark mode set as primary default** (`<html class="dark">`). Complete OKLCH dark palette with dark navy surfaces (`#0b132b`, `#1c2541`), subtle borders, and smooth theme switching. | User requested: *"Love it lets go phase 2 and swithc to dark mode"*. |
| **3. Build Order** | Sequential 7 steps: 1 (Data Layer) → 2 (Sync) → 3 (Meeting Page) → 4 (Prep Score) → 5 (Cart) → 6 (Links) → 7 (Secondary Views). | **Reordered execution:** Steps 1, 2, 3, 4 were built, then **Step 6 & 7 were built before Step 5**, followed by the new Minutes & Project Base scope. | User requested: *"lets do 6 and 7 before step 5"*. |
| **4. Secondary Views (Step 7)** | Described simply as: Week, Meetings list, Open Actions by client, Series & Links graph/timeline. Move old KPIs into weekly review. | Built 4 distinct views: **WeekView** (with weekly health KPIs), **MeetingsView** (259 events searchable table), **ActionsView** (client-grouped action cards with completion state), and **SeriesView** (recurring lineage). | Fully completed step 7 matching Arty design tokens and keyboard-first navigation. |
| **5. Meeting Minutes Ingestion** | Described only as a text seam in the meeting panel to propose links from minutes text. | **Automated Google Docs Minutes Ingestion:** Added live Google Drive API bridge (`/api/docs/fetch`), Google Doc URL detection, 1-click fetch, local file upload (`.md`, `.txt`, `.json`), text area auto-saving, and offline cache. | User requested: *"i would like to provide the minutes from the meeting to the dash or for them to be querried from google calendar attached doc to feel the actions, context and kwoledge on a project."* Provided real Clariane Google Docs. |
| **6. Extraction Confirmation** | No review mechanism was specified (either auto-extracted or omitted). | **Extraction Review Card:** Minutes extraction runs deterministically, presenting proposed actions (with inferred owner and due date) and decisions with individual checkboxes and a 1-click `✓ Apply to Meeting Items & Project Base` button. | Designed to prevent automated noise from polluting the persistent action backlog. |
| **7. Project Base & Knowledge Hub** | **Not in original prompt.** Original prompt only scoped event-level notes and series grouping. | **Complete Project Base Knowledge Hub (`views/projects.js` & `#/projects`):** Aggregates minutes across an entire client initiative (Clariane: 48 meetings). Provides 4 Strategic Workstreams, a Cumulative Decision Register, Cross-Meeting Action Matrix, Stakeholder Directory, and Connected Docs. | User requested: *"On the project level, the sum of the minutes could feed the whole project base. Lets scope this"*. |
| **8. Data Layer Resilience** | Prompt specified IndexedDB with a thin adapter. | **Multi-Engine Resilient Database Adapter (`adapter.js`):** IndexedDB + LocalStorage fallback + In-memory fallback + bundled cache (`window.DOCS_CACHE` & `window.INITIAL_EVENTS`). | When running under strict browser environments or `file://`, raw IndexedDB calls hung. Adapter ensures zero-latency instant loading everywhere. |
| **9. Knowledge Moved to Markdown System of Record** | Original implementation relied on in-memory `ProjectEngine` regex parsing across historical meetings and IndexedDB items. | **Plain Markdown System of Record (`Missions/`):** Plain Markdown notes in `/Users/ayrtonandre/Documents/work/Missions/` are the authoritative single source of truth for decisions, actions, and workstream rules. Meeting Hub captures raw minutes to `_inbox/` and reads live summaries from `/api/missions/*`. Action items in the Hub point to `Actions.md` as the single source of truth (users copy the action ID with 1 click to mark done in the note). `ProjectEngine` was retired to `_deprecated/`, and raw client minutes were removed from the bundled client JS for complete privacy. | User approved merge plan (`docs/AGY_PROMPT_KNOWLEDGE_MERGE.md`) to establish durable plain-text files as the single source of truth for all mission knowledge and eliminate browser-only state risks. |

---

## 4. Key Architectural Systems

### A. Mission System of Record & Markdown Notes Seam
Located at [`mission_notes.py`](file:///Users/ayrtonandre/Documents/work/AGY/mission_notes.py) and `/Users/ayrtonandre/Documents/work/Missions/`:
- **Single Source of Truth**: All domain decisions, open points, actions, and workstream rules live in human-readable Markdown files (`Mission Overview.md`, `Actions.md`, facility notes).
- **The Fold Workflow**: Raw minutes captured in Meeting Hub are delivered via `POST /api/missions/<id>/inbox` to `_inbox/`. The user/agent folds them into authoritative Markdown notes, moving processed minutes to `_inbox/_folded/`.
- **Backend Bridge**: `mission_notes.py` parses Markdown tables, resolves safe paths (strictly blocking traversal attacks), provides inbox write idempotency, and aggregates full mission summaries consumed via `/api/missions/<id>/summary`.
- **Dual Run Mode**: Online mode reads live note summaries from the backend; standalone `file://` mode degrades gracefully by loading `data/missions_snapshot.js`.

### B. Meeting Minutes Capture (`MinutesEngine` & Drawer)
Located at [`meeting_hub/model/minutes_engine.js`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/model/minutes_engine.js) and [`meeting_hub/ui/meeting_panel.js`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/ui/meeting_panel.js):
- **Deterministic Regex-Based Parser**: Operates instantly and offline to extract meeting metadata, participants (with clinical/operational roles), topics, and immediate meeting actions.
- **Minutes Ingestion & Inbox Delivery**: Connects to Google Docs via `/api/docs/fetch` or accepts manual text/Granola notes. Displays live inbox status (`Not sent`, `⏳ In inbox, waiting to be folded`, `✓ Folded into mission notes`) and dispatches to the mission inbox via `#sendToInboxBtn`.
- **Decisions & Knowledge Decoupling**: Decisions and domain knowledge entities are no longer extracted into ad-hoc browser memory; they are authoritatively extracted during the note fold workflow.

### C. Project Base & Workstreams View (`views/projects.js`)
Located at [`meeting_hub/views/projects.js`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/views/projects.js):
- **Direct Note Synthesis**: Powered live by `store.buildProjectBaseFromSummary()`.
- **Workstreams with Open Points**: Each workstream card displays its active open points directly from the corresponding Markdown note.
- **Cumulative Decision Register**: Permanent log of architecture and workflow agreements with links back to the meeting session where they were made.
- **Single Source of Truth Action Matrix**: Filterable action matrix citing `Actions.md`. Renders Action ID badges (`ACT-CLAR-01`), source note badges, and 1-click `📋 Copy ID` buttons, guarding against silent browser DB divergence.

### D. Persistent Routing & Keyboard Navigation
- **Routes**:
  - `#/today`: Today view.
  - `#/week`: Weekly review view.
  - `#/meetings`: Searchable directory.
  - `#/actions`: Open actions backlog reading from mission notes.
  - `#/series`: Recurring series & lineages.
  - `#/projects`: Project Base & Knowledge Hub.
  - `#/meeting/:id`: Opens right-hand drawer while preserving the active left view.
- **Shortcuts**:
  - `j` / `ArrowDown`: Select next meeting.
  - `k` / `ArrowUp`: Select previous meeting.
  - `a`: Quick-focus action input in the meeting drawer.
  - `/`: Focus quick search.
  - `\`: Toggle right-hand meeting drawer (collapse/expand).
  - `Escape`: Clear search or close drawer.

---

## 5. Current Verification & Build State

1. **Phase 1 to Phase 4 Completed & Verified**:
   - Missions system of record established under `/Users/ayrtonandre/Documents/work/Missions/Clariane HDJ Planning Manager/` following `bootstrapping-missions` standards.
   - Fold workflow implemented and tested on real meeting minutes (`execute_fold.py`).
   - Frontend wired to live Markdown summaries (`/api/missions/*`) with graceful `file://` fallback (`missions_snapshot.js`).
   - Legacy `ProjectEngine` and hardcoded project constants moved to `meeting_hub/_deprecated/`.
   - Client minutes purged from `meeting_hub.app.js` (`window.DOCS_CACHE = {}`), reducing bundle size from 359.8 KB to **315.4 KB (-44.4 KB / -12.3%)**.
2. **Automated Test Suites (100% Passing)**:
   - `test_step2.js`: 7/7 PASSED (Decoupled models, honest coverage, decision deduplication).
   - `test_phase3.js`: 6/6 PASSED (Mission registry, summary mapping, single source of truth action contract, inbox status detection, prep score alerts).
   - `test_mission_notes.py`: 6/6 PASSED (Markdown table parser, path traversal protection, inbox idempotency).
3. **Execution Modes**:
   - `http://localhost:8080/meeting` (via `python3 orchestrator.py serve` or `meeting` command).
   - `file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub.html` (standalone double-click in browser).

---

## 6. Strategic Questions & Guidance Points for Claude

When presenting this project to Claude, consider asking the following targeted questions:

1. **Phase 3: Hybrid LLM + Deterministic Intelligence**:
   - Currently, `MinutesEngine` runs client-side deterministic regex/heuristic parsing. Where should an LLM pass (via local Python server on port 8080 or Vertex AI) augment this?
   - What is the best pattern to preserve deterministic speed for routine tasks while delegating semantic synthesis (e.g., latent risk detection across projects, contradictory decision alerts) to an LLM?
2. **Bi-directional Sync & Meeting Notes Export**:
   - Currently, notes are ingested into local storage from Google Docs. How should we architect exporting captured actions and follow-up recaps back into external tools (Google Docs, Notion, or Slack) while respecting the "client data stays local" principle?
3. **Macro Cart Re-integration**:
   - The Macro Cart (collecting items across meetings into a unified export basket) was preserved in `ui/cart.js` but deferred from the UI. How should it be re-integrated into the 9-project workflow (e.g. generating a weekly executive briefing across multiple initiatives)?
4. **Deprecating Legacy `calendar_dashboard.html`**:
   - With `meeting_hub.html` providing Today, Week, Meetings, Open Actions, Series & Links, and Projects & Knowledge, are there any critical UX or performance gaps preventing the complete deprecation of the 600 KB legacy dashboard?
