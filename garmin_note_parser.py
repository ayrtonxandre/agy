#!/usr/bin/env python3
"""
================================================================================
Garmin Activity Note & WOD Parser (Multi-Provider LLM with Local Fallback)
================================================================================
Deciphers free-text Garmin activity notes (e.g. CrossFit WODs, circuit training,
or custom gym notes) into structured ATHX exercise sets and conditioning volume.

Supported Providers (configured via .env or environment variables):
  1. Google Gemini:   GEMINI_API_KEY (or GOOGLE_API_KEY)
  2. OpenAI:          OPENAI_API_KEY (supports custom OPENAI_BASE_URL / Ollama)
  3. Anthropic:       ANTHROPIC_API_KEY
  4. Local Fallback:  Smart regex & heuristic parser when offline or without keys.
"""

from __future__ import annotations
import os
import re
import json
import logging
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

import athx_config

logger = logging.getLogger("garmin_note_parser")

# ==============================================================================
# 1. CANONICAL EXERCISE NORMALIZATION & ALIASES
# ==============================================================================
EXERCISE_ALIASES: dict[str, str] = {
    # Squats / Quads
    "front squats": "Front Squat",
    "front squat": "Front Squat",
    "back squats": "Back Squat",
    "back squat": "Back Squat",
    "squats": "Back Squat",
    "squat": "Back Squat",
    "goblet squats": "Goblet Squat",
    "goblet squat": "Goblet Squat",
    "split squats": "Split Squat",
    "split squat": "Split Squat",
    "bulgarian split squat": "Bulgarian Split Squat",
    "bulgarian split squats": "Bulgarian Split Squat",
    "lunges": "Lunge",
    "lunge": "Lunge",
    "leg press": "Leg Press",
    "hack squat": "Hack Squat",
    "leg extension": "Leg Extension",
    "wall balls": "Wall Ball",
    "wall ball": "Wall Ball",

    # Hinges / Hamstrings / Glutes
    "deadlifts": "Deadlift",
    "deadlift": "Deadlift",
    "rdl": "Romanian Deadlift",
    "rdls": "Romanian Deadlift",
    "romanian deadlifts": "Romanian Deadlift",
    "romanian deadlift": "Romanian Deadlift",
    "straight leg deadlift": "Straight Leg Deadlift",
    "hip thrust": "Hip Thrust",
    "hip thrusts": "Hip Thrust",
    "kb swings": "Kettlebell Swing",
    "kettlebell swings": "Kettlebell Swing",
    "kettlebell swing": "Kettlebell Swing",

    # Upper Push
    "bench press": "Bench Press",
    "bench": "Bench Press",
    "incline bench press": "Incline Bench Press",
    "incline bench": "Incline Bench Press",
    "db bench press": "Dumbbell Bench Press",
    "push press": "Barbell Push Press",
    "barbell push press": "Barbell Push Press",
    "overhead press": "Overhead Press",
    "ohp": "Overhead Press",
    "shoulder press": "Shoulder Press",
    "military press": "Military Press",
    "strict press": "Overhead Press",
    "thruster": "Thruster",
    "thrusters": "Thruster",
    "pushups": "Push Up",
    "push-ups": "Push Up",
    "push ups": "Push Up",
    "push up": "Push Up",
    "dips": "Dip",
    "dip": "Dip",

    # Upper Pull
    "pullups": "Pull Up",
    "pull-ups": "Pull Up",
    "pull ups": "Pull Up",
    "pull up": "Pull Up",
    "chinups": "Chin Up",
    "chin-ups": "Chin Up",
    "chin ups": "Chin Up",
    "chin up": "Chin Up",
    "chest to bar": "Pull Up",
    "c2b": "Pull Up",
    "barbell row": "Barbell Row",
    "bent over row": "Bent Over Row",
    "rows": "Row",
    "row": "Row",
    "dumbbell row": "Dumbbell Row",
    "db row": "Dumbbell Row",
    "lat pulldown": "Lat Pulldown",

    "pike push-ups": "Push Up",
    "pike push-up": "Push Up",
    "pike push ups": "Push Up",
    "pike pushups": "Push Up",

    # Olympic & Core
    "snatch": "Snatch",
    "snatches": "Snatch",
    "power snatch": "Snatch",
    "clean": "Clean",
    "cleans": "Clean",
    "power clean": "Clean",
    "power cleans": "Clean",
    "clean and jerk": "Clean and Jerk",
    "clean and jerks": "Clean and Jerk",
    "cleans and jerk": "Clean and Jerk",
    "cleans and jerks": "Clean and Jerk",
    "clean & jerk": "Clean and Jerk",
    "cleans & jerks": "Clean and Jerk",
    "c&j": "Clean and Jerk",
    "burpees": "Burpee",
    "burpee": "Burpee",
    "toes to bar": "Toes to Bar",
    "t2b": "Toes to Bar",
}


def normalize_exercise_name(raw_name: str) -> str:
    """Normalizes an exercise name into the closest ATHX canonical name."""
    if not raw_name:
        return "Unknown Exercise"
    
    cleaned = raw_name.strip().lower()
    cleaned = re.sub(r"^(barbell|dumbbell|db|bb)\s+", "", cleaned)
    cleaned = re.sub(r"\s+(barbell|dumbbell|db|bb)$", "", cleaned)
    
    if cleaned in EXERCISE_ALIASES:
        return EXERCISE_ALIASES[cleaned]
        
    for ex in athx_config.EXERCISE_MUSCLE_MAP:
        if cleaned == ex.lower() or cleaned == ex.lower() + "s":
            return ex
            
    return raw_name.strip().title()


def is_exercise_name(text: str) -> str | None:
    """Checks if a line represents a pure exercise header (e.g. 'Deadlifts')."""
    t = text.strip()
    if not t:
        return None
    low = t.lower()
    if any(h in low for h in ["strength", "wod", "warmup", "warm up", "then", "puis", "practice", "rounds", "tours", "circuit"]):
        return None
    norm = normalize_exercise_name(t)
    if norm in athx_config.EXERCISE_MUSCLE_MAP or low in EXERCISE_ALIASES:
        return norm
    return None


# ==============================================================================
# 2. LOCAL RULE-BASED FALLBACK PARSER
# ==============================================================================
def parse_note_rules(text: str) -> dict[str, Any]:
    """Smart regex and heuristic parser for workout notes when LLM is offline."""
    lines = [line.strip() for line in text.strip().splitlines() if line.strip()]
    
    exercises: list[dict[str, Any]] = []
    conditioning: list[dict[str, Any]] = []
    
    current_exercise: str | None = None
    current_rounds = 1
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check section headers
        if re.match(r"^(strength\s*(?:part)?|force|partie\s*1)\b", line, re.IGNORECASE):
            current_exercise = None
            current_rounds = 1
            i += 1
            continue
            
        if re.match(r"^(wod|metcon|part\s*b|circuit)\b", line, re.IGNORECASE):
            current_exercise = None
            current_rounds = 1
            i += 1
            continue
            
        if re.match(r"^(warmup|warm\s*up|échauffement)\b", line, re.IGNORECASE):
            current_exercise = None
            current_rounds = 1
            i += 1
            continue
            
        # Check rounds declaration: "4 Rounds", "6 ROUNDS:", "Then 4 Rounds", "5 round", etc.
        m_rds = re.search(r"(\d+)\s*(?:rounds?|sets?|rds|tours?|series)\b", line, re.IGNORECASE)
        if m_rds and not re.search(r"(?:squat|press|deadlift|bench|curl|clean|snatch|row|pull|push)", line, re.IGNORECASE):
            current_rounds = int(m_rds.group(1))
            current_exercise = None
            i += 1
            continue
            
        if re.match(r"^(then|puis|after)\b", line, re.IGNORECASE):
            current_exercise = None
            i += 1
            continue
            
        # Check if line is just an exercise name, e.g. "Deadlifts"
        ex_cand = is_exercise_name(line)
        if ex_cand and not re.search(r"\d", line):
            current_exercise = ex_cand
            i += 1
            continue
            
        # Check multi-set notation under current_exercise:
        # e.g. "5*60", "5x70", "5 * 80kg", "5 @ 90", "5 reps 100kg"
        m_set = re.match(r"^(\d+)\s*(?:[\*xX@]|reps\s*(?:@|x|\*)?)\s*(\d+(?:\.\d+)?)\s*(?:kg|kilos|lbs)?$", line, re.IGNORECASE)
        if m_set and current_exercise:
            reps = int(m_set.group(1))
            weight = float(m_set.group(2))
            exercises.append({
                "exercise": current_exercise,
                "sets": 1,
                "reps": reps,
                "weight_kg": weight,
                "notes": f"1 set of {reps} @ {weight}kg"
            })
            i += 1
            continue
            
        # Check conditioning: "400m rowing", "500m row", "20 cal bike"
        m_dist = re.match(r"^(\d+(?:\.\d+)?)\s*(m|km|meters|miles)\s+([a-zA-Z\s]+)", line, re.IGNORECASE)
        if m_dist:
            val = float(m_dist.group(1))
            unit = m_dist.group(2).lower()
            dist_m = val if unit in ["m", "meters"] else val * 1000.0
            movement = m_dist.group(3).strip().title()
            conditioning.append({
                "movement": movement,
                "distance_m": dist_m * current_rounds,
                "calories": None,
                "notes": f"{current_rounds}x {m_dist.group(1)}{unit}"
            })
            i += 1
            continue

        m_cal = re.match(r"^(\d+)\s*(?:cal|calories)\s+([a-zA-Z\s]+)", line, re.IGNORECASE)
        if m_cal:
            cals = int(m_cal.group(1))
            movement = m_cal.group(2).strip().title()
            conditioning.append({
                "movement": movement,
                "distance_m": None,
                "calories": cals * current_rounds,
                "notes": f"{current_rounds}x {cals} cal"
            })
            i += 1
            continue

        # Check full strength line: "9 Cleans and Jerks 45Kg", "15 Front Squats : 60Kg", "5 snatch barbell 20Kg"
        m_ex = re.match(
            r"^(?:(\d+)\s*(?:reps|x)?\s+)?([A-Za-z\s]+?)\s*[:@\-_]\s*(\d+(?:\.\d+)?)\s*(?:kg|kilos|lbs)?$",
            line, re.IGNORECASE
        )
        if not m_ex:
            m_ex = re.match(
                r"^(\d+)\s+([A-Za-z\s]+?)\s+(\d+(?:\.\d+)?)\s*(?:kg|kilos|lbs)?$",
                line, re.IGNORECASE
            )
            
        if m_ex:
            reps = int(m_ex.group(1) or 10)
            raw_ex = m_ex.group(2).strip()
            weight = float(m_ex.group(3))
            ex_name = normalize_exercise_name(raw_ex)
            exercises.append({
                "exercise": ex_name,
                "sets": current_rounds,
                "reps": reps,
                "weight_kg": weight,
                "notes": f"{current_rounds} rounds of {reps} @ {weight}kg"
            })
            i += 1
            continue

        # Check bodyweight strength: "8 Pike Push-Ups", "6 Pull Ups"
        m_bw = re.match(r"^(\d+)\s*(?:reps|x)?\s+([A-Za-z\s\-]+)$", line, re.IGNORECASE)
        if m_bw:
            reps = int(m_bw.group(1))
            raw_ex = m_bw.group(2).strip()
            ex_name = normalize_exercise_name(raw_ex)
            if ex_name in athx_config.EXERCISE_MUSCLE_MAP or raw_ex.lower() in EXERCISE_ALIASES:
                exercises.append({
                    "exercise": ex_name,
                    "sets": current_rounds,
                    "reps": reps,
                    "weight_kg": 0.0,
                    "notes": f"{current_rounds} rounds of {reps} reps (Bodyweight)"
                })
                i += 1
                continue
                
        i += 1

    summary_parts = []
    if exercises:
        ex_strs = [f"{e['sets']}x{e['reps']} {e['exercise']} ({e['weight_kg']}kg)" for e in exercises]
        summary_parts.append(", ".join(ex_strs))
    if conditioning:
        cond_strs = [f"{c['movement']} ({c.get('distance_m')}m)" if c.get('distance_m') else f"{c['movement']} ({c.get('calories')}cal)" for c in conditioning]
        summary_parts.append(", ".join(cond_strs))

    return {
        "is_workout": len(exercises) > 0 or len(conditioning) > 0,
        "rounds": current_rounds,
        "exercises": exercises,
        "conditioning": conditioning,
        "summary": " | ".join(summary_parts) if summary_parts else text.strip(),
        "parser_used": "rule_based_fallback"
    }


# ==============================================================================
# 3. LLM PROMPT & SCHEMA
# ==============================================================================
SYSTEM_PROMPT = """You are an expert sports physiologist and athletic data analyst for the ATHX 2027 Athlete Hub.
Your task is to parse an athlete's unstructured free-text Garmin activity note (from CrossFit, HIIT, circuit training, or gym workouts) into structured JSON.

Canonical ATHX Exercises list:
Front Squat, Back Squat, Goblet Squat, Split Squat, Bulgarian Split Squat, Lunge, Leg Press, Hack Squat, Leg Extension,
Deadlift, Romanian Deadlift, Straight Leg Deadlift, Hip Thrust, Kettlebell Swing,
Bench Press, Incline Bench Press, Dumbbell Bench Press, Overhead Press, Barbell Push Press, Shoulder Press, Military Press, Push Up, Dip, Thruster,
Pull Up, Chin Up, Row, Barbell Row, Bent Over Row, Dumbbell Row, Lat Pulldown, Shrug, Face Pull,
Biceps Curl, Hammer Curl, Triceps Extension, Triceps Pushdown, Close Grip Bench Press,
Clean, Clean and Jerk, Snatch, Burpee, Toes to Bar, Wall Ball.

Instructions:
1. Detect total rounds/sets (e.g. '4 rounds', 'EMOM 10', '3 sets', default 1).
2. For each strength exercise:
   - Match to the closest canonical ATHX exercise from the list above.
   - Extract reps per round/set.
   - Extract weight in kg (if bodyweight, 0.0).
   - Multiply sets by the number of rounds.
3. For conditioning movements (rowing, running, assault bike, skiing):
   - Extract movement name, total distance in meters (or calories if given).
4. Infer session_type: 'Push', 'Pull', 'Legs', or 'Full Body'.

Respond ONLY with valid JSON conforming to this schema:
{
  "is_workout": true,
  "rounds": 4,
  "session_type": "Legs",
  "exercises": [
    {
      "exercise": "Front Squat",
      "sets": 4,
      "reps": 15,
      "weight_kg": 60.0,
      "notes": "4 rounds of 15"
    }
  ],
  "conditioning": [
    {
      "movement": "Rowing",
      "distance_m": 2000.0,
      "calories": null,
      "notes": "4x 500m"
    }
  ],
  "summary": "4 rounds: 15 Front Squats @ 60kg, 500m rowing"
}
"""


# ==============================================================================
# 4. LLM PROVIDER CALLERS
# ==============================================================================
def call_gemini(note_text: str, api_key: str) -> dict[str, Any] | None:
    """Invokes Google Gemini via REST API."""
    import requests
    models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{SYSTEM_PROMPT}\n\nAthlete Note to decipher:\n{note_text}"}
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.1
            }
        }
        try:
            res = requests.post(url, json=payload, timeout=12)
            if res.status_code == 200:
                data = res.json()
                raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                parsed = json.loads(raw_text)
                parsed["parser_used"] = f"gemini ({model})"
                return parsed
        except Exception as e:
            logger.warning(f"Gemini {model} call error: {e}")
            continue
    return None


def call_openai(note_text: str, api_key: str) -> dict[str, Any] | None:
    """Invokes OpenAI (or compatible API / Ollama)."""
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
            {"role": "user", "content": f"Athlete Note to decipher:\n{note_text}"}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1
    }
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=12)
        if res.status_code == 200:
            data = res.json()
            raw_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            parsed = json.loads(raw_text)
            parsed["parser_used"] = f"openai ({model})"
            return parsed
    except Exception as e:
        logger.warning(f"OpenAI call error: {e}")
    return None


def call_anthropic(note_text: str, api_key: str) -> dict[str, Any] | None:
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
        "max_tokens": 1000,
        "system": SYSTEM_PROMPT,
        "messages": [
            {"role": "user", "content": f"Athlete Note to decipher:\n{note_text}\n\nRespond with JSON only."}
        ],
        "temperature": 0.1
    }
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=12)
        if res.status_code == 200:
            data = res.json()
            raw_text = data.get("content", [{}])[0].get("text", "")
            # Extract JSON block if surrounded by ```json
            m = re.search(r"```json\s*(.*?)\s*```", raw_text, re.DOTALL)
            json_str = m.group(1) if m else raw_text
            parsed = json.loads(json_str)
            parsed["parser_used"] = f"anthropic ({model})"
            return parsed
    except Exception as e:
        logger.warning(f"Anthropic call error: {e}")
    return None


# ==============================================================================
# 5. MASTER PARSE & CONVERT
# ==============================================================================
def parse_workout_note(note_text: str) -> dict[str, Any]:
    """
    Deciphers activity notes using the best available method:
      1. Google Gemini (if GEMINI_API_KEY set)
      2. OpenAI (if OPENAI_API_KEY set)
      3. Anthropic (if ANTHROPIC_API_KEY set)
      4. Local rule-based parser (always available fallback)
    """
    if not note_text or not note_text.strip():
        return {"is_workout": False, "exercises": [], "conditioning": [], "summary": ""}

    # 1. Try Gemini
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key:
        res = call_gemini(note_text, gemini_key)
        if res and res.get("is_workout"):
            return res

    # 2. Try OpenAI
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        res = call_openai(note_text, openai_key)
        if res and res.get("is_workout"):
            return res

    # 3. Try Anthropic
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_key:
        res = call_anthropic(note_text, anthropic_key)
        if res and res.get("is_workout"):
            return res

    # 4. Fallback: Local rule-based parser
    return parse_note_rules(note_text)


def convert_note_to_strength_records(
    act_id: int, date_str: str, act_name: str, note_text: str
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """
    Parses a Garmin note and converts any detected strength exercises into
    standard individual set records ready for `garmin_extracted_workouts.json`.

    Returns (strength_sets, parsed_result).
    """
    parsed = parse_workout_note(note_text)
    if not parsed.get("is_workout"):
        return [], parsed

    extracted_exercises = parsed.get("exercises", [])
    if not extracted_exercises:
        return [], parsed

    # Determine dominant session split
    dominant_split = parsed.get("session_type")
    if not dominant_split:
        exercise_names = [normalize_exercise_name(e.get("exercise", "")) for e in extracted_exercises]
        dominant_split = "Full Body"
        for ex in exercise_names:
            muscle = athx_config.EXERCISE_MUSCLE_MAP.get(ex)
            if muscle:
                split = athx_config.MUSCLE_TO_SPLIT_MAP.get(muscle)
                if split in ["Push", "Pull", "Legs"]:
                    dominant_split = split
                    break

    exercise_set_counter: dict[str, int] = {}
    records: list[dict[str, Any]] = []
    for item in extracted_exercises:
        ex_name = normalize_exercise_name(item.get("exercise", "Strength Exercise"))
        sets_count = int(item.get("sets", 1))
        reps = int(item.get("reps", 10))
        weight_kg = float(item.get("weight_kg", 0.0))

        # Check plausible load limits
        plausible = True
        if ex_name in athx_config.PLAUSIBLE_LOAD_RANGES:
            min_p, max_p = athx_config.PLAUSIBLE_LOAD_RANGES[ex_name]
            if weight_kg < min_p or weight_kg > max_p:
                plausible = False

        # e1RM computation (strictly reps <= 10 per config)
        if plausible and 0 < reps <= athx_config.E1RM_MAX_REPS and weight_kg > 0:
            e1rm = round(weight_kg * (1.0 + reps / 30.0), 1)
        else:
            e1rm = 0.0

        for _ in range(sets_count):
            exercise_set_counter[ex_name] = exercise_set_counter.get(ex_name, 0) + 1
            set_num = exercise_set_counter[ex_name]
            records.append({
                "Activity_ID": act_id,
                "Date": date_str,
                "Activity_Name": act_name,
                "Exercise": ex_name,
                "Set": set_num,
                "Reps": reps,
                "Weight_kg": weight_kg,
                "Total_Volume_kg": round(reps * weight_kg, 1),
                "e1RM_kg": e1rm,
                "Duration_s": 0.0,
                "Session_Type": dominant_split,
            })

    return records, parsed


if __name__ == "__main__":
    sample = """4 rounds
15 Front Squats : 60Kg
500m rowing"""
    print("Testing parser on sample note...")
    sets, info = convert_note_to_strength_records(24477635769, "2026-09-24", "CrossFit", sample)
    print(f"Parser Used: {info.get('parser_used')}")
    print(f"Summary:     {info.get('summary')}")
    print(f"Generated {len(sets)} sets:")
    for s in sets:
        print(f"  • {s['Exercise']} Set {s['Set']}: {s['Reps']} reps @ {s['Weight_kg']} kg ({s['Total_Volume_kg']} kg vol) [Split: {s['Session_Type']}]")
