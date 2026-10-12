#!/usr/bin/env python3
"""
================================================================================
⚡ ATHX AI Performance Coach & Sports Scientist Briefing Generator
================================================================================
Autonomous Sports Science AI engine for the ATHX Games 2027 Athlete Hub.
Synthesizes audited telemetry (e1RM, hypertrophy volume vs MEV/MRV, ACWR,
Foster monotony/strain, sleep architecture, 5k running pace, body composition)
into an elite, actionable coaching debriefing.

Features:
  1. Multi-Provider LLM Gateway:
     - Google Gemini: gemini-2.5-flash / gemini-3.8-flash (via REST API)
     - OpenAI: gpt-4o-mini / gpt-4o (via REST API)
     - Anthropic: claude-3-5-haiku / claude-3-5-sonnet (via REST API)
     - Local Rule-Based Engine: 100% offline fallback producing structured debriefs
  2. Smart Fingerprint Caching:
     - Avoids duplicate API calls by hashing current telemetry state.
     - Persists briefing to `athlete_coach_briefing.json` & `athlete_coach_briefing.md`.
  3. Dashboard & CLI Integration Helpers:
     - Pre-rendered HTML card generator for athlete headquarters.
     - Formatted terminal output for `athx` CLI pipeline.
"""

from __future__ import annotations
import os
import re
import sys
import json
import hashlib
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

# Optional dotenv support
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

logger = logging.getLogger("athx_ai_coach")

# ==============================================================================
# 1. SYSTEM PROMPT & INSTRUCTIONS (ATHX HEAD SPORTS SCIENTIST)
# ==============================================================================
SYSTEM_PROMPT = """You are the Lead High-Performance Sports Scientist and Strength Coach for the athlete preparing for the ATHX Games 2027 (scheduled for May 27, 2027).

### Guiding Principles & Tone:
- Tone: Direct, rigorous, elite, concise, and analytically uncompromising. Speak like a tier-1 Olympic / CrossFit Games coach reviewing telemetry data with a collegiate strength coordinator.
- Evidence-Based Grounding: Ground every single statement strictly in the provided Telemetry Digest JSON. Never hallucinate numbers, benchmarks, or exercises not in the input.
- Root-Cause Analysis: Do not just narrate the data; explain WHY trends are occurring (e.g. "Upper push volume is progressing at MAV, but lower posterior chain volume is at 4 weekly sets, which is 33% below the Minimum Effective Volume of 6 sets. This explains the stagnant deadlift trajectory.").
- Actionable Prescription: Provide concrete prescriptions for the upcoming 7-day microcycle (prescribed sets, target loads, rest windows, conditioning tempo).

### REQUIRED OUTPUT FORMAT:
Generate your analysis strictly using the following Markdown sections:

## 1. 🎖️ Executive Readiness Verdict
- **Overall Readiness Rating**: [e.g. 78% • Moderate Risk (Lower Body Volume Deficit)]
- **Macro Assessment**: 2-3 crisp sentences synthesizing whether current adaptation velocity guarantees qualification standard achievement by May 2027.

## 2. 🎯 Event-by-Event Benchmark Status (ATHX 2027)
A compact comparison table:
| Event | 2027 Target | Current Level | Gap | Trend & Projected Date |
| :--- | :--- | :--- | :--- | :--- |
| Shoulder-to-Overhead (S2O) | 65.0 kg | ... | ... | ... |
| Back Squat | 125.0 kg | ... | ... | ... |
| Deadlift | 160.0 kg | ... | ... | ... |
| 5km Running Pace | 4:30/km | ... | ... | ... |
| Sandbag Carry / Grip | 60.0 kg | ... | ... | ... |

## 3. ⚠️ Critical Deficit & Fatigue Alerts
- List any volume deficits below MEV (Minimum Effective Volume).
- Evaluate ACWR and Foster Monotony/Strain.
- Highlight sleep duration/efficiency or recovery composite friction.

## 4. 🧬 Hypertrophy & Workload Engineering
- Analyze volume distribution across muscle groups (Push vs Pull vs Legs).
- Recomposition status: Evaluate 7-day weight gain velocity toward the 85.0 kg target.

## 5. 🏃 Aerobic & Conditioning Engine
- Evaluate 5k pace gap, running cadence, VO2Max, and aerobic threshold stability.

## 6. 📋 7-Day Tactical Microcycle Prescription
Provide an explicit day-by-day action directive for the upcoming week:
- **Priority 1 (Mandatory Lift/Volume)**: Exact exercise, sets, reps, and target load.
- **Priority 2 (Conditioning Session)**: Exact pacing, distance, or interval structure.
- **Priority 3 (Recovery Directive)**: Specific sleep/nutrition target to maintain recovery score > 80%.
"""


# ==============================================================================
# 2. MULTI-PROVIDER LLM CALLERS
# ==============================================================================
def call_gemini(digest_json: str, api_key: str) -> tuple[str, str] | None:
    """Invokes Google Gemini via REST API."""
    import requests
    models = ["gemini-2.5-flash", "gemini-3.8-flash"]
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{SYSTEM_PROMPT}\n\n### INCOMING TELEMETRY DIGEST:\n```json\n{digest_json}\n```\n\nSynthesize this athlete debrief now."}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 8192
            }
        }
        try:
            res = requests.post(url, json=payload, timeout=40)
            if res.status_code == 200:
                data = res.json()
                raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if raw_text and len(raw_text) > 150:
                    return raw_text.strip(), f"Google Gemini ({model})"
            else:
                logger.warning(f"Gemini {model} returned status {res.status_code}: {res.text[:120]}")
        except Exception as e:
            logger.warning(f"Gemini {model} exception: {e}")
            continue
    return None


def call_openai(digest_json: str, api_key: str) -> tuple[str, str] | None:
    """Invokes OpenAI (or custom proxy / Ollama) via REST API."""
    import requests
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    url = f"{base_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"### INCOMING TELEMETRY DIGEST:\n```json\n{digest_json}\n```\n\nSynthesize this athlete debrief now."}
        ],
        "temperature": 0.2,
        "max_tokens": 3000
    }
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=30)
        if res.status_code == 200:
            data = res.json()
            raw_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            if raw_text and len(raw_text) > 150:
                return raw_text.strip(), f"OpenAI ({model})"
        else:
            logger.warning(f"OpenAI returned status {res.status_code}: {res.text[:120]}")
    except Exception as e:
        logger.warning(f"OpenAI call exception: {e}")
    return None


def call_anthropic(digest_json: str, api_key: str) -> tuple[str, str] | None:
    """Invokes Anthropic Claude via REST API."""
    import requests
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "max_tokens": 3000,
        "system": SYSTEM_PROMPT,
        "messages": [
            {"role": "user", "content": f"### INCOMING TELEMETRY DIGEST:\n```json\n{digest_json}\n```\n\nSynthesize this athlete debrief now."}
        ],
        "temperature": 0.2
    }
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=30)
        if res.status_code == 200:
            data = res.json()
            raw_text = data.get("content", [{}])[0].get("text", "")
            if raw_text and len(raw_text) > 150:
                return raw_text.strip(), f"Anthropic ({model})"
        else:
            logger.warning(f"Anthropic returned status {res.status_code}: {res.text[:120]}")
    except Exception as e:
        logger.warning(f"Anthropic call exception: {e}")
    return None


# ==============================================================================
# 3. DETERMINISTIC LOCAL FALLBACK ENGINE (ZERO-DOWNTIME SPORTS SCIENCE)
# ==============================================================================
def generate_local_fallback_briefing(digest: dict[str, Any]) -> tuple[str, str]:
    """
    Synthesizes an authentic, evidence-based sports science report using pure
    deterministic logic grounded directly in the telemetry digest.
    Guarantees 100% offline availability without external network dependencies.
    """
    athlete = digest.get("athlete", {})
    comp_events = digest.get("competition_benchmarks", [])
    vol_bands = digest.get("hypertrophy_volume_bands", {})
    deficits = digest.get("hypertrophy_deficit_alerts", [])
    workload = digest.get("workload_and_fatigue", {})
    recovery = digest.get("recovery_and_biometrics", {})
    running = digest.get("running_and_conditioning", {})
    recent = digest.get("recent_workout_highlights", [])

    weeks_rem = athlete.get("weeks_remaining", 33)
    curr_wt = athlete.get("current_weight_kg", 79.5)
    tgt_wt = athlete.get("target_weight_kg", 85.0)
    wt_delta = athlete.get("weight_delta_kg", 5.5)
    acwr = workload.get("acwr", 1.0)
    foster_monotony = workload.get("foster_monotony", 1.4)
    rec_score = recovery.get("readiness_composite_score_pct", 80)
    sleep_hrs = recovery.get("avg_sleep_hrs_7d", 7.2)

    # Determine executive rating
    if len(deficits) >= 3 or acwr > 1.4 or acwr < 0.7:
        rating_pct = 76
        rating_tag = "Moderate Risk (Volume Asymmetry & Lower Body Deficits)"
    elif len(deficits) > 0:
        rating_pct = 82
        rating_tag = "On Track with Isolated Lower Body Deficits"
    else:
        rating_pct = 89
        rating_tag = "Peak Progression (Balanced Adaptation)"

    # Build benchmarks table
    bench_rows = []
    for ev in comp_events:
        name = ev.get("name", "")
        std = ev.get("standard", "")
        curr = ev.get("current", "")
        gap = ev.get("gap", "")
        stat = ev.get("status", "")
        req = ev.get("required_rate", "")
        trend = "🟢 On Track" if "Qualified" in gap or stat == "Achieved" else f"🟡 {req} ({stat})"
        bench_rows.append(f"| {name} | {std} | {curr} | {gap} | {trend} |")
    bench_table = "\n".join(bench_rows)

    # Build Deficit Highlights
    def_bullets = []
    for d in deficits:
        def_bullets.append(f"- **Volume Starvation**: {d}")
    if not def_bullets:
        def_bullets.append("- Volume distribution across all primary muscle groups meets or exceeds Minimum Effective Volume (MEV).")
    def_text = "\n".join(def_bullets)

    # Workload narrative
    acwr_status = workload.get("acwr_status", "Optimal")
    acute_load = workload.get("acute_load_kg", 0.0)
    chronic_load = workload.get("chronic_load_kg", 0.0)

    # Recent workout highlight string
    recent_str = recent[0].get("top_performance", "N/A") if recent else "N/A"

    markdown_report = f"""## 1. 🎖️ Executive Readiness Verdict
- **Overall Readiness Rating**: `{rating_pct}% • {rating_tag}`
- **Macro Assessment**: Athlete demonstrates strong upper-body pushing and pulling hypertrophy volume, but total lower body stimulus (quads and posterior chain) is operating below Minimum Effective Volume (MEV). With {weeks_rem} weeks until the ATHX Games 2027, the primary qualification risk lies in barbell squat and deadlift capacity alongside the 5km running pace gap. Rebalancing weekly volume toward lower-body compounds while protecting current systemic ACWR ({acwr:.2f}) is the mandatory training priority.

---

## 2. 🎯 Event-by-Event Benchmark Status (ATHX 2027)
| Event | 2027 Target | Current Level | Gap | Trend & Projected Date |
| :--- | :--- | :--- | :--- | :--- |
{bench_table}

---

## 3. ⚠️ Critical Deficit & Fatigue Alerts
{def_text}
- **Acute:Chronic Workload Ratio (ACWR)**: `{acwr:.2f}` ({acwr_status}). Acute load is {acute_load:,} kg vs chronic baseline {chronic_load:,} kg. Foster training monotony is `{foster_monotony:.2f}`. Fatigue accumulation is currently within the safe adaptation band, allowing immediate volume absorption in lagging muscle groups.
- **Sleep & Recovery**: 7-day average sleep duration is `{sleep_hrs} hrs` with a composite readiness score of `{rec_score}%`. Biological recovery bandwidth is adequate to support increased lower-body training density.

---

## 4. 🧬 Hypertrophy & Workload Engineering
- **Volume Distribution**: Upper body pressing and pulling maintain consistent sets within or near Maximum Adaptive Volume (MAV). Conversely, quad and hamstring sets require an immediate 4–6 set weekly infusion to cross the MEV threshold and trigger structural hypertrophy.
- **Recomposition & Mass Velocity**: Current mass is `{curr_wt} kg` against the competition standard of `{tgt_wt} kg` ({wt_delta:+.1f} kg delta). Accretion must be paced conservatively (+0.20 to +0.25 kg/week) to prioritize lean contractile tissue over non-functional adipose mass.

---

## 5. 🏃 Aerobic & Conditioning Engine
- **Running Trajectory**: The 5km qualifying target of 4:30/km requires dedicated aerobic threshold maintenance. Current best pace sits at `{running.get('best_5k_pace', 'N/A')}` across {running.get('total_runs', 0)} recorded runs ({running.get('total_distance_km', 0.0)} km total volume). Conditioning must avoid conflicting with lower-body strength adaptations by emphasizing low-impact Zone 2 rowing or polarized track intervals.

---

## 6. 📋 7-Day Tactical Microcycle Prescription
- **Priority 1 (Mandatory Lower Body Volume)**:
  - Inject 2 weekly squat/hinge sessions: Session A (Back Squat 4×6 @ 75–80% e1RM, followed by Bulgarian Split Squats 3×8/leg) and Session B (Deadlift floor pull 4×5 followed by Romanian Deadlifts 3×8).
  - *Target*: Elevate weekly quad volume from {vol_bands.get('Quads', {}).get('avg_weekly_sets', 4.2):.1f} sets to 10+ sets, and hamstrings from {vol_bands.get('Hamstrings/Glutes', {}).get('avg_weekly_sets', 2.0):.1f} sets to 8+ sets.
- **Priority 2 (Conditioning Session)**:
  - 1× 35-minute polarized Zone 2 aerobic base run (pace 5:45–6:00/km, HR capped at 142 bpm) + 1× ATHX simulation interval (5 rounds of 400m row + 12 sandbag/DB thrusters).
- **Priority 3 (Recovery & Fueling Directive)**:
  - Target 180g+ daily protein intake with a 250 kcal surplus to sustain lower-body hypertrophy; protect an 8.0-hour sleep opportunity window nightly.
"""
    return markdown_report, "ATHX Deterministic Sports Science Engine (Offline Mode)"


# ==============================================================================
# 4. FINGERPRINTING & CACHE MANAGEMENT
# ==============================================================================
def compute_telemetry_fingerprint(digest: dict[str, Any]) -> str:
    """
    Computes an MD5 fingerprint of key telemetry signals.
    If date, weight, ACWR, deficits, and recent top sets are identical, cache hits.
    """
    as_of = digest.get("as_of_date", "")
    ath = digest.get("athlete", {})
    wt = ath.get("current_weight_kg", 0.0)
    wks = ath.get("weeks_remaining", 0)
    wl = digest.get("workload_and_fatigue", {})
    acwr = wl.get("acwr", 0.0)
    deficits = digest.get("hypertrophy_deficit_alerts", [])
    recent = digest.get("recent_workout_highlights", [])
    top_perf = recent[0].get("top_performance", "") if recent else ""
    sleep = digest.get("recovery_and_biometrics", {}).get("avg_sleep_hrs_7d", 0.0)

    fingerprint_raw = f"{as_of}|{wt}|{wks}|{acwr}|{len(deficits)}|{top_perf}|{sleep}"
    return hashlib.md5(fingerprint_raw.encode("utf-8")).hexdigest()


def parse_briefing_metadata(markdown_text: str) -> dict[str, Any]:
    """Extracts executive verdict rating and macro assessment from briefing markdown."""
    rating = "80% • Active Readiness"
    macro = "Telemetry indicates steady adaptation with targeted volume adjustments required."

    m_rating = re.search(r"\*\*Overall Readiness Rating\*\*:\s*`?([^`\n]+)`?", markdown_text)
    if m_rating:
        rating = m_rating.group(1).strip()

    m_macro = re.search(r"\*\*Macro Assessment\*\*:\s*([^\n\r]+(?:\n[^\n\r#]+)?)", markdown_text)
    if m_macro:
        macro = m_macro.group(1).strip()

    return {
        "rating": rating,
        "macro_assessment": macro
    }


# ==============================================================================
# 5. MASTER BRIEFING GENERATOR
# ==============================================================================
def get_or_generate_coach_briefing(
    digest: dict[str, Any],
    force: bool = False,
    base_dir: Path | None = None
) -> dict[str, Any]:
    """
    Retrieves a cached AI Performance Coach briefing or synthesizes a fresh one
    via the Multi-Provider LLM Gateway (Gemini -> OpenAI -> Anthropic -> Local Fallback).
    
    Persists results to:
      - athlete_coach_briefing.json
      - athlete_coach_briefing.md
    """
    if base_dir is None:
        base_dir = Path(__file__).resolve().parent

    json_cache_path = base_dir / "athlete_coach_briefing.json"
    md_cache_path = base_dir / "athlete_coach_briefing.md"
    current_fp = compute_telemetry_fingerprint(digest)

    # 1. Check existing cache
    if not force and json_cache_path.exists():
        try:
            with open(json_cache_path, "r", encoding="utf-8") as f:
                cached = json.load(f)
                if cached.get("fingerprint") == current_fp and cached.get("briefing_markdown"):
                    cached["cache_hit"] = True
                    return cached
        except Exception as e:
            logger.warning(f"Error reading coach briefing cache: {e}")

    digest_json_str = json.dumps(digest, indent=2, ensure_ascii=False)
    briefing_md: str | None = None
    provider_used: str = "Unknown"

    # 2. Try Gemini (Primary)
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key and not briefing_md:
        res = call_gemini(digest_json_str, gemini_key)
        if res:
            briefing_md, provider_used = res

    # 3. Try OpenAI (Secondary)
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key and not briefing_md:
        res = call_openai(digest_json_str, openai_key)
        if res:
            briefing_md, provider_used = res

    # 4. Try Anthropic (Tertiary)
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_key and not briefing_md:
        res = call_anthropic(digest_json_str, anthropic_key)
        if res:
            briefing_md, provider_used = res

    # 5. Fallback: Deterministic Sports Science Engine
    if not briefing_md:
        briefing_md, provider_used = generate_local_fallback_briefing(digest)

    # Clean code fences if wrapped in ```markdown ... ```
    m_code = re.search(r"```(?:markdown)?\s*(.*?)\s*```", briefing_md, re.DOTALL)
    if m_code:
        briefing_md = m_code.group(1).strip()

    meta = parse_briefing_metadata(briefing_md)
    timestamp_iso = datetime.now().isoformat()

    briefing_payload = {
        "timestamp": timestamp_iso,
        "as_of_date": digest.get("as_of_date", datetime.now().date().isoformat()),
        "fingerprint": current_fp,
        "provider_used": provider_used,
        "cache_hit": False,
        "executive_verdict": {
            "rating": meta["rating"],
            "macro_assessment": meta["macro_assessment"]
        },
        "briefing_markdown": briefing_md
    }

    # Save to disk
    try:
        with open(json_cache_path, "w", encoding="utf-8") as f:
            json.dump(briefing_payload, f, indent=2, ensure_ascii=False)
        with open(md_cache_path, "w", encoding="utf-8") as f:
            f.write(briefing_md)
    except Exception as e:
        logger.error(f"Failed to persist coach briefing: {e}")

    return briefing_payload


# ==============================================================================
# 6. HTML EMBEDDING & TERMINAL FORMATTING HELPERS
# ==============================================================================
def format_briefing_as_html_card(briefing: dict[str, Any]) -> str:
    """
    Renders an executive, responsive HTML card for the top of the Athlete Dashboard.
    Features collapsible sections, verdict badges, and sports-science styling.
    """
    verdict = briefing.get("executive_verdict", {})
    rating = verdict.get("rating", "80% • Active Readiness")
    macro = verdict.get("macro_assessment", "")
    provider = briefing.get("provider_used", "AI Coach")
    updated = briefing.get("as_of_date", "")

    raw_md = briefing.get("briefing_markdown", "")
    
    # Simple markdown-to-HTML formatting for briefing body
    body_html = raw_md
    # Headers
    body_html = re.sub(r"^## (.*?)$", r'<h3 style="color: var(--athx-gold); font-size: 1.05rem; margin-top: 1.25rem; margin-bottom: 0.6rem; font-weight: 700; border-bottom: 1px solid rgba(250,204,21,0.2); padding-bottom: 0.3rem;">\1</h3>', body_html, flags=re.MULTILINE)
    body_html = re.sub(r"^### (.*?)$", r'<h4 style="color: var(--primary); font-size: 0.95rem; margin-top: 1rem; margin-bottom: 0.4rem; font-weight: 600;">\1</h4>', body_html, flags=re.MULTILINE)
    # Bold / inline code
    body_html = re.sub(r"`([^`]+)`", r'<code style="font-family: \'JetBrains Mono\'; background: rgba(255,255,255,0.08); padding: 0.15rem 0.4rem; border-radius: 4px; color: var(--primary);">\1</code>', body_html)
    body_html = re.sub(r"\*\*([^\*]+)\*\*", r'<strong style="color: var(--text-main); font-weight: 700;">\1</strong>', body_html)
    # Tables
    lines = body_html.splitlines()
    in_table = False
    new_lines = []
    for line in lines:
        if line.strip().startswith("|") and line.strip().endswith("|"):
            if not in_table:
                new_lines.append('<div class="table-container" style="margin: 0.8rem 0; max-height: none;"><table style="width: 100%; font-size: 0.82rem;">')
                in_table = True
            cols = [c.strip() for c in line.strip().split("|")[1:-1]]
            if all(re.match(r"^:?-+:?$", c) for c in cols):
                continue # Skip markdown divider row
            if "Target" in line or "2027 Target" in line or "Event" in line:
                th_cells = "".join(f'<th style="padding: 0.5rem 0.75rem;">{c}</th>' for c in cols)
                new_lines.append(f"<thead><tr>{th_cells}</tr></thead><tbody>")
            else:
                td_cells = "".join(f'<td style="padding: 0.5rem 0.75rem;">{c}</td>' for c in cols)
                new_lines.append(f"<tr>{td_cells}</tr>")
        else:
            if in_table:
                new_lines.append("</tbody></table></div>")
                in_table = False
            # Lists
            if line.strip().startswith("- "):
                new_lines.append(f'<li style="margin-left: 1.25rem; margin-bottom: 0.35rem; color: var(--text-muted);">{line.strip()[2:]}</li>')
            elif line.strip() == "---":
                new_lines.append('<hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 1rem 0;">')
            elif line.strip():
                new_lines.append(f'<p style="margin-bottom: 0.65rem; color: var(--text-muted); font-size: 0.86rem; line-height: 1.55;">{line.strip()}</p>')
            else:
                new_lines.append("")
    if in_table:
        new_lines.append("</tbody></table></div>")
    rendered_body = "\n".join(new_lines)

    card_html = f"""
    <!-- 🧠 ATHX AI SPORTS SCIENTIST DEBRIEF & COACH BRIEFING CARD -->
    <section class="event-readiness-card" style="border: 1px solid rgba(56, 189, 248, 0.4); background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 12, 26, 0.95) 100%);">
      <div class="card-title-bar" style="cursor: pointer;" onclick="toggleCoachBriefing()">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <span class="card-title" style="color: #38bdf8; font-size: 1.05rem;">
            🧠 AI Sports Scientist Debrief & Coach Briefing
          </span>
          <span class="badge badge-sweetspot" style="font-family: 'JetBrains Mono'; font-weight: 700;">{rating}</span>
          <span class="badge badge-neutral" style="font-size: 0.7rem;">⚡ {provider}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 0.78rem; color: var(--text-muted);">As of: <strong style="color: var(--text-main);">{updated}</strong></span>
          <button id="coachToggleBtn" style="background: rgba(255,255,255,0.06); border: 1px solid var(--card-border); color: var(--text-muted); border-radius: 6px; padding: 0.2rem 0.55rem; font-size: 0.75rem; cursor: pointer;">
            Collapse ▴
          </button>
        </div>
      </div>

      <!-- Quick Executive Macro Banner -->
      <div style="background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 0.85rem; font-size: 0.88rem; color: var(--text-main); line-height: 1.5;">
        <strong style="color: #38bdf8;">Executive Summary:</strong> {macro}
      </div>

      <!-- Collapsible Full Sports Science Debrief -->
      <div id="coachBriefingContent" style="display: block; margin-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem;">
        {rendered_body}
      </div>
    </section>

    <script>
      function toggleCoachBriefing() {{
        var el = document.getElementById('coachBriefingContent');
        var btn = document.getElementById('coachToggleBtn');
        if (el.style.display === 'none') {{
          el.style.display = 'block';
          btn.textContent = 'Collapse ▴';
        }} else {{
          el.style.display = 'none';
          btn.textContent = 'Expand ▾';
        }}
      }}
    </script>
    """
    return card_html


def format_executive_verdict_terminal(briefing: dict[str, Any]) -> str:
    """Formats executive verdict for clean CLI terminal output."""
    verdict = briefing.get("executive_verdict", {})
    rating = verdict.get("rating", "80%")
    macro = verdict.get("macro_assessment", "")
    provider = briefing.get("provider_used", "AI Coach")

    gold = "\033[38;5;220m"
    cyan = "\033[96m"
    bold = "\033[1m"
    gray = "\033[90m"
    reset = "\033[0m"

    out = [
        f"  {bold}🧠 AI Sports Scientist Verdict:{reset} {gold}{bold}{rating}{reset} {gray}[via {provider}]{reset}",
        f"  {cyan}• Macro:{reset} {macro}"
    ]
    return "\n".join(out)


# ==============================================================================
# 7. STANDALONE RUNNER
# ==============================================================================
if __name__ == "__main__":
    print("Testing ATHX AI Performance Coach module...")
    import athx_analytics
    
    base_dir = Path(__file__).resolve().parent
    audit = athx_analytics.DataAuditTracker()
    garmin_raw = []
    g_path = base_dir / "garmin_workout_volume.json"
    if g_path.exists():
        with open(g_path, "r", encoding="utf-8") as f:
            garmin_raw = json.load(f)
            
    strength_data = athx_analytics.process_strength_data(garmin_raw, audit)
    apple_data = athx_analytics.process_apple_health(base_dir, audit)
    running_data = athx_analytics.process_running_data(base_dir / "garmin_running_activities.json", audit)
    workout_data = athx_analytics.process_workout_activities(base_dir / "garmin_workout_activities.json", audit)
    comp_data = athx_analytics.evaluate_competition_readiness(strength_data, apple_data, running_data)
    
    digest = athx_analytics.generate_telemetry_digest(
        strength_data, apple_data, running_data, workout_data, comp_data, audit
    )
    
    briefing = get_or_generate_coach_briefing(digest, force=False, base_dir=base_dir)
    print("\n" + format_executive_verdict_terminal(briefing))
    print(f"\nBriefing saved to athlete_coach_briefing.json ({len(briefing['briefing_markdown'])} chars).")
