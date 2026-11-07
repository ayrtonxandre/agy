#!/usr/bin/env python3
"""
================================================================================
Unit Tests for Granola API Integration and Automated Folding
================================================================================
"""

import sys
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add AGY root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import mission_notes


class TestGranolaApi(unittest.TestCase):

    def test_get_granola_api_key(self):
        """Verifies API key retrieval from env or .env file."""
        key = mission_notes.get_granola_api_key()
        self.assertIsNotNone(key)
        self.assertTrue(key.startswith("grn_"))

    @patch("mission_notes.urllib.request.urlopen")
    def test_fetch_granola_notes(self, mock_urlopen):
        """Tests fetching notes list from Granola API."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"notes": [{"id": "not_123", "title": "Test Sync"}]}'
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        notes = mission_notes.fetch_granola_notes(api_key="grn_test_123")
        self.assertEqual(len(notes), 1)
        self.assertEqual(notes[0]["id"], "not_123")
        self.assertEqual(notes[0]["title"], "Test Sync")

    @patch("mission_notes.urllib.request.urlopen")
    def test_fetch_granola_note_detail(self, mock_urlopen):
        """Tests fetching single note detail from Granola API."""
        mock_response = MagicMock()
        mock_response.read.return_value = (
            b'{"id": "not_456", "title": "DYOC Status", '
            b'"calendar_event": {"calendar_event_id": "test_event_1"}, '
            b'"summary_markdown": "# Next Steps\\n- **Action 1** (Ayrton)"}'
        )
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        detail = mission_notes.fetch_granola_note_detail("not_456", api_key="grn_test_123")
        self.assertEqual(detail["id"], "not_456")
        self.assertEqual(detail["title"], "DYOC Status")
        self.assertEqual(detail["calendar_event"]["calendar_event_id"], "test_event_1")
        self.assertIn("Action 1", detail["summary_markdown"])

    @patch("mission_notes.fetch_granola_note_detail")
    @patch("mission_notes.fetch_granola_notes")
    def test_sync_granola_api_unassigned_routing(self, mock_fetch_notes, mock_fetch_detail):
        """Verifies unassigned meetings (e.g. Leclerc) route to Missions/_inbox/."""
        mock_fetch_notes.return_value = [{"id": "not_leclerc_01", "title": "Échange mission Leclerc"}]
        mock_fetch_detail.return_value = {
            "id": "not_leclerc_01",
            "title": "Échange mission Leclerc",
            "calendar_event": {
                "calendar_event_id": "event_leclerc_99",
                "scheduled_start_time": "2026-11-04T11:30:00+01:00"
            },
            "summary_markdown": "Discussion prospective hors mandats.",
            "attendees": [{"name": "Ayrton Andre"}]
        }

        # Mock events with no mission match
        mock_events = [{
            "id": "event_leclerc_99",
            "title": "Échange mission Leclerc",
            "summary": "Échange mission Leclerc",
            "client": "Leclerc",
            "tags": []
        }]

        res = mission_notes.sync_granola_api(api_key="grn_test", auto_fold=False, events_data=mock_events)
        self.assertEqual(res["status"], "success")
        self.assertTrue(len(res["unassigned"]) >= 1)

        # Cleanup created unassigned file if any
        for unassigned in res["unassigned"]:
            fname = unassigned.get("filename")
            if fname:
                p = mission_notes.UNASSIGNED_INBOX_DIR / fname
                if p.is_file():
                    p.unlink()


if __name__ == "__main__":
    unittest.main()
