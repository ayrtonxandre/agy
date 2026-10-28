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
    "overhead lunge": "Overhead Lunge",
    "overhead lunges": "Overhead Lunge",
    "overheads lunge": "Overhead Lunge",
    "overheads lunges": "Overhead Lunge",
    "overhead walking lunge": "Overhead Lunge",
    "overhead walking lunges": "Overhead Lunge",
    "walking lunge": "Lunge",
    "walking lunges": "Lunge",
    "leg press": "Leg Press",
    "hack squat": "Hack Squat",
    "leg extension": "Leg Extension",
    "single leg squat": "Single Leg Squat",
    "single leg squats": "Single Leg Squat",
    "single-leg squat": "Single Leg Squat",
    "single-leg squats": "Single Leg Squat",
    "pistol squat": "Pistol Squat",
    "pistol squats": "Pistol Squat",
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
    "kettle bell swings": "Kettlebell Swing",
    "kettle bell swing": "Kettlebell Swing",
    "kettle bell": "Kettlebell Swing",
    "kettlebell": "Kettlebell Swing",
    "sumo deadlift": "Sumo Deadlift",
    "sumo deadlifts": "Sumo Deadlift",
    "sumo deadlift high pull": "Sumo Deadlift High Pull",
    "sumo deadlift high pulls": "Sumo Deadlift High Pull",
    "sumo deadlifts high pull": "Sumo Deadlift High Pull",
    "sumo deadlifts high pulls": "Sumo Deadlift High Pull",
    "sumo deadlift high rise": "Sumo Deadlift High Pull",
    "sumo deadlifts high rise": "Sumo Deadlift High Pull",
    "sdhp": "Sumo Deadlift High Pull",
    "dumbbell sumo deadlift": "Dumbbell Sumo Deadlift",
    "dumbbells sumo deadlift": "Dumbbell Sumo Deadlift",
    "dumbbell sumo deadlifts": "Dumbbell Sumo Deadlift",
    "dumbbells sumo deadlifts": "Dumbbell Sumo Deadlift",
    "dumbbell sumo deadlift high pull": "Sumo Deadlift High Pull",
    "dumbbells sumo deadlift high pull": "Sumo Deadlift High Pull",
    "dumbbell sumo deadlifts high pull": "Sumo Deadlift High Pull",
    "dumbbells sumo deadlifts high pull": "Sumo Deadlift High Pull",
    "dumbbell sumo deadlift high rise": "Sumo Deadlift High Pull",
    "dumbbells sumo deadlift high rise": "Sumo Deadlift High Pull",
    "dumbbell sumo deadlifts high rise": "Sumo Deadlift High Pull",
    "dumbbells sumo deadlifts high rise": "Sumo Deadlift High Pull",

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
    "ring rows": "Ring Row",
    "ring row": "Ring Row",
    "inverted rows": "Ring Row",
    "inverted row": "Ring Row",

    "pike push-ups": "Push Up",
    "pike push-up": "Push Up",
    "pike push ups": "Push Up",
    "pike pushups": "Push Up",

    # Olympic & Core
    "snatch": "Snatch",
    "snatches": "Snatch",
    "power snatch": "Snatch",
    "power snatches": "Snatch",
    "dumbbell snatch": "Snatch",
    "db snatch": "Snatch",
    "single dumbbell snatch": "Snatch",
    "single arm dumbbell snatch": "Single Arm Dumbbell Snatch",
    "single arm db snatch": "Single Arm Dumbbell Snatch",
    "single-arm dumbbell snatch": "Single Arm Dumbbell Snatch",
    "single-arm db snatch": "Single Arm Dumbbell Snatch",
    "alternated single dumbbell snatch overhead": "Snatch",
    "dumbbell snatch overhead": "Snatch",
    "hang snatch": "Hang Snatch",
    "hang snatches": "Hang Snatch",
    "hang power snatch": "Hang Snatch",
    "hang power snatches": "Hang Snatch",
    "devil press": "Devil Press",
    "devils press": "Devil Press",
    "devil's press": "Devil Press",
    "single arm devil press": "Devil Press",
    "single arm dumbbells devil press": "Devil Press",
    "single arm dumbbell devil press": "Devil Press",
    "single-arm dumbbells devil press": "Devil Press",
    "single-arm dumbbell devil press": "Devil Press",
    "clean": "Clean",
    "cleans": "Clean",
    "power clean": "Clean",
    "power cleans": "Clean",
    "squat clean": "Clean",
    "squat cleans": "Clean",
    "squat-clean": "Clean",
    "squat-cleans": "Clean",
    "hang clean": "Clean",
    "hang cleans": "Clean",
    "hang power clean": "Clean",
    "hang power cleans": "Clean",
    "hang squat clean": "Clean",
    "hang squat cleans": "Clean",
    "clean and jerk": "Clean and Jerk",
    "clean and jerks": "Clean and Jerk",
    "cleans and jerk": "Clean and Jerk",
    "cleans and jerks": "Clean and Jerk",
    "clean & jerk": "Clean and Jerk",
    "cleans & jerks": "Clean and Jerk",
    "c&j": "Clean and Jerk",
    "burpees": "Burpee",
    "burpee": "Burpee",
    "leg raise": "Leg Raise",
    "leg raises": "Leg Raise",
    "legs raise": "Leg Raise",
    "legs raises": "Leg Raise",
    "hanging leg raise": "Hanging Leg Raise",
    "hanging leg raises": "Hanging Leg Raise",
    "hanging legs raise": "Hanging Leg Raise",
    "hanging legs raises": "Hanging Leg Raise",
    "toes to bar": "Toes to Bar",
    "t2b": "Toes to Bar",
    "sit-up": "Sit Up",
    "sit-ups": "Sit Up",
    "sit up": "Sit Up",
    "sit ups": "Sit Up",
    "situp": "Sit Up",
    "situps": "Sit Up",
    "box jumps": "Box Jump",
    "box jump": "Box Jump",
    "jumping jack": "Jumping Jacks",
    "jumping jacks": "Jumping Jacks",

    # Gymnastics & Calisthenics
    "muscle up": "Muscle Up",
    "muscle ups": "Muscle Up",
    "muscle-up": "Muscle Up",
    "muscle-ups": "Muscle Up",
    "bar muscle up": "Muscle Up",
    "bar muscle-up": "Muscle Up",
    "bar muscle ups": "Muscle Up",
    "bar muscle-ups": "Muscle Up",
    "ring muscle up": "Muscle Up",
    "ring muscle-up": "Muscle Up",
    "ring muscle ups": "Muscle Up",
    "ring muscle-ups": "Muscle Up",
    "muscle up low bar": "Muscle Up",
    "muscle-up low bar": "Muscle Up",
    "muscle ups low bar": "Muscle Up",
    "muscle-ups low bar": "Muscle Up",
    "low bar muscle up": "Muscle Up",
    "low bar muscle-up": "Muscle Up",
    "wall walk": "Wall Walk",
    "wall walks": "Wall Walk",
    "wall-walk": "Wall Walk",
    "wall-walks": "Wall Walk",
    "handstand push up": "Handstand Push Up",
    "handstand push-up": "Handstand Push Up",
    "handstand push ups": "Handstand Push Up",
    "handstand push-ups": "Handstand Push Up",
    "hspu": "Handstand Push Up",
    "hspus": "Handstand Push Up",
    "hollow rock": "Hollow Rock",
    "hollow rocks": "Hollow Rock",
    "hollow hold": "Hollow Rock",
    "hollow body": "Hollow Rock",
}


def normalize_exercise_name(raw_name: str) -> str:
    """Normalizes an exercise name into the closest ATHX canonical name."""
    if not raw_name:
        return "Unknown Exercise"
    
    cleaned = raw_name.strip().lower()
    cleaned = re.sub(r"\s+", " ", cleaned)
    cleaned = re.sub(r"^(barbell|dumbbells?|db|bb|kettlebells?|kb|sandbags?)\s+", "", cleaned)
    cleaned = re.sub(r"\s+(barbell|dumbbells?|db|bb|kettlebells?|kb|sandbags?)$", "", cleaned)
    
    # Strip apparatus / descriptor modifiers (e.g. "muscle-ups low bar", "pull ups on bar", "muscle-ups (low bar)")
    cleaned = re.sub(r"\s*\((?:low\s*bar|high\s*bar|rings?|bar)\)", "", cleaned)
    cleaned = re.sub(r"\s+(?:low\s*bar|high\s*bar|on\s+rings?|on\s+bar|rings?)\b", "", cleaned)
    cleaned = re.sub(r"\blegs\b", "leg", cleaned)
    cleaned = cleaned.strip()
    
    if cleaned in EXERCISE_ALIASES:
        return EXERCISE_ALIASES[cleaned]
    if raw_name.strip().lower() in EXERCISE_ALIASES:
        return EXERCISE_ALIASES[raw_name.strip().lower()]
        
    for ex in athx_config.EXERCISE_MUSCLE_MAP:
        if cleaned == ex.lower() or cleaned == ex.lower() + "s":
            return ex
            
    return raw_name.strip().title()


def is_modifier_segment(segment: str) -> bool:
    """
    Returns True if segment is purely a modifier (weight, calories, duration, or reps)
    and not an independent movement.
    """
    s = segment.strip().lower()
    if not s:
        return True
    
    # Weight: e.g. "25kg", "25 kg", "25 kg (55 lbs)", "@ 25kg", "at 106,5kg", "65Lbd"
    if re.match(r"^(?:@|at\s+)?\s*\d+(?:[.,]\d+)?\s*(?:kg|kilos?|lbs?|lbd|lbsd|lbes|pounds?)\b(?:\s*\([^)]*\))?$", s, re.I):
        return True
        
    # Calories: e.g. "15cal", "15 cal", "13 cals", "20 calories"
    if re.match(r"^\d+\s*(?:cal|calories?|cals?|kcal)\b$", s, re.I):
        return True
        
    # Duration: e.g. "1:30", "1:30mins", "45s", "45 secs", "2 min"
    if re.match(r"^(?:\d+:[0-5]\d(?:\s*mins?)?|\d+(?:[.,]\d+)?\s*(?:s|sec|secs|seconds?|min|mins|minutes?))\b$", s, re.I):
        return True

    # Reps: e.g. "15 reps", "15x"
    if re.match(r"^\d+\s*(?:reps?|x)\b$", s, re.I):
        return True

    return False


def split_line_into_movements(line: str) -> list[str]:
    """
    Splits a multi-movement line (e.g. '15 burpees - 15 squat cleans, 25 kg')
    while preserving modifier segments (e.g. '15 sumo deadlifts - 25kg' or '1:30mins rowing - 15Cal').
    """
    if not re.search(r"\s+[-+/|;]\s+", line):
        return [line.strip()]
        
    raw_segs = [s.strip() for s in re.split(r"\s+[-+/|;]\s+", line) if s.strip()]
    if not raw_segs:
        return []
        
    merged_segs: list[str] = [raw_segs[0]]
    for seg in raw_segs[1:]:
        if is_modifier_segment(seg):
            merged_segs[-1] = f"{merged_segs[-1]} - {seg}"
        else:
            merged_segs.append(seg)
            
    return merged_segs


def is_exercise_name(text: str) -> str | None:
    """Checks if a line represents a pure exercise header (e.g. 'Deadlifts')."""
    t = text.strip()
    if not t:
        return None
    low = t.lower()
    if any(h in low for h in ["strength", "wod", "warmup", "warm up", "then", "puis", "practice", "rounds", "tours", "circuit"]):
        return None
    norm = normalize_exercise_name(t)
    cleaned_lower = re.sub(r"^(barbell|dumbbells?|db|bb)\s+", "", low)
    if norm in athx_config.EXERCISE_MUSCLE_MAP or low in EXERCISE_ALIASES or cleaned_lower in EXERCISE_ALIASES:
        return norm
    return None


# ==============================================================================
# 2. LOCAL RULE-BASED FALLBACK PARSER
# ==============================================================================
def parse_single_movement(sm: str, default_sets: int = 1) -> dict[str, Any] | None:
    """Parses a single movement snippet like '15 squat cleans, 25 kg (55 Lbs)', '15 burpees', or '500m rowing'."""
    sm = sm.strip()
    if not sm:
        return None

    # Check if sm is a known strength exercise with row in the name (e.g. Ring Row, Barbell Row)
    sm_norm = normalize_exercise_name(sm)
    is_strength_row = sm_norm in athx_config.EXERCISE_MUSCLE_MAP and "Row" in sm_norm and sm_norm != "Row"

    # 1. Conditioning distance: e.g. "500m rowing", "400m row", "400m", "5km run"
    if not is_strength_row:
        m_dist = re.match(r"^(\d+(?:\.\d+)?)\s*(m|km|meters?|miles?)(?:\s+([a-zA-Z\s]+))?$", sm, re.IGNORECASE)
        if m_dist:
            val = float(m_dist.group(1))
            unit = m_dist.group(2).lower()
            dist_m = val if unit in ["m", "meters", "meter"] else val * 1000.0
            mov_raw = (m_dist.group(3) or "").strip().lower()
            if "row" in mov_raw:
                mov = "Rowing"
            elif "bike" in mov_raw:
                mov = "Assault Bike"
            elif "ski" in mov_raw:
                mov = "SkiErg"
            else:
                mov = mov_raw.title() if mov_raw else "Running"
            return {
                "type": "conditioning",
                "movement": mov,
                "distance_m": dist_m * default_sets,
                "calories": None,
                "duration_s": None,
                "notes": f"{default_sets}x {m_dist.group(1)}{unit}" if default_sets > 1 else sm
            }

    # 2. Conditioning: duration / calories / machine
    is_cardio = False
    if not is_strength_row:
        if re.search(r"\b(rowing|rameur|bike|assault bike|echo bike|air bike|skierg|ski erg|ski|running|run|course)\b", sm, re.I):
            is_cardio = True
        elif re.search(r"\b(?<!ring\s)(?<!barbell\s)(?<!dumbbell\s)(?<!db\s)(?<!inverted\s)(?<!upright\s)row\b", sm, re.I):
            is_cardio = True

    has_time = bool(re.search(r"(\d+:[0-5]\d|\b\d+(?:[.,]\d+)?\s*(?:s|sec|secs|seconds?|min|mins|minutes?)\b)", sm, re.I))
    has_cal = bool(re.search(r"\b\d+\s*(?:cal|calories?|cals?|kcal)\b", sm, re.I))

    if is_cardio or (has_time and has_cal):
        mov = "Conditioning"
        sm_low = sm.lower()
        if "row" in sm_low or "rameur" in sm_low:
            mov = "Rowing"
        elif "assault bike" in sm_low or "echo bike" in sm_low or "air bike" in sm_low:
            mov = "Assault Bike"
        elif "bike" in sm_low or "velo" in sm_low or "vélo" in sm_low:
            mov = "Bike"
        elif "ski" in sm_low:
            mov = "SkiErg"
        elif "run" in sm_low or "course" in sm_low:
            mov = "Running"

        dur_s = None
        m_time = re.search(r"(\d+):([0-5]\d)", sm)
        if m_time:
            dur_s = float(int(m_time.group(1)) * 60 + int(m_time.group(2)))
        else:
            m_min = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:min|mins|minutes?)\b", sm, re.I)
            if m_min:
                dur_s = float(m_min.group(1)) * 60.0
            else:
                m_sec = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconds?)\b", sm, re.I)
                if m_sec:
                    dur_s = float(m_sec.group(1))

        cals = None
        m_c = re.search(r"\b(\d+)\s*(?:cal|calories?|cals?|kcal)\b", sm, re.I)
        if m_c:
            cals = int(m_c.group(1))

        dist_m = None
        m_d = re.search(r"\b(\d+(?:\.\d+)?)\s*(m|km|meters?)\b", sm, re.I)
        if m_d and not re.search(r"min", m_d.group(0), re.I):
            val = float(m_d.group(1))
            unit = m_d.group(2).lower()
            dist_m = val if unit in ["m", "meters", "meter"] else val * 1000.0

        return {
            "type": "conditioning",
            "movement": mov,
            "distance_m": dist_m * default_sets if dist_m is not None else None,
            "calories": cals * default_sets if cals is not None else None,
            "duration_s": dur_s * default_sets if dur_s is not None else None,
            "notes": sm if default_sets == 1 else f"{default_sets}x {sm}"
        }

    # 3. Extract Weight
    weight_kg = 0.0
    rem = sm

    m_kg = re.search(r"(?:[:@\-_]|at\s+|,)?\s*(\d+(?:[.,]\d+)?)\s*(?:kg|kilos?)\b(?:\s*\([^)]*\))?", sm, re.IGNORECASE)
    if m_kg:
        weight_kg = float(m_kg.group(1).replace(",", "."))
        rem = sm[:m_kg.start()] + " " + sm[m_kg.end():]
    else:
        m_lbs = re.search(r"(?:[:@\-_]|at\s+|,)?\s*(\d+(?:[.,]\d+)?)\s*(?:lbs?|lbd|lbsd|lbes|pounds?)\b(?:\s*\([^)]*\))?", sm, re.IGNORECASE)
        if m_lbs:
            weight_kg = round(float(m_lbs.group(1).replace(",", ".")) * 0.45359237, 1)
            rem = sm[:m_lbs.start()] + " " + sm[m_lbs.end():]
        else:
            m_at = re.search(r"[@:]\s*(\d+(?:[.,]\d+)?)\b", sm, re.IGNORECASE)
            if m_at:
                weight_kg = float(m_at.group(1).replace(",", "."))
                rem = sm[:m_at.start()] + " " + sm[m_at.end():]

    rem = rem.strip(" ,-:@_")

    duration_s = 0.0
    m_timed = re.match(r"^(\d+(?:[.,]\d+)?)\s*(?:s|sec|secs|seconds?|min|mins)\s+(.*)$", rem, re.IGNORECASE)
    if m_timed:
        val = float(m_timed.group(1).replace(",", "."))
        unit = m_timed.group(0).lower()
        duration_s = val * 60.0 if "min" in unit else val
        reps = 1
        raw_name = m_timed.group(2).strip()
    else:
        m_rep = re.match(r"^(\d+)\s*(?:reps?|x)?\s+(.*)$", rem, re.IGNORECASE)
        if m_rep:
            reps = int(m_rep.group(1))
            raw_name = m_rep.group(2).strip()
        else:
            m_rev = re.match(r"^(.*?)\s+(\d+)\s*(?:reps?|x)?$", rem, re.IGNORECASE)
            if m_rev:
                reps = int(m_rev.group(2))
                raw_name = m_rev.group(1).strip()
            else:
                reps = 10
                raw_name = rem

    if not raw_name:
        return None

    ex_name = normalize_exercise_name(raw_name)
    cleaned_lower = re.sub(r"\s+", " ", raw_name.strip().lower())
    cleaned_lower = re.sub(r"^(barbell|dumbbells?|db|bb)\s+", "", cleaned_lower)
    cleaned_lower = re.sub(r"\s+(?:low\s*bar|high\s*bar|on\s+rings?|on\s+bar|rings?)\b", "", cleaned_lower).strip()
    is_known = (
        ex_name in athx_config.EXERCISE_MUSCLE_MAP or
        raw_name.lower() in EXERCISE_ALIASES or
        cleaned_lower in EXERCISE_ALIASES
    )
    is_stopword = raw_name.lower().strip() in [
        "round", "rounds", "set", "sets", "cal", "cals", "calories",
        "warmup", "warm up", "wod", "metcon", "then", "puis", "after"
    ]
    if raw_name.lower().strip() in ["reps", "rep"] and weight_kg > 0:
        ex_name = "Strength Exercise"
        is_known = True

    if not (is_known or (weight_kg > 0 and not is_stopword and len(raw_name.strip()) >= 3)):
        return None

    return {
        "type": "exercise",
        "exercise": ex_name,
        "sets": default_sets,
        "reps": reps,
        "weight_kg": weight_kg,
        "duration_s": duration_s,
        "notes": (
            f"{default_sets}x{reps} {ex_name} @ {weight_kg}kg" if weight_kg > 0
            else (f"{default_sets}x {int(duration_s)}s {ex_name}" if duration_s > 0
                  else f"{default_sets}x{reps} {ex_name} (Bodyweight)")
        )
    }


def format_workout_summary(exercises: list[dict], conditioning: list[dict], total_rounds: int) -> str:
    """Produces a clean, human-readable summary of parsed workout items."""
    parts = []
    from collections import OrderedDict
    ex_grouped = OrderedDict()
    for e in exercises:
        ex_name = e["exercise"]
        ex_grouped.setdefault(ex_name, []).append(e)

    for ex_name, items in ex_grouped.items():
        total_sets = sum(it.get("sets", 1) for it in items)
        weights = [it["weight_kg"] for it in items if it.get("weight_kg", 0) > 0]
        reps_list = [str(it["reps"]) for it in items]

        if not weights or all(w == 0 for w in weights):
            if len(set(reps_list)) == 1:
                parts.append(f"{total_sets}x{reps_list[0]} {ex_name}")
            else:
                rep_s = "/".join(reps_list)
                parts.append(f"{total_sets} sets {ex_name} ({rep_s} reps)")
        else:
            min_w = min(weights)
            max_w = max(weights)
            w_str = f"{min_w:g}kg" if min_w == max_w else f"{min_w:g}-{max_w:g}kg"
            if len(set(reps_list)) == 1 and len(set(weights)) == 1:
                parts.append(f"{total_sets}x{reps_list[0]} {ex_name} @ {w_str}")
            else:
                rep_s = "/".join(reps_list)
                parts.append(f"{total_sets} sets {ex_name} ({rep_s} reps @ {w_str})")

    cond_grouped = OrderedDict()
    for c in conditioning:
        mov = c["movement"]
        cond_grouped.setdefault(mov, []).append(c)

    for mov, items in cond_grouped.items():
        tot_dist = sum(it.get("distance_m") or 0.0 for it in items)
        tot_cals = sum(it.get("calories") or 0 for it in items)
        tot_dur = sum(it.get("duration_s") or 0 for it in items)
        c_specs = []
        if tot_dist > 0:
            c_specs.append(f"{tot_dist:g}m")
        if tot_dur > 0:
            mins = int(tot_dur // 60)
            secs = int(tot_dur % 60)
            dur_str = f"{mins}:{secs:02d} mins" if mins > 0 else f"{secs}s"
            c_specs.append(dur_str)
        if tot_cals > 0:
            c_specs.append(f"{tot_cals} cal")
        if c_specs:
            spec_joined = " / ".join(c_specs)
            parts.append(f"{mov} ({spec_joined})")
        else:
            parts.append(mov)

    prefix = f"{total_rounds} rounds: " if total_rounds > 1 else ""
    return prefix + ", ".join(parts)


def parse_note_rules(text: str) -> dict[str, Any]:
    """Smart regex and heuristic parser for workout notes when LLM is offline."""
    lines = [line.strip() for line in text.strip().splitlines() if line.strip()]

    exercises: list[dict[str, Any]] = []
    conditioning: list[dict[str, Any]] = []

    current_exercise: str | None = None
    current_rounds = 1
    max_round_seen = 1
    in_round_block = False

    i = 0
    while i < len(lines):
        line = lines[i]

        # 1. Round-by-round prefix: e.g. "Round 1: 15 burpees - 15 squat cleans, 25 kg (55 Lbs)" or "Round 1 :"
        m_round_line = re.match(r"^(?:round|tour|série|serie|set|r)\s*(\d+)\s*[:\-]\s*(.*)$", line, re.IGNORECASE)
        if m_round_line:
            r_num = int(m_round_line.group(1))
            if r_num > max_round_seen:
                max_round_seen = r_num
            content = m_round_line.group(2).strip()
            if content:
                in_round_block = False
                current_rounds = 1
                segs = split_line_into_movements(content)
                for s in segs:
                    parsed_seg = parse_single_movement(s, default_sets=1)
                    if parsed_seg:
                        if parsed_seg["type"] == "exercise":
                            exercises.append(parsed_seg)
                        elif parsed_seg["type"] == "conditioning":
                            conditioning.append(parsed_seg)
            else:
                in_round_block = True
                current_rounds = 1
            i += 1
            continue

        # 2. Section header with rounds: e.g. "Strengh - 5 rounds", "WOD - 4 rounds", "4 Rounds:"
        m_rds = re.search(r"(\d+)\s*(?:rounds?|sets?|rds|tours?|series)\b", line, re.IGNORECASE)
        if m_rds and not re.search(r"(?:squat|press|deadlift|bench|curl|clean|snatch|row|pull|push|burpee)", line, re.IGNORECASE):
            current_rounds = int(m_rds.group(1))
            if current_rounds > max_round_seen:
                max_round_seen = current_rounds
            current_exercise = None
            in_round_block = False
            i += 1
            continue

        # 3. Section headers without rounds
        if re.match(r"^(strength\s*(?:part)?|force|partie\s*1|wod|metcon|part\s*b|circuit|warmup|warm\s*up|échauffement|then|puis|after|practice)\b", line, re.IGNORECASE):
            current_exercise = None
            in_round_block = False
            i += 1
            continue

        # 4. Check if line is just an exercise name, e.g. "Deadlifts"
        ex_cand = is_exercise_name(line)
        if ex_cand and not re.search(r"\d", line):
            current_exercise = ex_cand
            i += 1
            continue

        # 5. Check multi-set notation under current_exercise: e.g. "5*60", "5x70", "40 reps - 25kg", "5 reps at 106,5Kg"
        m_set = re.match(r"^(\d+)\s*(?:[\*xX@]|reps\s*(?:@|x|\*|at|[-:])?)\s*(\d+(?:[.,]\d+)?)\s*(?:kg|kilos|lbs)?$", line, re.IGNORECASE)
        if m_set and current_exercise:
            reps = int(m_set.group(1))
            weight = float(m_set.group(2).replace(",", "."))
            exercises.append({
                "type": "exercise",
                "exercise": current_exercise,
                "sets": 1,
                "reps": reps,
                "weight_kg": weight,
                "notes": f"1 set of {reps} @ {weight}kg"
            })
            i += 1
            continue

        # 6. Movement lines (single or multiple)
        run_sets = 1 if in_round_block else current_rounds
        segs = split_line_into_movements(line)
        for s in segs:
            parsed_seg = parse_single_movement(s, default_sets=run_sets)
            if parsed_seg:
                if parsed_seg["type"] == "exercise":
                    exercises.append(parsed_seg)
                elif parsed_seg["type"] == "conditioning":
                    conditioning.append(parsed_seg)
        i += 1

    total_rounds = max(max_round_seen, current_rounds)
    summary = format_workout_summary(exercises, conditioning, total_rounds)

    return {
        "is_workout": len(exercises) > 0 or len(conditioning) > 0,
        "rounds": total_rounds,
        "exercises": exercises,
        "conditioning": conditioning,
        "summary": summary if summary else text.strip(),
        "parser_used": "rule_based_fallback"
    }


# ==============================================================================
# 3. LLM PROMPT & SCHEMA
# ==============================================================================
SYSTEM_PROMPT = """You are an expert sports physiologist and athletic data analyst for the ATHX 2027 Athlete Hub.
Your task is to parse an athlete's unstructured free-text Garmin activity note (from CrossFit, HIIT, circuit training, or gym workouts) into structured JSON.

Canonical ATHX Exercises list:
Front Squat, Back Squat, Goblet Squat, Split Squat, Bulgarian Split Squat, Lunge, Overhead Lunge, Leg Press, Hack Squat, Leg Extension,
Deadlift, Romanian Deadlift, Straight Leg Deadlift, Hip Thrust, Kettlebell Swing,
Bench Press, Incline Bench Press, Dumbbell Bench Press, Overhead Press, Barbell Push Press, Shoulder Press, Military Press, Push Up, Dip, Thruster,
Pull Up, Chin Up, Muscle Up, Row, Barbell Row, Bent Over Row, Dumbbell Row, Lat Pulldown, Shrug, Face Pull, Ring Row,
Biceps Curl, Hammer Curl, Triceps Extension, Triceps Pushdown, Close Grip Bench Press,
Clean, Clean and Jerk, Snatch, Hang Snatch, Burpee, Toes to Bar, Wall Ball, Wall Walk, Handstand Push Up, Hollow Rock.

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
    models = ["gemini-2.5-flash", "gemini-3.8-flash"]
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
            res = requests.post(url, json=payload, timeout=30)
            if res.status_code == 200:
                data = res.json()
                raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                m = re.search(r"```json\s*(.*?)\s*```", raw_text, re.DOTALL)
                json_str = m.group(1) if m else raw_text.strip()
                parsed = json.loads(json_str)
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
        tallies = {"Push": 0, "Pull": 0, "Legs": 0, "Full Body": 0}
        for item in extracted_exercises:
            ex_name = normalize_exercise_name(item.get("exercise", ""))
            s_count = int(item.get("sets", 1))
            m = athx_config.EXERCISE_MUSCLE_MAP.get(ex_name)
            if m:
                sp = athx_config.MUSCLE_TO_SPLIT_MAP.get(m)
                if sp in tallies:
                    tallies[sp] += s_count
        tot = sum(tallies.values())
        if tot > 0:
            sorted_tallies = sorted(tallies.values(), reverse=True)
            if sorted_tallies[0] == sorted_tallies[1] or (sorted_tallies[0] / tot < 0.60):
                dominant_split = "Full Body"
            else:
                top_split, _ = max(tallies.items(), key=lambda x: x[1])
                dominant_split = top_split
        else:
            dominant_split = "Full Body"

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
                "Duration_s": float(item.get("duration_s", 0.0) or 0.0),
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
