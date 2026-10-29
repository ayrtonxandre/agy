#!/usr/bin/env python3
"""
================================================================================
ATHX 2027 — Official Garmin Connect Personal API Client
================================================================================

Implements the official Garmin Connect Developer Program Personal API contract:
  - Base URL: https://personal.connectapi.garmin.com
  - Auth: ApiKey exchange for a 24-hour Bearer token
  - Automatic token caching and expiration renewal in `garmin_tokens/personal_token.json`
  - Standardized microservice calls:
      * activitylist-service
      * activity-service
      * download-service (raw FIT files)
      * sleep-service
      * hrv-service
      * usersummary-service (up to 365 days)
      * wellness-service
      * biometric-service
================================================================================
"""

from __future__ import annotations
import os
import sys
import json
import time
import base64
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Any, Optional


class GarminPersonalClient:
    """Official Garmin Connect Personal API Client with automatic token management."""

    BASE_URL = "https://personal.connectapi.garmin.com"
    TOKEN_ENDPOINT = f"{BASE_URL}/personalapitoken-service/personal-api/personal-api-key/token"

    def __init__(
        self,
        api_key: Optional[str] = None,
        tokens_dir: Optional[Path | str] = None,
        timeout: int = 20,
    ):
        self.tokens_dir = Path(tokens_dir) if tokens_dir else Path(__file__).resolve().parent / "garmin_tokens"
        self.tokens_dir.mkdir(parents=True, exist_ok=True)
        self.token_file = self.tokens_dir / "personal_token.json"
        self.timeout = timeout

        self.api_key = api_key or os.getenv("GARMIN_PERSONAL_API_KEY")
        if not self.api_key:
            # Attempt to read from .env file if in root
            env_path = Path(__file__).resolve().parent / ".env"
            if env_path.exists():
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "GARMIN_PERSONAL_API_KEY=" in line:
                            self.api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                            break

        self._cached_token: Optional[str] = None
        self._expires_at: float = 0.0
        self._load_cached_token()

    # ==========================================================================
    # AUTHENTICATION & TOKEN LIFECYCLE
    # ==========================================================================

    def _load_cached_token(self) -> None:
        """Loads cached token from disk if present and not expired."""
        if not self.token_file.exists():
            return
        try:
            with open(self.token_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            token = data.get("token")
            exp = float(data.get("expires_at", 0))
            if token and exp > (time.time() + 180):  # Valid for at least 3 more minutes
                self._cached_token = token
                self._expires_at = exp
        except Exception:
            pass

    def get_token(self, force_refresh: bool = False) -> str:
        """Retrieves a valid Bearer token, refreshing via ApiKey if expired."""
        if not force_refresh and self._cached_token and (self._expires_at - time.time() > 180):
            return self._cached_token

        if not self.api_key:
            raise ValueError(
                "Garmin Personal API Key is missing. Set GARMIN_PERSONAL_API_KEY in your environment or .env"
            )

        req = urllib.request.Request(
            self.TOKEN_ENDPOINT,
            method="POST",
            headers={
                "Authorization": f"ApiKey {self.api_key}",
                "User-Agent": "ATHX-Personal-API-Client/1.0",
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                token_str = resp.read().decode("utf-8").strip()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Garmin Personal API Token Exchange failed (HTTP {e.code}): {err_body}") from e
        except Exception as e:
            raise RuntimeError(f"Garmin Personal API Token Request failed: {e}") from e

        # Decode JWT expiration safely without external jwt dependency
        try:
            parts = token_str.split(".")
            if len(parts) >= 2:
                payload_b64 = parts[1] + "=" * (-len(parts[1]) % 4)
                payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode("utf-8"))
                issued_at = payload.get("iat", int(time.time()))
                expires_at = payload.get("exp", int(time.time() + 86400))
                scopes = payload.get("scope", [])
            else:
                issued_at = int(time.time())
                expires_at = int(time.time() + 86400)
                scopes = []
        except Exception:
            issued_at = int(time.time())
            expires_at = int(time.time() + 86400)
            scopes = []

        cache_data = {
            "token": token_str,
            "issued_at": issued_at,
            "expires_at": expires_at,
            "scopes": scopes,
            "updated_at": datetime.now(timezone.utc).isoformat() if "timezone" in globals() else datetime.now().isoformat(),
        }

        with open(self.token_file, "w", encoding="utf-8") as f:
            json.dump(cache_data, f, indent=2)

        self._cached_token = token_str
        self._expires_at = float(expires_at)
        return self._cached_token

    def _request(self, path: str, params: Optional[dict[str, Any]] = None) -> Any:
        """Executes an authenticated GET request against Garmin Personal API."""
        token = self.get_token()
        query = ""
        if params:
            clean_params = {k: v for k, v in params.items() if v is not None}
            if clean_params:
                query = "?" + urllib.parse.urlencode(clean_params)

        url = f"{self.BASE_URL}{path}{query}"
        req = urllib.request.Request(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
                "User-Agent": "ATHX-Personal-API-Client/1.0",
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                if resp.status == 204:
                    return None
                data = resp.read()
                if not data:
                    return None
                return json.loads(data.decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 401:
                # Token might have been revoked early, force refresh once
                token = self.get_token(force_refresh=True)
                req.headers["Authorization"] = f"Bearer {token}"
                with urllib.request.urlopen(req, timeout=self.timeout) as retry_resp:
                    if retry_resp.status == 204:
                        return None
                    return json.loads(retry_resp.read().decode("utf-8"))
            elif e.code == 204 or e.code == 404:
                return None
            err_body = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Garmin API call to {path} failed (HTTP {e.code}): {err_body}") from e

    # ==========================================================================
    # 1. ACTIVITIES & WORKOUTS
    # ==========================================================================

    def search_activities(
        self,
        start: int = 0,
        limit: int = 20,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        activity_type: Optional[str] = None,
    ) -> list[dict]:
        """Searches user activities. Returns list of SummarizedActivityDTO."""
        params: dict[str, Any] = {"start": start, "limit": limit}
        if start_date:
            params["startDate"] = start_date
        if end_date:
            params["endDate"] = end_date
        if activity_type:
            params["activityType"] = activity_type

        res = self._request("/activitylist-service/activities/search/activities", params)
        return res if isinstance(res, list) else []

    def get_activity_details(self, activity_id: int | str) -> Optional[dict]:
        """Retrieves deep activity details and metrics (ActivitySummaryDTO)."""
        return self._request(f"/activity-service/activity/{activity_id}")

    def get_activity_workouts(self, activity_id: int | str) -> list[dict]:
        """Retrieves structured workout steps performed during activity."""
        res = self._request(f"/activity-service/activity/{activity_id}/workouts")
        return res if isinstance(res, list) else []

    def download_activity_fit(self, activity_id: int | str, dest_path: Path | str) -> Path:
        """Downloads original raw activity file (.zip containing .fit)."""
        token = self.get_token()
        url = f"{self.BASE_URL}/download-service/files/activity/{activity_id}"
        req = urllib.request.Request(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/x-zip-compressed, application/octet-stream",
                "User-Agent": "ATHX-Personal-API-Client/1.0",
            },
        )
        dest = Path(dest_path)
        dest.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(req, timeout=self.timeout * 2) as resp:
            with open(dest, "wb") as out_f:
                out_f.write(resp.read())
        return dest

    # ==========================================================================
    # 2. SLEEP & RECOVERY
    # ==========================================================================

    def get_daily_sleep(self, calendar_date: str | date) -> Optional[dict]:
        """Retrieves daily sleep breakdown for a specific date (DailySleepDTO)."""
        d_str = calendar_date.strftime("%Y-%m-%d") if isinstance(calendar_date, date) else calendar_date
        return self._request("/sleep-service/sleep/dailySleep", {"date": d_str})

    def get_sleep_range(self, start_date: str | date, end_date: str | date) -> list[dict]:
        """Retrieves sleep summaries for a date range (up to 31 days)."""
        s_str = start_date.strftime("%Y-%m-%d") if isinstance(start_date, date) else start_date
        e_str = end_date.strftime("%Y-%m-%d") if isinstance(end_date, date) else end_date
        res = self._request(
            "/sleep-service/sleep/dailySleepSummariesByDate",
            {"startDate": s_str, "endDate": e_str},
        )
        return res if isinstance(res, list) else []

    # ==========================================================================
    # 3. HEART RATE VARIABILITY (HRV)
    # ==========================================================================

    def get_daily_hrv(self, calendar_date: str | date) -> Optional[dict]:
        """Retrieves overnight HRV data for a specific date (HrvSummaryDTO)."""
        d_str = calendar_date.strftime("%Y-%m-%d") if isinstance(calendar_date, date) else calendar_date
        return self._request(f"/hrv-service/hrv/{d_str}")

    def get_hrv_range(self, from_date: str | date, to_date: str | date) -> list[dict]:
        """Retrieves overnight HRV summaries across date range."""
        s_str = from_date.strftime("%Y-%m-%d") if isinstance(from_date, date) else from_date
        e_str = to_date.strftime("%Y-%m-%d") if isinstance(to_date, date) else to_date
        res = self._request(f"/hrv-service/hrv/daily/{s_str}/{e_str}")
        if isinstance(res, dict) and "hrvSummaries" in res:
            return res.get("hrvSummaries", [])
        return res if isinstance(res, list) else []

    # ==========================================================================
    # 4. WELLNESS & BODY BATTERY
    # ==========================================================================

    def get_daily_heart_rate(self, calendar_date: str | date) -> Optional[dict]:
        """Retrieves daily heart rate values and resting HR."""
        d_str = calendar_date.strftime("%Y-%m-%d") if isinstance(calendar_date, date) else calendar_date
        return self._request("/wellness-service/wellness/dailyHeartRate", {"date": d_str})

    def get_body_battery_reports(self, start_date: str | date, end_date: str | date) -> list[dict]:
        """Retrieves daily Body Battery charge/drain reports (up to 31 days)."""
        s_str = start_date.strftime("%Y-%m-%d") if isinstance(start_date, date) else start_date
        e_str = end_date.strftime("%Y-%m-%d") if isinstance(end_date, date) else end_date
        res = self._request(
            "/wellness-service/wellness/bodyBattery/reports/daily",
            {"startDate": s_str, "endDate": e_str},
        )
        return res if isinstance(res, list) else []

    def get_spo2_acclimation(self, calendar_date: str | date) -> Optional[dict]:
        """Retrieves daily SpO2 readings."""
        d_str = calendar_date.strftime("%Y-%m-%d") if isinstance(calendar_date, date) else calendar_date
        return self._request(f"/wellness-service/wellness/daily/spo2acclimation/{d_str}")

    # ==========================================================================
    # 5. LONGITUDINAL DAILY SUMMARIES (UP TO 365 DAYS)
    # ==========================================================================

    def get_daily_summaries(self, start_date: str | date, end_date: str | date) -> list[dict]:
        """Retrieves user daily wellness summaries (steps, stress, body battery, resting HR) up to 1 year."""
        s_str = start_date.strftime("%Y-%m-%d") if isinstance(start_date, date) else start_date
        e_str = end_date.strftime("%Y-%m-%d") if isinstance(end_date, date) else end_date
        res = self._request(
            "/usersummary-service/v2/dailysummaries",
            {"startDate": s_str, "endDate": e_str},
        )
        if isinstance(res, dict) and "data" in res:
            return res.get("data", [])
        return res if isinstance(res, list) else []

    # ==========================================================================
    # 6. BIOMETRICS & ZONES
    # ==========================================================================

    def get_heart_rate_zones(self) -> Optional[dict]:
        """Retrieves user's configured heart rate zones."""
        return self._request("/biometric-service/heartRateZones/v2")

    def get_fitness_age(self, calendar_date: str | date) -> Optional[dict]:
        """Retrieves Garmin Fitness Age as of target date."""
        d_str = calendar_date.strftime("%Y-%m-%d") if isinstance(calendar_date, date) else calendar_date
        return self._request(f"/fitnessage-service/fitnessage/v2/{d_str}")


# Self-test CLI
if __name__ == "__main__":
    print("🚀 Initializing GarminPersonalClient...")
    client = GarminPersonalClient()
    try:
        tok = client.get_token()
        print(f"✔ Token active! Expires at: {time.ctime(client._expires_at)}")
        acts = client.search_activities(start=0, limit=3)
        print(f"✔ Successfully queried {len(acts)} activities from Garmin Connect!")
        for a in acts:
            print(f"   • [{a.get('activityId')}] {a.get('startTimeLocal')}: {a.get('activityName')}")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
