# Resume: Meeting Hub project-first cockpit

> Paste this as the first message of a new Antigravity session opened on `/Users/ayrtonandre/Documents/work/AGY`.

## 1. Read first

1. `AGY_PROMPT_PROJECT_COCKPIT.md`: **the spec**. Its 7 phases, global rules, STOP gates, out-of-scope list and definition of done still apply in full. This file only tells you where we are.
2. `AGENTS.md`: execution rules (no multiline `python -c`, no command chaining, native tools for inspection). Its venv path says `/Users/ayrton.andre/...`; the real home is `/Users/ayrtonandre`. Check which exists before using it.
3. Code you'll touch: `meeting_hub/build.js` (router `handleHashRoute`, keyboard handler, boot block and the inline Inbox view are **generated as strings in build.js**; mind the double-escaped regexes), `meeting_hub/views/projects.js` (the mission cockpit), `meeting_hub/ui/meeting_panel.js`, `meeting_hub/model/store.js`, `meeting_hub/model/lane_classifier.js`, `meeting_hub/model/mission_matcher.js`, `meeting_hub/model/prep_score.js`, `orchestrator.py` (mission routes), `mission_notes.py`, `/Users/ayrtonandre/Documents/work/Missions/missions.yaml`.

## 2. Where we are

Treat this as a claim to verify, not a fact: check it in the code and browser before building on it.

| Phase | State |
|---|---|
| 1. Routing and doorway | Done. `#/` → last mission, `#/p/<id>`, `/m/<eventId>`, `/<tab>`, legacy redirects, `parseRoute` tests |
| 2. Mission rail | Done. Today strip, missions with fold badges, Inbox / My actions / Calendar |
| 3. Project hub | Built, **STOP gate not yet passed**. Header, 3 lanes, 5 knowledge tabs. Two bugs fixed (see §3) |
| 4. Meeting drawer | **Not started**. `ui/meeting_panel.js` still has the old tabs `agenda / minutes / actions / related` and shows a prep percentage (`${prep.scorePercent}%`) |
| 5. Frictionless capture | **Not started** (no paste-anywhere, drag and drop, auto-pull or Granola). `#/inbox` exists as an inline view in `build.js`: check what it covers against spec §5.5 |
| 6. My actions and calendar | Partial. `#/my-actions` reuses the old `views/actions.js`; check against spec §6 |
| 7. Checks, tests, docs | Not started |

## 3. What was fixed in the last session (don't undo)

1. **Fold card crash.** `/api/missions/<id>/inbox` returns file **objects** (`{filename, eventId, title, date, …}`), not strings. `_renderFoldCard` called `.includes()` on them, so any mission with a pending inbox file (GE) crashed mid-render and the screen kept the previous mission. The card now reads `meeting.inboxState`.
2. **Per-meeting state.** New `store.meetingInboxState(meetingId, inboxStatus, summary)` → `'folded' | 'pending' | 'not_sent'` (handles string and object entries, and counts a meeting as folded when the notes' actions/decisions cite its ID). `getMissionHubData` and the rail now pass this per-meeting state to `classifyMeeting`; before, they passed the mission-level inbox object, so nothing could ever reach the Folded lane. Lane items carry `inboxState`.
3. **Classifier.** A meeting with minutes `pending` in the inbox stays in the fold lane even after 14 days.
4. Tests added in `meeting_hub/tests/test_lane_classifier.js` (12/12). All JS tests in `meeting_hub/tests/` pass.

Verified on `http://localhost:8080/meeting#/p/ge-enterprise`: GE shows 0 prep, 5 fold (4 "No minutes yet", 1 "In inbox"); mission switching renders the right mission; opening a meeting gives `#/p/ge-enterprise/m/<id>` and Back returns; knowledge tabs open with the stream still visible and close via **Close tab**, re-clicking the tab, or `Esc`.

**Rule from now on:** any value that comes from the API (inbox files, summary rows) may be an object. Never call string methods on it without checking the type. Add a test whenever you consume a new API field.

## 4. Environment

- Run the orchestrator **on the host**, not in a sandbox (a sandboxed server caused `ERR_CONNECTION_REFUSED` from Chrome last time): `python3 orchestrator.py serve`, or the `meeting` command. Check with `curl http://localhost:8080/api/missions`.
- Rebuild after every JS change: `node meeting_hub/build.js`. Bump the `?v=` cache-buster in `meeting_hub/index.html` if Chrome serves a stale bundle.
- Run every `meeting_hub/tests/*.js` with `node`, plus `meeting_hub/tests/test_mission_notes.py`.
- No commits or pushes. Nothing may trigger `git_auto_commit_and_push` or touch `Missions/` outside the fold workflow.

## 5. What to do now

1. **Close Phase 3 properly** (spec §3, then its STOP):
   - Remove the emojis in `views/projects.js` (⚠️ ⏳ 📁 ✔ ▲ ▼ ✕) and use Lucide icons from `ui/icons.js` instead (Arty rule: no emojis).
   - Check the "Folded" lane on a mission that really has folded minutes: Clariane HDJ has 4 files in `_inbox/_folded/`. Make sure their meetings land in Folded, and say so if the filenames don't carry an `eventId` the matcher can use.
   - Check that every count in the header comes from `/summary`, and that "to fold" sits next to the open-actions count.
   - Check the `Actions.md` "synchronisé de manière bidirectionnelle" claim against the code (spec §3.4) and report.
   - Screenshots of GE and Clariane HDJ, one with a knowledge tab open. **STOP.**
2. Then **Phase 4** (drawer modes driven by `meeting.inboxState`, breadcrumb, Related collapsed, prep checklist as dots with no percentage). **STOP.**
3. Then Phases 5 → 7 exactly as specified, with their STOP gates. Before Phase 5's Granola step, ask me how my Granola notes are exported.

Start by reporting, in under 15 lines, what you verified from §2 and anything that doesn't match. Then begin step 1.
