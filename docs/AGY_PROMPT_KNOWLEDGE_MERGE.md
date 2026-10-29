# Meeting Hub × Mission Notes: merge plan for Antigravity

> Paste this whole file as the prompt of a new Antigravity session opened on `/Users/ayrtonandre/Documents/work/AGY`.
> Work in phases. **Stop at every `STOP` gate**, show what you did and wait for my explicit "go". Never chain two phases without approval.

---

## 0. Context: why we are doing this

I built **Meeting Hub** (`meeting_hub.html` + `meeting_hub/`, documented in `meeting_hub/DOCUMENTATION.md`). It works well as a **daily front-end**: Today timeline, Week, Meetings directory, 48h prep checklist, meeting drawer, Google Doc minutes ingestion.

But as a **knowledge base** it has structural problems:

1. All knowledge (decisions, actions, project base) lives in browser storage (IndexedDB → localStorage → memory, see `data/adapter.js`). `file://` and `http://localhost:8080` are different browser origins, so they hold **two separate, diverging stores**. Clearing site data wipes everything. No agent can read it.
2. Extraction is regex-based (`model/minutes_engine.js`): it works on the Clariane minutes format and silently misses anything else.
3. Project knowledge is hardcoded in JS (`model/project.js`: `DEFAULT_CLARIANE_PROJECT`, `MO_PROJECT`, … 9 projects, their workstreams and `parserHints`).
4. `model/project_engine.js` + `views/projects.js` rebuild a decision register / action matrix / stakeholder list that is really a set of notes.
5. Real client minutes (`data/docs_cache.json`) are bundled into `meeting_hub.app.js`, and secrets (`credentials.json`, `token.json`, `drive_token.json`, `hae_token.txt`) sit at the AGY root next to code.

A colleague (Alexis Cappé) wrote a skill, **bootstrapping-missions**, located at:
`/Users/ayrtonandre/Downloads/bootstrapping-missions/`
(`SKILL.md`, `references/{intake,interview,harnesses,note-discipline}.md`, `assets/{mission-overview,contacts,workstream-note,agent-brief}.md`).

It defines a **system of record**: per mission, plain notes (Mission Overview, Contacts, one note per workstream, Agent brief) that are *true in their entirety right now*, with decision logs and ID'd open points, which any agent can read and keep current.

**Target architecture (the decision is made, do not re-litigate it):**

```
                 ┌──────────────────────────────────────────┐
  Calendar  ───► │ Meeting Hub (front-end)                  │
  Google Docs ─► │ Today / Week / Prep / Drawer / Capture   │
                 └───────────┬──────────────▲───────────────┘
                   writes raw│minutes       │reads notes (decision log,
                   to _inbox │              │open points, workstreams)
                 ┌───────────▼──────────────┴───────────────┐
                 │ Missions/<Mission>/  (Markdown = SOURCE  │
                 │ OF TRUTH, bootstrapping-missions format) │
                 └───────────▲──────────────────────────────┘
                             │ "fold the inbox" (agent session,
                             │  rules from note-discipline.md)
                       Antigravity / Claude
```

- **Markdown notes are the single source of truth for knowledge.** The hub never owns knowledge again; it only reads it and drops raw material into an inbox.
- **The hub keeps** calendar, Today, Week, Meetings, Series & Links, prep checklist, drawer, minutes capture (Google Doc fetch, upload, textarea).
- **Folding minutes into notes is done by an agent**, following `references/note-discipline.md` (rewrite facts in place, decision-log rows only for decisions, open points with stable IDs, no changelogs).

---

## 1. Global rules for this whole job

1. **Read before writing.** Before Phase 1, read in full: `SKILL.md` and all `references/` and `assets/` files of the skill; `meeting_hub/DOCUMENTATION.md`; `README.md`; `AGENTS.md`; and the Meeting Hub source files named in each phase.
2. **Follow `AGENTS.md`**: no multiline `python -c`, no `&&` / `;` / `|` chaining, prefer native tools for inspection. Note: `AGENTS.md` names the venv as `/Users/ayrton.andre/Documents/work/.venv/bin/python`, but this machine's home is `/Users/ayrtonandre`. Check which path exists before using it and tell me if `AGENTS.md` needs fixing (don't fix it yourself).
3. **Never invent a mission fact.** Every fact in the notes comes from a document (minutes, docs cache, calendar) or from my answer. An unknown becomes an open point with an ID.
4. **Never store secrets** in notes, code, the bundle or logs. Record only where they live.
5. **Never delete user data.** Before touching storage, export it (Phase 0). Deprecated code is moved to `meeting_hub/_deprecated/` (not deleted) until I approve deletion.
6. **Keep both run modes working**: `file:///…/meeting_hub.html` and `http://localhost:8080/meeting` via `orchestrator.py`. Where a feature needs the server (writing files), the `file://` mode degrades gracefully with a clear message, never a silent failure.
7. **Design system unchanged**: Arty tokens, Jost/Fira Code, Lucide stroke icons, no emojis, dark mode default.
8. **No commit / push** unless I ask. Note that `orchestrator.py` contains `git_auto_commit_and_push`: make sure nothing you add triggers it, and that `Missions/` is never pushed by it.
9. **Language:** code and code comments in English; mission notes in the mission's language (Clariane HDJ = French), as the skill requires.
10. Rebuild with `node meeting_hub/build.js` after every JS change and keep `meeting_hub/tests/` passing; add tests for every new module.

---

## Phase 0: Safety net and inventory (no behaviour change)

1. **Export current hub data.** Add (or reuse) a way to dump everything the hub holds: `store.exportUserDataJson()` already exists (`model/store.js` ~l.625). Give me exact steps to export from **both** origins (`file://` and `localhost:8080`) and save to `meeting_hub/_backup/hub_export_<origin>_<YYYY-MM-DD>.json`. These exports are the raw material for the notes in Phase 2.
2. **Secrets audit.** List every secret-like file in `AGY/` (`credentials.json`, `token.json`, `drive_token.json`, `hae_token.txt`, `garmin_tokens/`, any `.env`), whether each is git-ignored, and whether any appears in `meeting_hub.app.js` or `server_access.log`. Propose moving them to `~/.config/agy/` (or a `secrets/` folder that is git-ignored and denied to agents). **Propose only; don't move anything.**
3. **Client data in the bundle.** Confirm whether `docs_cache.json` contents are embedded into `meeting_hub.app.js` by `build.js`. Propose removing the embed (Phase 4 does it).
4. **Inventory of knowledge in code.** Produce a table of every mission fact currently hardcoded: `model/project.js` (9 projects: id, name, clientMatch, docSources, workstreams, parserHints), `model/minutes_engine.js` (any remaining domain vocabulary), `data/importer.js` (flagship meetings + Google Doc URLs), `views/projects.js`.

**STOP:** show me the export procedure, the secrets table and the inventory.

---

## Phase 1: Set up the Missions system of record

1. **Location.** Propose a root; default `/Users/ayrtonandre/Documents/work/Missions/` (one folder per mission, Obsidian-compatible). Ask me whether I use Obsidian and whether it should be a vault. It must sit **outside** `AGY/` so code and client knowledge stay apart, and outside anything `git_auto_commit_and_push` touches.
2. **Run the bootstrapping-missions skill** as written, starting with **Clariane HDJ Planning Manager** (the richest project: 48 meetings, real minutes). Follow its 9 steps exactly, including:
   - Step 1 confidentiality question ("Is this tool approved for this client's data?") **before opening any Clariane material**.
   - Join mode: intake carries the weight. Sources, in this order: the Phase 0 hub exports, `data/docs_cache.json`, the Google Docs linked from calendar events, `DEFAULT_CLARIANE_PROJECT` in `model/project.js`, calendar events matching the project.
   - Interview rounds of ~5 questions, pre-filled from the sources.
   - The Step 6 plan gate.
   - Templates from `assets/`, golden rules from `references/note-discipline.md`.
3. **Workstreams**: the 4 currently hardcoded (Flux Annonces & Processus d'Admission; Modélisation des Programmes Thérapeutiques; Synchronisation SIH & Circuit de Validation; Analytique, Alerting & Case Mix) are a **starting hypothesis**. Confirm them with me, using the client's names.
4. **Migrate existing knowledge**: every decision currently stored in the hub becomes a decision-log row (date, decision, why, plus a link to the source meeting/doc) in the right workstream note. Deduplicate (the hub already tracks "first decided on / restated on": keep the first date). Every open action becomes either an open point (with ID) or a line in the workstream's *Current state* / *Deliverables*: ask me the convention (see 4b). Every stakeholder goes to `Contacts.md`.
   - **4b. Actions convention (ask me):** Option A: actions are open points in workstream notes (one model, simplest). Option B: a dedicated `Actions.md` per mission with a table `ID | Action | Owner | Org | Due | Status | Source` (closer to the current Action Matrix and easier for the hub to parse). Recommend one; I decide.
5. **Machine-readable conventions** (needed by the hub in Phase 3; agree them with me and write them into the Agent brief's *Writing to the notes* section):
   - Every note starts with YAML front-matter: `mission`, `type` (`overview|contacts|workstream|brief|actions`), `workstream_id` (slug), `updated` (left out if it conflicts with the skill's "no status as of" rule: discuss).
   - Decision log and open points stay **standard Markdown tables with the exact headers from the templates**, so they can be parsed.
   - Open point IDs: `<MISSION>-<WS>-<NN>` (e.g. `HDJ-FLUX-07`), never reused.
   - Source links point to meeting IDs the hub understands: `[meeting](http://localhost:8080/meeting#/meeting/<eventId>)` plus the Google Doc URL when there is one.
6. **Project registry** replacing `model/project.js`: a file `Missions/missions.yaml` (or front-matter in each `Mission Overview.md`: propose one) holding what the hub needs to map calendar events to missions: `id`, `name`, `folder`, `clientMatch[]`, `titleTags[]` (the `[TAG]` bracket matching), `docSources[]`, `workstreams[{id, name}]`, and optional `parserHints` (only if Phase 4 keeps the pre-fill parser).
7. **Inbox**: create `Missions/<Mission>/_inbox/` (raw minutes waiting to be folded) and `Missions/<Mission>/_inbox/_folded/` (archived after folding). Add to the Agent brief: *"Files in `_inbox/` are raw material, not knowledge. Fold them, then move them to `_folded/`."*
8. **Loader** (skill step 5 + `references/harnesses.md`): put `AGENTS.md` (and `GEMINI.md` if needed) at `Missions/<Mission>/` and give me the text for any Antigravity Project / workspace instruction. Add `Missions/` to the AGY workspace so sessions there can read notes.
9. Do Clariane HDJ fully first. Then **list the other 8 projects** (MO, Invoicing, F360, Coproj Data, GE Enterprise/UC Wizard, Healthcare/Care Dispensing, PrideFact RSE, Counseling) with what material exists for each, and ask which ones to bootstrap now vs later (a mission with no minutes can get a minimal Overview + registry entry only).

**STOP** after the skill's own plan gate (step 6), and again at handover (step 9).

---

## Phase 2: The "fold" workflow (agent side)

Goal: new minutes reach the notes reliably, with me reviewing.

1. Write a reusable **workflow / prompt file** `Missions/_fold.md` (and register it as an Antigravity workflow / rule if the app supports it) that, given a mission:
   1. Reads the Agent brief first.
   2. Lists `_inbox/` files oldest first.
   3. For each file: identifies the meeting (front-matter from the hub, see Phase 3), then folds it under `note-discipline.md`: rewrite facts in place in the right workstream note(s), add decision-log rows **only for decisions**, open/close open points (closed → removed, outcome written where it belongs), update Contacts, update Actions per the 4b convention.
   4. Never creates a note per meeting.
   5. Moves the file to `_inbox/_folded/`.
   6. Ends with a **change summary** per note (facts rewritten, decisions added, open points opened/closed with IDs) and anything ambiguous as questions, never guesses.
2. Dry run on 2 real Clariane minutes already in the system and show me the diff.
3. Optional, **only if I approve it explicitly**, given client confidentiality: an automated fold through `orchestrator.py` (`POST /api/missions/<id>/fold`) using the Gemini integration that already exists for ATHX (`garmin_note_parser.py: call_gemini`, `GEMINI_API_KEY`). It would produce a **proposed diff** stored in `_inbox/<file>.proposal.md`, never written directly to notes. Before building it, ask me whether sending Clariane minutes to that Gemini endpoint is approved.

**STOP:** show the dry-run diff.

---

## Phase 3: Wire the hub to the notes (front-end side)

### 3.1 Backend: new endpoints in `orchestrator.py`

Follow the existing handler style (`do_GET` / `do_POST`, `_get_clean_path`, `send_cors_headers`). All paths are resolved under the Missions root only (reject `..`, absolute paths, symlinks escaping the root). Bind to `localhost` for these routes; check whether the server listens on the LAN (`get_network_endpoints` mentions mDNS/LAN for the health webhook) and make sure **mission endpoints are never reachable from the LAN or the SWAG/Docker deployment**.

| Method | Path | Does |
|---|---|---|
| GET | `/api/missions` | Registry (`missions.yaml` or front-matter scan) |
| GET | `/api/missions/<id>/notes` | List notes with front-matter |
| GET | `/api/missions/<id>/note?path=…` | Raw Markdown of one note |
| GET | `/api/missions/<id>/summary` | Parsed: workstreams, decision logs (all notes, with source links), open points, actions (4b), contacts |
| POST | `/api/missions/<id>/inbox` | Body `{eventId, title, date, attendees, googleDocUrl, source, text}` → writes `_inbox/<YYYY-MM-DD>_<slug>_<eventId>.md` with YAML front-matter + raw text. Idempotent on `eventId` + content hash. |
| GET | `/api/missions/<id>/inbox` | Pending inbox files (to show "3 minutes waiting to be folded") |

Put the Markdown table parser in a separate module `mission_notes.py` with unit tests (headers matched exactly as in the templates; tolerate extra columns; report unparseable tables instead of dropping them).

### 3.2 Hub changes

1. **Registry**: replace `DEFAULT_PROJECTS` from `model/project.js` with data from `/api/missions`. Keep `getProjectForMeeting` / `getSuggestedProjects` / bracket-tag matching but driven by the registry. In `file://` mode, fall back to a snapshot `data/missions_snapshot.js` generated by `build.js` from the registry (**registry only, no note contents, no client minutes**).
2. **Meeting drawer → Minutes tab** (`ui/meeting_panel.js`): replace *"Apply to Meeting Items & Project Base"* (`#applyExtractionBtn`, ~l.273 / l.613) with **"Send to mission inbox"** → `POST /api/missions/<id>/inbox`. Show the state: *Not sent / In inbox, waiting to be folded / Folded* (folded = file is in `_folded/`). Keep Google Doc fetch, upload and textarea as they are. If the meeting matches no mission, offer to pick one.
3. **Meeting drawer → Actions / Decisions tabs**: show items **from the notes** that cite this meeting's ID (via `/summary`), read-only, each with an "Open note" link (`obsidian://` URI if I use Obsidian, else open the file path or show raw Markdown). Keep manual quick-add actions for the meeting itself only if we agree they also go to the inbox (as a small raw note), never to IndexedDB as knowledge.
4. **Projects view** (`views/projects.js`): rebuild on `/summary`: KPI strip (meetings, open points, decisions, inbox pending), workstreams (from notes), cumulative decision register (from decision logs, with links to meetings and docs), action matrix (from 4b), contacts, connected docs. **Honest coverage stays**: "X of Y meetings have minutes folded".
5. **Actions view** (`views/actions.js`): reads actions from notes across missions. Checking an action done is **not** written by the hub in v1: it shows "Mark done in note" (copy the ID / open note). Propose a v2 (`PATCH` on a single table row by ID) and wait for my go before building it.
6. **Prep checklist** (`model/prep_score.js`): "previous minutes logged" becomes "previous meeting of this series folded into the notes"; "open actions reviewed" uses the open points / actions of the meeting's mission and workstream. Add: "inbox empty for this mission" as a prep item.
7. **Today / Next-up card**: for the next meeting, show the 3–5 open points and the last 3 decisions of its workstream, from the notes. This is the main payoff: walking in prepared from the system of record.
8. **Storage**: IndexedDB keeps only UI state and calendar cache (events, series, links accept/reject, panel state, theme). Remove `meeting_data.items` as a knowledge store after migration is verified (Phase 5).

**STOP:** demo in the browser (localhost), both a meeting with folded minutes and one without, and show `file://` behaviour.

---

## Phase 4: Deprecate what notes now do

Move to `meeting_hub/_deprecated/` (don't delete) and remove from the bundle:
- `model/project_engine.js` (decision register / workstream synthesis / action matrix): replaced by `/summary`.
- `model/project.js` hardcoded projects: replaced by the registry.
- `MinutesEngine` decision extraction and knowledge entity tagging.
- Keep **only** `MinutesEngine.extractActions` + participants **if** I confirm it's useful as a pre-fill shown before "Send to inbox"; otherwise deprecate the whole engine.
- Stop embedding `docs_cache.json` in `meeting_hub.app.js`; the server serves cached docs via `/api/docs/fetch`, and `file://` mode shows "Start the server to fetch minutes".
- `ui/cart.js` stays deferred (untouched).

Update `build.js` module order accordingly. Bundle must still build with zero errors.

**STOP:** show the bundle size before/after and the list of moved files.

---

## Phase 5: Tests, verification, docs

1. **Tests**
   - `mission_notes.py`: table parsing (the 4 templates' tables, extra columns, empty tables, malformed rows), path-traversal rejection, inbox idempotency.
   - JS: registry-based project matching (bracket tags, clientMatch), inbox payload construction, summary rendering with empty/missing notes, `file://` fallback.
   - Keep `tests/test_step2.js` passing or update it where it tests deprecated modules (explain each change).
2. **End-to-end check on real data**: take one upcoming Clariane meeting → fetch its Google Doc → send to inbox → run the fold workflow → reload the hub → its decisions and open points appear in Today's next-up card, the drawer and Projects. Show screenshots.
3. **Migration check**: every decision and open action from the Phase 0 exports is in the notes (or explicitly dropped with my OK). Produce the reconciliation table. Only then remove `meeting_data.items` usage.
4. **Skill self-check** (`SKILL.md` step 9 list) on the Clariane notes: brief holds instructions only, every fact traceable, every link resolves, every unknown is an ID'd open point, no secrets, no gendered pronoun for me.
5. **Docs**: rewrite `meeting_hub/DOCUMENTATION.md` (architecture section, file guide, the evolution table: add a row "Knowledge moved to Markdown system of record"), update `README.md`'s Meeting Hub section, and add `docs/how-to/fold-minutes.md` (my daily routine: after a meeting → send to inbox; once a day → "fold the inbox for <mission>" in Antigravity → review changes).

**STOP:** final report: what changed, what's verified (with evidence), what's not, open points for me.

---

## Out of scope (do not do)

- Macro Cart re-integration.
- Writing to Google Docs / Notion / Slack.
- Any change to ATHX / Garmin / Apple Health code, except reading `call_gemini` if Phase 2.3 is approved.
- Moving or deleting secrets without my explicit approval (Phase 0 only proposes).
- Committing, pushing, or changing `git_auto_commit_and_push` behaviour beyond excluding `Missions/`.

## Definition of done

- Clariane HDJ (plus the missions I chose in Phase 1.9) exist as notes following bootstrapping-missions, with a working loader.
- Raw minutes flow hub → `_inbox` → fold → notes, with a reviewed change summary each time.
- The hub's Today, drawer, Projects and Actions views read knowledge **from the notes**; nothing of knowledge value lives only in browser storage.
- No client minutes or secrets in `meeting_hub.app.js`; mission endpoints are localhost-only.
- Tests pass; docs updated; reconciliation table shows zero lost decisions/actions.
