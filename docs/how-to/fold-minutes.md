# How-To: The Minutes Fold Routine

**A complete guide to capturing raw meeting minutes in Meeting Hub and folding them into the Markdown mission system of record.**

---

## 1. Overview & Architecture

Meeting Hub does not store project knowledge in browser databases. Instead, plain Markdown notes in `/Users/ayrtonandre/Documents/work/Missions/<Mission>/` serve as the durable, authoritative single source of truth.

```mermaid
flowchart LR
    A["Meeting / Call\n(Granola, Google Doc)"] --> B["Meeting Hub\nDrawer → Minutes Tab"]
    B -->|POST /api/missions/:id/inbox| C["Mission _inbox/\nRaw Markdown + YAML"]
    C -->|Fold Routine\n(Antigravity / CLI)| D["Authoritative Mission Notes\n• Mission Overview.md\n• Actions.md\n• Facility Notes"]
    D -->|GET /api/missions/:id/summary| E["Meeting Hub Viewports\n• Today Next-Up Card\n• Projects View\n• Actions View"]
    C -->|Archived upon completion| F["_inbox/_folded/"]
```

---

## 2. Daily Step-by-Step Routine

### Step 1: Capture Minutes After a Meeting

1. Open **Meeting Hub** at `http://localhost:8080/meeting` (or run `meeting` from terminal).
2. Select the meeting in the **Today** timeline or **Meetings** list to open the right-hand drawer.
3. Switch to the **Minutes** tab:
   - If a Google Doc is attached to the calendar invite, click **"Fetch Google Doc"** (`pink` button).
   - If using **Granola**, an audio transcript, or manual notes, paste the text directly into the minutes textarea.
4. Verify the target mission in the **Mission** dropdown (auto-selected via meeting title bracket tags or `clientMatch` keywords).
5. Click **"Send to mission inbox"** (`#sendToInboxBtn`):
   - The status badge changes from `Not sent` to `⏳ In inbox, waiting to be folded`.
   - The raw minutes are saved to `/Users/ayrtonandre/Documents/work/Missions/<Mission>/_inbox/<YYYY-MM-DD>_<slug>_<eventId>.md` with full YAML metadata.
   - *Note: This operation is idempotent. Sending the same meeting minutes multiple times will not duplicate files.*

---

### Step 2: Run the Fold Workflow

Run the fold routine at the end of each meeting or during a daily sync.

#### Option A: Via Antigravity Prompt (Recommended)
Ask Antigravity in your pair programming session:
> *"Fold the inbox for Clariane HDJ"*

Antigravity will:
1. Read all pending files in `_inbox/*.md`.
2. Map discussion points to specific workstreams or facilities (e.g., *Les Arbelles*, *Mariéna*, *Glanum*, or *Transversal SIH HM*).
3. Append newly validated decisions to the workstream's `## Decision log` table, citing the meeting date and link.
4. Codify newly discovered unknowns into the `## Open points` table with unique IDs (e.g., `CLAR-ARB-03`).
5. Extract action items into `Actions.md` with unique IDs (e.g., `ACT-CLAR-10`), owner, due date, and source reference.
6. Move the raw minutes file from `_inbox/` into `_inbox/_folded/`.
7. Present a clear, reviewable change diff.

#### Option B: Via Backend REST API
Trigger the fold endpoint directly:
```bash
curl -X POST http://localhost:8080/api/missions/clariane-hdj/fold
```

---

### Step 3: Verify in Meeting Hub

Once folded, refresh or navigate within Meeting Hub:
- **Meeting Drawer**: The Minutes tab now shows `✓ Folded into mission notes`.
- **Drawer Actions & Decisions**: The Actions and Decisions tabs display items citing this meeting's ID from the notes, with links to the source note.
- **Today View**: For upcoming meetings, the top **"Next Up"** prep card highlights 3–5 active open points and the last 3 validated decisions for that meeting's workstream.
- **Projects View (`#/projects`)**: The Honest Coverage indicator reflects the folded meeting (e.g., *"3 of 20 meetings folded"*), and the workstream cards list the new open points.
- **Actions View (`#/actions`)**: The central action matrix includes the newly created actions.

---

### Step 4: Completing Actions (Single Source of Truth)

To maintain absolute data integrity, the Meeting Hub does **not** write action state directly into browser storage:

1. Navigate to **Open Actions** (`#/actions`) or the meeting drawer **Actions** tab.
2. Find the action item you completed.
3. Click the **`📋 Copy ID`** button next to the action (e.g., `ACT-CLAR-01`).
4. Open the mission's [`Actions.md`](file:///Users/ayrtonandre/Documents/work/Missions/Clariane%20HDJ%20Planning%20Manager/Actions.md) file in your editor (or Obsidian).
5. Move the row from `## Actions ouvertes` to `## Actions clôturées` (or update its `Statut` column to `Done`).
6. Meeting Hub will automatically reflect the change on the next query.

---

## 3. Reference: Note Structure

Every mission directory adheres to `bootstrapping-missions` standards:

| File | Purpose | Key Sections |
|---|---|---|
| `Agent brief.md` | Operational instructions for AI agents | Role, loading order, voice/tone, safety constraints |
| `Mission Overview.md` | Mission-level context, stakeholders, goals | Context, Objectives, Governance, Stakeholders |
| `Actions.md` | Centralized cross-workstream action matrix | Open Actions table, Closed Actions table |
| `_inbox/` | Holding area for unprocessed raw minutes | Markdown files with YAML front-matter |
| `_inbox/_folded/` | Permanent archive of folded minutes | Historical record of processed raw minutes |
| `<Workstream / Facility>.md` | Specific workstream or facility knowledge | Scope, Key Rules, Decision log, Open points |

---

## 4. Troubleshooting & FAQ

- **What if the orchestrator server is not running?**  
  Meeting Hub runs in standalone `file://` mode using `data/missions_snapshot.js`. You will see the registry and calendar events, but live note summaries and Google Doc fetches will prompt you to run `python3 orchestrator.py serve` (or `meeting`).
- **Can I add Granola transcripts manually?**  
  Yes. Simply paste the plain text into the Minutes textarea in the meeting drawer and click **"Send to mission inbox"**.
- **Are client minutes secure?**  
  Yes. Client minutes are never baked into `meeting_hub.app.js` or committed to git. All `/api/missions/*` endpoints enforce strict localhost guards (`_is_localhost`), rejecting external network requests with `403 Forbidden`.
