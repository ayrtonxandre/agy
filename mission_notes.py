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
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any
import yaml

MISSIONS_ROOT = Path("/Users/ayrtonandre/Documents/work/Missions").resolve()

CALENDAR_COLOR_TAGS: dict[str, str] = {
    "1": "[ARTEFACT INTERNAL]",
    "2": "[COUNSELING/HR]",
    "3": "[ARTEFACT INTERNAL]",
    "4": "[PRIDEFACT]",
    "5": "[HEALTHCARE]",
    "6": "Team Work",
    "7": "[MAIN MISSION]",
    "8": "Me-time",
    "9": "[ARTEFACT INTERNAL]",
    "10": "[COUNSELING/HR]",
    "11": "[PRIDEFACT]",
}

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


def _atomic_write_text(path: Path, content: str, encoding: str = "utf-8") -> None:
    """Writes content to a temporary file in the same directory and atomically replaces target."""
    tmp_path = path.with_name(f".{path.name}.tmp.{os.getpid()}_{datetime.now().timestamp()}")
    try:
        tmp_path.write_text(content, encoding=encoding)
        os.replace(tmp_path, path)
    except Exception:
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except Exception:
                pass
        raise


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
                    "title": desc,
                    "text": desc,
                    "description": desc,
                    "owner": r.get("owner", ""),
                    "ownerOrg": r.get("org", ""),
                    "org": r.get("org", ""),
                    "workstream": r.get("org", ""),
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
    Idempotent on eventId + content hash:
    - Same eventId + same hash -> status: 'exists'
    - Same eventId + different hash -> status: 'replaced' (replaces file in _inbox)
    - New eventId -> status: 'created'
    """
    mission_dir = resolve_safe_path(mission_id)
    inbox_dir = mission_dir / "_inbox"
    inbox_dir.mkdir(parents=True, exist_ok=True)
    folded_dir = inbox_dir / "_folded"
    folded_dir.mkdir(parents=True, exist_ok=True)

    event_id = str(payload.get("eventId", "")).strip()
    title = str(payload.get("title", "Meeting")).strip()
    date_str = str(payload.get("date", datetime.now().strftime("%Y-%m-%d"))).strip()
    text = str(payload.get("text") or payload.get("content") or payload.get("notes") or "").strip()

    if not event_id:
        raise ValueError("Missing 'eventId' in inbox payload")
    if not text:
        raise ValueError("Minutes 'text' cannot be empty")

    content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()

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
    if payload.get("granola_id"):
        frontmatter_dict["granola_id"] = payload["granola_id"]
    if payload.get("granola_url"):
        frontmatter_dict["granola_url"] = payload["granola_url"]

    yaml_header = yaml.safe_dump(frontmatter_dict, sort_keys=False, allow_unicode=True).strip()
    full_content = f"---\n{yaml_header}\n---\n\n{text}\n"

    # Check for existing matching files in _inbox or _inbox/_folded (Idempotency Seam)
    for folder, is_folded in [(inbox_dir, False), (folded_dir, True)]:
        for f in folder.glob("*.md"):
            if f.is_file() and not f.name.endswith(".proposal.md"):
                try:
                    f_content = f.read_text(encoding="utf-8")
                    fm, _ = parse_frontmatter(f_content)
                    has_match = (fm.get("eventId") == event_id) or (payload.get("granola_id") and fm.get("granola_id") == payload.get("granola_id"))
                    if has_match:
                        if fm.get("hash") == content_hash:
                            return {
                                "status": "exists",
                                "message": f"Minutes already stored in {'_folded' if is_folded else '_inbox'}",
                                "filename": f.name,
                                "path": str(f.relative_to(MISSIONS_ROOT)),
                                "is_folded": is_folded
                            }
                        else:
                            # Content changed for same eventId: replace existing file
                            if is_folded:
                                f.unlink(missing_ok=True)
                            target_file = (inbox_dir / f.name) if not is_folded else file_path
                            target_file.write_text(full_content, encoding="utf-8")
                            return {
                                "status": "replaced",
                                "message": f"Minutes updated in mission inbox (replaced existing file for event {event_id})",
                                "filename": target_file.name,
                                "path": str(target_file.relative_to(MISSIONS_ROOT)),
                                "is_folded": False
                            }
                except Exception:
                    continue

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
                    fm, body = parse_frontmatter(content)
                    body_lines = [l.strip() for l in body.splitlines() if l.strip()]
                    preview = "\n".join(body_lines[:6])
                    pending.append({
                        "filename": f.name,
                        "path": str(f.relative_to(MISSIONS_ROOT)),
                        "eventId": fm.get("eventId"),
                        "title": fm.get("title", f.stem),
                        "date": fm.get("date"),
                        "googleDocUrl": fm.get("googleDocUrl"),
                        "size": f.stat().st_size,
                        "captured_at": fm.get("created_at") or datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M"),
                        "preview": preview,
                        "is_folded": False
                    })
                except Exception:
                    continue

    if folded_dir.is_dir():
        for f in sorted(folded_dir.glob("*.md")):
            if f.is_file() and not f.name.endswith(".proposal.md"):
                try:
                    content = f.read_text(encoding="utf-8")
                    fm, body = parse_frontmatter(content)
                    body_lines = [l.strip() for l in body.splitlines() if l.strip()]
                    preview = "\n".join(body_lines[:6])
                    folded.append({
                        "filename": f.name,
                        "path": str(f.relative_to(MISSIONS_ROOT)),
                        "eventId": fm.get("eventId"),
                        "title": fm.get("title", f.stem),
                        "date": fm.get("date"),
                        "googleDocUrl": fm.get("googleDocUrl"),
                        "size": f.stat().st_size,
                        "captured_at": fm.get("created_at") or datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M"),
                        "preview": preview,
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


def apply_fold(mission_id: str, filename: str) -> dict[str, Any]:
    """
    Executes an automated fold strictly conforming to Missions/_fold.md:
    1. Reads the inbox minute file from Missions/<Mission>/_inbox/<filename>.
    2. Extracts structured action items from next steps / bold bullet items.
    3. Appends new actions to Missions/<Mission>/Actions.md with stable IDs (ACT-<MISSION>-<NN>).
    4. Extracts concrete decisions / arbitrages and appends to target workstream's ## Decision log.
    5. Updates frontmatter (status: folded, folded_at, extracted IDs) and moves file to _inbox/_folded/.
    Returns a structured change summary.
    """
    mission_dir = resolve_safe_path(mission_id)
    inbox_dir = mission_dir / "_inbox"
    folded_dir = inbox_dir / "_folded"
    folded_dir.mkdir(parents=True, exist_ok=True)

    inbox_file = inbox_dir / filename
    if not inbox_file.is_file():
        # Check if already folded
        already_folded_file = folded_dir / filename
        if already_folded_file.is_file():
            return {
                "status": "already_folded",
                "message": f"File {filename} is already folded in {folded_dir.name}",
                "filename": filename,
                "mission": mission_id
            }
        raise FileNotFoundError(f"Inbox file not found: {filename}")

    raw_content = inbox_file.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(raw_content)

    event_id = str(fm.get("eventId", "")).strip()
    title = str(fm.get("title", filename)).strip()
    date_str = str(fm.get("date", datetime.now().strftime("%Y-%m-%d"))).strip()
    raw_attendees = fm.get("attendees", [])
    attendees: list[str] = []
    if isinstance(raw_attendees, list):
        attendees = [str(a).strip() for a in raw_attendees if str(a).strip()]
    elif isinstance(raw_attendees, str) and raw_attendees.strip():
        attendees = [raw_attendees.strip()]

    # 1. Parse actions from body
    extracted_actions = []
    sections = re.findall(
        r'(#+\s*(?:Prochaines\s+[ÉE]tapes|Next\s+Steps|Actions)[^\n]*\n)(.*?)(?=\n#+\s|\Z)',
        body,
        re.IGNORECASE | re.DOTALL
    )
    if sections:
        for sec_hdr, sec_body in sections:
            bold_items = list(re.finditer(
                r'^[ \t]*[-*]\s+\*\*([^*]+)\*\*(?:\s*\(([^)]+)\))?(.*?)(?=(?:^[ \t]*[-*]\s+\*\*|\n\n|\Z))',
                sec_body,
                re.MULTILINE | re.DOTALL
            ))
            if bold_items:
                for m in bold_items:
                    extracted_actions.append({
                        "title": m.group(1).strip(),
                        "owner": m.group(2).strip() if m.group(2) else None,
                        "details": m.group(3).strip() if m.group(3) else ""
                    })
            else:
                regular_items = list(re.finditer(r'^[ \t]*[-*]\s+([^\n\r]+)', sec_body, re.MULTILINE))
                for m in regular_items:
                    txt = m.group(1).strip()
                    if txt and not txt.startswith("#"):
                        extracted_actions.append({"title": txt, "owner": None, "details": ""})
    else:
        bold_items = list(re.finditer(
            r'^[ \t]*[-*]\s+\*\*([^*]+)\*\*(?:\s*\(([^)]+)\))?(.*?)(?=(?:^[ \t]*[-*]\s+\*\*|\n\n|\Z))',
            body,
            re.MULTILINE | re.DOTALL
        ))
        for m in bold_items:
            extracted_actions.append({
                "title": m.group(1).strip(),
                "owner": m.group(2).strip() if m.group(2) else None,
                "details": m.group(3).strip() if m.group(3) else ""
            })

    # 2. Append new actions to Actions.md
    actions_file = mission_dir / "Actions.md"
    added_actions = []
    if actions_file.is_file() and extracted_actions:
        actions_text = actions_file.read_text(encoding="utf-8")

        # Detect prefix from existing IDs
        matches = re.findall(r"(ACT-[A-Z]+-)(\d+)", actions_text)
        if matches:
            prefix = matches[0][0]
            max_num = max(int(m[1]) for m in matches)
        else:
            default_prefixes = {
                "ge-enterprise": "ACT-GE-",
                "clariane-hdj": "ACT-CLAR-",
                "pridefact": "ACT-PRF-",
                "counseling": "ACT-CNS-",
                "healthcare-mandate": "ACT-HLT-",
                "leclerc-siplec": "ACT-SIP-"
            }
            prefix = default_prefixes.get(mission_id, f"ACT-{mission_id.upper()[:4]}-")
            max_num = 0

        # Meeting link
        meeting_link = f"[meeting](http://localhost:8080/meeting#/calendar/m/{event_id})" if event_id else f"Granola ({date_str})"

        new_rows = []
        for act in extracted_actions:
            act_title = act["title"].replace("|", "-").strip()
            # Skip if title already in Actions.md
            if act_title.lower() in actions_text.lower():
                continue

            max_num += 1
            act_id = f"{prefix}{str(max_num).zfill(2)}"

            # Resolve owner
            raw_owner = act.get("owner")
            owner = "Ayrton André"
            if raw_owner:
                o_lower = raw_owner.lower()
                matched_att = [a for a in attendees if o_lower in a.lower()]
                if matched_att:
                    owner = matched_att[0]
                else:
                    owner = raw_owner

            # Resolve deadline / échéance
            details_lower = (act.get("details") or "").lower()
            if "ce soir" in details_lower or "immédiat" in details_lower:
                deadline = "Immédiat"
            elif "début nov" in details_lower or "debut nov" in details_lower:
                deadline = "Début Nov 2026"
            elif "mi-nov" in details_lower:
                deadline = "Mi-Nov 2026"
            elif "fin nov" in details_lower:
                deadline = "Fin Nov 2026"
            elif "début déc" in details_lower or "debut dec" in details_lower:
                deadline = "Début Déc 2026"
            elif "fin d'année" in details_lower or "fin 2026" in details_lower:
                deadline = "Fin 2026"
            elif "2025" in details_lower:
                deadline = "2025"
            else:
                deadline = "Novembre 2026"

            # Resolve workstream / entity
            ws_name = "General"
            m_lower = (mission_id + " " + title + " " + act_title).lower()
            if mission_id == "ge-enterprise":
                ws_name = "UC Wizard" if any(w in m_lower for w in ["wizard", "dyoc", "one pager", "slide", "adk"]) else "GE Enterprise"
            elif mission_id == "clariane-hdj":
                if "arbelles" in m_lower: ws_name = "Les Arbelles"
                elif "mariéna" in m_lower or "mariena" in m_lower: ws_name = "Mariéna"
                elif "glanum" in m_lower: ws_name = "Glanum"
                else: ws_name = "Artefact / Transversal"
            elif mission_id == "pridefact":
                ws_name = "Charte du Cercle" if any(w in m_lower for w in ["charte", "autre cercle", "cercle", "lgbt"]) else "Synchro Mandat"
            elif mission_id == "counseling":
                if "roland" in m_lower: ws_name = "Counselee - Roland"
                elif "jamila" in m_lower: ws_name = "Counselor - Jamila"
                else: ws_name = "Comités d'Évaluation"
            elif mission_id == "healthcare-mandate":
                ws_name = "Care Dispensing" if any(w in m_lower for w in ["dispensing", "tracelink"]) else "Healthcare Community"
            elif mission_id == "leclerc-siplec":
                if any(w in m_lower for w in ["textile", "composition", "ia", "extraction"]):
                    ws_name = "AI Textile Product Composition"
                elif any(w in m_lower for w in ["match", "merge", "doublon", "usine", "fournisseur", "calypso"]):
                    ws_name = "Referential Quality & Match-Merge"
                elif any(w in m_lower for w in ["dbt", "architecture", "gitlab", "cloud", "pipeline", "orchestration", "tata", "collect", "expo"]):
                    ws_name = "Data Architecture & Industrialization"
                else:
                    ws_name = "General"

            row_str = f"| {act_id} | {act_title} | {owner} | {ws_name} | {deadline} | {meeting_link} | Open |"
            new_rows.append(row_str)
            added_actions.append({"id": act_id, "title": act_title, "owner": owner, "workstream": ws_name, "deadline": deadline})

        if new_rows:
            pattern = r'(## Actions ouvertes\s*\n\s*\|[^\n]+\n\s*\|[-| ]+\n(?:\|[^\n]+\n)*)'
            m_match = re.search(pattern, actions_text)
            if m_match:
                table_block = m_match.group(1)
                for r_item in new_rows:
                    table_block += r_item + "\n"
                actions_text = actions_text[:m_match.start(1)] + table_block + actions_text[m_match.end(1):]
                actions_file.write_text(actions_text, encoding="utf-8")

    # 3. Extract decisions from body
    decisions_found = []
    for line in body.splitlines():
        l_strip = line.strip().lstrip("-* ").strip()
        lower = l_strip.lower()
        if any(k in lower for k in ["position de l’équipe", "position de l'équipe", "choix adk", "pivot clé", "validé par", "arbitrage", "consensus :"]):
            decisions_found.append(l_strip)

    # 4. Append decisions to workstream note
    added_decisions = []
    target_note_path = None
    if decisions_found:
        if mission_id == "ge-enterprise":
            target_note_path = mission_dir / "UC Wizard Development.md" if any(w in (title + body).lower() for w in ["wizard", "dyoc", "one pager"]) else mission_dir / "GE Enterprise Stream.md"
        elif mission_id == "clariane-hdj":
            target_note_path = mission_dir / "Transversal SIH HM & Moteur Foundry.md"
        elif mission_id == "pridefact":
            target_note_path = mission_dir / "Charte du Cercle.md" if "charte" in (title + body).lower() else mission_dir / "Synchro Mandat RSE.md"
        elif mission_id == "counseling":
            target_note_path = mission_dir / "Counselee - Roland Juilhard.md" if "roland" in (title + body).lower() else mission_dir / "Mission Overview.md"
        elif mission_id == "healthcare-mandate":
            target_note_path = mission_dir / "Care Dispensing.md" if "dispensing" in (title + body).lower() else mission_dir / "Mission Overview.md"
        elif mission_id == "leclerc-siplec":
            if any(w in (title + body).lower() for w in ["textile", "composition"]):
                target_note_path = mission_dir / "AI Textile Product Composition.md"
            elif any(w in (title + body).lower() for w in ["match", "merge", "doublon", "usine"]):
                target_note_path = mission_dir / "Referential Quality & Match-Merge.md"
            elif any(w in (title + body).lower() for w in ["architecture", "dbt", "pipeline", "tata", "industrialisation"]):
                target_note_path = mission_dir / "Data Architecture & Industrialization.md"
            else:
                target_note_path = mission_dir / "Mission Overview.md"
        else:
            target_note_path = mission_dir / "Mission Overview.md"

        if target_note_path and target_note_path.is_file():
            note_text = target_note_path.read_text(encoding="utf-8")
            meeting_link = f"[meeting](http://localhost:8080/meeting#/calendar/m/{event_id})" if event_id else f"Granola ({date_str})"

            dec_pattern = r'(## Decision log\s*\n\s*\|[^\n]+\n\s*\|[-| ]+\n(?:\|[^\n]+\n)*)'
            m_dec = re.search(dec_pattern, note_text)
            if m_dec:
                table_block = m_dec.group(1)
                for d_text in decisions_found:
                    if d_text[:30].lower() not in table_block.lower():
                        clean_d = d_text.replace("|", "-")
                        table_block += f"| {date_str} | {clean_d} | {meeting_link} |\n"
                        added_decisions.append(clean_d)
                note_text = note_text[:m_dec.start(1)] + table_block + note_text[m_dec.end(1):]
                target_note_path.write_text(note_text, encoding="utf-8")

    # 5. Move inbox file to _folded/
    fm["status"] = "folded"
    fm["folded_at"] = datetime.now().isoformat()
    if added_actions:
        fm["extracted_actions"] = [a["id"] for a in added_actions]
    if added_decisions:
        fm["extracted_decisions"] = added_decisions

    updated_frontmatter = yaml.dump(fm, sort_keys=False, allow_unicode=True).strip()
    updated_file_content = f"---\n{updated_frontmatter}\n---\n\n{body}"

    target_folded_file = folded_dir / filename
    target_folded_file.write_text(updated_file_content, encoding="utf-8")
    if inbox_file.exists():
        inbox_file.unlink()

    return {
        "status": "folded",
        "mission": mission_id,
        "filename": filename,
        "folded_path": str(target_folded_file.relative_to(MISSIONS_ROOT)),
        "actions_added": added_actions,
        "decisions_added": added_decisions,
        "target_note": str(target_note_path.relative_to(MISSIONS_ROOT)) if target_note_path else None
    }


def fold_all_pending(mission_id: str | None = None) -> dict[str, Any]:
    """Folds all pending files across one or all missions."""
    registry = get_missions_registry()
    missions = [m for m in registry.get("missions", []) if not mission_id or m.get("id") == mission_id]

    results = []
    for m in missions:
        m_id = m.get("id")
        inbox_data = list_inbox_files(m_id)
        for p in inbox_data.get("pending", []):
            fname = p.get("filename")
            if fname:
                try:
                    res = apply_fold(m_id, fname)
                    results.append(res)
                except Exception as e:
                    results.append({"status": "error", "mission": m_id, "filename": fname, "error": str(e)})

    return {
        "status": "success",
        "folded_count": len([r for r in results if r.get("status") == "folded"]),
        "results": results
    }


# ==============================================================================
# Phase 5: Frictionless Capture & Inbox Systems
# ==============================================================================

UNASSIGNED_INBOX_DIR = MISSIONS_ROOT / "_inbox"


def write_unassigned_inbox_file(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Writes an ambiguous or unassigned raw capture to Missions/_inbox/ ('Needs a home').
    Idempotent on content hash.
    """
    UNASSIGNED_INBOX_DIR.mkdir(parents=True, exist_ok=True)
    title = str(payload.get("title", "Unassigned Capture")).strip()
    date_str = str(payload.get("date", datetime.now().strftime("%Y-%m-%d"))).strip()
    text = str(payload.get("text") or payload.get("content") or payload.get("notes") or "").strip()

    if not text:
        raise ValueError("Minutes 'text' cannot be empty")

    content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()

    # Check for existing duplicate in unassigned inbox
    for f in UNASSIGNED_INBOX_DIR.glob("*.md"):
        if f.is_file():
            try:
                f_content = f.read_text(encoding="utf-8")
                fm, _ = parse_frontmatter(f_content)
                if fm.get("hash") == content_hash:
                    return {
                        "status": "exists",
                        "message": "Capture already exists in unassigned inbox",
                        "filename": f.name,
                        "path": str(f.relative_to(MISSIONS_ROOT))
                    }
            except Exception:
                continue

    slug = re.sub(r"[^\w]+", "-", title.lower()).strip("-")[:40] or "capture"
    ts = datetime.now().strftime("%H%M%S")
    filename = f"{date_str}_{slug}_{ts}.md"
    file_path = UNASSIGNED_INBOX_DIR / filename

    frontmatter_dict = {
        "title": title,
        "date": date_str,
        "source": payload.get("source", "unassigned_capture"),
        "hash": content_hash,
        "created_at": datetime.now().isoformat(),
        "suggestedMission": payload.get("suggestedMission", None),
        "suggestedEventId": payload.get("suggestedEventId", None)
    }
    if payload.get("eventId"):
        frontmatter_dict["eventId"] = payload["eventId"]
    if payload.get("attendees"):
        frontmatter_dict["attendees"] = payload["attendees"]
    if payload.get("granola_id"):
        frontmatter_dict["granola_id"] = payload["granola_id"]
    if payload.get("granola_url"):
        frontmatter_dict["granola_url"] = payload["granola_url"]

    yaml_header = yaml.safe_dump(frontmatter_dict, sort_keys=False, allow_unicode=True).strip()
    full_content = f"---\n{yaml_header}\n---\n\n{text}\n"

    file_path.write_text(full_content, encoding="utf-8")

    return {
        "status": "created",
        "message": "Saved to unassigned inbox (Needs a home)",
        "filename": filename,
        "path": str(file_path.relative_to(MISSIONS_ROOT))
    }


def list_unassigned_inbox_files() -> list[dict[str, Any]]:
    """Lists files in Missions/_inbox/ awaiting assignment to a mission."""
    UNASSIGNED_INBOX_DIR.mkdir(parents=True, exist_ok=True)
    items = []
    for f in sorted(UNASSIGNED_INBOX_DIR.glob("*.md")):
        if f.is_file() and not f.name.startswith("."):
            try:
                content = f.read_text(encoding="utf-8")
                fm, body = parse_frontmatter(content)
                lines = [l.strip() for l in body.splitlines() if l.strip()]
                preview = "\n".join(lines[:6])
                items.append({
                    "filename": f.name,
                    "title": fm.get("title", f.stem),
                    "date": fm.get("date", ""),
                    "source": fm.get("source", "unassigned"),
                    "size": f.stat().st_size,
                    "captured_at": fm.get("created_at") or datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M"),
                    "preview": preview,
                    "suggestedMission": fm.get("suggestedMission"),
                    "suggestedEventId": fm.get("suggestedEventId")
                })
            except Exception:
                continue
    return items


def assign_inbox_file(filename: str, target_mission_id: str, target_event_id: str | None = None) -> dict[str, Any]:
    """Moves an unassigned capture from Missions/_inbox/ to Missions/<target_mission_id>/_inbox/."""
    src = UNASSIGNED_INBOX_DIR / filename
    if not src.is_file():
        raise FileNotFoundError(f"Unassigned file not found: {filename}")

    mission_dir = resolve_safe_path(target_mission_id)
    target_inbox = mission_dir / "_inbox"
    target_inbox.mkdir(parents=True, exist_ok=True)

    content = src.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(content)

    if target_event_id:
        fm["eventId"] = str(target_event_id).strip()
    fm["mission"] = target_mission_id
    fm["assigned_at"] = datetime.now().isoformat()

    date_str = fm.get("date") or datetime.now().strftime("%Y-%m-%d")
    slug = re.sub(r"[^\w]+", "-", str(fm.get("title", src.stem)).lower()).strip("-")[:40]
    clean_eid = re.sub(r"[^\w]+", "-", str(target_event_id or "assigned"))[:30]
    new_name = f"{date_str}_{slug}_{clean_eid}.md"
    dest = target_inbox / new_name

    yaml_header = yaml.safe_dump(fm, sort_keys=False, allow_unicode=True).strip()
    dest.write_text(f"---\n{yaml_header}\n---\n\n{body}\n", encoding="utf-8")
    src.unlink(missing_ok=True)

    return {
        "status": "assigned",
        "message": f"File assigned to {target_mission_id}",
        "target_mission": target_mission_id,
        "filename": new_name,
        "path": str(dest.relative_to(MISSIONS_ROOT))
    }


def get_granola_folder_config() -> Path | None:
    """Reads the opt-in watched folder path from local git-ignored granola_config.json."""
    config_file = Path(__file__).resolve().parent / "granola_config.json"
    if config_file.is_file():
        try:
            cfg = json.loads(config_file.read_text(encoding="utf-8"))
            folder_str = cfg.get("granolaFolder", "").strip()
            if folder_str:
                p = Path(folder_str).expanduser().resolve()
                return p
        except Exception:
            pass
    fallback = MISSIONS_ROOT / "_granola"
    if fallback.is_dir():
        return fallback
    return None


def match_note_to_mission(title: str, content: str, filename: str) -> tuple[dict[str, Any] | None, int]:
    """Matches text against missions registry. Returns (matched_mission, score)."""
    registry = get_missions_registry()
    missions = registry.get("missions", [])
    text_to_search = f"{filename} {title} {content[:1000]}".lower()

    best_mission = None
    best_score = 0
    second_best_score = 0

    for m in missions:
        score = 0
        patterns = [str(p).lower().strip() for p in m.get("clientMatch", []) if p]
        m_id = str(m.get("id", "")).lower()
        m_name = str(m.get("name", "")).lower()

        # Check bracket tags priority (e.g. [MANDAT GE], [CARE DISPENSING])
        for pat in patterns:
            if f"[{pat}]" in text_to_search:
                score += 50
            elif pat in text_to_search:
                score += 15

        if m_id in text_to_search:
            score += 20
        if m_name in text_to_search:
            score += 25

        if score > best_score:
            second_best_score = best_score
            best_score = score
            best_mission = m
        elif score > second_best_score:
            second_best_score = score

    # If top score is tied or weak, return ambiguous
    if best_score == 0 or best_score == second_best_score:
        return None, 0

    return best_mission, best_score


def process_granola_folder(granola_dir: Path | str | None = None, events_data: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    """
    Scans the opt-in watched Granola folder for exported meeting notes.
    Matches with matchMission + closest calendar event by time (±1 day).
    - Unambiguous matches -> written to Missions/<Mission>/_inbox/
    - Ambiguous matches -> written to Missions/_inbox/ ('Needs a home')
    Processed files are moved to _granola/_processed/.
    """
    watch_path = Path(granola_dir).resolve() if granola_dir else get_granola_folder_config()
    if not watch_path or not watch_path.is_dir():
        return {"status": "skipped", "message": "No valid watched Granola folder configured", "processed": 0}

    processed_dir = watch_path / "_processed"
    processed_dir.mkdir(parents=True, exist_ok=True)

    # Load calendar events for event matching
    if events_data is None:
        initial_events_path = Path(__file__).resolve().parent / "meeting_hub" / "data" / "initial_events.json"
        if initial_events_path.is_file():
            try:
                events_data = json.loads(initial_events_path.read_text(encoding="utf-8"))
            except Exception:
                events_data = []
        else:
            events_data = []

    matched_results = []
    unassigned_results = []
    processed_count = 0

    for file_path in sorted(watch_path.iterdir()):
        if not file_path.is_file() or file_path.name.startswith("."):
            continue
        if file_path.suffix.lower() not in (".md", ".txt"):
            continue

        try:
            content = file_path.read_text(encoding="utf-8")
        except Exception:
            continue

        fm, body = parse_frontmatter(content)
        title = fm.get("title")
        if not title:
            # Check for markdown header or Granola "Meeting Title: ..."
            m_title = re.search(r"^(?:#|Meeting Title:)\s*([^\n\r]+)", body, re.IGNORECASE | re.MULTILINE)
            title = m_title.group(1).strip() if m_title else file_path.stem

        # Extract date
        date_str = fm.get("date")
        if not date_str:
            m_date = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", file_path.name)
            if not m_date:
                m_date = re.search(r"(?:Date:|\b)(\d{4}-\d{2}-\d{2})\b", body)
            date_str = m_date.group(1) if m_date else datetime.fromtimestamp(file_path.stat().st_mtime).strftime("%Y-%m-%d")

        # 1. Match mission
        matched_mission, score = match_note_to_mission(title, content, file_path.name)

        if matched_mission:
            # 2. Match closest calendar event (±1 day)
            m_id = matched_mission["id"]
            client_matches = [str(p).lower() for p in matched_mission.get("clientMatch", [])]

            candidate_events = []
            note_date_obj = None
            try:
                note_date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
            except Exception:
                pass

            for ev in events_data:
                ev_title = (ev.get("title") or ev.get("summary") or "").lower()
                ev_client = (ev.get("client") or "").lower()
                ev_tags = [str(t).lower() for t in ev.get("tags", [])]
                ev_id = ev.get("id")

                # Match event to mission
                belongs = False
                if any(cm in ev_title or cm in ev_client or cm in ev_tags for cm in client_matches):
                    belongs = True
                elif m_id in ev_title or m_id in ev_client:
                    belongs = True

                ev_date_raw = ev.get("date")
                if not ev_date_raw and ev.get("start"):
                    ev_date_raw = str(ev.get("start"))[:10]

                if belongs and note_date_obj and ev_date_raw:
                    try:
                        ev_date_obj = datetime.strptime(ev_date_raw, "%Y-%m-%d").date()
                        delta_days = abs((ev_date_obj - note_date_obj).days)
                        if delta_days <= 1:
                            candidate_events.append((delta_days, ev))
                    except Exception:
                        pass

            if len(candidate_events) > 1:
                # Disambiguate by title word overlap (e.g. "Weekly Sync")
                note_words = set(re.findall(r"\w+", title.lower()))
                title_matches = [
                    (d, ev) for (d, ev) in candidate_events
                    if len(set(re.findall(r"\w+", (ev.get("title") or ev.get("summary") or "").lower())) & note_words) >= 2
                ]
                if len(title_matches) == 1:
                    candidate_events = title_matches

            if len(candidate_events) == 1:
                # Unambiguous match! Write directly to mission inbox
                target_ev = candidate_events[0][1]
                target_title = target_ev.get("title") or target_ev.get("summary") or title
                target_date = target_ev.get("date") or str(target_ev.get("start", ""))[:10] or date_str
                res = write_inbox_file(m_id, {
                    "eventId": target_ev["id"],
                    "title": target_title,
                    "date": target_date,
                    "attendees": target_ev.get("attendees", []),
                    "googleDocUrl": target_ev.get("googleDocUrl", ""),
                    "source": "granola",
                    "text": content
                })
                matched_results.append({
                    "file": file_path.name,
                    "mission": m_id,
                    "eventId": target_ev["id"],
                    "status": res.get("status")
                })
            else:
                # Ambiguous calendar event: route to Needs a Home with suggested mission
                suggested_eid = candidate_events[0][1]["id"] if len(candidate_events) > 0 else None
                res = write_unassigned_inbox_file({
                    "title": title,
                    "date": date_str,
                    "source": "granola",
                    "suggestedMission": m_id,
                    "suggestedEventId": suggested_eid,
                    "text": content
                })
                unassigned_results.append({
                    "file": file_path.name,
                    "reason": "ambiguous_event",
                    "suggestedMission": m_id,
                    "status": res.get("status")
                })
        else:
            # Ambiguous mission: route to Needs a Home
            res = write_unassigned_inbox_file({
                "title": title,
                "date": date_str,
                "source": "granola",
                "text": content
            })
            unassigned_results.append({
                "file": file_path.name,
                "reason": "ambiguous_mission",
                "status": res.get("status")
            })

        # Move to _processed folder
        dest = processed_dir / file_path.name
        if dest.exists():
            dest = processed_dir / f"{datetime.now().strftime('%H%M%S')}_{file_path.name}"
        file_path.rename(dest)
        processed_count += 1

    return {
        "status": "success",
        "processed": processed_count,
        "matched": matched_results,
        "unassigned": unassigned_results
    }


def get_granola_api_key() -> str | None:
    """Retrieves Granola API key from environment, .env file, or config."""
    key = os.environ.get("GRANOLA_API_KEY", "").strip()
    if key:
        return key

    env_file = Path(__file__).resolve().parent / ".env"
    if env_file.is_file():
        try:
            for line in env_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line.startswith("GRANOLA_API_KEY="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
        except Exception:
            pass

    cfg_file = Path(__file__).resolve().parent / "granola_config.json"
    if cfg_file.is_file():
        try:
            cfg = json.loads(cfg_file.read_text(encoding="utf-8"))
            val = cfg.get("granolaApiKey", "").strip()
            if val:
                return val
        except Exception:
            pass

    return None


def fetch_granola_notes(api_key: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
    """
    Fetches recent notes list from Granola Public REST API (GET /v1/notes).
    Returns list of note metadata summaries.
    """
    key = api_key or get_granola_api_key()
    if not key:
        raise ValueError("Granola API key not configured")

    url = "https://public-api.granola.ai/v1/notes"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {key}",
            "User-Agent": "Antigravity-MeetingHub/1.0",
            "Accept": "application/json"
        }
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return data.get("notes") or data.get("data") or []
    return []


def fetch_granola_note_detail(note_id: str, api_key: str | None = None) -> dict[str, Any]:
    """
    Fetches full note details from Granola Public REST API (GET /v1/notes/{id}).
    Returns dict containing calendar_event, attendees, summary_markdown, web_url, etc.
    """
    key = api_key or get_granola_api_key()
    if not key:
        raise ValueError("Granola API key not configured")

    url = f"https://public-api.granola.ai/v1/notes/{note_id}"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {key}",
            "User-Agent": "Antigravity-MeetingHub/1.0",
            "Accept": "application/json"
        }
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    return data if isinstance(data, dict) else {}


def sync_granola_api(api_key: str | None = None, auto_fold: bool = True, events_data: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    """
    Synchronizes meeting notes from Granola Public REST API directly into Mission Inboxes.
    - Deterministically links calendar events via calendar_event.calendar_event_id.
    - Matches mission via missions.yaml clientMatch, calendar event, and contact attendees.
    - Writes raw minutes into Missions/<Mission>/_inbox/<date>_<slug>_<clean_eid>.md with YAML frontmatter.
    - If auto_fold is True, automatically executes apply_fold(mission_id, filename) to extract
      actions into Actions.md, decisions into workstream ## Decision log, and archive to _inbox/_folded/.
    - Ambiguous or unassigned captures land cleanly in Missions/_inbox/ ('Needs a home').
    - Fully idempotent: already folded or stored notes are skipped without duplication.
    """
    key = api_key or get_granola_api_key()
    if not key:
        return {"status": "skipped", "message": "Granola API key not configured", "synced": 0}

    # Load calendar events for event matching
    if events_data is None:
        initial_events_path = Path(__file__).resolve().parent / "meeting_hub" / "data" / "initial_events.json"
        if initial_events_path.is_file():
            try:
                events_data = json.loads(initial_events_path.read_text(encoding="utf-8"))
            except Exception:
                events_data = []
        else:
            events_data = []

    events_by_id = {str(ev.get("id")): ev for ev in (events_data or []) if ev.get("id")}

    try:
        notes_list = fetch_granola_notes(key)
    except Exception as e:
        return {"status": "error", "message": f"Failed to fetch Granola notes: {e}"}

    registry = get_missions_registry()
    missions = registry.get("missions", [])

    # Index existing inbox and folded files across all missions to ensure idempotency
    existing_items: dict[str, dict[str, Any]] = {}
    for m in missions:
        m_id = m.get("id")
        if not m_id:
            continue
        try:
            m_inbox = list_inbox_files(m_id)
            for item in m_inbox.get("folded", []):
                eid = item.get("eventId")
                if eid:
                    existing_items[str(eid)] = {"mission": m_id, "status": "folded", "filename": item.get("filename")}
            for item in m_inbox.get("pending", []):
                eid = item.get("eventId")
                if eid:
                    existing_items[str(eid)] = {"mission": m_id, "status": "pending", "filename": item.get("filename")}
        except Exception:
            pass

    # Also check unassigned inbox
    try:
        unassigned_files = list_unassigned_inbox_files()
        for uf in unassigned_files:
            eid = uf.get("eventId") or uf.get("suggestedEventId")
            if eid:
                existing_items[str(eid)] = {"mission": None, "status": "unassigned", "filename": uf.get("filename")}
    except Exception:
        pass

    results_synced = []
    results_folded = []
    results_unassigned = []
    results_skipped = []

    for note_summary in notes_list:
        nid = note_summary.get("id")
        if not nid:
            continue

        try:
            detail = fetch_granola_note_detail(nid, key)
        except Exception:
            continue

        cal = detail.get("calendar_event") or {}
        cal_event_id = cal.get("calendar_event_id")
        note_title = (detail.get("title") or cal.get("event_title") or "Granola Meeting").strip()
        summary_md = (detail.get("summary_markdown") or detail.get("summary_text") or "").strip()
        web_url = detail.get("web_url") or ""
        attendees_raw = detail.get("attendees") or []
        attendee_names = []
        for a in attendees_raw:
            if isinstance(a, dict):
                name = a.get("name") or a.get("email")
                if name:
                    attendee_names.append(name)
            elif isinstance(a, str):
                attendee_names.append(a)

        start_time_raw = cal.get("scheduled_start_time") or detail.get("created_at") or ""
        date_str = start_time_raw[:10] if len(start_time_raw) >= 10 else datetime.now().strftime("%Y-%m-%d")

        effective_event_id = cal_event_id or f"granola_{nid}"

        # Check if already processed
        if effective_event_id in existing_items:
            existing_info = existing_items[effective_event_id]
            if existing_info.get("status") == "folded":
                results_skipped.append({
                    "note_id": nid,
                    "title": note_title,
                    "eventId": effective_event_id,
                    "reason": "already_folded"
                })
                continue
            elif existing_info.get("status") == "pending" and auto_fold:
                m_target = existing_info.get("mission")
                fname = existing_info.get("filename")
                if m_target and fname:
                    fold_res = apply_fold(m_target, fname)
                    results_folded.append({
                        "note_id": nid,
                        "title": note_title,
                        "mission": m_target,
                        "filename": fname,
                        "fold_result": fold_res
                    })
                    existing_items[effective_event_id]["status"] = "folded"
                    continue

        # Match mission
        target_mission = None

        # 1. Check if calendar event exists and has matched mission
        matched_ev = events_by_id.get(cal_event_id) if cal_event_id else None
        if matched_ev:
            ev_title = (matched_ev.get("title") or matched_ev.get("summary") or "").lower()
            ev_client = (matched_ev.get("client") or "").lower()
            ev_tags = [str(t).lower() for t in matched_ev.get("tags", [])]
            ev_color_id = str(matched_ev.get("colorId") or matched_ev.get("color_id") or "")
            ev_color_tag = str(matched_ev.get("colorTag") or CALENDAR_COLOR_TAGS.get(ev_color_id, "")).lower()

            for m in missions:
                patterns = [str(p).lower().strip() for p in m.get("clientMatch", []) if p]
                m_id = str(m.get("id", "")).lower()
                clean_color = ev_color_tag.replace("[", "").replace("]", "").strip()
                if (
                    any(p in ev_title or p in ev_client or p in ev_tags for p in patterns)
                    or (ev_color_tag and any(p == ev_color_tag or p == clean_color for p in patterns))
                ):
                    target_mission = m
                    break
                elif m_id in ev_title or m_id in ev_client:
                    target_mission = m
                    break

        # 2. Match note title and content if not yet matched
        if not target_mission:
            matched_m, score = match_note_to_mission(note_title, summary_md, f"{note_title}.md")
            if matched_m and score >= 15:
                target_mission = matched_m

        # Build payload
        inbox_payload = {
            "eventId": effective_event_id,
            "title": note_title,
            "date": date_str,
            "attendees": attendee_names,
            "googleDocUrl": web_url,
            "granola_id": nid,
            "granola_url": web_url,
            "source": "granola_api",
            "text": summary_md if summary_md else f"# {note_title}\n\n(No transcript or summary available)"
        }

        if target_mission:
            m_id = target_mission["id"]
            write_res = write_inbox_file(m_id, inbox_payload)
            filename = write_res.get("filename")

            if write_res.get("status") in ("created", "exists"):
                if auto_fold and filename:
                    fold_res = apply_fold(m_id, filename)
                    results_folded.append({
                        "note_id": nid,
                        "title": note_title,
                        "mission": m_id,
                        "filename": filename,
                        "fold_result": fold_res
                    })
                    existing_items[effective_event_id] = {"mission": m_id, "status": "folded", "filename": filename}
                else:
                    results_synced.append({
                        "note_id": nid,
                        "title": note_title,
                        "mission": m_id,
                        "filename": filename,
                        "status": write_res.get("status")
                    })
                    existing_items[effective_event_id] = {"mission": m_id, "status": "pending", "filename": filename}
        else:
            # Unassigned / Needs a home (e.g. Échange mission Leclerc)
            write_res = write_unassigned_inbox_file(inbox_payload)
            results_unassigned.append({
                "note_id": nid,
                "title": note_title,
                "filename": write_res.get("filename"),
                "status": write_res.get("status")
            })

    return {
        "status": "success",
        "fetched": len(notes_list),
        "folded": results_folded,
        "synced": results_synced,
        "unassigned": results_unassigned,
        "skipped": results_skipped
    }


def auto_pull_google_docs(events_list: list[dict[str, Any]] | None = None, fetch_doc_fn: Any = None) -> dict[str, Any]:
    """
    Auto-pull Google Docs for meetings ending >2h ago in the last 14d with no minutes.
    Opt-in per mission via autoPullDocs: true in missions.yaml.
    """
    registry = get_missions_registry()
    missions = registry.get("missions", [])
    opted_in = [m for m in missions if m.get("autoPullDocs") is True]

    if not opted_in:
        return {"status": "ok", "message": "No missions opted in for autoPullDocs (default off)", "captured": []}

    if events_list is None:
        initial_events_path = Path(__file__).resolve().parent / "meeting_hub" / "data" / "initial_events.json"
        if initial_events_path.is_file():
            try:
                events_list = json.loads(initial_events_path.read_text(encoding="utf-8"))
            except Exception:
                events_list = []
        else:
            events_list = []

    now = datetime.now()
    now_ts = now.timestamp()
    two_hours_sec = 2 * 3600
    fourteen_days_sec = 14 * 24 * 3600

    captured = []

    for mission in opted_in:
        m_id = mission["id"]
        inbox_data = list_inbox_files(m_id)
        existing_event_ids = {f.get("eventId") for f in inbox_data.get("pending", []) + inbox_data.get("folded", []) if f.get("eventId")}
        client_matches = [str(p).lower() for p in mission.get("clientMatch", [])]

        for ev in events_list:
            doc_url = (ev.get("googleDocUrl") or "").strip()
            ev_id = ev.get("id")
            if not doc_url or not ev_id or ev_id in existing_event_ids:
                continue

            ev_title = (ev.get("title") or "").lower()
            ev_client = (ev.get("client") or "").lower()
            ev_tags = [str(t).lower() for t in ev.get("tags", [])]
            if not any(cm in ev_title or cm in ev_client or cm in ev_tags for cm in client_matches):
                continue

            # Time check: ended > 2h ago and within last 14 days
            date_str = ev.get("date", "")
            end_time = ev.get("end", "18:00")
            try:
                dt_end = datetime.strptime(f"{date_str} {end_time}", "%Y-%m-%d %H:%M")
                diff_sec = now_ts - dt_end.timestamp()
                if diff_sec < two_hours_sec or diff_sec > fourteen_days_sec:
                    continue
            except Exception:
                continue

            # Fetch doc
            if fetch_doc_fn:
                doc_res = fetch_doc_fn(doc_url)
                if doc_res.get("status") == "success" and doc_res.get("text"):
                    res = write_inbox_file(m_id, {
                        "eventId": ev_id,
                        "title": ev.get("title", "Meeting"),
                        "date": date_str,
                        "attendees": ev.get("attendees", []),
                        "googleDocUrl": doc_url,
                        "source": "auto_pull",
                        "text": doc_res.get("text")
                    })
                    captured.append({
                        "mission": m_id,
                        "eventId": ev_id,
                        "title": ev.get("title"),
                        "status": res.get("status")
                    })

    return {"status": "ok", "captured": captured}


def toggle_action(action_id: str, done: bool | None = None, mission_id: str | None = None) -> dict[str, Any]:
    """
    Toggles or sets the completion status of an action in Missions/<Mission>/Actions.md.
    Moves the action row between '## Actions ouvertes' and '## Actions clôturées'
    strictly conforming to Missions/_fold.md.

    Args:
        action_id: ID of the action (e.g., 'ACT-GE-05', 'ACT-CLAR-01')
        done: Target state (True for Done, False for Open). If None, toggles current state.
        mission_id: Optional mission ID. If not provided, searches all registered missions.

    Returns:
        dict with action metadata and new status.
    """
    clean_id = action_id.strip()
    if not clean_id:
        raise ValueError("Missing action_id")

    candidate_files = []
    if mission_id:
        try:
            m_dir = resolve_safe_path(mission_id)
            candidate_files.append((mission_id, m_dir / "Actions.md"))
        except Exception:
            pass

    registry = get_missions_registry()
    for m in registry.get("missions", []):
        m_id = m.get("id") or m.get("directory")
        if not m_id:
            continue
        try:
            act_path = resolve_safe_path(m_id) / "Actions.md"
            if (m_id, act_path) not in candidate_files:
                candidate_files.append((m_id, act_path))
        except Exception:
            continue

    target_file = None
    target_mission_id = None
    target_content = ""

    id_pattern = rf"^\s*\|\s*{re.escape(clean_id)}\s*\|"

    for m_id, act_file in candidate_files:
        if act_file.is_file():
            text = act_file.read_text(encoding="utf-8")
            for line in text.splitlines():
                if re.search(id_pattern, line, re.IGNORECASE):
                    target_file = act_file
                    target_mission_id = m_id
                    target_content = text
                    break
            if target_file:
                break

    if not target_file:
        raise ValueError(f"Action '{clean_id}' not found in any Actions.md file")

    lines = target_content.splitlines()

    ouvertes_header_idx = -1
    cloturees_header_idx = -1
    for idx, l in enumerate(lines):
        l_norm = l.strip().lower()
        if "## actions ouvertes" in l_norm:
            ouvertes_header_idx = idx
        elif any(k in l_norm for k in ("## actions clôturées", "## actions cloturees", "## actions clÃ´turÃ©es")):
            cloturees_header_idx = idx

    target_row_idx = -1
    for idx, l in enumerate(lines):
        if re.search(id_pattern, l, re.IGNORECASE):
            target_row_idx = idx
            break

    if target_row_idx == -1:
        raise ValueError(f"Row for action '{clean_id}' not found in {target_file.name}")

    target_row = lines[target_row_idx]
    raw_cells = target_row.split("|")
    if len(raw_cells) < 8:
        raise ValueError(f"Malformed action row for '{clean_id}': {target_row}")

    cells = [c.strip() for c in raw_cells[1:-1]]
    while len(cells) < 7:
        cells.append("")

    # Determine if currently done based on section and status cell
    is_in_cloturees = (cloturees_header_idx != -1 and target_row_idx > cloturees_header_idx)
    status_lower = cells[6].lower()
    is_currently_done = is_in_cloturees or status_lower in ("done", "closed", "fait", "clôturé", "cloture")

    new_done = not is_currently_done if done is None else bool(done)

    if new_done == is_currently_done:
        return {
            "status": "success",
            "actionId": cells[0],
            "missionId": target_mission_id,
            "done": new_done,
            "title": cells[1],
            "description": cells[1],
            "owner": cells[2],
            "workstream": cells[3],
            "date": cells[4],
            "source": cells[5],
            "unchanged": True
        }

    # Remove target row
    lines.pop(target_row_idx)

    # Re-scan section headers
    ouvertes_header_idx = -1
    cloturees_header_idx = -1
    for idx, l in enumerate(lines):
        l_norm = l.strip().lower()
        if "## actions ouvertes" in l_norm:
            ouvertes_header_idx = idx
        elif any(k in l_norm for k in ("## actions clôturées", "## actions cloturees", "## actions clÃ´turÃ©es")):
            cloturees_header_idx = idx

    today_str = datetime.now().strftime("%Y-%m-%d")

    if new_done:
        cells[4] = today_str
        cells[6] = "Done"
        new_row_str = f"| {' | '.join(cells)} |"

        if cloturees_header_idx == -1:
            lines.append("")
            lines.append("---")
            lines.append("")
            lines.append("## Actions clôturées")
            lines.append("")
            lines.append("| ID | Description | Responsable | Entité / Workstream | Réalisation | Source / Réf | Statut |")
            lines.append("|---|---|---|---|---|---|---|")
            lines.append(new_row_str)
        else:
            last_pipe_idx = cloturees_header_idx
            for j in range(cloturees_header_idx + 1, len(lines)):
                lj = lines[j].strip()
                if lj.startswith("## ") or (lj == "---" and j > cloturees_header_idx + 2):
                    break
                if lj.startswith("|"):
                    last_pipe_idx = j
            lines.insert(last_pipe_idx + 1, new_row_str)
    else:
        cells[6] = "Open"
        new_row_str = f"| {' | '.join(cells)} |"

        if ouvertes_header_idx == -1:
            lines.insert(0, "|---|---|---|---|---|---|---|")
            lines.insert(0, "| ID | Description | Responsable | Entité / Workstream | Échéance | Source / Date | Statut |")
            lines.insert(0, "## Actions ouvertes")
            lines.insert(3, new_row_str)
        else:
            last_pipe_idx = ouvertes_header_idx
            for j in range(ouvertes_header_idx + 1, len(lines)):
                lj = lines[j].strip()
                if lj.startswith("## ") or (lj == "---" and j > ouvertes_header_idx + 2):
                    break
                if lj.startswith("|"):
                    last_pipe_idx = j
            lines.insert(last_pipe_idx + 1, new_row_str)

    # Ensure blank line before --- dividers
    cleaned_lines = []
    for idx, l in enumerate(lines):
        if l.strip() == "---" and cleaned_lines and cleaned_lines[-1].strip() != "":
            cleaned_lines.append("")
        cleaned_lines.append(l)

    new_content = "\n".join(cleaned_lines).rstrip() + "\n"
    _atomic_write_text(target_file, new_content)

    return {
        "status": "success",
        "actionId": cells[0],
        "missionId": target_mission_id,
        "done": new_done,
        "title": cells[1],
        "description": cells[1],
        "owner": cells[2],
        "workstream": cells[3],
        "date": cells[4],
        "source": cells[5],
        "file": target_file.name
    }


def update_action(action_id: str, updates: dict[str, Any], mission_id: str | None = None) -> dict[str, Any]:
    """
    Updates action attributes (title/name, owner, workstream/sub-stream, due date, done status)
    in Missions/<Mission>/Actions.md.
    Preserves table formatting and markdown structure conforming to Missions/_fold.md.

    Args:
        action_id: ID of the action (e.g., 'ACT-GE-09', 'ACT-PRF-05')
        updates: dict containing any of 'title'/'name'/'description'/'text',
                 'owner'/'responsable', 'workstream'/'substream'/'entite',
                 'dueDate'/'due'/'echeance', 'done'/'status'.
        mission_id: Optional mission ID. If not provided, searches all registered missions.

    Returns:
        dict with action metadata and updated fields.
    """
    clean_id = action_id.strip()
    if not clean_id:
        raise ValueError("Missing action_id")

    candidate_files = []
    if mission_id:
        try:
            m_dir = resolve_safe_path(mission_id)
            candidate_files.append((mission_id, m_dir / "Actions.md"))
        except Exception:
            pass

    registry = get_missions_registry()
    for m in registry.get("missions", []):
        m_id = m.get("id") or m.get("directory")
        if not m_id:
            continue
        try:
            act_path = resolve_safe_path(m_id) / "Actions.md"
            if (m_id, act_path) not in candidate_files:
                candidate_files.append((m_id, act_path))
        except Exception:
            continue

    target_file = None
    target_mission_id = None
    target_content = ""

    id_pattern = rf"^\s*\|\s*{re.escape(clean_id)}\s*\|"

    for m_id, act_file in candidate_files:
        if act_file.is_file():
            text = act_file.read_text(encoding="utf-8")
            for line in text.splitlines():
                if re.search(id_pattern, line, re.IGNORECASE):
                    target_file = act_file
                    target_mission_id = m_id
                    target_content = text
                    break
            if target_file:
                break

    if not target_file:
        raise ValueError(f"Action '{clean_id}' not found in any Actions.md file")

    lines = target_content.splitlines()

    ouvertes_header_idx = -1
    cloturees_header_idx = -1
    for idx, l in enumerate(lines):
        l_norm = l.strip().lower()
        if "## actions ouvertes" in l_norm:
            ouvertes_header_idx = idx
        elif any(k in l_norm for k in ("## actions clôturées", "## actions cloturees", "## actions clÃ´turÃ©es")):
            cloturees_header_idx = idx

    target_row_idx = -1
    for idx, l in enumerate(lines):
        if re.search(id_pattern, l, re.IGNORECASE):
            target_row_idx = idx
            break

    if target_row_idx == -1:
        raise ValueError(f"Row for action '{clean_id}' not found in {target_file.name}")

    target_row = lines[target_row_idx]
    raw_cells = target_row.split("|")
    if len(raw_cells) < 8:
        raise ValueError(f"Malformed action row for '{clean_id}': {target_row}")

    cells = [c.strip() for c in raw_cells[1:-1]]
    while len(cells) < 7:
        cells.append("")

    def _clean_cell(v: Any) -> str:
        if v is None:
            return ""
        s = str(v).replace("\r", " ").replace("\n", " ").strip()
        return s.replace("|", "-")

    # 1. Description / Title / Name (cell 1)
    new_desc = None
    for k in ("title", "description", "name", "text"):
        if k in updates and updates[k] is not None:
            new_desc = updates[k]
            break
    if new_desc is not None and str(new_desc).strip():
        cells[1] = _clean_cell(new_desc)

    # 2. Owner / Responsable (cell 2)
    new_owner = None
    for k in ("owner", "responsable", "assignee"):
        if k in updates and updates[k] is not None:
            new_owner = updates[k]
            break
    if new_owner is not None:
        cells[2] = _clean_cell(new_owner)

    # 3. Workstream / Sub-stream / Entité (cell 3)
    new_ws = None
    for k in ("workstream", "substream", "sub_stream", "entite", "entité", "org"):
        if k in updates and updates[k] is not None:
            new_ws = updates[k]
            break
    if new_ws is not None:
        cells[3] = _clean_cell(new_ws)

    # 4. Due date / Échéance / Réalisation (cell 4)
    new_due = None
    for k in ("dueDate", "due", "echeance", "échéance", "deadline", "date"):
        if k in updates and updates[k] is not None:
            new_due = updates[k]
            break
    if new_due is not None:
        cells[4] = _clean_cell(new_due)

    # 5. Determine current and target completion state
    is_in_cloturees = (cloturees_header_idx != -1 and target_row_idx > cloturees_header_idx)
    status_lower = cells[6].lower()
    is_currently_done = is_in_cloturees or status_lower in ("done", "closed", "fait", "clôturé", "cloture")

    new_done = None
    if "done" in updates and updates["done"] is not None:
        new_done = bool(updates["done"])
    elif "status" in updates and updates["status"] is not None:
        new_done = str(updates["status"]).lower() in ("done", "closed", "fait", "clôturé", "cloture")
    elif "statut" in updates and updates["statut"] is not None:
        new_done = str(updates["statut"]).lower() in ("done", "closed", "fait", "clôturé", "cloture")

    if new_done is not None and new_done != is_currently_done:
        # Move row between sections
        lines.pop(target_row_idx)

        # Re-scan section headers
        ouvertes_header_idx = -1
        cloturees_header_idx = -1
        for idx, l in enumerate(lines):
            l_norm = l.strip().lower()
            if "## actions ouvertes" in l_norm:
                ouvertes_header_idx = idx
            elif any(k in l_norm for k in ("## actions clôturées", "## actions cloturees", "## actions clÃ´turÃ©es")):
                cloturees_header_idx = idx

        today_str = datetime.now().strftime("%Y-%m-%d")
        if new_done:
            if new_due is None:
                cells[4] = today_str
            cells[6] = "Done"
            new_row_str = f"| {' | '.join(cells)} |"

            if cloturees_header_idx == -1:
                lines.append("")
                lines.append("---")
                lines.append("")
                lines.append("## Actions clôturées")
                lines.append("")
                lines.append("| ID | Description | Responsable | Entité / Workstream | Réalisation | Source / Réf | Statut |")
                lines.append("|---|---|---|---|---|---|---|")
                lines.append(new_row_str)
            else:
                last_pipe_idx = cloturees_header_idx
                for j in range(cloturees_header_idx + 1, len(lines)):
                    lj = lines[j].strip()
                    if lj.startswith("## ") or (lj == "---" and j > cloturees_header_idx + 2):
                        break
                    if lj.startswith("|"):
                        last_pipe_idx = j
                lines.insert(last_pipe_idx + 1, new_row_str)
        else:
            cells[6] = "Open"
            new_row_str = f"| {' | '.join(cells)} |"

            if ouvertes_header_idx == -1:
                lines.insert(0, "|---|---|---|---|---|---|---|")
                lines.insert(0, "| ID | Description | Responsable | Entité / Workstream | Échéance | Source / Date | Statut |")
                lines.insert(0, "## Actions ouvertes")
                lines.insert(3, new_row_str)
            else:
                last_pipe_idx = ouvertes_header_idx
                for j in range(ouvertes_header_idx + 1, len(lines)):
                    lj = lines[j].strip()
                    if lj.startswith("## ") or (lj == "---" and j > ouvertes_header_idx + 2):
                        break
                    if lj.startswith("|"):
                        last_pipe_idx = j
                lines.insert(last_pipe_idx + 1, new_row_str)
    else:
        # Completion state unchanged: update row in place!
        lines[target_row_idx] = f"| {' | '.join(cells)} |"

    # Ensure blank line before --- dividers
    cleaned_lines = []
    for idx, l in enumerate(lines):
        if l.strip() == "---" and cleaned_lines and cleaned_lines[-1].strip() != "":
            cleaned_lines.append("")
        cleaned_lines.append(l)

    new_content = "\n".join(cleaned_lines).rstrip() + "\n"
    _atomic_write_text(target_file, new_content)

    is_final_done = is_currently_done if new_done is None else new_done
    return {
        "status": "success",
        "actionId": cells[0],
        "missionId": target_mission_id,
        "title": cells[1],
        "description": cells[1],
        "text": cells[1],
        "owner": cells[2],
        "responsable": cells[2],
        "workstream": cells[3],
        "substream": cells[3],
        "org": cells[3],
        "due": cells[4],
        "dueDate": cells[4],
        "source": cells[5],
        "statut": cells[6],
        "status": "done" if is_final_done else "open",
        "done": is_final_done,
        "file": target_file.name
    }

