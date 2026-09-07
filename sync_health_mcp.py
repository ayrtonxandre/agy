#!/usr/bin/env python3
"""
================================================================================
Health Auto Export MCP Live Sync Engine
================================================================================

Directly queries Apple Health biometrics and workout sessions from the 
Health Auto Export Model Context Protocol (MCP) server running on iOS:
  - Endpoint: http://<iPhone-IP>:9000/mcp
  - Protocol: Streamable HTTP MCP (2024-11-05 / 2025-03-26) with Mcp-Session-Id
  - Tools queried: `get_health_metrics`, `get_workouts`
  - Updates local CSVs:
      * `apple_body_composition.csv` (Weight, Body Fat %, Lean Mass, BMI)
      * `apple_sleep.csv` (Deep, REM, Core, Awake, Total, In Bed)
      * `apple_daily_activity.csv` (Steps, Distance, Active Energy, Resting HR)
      * `apple_mobility_biomechanics.csv` (Walking speed, Step length, Symmetry, Flights)
      * `apple_workouts_history.csv` (Workouts, Duration, Energy, Distance)
"""

from __future__ import annotations
import os
import sys
import json
import argparse
import socket
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
LOCAL_TZ = ZoneInfo("Europe/Paris")
TOKEN_FILE = BASE_DIR / "hae_token.txt"

# Target CSVs
BODY_COMP_CSV = BASE_DIR / "apple_body_composition.csv"
SLEEP_CSV = BASE_DIR / "apple_sleep.csv"
DAILY_ACT_CSV = BASE_DIR / "apple_daily_activity.csv"
MOBILITY_CSV = BASE_DIR / "apple_mobility_biomechanics.csv"
WORKOUTS_CSV = BASE_DIR / "apple_workouts_history.csv"


class McpHttpClient:
    def __init__(self, endpoint_url: str, token: str):
        self.endpoint_url = endpoint_url
        self.token = token
        self.session_id = None
        self.request_id = 1

    def initialize(self):
        """Performs MCP protocol handshake and obtains Mcp-Session-Id."""
        init_body = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "agy-intelligence-hub",
                    "version": "1.0.0",
                },
            },
        }
        self.request_id += 1

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        req = urllib.request.Request(
            self.endpoint_url,
            data=json.dumps(init_body).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                self.session_id = resp.headers.get("Mcp-Session-Id")
                resp_data = json.loads(resp.read().decode("utf-8"))
                server_info = resp_data.get("result", {}).get("serverInfo", {})
                print(f"🔗 Connected to MCP server: {server_info.get('name', 'HAE')} v{server_info.get('version', '')}")
                if self.session_id:
                    print(f"   Session ID: {self.session_id}")
                return resp_data
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="ignore")
            if e.code == 401:
                raise PermissionError("HTTP 401 Unauthorized: Invalid or expired Bearer token.")
            raise RuntimeError(f"HTTP {e.code} during initialize: {err_msg}")
        except urllib.error.URLError as e:
            raise ConnectionError(
                f"Cannot connect to {self.endpoint_url}: {e.reason}.\n"
                f"Ensure Health Auto Export is active in the foreground on your iPhone."
            )

    def call_tool(self, tool_name: str, arguments: dict) -> dict:
        """Invokes a tool on the MCP server."""
        if not self.session_id:
            self.initialize()

        req_body = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments,
            },
        }
        self.request_id += 1

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token}",
        }
        if self.session_id:
            headers["Mcp-Session-Id"] = self.session_id

        req = urllib.request.Request(
            self.endpoint_url,
            data=json.dumps(req_body).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                resp_json = json.loads(resp.read().decode("utf-8"))
                if "error" in resp_json:
                    raise RuntimeError(f"MCP Tool Error: {resp_json['error']}")
                result = resp_json.get("result", {})
                # Parse content text
                if "content" in result and isinstance(result["content"], list):
                    for item in result["content"]:
                        if item.get("type") == "text":
                            try:
                                return json.loads(item["text"])
                            except:
                                pass
                return result
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"HTTP {e.code} during tools/call: {err_msg}")


def update_body_composition(metrics_dict: dict):
    """Updates apple_body_composition.csv."""
    weight_samples = metrics_dict.get("weight_body_mass", {}).get("data", [])
    bf_samples = metrics_dict.get("body_fat_percentage", {}).get("data", [])
    lbm_samples = metrics_dict.get("lean_body_mass", {}).get("data", [])
    bmi_samples = metrics_dict.get("body_mass_index", {}).get("data", [])

    if not weight_samples and not bf_samples:
        return

    bf_map = {}
    for s in bf_samples:
        d = str(s.get("date", ""))[:10]
        val = float(s.get("qty", 0))
        bf_map[d] = round(val if val > 1.0 else val * 100, 1)

    lbm_map = {}
    for s in lbm_samples:
        d = str(s.get("date", ""))[:10]
        lbm_map[d] = round(float(s.get("qty", 0)), 1)

    bmi_map = {}
    for s in bmi_samples:
        d = str(s.get("date", ""))[:10]
        bmi_map[d] = round(float(s.get("qty", 0)), 1)

    existing_df = pd.read_csv(BODY_COMP_CSV) if BODY_COMP_CSV.exists() else pd.DataFrame()

    new_rows = []
    for s in weight_samples:
        d = str(s.get("date", ""))[:10]
        w = round(float(s.get("qty", 0)), 1)
        bf = bf_map.get(d)
        lean = lbm_map.get(d, round(w * (1 - (bf / 100.0)), 1) if bf else "")
        bmi = bmi_map.get(d, round(w / (1.83 ** 2), 1))
        new_rows.append({
            "Date": d,
            "Weight_kg": w,
            "Body_Fat_pct": bf if bf is not None else "",
            "Lean_Mass_kg": lean if lean != "" else "",
            "BMI": bmi if bmi != "" else "",
        })

    new_df = pd.DataFrame(new_rows)
    if not existing_df.empty:
        merged = pd.concat([existing_df, new_df], ignore_index=True)
    else:
        merged = new_df

    merged.drop_duplicates(subset=["Date"], keep="last", inplace=True)
    merged.sort_values(by="Date", inplace=True)
    merged.to_csv(BODY_COMP_CSV, index=False)
    latest = merged.iloc[-1]
    print(f"✅ `apple_body_composition.csv`: {len(merged)} weigh-ins (latest: {latest['Date']} @ {latest['Weight_kg']} kg, BF {latest.get('Body_Fat_pct')}%)")


def update_daily_activity(metrics_dict: dict):
    """Updates apple_daily_activity.csv."""
    steps_samples = metrics_dict.get("step_count", {}).get("data", [])
    dist_samples = metrics_dict.get("walking_running_distance", {}).get("data", [])
    energy_samples = metrics_dict.get("active_energy", {}).get("data", [])
    rhr_samples = metrics_dict.get("resting_heart_rate", {}).get("data", [])

    if not steps_samples and not energy_samples:
        return

    day_map = {}
    for s in steps_samples:
        d = str(s.get("date", ""))[:10]
        day_map.setdefault(d, {})["Steps"] = int(round(float(s.get("qty", 0))))
    for s in dist_samples:
        d = str(s.get("date", ""))[:10]
        day_map.setdefault(d, {})["Distance_km"] = round(float(s.get("qty", 0)), 2)
    for s in energy_samples:
        d = str(s.get("date", ""))[:10]
        qty = float(s.get("qty", 0))
        unit = str(s.get("unit", metrics_dict.get("active_energy", {}).get("units", ""))).lower()
        kcal = round(qty * 0.239006, 1) if "kj" in unit else round(qty, 1)
        day_map.setdefault(d, {})["Active_Energy_kcal"] = kcal
    for s in rhr_samples:
        d = str(s.get("date", ""))[:10]
        day_map.setdefault(d, {})["Resting_Heart_Rate_bpm"] = round(float(s.get("qty", 0)), 1)

    existing_df = pd.read_csv(DAILY_ACT_CSV) if DAILY_ACT_CSV.exists() else pd.DataFrame()

    new_rows = []
    for d, vals in day_map.items():
        new_rows.append({
            "Date": d,
            "Steps": vals.get("Steps", 0),
            "Distance_km": vals.get("Distance_km", 0.0),
            "Active_Energy_kcal": vals.get("Active_Energy_kcal", 0.0),
            "Resting_Heart_Rate_bpm": vals.get("Resting_Heart_Rate_bpm", ""),
        })

    new_df = pd.DataFrame(new_rows)
    if not existing_df.empty:
        merged = pd.concat([existing_df, new_df], ignore_index=True)
    else:
        merged = new_df

    merged.drop_duplicates(subset=["Date"], keep="last", inplace=True)
    merged.sort_values(by="Date", inplace=True)
    merged.to_csv(DAILY_ACT_CSV, index=False)
    latest = merged.iloc[-1]
    print(f"✅ `apple_daily_activity.csv`: {len(merged)} activity days (latest: {latest['Date']} @ {latest['Steps']} steps, {latest['Active_Energy_kcal']} kcal)")


def update_sleep(metrics_dict: dict):
    """Updates apple_sleep.csv."""
    sleep_samples = metrics_dict.get("sleep_analysis", {}).get("data", [])
    if not sleep_samples:
        return

    existing_df = pd.read_csv(SLEEP_CSV) if SLEEP_CSV.exists() else pd.DataFrame()

    new_rows = []
    for s in sleep_samples:
        d = str(s.get("date", ""))[:10]
        tot = float(s.get("totalSleep", 0) or s.get("asleep", 0))
        deep = float(s.get("deep", 0))
        rem = float(s.get("rem", 0))
        core = float(s.get("core", 0))
        awake = float(s.get("awake", 0))
        in_bed = float(s.get("inBed", 0))

        if tot == 0.0:
            tot = deep + rem + core
        if in_bed == 0.0:
            in_bed = tot + awake

        new_rows.append({
            "Date": d,
            "Total_Sleep_hrs": round(tot, 1),
            "Deep_Sleep_hrs": round(deep, 1),
            "REM_Sleep_hrs": round(rem, 1),
            "Core_Sleep_hrs": round(core, 1),
            "Awake_hrs": round(awake, 1),
            "In_Bed_hrs": round(in_bed, 1),
        })

    new_df = pd.DataFrame(new_rows)
    if not existing_df.empty:
        merged = pd.concat([existing_df, new_df], ignore_index=True)
    else:
        merged = new_df

    merged.drop_duplicates(subset=["Date"], keep="last", inplace=True)
    merged.sort_values(by="Date", inplace=True)
    merged.to_csv(SLEEP_CSV, index=False)
    latest = merged.iloc[-1]
    print(f"✅ `apple_sleep.csv`: {len(merged)} recorded nights (latest: {latest['Date']} @ {latest['Total_Sleep_hrs']}h sleep, {latest['Deep_Sleep_hrs']}h deep)")


def update_mobility(metrics_dict: dict):
    """Updates apple_mobility_biomechanics.csv."""
    speed_samples = metrics_dict.get("walking_speed", {}).get("data", [])
    step_len_samples = metrics_dict.get("walking_step_length", {}).get("data", [])
    asym_samples = metrics_dict.get("walking_asymmetry_percentage", {}).get("data", [])
    double_sup_samples = metrics_dict.get("walking_double_support_percentage", {}).get("data", [])
    flights_samples = metrics_dict.get("flights_climbed", {}).get("data", [])
    rhr_samples = metrics_dict.get("resting_heart_rate", {}).get("data", [])

    if not speed_samples and not flights_samples:
        return

    day_map = {}
    for s in speed_samples:
        d = str(s.get("date", ""))[:10]
        day_map.setdefault(d, {})["Walking_Speed_kmh"] = round(float(s.get("qty", 0)), 2)
    for s in step_len_samples:
        d = str(s.get("date", ""))[:10]
        day_map.setdefault(d, {})["Walking_Step_Length_cm"] = round(float(s.get("qty", 0)), 1)
    for s in asym_samples:
        d = str(s.get("date", ""))[:10]
        day_map.setdefault(d, {})["Walking_Asymmetry_pct"] = round(float(s.get("qty", 0)), 2)
    for s in double_sup_samples:
        d = str(s.get("date", ""))[:10]
        day_map.setdefault(d, {})["Walking_Double_Support_pct"] = round(float(s.get("qty", 0)), 1)
    for s in flights_samples:
        d = str(s.get("date", ""))[:10]
        day_map.setdefault(d, {})["Flights_Climbed"] = round(float(s.get("qty", 0)), 1)
    for s in rhr_samples:
        d = str(s.get("date", ""))[:10]
        day_map.setdefault(d, {})["Resting_Heart_Rate_bpm"] = round(float(s.get("qty", 0)), 1)

    existing_df = pd.read_csv(MOBILITY_CSV) if MOBILITY_CSV.exists() else pd.DataFrame()

    new_rows = []
    for d, vals in day_map.items():
        new_rows.append({
            "Date": d,
            "Walking_Speed_kmh": vals.get("Walking_Speed_kmh", ""),
            "Walking_Step_Length_cm": vals.get("Walking_Step_Length_cm", ""),
            "Walking_Asymmetry_pct": vals.get("Walking_Asymmetry_pct", ""),
            "Walking_Double_Support_pct": vals.get("Walking_Double_Support_pct", ""),
            "Flights_Climbed": vals.get("Flights_Climbed", ""),
            "Resting_Heart_Rate_bpm": vals.get("Resting_Heart_Rate_bpm", ""),
        })

    new_df = pd.DataFrame(new_rows)
    if not existing_df.empty:
        merged = pd.concat([existing_df, new_df], ignore_index=True)
    else:
        merged = new_df

    merged.drop_duplicates(subset=["Date"], keep="last", inplace=True)
    merged.sort_values(by="Date", inplace=True)
    merged.to_csv(MOBILITY_CSV, index=False)
    print(f"✅ `apple_mobility_biomechanics.csv`: {len(merged)} days of biomechanics data")


def update_workouts(workouts_payload: dict):
    """Updates apple_workouts_history.csv."""
    workouts_list = workouts_payload.get("data", {}).get("workouts", [])
    if not workouts_list:
        return

    existing_df = pd.read_csv(WORKOUTS_CSV) if WORKOUTS_CSV.exists() else pd.DataFrame()

    new_rows = []
    for w in workouts_list:
        st_raw = w.get("start", "")
        d = str(st_raw)[:10]
        name = w.get("name", "Workout")
        dur_sec = float(w.get("duration", 0))
        dur_min = round(dur_sec / 60.0, 1)

        # Active energy
        energy_obj = w.get("activeEnergyBurned", {})
        qty = float(energy_obj.get("qty", 0))
        unit = str(energy_obj.get("units", "")).lower()
        kcal = round(qty * 0.239006, 1) if "kj" in unit else round(qty, 1)

        # Distance
        dist_obj = w.get("distance", {})
        dist_km = round(float(dist_obj.get("qty", 0)), 2)

        new_rows.append({
            "Date": d,
            "Start_Time": st_raw,
            "Workout_Type": name,
            "Duration_min": dur_min,
            "Active_Energy_kcal": kcal,
            "Distance_km": dist_km,
            "Source": "Health Auto Export",
        })

    new_df = pd.DataFrame(new_rows)
    if not existing_df.empty:
        merged = pd.concat([existing_df, new_df], ignore_index=True)
    else:
        merged = new_df

    merged.drop_duplicates(subset=["Start_Time", "Workout_Type"], keep="last", inplace=True)
    merged.sort_values(by="Start_Time", inplace=True)
    merged.to_csv(WORKOUTS_CSV, index=False)
    print(f"✅ `apple_workouts_history.csv`: {len(merged)} workouts recorded (latest: {merged.iloc[-1]['Date']} - {merged.iloc[-1]['Workout_Type']})")


def discover_mcp_url(default_url: str) -> str:
    """Probes candidate IPs on port 9000 if default_url is not reachable."""
    candidates = []
    if "HAE_IP" in os.environ:
        candidates.append(f"http://{os.environ['HAE_IP']}:9000/mcp")
    candidates.extend([
        "http://10.10.251.25:9000/mcp",
        "http://192.168.1.163:9000/mcp",
        "http://127.0.0.1:9000/mcp",
    ])
    if default_url not in candidates:
        candidates.insert(0, default_url)

    for curl in candidates:
        try:
            host = curl.split("://")[1].split(":")[0]
            port = int(curl.split(":")[2].split("/")[0])
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.8)
            res = s.connect_ex((host, port))
            s.close()
            if res == 0:
                return curl
        except Exception:
            pass
    return default_url


def main():
    parser = argparse.ArgumentParser(description="Health Auto Export MCP Live Sync")
    parser.add_argument("--url", default="", help="MCP endpoint URL (auto-detected if omitted)")
    parser.add_argument("--token", default=os.getenv("HAE_MCP_TOKEN", ""), help="Bearer token from Server screen")
    parser.add_argument("--days", type=int, default=60, help="Days of history to fetch (default: 60)")
    parser.add_argument("--push", action="store_true", help="Push to Google Drive Cloud Hub after sync")
    args = parser.parse_args()

    token = args.token.strip()
    if not token and TOKEN_FILE.exists():
        token = TOKEN_FILE.read_text().strip()

    if not token:
        print("\n⚠️ No Bearer token provided.")
        print("   Run: python sync_health_mcp.py --token <YOUR_TOKEN>\n")
        sys.exit(1)

    # Save valid token
    TOKEN_FILE.write_text(token)

    endpoint_url = discover_mcp_url(args.url or "http://10.10.251.25:9000/mcp")

    end_dt = datetime.now(LOCAL_TZ)
    start_dt = end_dt - timedelta(days=args.days)
    start_str = start_dt.strftime("%Y-%m-%d")
    end_str = end_dt.strftime("%Y-%m-%d")

    print(f"🔌 Connecting to Health Auto Export MCP: {endpoint_url}")
    print(f"📅 Syncing date range: {start_str} -> {end_str} ({args.days} days)")

    client = McpHttpClient(endpoint_url, token)
    client.initialize()

    # 1. Fetch Health Metrics
    print("📊 Fetching health metrics (body comp, activity, sleep, biomechanics)...")
    metrics_raw = client.call_tool("get_health_metrics", {
        "start": start_str,
        "end": end_str,
        "interval": "days",
        "aggregate": True,
    })

    metrics_list = metrics_raw.get("data", {}).get("metrics", [])
    metrics_dict = {m.get("name"): m for m in metrics_list}
    print(f"   Received {len(metrics_dict)} metric streams.")

    update_body_composition(metrics_dict)
    update_daily_activity(metrics_dict)
    update_sleep(metrics_dict)
    update_mobility(metrics_dict)

    # 2. Fetch Workouts
    print("🏋️ Fetching workout history...")
    workouts_raw = client.call_tool("get_workouts", {
        "start": start_str,
        "end": end_str,
        "includeMetadata": True,
        "includeRoutes": False,
    })
    update_workouts(workouts_raw)

    print("\n✨ Live Health Sync Complete!")

    # 3. Optional Google Drive Sync
    if args.push:
        print("\n☁️ Triggering Google Drive cloud sync (`drive_sync.py push`)...")
        import subprocess
        subprocess.run([sys.executable, str(BASE_DIR / "drive_sync.py"), "push"])


if __name__ == "__main__":
    main()
