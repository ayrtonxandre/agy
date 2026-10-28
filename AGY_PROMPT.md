# Prompt for Antigravity (agy)

Paste everything below. Attach `meeting_hub_template.html`, `calendar_dashboard.html` (current app) and `garmin_workout.html` (sibling app, same design language).

---

## Role
You are a senior product engineer and UX designer. Build on the attached starter template. Do not restart from scratch and do not change the visual language.

## Product goal (one sentence)
**Walk into every meeting prepared, walk out with actions captured.** Any feature that does not serve this is out of scope.

## Context
- I'm a consultant at Artefact. I have 4 calendar streams: Artefact (Google), Clariane (Outlook ICS), Personal (iCloud), ATHX (training, see `garmin_workout.html`).
- `calendar_dashboard.html` is the current version: a 600 KB single file with 259 events hard-coded as JSON. It is calendar-centred (day/week/table/KPIs). I want a **meeting-centred** app instead.
- The two roadmap features:
  1. **Macro to cart**: a basket where I collect actions, decisions and topics from any meeting, then turn the basket into a recap email, a follow-up meeting, or a task batch.
  2. **Minutes intelligence**: link meetings together (same series, shared attendees, shared tags, explicit "follows up on") and surface open actions and prior decisions before a meeting.

## Design rules (Arty design system, binding)
- Jost (UI) + Fira Code (times, ids). Flat, 1px borders, no shadows except floating surfaces (cart, dropdowns, modals).
- Navy shell sidebar, pink only for the primary action and active nav item.
- Stroke icons only (Lucide/Tabler). **No emoji.** Title Case for nav, sentence case for body, short direct copy, no exclamation marks.
- Radii 6/8/10/14. Body 14px. Spacing in multiples of 4.
- Follow the ATHX dashboard's sidebar + sticky header pattern so both apps feel like one ecosystem. Keep the cross-link between them.

## What the template already gives you
- App shell (sidebar, header, Work/Life/All mode switch), **Today** view with a "Next up" prep card and timeline, a right-hand meeting panel (Agenda / Minutes / Actions / Related), and the cart tray.
- Three clearly marked seams in the JS: `store` (data + persistence), `suggestLinks()` (minutes intelligence), `cart.export()` (macro entry point).

## Build order (stop after each step and let me review)
1. **Data layer.** Replace the seed with a real store (IndexedDB, with a thin adapter so it can move to SQLite or an API later). Import my existing events from `RAW_EVENTS` in `calendar_dashboard.html` once. Notes, items and links key on the event `id`, so re-syncing never wipes them. Collapse recurring instances into a `series`.
2. **Sync.** A sync module for Google Calendar, Outlook ICS and iCloud ICS. Idempotent, shows a last-synced time per source in the sidebar. No secrets in the front end.
3. **Meeting page.** Make the right panel a full route (`#/meeting/:id`). Items have kind (action | decision | question | topic), owner, due date, done. Keyboard-first: `a` adds an action, `/` searches, `j/k` moves between meetings.
4. **Prep score.** Compute it (agenda written, last minutes found, open actions reviewed). No hard-coded numbers anywhere.
5. **Cart.** Persist it. Add recap-email (mailto or Gmail draft), follow-up meeting draft (pre-filled attendees and agenda from the cart), and task export. Keep export logic in one module.
6. **Links.** Keep `suggestLinks()` deterministic first (series, attendees, tags). Then add an optional LLM pass that proposes links from minutes text. Every suggestion is shown with a reason and an Accept / Reject action. Never auto-link silently.
7. **Secondary views.** Week, Meetings (searchable list), Open Actions (grouped by client), Series &amp; Links (graph or timeline of a series). Move the old KPIs into a weekly review view. They are not on the home screen.

## Constraints
- Split code: `data/`, `model/`, `views/`, `ui/`. No 600 KB HTML files and no hard-coded counts or ratios.
- All-day events become a thin strip above the timeline, not full-height blocks. Training is an overlay in Life mode, not a peer stream.
- Accessible: visible focus rings, 4.5:1 text contrast, no information carried by colour alone.
- Handle empty, loading and sync-error states for every view.
- Ask before adding features not listed above.

## Deliverable for each step
A short summary of what changed, what you decided, and what you need from me. Keep it under 10 lines.
