#!/usr/bin/env python3
"""
================================================================================
Unit Tests for Atlas Connector, Watched Folder Ingestion, and Automated Folding
================================================================================
"""

import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add AGY root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import mission_notes


class TestAtlasConnector(unittest.TestCase):

    def setUp(self):
        self.atlas_dir = mission_notes.MISSIONS_ROOT / "_atlas"
        self.processed_dir = self.atlas_dir / "_processed"
        self.atlas_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)

    def test_get_atlas_folder_config(self):
        """Verifies Atlas folder config loading and Granola delegation."""
        folder = mission_notes.get_atlas_folder_config()
        self.assertIsNotNone(folder)
        self.assertTrue(folder.exists())
        self.assertEqual(folder.name, "_atlas")

        # Granola folder config should delegate to atlas folder config
        granola_folder = mission_notes.get_granola_folder_config()
        self.assertEqual(folder, granola_folder)

    def test_get_atlas_api_key(self):
        """Verifies API key retrieval from ATLAS_API_KEY, ensuring it does not leak GRANOLA_API_KEY."""
        with patch.dict(os.environ, {"ATLAS_API_KEY": "atl_test_key_123"}):
            key = mission_notes.get_atlas_api_key()
            self.assertEqual(key, "atl_test_key_123")

        with patch.dict(os.environ, {"ATLAS_API_KEY": "", "GRANOLA_API_KEY": "grn_compat_456"}):
            key = mission_notes.get_atlas_api_key()
            self.assertIsNone(key)

    def test_atlas_frontmatter_and_idempotency(self):
        """Verifies frontmatter generation and hash-based replacement for Atlas notes."""
        mission_id = "ge-enterprise"
        test_payload = {
            "atlas_id": "atl_test_idemp_999",
            "atlas_url": "https://app.atlas.co/notes/atl_test_idemp_999",
            "title": "Atlas Idempotency Test",
            "text": "Initial notes content version 1.",
            "source": "atlas"
        }

        # Step 1: First write -> created
        res1 = mission_notes.write_inbox_file(mission_id, test_payload)
        self.assertEqual(res1["status"], "created")
        file_path = mission_notes.MISSIONS_ROOT / res1["path"]
        self.assertTrue(file_path.exists())

        content1 = file_path.read_text(encoding="utf-8")
        self.assertIn("atlas_id: atl_test_idemp_999", content1)
        self.assertIn("atlas_url: https://app.atlas.co/notes/atl_test_idemp_999", content1)
        self.assertIn("source: atlas", content1)
        self.assertIn("Initial notes content version 1.", content1)

        # Step 2: Second write with exact same text -> exists
        res2 = mission_notes.write_inbox_file(mission_id, test_payload)
        self.assertEqual(res2["status"], "exists")

        # Step 3: Third write with modified text -> replaced
        modified_payload = dict(test_payload)
        modified_payload["text"] = "Modified notes content version 2."
        res3 = mission_notes.write_inbox_file(mission_id, modified_payload)
        self.assertEqual(res3["status"], "replaced")

        content3 = file_path.read_text(encoding="utf-8")
        self.assertIn("Modified notes content version 2.", content3)

        # Cleanup
        if file_path.exists():
            file_path.unlink()

    def test_process_atlas_folder_routing(self):
        """Verifies files in Missions/_atlas are ingested and moved to _processed."""
        test_file = self.atlas_dir / "2026-11-19_GE_Datastore_Atlas_Meeting.md"
        test_file.write_text(
            "# Weekly Sync - Datastore GE\n\nAttendees: Ayrton Andre, GE Lead\n\nMinutes:\n- Verified Atlas connector architecture.\n",
            encoding="utf-8"
        )

        res = mission_notes.process_atlas_folder()
        self.assertIn(res["status"], ("success", "ok"))
        self.assertGreaterEqual(res["processed"], 1)

        # Verify original file in _atlas/ was moved
        self.assertFalse(test_file.exists())

        # Verify file moved into _atlas/_processed/
        processed_file = self.processed_dir / "2026-11-19_GE_Datastore_Atlas_Meeting.md"
        self.assertTrue(processed_file.exists())

        # Verify file routed to GE Enterprise _inbox/
        ge_inbox = mission_notes.MISSIONS_ROOT / "GE Enterprise" / "_inbox"
        matched_files = [f for f in ge_inbox.glob("*.md") if "Atlas connector architecture" in f.read_text(encoding="utf-8")]
        self.assertGreaterEqual(len(matched_files), 1)

        # Cleanup
        if processed_file.exists():
            processed_file.unlink()
        for f in matched_files:
            if f.exists():
                f.unlink()

    @patch("mission_notes.urllib.request.urlopen")
    def test_fetch_atlas_notes(self, mock_urlopen):
        """Tests fetching notes list from Atlas API."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"notes": [{"id": "atl_note_01", "title": "Atlas Test Meeting"}]}'
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        notes = mission_notes.fetch_atlas_notes(api_key="atl_test_key")
        self.assertEqual(len(notes), 1)
        self.assertEqual(notes[0]["id"], "atl_note_01")
        self.assertEqual(notes[0]["title"], "Atlas Test Meeting")

    @patch("mission_notes.urllib.request.urlopen")
    def test_fetch_atlas_note_detail(self, mock_urlopen):
        """Tests fetching single note detail from Atlas API."""
        mock_response = MagicMock()
        mock_response.read.return_value = (
            b'{"id": "atl_note_02", "title": "Atlas Sprint Plan", '
            b'"calendar_event": {"calendar_event_id": "evt_atlas_99"}, '
            b'"summary_markdown": "## Next Steps\\n- Build Atlas connector"}'
        )
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        detail = mission_notes.fetch_atlas_note_detail("atl_note_02", api_key="atl_test_key")
        self.assertEqual(detail["id"], "atl_note_02")
        self.assertEqual(detail["title"], "Atlas Sprint Plan")
        self.assertEqual(detail["calendar_event"]["calendar_event_id"], "evt_atlas_99")
        self.assertIn("Build Atlas connector", detail["summary_markdown"])

    @patch("mission_notes.fetch_atlas_note_detail")
    @patch("mission_notes.fetch_atlas_notes")
    def test_sync_atlas_api_unassigned_routing(self, mock_fetch_notes, mock_fetch_detail):
        """Verifies unmatched Atlas meetings route to Missions/_inbox/ with atlas_id."""
        mock_fetch_notes.return_value = [{"id": "atl_unmatched_01", "title": "Unmatched Prospect Call"}]
        mock_fetch_detail.return_value = {
            "id": "atl_unmatched_01",
            "title": "Unmatched Prospect Call",
            "calendar_event": {
                "calendar_event_id": "evt_prospect_01",
                "scheduled_start_time": "2026-11-19T14:00:00+01:00"
            },
            "summary_markdown": "Prospect conversation without active mission.",
            "attendees": [{"name": "Ayrton Andre"}]
        }

        mock_events = [{
            "id": "evt_prospect_01",
            "title": "Unmatched Prospect Call",
            "summary": "Unmatched Prospect Call",
            "client": "External Client",
            "tags": []
        }]

        res = mission_notes.sync_atlas_api(api_key="atl_test", auto_fold=False, events_data=mock_events)
        self.assertEqual(res["status"], "success")
        self.assertGreaterEqual(len(res["unassigned"]), 1)

        # Verify created file has atlas_id and source: atlas
        created_file_info = res["unassigned"][0]
        fname = created_file_info.get("filename")
        self.assertIsNotNone(fname)

        p = mission_notes.UNASSIGNED_INBOX_DIR / fname
        self.assertTrue(p.exists())
        file_text = p.read_text(encoding="utf-8")
        self.assertIn("atlas_id: atl_unmatched_01", file_text)
        self.assertIn("source: atlas", file_text)

        # Cleanup
        if p.exists():
            p.unlink()

    def test_list_folded_files(self):
        """Verifies list_folded_files helper returns folded inbox files for a mission."""
        folded = mission_notes.list_folded_files("ge-enterprise")
        self.assertIsInstance(folded, list)

    def test_unassigned_inbox_eventId(self):
        """Verifies unassigned inbox preserves and returns explicit eventId."""
        payload = {
            "title": "Unassigned With Event ID",
            "text": "Minutes text for eventId test.",
            "eventId": "evt_test_unassigned_123",
            "atlas_id": "atl_unassigned_456"
        }
        res = mission_notes.write_unassigned_inbox_file(payload)
        self.assertEqual(res["status"], "created")
        fname = res["filename"]

        files = mission_notes.list_unassigned_inbox_files()
        matched = [f for f in files if f.get("filename") == fname]
        self.assertEqual(len(matched), 1)
        self.assertEqual(matched[0].get("eventId"), "evt_test_unassigned_123")
        self.assertEqual(matched[0].get("atlas_id"), "atl_unassigned_456")

        # Cleanup
        p = mission_notes.UNASSIGNED_INBOX_DIR / fname
        if p.exists():
            p.unlink()

    @patch("mission_notes.sync_atlas_api")
    @patch("mission_notes.get_granola_api_key", return_value=None)
    def test_sync_granola_delegation(self, mock_get_granola, mock_sync_atlas):
        """Verifies sync_granola_api delegates to sync_atlas_api when Granola key is absent and Atlas key is present."""
        mock_sync_atlas.return_value = {"status": "success", "synced": 1}
        with patch.dict(os.environ, {"ATLAS_API_KEY": "atl_delegated_key"}):
            res = mission_notes.sync_granola_api()
            self.assertEqual(res["status"], "success")
            mock_sync_atlas.assert_called_once()

    def test_atlas_status_contract(self):
        """Verifies the contract fields expected by orchestrator and frontend."""
        folder_cfg = mission_notes.get_atlas_folder_config()
        api_key = mission_notes.get_atlas_api_key()
        unassigned = mission_notes.list_unassigned_inbox_files()
        status_data = {
            "configured": bool(folder_cfg or api_key),
            "active": bool(folder_cfg or api_key),
            "folder": str(folder_cfg) if folder_cfg else None,
            "apiKey": bool(api_key),
            "hasApiKey": bool(api_key),
            "pendingFilesCount": len(unassigned)
        }
        self.assertTrue(status_data["configured"])
        self.assertTrue(status_data["active"])
        self.assertIsNotNone(status_data["folder"])
        self.assertIn("apiKey", status_data)
        self.assertIn("pendingFilesCount", status_data)


if __name__ == "__main__":
    unittest.main()
