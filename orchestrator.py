#!/usr/bin/env python3
"""
================================================================================
Master ATHX 2027 Orchestrator: Garmin, Apple Health & Multi-Calendar Engine
================================================================================
"""

from __future__ import annotations
import os
import sys
import json
import csv
import shutil
import subprocess
import time
import threading
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from http.server import HTTPServer, ThreadingHTTPServer, BaseHTTPRequestHandler
from zoneinfo import ZoneInfo

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("AGY_DATA_DIR", str(BASE_DIR)))
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOCAL_TZ = ZoneInfo(os.environ.get("TZ", "Europe/Paris"))

# Paths (check DATA_DIR first, then fallback to BASE_DIR if needed)
GARMIN_CSV = DATA_DIR / "garmin_extracted_workouts.csv"
BODY_COMP_CSV = DATA_DIR / "apple_body_composition.csv"
NUTRITION_CSV = DATA_DIR / "apple_nutrition_macros.csv"
DAILY_ACT_CSV = DATA_DIR / "apple_daily_activity.csv"
WORKOUT_HTML = DATA_DIR / "garmin_workout.html"
CALENDAR_HTML = DATA_DIR / "calendar_dashboard.html"
ACCESS_LOG = DATA_DIR / "server_access.log"
LAST_PAYLOAD_FILE = DATA_DIR / "last_payload.json"

def log_event(msg: str):
    timestamp = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{timestamp}] {msg}"
    print(entry, flush=True)
    try:
        ACCESS_LOG.parent.mkdir(parents=True, exist_ok=True)
        with open(ACCESS_LOG, "a", encoding="utf-8") as f:
            f.write(entry + "\n")
            f.flush()
    except Exception as e:
        print(f"Failed to write to access log: {e}", flush=True)

GIT_LOCK = threading.Lock()

def git_auto_commit_and_push(reason: str = "apple health webhook sync"):
    """Batches and pushes data and dashboard changes to GitHub origin/main in background."""
    if not GIT_LOCK.acquire(blocking=False):
        log_event("⏳ Git push already in progress, skipping concurrent trigger")
        return

    try:
        git_bin = shutil.which("git")
        if not git_bin:
            log_event("Warning: git binary not found")
            return

        # Check status
        res = subprocess.run(
            [git_bin, "-C", str(BASE_DIR), "status", "--porcelain"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if res.returncode != 0 or not res.stdout.strip():
            log_event("Git: Working tree clean (nothing to commit)")
            return

        subprocess.run(
            [git_bin, "-C", str(BASE_DIR), "add", "-A"],
            capture_output=True,
            text=True,
            timeout=15
        )
        timestamp = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d %H:%M")
        commit_msg = f"chore(data): {reason} [{timestamp}]"
        subprocess.run(
            [git_bin, "-C", str(BASE_DIR), "commit", "-m", commit_msg],
            capture_output=True,
            text=True,
            timeout=15
        )
        push_res = subprocess.run(
            [git_bin, "-C", str(BASE_DIR), "push", "origin", "main"],
            capture_output=True,
            text=True,
            timeout=30
        )
        if push_res.returncode == 0:
            log_event("🚀 Pushed updated data & dashboards to GitHub origin/main")
        else:
            err = push_res.stderr.strip().splitlines()[-1] if push_res.stderr else "unknown error"
            log_event(f"Warning: Git push failed: {err[:60]}")
    except Exception as e:
        log_event(f"Notice: Git auto-push error: {e}")
    finally:
        GIT_LOCK.release()

# Athletic Routine Constraints (Option 1: 4 Gym + 3 CrossFit + Wednesday Light Cardio/Core + Sunday Rest)
ATHLETIC_SCHEDULE = {
    "Monday": [
        {"type": "Gym", "time": "06:30", "duration_min": 45, "split": "Push & Shoulders (S2O)"},
        {"type": "Crossfit", "time": "19:00", "duration_min": 60, "split": "Cross-training"}
    ],
    "Tuesday": {"type": "Gym", "time": "06:30", "duration_min": 48, "split": "Pull & Forearms"},
    "Wednesday": [
        {"type": "Cardio/Core", "time": "06:30", "duration_min": 20, "split": "Light Cardio & Core"},
        {"type": "Crossfit", "time": "19:00", "duration_min": 60, "split": "Cross-training"}
    ],
    "Thursday": {"type": "Gym", "time": "06:30", "duration_min": 50, "split": "Legs A (Squat & Quads)"},
    "Friday": {"type": "Gym", "time": "06:30", "duration_min": 45, "split": "Legs B (Deadlift & Carry)"},
    "Saturday": {"type": "Crossfit", "time": "11:30", "duration_min": 60, "split": "Cross-training"},
    "Sunday": {"type": "Rest", "time": None, "duration_min": 0, "split": "Full Rest & Recovery"}
}

def process_health_auto_export_payload(payload: dict) -> dict:
    """Parses JSON received from Health Auto Export app and updates local CSVs."""
    now_str = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d %H:%M:%S")

    # Save raw payload for debugging
    try:
        with open(LAST_PAYLOAD_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
    except Exception as e:
        log_event(f"Error saving payload to debug file: {e}")

    # Inspect structure (payload might be {"data": {"metrics": [...]}} or {"metrics": [...]})
    data = payload.get("data", payload)
    metrics = data.get("metrics", [])
    if isinstance(metrics, dict):
        # Some versions send dict with metric names as keys
        metrics_list = []
        for k, v in metrics.items():
            if isinstance(v, list):
                metrics_list.append({"name": k, "data": v})
            elif isinstance(v, dict):
                v["name"] = k
                metrics_list.append(v)
        metrics = metrics_list

    updates = {"body_comp": 0, "nutrition": 0, "activity": 0}

    new_weight = None
    new_bf = None
    new_cals = None
    new_prot = None
    new_carbs = None
    new_fat = None
    new_fiber = None
    new_steps = None

    for m in metrics:
        name = str(m.get("name", "")).lower()
        samples = m.get("data", [])
        if not samples:
            continue
        
        latest = samples[-1]
        sample_date = str(latest.get("date", latest.get("startDate", "")))[:10]
        qty = latest.get("qty", latest.get("value", 0))

        if "weight" in name or "body_mass" in name or "bodymass" in name:
            try: new_weight = (sample_date, round(float(qty), 1))
            except: pass
        elif "body_fat" in name or "bodyfat" in name:
            try:
                val = float(qty)
                new_bf = (sample_date, round(val if val > 1.0 else val * 100, 1))
            except: pass
        elif "dietary_energy" in name or "dietaryenergy" in name or ("energy" in name and "diet" in name) or "calorie" in name:
            try:
                val = float(qty)
                unit = str(latest.get("unit", m.get("units", ""))).lower()
                cals = val * 0.239006 if "kj" in unit else val
                new_cals = (sample_date, round(cals, 1))
            except: pass
        elif "protein" in name:
            try: new_prot = (sample_date, round(float(qty), 1))
            except: pass
        elif "carb" in name:
            try: new_carbs = (sample_date, round(float(qty), 1))
            except: pass
        elif "total_fat" in name or ("fat" in name and "body" not in name):
            try: new_fat = (sample_date, round(float(qty), 1))
            except: pass
        elif "fiber" in name:
            try: new_fiber = (sample_date, round(float(qty), 1))
            except: pass
        elif "step" in name:
            try: new_steps = (sample_date, int(float(qty)))
            except: pass

    # 1. Update Body Comp CSV if weight received
    if new_weight:
        s_date, weight_kg = new_weight
        bf_pct = new_bf[1] if new_bf and new_bf[0] == s_date else ""
        lean_mass = round(weight_kg * (1 - (bf_pct / 100.0)), 1) if bf_pct else ""
        bmi = round(weight_kg / (1.83 ** 2), 1)

        rows = []
        if BODY_COMP_CSV.exists():
            with open(BODY_COMP_CSV, "r", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
        
        existing = next((r for r in rows if r.get("Date") == s_date), None)
        if existing:
            existing["Weight_kg"] = weight_kg
            if bf_pct: existing["Body_Fat_pct"] = bf_pct
            if lean_mass: existing["Lean_Mass_kg"] = lean_mass
            existing["BMI"] = bmi
        else:
            rows.append({
                "Date": s_date,
                "Weight_kg": weight_kg,
                "Body_Fat_pct": bf_pct,
                "Lean_Mass_kg": lean_mass,
                "BMI": bmi
            })
        
        rows.sort(key=lambda x: x["Date"])
        with open(BODY_COMP_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["Date", "Weight_kg", "Body_Fat_pct", "Lean_Mass_kg", "BMI"])
            writer.writeheader()
            writer.writerows(rows)
        updates["body_comp"] += 1
        log_event(f"🍏 Health Auto Export: Logged {weight_kg} kg (BF: {bf_pct}%) on {s_date}")

    # 2. Update Daily Steps if steps received
    step_samples = [m for m in metrics if "step" in str(m.get("name", "")).lower()]
    if step_samples:
        from collections import defaultdict
        daily_steps = defaultdict(float)
        for s in step_samples[0].get("data", []):
            d = str(s.get("date", ""))[:10]
            if d: daily_steps[d] += float(s.get("qty", 0))

        if daily_steps and DAILY_ACT_CSV.exists():
            with open(DAILY_ACT_CSV, "r", encoding="utf-8") as f:
                act_rows = list(csv.DictReader(f))
            for d, st in daily_steps.items():
                match = next((r for r in act_rows if r.get("Date") == d), None)
                if match:
                    match["Steps"] = int(round(st))
                else:
                    act_rows.append({"Date": d, "Steps": int(round(st)), "Distance_km": "", "Active_Energy_kcal": "", "Resting_Heart_Rate_bpm": ""})
            act_rows.sort(key=lambda x: x["Date"])
            with open(DAILY_ACT_CSV, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=["Date", "Steps", "Distance_km", "Active_Energy_kcal", "Resting_Heart_Rate_bpm"])
                writer.writeheader()
                writer.writerows(act_rows)
            updates["activity"] += len(daily_steps)
            log_event(f"👟 Health Auto Export: Updated steps for {list(daily_steps.keys())}")

    # 3. Update Sleep Analysis if sleep received
    sleep_samples = [m for m in metrics if "sleep" in str(m.get("name", "")).lower()]
    sleep_data = data.get("sleep", [])
    if sleep_samples:
        sleep_data.extend(sleep_samples[0].get("data", []))

    if sleep_data:
        from collections import defaultdict
        daily_sleep = defaultdict(lambda: {"total": 0.0, "deep": 0.0, "rem": 0.0, "core": 0.0, "awake": 0.0, "in_bed": 0.0})

        for s in sleep_data:
            s_date = str(s.get("date", s.get("startDate", "")))[:10]
            val = str(s.get("value", s.get("stage", ""))).lower()
            qty = float(s.get("qty", s.get("duration", 0)))
            dur_hrs = qty / 3600.0 if qty > 60 else qty

            # If nested sleep_analysis array is present
            nested_stages = s.get("sleep_analysis", [])
            if nested_stages:
                daily_sleep[s_date]["total"] = round(dur_hrs, 2)
                for st in nested_stages:
                    st_val = str(st.get("value", st.get("stage", ""))).lower()
                    st_start = st.get("startDate", "")
                    st_end = st.get("endDate", "")
                    st_hrs = 0.0
                    try:
                        t1 = datetime.fromisoformat(st_start[:19])
                        t2 = datetime.fromisoformat(st_end[:19])
                        st_hrs = (t2 - t1).total_seconds() / 3600.0
                    except:
                        pass
                    if "deep" in st_val: daily_sleep[s_date]["deep"] += st_hrs
                    elif "rem" in st_val: daily_sleep[s_date]["rem"] += st_hrs
                    elif "core" in st_val or "light" in st_val: daily_sleep[s_date]["core"] += st_hrs
                    elif "awake" in st_val: daily_sleep[s_date]["awake"] += st_hrs
                    elif "inbed" in st_val: daily_sleep[s_date]["in_bed"] += st_hrs
            elif "asleep" in s:
                daily_sleep[s_date]["total"] = float(s.get("asleep", 0))
                daily_sleep[s_date]["deep"] = float(s.get("deep", 0))
                daily_sleep[s_date]["rem"] = float(s.get("rem", 0))
                daily_sleep[s_date]["core"] = float(s.get("core", 0))
                daily_sleep[s_date]["awake"] = float(s.get("awake", 0))
                daily_sleep[s_date]["in_bed"] = float(s.get("inBed", 0))
            else:
                if "deep" in val: daily_sleep[s_date]["deep"] += dur_hrs
                elif "rem" in val: daily_sleep[s_date]["rem"] += dur_hrs
                elif "core" in val or "light" in val: daily_sleep[s_date]["core"] += dur_hrs
                elif "awake" in val: daily_sleep[s_date]["awake"] += dur_hrs
                elif "inbed" in val: daily_sleep[s_date]["in_bed"] += dur_hrs
                elif "asleep" in val: daily_sleep[s_date]["total"] += dur_hrs

        # Calculate totals if collected by stage
        sleep_csv_path = BASE_DIR / "apple_sleep.csv"
        rows = []
        if sleep_csv_path.exists():
            with open(sleep_csv_path, "r", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))

        for d, m in daily_sleep.items():
            if m["total"] == 0.0:
                m["total"] = m["deep"] + m["rem"] + m["core"]
            if m["in_bed"] == 0.0:
                m["in_bed"] = m["total"] + m["awake"]

            match = next((r for r in rows if r.get("Date") == d), None)
            entry = {
                "Date": d,
                "Total_Sleep_hrs": round(m["total"], 1),
                "Deep_Sleep_hrs": round(m["deep"], 1),
                "REM_Sleep_hrs": round(m["rem"], 1),
                "Core_Sleep_hrs": round(m["core"], 1),
                "Awake_hrs": round(m["awake"], 1),
                "In_Bed_hrs": round(m["in_bed"], 1)
            }
            if match:
                match.update(entry)
            else:
                rows.append(entry)
            log_event(f"😴 Health Auto Export: Logged {round(m['total'], 1)} hrs sleep for {d}")

        rows.sort(key=lambda x: x["Date"])
        with open(sleep_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["Date", "Total_Sleep_hrs", "Deep_Sleep_hrs", "REM_Sleep_hrs", "Core_Sleep_hrs", "Awake_hrs", "In_Bed_hrs"])
            writer.writeheader()
            writer.writerows(rows)
        updates["sleep"] = len(daily_sleep)

    # 4. Update Nutrition Macros if nutrition received
    if new_cals or new_prot:
        s_date = (new_cals or new_prot)[0]
        cals_val = new_cals[1] if new_cals and new_cals[0] == s_date else 0.0
        prot_val = new_prot[1] if new_prot and new_prot[0] == s_date else 0.0
        carbs_val = new_carbs[1] if new_carbs and new_carbs[0] == s_date else 0.0
        fat_val = new_fat[1] if new_fat and new_fat[0] == s_date else 0.0
        fiber_val = new_fiber[1] if new_fiber and new_fiber[0] == s_date else 0.0

        nut_rows = []
        if NUTRITION_CSV.exists():
            with open(NUTRITION_CSV, "r", encoding="utf-8") as f:
                nut_rows = list(csv.DictReader(f))

        existing = next((r for r in nut_rows if r.get("Date") == s_date), None)
        if existing:
            if cals_val: existing["Calories_kcal"] = cals_val
            if prot_val: existing["Protein_g"] = prot_val
            if carbs_val: existing["Carbs_g"] = carbs_val
            if fat_val: existing["Fat_g"] = fat_val
            if fiber_val: existing["Fiber_g"] = fiber_val
        else:
            nut_rows.append({
                "Date": s_date,
                "Calories_kcal": cals_val,
                "Protein_g": prot_val,
                "Carbs_g": carbs_val,
                "Fat_g": fat_val,
                "Fiber_g": fiber_val
            })

        nut_rows.sort(key=lambda x: x["Date"])
        with open(NUTRITION_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["Date", "Calories_kcal", "Protein_g", "Carbs_g", "Fat_g", "Fiber_g"])
            writer.writeheader()
            writer.writerows(nut_rows)
        updates["nutrition"] += 1
        log_event(f"🥗 Health Auto Export: Logged {cals_val} kcal, {prot_val}g protein on {s_date}")

    # Regenerate dashboard
    try:
        res = subprocess.run(
            [sys.executable, str(BASE_DIR / "generate_unified_athlete_dashboard.py")],
            capture_output=True,
            text=True,
            timeout=35
        )
        if res.returncode == 0:
            log_event("⚡ Regenerated athlete dashboard (garmin_workout.html)")
        else:
            err = res.stderr.strip().splitlines()[-1] if res.stderr else "unknown error"
            log_event(f"Warning: Dashboard regeneration error: {err}")
    except Exception as e:
        log_event(f"Warning: Could not regenerate dashboard: {e}")

    # Trigger automatic background sync to GitHub
    try:
        threading.Thread(target=git_auto_commit_and_push, args=("apple health webhook sync",), daemon=True).start()
        log_event("☁️ Triggered background GitHub auto-sync")
    except Exception as e:
        log_event(f"Notice: GitHub auto-sync skipped: {e}")

    return {"status": "success", "updates": updates, "timestamp": now_str}

class AthleteServerHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, X-Requested-With")

    def do_OPTIONS(self):
        log_event(f"OPTIONS request from {self.client_address[0]} to {self.path}")
        self.send_response(200)
        self.send_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_HEAD(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def _get_clean_path(self) -> str:
        clean = urlparse(self.path).path.rstrip("/")
        return clean if clean else "/"

    def do_GET(self):
        client_ip = self.client_address[0]
        clean_path = self._get_clean_path()
        log_event(f"GET request from {client_ip} to {clean_path}")

        # Healthcheck endpoints (used by Docker & SWAG)
        if clean_path in ("/health", "/api/health"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_cors_headers()
            self.end_headers()
            resp = {
                "system": "ATHX 2027 Athlete Intelligence Orchestrator",
                "status": "online",
                "version": "2.0.0",
                "time": datetime.now(LOCAL_TZ).isoformat(),
                "endpoints": {
                    "athlete_headquarters": "/",
                    "workout_dashboard": "/workout",
                    "calendar_dashboard": "/calendar",
                    "webhook": "POST /api/health",
                    "healthcheck": "GET /health"
                }
            }
            self.wfile.write(json.dumps(resp, indent=2).encode("utf-8"))

        # Main Athlete Headquarters Dashboard
        elif clean_path in ("/", "/workout", "/index.html", "/garmin_workout.html"):
            target_file = WORKOUT_HTML if WORKOUT_HTML.exists() else (BASE_DIR / "garmin_workout.html")
            if not target_file.exists() and (BASE_DIR / "index.html").exists():
                target_file = BASE_DIR / "index.html"

            if target_file.exists():
                content = target_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "Athlete Dashboard not found. Run ATHX dashboard build first.")

        # Multi-Calendar Dashboard
        elif clean_path in ("/calendar", "/calendar.html", "/calendar_dashboard.html"):
            target_file = CALENDAR_HTML if CALENDAR_HTML.exists() else (BASE_DIR / "calendar_dashboard.html")
            if target_file.exists():
                content = target_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "Calendar dashboard not found")

        else:
            self.send_error(404, f"Path not found: {clean_path}")

    def do_POST(self):
        client_ip = self.client_address[0]
        clean_path = self._get_clean_path()
        log_event(f"POST request received from {client_ip} to {clean_path}")

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(body.decode("utf-8")) if body else {}

            log_event(f"📦 Payload size: {len(body)} bytes from {client_ip}")

            # iOS Health Auto Export webhook ingestion
            if clean_path in ("/api/health", "/health", "/webhook"):
                result = process_health_auto_export_payload(payload)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))

            # On-demand dashboard rebuild API
            elif clean_path in ("/api/rebuild", "/api/sync/rebuild"):
                res = subprocess.run(
                    [sys.executable, str(BASE_DIR / "generate_unified_athlete_dashboard.py")],
                    capture_output=True,
                    text=True,
                    timeout=35
                )
                self.send_response(200 if res.returncode == 0 else 500)
                self.send_header("Content-Type", "application/json")
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success" if res.returncode == 0 else "error",
                    "code": res.returncode,
                    "output": res.stdout.strip() if res.returncode == 0 else res.stderr.strip()
                }).encode("utf-8"))

            # On-demand Garmin extraction API
            elif clean_path == "/api/sync/garmin":
                res = subprocess.run(
                    [sys.executable, str(BASE_DIR / "extract_garmin_strength.py")],
                    capture_output=True,
                    text=True,
                    timeout=45
                )
                if res.returncode == 0:
                    subprocess.run([sys.executable, str(BASE_DIR / "generate_unified_athlete_dashboard.py")], timeout=35)
                self.send_response(200 if res.returncode == 0 else 500)
                self.send_header("Content-Type", "application/json")
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success" if res.returncode == 0 else "error",
                    "output": res.stdout.strip() if res.returncode == 0 else res.stderr.strip()
                }).encode("utf-8"))

            else:
                self.send_error(404, f"API endpoint not found: {clean_path}")

        except Exception as e:
            log_event(f"❌ Error processing POST: {e}")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

def run_server(port: int | None = None):
    if port is None:
        port = int(os.environ.get("PORT", os.environ.get("AGY_PORT", "8080")))

    # Optional background periodic sync scheduler
    interval_hours = float(os.environ.get("SYNC_INTERVAL_HOURS", "0"))
    if interval_hours > 0:
        def background_scheduler():
            log_event(f"⏰ Background sync scheduler active (every {interval_hours}h)")
            while True:
                time.sleep(interval_hours * 3600)
                log_event("⏰ Running scheduled background sync...")
                try:
                    garmin_tokens = BASE_DIR / "garmin_tokens"
                    if garmin_tokens.exists():
                        subprocess.run([sys.executable, str(BASE_DIR / "extract_garmin_strength.py")], timeout=45)
                    subprocess.run([sys.executable, str(BASE_DIR / "generate_unified_athlete_dashboard.py")], timeout=35)
                    threading.Thread(target=git_auto_commit_and_push, args=("periodic background sync",), daemon=True).start()
                except Exception as ex:
                    log_event(f"Periodic sync warning: {ex}")

        threading.Thread(target=background_scheduler, daemon=True).start()

    server = ThreadingHTTPServer(("0.0.0.0", port), AthleteServerHandler)
    log_event(f"🚀 Athlete Orchestrator Server running on port {port}")
    log_event(f"  • Athlete Dashboard  : http://0.0.0.0:{port}/")
    log_event(f"  • Calendar Dashboard : http://0.0.0.0:{port}/calendar")
    log_event(f"  • Healthcheck        : http://0.0.0.0:{port}/health")
    log_event(f"  • Webhook Endpoint   : http://0.0.0.0:{port}/api/health")
    server.serve_forever()

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "status"

    if mode == "serve":
        run_server()
    elif mode == "plan":
        print("ATHX 2027 Schedule (Option 1 - 4 Gym / 3 CrossFit / Sunday Rest):")
        for d, sessions in ATHLETIC_SCHEDULE.items():
            if isinstance(sessions, list):
                sched_str = " + ".join(f"{s['type']} at {s['time']} ({s['split']}, {s['duration_min']}m)" for s in sessions)
                print(f"  • {d:9}: {sched_str}")
            else:
                t = sessions.get('time')
                time_str = f"at {t} ({sessions.get('duration_min', 0)}m)" if t else "OFF"
                print(f"  • {d:9}: {sessions['type']} {time_str} - {sessions['split']}")
    elif mode == "sync-garmin":
        subprocess.run([sys.executable, str(BASE_DIR / "extract_garmin_strength.py")])
    else:
        print("Usage: python3 orchestrator.py [serve|plan|sync-garmin]")
