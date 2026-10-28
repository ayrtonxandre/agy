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
├── meeting_hub.app.js         # Compiled, standalone application bundle (245 KB)
├── build.js                   # Node.js bundler (compiles modules, embeds cache & seed)
├── data/
│   ├── adapter.js             # Multi-engine storage adapter (IndexedDB -> LocalStorage -> Memory)
│   ├── db.js                  # Database schema & store initializers
│   ├── importer.js            # Idempotent calendar importer & meeting notes initial seed
│   ├── initial_events.json    # Static JSON of 259 calendar events
│   ├── initial_events.js      # Global JS wrapper for initial events (file:// CORS resilience)
│   ├── docs_cache.json        # Pre-cached real meeting minutes from Google Docs
│   └── sync.js                # Calendar sync service & stream freshness tracking
├── model/
│   ├── event.js               # Event domain model, date parsing & normalization
│   ├── series.js              # Recurring series clustering & cadence inference
│   ├── links.js               # LinkEngine: deterministic meeting linkage & accept/reject store
│   ├── prep_score.js          # Dynamic meeting readiness calculator (0-100%)
│   ├── minutes_engine.js      # Deterministic minutes parser (actions, decisions, entities)
│   ├── project_engine.js      # Cross-meeting aggregator (workstreams, decisions, action matrix)
│   └── store.js               # Central reactive state store (MeetingHubStore singleton)
├── ui/
│   ├── icons.js               # Pure stroke SVG icon library (Lucide/Tabler, no emojis)
│   ├── styles.css             # Arty design tokens (OKLCH, typography, dark mode, layout)
│   ├── shell.js               # Persistent dark navy sidebar, sticky header, theme toggle
│   ├── meeting_panel.js       # Right slide-over drawer (Agenda, Minutes, Actions, Decisions, Related)
│   └── cart.js                # Macro Cart component (logic preserved, UI deferred)
└── views/
    ├── today.js               # Today timeline, next-up prep card, all-day strip, life overlay
    ├── week.js                # Multi-day weekly health review & density KPIs
    ├── meetings.js            # Searchable, filterable calendar directory (259 events)
    ├── actions.js             # Open actions view grouped by client engagement
    ├── series.js              # Recurring meeting series browser & lineage graphs
    └── projects.js            # Project Base & Knowledge Hub (workstreams, decision register, matrix)
```

### Detailed File Responsibilities

| File | Responsibilities |
| :--- | :--- |
| **`meeting_hub.html`** | Single HTML entry point. Loads Jost & Fira Code Google Fonts, `styles.css`, `initial_events.js`, and `meeting_hub.app.js`. Mounts `<aside>` (sidebar), `<header>`, and split columns (`#left` main view, `#right` drawer). |
| **`build.js`** | Concatenates modules in topological order, strips ESM `import`/`export` keywords, exports them onto `window.MeetingHub`, embeds `initial_events.js` and `docs_cache.json` (`window.DOCS_CACHE`), and wires the global hash router and keyboard shortcuts. |
| **`data/adapter.js`** | Unified asynchronous key-value database interface (`get`, `put`, `getAll`, `delete`, `clear`). Automatically tests IndexedDB; if blocked by sandbox or browser security, falls back gracefully to `LocalStorageAdapter` or `MemoryAdapter`. |
| **`data/db.js`** | Factory `getDatabase()`. Defines object stores: `events`, `series`, `links`, `meeting_data`, `cart`, `sync_status`. |
| **`data/importer.js`** | Imports the 259 calendar events idempotently. Groups recurring meetings into series entries. Seeds flagship Clariane meetings with their Google Doc URLs. |
| **`data/sync.js`** | `CalendarSyncService`. Manages 4 calendar streams (Google Artefact, Outlook Clariane, iCloud Personal, Garmin ATHX). Tracks per-source `lastSynced` timestamps, relative time strings ("Just now", "2m ago"), and simulated sync re-fetching. |
| **`data/docs_cache.json`** | Local cache of real Google Doc meeting minutes for offline/file-mode reliability (e.g. Mariéna and Les Arbelles planning meetings). |
| **`model/event.js`** | Standardizes raw calendar payloads. Normalizes start/end strings (`HH:MM`), calculates `durationMin`, assigns `stream` (`work` vs `life`), cleans titles, detects training/recovery sessions, and extracts `googleDocUrl`. |
| **`model/series.js`** | Groups repetitive meeting subjects into recurring series objects with calculated cadence (weekly, bi-weekly, monthly) and event lists. |
| **`model/links.js`** | `LinkEngine`. Deterministically links meetings based on: (1) series lineage, (2) overlapping attendee sets, (3) matching client tags, (4) explicit parent-child relations. Supports an **Accept / Reject / Unlink** workflow so the user controls connections. |
| **`model/prep_score.js`** | Calculates 0–100% meeting readiness based on: Agenda populated (+35%), previous minutes logged (+35%), open actions reviewed (+30%). Provides dynamic badge color classes (`ok`, `warn`, `pink`). |
| **`model/minutes_engine.js`** | Deterministic minutes intelligence parser. Takes raw plain text or Markdown notes and extracts: metadata (facility, date), participants (with roles/orgs), discussion topics, action items (with owner parsing, owner organization, and due timing), validated decision statements, and knowledge tools (`Foundry`, `HM`, `rTMS`). |
| **`model/project_engine.js`** | Aggregates all meeting notes, actions, decisions, and connected docs across a client (e.g. Clariane). Synthesizes 4 Strategic Workstreams, compiles a Cumulative Decision Register, builds a Cross-Meeting Action Matrix, and indexes participating stakeholders. |
| **`model/store.js`** | `MeetingHubStore` singleton. In-memory cached access to events, series, and links. Manages reactive pub/sub subscriptions, saves meeting notes/items keyed strictly by `id`, queries `/api/docs/fetch` or local cache, and computes project bases. |
| **`ui/icons.js`** | SVG stroke icons (no emojis): `calendar`, `week`, `users`, `checkSquare`, `link`, `activity`, `plus`, `refreshCw`, `layers`, `fileText`, `externalLink`, `clock`, `alertCircle`, etc. |
| **`ui/styles.css`** | Arty design system tokens: OKLCH color definitions, CSS variables, typography hierarchy, layout grid, dense KPI metric cells, badge variants, theme toggle styles, meeting drawer slide-over, and responsive breakpoints. |
| **`ui/shell.js`** | Manages persistent sidebar navigation (Today, Week, Meetings, Open Actions, Series & Links, Projects & Knowledge, ATHX Athlete link), calendar stream sync status indicator, Work/Life/All filter pills, theme toggle (Dark/Light), and header updates. |
| **`ui/meeting_panel.js`** | Right-hand drawer routed to `#/meeting/:id`. Contains 5 tabs: **Agenda**, **Minutes** (connected Google Doc, 1-click fetch, file upload, text area, extraction review card), **Actions** (interactive checkboxes, owner, due date), **Decisions**, and **Related** (accepted and suggested meeting links). |
| **`ui/cart.js`** | Macro Cart tray component. Manages adding items to a persistent cart for batch recap email, follow-up meeting drafting, or task batch export. |
| **`views/today.js`** | Daily view: Top "Next Up" preparation banner with dynamic prep score and action list; all-day events strip; timed scrollable timeline with visual indicators and life overlay. |
| **`views/week.js`** | Multi-day review view: 4 KPI summary cards (Meeting Load, Prep Readiness, Open Actions, Life Balance), multi-column day grid showing meeting distribution. |
| **`views/meetings.js`** | Searchable table directory of all 259 events with client badges, stream indicators, date filtering, and quick search. |
| **`views/actions.js`** | Open Actions view grouping pending action items by client engagement (Artefact, Clariane, Crédit Agricole, Ferrero) with quick toggle and owner tags. |
| **`views/series.js`** | Recurring series view: list of recurring series with occurrences count, cadence badge, and visual lineage cards of past/future sessions. |
| **`views/projects.js`** | Project Base & Knowledge Hub for client initiatives (e.g. Clariane HDJ Planning Manager): Top KPI strip (Meetings, Actions, Decisions, Docs), 4 Strategic Workstreams, Cumulative Decision Register, Cross-Meeting Action Matrix, Stakeholder Directory, and Connected Docs. |
| **`orchestrator.py`** | Python backend server on port 8080. Added `/api/docs/fetch` (Google Drive v3 API `files().export(mimeType='text/plain')` with cache fallback) and routing for `/meeting`. |

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

---

## 4. Key Architectural Systems

### A. Meeting Minutes Intelligence Engine (`MinutesEngine`)
Located at [`meeting_hub/model/minutes_engine.js`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/model/minutes_engine.js):
- **Deterministic Regex-Based Parser**: Does not require an external LLM for core extraction; operates instantly and offline.
- **Participants**: Extracts name, role, and organization (e.g., `GAILLET Claire | IDE - Marienia`, `FERRIER Fabien | Cadre de rééducation`).
- **Actions**: Matches action bullet items, splits on `:` or `|`, attributes owners (`Claire GAILLET`, `Artefact`, `Les Arbelles`, `Équipe`), infers organization (`Client` vs `Artefact` vs `Transversal`), determines due dates (`Semaine prochaine`, `Cette semaine`, `Prioritaire`), and assigns workstream tags (`hm-sync`, `foundry`, `modeling`, `alerting`, `analytics`).
- **Decisions**: Detects French decision structures (*Workflow de Validation*, *Politique Zéro Temps Mort*, *Solution Retenue*, *Surbooking*, *Règle Bilans*).
- **Knowledge Entities**: Tags platforms (`Foundry`, `Hôpital Manager`) and clinical concepts (`Flux Annonces`, `Case Mix`, `rTMS/tDCS`, `Balnéothérapie`).

### B. Project Base Knowledge Hub (`ProjectEngine` & `ProjectsView`)
Located at [`meeting_hub/model/project_engine.js`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/model/project_engine.js) and [`meeting_hub/views/projects.js`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/views/projects.js):
- **Synthesis Across Sessions**: Gathers all meetings tagged with a client (`Clariane`), extracts minutes items, and deduplicates decisions and actions.
- **Strategic Workstreams**:
  1. *Flux Annonces & Processus d’Admission* (`HM → Foundry`)
  2. *Modélisation des Programmes Thérapeutiques* (`Moteur & Contraintes`)
  3. *Synchronisation SIH & Circuit de Validation* (`Foundry ↔ HM`)
  4. *Analytique, Alerting & Case Mix* (`Reporting & Pilotage`)
- **Cumulative Decision Register**: Permanent log of architecture and workflow agreements with links back to the meeting session where they were made.
- **Cross-Meeting Action Matrix**: Filterable by owner organization (`Artefact` vs `Client`), status (`Open` vs `Done`), with live checkbox toggle and search.
- **Connected Docs & Artifacts**: Direct links to open Google Docs (`Open Google Doc ↗`) and jump directly to relevant calendar events.

### C. Persistent Routing & Keyboard Navigation
- **Routes**:
  - `#/today`: Today view.
  - `#/week`: Weekly review view.
  - `#/meetings`: Searchable directory.
  - `#/actions`: Open actions backlog.
  - `#/series`: Recurring series & lineages.
  - `#/projects`: Project Base & Knowledge Hub.
  - `#/meeting/:id`: Opens right-hand drawer while preserving the active left view.
- **Shortcuts**:
  - `j` / `ArrowDown`: Select next meeting.
  - `k` / `ArrowUp`: Select previous meeting.
  - `a`: Quick-focus action input in the meeting drawer.
  - `/`: Focus quick search.
  - `Escape`: Clear search or close drawer.

---

## 5. Current Verification & Build State

1. **Compilation**: `node meeting_hub/build.js` produces a verified 245 KB standalone bundle [`meeting_hub/meeting_hub.app.js`](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub/meeting_hub.app.js) with zero syntax errors (`node -c`).
2. **Automated Test Suite**: Verified via [`test_minutes_and_project_base.js`](file:///Users/ayrtonandre/.gemini/antigravity-cli/brain/dd4c4380-20e9-408b-bf58-a0affef6c7bd/scratch/test_minutes_and_project_base.js):
   - Correctly parses real Google Docs from Clariane (*Mariéna* and *Les Arbelles*).
   - Generates 13 cross-meeting action matrix items, 8 cumulative decisions, 5 stakeholders, and 4 workstreams across 48 Clariane meetings.
3. **Execution Modes**:
   - `http://localhost:8080/meeting` (via `orchestrator.py`).
   - `file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub.html` (standalone double-click in browser).

---

## 6. Strategic Questions & Guidance Points for Claude

When presenting this project to Claude, consider asking the following targeted questions:

1. **Project Base Scope & Scalability**:
   - Currently, the Project Base synthesizes minutes deterministically for Clariane across its 48 meetings. How should we generalize multi-project switching (e.g. Artefact internal, Crédit Agricole, Ferrero) without creating clutter?
   - Should project workstreams be dynamically discovered from minutes tags, or user-configurable per initiative?
2. **LLM vs Deterministic Minutes Intelligence**:
   - Currently, `MinutesEngine` uses high-precision regex/heuristics to parse French clinical/consulting notes. Where should an LLM pass (via local Python bridge or API) augment this (e.g., summarizing discussions, discovering latent risks, or auto-linking to previous decisions)?
3. **Macro Cart Re-integration**:
   - The user deferred the Macro Cart to prioritize minutes and calendar replacement. When re-introducing the cart, how should it interact with the new Project Base (e.g., adding actions directly from the Cross-Meeting Action Matrix into a weekly client status email)?
4. **Calendar Dashboard Retirement**:
   - With `meeting_hub.html` now offering Today, Week (with KPIs), Meetings directory, Actions, Series, and Projects, what remaining gaps (if any) prevent fully deprecating the legacy 600 KB `calendar_dashboard.html`?
