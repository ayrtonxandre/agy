#!/usr/bin/env python3
"""
Unit tests for mission_notes.py:update_action
Verifies editing action name/description, sub-stream/workstream, owner, and due date
directly in Markdown files conforming to Missions/_fold.md.
"""
import sys
import unittest
from pathlib import Path

# Add AGY root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import mission_notes

class TestActionUpdate(unittest.TestCase):

    def test_update_action_attributes(self):
        """Tests editing name, workstream, owner, and due date on an existing action."""
        # 1. Fetch current action state
        summary = mission_notes.get_mission_summary("pridefact")
        actions = summary.get("actions", [])
        self.assertTrue(len(actions) > 0, "Expected at least one action in PrideFact")
        target_act = next((a for a in actions if a["id"] == "ACT-PRF-05"), None)
        self.assertIsNotNone(target_act, "ACT-PRF-05 should exist in PrideFact")

        orig_title = target_act["title"]
        orig_owner = target_act["owner"]
        orig_ws = target_act["workstream"]
        orig_due = target_act["due"]

        try:
            # 2. Apply comprehensive update
            res = mission_notes.update_action("ACT-PRF-05", {
                "title": "Envoyer le budget actualisé et la note de cadrage",
                "owner": "Ayrton André",
                "workstream": "Synchro Mandat & Direction",
                "dueDate": "2026-11-20"
            }, mission_id="pridefact")

            self.assertEqual(res["actionId"], "ACT-PRF-05")
            self.assertEqual(res["title"], "Envoyer le budget actualisé et la note de cadrage")
            self.assertEqual(res["owner"], "Ayrton André")
            self.assertEqual(res["workstream"], "Synchro Mandat & Direction")
            self.assertEqual(res["due"], "2026-11-20")

            # 3. Verify file on disk
            re_summary = mission_notes.get_mission_summary("pridefact")
            re_act = next((a for a in re_summary.get("actions", []) if a["id"] == "ACT-PRF-05"), None)
            self.assertIsNotNone(re_act)
            self.assertEqual(re_act["title"], "Envoyer le budget actualisé et la note de cadrage")
            self.assertEqual(re_act["owner"], "Ayrton André")
            self.assertEqual(re_act["workstream"], "Synchro Mandat & Direction")
            self.assertEqual(re_act["due"], "2026-11-20")

        finally:
            # 4. Clean restore
            mission_notes.update_action("ACT-PRF-05", {
                "title": orig_title,
                "owner": orig_owner,
                "workstream": orig_ws,
                "dueDate": orig_due
            }, mission_id="pridefact")

    def test_update_action_not_found(self):
        """Tests that invalid action IDs raise a clear ValueError."""
        with self.assertRaises(ValueError):
            mission_notes.update_action("NON-EXISTENT-ACT-999", {
                "title": "Should fail"
            })

    def test_update_action_status_move(self):
        """Tests toggling done status via update_action moves row across sections."""
        summary = mission_notes.get_mission_summary("pridefact")
        target_act = next((a for a in summary.get("actions", []) if a["id"] == "ACT-PRF-05"), None)
        self.assertIsNotNone(target_act)
        orig_done = target_act["done"]

        try:
            # Move to Done
            res_done = mission_notes.update_action("ACT-PRF-05", {"done": True}, mission_id="pridefact")
            self.assertTrue(res_done["done"])
            self.assertEqual(res_done["status"], "done")

            # Move back to Open
            res_open = mission_notes.update_action("ACT-PRF-05", {"done": False}, mission_id="pridefact")
            self.assertFalse(res_open["done"])
            self.assertEqual(res_open["status"], "open")
        finally:
            mission_notes.update_action("ACT-PRF-05", {"done": orig_done}, mission_id="pridefact")


if __name__ == "__main__":
    unittest.main()
