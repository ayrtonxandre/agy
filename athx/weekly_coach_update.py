#!/usr/bin/env python3
"""
================================================================================
⚡ ATHX 2027 • Weekly Sunday AI Coach Automation
================================================================================
Executes the Sunday athletic debriefing:
  1. Refreshes Garmin Connect telemetry (strength, running dynamics, HRV, sleep)
  2. Synthesizes a fresh AI Sports Scientist tactical briefing (bypassing cache)
  3. Rebuilds the unified athlete dashboard (garmin_workout.html & index.html)
  4. Automatically records sync timestamp and formats weekly summary
"""

from __future__ import annotations
import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ATHX_DIR = Path(__file__).resolve().parent
BASE_DIR = ATHX_DIR.parent
DATA_DIR = Path(os.environ.get("AGY_DATA_DIR", str(ATHX_DIR)))
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)
LOCAL_TZ = ZoneInfo(os.environ.get("TZ", "Europe/Paris"))
STATE_FILE = DATA_DIR / ".last_sunday_coach_sync"

if str(ATHX_DIR) not in sys.path:
    sys.path.insert(0, str(ATHX_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


def log(msg: str):
    timestamp = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {msg}"
    print(formatted)
    log_path = LOGS_DIR / "coach_weekly.log"
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(formatted + "\n")
    except Exception:
        pass


def run_weekly_coach_update(force: bool = True, push_git: bool = False) -> dict:
    """Executes the full weekly sports science update pipeline."""
    now = datetime.now(LOCAL_TZ)
    week_marker = f"{now.year}-W{now.isocalendar().week:02d}"
    log(f"🧠 Starting ATHX Weekly AI Coach Refresh for {week_marker}...")

    # Load environment variables (.env)
    env = dict(os.environ)
    env_file = BASE_DIR / ".env"
    if not env.get("GARMIN_PERSONAL_API_KEY") and env_file.exists():
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    s = line.strip()
                    if s.startswith("GARMIN_PERSONAL_API_KEY="):
                        env["GARMIN_PERSONAL_API_KEY"] = s.split("=", 1)[1].strip("\"'")
                    elif s.startswith("GEMINI_API_KEY="):
                        env["GEMINI_API_KEY"] = s.split("=", 1)[1].strip("\"'")
        except Exception as e:
            log(f"Notice loading .env: {e}")

    # Determine Python binary (venv or current)
    venv_py = BASE_DIR / "venv" / "bin" / "python3"
    py_bin = str(venv_py) if venv_py.exists() else sys.executable

    # Step 1: Garmin Connect Sync (Official Developer Personal API)
    garmin_script = ATHX_DIR / "garmin_personal_sync.py"
    if not garmin_script.exists():
        garmin_script = ATHX_DIR / "extract_garmin_strength.py"
    if garmin_script.exists():
        log("👟 1/3: Extracting Garmin strength, running dynamics, HRV & sleep...")
        try:
            res = subprocess.run([py_bin, str(garmin_script)], cwd=str(ATHX_DIR), env=env, timeout=45, capture_output=True, text=True)
            if res.returncode == 0:
                log("✔ Garmin telemetry extraction complete.")
            else:
                log(f"⚠️ Garmin telemetry notice (code {res.returncode}): {res.stderr.strip()[:100]}")
        except subprocess.TimeoutExpired:
            log("⚠️ Garmin telemetry sync timed out; continuing with cached session data.")
        except Exception as e:
            log(f"⚠️ Garmin extraction notice: {e}")

    # Step 2: Force Rebuild Unified Athlete Dashboard + AI Coach Briefing
    dash_script = ATHX_DIR / "generate_unified_athlete_dashboard.py"
    if dash_script.exists():
        log("🔬 2/3: Generating AI Sports Scientist Briefing & Rebuilding Dashboard...")
        cmd = [py_bin, str(dash_script)]
        if force:
            cmd.append("--force")
        try:
            res = subprocess.run(cmd, cwd=str(ATHX_DIR), env=env, timeout=60, capture_output=True, text=True)
            if res.returncode == 0:
                log("✔ Athlete Dashboard & AI Coach Briefing successfully rebuilt.")
            else:
                log(f"⚠️ Dashboard build warning (code {res.returncode}): {res.stderr.strip()[:100]}")
        except Exception as e:
            log(f"❌ Dashboard build failed: {e}")

    # Step 3: Record State
    STATE_FILE.write_text(week_marker, encoding="utf-8")
    log(f"💾 Recorded state: {week_marker}")

    # Step 4: Load Briefing Verdict
    briefing_file = DATA_DIR / "athlete_coach_briefing.json"
    briefing_data = {}
    if briefing_file.exists():
        try:
            with open(briefing_file, "r", encoding="utf-8") as f:
                briefing_data = json.load(f)
            verdict = briefing_data.get("executive_verdict", {}).get("rating", "N/A")
            provider = briefing_data.get("provider_used", "Unknown")
            log(f"🏆 AI Coach Verdict: [{verdict}] via {provider}")
        except Exception as e:
            log(f"⚠️ Error reading briefing file: {e}")

    # Step 5: Optional Git Auto-Commit
    if push_git:
        log("🚀 3/3: Pushing updated datasets to GitHub...")
        try:
            subprocess.run(["git", "add", "athx/"], cwd=str(BASE_DIR), timeout=15)
            subprocess.run(["git", "commit", "-m", f"Sunday AI Coach weekly briefing update ({week_marker})"], cwd=str(BASE_DIR), timeout=15)
            subprocess.run(["git", "push", "origin", "main"], cwd=str(BASE_DIR), timeout=30)
            log("✔ GitHub sync complete.")
        except Exception as e:
            log(f"⚠️ Git push notice: {e}")

    log(f"✨ Weekly AI Coach update pipeline finished for {week_marker}.\n")
    return {
        "status": "success",
        "week": week_marker,
        "timestamp": now.isoformat(),
        "briefing": briefing_data
    }


if __name__ == "__main__":
    force = "--no-force" not in sys.argv
    push = "--push" in sys.argv
    run_weekly_coach_update(force=force, push_git=push)
