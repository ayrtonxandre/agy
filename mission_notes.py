#!/usr/bin/env python3
"""
================================================================================
Mission Notes Parser & System of Record Seam (Phase 3 Backend)
================================================================================
Parses Markdown mission notes conforming to the bootstrapping-missions format.
Serves as the bridge between Meeting Hub and local Markdown system of record.
Provides safe path resolution, Markdown table parsing, summary aggregation,
idempotent inbox drops, and proposal generation.
"""

from __future__ import annotations
import os
import re
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Any
import yaml

MISSIONS_ROOT = Path("/Users/ayrtonandre/Documents/work/Missions").resolve()

def resolve_safe_path(mission_id: str, relative_path: str = "") -> Path:
    """
    Safely resolves a path strictly within the Missions root directory.
    Rejects parent traversal (..), null bytes, and symlinks escaping root.
    """
    if "\0" in mission_id or "\0" in relative_path:
        raise ValueError("Invalid path containing null bytes")

    registry = get_missions_registry()
    mission_entry = None
    for m in registry.get("missions", []):
        if m.get("id") == mission_id or m.get("directory") == mission_id:
            mission_entry = m
            break

    dir_name = mission_entry.get("directory", mission_id) if mission_entry else mission_id
    base_dir = (MISSIONS_ROOT / dir_name).resolve()

    # Verify base_dir is inside MISSIONS_ROOT
    if not str(base_dir).startswith(str(MISSIONS_ROOT)):
        raise ValueError(f"Path traversal detected: {mission_id}")

    if not relative_path:
        return base_dir

    target_path = (base_dir / relative_path).resolve()
    if not str(target_path).startswith(str(base_dir)):
        raise ValueError(f"Path traversal detected: {relative_path}")

    return target_path


def get_missions_registry() -> dict[str, Any]:
    """Reads and parses missions.yaml registry."""
    registry_file = MISSIONS_ROOT / "missions.yaml"
    if not registry_file.exists():
        return {"missions": []}

    try:
        content = registry_file.read_text(encoding="utf-8")
        data = yaml.safe_load(content) or {}
        return data
    except Exception as e:
        return {"missions": [], "error": str(e)}


def parse_frontmatter(content: str) -> tuple[dict[str, Any], str]:
    """
    Extracts YAML front-matter from a markdown string.
    Returns (frontmatter_dict, markdown_body).
    """
    if not content.startswith("---"):
        return {}, content

    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}, content

    raw_yaml = parts[1].strip()
    body = parts[2].strip()

    try:
        data = yaml.safe_load(raw_yaml) or {}
        if not isinstance(data, dict):
            data = {}
        return data, body
    except Exception:
        return {}, content


def parse_markdown_tables(markdown_text: str) -> list[dict[str, Any]]:
    """
    Finds and parses all Markdown tables in a markdown document.
    Returns a list of tables with headers, normalized keys, and rows.
    """
    tables = []
    lines = markdown_text.splitlines()
    i = 0

    while i < len(lines):
        line = lines[i].strip()
        # Look for table header row
        if line.startswith("|") and line.endswith("|") and i + 1 < len(lines):
            sep_line = lines[i + 1].strip()
            # Check separator row e.g. |---|---|
            if sep_line.startswith("|") and re.match(r"^\|(?:\s*:?-+:?\s*\|)+$", sep_line):
                # We found a table!
                raw_headers = [c.strip() for c in line.split("|")[1:-1]]
                normalized_keys = [_normalize_header_key(h) for h in raw_headers]
                rows = []
                j = i + 2
                while j < len(lines):
                    row_line = lines[j].strip()
                    if not (row_line.startswith("|") and row_line.endswith("|")):
                        break
                    cells = [c.strip() for c in row_line.split("|")[1:-1]]
                    # Pad cells if needed
                    while len(cells) < len(normalized_keys):
                        cells.append("")
                    row_dict = {}
                    for idx, key in enumerate(normalized_keys):
                        row_dict[key] = cells[idx] if idx < len(cells) else ""
                    # Keep raw row cells as well
                    row_dict["_raw"] = cells
                    rows.append(row_dict)
                    j += 1

                tables.append({
                    "headers": raw_headers,
                    "keys": normalized_keys,
                    "rows": rows,
                    "start_line": i + 1,
                    "end_line": j
                })
                i = j
                continue
        i += 1

    return tables


def _normalize_header_key(header: str) -> str:
    """Normalizes French and English Markdown table headers into canonical keys."""
    h = header.strip().lower()
    h = re.sub(r"[^\w\s/]", "", h)

    if h in ("id", "ref", "rÃ©f", "num"):
        return "id"
    if any(k in h for k in ("dÃ©cision", "decision", "décision", "statement")):
        return "decision"
    if any(k in h for k in ("action", "description", "point", "what", "deliverable", "livrable")):
        return "description"
    if any(k in h for k in ("responsable", "owner", "assignee", "lead")):
        return "owner"
    if any(k in h for k in ("entitÃ©", "entité", "clinique", "entity", "org", "organisation", "facility")):
        return "org"
    if any(k in h for k in ("Ã©chÃ©ance", "échéance", "due", "deadline", "rÃ©alisation", "réalisation")):
        return "due"
    if any(k in h for k in ("statut", "status")):
        return "status"
    if any(k in h for k in ("source", "rÃ©f", "réf", "contexte", "context", "why", "pourquoi")):
        return "source"
    if any(k in h for k in ("name", "nom", "contact")):
        return "name"
    if any(k in h for k in ("role", "rÃ´le", "rôle")):
        return "role"
    if any(k in h for k in ("date",)):
        return "date"
    if any(k in h for k in ("outcome", "issue", "rÃ©sultat", "résultat")):
        return "outcome"
    if any(k in h for k in ("notes", "owns", "ask about")):
        return "notes"

    return re.sub(r"\s+", "_", h)


def list_mission_notes(mission_id: str) -> list[dict[str, Any]]:
    """Lists all active markdown notes for a mission."""
    mission_dir = resolve_safe_path(mission_id)
    if not mission_dir.is_dir():
        return []

    notes = []
    for file_path in sorted(mission_dir.glob("*.md")):
        if file_path.name.startswith(".") or file_path.name.startswith("_"):
            continue

        try:
            content = file_path.read_text(encoding="utf-8")
            fm, body = parse_frontmatter(content)
            title = file_path.stem
            # Find first markdown header # ...
            for line in body.splitlines():
                if line.startswith("# "):
                    title = line.removeprefix("# ").strip()
                    break

            notes.append({
                "filename": file_path.name,
                "path": str(file_path.relative_to(MISSIONS_ROOT)),
                "title": title,
                "type": fm.get("type", "note"),
                "workstream_id": fm.get("workstream_id"),
                "frontmatter": fm,
                "size": file_path.stat().st_size
            })
        except Exception as e:
            notes.append({
                "filename": file_path.name,
                "error": str(e)
            })

    return notes


def get_mission_note(mission_id: str, note_path: str) -> dict[str, Any]:
    """Retrieves raw content and parsed metadata of a single note."""
    safe_file = resolve_safe_path(mission_id, note_path)
    if not safe_file.is_file():
        raise FileNotFoundError(f"Note not found: {note_path}")

    content = safe_file.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(content)
    tables = parse_markdown_tables(body)

    title = safe_file.stem
    for line in body.splitlines():
        if line.startswith("# "):
            title = line.removeprefix("# ").strip()
            break

    return {
        "filename": safe_file.name,
        "path": str(safe_file.relative_to(MISSIONS_ROOT)),
        "title": title,
        "frontmatter": fm,
        "raw": content,
        "body": body,
        "tables": tables
    }


def get_mission_summary(mission_id: str) -> dict[str, Any]:
    """
    Aggregates comprehensive mission state from Markdown notes:
    - Workstreams
    - Decision register (deduplicated across notes)
    - Open points
    - Actions (from Actions.md)
    - Contacts (from Contacts.md)
    - Inbox files (pending & folded)
    - Stats
    """
    mission_dir = resolve_safe_path(mission_id)
    registry = get_missions_registry()

    mission_meta = None
    for m in registry.get("missions", []):
        if m.get("id") == mission_id or m.get("directory") == mission_id:
            mission_meta = m
            break

    if not mission_meta:
        mission_meta = {
            "id": mission_id,
            "name": mission_id.replace("-", " ").title(),
            "directory": mission_id
        }

    # 1. Parse Actions.md
    actions_file = mission_dir / "Actions.md"
    actions_list = []
    if actions_file.is_file():
        act_content = actions_file.read_text(encoding="utf-8")
        act_tables = parse_markdown_tables(act_content)
        for t in act_tables:
            for r in t.get("rows", []):
                act_id = r.get("id") or r.get("num") or ""
                desc = r.get("description") or r.get("action") or ""
                if not act_id and not desc:
                    continue
                status_raw = r.get("status", "Open").strip()
                is_done = status_raw.lower() in ("done", "closed", "fait", "clôturé", "cloture")
                actions_list.append({
                    "id": act_id,
                    "text": desc,
                    "description": desc,
                    "owner": r.get("owner", ""),
                    "ownerOrg": r.get("org", ""),
                    "org": r.get("org", ""),
                    "due": r.get("due", ""),
                    "status": "done" if is_done else "open",
                    "done": is_done,
                    "source": r.get("source", ""),
                    "file": "Actions.md"
                })

    # 2. Parse Contacts.md
    contacts_file = mission_dir / "Contacts.md"
    contacts_list = []
    if contacts_file.is_file():
        con_content = contacts_file.read_text(encoding="utf-8")
        con_tables = parse_markdown_tables(con_content)
        for t in con_tables:
            for r in t.get("rows", []):
                name = r.get("name", "").strip()
                if not name:
                    continue
                contacts_list.append({
                    "name": name,
                    "role": r.get("role", ""),
                    "org": r.get("org", "") or r.get("entity", ""),
                    "notes": r.get("notes", "") or r.get("owns", "")
                })

    # 3. Parse Notes: Workstreams, Decisions, and Open Points
    workstreams = []
    decisions = []
    open_points = []

    for file_path in sorted(mission_dir.glob("*.md")):
        if file_path.name in ("Actions.md", "Contacts.md", "Agent brief.md", "AGENTS.md") or file_path.name.startswith("."):
            continue

        try:
            content = file_path.read_text(encoding="utf-8")
            fm, body = parse_frontmatter(content)
            title = file_path.stem
            for line in body.splitlines():
                if line.startswith("# "):
                    title = line.removeprefix("# ").strip()
                    break

            is_workstream = fm.get("type") == "workstream" or "(" in file_path.name or "Transversal" in file_path.name or "Glanum" in file_path.name or "Arbelles" in file_path.name or "Mariéna" in file_path.name

            # Extract sections: Current state, Decision log, Open points
            tables = parse_markdown_tables(body)
            note_decisions = []
            note_open_points = []

            for t in tables:
                keys = t.get("keys", [])
                if "decision" in keys:
                    for r in t.get("rows", []):
                        dec_text = r.get("decision", "").strip()
                        if dec_text:
                            note_decisions.append({
                                "date": r.get("date", ""),
                                "statement": dec_text,
                                "decision": dec_text,
                                "source": r.get("source", "") or r.get("why", ""),
                                "noteTitle": title,
                                "noteFile": file_path.name
                            })
                elif "id" in keys and ("description" in keys or "point" in keys or "what" in keys):
                    for r in t.get("rows", []):
                        op_id = r.get("id", "").strip()
                        op_what = r.get("description", "") or r.get("what", "")
                        if op_id and op_what:
                            note_open_points.append({
                                "id": op_id,
                                "what": op_what,
                                "why": r.get("why", "") or r.get("source", ""),
                                "owner": r.get("owner", ""),
                                "date": r.get("date", ""),
                                "status": r.get("status", "Open"),
                                "outcome": r.get("outcome", ""),
                                "noteTitle": title,
                                "noteFile": file_path.name
                            })

            decisions.extend(note_decisions)
            open_points.extend(note_open_points)

            if is_workstream:
                # Extract summary and key facts from body
                ws_summary = ""
                key_rules = []
                in_current_state = False

                for line in body.splitlines():
                    if line.startswith("## Current state") or line.startswith("## État des lieux"):
                        in_current_state = True
                        continue
                    elif line.startswith("## ") and in_current_state:
                        in_current_state = False

                    if in_current_state and line.strip().startswith("- "):
                        rule_text = line.strip().removeprefix("- ").strip()
                        # Clean bold prefixes
                        rule_text = re.sub(r"^\*\*[^*]+\*\*\s*:\s*", "", rule_text)
                        key_rules.append(rule_text)

                if key_rules:
                    ws_summary = key_rules[0]

                badge = "Workstream"
                if "Hypercare" in title:
                    badge = "Hypercare"
                elif "Paramétrage" in title:
                    badge = "Paramétrage"
                elif "Foundry" in title:
                    badge = "Moteur & SIH"

                workstreams.append({
                    "id": fm.get("workstream_id") or file_path.stem.lower().replace(" ", "-"),
                    "title": title,
                    "filename": file_path.name,
                    "badge": badge,
                    "summary": ws_summary or f"Périmètre et déploiement opérationnel {title}.",
                    "keyRules": key_rules[:4],
                    "decisionsCount": len(note_decisions),
                    "openPointsCount": len(note_open_points)
                })

        except Exception as e:
            continue

    # Deduplicate decisions on (date, statement)
    unique_decisions = []
    seen_decisions = set()
    for d in decisions:
        key = (d.get("date"), d.get("statement", "").strip().lower())
        if key not in seen_decisions:
            seen_decisions.add(key)
            unique_decisions.append(d)

    # 4. Scan Inbox files
    inbox_info = list_inbox_files(mission_id)

    # Calculate statistics
    open_actions_count = sum(1 for a in actions_list if not a.get("done"))
    done_actions_count = sum(1 for a in actions_list if a.get("done"))

    return {
        "missionId": mission_meta.get("id", mission_id),
        "projectId": mission_meta.get("id", mission_id),
        "name": mission_meta.get("name", mission_id),
        "projectName": mission_meta.get("name", mission_id),
        "client": mission_meta.get("client", "Client"),
        "clientMatch": mission_meta.get("clientMatch", []),
        "directory": mission_meta.get("directory", mission_id),
        "notes": list_mission_notes(mission_id),
        "workstreams": workstreams,
        "decisionRegister": unique_decisions,
        "decisions": unique_decisions,
        "decisionStats": {
            "total": len(unique_decisions)
        },
        "openPoints": open_points,
        "openPointsStats": {
            "total": len(open_points)
        },
        "actionMatrix": actions_list,
        "actions": actions_list,
        "actionStats": {
            "total": len(actions_list),
            "open": open_actions_count,
            "done": done_actions_count
        },
        "contacts": contacts_list,
        "inbox": inbox_info,
        "inboxStats": {
            "pendingCount": len(inbox_info.get("pending", [])),
            "foldedCount": len(inbox_info.get("folded", []))
        }
    }


def write_inbox_file(mission_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    """
    Writes a raw meeting minutes capture into Missions/<Mission>/_inbox/.
    Idempotent on eventId + content hash.
    """
    mission_dir = resolve_safe_path(mission_id)
    inbox_dir = mission_dir / "_inbox"
    inbox_dir.mkdir(parents=True, exist_ok=True)
    folded_dir = inbox_dir / "_folded"
    folded_dir.mkdir(parents=True, exist_ok=True)

    event_id = str(payload.get("eventId", "")).strip()
    title = str(payload.get("title", "Meeting")).strip()
    date_str = str(payload.get("date", datetime.now().strftime("%Y-%m-%d"))).strip()
    text = str(payload.get("text", "")).strip()

    if not event_id:
        raise ValueError("Missing 'eventId' in inbox payload")
    if not text:
        raise ValueError("Minutes 'text' cannot be empty")

    content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()

    # Check for existing matching files in _inbox or _inbox/_folded
    for folder, is_folded in [(inbox_dir, False), (folded_dir, True)]:
        for f in folder.glob("*.md"):
            if f.is_file() and not f.name.endswith(".proposal.md"):
                try:
                    f_content = f.read_text(encoding="utf-8")
                    fm, _ = parse_frontmatter(f_content)
                    if fm.get("eventId") == event_id:
                        if fm.get("hash") == content_hash:
                            return {
                                "status": "exists",
                                "message": f"Minutes already stored in {'_folded' if is_folded else '_inbox'}",
                                "filename": f.name,
                                "path": str(f.relative_to(MISSIONS_ROOT)),
                                "is_folded": is_folded
                            }
                except Exception:
                    continue

    # Slugify title for clean filename
    slug = re.sub(r"[^\w]+", "-", title.lower()).strip("-")
    slug = slug[:40] if len(slug) > 40 else slug
    clean_event_id = re.sub(r"[^\w]+", "-", event_id)[:30]
    filename = f"{date_str}_{slug}_{clean_event_id}.md"
    file_path = inbox_dir / filename

    frontmatter_dict = {
        "eventId": event_id,
        "title": title,
        "date": date_str,
        "attendees": payload.get("attendees", []),
        "googleDocUrl": payload.get("googleDocUrl", ""),
        "source": payload.get("source", "meeting_hub"),
        "hash": content_hash,
        "created_at": datetime.now().isoformat()
    }

    yaml_header = yaml.safe_dump(frontmatter_dict, sort_keys=False, allow_unicode=True).strip()
    full_content = f"---\n{yaml_header}\n---\n\n{text}\n"

    file_path.write_text(full_content, encoding="utf-8")

    return {
        "status": "created",
        "message": "Minutes successfully written to mission inbox",
        "filename": filename,
        "path": str(file_path.relative_to(MISSIONS_ROOT)),
        "is_folded": False
    }


def list_inbox_files(mission_id: str) -> dict[str, list[dict[str, Any]]]:
    """Lists pending and folded files in the mission's inbox."""
    mission_dir = resolve_safe_path(mission_id)
    inbox_dir = mission_dir / "_inbox"
    folded_dir = inbox_dir / "_folded"

    pending = []
    folded = []

    if inbox_dir.is_dir():
        for f in sorted(inbox_dir.glob("*.md")):
            if f.is_file() and not f.name.endswith(".proposal.md"):
                try:
                    content = f.read_text(encoding="utf-8")
                    fm, _ = parse_frontmatter(content)
                    pending.append({
                        "filename": f.name,
                        "path": str(f.relative_to(MISSIONS_ROOT)),
                        "eventId": fm.get("eventId"),
                        "title": fm.get("title", f.stem),
                        "date": fm.get("date"),
                        "googleDocUrl": fm.get("googleDocUrl"),
                        "size": f.stat().st_size,
                        "is_folded": False
                    })
                except Exception:
                    continue

    if folded_dir.is_dir():
        for f in sorted(folded_dir.glob("*.md")):
            if f.is_file() and not f.name.endswith(".proposal.md"):
                try:
                    content = f.read_text(encoding="utf-8")
                    fm, _ = parse_frontmatter(content)
                    folded.append({
                        "filename": f.name,
                        "path": str(f.relative_to(MISSIONS_ROOT)),
                        "eventId": fm.get("eventId"),
                        "title": fm.get("title", f.stem),
                        "date": fm.get("date"),
                        "googleDocUrl": fm.get("googleDocUrl"),
                        "size": f.stat().st_size,
                        "is_folded": True
                    })
                except Exception:
                    continue

    return {
        "pending": pending,
        "folded": folded,
        "total_pending": len(pending),
        "total_folded": len(folded)
    }


def generate_fold_proposal(mission_id: str, filename: str) -> dict[str, Any]:
    """
    Automated Gemini fold endpoint helper (Phase 2.3 / 3.1).
    Reads the inbox minute and proposes diffs/updates in _inbox/<filename>.proposal.md.
    Never modifies live notes directly.
    """
    mission_dir = resolve_safe_path(mission_id)
    inbox_file = mission_dir / "_inbox" / filename
    if not inbox_file.is_file():
        raise FileNotFoundError(f"Inbox file not found: {filename}")

    raw_minute = inbox_file.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(raw_minute)

    # Check for Gemini API key
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    proposal_file = mission_dir / "_inbox" / f"{filename}.proposal.md"

    if not api_key:
        fallback_proposal = f"""# Proposed Fold Diff for {filename}
Generated: {datetime.now().isoformat()}

> [!NOTE]
> GEMINI_API_KEY is not configured in the environment. 
> To generate an automated LLM fold proposal, export GEMINI_API_KEY.
> Below is the standard template adhering to `references/note-discipline.md`:

## Proposed Actions to add to `Actions.md`:
| ID | Description | Responsable | Entité / Clinique | Échéance | Source / Date | Statut |
|---|---|---|---|---|---|---|
| ACT-NEW | Action from {fm.get('title', filename)} | TBD | TBD | TBD | [meeting](http://localhost:8080/meeting#/meeting/{fm.get('eventId', '')}) | Open |

## Proposed Decisions to add to Workstream Note:
| Date | Décision | Contexte / Réf |
|---|---|---|
| {fm.get('date', datetime.now().strftime('%Y-%m-%d'))} | Decision from {fm.get('title', filename)} | [meeting](http://localhost:8080/meeting#/meeting/{fm.get('eventId', '')}) |
"""
        proposal_file.write_text(fallback_proposal, encoding="utf-8")
        return {
            "status": "proposal_generated",
            "message": "Template proposal generated (GEMINI_API_KEY not set)",
            "proposal_file": proposal_file.name,
            "path": str(proposal_file.relative_to(MISSIONS_ROOT))
        }

    # If API key exists, call Gemini
    import requests
    prompt = f"""You are the system-of-record fold assistant for mission {mission_id}.
Follow strict note-discipline rules:
- Rewrite facts in place; do not keep meeting logs.
- Extract concrete decisions into the decision log table.
- Extract new actions with IDs into the actions table.
- Output ONLY valid markdown specifying proposed diffs.

Meeting metadata:
Title: {fm.get('title')}
Date: {fm.get('date')}
Event ID: {fm.get('eventId')}
Google Doc: {fm.get('googleDocUrl')}

Raw Minutes:
{body}
"""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        res = requests.post(url, json={
            "contents": [{"parts": [{"text": prompt}]}]
        }, timeout=30)

        if res.status_code == 200:
            data = res.json()
            llm_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            proposal_file.write_text(llm_text, encoding="utf-8")
            return {
                "status": "success",
                "proposal_file": proposal_file.name,
                "path": str(proposal_file.relative_to(MISSIONS_ROOT))
            }
        else:
            raise RuntimeError(f"Gemini API returned status {res.status_code}: {res.text}")
    except Exception as e:
        proposal_file.write_text(f"# Fold Error\n\nFailed to invoke Gemini: {e}\n", encoding="utf-8")
        return {
            "status": "error",
            "error": str(e),
            "proposal_file": proposal_file.name
        }
