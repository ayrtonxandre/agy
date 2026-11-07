#!/usr/bin/env python3
"""
Unit tests for ATHX sports science calculations and data integrity.
Uses Python standard library unittest with zero extra dependencies.
"""

import os
import sys
import json
import unittest
from pathlib import Path

# Add athx root to path
ATHX_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ATHX_DIR))

import athx_analytics
import athx_durability_cs_gear as adcg


class TestATHXSportsScience(unittest.TestCase):

    def setUp(self):
        self.athx_dir = ATHX_DIR
        self.running_json = self.athx_dir / "garmin_running_activities.json"
        self.strength_json = self.athx_dir / "garmin_extracted_workouts.json"

    def test_critical_speed_model(self):
        """Validates 2-parameter hyperbolic Critical Speed model (Distance = CS * t + D')."""
        self.assertTrue(self.running_json.exists(), "garmin_running_activities.json missing")
        with open(self.running_json, "r", encoding="utf-8") as f:
            runs = json.load(f)

        res = adcg.compute_critical_speed(runs)
        self.assertEqual(res.get("status"), "ok")
        self.assertTrue(res.get("valid"))
        self.assertGreater(res.get("cs_ms", 0), 2.5, "CS should be plausible running speed (>2.5 m/s)")
        self.assertGreater(res.get("r2", 0), 0.95, "R^2 must exceed 0.95 for reliable asymptote")
        self.assertIn("cs_pace_formatted", res)
        self.assertGreater(res.get("d_prime_m", 0), 0, "D' anaerobic work capacity must be positive")

    def test_critical_speed_edge_cases(self):
        """Critical Speed handles empty and insufficient datasets safely."""
        empty_res = adcg.compute_critical_speed([])
        self.assertFalse(empty_res.get("valid"))
        self.assertEqual(empty_res.get("status"), "no_data")

        slow_run = [{"Duration_s": 60, "Distance_km": 0.05, "Average_Speed_ms": 0.8}]
        sparse_res = adcg.compute_critical_speed(slow_run)
        self.assertFalse(sparse_res.get("valid"))
        self.assertEqual(sparse_res.get("status"), "insufficient_data")

    def test_strength_processing_and_acwr(self):
        """Validates strength volume, valid set counts, and ACWR computation."""
        self.assertTrue(self.strength_json.exists(), "garmin_extracted_workouts.json missing")
        with open(self.strength_json, "r", encoding="utf-8") as f:
            sets = json.load(f)

        audit = athx_analytics.DataAuditTracker()
        res = athx_analytics.process_strength_data(sets, audit)

        self.assertGreater(res.get("total_valid_sets", 0), 1000)
        self.assertGreater(res.get("total_volume_tons", 0), 100)
        self.assertIn("acwr", res)
        acwr = res["acwr"]
        self.assertIsInstance(acwr.get("value"), (int, float))
        self.assertGreater(acwr["value"], 0.5)
        self.assertIn("status", acwr)

    def test_competition_readiness(self):
        """Validates target competition countdown and week progression."""
        audit = athx_analytics.DataAuditTracker()
        strength = athx_analytics.process_strength_data([], audit)
        apple = {"body_comp": {}, "sleep": {}, "mobility": {}}
        running = {"runs": [], "total_km": 0}

        readiness = athx_analytics.evaluate_competition_readiness(strength, apple, running)
        self.assertEqual(readiness.get("competition_date"), "2027-05-27")
        self.assertGreater(readiness.get("weeks_remaining", 0), 0)
        self.assertIn("periodization_phase", readiness)
        self.assertIn("events", readiness)

    def test_split_running_consolidation(self):
        """Confirms split interval run 2026-10-30 is merged into a single consolidated record."""
        with open(self.running_json, "r", encoding="utf-8") as f:
            runs = json.load(f)

        oct30_runs = [r for r in runs if r.get("Date") == "2026-10-30"]
        self.assertEqual(len(oct30_runs), 1, "Split run on 2026-10-30 should be consolidated into 1 activity")
        run = oct30_runs[0]
        self.assertAlmostEqual(run.get("Distance_km", 0), 4.99, places=1)
        self.assertIn("Intervals", run.get("Activity_Name", ""))

    def test_single_source_of_truth_symlinks(self):
        """Verifies deduplication: garmin_workout.html and garmin_workout_volume.json are symlinks."""
        index_html = self.athx_dir / "index.html"
        workout_html = self.athx_dir / "garmin_workout.html"
        workout_vol = self.athx_dir / "garmin_workout_volume.json"

        self.assertTrue(index_html.exists(), "index.html must exist")
        self.assertGreater(index_html.stat().st_size, 500_000, "index.html should be complete dashboard")
        self.assertTrue(workout_html.is_symlink(), "garmin_workout.html must be a symlink to index.html")
        self.assertTrue(workout_vol.is_symlink(), "garmin_workout_volume.json must be a symlink")


if __name__ == "__main__":
    unittest.main(verbosity=2)
