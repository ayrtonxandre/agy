#!/usr/bin/env python3
"""
================================================================================
Unit Tests for mission_notes.py
================================================================================
Tests table parsing, path traversal protection, registry retrieval,
summary synthesis, and inbox idempotency.
"""

import sys
import unittest
from pathlib import Path

# Add AGY root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import mission_notes

class TestMissionNotes(unittest.TestCase):

    def test_path_traversal_protection(self):
        """Verifies that paths escaping MISSIONS_ROOT are strictly rejected."""
        with self.assertRaises(ValueError):
            mission_notes.resolve_safe_path("clariane-hdj", "../../../etc/passwd")

        with self.assertRaises(ValueError):
            mission_notes.resolve_safe_path("../secret", "test.md")

        with self.assertRaises(ValueError):
            mission_notes.resolve_safe_path("clariane-hdj", "/absolute/path/file.md")

        with self.assertRaises(ValueError):
            mission_notes.resolve_safe_path("clariane-hdj\0null", "file.md")

        # Valid path should resolve under MISSIONS_ROOT
        valid = mission_notes.resolve_safe_path("clariane-hdj", "Actions.md")
        self.assertTrue(str(valid).startswith(str(mission_notes.MISSIONS_ROOT)))
        self.assertTrue(valid.exists())

    def test_frontmatter_parsing(self):
        """Tests YAML front-matter extraction."""
        sample = """---
mission: clariane-hdj
type: workstream
workstream_id: ws-admission
---
# Main Title
Body text here.
"""
        fm, body = mission_notes.parse_frontmatter(sample)
        self.assertEqual(fm.get("mission"), "clariane-hdj")
        self.assertEqual(fm.get("type"), "workstream")
        self.assertEqual(fm.get("workstream_id"), "ws-admission")
        self.assertIn("# Main Title", body)

        # Content without front-matter
        no_fm = "# Title Only\nText."
        fm2, body2 = mission_notes.parse_frontmatter(no_fm)
        self.assertEqual(fm2, {})
        self.assertEqual(body2, no_fm)

    def test_table_parsing_and_normalization(self):
        """Tests parsing of markdown tables with various headers, extra columns, empty tables, and whitespace."""
        markdown = """
## Decision log

| Date | Décision | Contexte / Réf | Extra Col |
|---|---|---|---|
| 2026-10-21 | Règle Zéro Temps Mort | [meeting](http://localhost:8080/meeting#/meeting/123) | Extra data |
| 2026-10-26 | Isolation des bilans | Doc ref | More |

## Open points

| ID | Point | Responsable | Date création |
|---|---|---|---|
| CLAR-ARB-01 | Vérifier avec Frédéric | Ayrton André | 2026-10-29 |

## Empty Table

| Col A | Col B |
|---|---|

## Short Row Table

| H1 | H2 | H3 |
|---|---|---|
| OnlyOne |
"""
        tables = mission_notes.parse_markdown_tables(markdown)
        self.assertEqual(len(tables), 4)

        # Verify decision log table
        t0 = tables[0]
        self.assertIn("date", t0["keys"])
        self.assertIn("decision", t0["keys"])
        self.assertEqual(len(t0["rows"]), 2)
        self.assertEqual(t0["rows"][0]["date"], "2026-10-21")
        self.assertEqual(t0["rows"][0]["decision"], "Règle Zéro Temps Mort")

        # Verify open points table
        t1 = tables[1]
        self.assertIn("id", t1["keys"])
        self.assertIn("description", t1["keys"])  # "Point" normalized to "description"
        self.assertIn("owner", t1["keys"])        # "Responsable" normalized to "owner"
        self.assertEqual(t1["rows"][0]["id"], "CLAR-ARB-01")
        self.assertEqual(t1["rows"][0]["owner"], "Ayrton André")

        # Verify empty table
        t2 = tables[2]
        self.assertEqual(len(t2["rows"]), 0)

        # Verify short row table (padded with empty strings)
        t3 = tables[3]
        self.assertEqual(len(t3["rows"]), 1)
        self.assertEqual(t3["rows"][0]["h1"], "OnlyOne")
        self.assertEqual(t3["rows"][0]["h2"], "")
        self.assertEqual(t3["rows"][0]["h3"], "")

    def test_get_missions_registry(self):
        """Verifies missions registry is loaded properly."""
        reg = mission_notes.get_missions_registry()
        self.assertIn("missions", reg)
        missions = reg["missions"]
        self.assertGreaterEqual(len(missions), 1)
        clariane = next((m for m in missions if m["id"] == "clariane-hdj"), None)
        self.assertIsNotNone(clariane)
        self.assertEqual(clariane["name"], "Clariane HDJ Planning Manager")

    def test_get_mission_summary(self):
        """Verifies full mission summary aggregation from real notes."""
        summary = mission_notes.get_mission_summary("clariane-hdj")
        self.assertEqual(summary["missionId"], "clariane-hdj")
        self.assertGreaterEqual(len(summary["notes"]), 5)
        self.assertGreaterEqual(len(summary["workstreams"]), 3)
        self.assertGreaterEqual(len(summary["decisionRegister"]), 5)
        self.assertGreaterEqual(len(summary["actionMatrix"]), 7)
        self.assertGreaterEqual(len(summary["contacts"]), 5)
        self.assertIn("inboxStats", summary)

    def test_inbox_idempotency_and_write(self):
        """Verifies inbox writing creates file and is strictly idempotent."""
        payload = {
            "eventId": "_test_event_id_unit_test",
            "title": "Unit Test Meeting Sync",
            "date": "2026-10-29",
            "attendees": ["Ayrton André", "Tester"],
            "googleDocUrl": "https://docs.google.com/document/d/fake-doc",
            "source": "unit_test",
            "text": "Discussion on unit test execution and idempotency verification."
        }

        # First write
        res1 = mission_notes.write_inbox_file("clariane-hdj", payload)
        self.assertEqual(res1["status"], "created")
        file_path = mission_notes.resolve_safe_path("clariane-hdj", f"_inbox/{res1['filename']}")
        self.assertTrue(file_path.exists())

        # Second write with same content -> should return 'exists' (idempotent)
        res2 = mission_notes.write_inbox_file("clariane-hdj", payload)
        self.assertEqual(res2["status"], "exists")
        self.assertEqual(res2["filename"], res1["filename"])

        # Clean up test file
        if file_path.exists():
            file_path.unlink()

if __name__ == "__main__":
    unittest.main()
