"""
================================================================================
ATHX 2027 Athlete Intelligence Hub — Shared Configuration Module
================================================================================
Single source of truth for all training analysis constants, athlete biometrics,
competition benchmarks, data integrity limits, and MEV/MRV hypertrophic bands.

No analysis constant may be defined anywhere else.
"""

from __future__ import annotations
from datetime import date
from zoneinfo import ZoneInfo

# ------------------------------------------------------------------------------
# 1. CORE TEMPORAL & ATHLETE CONFIGURATION
# ------------------------------------------------------------------------------
# Hard floor for ALL analysis: records before this date are excluded from KPIs/charts
DATA_START: str = "2026-05-01"

# ATHX Games 2027 Competition Date (YYYY-MM-DD)
COMPETITION_DATE: str = "2027-05-27"

# Athlete Biometrics & Physical Target
DEFAULT_BODYWEIGHT_KG: float = 79.3      # Fallback/current scale weight
BODYWEIGHT_TARGET_KG: float = 85.0       # Target bodyweight for competition
BODYWEIGHT_GOAL_TYPE: str = "gain"       # "gain" (Mass/Hypertrophy Bulking) | "cut" | "recomp"
ATHLETE_HEIGHT_M: float = 1.83           # Used for BMI calculation
DEFAULT_VO2MAX: float = 55.0             # Baseline athlete VO2Max (ml/kg/min)
TARGET_SLEEP_HRS: float = 7.5            # Athlete baseline sleep target (7h30)

# Maximum rep count for valid e1RM estimation (Epley invalid above this)
E1RM_MAX_REPS: int = 10

# Maximum days lookback for rolling chronic load baseline prior to DATA_START
CHRONIC_LOOKBACK_DAYS: int = 28

# Timezone
LOCAL_TIMEZONE = ZoneInfo("Europe/Paris")

# ------------------------------------------------------------------------------
# 2. ATHX GAMES 2027 NON-PRO COMPETITION BENCHMARKS
# ------------------------------------------------------------------------------
# Standard Tier-1 benchmark values for Non-Pro category
COMPETITION_BENCHMARKS: dict[str, dict] = {
    "s2o": {
        "name": "Shoulder-to-Overhead (S2O)",
        "unit": "kg",
        "standard": 65.0,
        "exercise_matches": ["Overhead Press", "Shoulder Press", "Military Press", "Barbell Shoulder Press", "Barbell Push Press", "Push Press"],
        "description": "Clean and jerk / push press maximal or working capacity"
    },
    "back_squat": {
        "name": "Back Squat",
        "unit": "kg",
        "standard": 125.0,
        "exercise_matches": ["Back Squat", "Barbell Back Squat", "Barbell Squat", "Squat"],
        "description": "Full depth barbell back squat 1RM standard"
    },
    "deadlift": {
        "name": "Deadlift",
        "unit": "kg",
        "standard": 160.0,
        "exercise_matches": ["Deadlift", "Barbell Deadlift", "Straight Leg Deadlift", "Romanian Deadlift", "Sumo Deadlift", "Sumo Deadlift High Pull"],
        "description": "Conventional or sumo barbell floor pull standard"
    },
    "run_5k": {
        "name": "5km Running Pace",
        "unit": "s_per_km",       # 270 seconds = 4:30 / km
        "standard": 270.0,
        "standard_display": "4:30/km",
        "description": "Aerobic threshold running standard"
    },
    "sandbag_carry": {
        "name": "Sandbag Carry / Grip",
        "unit": "kg",
        "standard": 60.0,
        "exercise_matches": ["Carry", "Farmer's Walk", "Farmers Walk", "Farmers Carry", "Sandbag Carry", "Trap Bar Carry", "Deadlift Hold", "Plate Pinch", "Dead Hang", "Shrug"],
        "description": "Loaded carry grip and core endurance standard"
    }
}

# ------------------------------------------------------------------------------
# 3. MUSCLE GROUPS & HYPERTROPHY VOLUME BANDS (MEV / MAV / MRV)
# ------------------------------------------------------------------------------
# Minimum Effective Volume (MEV), Maximum Adaptive Volume (MAV), Maximum Recoverable Volume (MRV)
# Expressed in weekly hard working sets per muscle group.
MEV_MRV_BANDS: dict[str, dict[str, float]] = {
    "Chest": {"mev": 10.0, "mav_min": 14.0, "mav_max": 18.0, "mrv": 22.0},
    "Lats/Back": {"mev": 10.0, "mav_min": 14.0, "mav_max": 20.0, "mrv": 25.0},
    "Quads": {"mev": 8.0, "mav_min": 12.0, "mav_max": 18.0, "mrv": 22.0},
    "Hamstrings/Glutes": {"mev": 6.0, "mav_min": 10.0, "mav_max": 16.0, "mrv": 20.0},
    "Shoulders": {"mev": 8.0, "mav_min": 12.0, "mav_max": 18.0, "mrv": 22.0},
    "Triceps": {"mev": 6.0, "mav_min": 10.0, "mav_max": 16.0, "mrv": 20.0},
    "Biceps": {"mev": 6.0, "mav_min": 10.0, "mav_max": 16.0, "mrv": 20.0},
    "Forearms": {"mev": 4.0, "mav_min": 6.0, "mav_max": 12.0, "mrv": 16.0},
    "Core": {"mev": 0.0, "mav_min": 6.0, "mav_max": 12.0, "mrv": 16.0},
}

# Exhaustive Exercise to Muscle Group Mapping (incorporating exact Garmin exercise nomenclature)
EXERCISE_MUSCLE_MAP: dict[str, str] = {
    # Chest
    "Barbell Bench Press": "Chest",
    "Bench Press": "Chest",
    "Incline Bench Press": "Chest",
    "Dumbbell Bench Press": "Chest",
    "Incline Dumbbell Press": "Chest",
    "Chest Press": "Chest",
    "Machine Chest Press": "Chest",
    "Dumbbell Flye": "Chest",
    "Flye": "Chest",
    "Cable Flye": "Chest",
    "Cable Crossover": "Chest",
    "Push Up": "Chest",
    "Dips (Chest)": "Chest",

    # Lats / Back
    "Barbell Deadlift": "Lats/Back",
    "Deadlift": "Lats/Back",
    "Lat Pulldown": "Lats/Back",
    "Pull Up": "Lats/Back",
    "Chin Up": "Lats/Back",
    "Muscle Up": "Lats/Back",
    "Bar Muscle Up": "Lats/Back",
    "Ring Muscle Up": "Lats/Back",
    "Row": "Lats/Back",
    "Barbell Row": "Lats/Back",
    "Bent Over Row": "Lats/Back",
    "Bent Over Row With Dumbell": "Lats/Back",
    "Chest Supported Dumbbell Row": "Lats/Back",
    "One Arm Bent Over Row": "Lats/Back",
    "Dumbbell Row": "Lats/Back",
    "Seated Cable Row": "Lats/Back",
    "T Bar Row": "Lats/Back",
    "T-Bar Row": "Lats/Back",
    "Cable Row": "Lats/Back",
    "Straight Arm Pulldown": "Lats/Back",
    "Shrug": "Lats/Back",
    "Face Pull": "Lats/Back",
    "Ring Row": "Lats/Back",
    "Inverted Row": "Lats/Back",

    # Shoulders
    "Barbell Shoulder Press": "Shoulders",
    "Barbell Push Press": "Shoulders",
    "Shoulder Press": "Shoulders",
    "Overhead Press": "Shoulders",
    "Dumbbell Shoulder Press": "Shoulders",
    "Military Press": "Shoulders",
    "Lateral Raise": "Shoulders",
    "Dumbbell Lateral Raise": "Shoulders",
    "Cable Lateral Raise": "Shoulders",
    "One Arm Cable Lateral Raise": "Shoulders",
    "Front Raise": "Shoulders",
    "Upright Row": "Shoulders",
    "Reverse Flye": "Shoulders",
    "Rear Delt Flye": "Shoulders",
    "Wall Walk": "Shoulders",
    "Wall Walks": "Shoulders",
    "Handstand Push Up": "Shoulders",
    "Handstand Push-Up": "Shoulders",
    "HSPU": "Shoulders",

    # Quads
    "Barbell Back Squat": "Quads",
    "Squat": "Quads",
    "Back Squat": "Quads",
    "Barbell Squat": "Quads",
    "Front Squat": "Quads",
    "Goblet Squat": "Quads",
    "Dumbbell Bulgarian Split Squat": "Quads",
    "Split Squat": "Quads",
    "Bulgarian Split Squat": "Quads",
    "Lunge": "Quads",
    "Overhead Lunge": "Quads",
    "Overhead Lunges": "Quads",
    "Overheads Lunges": "Quads",
    "Walking Lunge": "Quads",
    "Walking Lunges": "Quads",
    "Leg Press": "Quads",
    "Hack Squat": "Quads",
    "Leg Extension": "Quads",
    "Single Leg Squat": "Quads",
    "Single Leg Squats": "Quads",
    "Pistol Squat": "Quads",
    "Pistol Squats": "Quads",

    # Hamstrings / Glutes
    "Romanian Deadlift": "Hamstrings/Glutes",
    "RDL": "Hamstrings/Glutes",
    "Straight Leg Deadlift": "Hamstrings/Glutes",
    "Dumbbell Romanian Deadlift": "Hamstrings/Glutes",
    "Barbell Hip Thrust On Floor": "Hamstrings/Glutes",
    "Hip Thrust": "Hamstrings/Glutes",
    "Barbell Hip Thrust": "Hamstrings/Glutes",
    "Glute Bridge": "Hamstrings/Glutes",
    "Leg Curl": "Hamstrings/Glutes",
    "Lying Leg Curl": "Hamstrings/Glutes",
    "Seated Leg Curl": "Hamstrings/Glutes",
    "Calf Raise": "Hamstrings/Glutes",
    "Standing Calf Raise": "Hamstrings/Glutes",
    "Seated Calf Raise": "Hamstrings/Glutes",
    "Kettlebell Swing": "Hamstrings/Glutes",
    "Sumo Deadlift": "Hamstrings/Glutes",
    "Sumo Deadlift High Pull": "Hamstrings/Glutes",
    "Dumbbell Sumo Deadlift": "Hamstrings/Glutes",
    "Dumbbell Sumo Deadlift High Pull": "Hamstrings/Glutes",

    # Triceps
    "Triceps Pressdown": "Triceps",
    "Triceps Pushdown": "Triceps",
    "Triceps Extension": "Triceps",
    "Triceps Press": "Triceps",
    "Cable Overhead Triceps Extension": "Triceps",
    "Cable Triceps Pushdown": "Triceps",
    "Rope Pushdown": "Triceps",
    "Skull Crusher": "Triceps",
    "Lying Triceps Extension": "Triceps",
    "Overhead Triceps Extension": "Triceps",
    "Close Grip Bench Press": "Triceps",
    "Bench Dip": "Triceps",
    "Dip": "Triceps",
    "Triceps Dip": "Triceps",
    "Dumbbell Kickback": "Triceps",

    # Biceps
    "Curl": "Biceps",
    "Barbell Biceps Curl": "Biceps",
    "Bicep Curl": "Biceps",
    "Barbell Curl": "Biceps",
    "Dumbbell Curl": "Biceps",
    "Dumbbell Hammer Curl": "Biceps",
    "Hammer Curl": "Biceps",
    "Incline Dumbbell Biceps Curl": "Biceps",
    "Incline Dumbbell Curl": "Biceps",
    "Reverse Grip Barbell Biceps Curl": "Biceps",
    "Preacher Curl": "Biceps",
    "Cable Curl": "Biceps",
    "Concentration Curl": "Biceps",
    # Forearms & Grip (ATHX Sandbag & Floor Pull Prep)
    "Barbell Wrist Curl": "Forearms",
    "Wrist Curl": "Forearms",
    "Dumbbell Wrist Curl": "Forearms",
    "Barbell Reverse Wrist Curl": "Forearms",
    "Dumbbell Reverse Wrist Curl": "Forearms",
    "Dead Hang": "Forearms",
    "Plate Pinch": "Forearms",
    "Farmers Carry": "Forearms",
    "Farmer's Walk": "Forearms",

    # Core
    "Sit Up": "Core",
    "Sit-Up": "Core",
    "Sit-Ups": "Core",
    "Sit Ups": "Core",
    "Leg Raise": "Core",
    "Hanging Leg Raise": "Core",
    "Russian Twist": "Core",
    "Side Bend": "Core",
    "Carry": "Core",
    "Plank": "Core",
    "Ab Wheel Rollout": "Core",
    "Cable Crunch": "Core",
    "Crunch": "Core",
    "Hollow Rock": "Core",
    "Hollow Hold": "Core",

    # Cardio & Warmup
    "Snatch": "Full Body",
    "Single Arm Dumbbell Snatch": "Full Body",
    "Single Arm DB Snatch": "Full Body",
    "Dumbbell Snatch": "Full Body",
    "Devil Press": "Full Body",
    "Devils Press": "Full Body",
    "Devil's Press": "Full Body",
    "Single Arm Devil Press": "Full Body",
    "Single Arm Dumbbells Devil Press": "Full Body",
    "Single Arm Dumbbell Devil Press": "Full Body",
    "Hang Snatch": "Full Body",
    "Hang Snatches": "Full Body",
    "Hang Power Snatch": "Full Body",
    "Hang Power Snatches": "Full Body",
    "Clean": "Full Body",
    "Hang Clean": "Full Body",
    "Hang Cleans": "Full Body",
    "Squat Clean": "Full Body",
    "Power Clean": "Full Body",
    "Clean and Jerk": "Full Body",
    "Thruster": "Shoulders",
    "Thrusters": "Shoulders",
    "Kettlebell Thruster": "Shoulders",
    "Kettlebell Thrusters": "Shoulders",
    "Sandbag Thruster": "Shoulders",
    "Sandbag Thrusters": "Shoulders",
    "Barbell Hack Squat": "Quads",
    "Leg Extensions": "Quads",
    "Single Leg Sliding Leg Curl": "Hamstrings/Glutes",
    "Weighted Seated Calf Raise": "Hamstrings/Glutes",
    "Farmers Walk": "Forearms",
    "Incline Barbell Bench Press": "Chest",
    "Knee Raises": "Core",
    "Snatch Barbell": "Full Body",
    "Wall Ball": "Quads",
    "Box Jump": "Quads",
    "Toes to Bar": "Core",
    "Toes To Bar": "Core",
    "Burpee": "Full Body",
    "Jump Rope": "Full Body",
    "Jumping Jacks": "Full Body",
    "Warm Up": "Warmup",
    "Stretch Butterfly": "Warmup",
    "Stretch Calf": "Warmup",
    "Stretch Triceps": "Warmup",
}

# Muscle Group to Split Association (for dominant session classification)
MUSCLE_TO_SPLIT_MAP: dict[str, str] = {
    "Chest": "Push",
    "Shoulders": "Push",
    "Triceps": "Push",
    "Lats/Back": "Pull",
    "Biceps": "Pull",
    "Forearms": "Pull",
    "Quads": "Legs",
    "Hamstrings/Glutes": "Legs",
    "Core": "Core",
    "Full Body": "Full Body",
    "Warmup": "Warmup"
}

# ------------------------------------------------------------------------------
# 3b. MULTI-MUSCLE & COMPOUND STIMULUS VOLUME FACTORS
# ------------------------------------------------------------------------------
# In sports science (e.g. Renaissance Periodization / Dr. Mike Israetel hypertrophy standards),
# compound exercises provide substantial hypertrophy stimulus to multiple muscle groups simultaneously.
# Sets for these exercises contribute fractional or full set volume to each target muscle.
EXERCISE_COMPOUND_VOLUME: dict[str, dict[str, float]] = {
    # Hybrid Movements: Full front squat + overhead push press (stimulates Quads and Shoulders)
    "Thruster": {"Quads": 1.0, "Shoulders": 1.0},
    "Thrusters": {"Quads": 1.0, "Shoulders": 1.0},
    "Kettlebell Thruster": {"Quads": 1.0, "Shoulders": 1.0},
    "Kettlebell Thrusters": {"Quads": 1.0, "Shoulders": 1.0},
    "Sandbag Thruster": {"Quads": 1.0, "Shoulders": 1.0},
    "Sandbag Thrusters": {"Quads": 1.0, "Shoulders": 1.0},
    "Wall Ball": {"Quads": 1.0, "Shoulders": 0.75},

    # Posterior Chain Compounds: Hamstring/Glute hinge + isometric back/lat pull
    "Barbell Deadlift": {"Hamstrings/Glutes": 1.0, "Lats/Back": 0.75},
    "Deadlift": {"Hamstrings/Glutes": 1.0, "Lats/Back": 0.75},
    "Sumo Deadlift": {"Hamstrings/Glutes": 1.0, "Quads": 0.5},
    "Sumo Deadlift High Pull": {"Hamstrings/Glutes": 0.75, "Shoulders": 0.75, "Lats/Back": 0.5},
    "Kettlebell Swing": {"Hamstrings/Glutes": 1.0, "Core": 0.25},

    # Squat & Lunge Compounds: Prime Quad mover + secondary glute/adductor stimulus
    "Barbell Back Squat": {"Quads": 1.0, "Hamstrings/Glutes": 0.5},
    "Back Squat": {"Quads": 1.0, "Hamstrings/Glutes": 0.5},
    "Squat": {"Quads": 1.0, "Hamstrings/Glutes": 0.5},
    "Barbell Squat": {"Quads": 1.0, "Hamstrings/Glutes": 0.5},
    "Front Squat": {"Quads": 1.0, "Hamstrings/Glutes": 0.25},
    "Goblet Squat": {"Quads": 1.0, "Hamstrings/Glutes": 0.25},
    "Barbell Hack Squat": {"Quads": 1.0},
    "Leg Press": {"Quads": 1.0, "Hamstrings/Glutes": 0.25},
    "Lunge": {"Quads": 1.0, "Hamstrings/Glutes": 0.5},
    "Walking Lunge": {"Quads": 1.0, "Hamstrings/Glutes": 0.5},
    "Walking Lunges": {"Quads": 1.0, "Hamstrings/Glutes": 0.5},
    "Bulgarian Split Squat": {"Quads": 1.0, "Hamstrings/Glutes": 0.5},
    "Split Squat": {"Quads": 1.0, "Hamstrings/Glutes": 0.5},
    "Single Leg Squat": {"Quads": 1.0, "Hamstrings/Glutes": 0.5},
    "Overhead Lunge": {"Quads": 1.0, "Hamstrings/Glutes": 0.5, "Shoulders": 0.5},

    # Upper Body Compounds: Chest presses (Triceps + Anterior Delts)
    "Barbell Bench Press": {"Chest": 1.0, "Triceps": 0.5, "Shoulders": 0.5},
    "Bench Press": {"Chest": 1.0, "Triceps": 0.5, "Shoulders": 0.5},
    "Incline Barbell Bench Press": {"Chest": 1.0, "Triceps": 0.5, "Shoulders": 0.5},
    "Incline Bench Press": {"Chest": 1.0, "Triceps": 0.5, "Shoulders": 0.5},
    "Dumbbell Bench Press": {"Chest": 1.0, "Triceps": 0.5, "Shoulders": 0.5},
    "Incline Dumbbell Press": {"Chest": 1.0, "Triceps": 0.5, "Shoulders": 0.5},
    "Push Up": {"Chest": 1.0, "Triceps": 0.5, "Shoulders": 0.25},
    "Dip": {"Triceps": 1.0, "Chest": 0.5, "Shoulders": 0.5},
    "Bench Dip": {"Triceps": 1.0, "Chest": 0.25, "Shoulders": 0.25},

    # Overhead Presses (Shoulders + Triceps)
    "Overhead Press": {"Shoulders": 1.0, "Triceps": 0.5},
    "Barbell Shoulder Press": {"Shoulders": 1.0, "Triceps": 0.5},
    "Barbell Push Press": {"Shoulders": 1.0, "Triceps": 0.5, "Quads": 0.25},
    "Push Press": {"Shoulders": 1.0, "Triceps": 0.5, "Quads": 0.25},
    "Military Press": {"Shoulders": 1.0, "Triceps": 0.5},
    "Dumbbell Shoulder Press": {"Shoulders": 1.0, "Triceps": 0.5},
    "Wall Walk": {"Shoulders": 1.0, "Core": 0.5},
    "Handstand Push Up": {"Shoulders": 1.0, "Triceps": 0.5},

    # Upper Body Pulls: Lats/Back + Biceps secondary
    "Pull Up": {"Lats/Back": 1.0, "Biceps": 0.5},
    "Chin Up": {"Lats/Back": 1.0, "Biceps": 0.75},
    "Muscle Up": {"Lats/Back": 1.0, "Chest": 0.5, "Triceps": 0.5},
    "Bar Muscle Up": {"Lats/Back": 1.0, "Chest": 0.5, "Triceps": 0.5},
    "Ring Muscle Up": {"Lats/Back": 1.0, "Chest": 0.5, "Triceps": 0.5},
    "Lat Pulldown": {"Lats/Back": 1.0, "Biceps": 0.5},
    "Row": {"Lats/Back": 1.0, "Biceps": 0.5},
    "Barbell Row": {"Lats/Back": 1.0, "Biceps": 0.5},
    "Bent Over Row": {"Lats/Back": 1.0, "Biceps": 0.5},
    "Dumbbell Row": {"Lats/Back": 1.0, "Biceps": 0.5},
    "Seated Cable Row": {"Lats/Back": 1.0, "Biceps": 0.5},
    "T Bar Row": {"Lats/Back": 1.0, "Biceps": 0.5},
    "T-Bar Row": {"Lats/Back": 1.0, "Biceps": 0.5},

    # Olympic & Explosive Full-Body
    "Snatch": {"Hamstrings/Glutes": 0.5, "Shoulders": 0.5, "Quads": 0.5, "Lats/Back": 0.5},
    "Single Arm Dumbbell Snatch": {"Hamstrings/Glutes": 0.5, "Shoulders": 0.5, "Quads": 0.25},
    "Clean": {"Quads": 0.5, "Hamstrings/Glutes": 0.5, "Lats/Back": 0.5},
    "Devil Press": {"Shoulders": 0.75, "Hamstrings/Glutes": 0.5, "Chest": 0.5},
    "Single Arm Dumbbells Devil Press": {"Shoulders": 0.75, "Hamstrings/Glutes": 0.5, "Chest": 0.5},

    # Carries
    "Farmers Walk": {"Forearms": 1.0, "Core": 0.5},
    "Farmers Carry": {"Forearms": 1.0, "Core": 0.5},
    "Farmer's Walk": {"Forearms": 1.0, "Core": 0.5},
}

# ------------------------------------------------------------------------------
# 4. LOAD PLAUSIBILITY LIMITS (DATA INTEGRITY AUDIT)
# ------------------------------------------------------------------------------
# Per-exercise maximum and minimum plausible load (kg).
# Loads outside these ranges are flagged as Garmin stack/per-side/auto-weight artifacts,
# excluded from e1RM / PR detection, and reported in the Data Quality audit panel.
PLAUSIBLE_LOAD_RANGES: dict[str, tuple[float, float]] = {
    "Push Up": (0.0, 45.0),            # Weight > 45 kg on pushups is user-bodyweight artifact (e.g. 90 kg)
    "Pull Up": (0.0, 50.0),            # Added weight > 50 kg is artifact (e.g. 110 kg entered as bodyweight)
    "Chin Up": (0.0, 50.0),
    "Muscle Up": (0.0, 40.0),
    "Dip": (0.0, 60.0),
    "Bench Dip": (0.0, 50.0),
    "Cable Crossover": (2.0, 55.0),    # Single cable stack > 55 kg is artifact (e.g. 70, 80, 85 kg)
    "Cable Flye": (2.0, 55.0),
    "Dumbbell Flye": (2.0, 42.5),      # Per-dumbbell > 42.5 kg is artifact (e.g. 70, 105 kg)
    "Flye": (2.0, 42.5),
    "Shrug": (10.0, 160.0),            # Shrug > 160 kg is artifact (e.g. 180 kg machine stack)
    "Lateral Raise": (2.0, 30.0),
    "Cable Lateral Raise": (1.0, 40.0),
    "One Arm Cable Lateral Raise": (1.0, 40.0),
    "Front Raise": (2.0, 30.0),
    "Face Pull": (5.0, 70.0),
    "Curl": (4.0, 50.0),
    "Barbell Biceps Curl": (10.0, 60.0),
    "Dumbbell Hammer Curl": (4.0, 35.0),
    "Triceps Pressdown": (5.0, 65.0),
    "Triceps Extension": (5.0, 65.0),
    "Triceps Press": (10.0, 90.0),
    "Bench Press": (20.0, 160.0),
    "Barbell Bench Press": (20.0, 160.0),
    "Incline Bench Press": (20.0, 140.0),
    "Back Squat": (20.0, 200.0),
    "Barbell Back Squat": (20.0, 200.0),
    "Squat": (20.0, 200.0),
    "Front Squat": (20.0, 180.0),
    "Thruster": (15.0, 100.0),
    "Clean": (20.0, 150.0),
    "Squat Clean": (20.0, 150.0),
    "Power Clean": (20.0, 150.0),
    "Clean and Jerk": (20.0, 150.0),
    "Snatch": (0.0, 140.0),
    "Single Arm Dumbbell Snatch": (0.0, 60.0),
    "Single Arm DB Snatch": (0.0, 60.0),
    "Dumbbell Snatch": (0.0, 60.0),
    "Devil Press": (0.0, 60.0),
    "Devils Press": (0.0, 60.0),
    "Devil's Press": (0.0, 60.0),
    "Single Arm Devil Press": (0.0, 60.0),
    "Single Arm Dumbbells Devil Press": (0.0, 60.0),
    "Single Arm Dumbbell Devil Press": (0.0, 60.0),
    "Hang Snatch": (0.0, 140.0),
    "Power Snatch": (0.0, 140.0),
    "Wall Ball": (4.0, 20.0),
    "Deadlift": (40.0, 240.0),
    "Barbell Deadlift": (40.0, 240.0),
    "Sumo Deadlift": (15.0, 240.0),
    "Sumo Deadlift High Pull": (10.0, 140.0),
    "Dumbbell Sumo Deadlift": (5.0, 100.0),
    "Dumbbell Sumo Deadlift High Pull": (5.0, 80.0),
    "Straight Leg Deadlift": (20.0, 180.0),
    "Romanian Deadlift": (20.0, 180.0),
    "Leg Press": (40.0, 450.0),
    "Leg Extension": (10.0, 130.0),
    "Single Leg Squat": (0.0, 60.0),
    "Single Leg Squats": (0.0, 60.0),
    "Pistol Squat": (0.0, 60.0),
    "Pistol Squats": (0.0, 60.0),
    "Leg Curl": (10.0, 120.0),
    "Lunge": (0.0, 100.0),
    "Overhead Lunge": (0.0, 100.0),
    "Walking Lunge": (0.0, 100.0),
    "Barbell Shoulder Press": (15.0, 100.0),
    "Shoulder Press": (15.0, 100.0),
    "Overhead Press": (15.0, 100.0),
    "Barbell Push Press": (20.0, 110.0),
    "Dumbbell Shoulder Press": (8.0, 45.0),
    "Sit Up": (0.0, 40.0),
    "Sit-Up": (0.0, 40.0),
    "Sit-Ups": (0.0, 40.0),
    "Sit Ups": (0.0, 40.0),
    "Cable Crunch": (5.0, 120.0),
    "Barbell Wrist Curl": (5.0, 70.0),
    "Wrist Curl": (2.0, 60.0),
    "Dumbbell Wrist Curl": (2.0, 35.0),
    "Barbell Reverse Wrist Curl": (5.0, 50.0),
    "Dumbbell Reverse Wrist Curl": (2.0, 30.0),
    "Dead Hang": (0.0, 50.0),
    "Plate Pinch": (2.5, 40.0),
    "Farmers Carry": (10.0, 100.0),
    "Farmer's Walk": (10.0, 100.0),
    "Farmers Walk": (10.0, 100.0),
    "Ring Row": (0.0, 50.0),
    "Inverted Row": (0.0, 50.0),
}

# Genuine Bodyweight Movements (if weight == 0 and reps > 0, calculate volume using bodyweight)
BODYWEIGHT_EXERCISES: set[str] = {
    "Push Up",
    "Pull Up",
    "Chin Up",
    "Dip",
    "Bench Dip",
    "Triceps Dip",
    "Dips (Chest)",
    "Hanging Leg Raise",
    "Plank",
    "Bodyweight Squat",
    "Dead Hang",
    "Ring Row",
    "Inverted Row",
}

# ------------------------------------------------------------------------------
# 5. RECOVERY & READINESS COMPOSITE CONFIGURATION
# ------------------------------------------------------------------------------
# Explicit formula weights for ATHX Readiness Score (Composite 0-100%)
READINESS_WEIGHTS = {
    "sleep_debt": 0.25,        # 7-day average sleep vs TARGET_SLEEP_HRS (7.5h) target
    "rhr_baseline": 0.25,      # 7-day RHR vs 28-day baseline deviation
    "gait_asymmetry": 0.20,    # 7-day gait asymmetry vs 2.0% safety threshold
    "acwr_band": 0.20,         # ACWR proximity to sweet spot (0.8 - 1.3)
    "protein_intake": 0.10,    # Daily protein vs 1.6-2.2 g/kg target
}

# Sleep Quality thresholds
MIN_VALID_SLEEP_HRS: float = 3.0       # Nights < 3.0h treated as non-wear artifacts
MAX_USABLE_IN_BED_HRS: float = 14.0    # In_Bed > 14.0h invalidates sleep efficiency calculation

# Mobility outliers
MAX_PLAUSIBLE_FLIGHTS: float = 60.0    # Flights > 60 winsorized/flagged (pressure/flight artifacts)
