# Meeting Hub: pivot to a project-first cockpit

> Paste this whole file as the prompt of a new Antigravity session opened on `/Users/ayrtonandre/Documents/work/AGY`.
> Work in phases. **Stop at every `STOP` gate**, show what you did (screenshots for UI) and wait for my explicit "go". Never chain two phases without approval.

---

## 0. Context and decision (do not re-litigate)

Meeting Hub currently opens on a daily calendar (`#/today`, or auto-opens a default meeting: see the boot block at the end of `meeting_hub/build.js`, which picks `'MO - Suivi anomalies'` or the first event of the day). That doorway is wrong: I already check Google Calendar and my phone for meeting times.

The real value is the **Missions system of record** in `/Users/ayrtonandre/Documents/work/Missions/` (registry `missions.yaml`, per mission: `Mission Overview.md`, `Contacts.md`, `Actions.md`, workstream notes, `Agent brief.md`, `_inbox/` and `_inbox/_folded/`, plus `Missions/_fold.md`). The hub already reads it through `orchestrator.py` (`/api/missions`, `/api/missions/<id>/{summary,notes,note,inbox}`, parsing in `mission_notes.py`) and `model/store.js` (`getMissionsRegistry`, `getMissionSummary`, `getInboxStatus`, `getMeetingInboxStatus`, `sendMinutesToInbox`).

**Decision: "Archetype A" cockpit, with tabs only for the knowledge section.**

```
┌──────────────┬───────────────────────────────────────┬──────────────────────┐
│ MISSION RAIL │ PROJECT HUB  (#/p/<missionId>)        │ MEETING DRAWER       │
│ Today line   │ Header: name · counts · next meeting  │ Breadcrumb:          │
│ ─ Missions ─ │                                       │ Mission › WS › Mtg   │
│ Clariane [2] │ Meeting stream (default, always open):│ Mode by state:       │
│ GE           │  1. Up next: prep        (≤48h)       │  prep → notes context│
│ Healthcare   │  2. Just happened: fold  (amber)      │  capture → drop/paste│
│ …            │  3. Folded (collapsed, 1 line)        │  in inbox → status + │
│ ─ Across ─   │                                       │    "Fold now" prompt │
│ Inbox    [3] │ Knowledge tabs (below the stream):    │  folded → what the   │
│ My actions   │  Workstreams · Decisions · Actions ·  │    notes say about it│
│ Calendar     │  Contacts · Brief                     │                      │
└──────────────┴───────────────────────────────────────┴──────────────────────┘
```

Principles:
1. **Master–detail, never a page change.** Opening a meeting opens the drawer next to the project; the project stays visible. URL carries both: `#/p/<missionId>/m/<eventId>`.
2. **Meeting stream is organised by what I have to do, not by date**: prep → fold → folded.
3. **Capture is one action, zero form**: the hub guesses mission and meeting, I confirm with one click only when it's ambiguous.
4. **Notes are the only source of knowledge.** Every count and item shown comes from `/summary`. The hub never stores knowledge in IndexedDB.
5. **The calendar is demoted, not deleted.** It survives as a "Calendar" entry in the rail (existing Today/Week/Meetings views) and a one-line "Today" strip.

---

## 1. Global rules

1. **Read first**, in full: `meeting_hub/DOCUMENTATION.md`, `README.md`, `AGENTS.md`, `meeting_hub/build.js` (the router `handleHashRoute`, keyboard handler and boot block are **generated as strings inside build.js**: edit them there, mind the double-escaped regexes), `ui/shell.js`, `ui/meeting_panel.js`, `ui/styles.css`, `views/projects.js`, `views/today.js`, `views/actions.js`, `model/store.js`, `model/prep_score.js`, `orchestrator.py` (mission routes), `mission_notes.py`, `Missions/missions.yaml`, `Missions/_fold.md`, and one full mission folder (`Missions/Clariane HDJ Planning Manager/`).
2. Follow `AGENTS.md` (no multiline `python -c`, no command chaining, native tools for inspection).
3. **Arty design system unchanged**: tokens in `ui/styles.css`, Jost / Fira Code, Lucide stroke icons from `ui/icons.js`, no emojis, dark mode default, flat 1px borders.
4. **Colour discipline**: amber (warn) is used **only** for "needs folding / not captured". Accent only for "selected" and "next meeting". No per-workstream or per-mission colours.
5. **Both run modes keep working**: `http://localhost:8080/meeting` (full) and `file://…/meeting_hub.html` (read-only on the snapshot `data/missions_snapshot.js`; every write/capture control shows "Start the server with `meeting` to capture minutes", never fails silently).
6. **No knowledge in browser storage.** IndexedDB/localStorage hold only UI state (last mission, collapsed sections, drawer state, theme) and the calendar cache. Don't revive `applyExtractedItems` / `getProjectBase` paths; if they are still called anywhere, list them and propose removal.
7. **Mission endpoints stay localhost-only** and path-safe (resolved under the Missions root). Any new endpoint follows the same rules and gets tests in the style of the existing `mission_notes.py` tests.
8. **No commits / pushes.** Make sure nothing new triggers `git_auto_commit_and_push` in `orchestrator.py`, and that `Missions/` is never touched by it.
9. Rebuild with `node meeting_hub/build.js` after each JS change; keep `meeting_hub/tests/` green; add tests for every new pure function (routing parser, lane classifier, meeting matcher, prep checklist).
10. Code and comments in English; UI copy in English, sentence case, no "successfully", no "please"; mission content is displayed as-is (French for Clariane).

---

## Phase 1: Routing and the doorway

1. **New routes** (keep the old ones working as aliases):

   | Route | Shows |
   |---|---|
   | `#/` | Redirect to the last mission I opened (localStorage `mhub_last_mission`), else the first `active` mission in the registry |
   | `#/p/<missionId>` | Project hub, drawer closed |
   | `#/p/<missionId>/m/<eventId>` | Project hub + drawer on that meeting |
   | `#/p/<missionId>/<tab>` | Project hub with knowledge tab open (`workstreams`, `decisions`, `actions`, `contacts`, `brief`) |
   | `#/inbox` | Cross-mission inbox |
   | `#/my-actions` | Cross-mission actions |
   | `#/calendar`, `#/calendar/week`, `#/calendar/meetings`, `#/calendar/series` | Existing Today / Week / Meetings / Series views, unchanged inside |
   | `#/meeting/<eventId>` (legacy) | Resolve its mission (see 3.1 matcher) and redirect to `#/p/<missionId>/m/<eventId>`; if no mission matches, open it in `#/calendar` with the drawer |
   | `#/today`, `#/week`, `#/meetings`, `#/series`, `#/actions`, `#/projects` (legacy) | Redirect to their new equivalents |

2. **Remove the auto-open default meeting** in the boot block. Boot = load registry → resolve `#/` → render the mission.
3. Extract route parsing into a pure function `parseRoute(hash) → {view, missionId, eventId, tab}` with unit tests (including encoded event IDs: Google event IDs are long and start with `_`).
4. **Links inside the notes** currently point to `http://localhost:8080/meeting#/meeting/<eventId>`: thanks to the legacy redirect they keep working. Don't rewrite the notes.
5. **Keyboard**: keep `/`, `\`, `Esc`, `j/k`, `a`. Add: `g p` mission switcher (fuzzy over registry names), `g i` inbox, `g c` calendar, `1–9` jump to the Nth mission in the rail. `Esc` order: blur input → close drawer → go back from tab to stream. `j/k` move through the meeting stream cards of the current mission.

**STOP:** show the route table implemented, tests passing, and that `#/` lands on a mission in both run modes.

---

## Phase 2: Mission rail (`ui/shell.js`)

1. Replace the current nav (Today, Week, Meetings, Open Actions, Series & Links, Projects & Knowledge) with:
   - **Today strip** (top, one line): `Next: 14:00 Mariéna paramétrage · Clariane HDJ` → clicking it opens that meeting in its mission. Shows "No more meetings today" otherwise. This replaces the need to open a calendar just to know which project I'm switching to.
   - **Missions**: every `active` mission from the registry (archived hidden behind "Show archived"), in registry order, each with a **fold badge** = number of meetings in its "Just happened: fold" lane (amber, hidden when 0). Selected mission uses the accent.
   - **Across missions**: Inbox (badge = total pending inbox files + uncaptured past meetings), My actions (badge = open actions owned by me across missions, owner match from `Contacts.md` / my name "Ayrton André"), Calendar.
   - Keep the ATHX link, sync status indicator and theme toggle at the bottom.
2. Remove the Work/Life/All pills from the global header; they move inside the Calendar views only.
3. Header of the main area becomes mission-specific (see Phase 3); the global quick search (`/`) searches **within the current mission**: meetings, actions, decisions, open points, contacts. Results grouped by type, each opening the right place.

**STOP:** screenshot of the rail with real badges.

---

## Phase 3: Project hub (`views/projects.js` → rename to `views/mission.js`)

### 3.1 Mission ↔ meeting matcher (pure, tested)

`matchMission(event, registry) → {missionId, confidence, reason}` using, in priority: bracket title tags, `clientMatch` entries from `missions.yaml`, then attendee overlap with the mission's `Contacts.md`. Ambiguous (two missions within a small margin) → `confidence: 'ambiguous'`. Reuse whatever matching `store.js` already does for projects; move it here rather than duplicate it.

### 3.2 Header

`<Mission name>` · `<N> open actions` · `<N> to fold` (amber when >0, shown **next to** the counts so stale numbers are obvious) · `Next: <day> <time> <meeting>` · link "Open folder" (and `obsidian://open?path=…` if an Obsidian vault is detected; ask me first).

### 3.3 Meeting stream (default content, always visible)

Lane classifier `classifyMeeting(event, inboxStatus, now) → 'prep' | 'fold' | 'folded' | 'hidden'`, pure and tested:

| Lane | Rule | Card shows | Click |
|---|---|---|---|
| **Up next: prep** | Mission's meetings starting in the next 48h (configurable) | Title, day/time, workstream, **3 open points / actions from the notes for that workstream** (blocking/"Prioritaire" first), prep checklist dots | Drawer in prep mode |
| **Just happened: fold** | Ended in the last 14 days AND (no minutes captured OR file still in `_inbox/` not `_folded/`) | Two distinct states: *No minutes yet* (with an inline drop zone) / *In inbox, waiting to fold* | Drawer in capture or inbox mode |
| **Folded** | Inbox file is in `_folded/` | Collapsed into one line ("Les Arbelles · Mariéna · +4"), expandable | Drawer in folded mode |
| hidden | Older than 14 days and never captured, or declined/cancelled | Not shown; a footer link "12 older meetings without minutes" opens a filtered list where I can mark them "no minutes needed" (UI state only) | |

Within the fold lane, oldest first (most overdue on top). Within prep, soonest first.

Empty states (sentence case, an invitation not an apology): prep empty → "Nothing in the next 48h for this mission"; fold empty → "All minutes folded" (no amber anywhere).

### 3.4 Knowledge tabs (below the stream, collapsed to the tab bar by default; last open tab remembered per mission)

- **Workstreams**: from the workstream notes: objective, current state (first lines), open points count, link to note.
- **Decisions**: cumulative decision log across notes, newest first, each with date, workstream, and links to source meeting + doc. Filter by workstream.
- **Actions**: from `Actions.md`, filter by owner/org/status, search. Rows are **read-only**; each has "Copy ID" and "Open note". (If a row-level write endpoint already exists, keep it strictly limited to toggling status by ID, and tell me what it does.)
- **Contacts**: from `Contacts.md`.
- **Brief**: rendered `Agent brief.md` (read-only), so the iron rules are one click away, not on screen all day.

Check `Actions.md`: its intro says it is "synchronisé de manière bidirectionnelle avec la matrice d'actions de Meeting Hub". Tell me whether that's true in code. If not, propose the corrected sentence (to be folded by the agent, not edited by you without my OK).

**STOP:** screenshots of Clariane HDJ with real data, both lanes populated, one tab open.

---

## Phase 4: Meeting drawer (`ui/meeting_panel.js`)

1. **Header**: breadcrumb `Mission › Workstream › Meeting` (each segment clickable), date/time, attendees, Google Doc link if any. Close returns to `#/p/<missionId>`.
2. **Mode chosen by the lane, not by me** (replace the current 5 tabs Agenda / Minutes / Actions / Decisions / Related):
   - **Prep** (upcoming): the workstream's open points and open actions from the notes, last 3 decisions, previous meeting of the same series (with its folded status), prep checklist (see 4.3), and a small "My agenda notes" textarea kept as UI state only (it is not knowledge; on capture it's prepended to the minutes).
   - **Capture** (past, no minutes): one large drop/paste zone + "Fetch Google Doc" when the event has `googleDocUrl` + "Upload file". After capture, it shows the matched mission/meeting as a one-line confirmation ("Saved to Clariane HDJ inbox as 2026-10-29_mariena_….md").
   - **In inbox**: file name, size, captured at, a preview of the first lines, **"Fold now"** button that copies the exact Antigravity prompt to the clipboard: `Fold the inbox for <Mission name> following Missions/_fold.md, then show me the change summary.`, and "Replace minutes" (re-capture, idempotent on `eventId`).
   - **Folded**: what the notes now say that cites this meeting (decisions, actions, open points whose source link contains this `eventId`), each with "Open note".
3. Keep **Related** (series lineage + accepted links) as a collapsible section at the bottom of every mode, not a tab.
4. **Prep checklist** (`model/prep_score.js`), recomputed from notes only: previous meeting of this series folded · mission inbox has nothing older than this meeting's previous occurrence · open actions for this workstream reviewed (UI tick, UI state) · agenda notes written (optional). Show as 3–4 dots, no percentage.

**STOP:** demo the four modes on real Clariane meetings.

---

## Phase 5: Frictionless capture

Every path ends in the existing `sendMinutesToInbox(meetingId, missionId, payload)` → `POST /api/missions/<id>/inbox`. One action, no form.

1. **Paste anywhere** (`Cmd+V` outside an input) in a mission view:
   - Text → target the selected meeting if the drawer is open; otherwise the **most recent meeting in the fold lane**; show a one-line toast with the target and an "Change" link (opens a picker of the fold-lane meetings) for 8 seconds before writing. `Cmd+Z` within that window cancels.
   - A Google Docs URL → fetch through `/api/docs/fetch`, then same flow.
2. **Drag and drop** `.md` / `.txt` / `.docx`-exported text onto any meeting card or the drawer → capture for that meeting.
3. **Auto-pull Google Docs**: for meetings with a `googleDocUrl` that ended more than 2h ago and have no inbox file, the orchestrator fetches the doc and writes the inbox file. Run it on the existing background scheduler in `orchestrator.py` (find it near `background_scheduler`), at most every 30 min, only for meetings in the last 14 days. Make it **opt-in per mission** with a flag `autoPullDocs: true` in `missions.yaml`, default off. Log what it captured; show it in the Inbox view as "Captured automatically".
4. **Granola**: ask me first how my Granola notes are exported (folder export, copy-paste, or via the ACP connector in Claude). If a folder: an opt-in watched folder (`granolaFolder` in a local, git-ignored config, not in `missions.yaml`) whose new files are matched with `matchMission` + closest event by time (±1 day) and written to the right `_inbox/`. Ambiguous matches go to the Inbox view as "Needs a home", never guessed.
5. **Cross-mission Inbox view** (`#/inbox`): three groups, each row labelled with its mission:
   - *Needs a home*: captured but ambiguous: one-click assign.
   - *No minutes yet*: past meetings across missions (fold lane), with inline drop zones.
   - *Waiting to fold*: inbox files per mission, with one "Fold now" per mission (copies the prompt for that mission).
6. Idempotency: same `eventId` + same content hash → no new file; same `eventId`, different content → replace and say so.

**STOP:** demo each capture path; show the resulting `_inbox/` files.

---

## Phase 6: Cross-mission "My actions" and the demoted calendar

1. `#/my-actions`: open actions owned by me across all missions, grouped by mission (mission label on every row), sorted by due ("Prioritaire" first, then dated, then undated). Read-only rows with "Open note" / "Copy ID", plus the meeting each came from.
2. `#/calendar`: existing Today / Week / Meetings / Series views moved under a sub-nav. Clicking a meeting there routes to `#/p/<missionId>/m/<eventId>` when it matches a mission (so I land in project context), else opens the drawer in calendar context.
3. Retire `views/actions.js` and the old `#/projects` page into `meeting_hub/_deprecated/` once their replacements are verified (don't delete).

**STOP:** screenshots.

---

## Phase 7: Overload checks, tests, docs

1. **Cognitive-load checklist** (verify on screenshots, report each as pass/fail):
   - On first paint of a mission, only the header, the three lanes and the tab bar are visible; no table is expanded.
   - Amber appears only in the fold lane, the rail fold badges and the "to fold" header count.
   - Every number on screen comes from `/summary` or the calendar, and "to fold" sits next to any knowledge count.
   - Every row in cross-mission views shows its mission.
   - No view requires horizontal scrolling at 1280px; the drawer can be collapsed with `\` and the stream reflows.
2. **Tests**: `parseRoute`, `matchMission`, `classifyMeeting`, prep checklist, paste-target resolution, inbox idempotency (Python side). Keep existing tests green or explain each change.
3. **End-to-end on real data**: open `#/` → lands on last mission → a past Clariane meeting in the fold lane → paste minutes → appears as *In inbox* → run the fold with Antigravity → reload → meeting moves to *Folded*, its decisions/actions appear in the drawer and tabs, fold badge decrements. Screenshots at each step.
4. **file:// mode**: verify read-only behaviour and messages.
5. **Docs**: update `meeting_hub/DOCUMENTATION.md` (routes, layout, file guide, add a row to the evolution table: "Doorway pivot: calendar-first → project-first cockpit"), `README.md` Meeting Hub section, and `docs/how-to/fold-minutes.md` with the new daily routine:
   - Morning: open Meeting Hub → it opens on my last mission; glance at "Up next: prep" and the Today strip.
   - After a meeting: paste or drop minutes (or let auto-pull do it).
   - Once a day: Inbox → "Fold now" per mission → paste into Antigravity → review the change summary.

**STOP:** final report: what changed, what's verified with evidence, what's not, open questions for me.

---

## Out of scope

- Writing knowledge from the hub into notes (folding stays an agent job).
- Macro Cart (`ui/cart.js` stays deferred).
- Any change to ATHX / Garmin / Apple Health code.
- Editing mission notes directly, except through the fold workflow and with my OK.
- Commits, pushes, deleting files.

## Definition of done

- `#/` opens on a mission, never on a calendar or a default meeting.
- From a mission I can open any meeting and get back without losing my place; URL reflects both.
- Each mission's meetings are sorted into prep / fold / folded from real inbox state.
- Capturing minutes is one action (paste, drop, fetch, or automatic), with no form.
- All knowledge shown comes from the Markdown notes; nothing of knowledge value is in browser storage.
- Calendar views still exist, reachable in one click, and route back into mission context.
- Tests green, both run modes verified, docs updated.
