"""
================================================================================
ATHX 2027 Athlete Analytics & Data Integrity Engine
================================================================================
Provides rigorous data cleaning, unknown exercise imputation, session-level
split classification, plausible-load validation, hypertrophy volume tracking,
trailing 28-day e1RM progression, Foster monotony/strain, and transparent
readiness composite scoring.
"""

from __future__ import annotations
import csv
import json
import math
from datetime import datetime, date, timedelta
from pathlib import Path
from collections import defaultdict

import athx_config

class DataAuditTracker:
    """Tracks all data exclusions, imputations, and quality flags."""
    def __init__(self):
        self.exclusions = []
        self.summary = {
            "total_raw_strength_sets": 0,
            "pre_may_excluded_sets": 0,
            "zero_reps_dropped": 0,
            "valid_working_sets": 0,
            "unknown_sets_total": 0,
            "unknown_imputed": 0,
            "unknown_unattributed": 0,
            "load_implausible_flags": 0,
            "sleep_nights_total": 0,
            "sleep_pre_may_excluded": 0,
            "sleep_non_wear_dropped": 0,
            "sleep_usable_efficiency_nights": 0,
            "sleep_in_bed_overflow_excluded": 0,
            "mobility_days_total": 0,
            "mobility_flight_outliers_capped": 0,
            "body_comp_weigh_ins": 0,
            "nutrition_days_logged": 0,
        }

    def log(self, category: str, date_str: str, identifier: str, raw_value: any, action: str, reason: str):
        self.exclusions.append({
            "category": category,
            "date": date_str,
            "identifier": identifier,
            "raw_value": str(raw_value),
            "action": action,
            "reason": reason
        })

    def to_dict(self):
        return {
            "summary": self.summary,
            "records": self.exclusions
        }


def parse_date(date_str: str) -> date:
    return datetime.strptime(date_str[:10], "%Y-%m-%d").date()


# ------------------------------------------------------------------------------
# 1. GARMIN STRENGTH DATA ENGINE
# ------------------------------------------------------------------------------
def process_strength_data(raw_records: list[dict], audit: DataAuditTracker) -> dict:
    """
    Cleans and analyzes Garmin strength records:
      - Filters for Date >= DATA_START (with audit trail)
      - Drops zero-rep junk sets
      - Imputes Unknown exercises within Activity_ID where load/reps signature matches
      - Reclassifies session split at SESSION level by dominant muscle group
      - Validates plausible load limits
      - Computes volume (incorporating bodyweight for genuine BW movements)
      - Computes e1RM only for reps <= E1RM_MAX_REPS on plausible loads
      - Computes weekly hypertrophy sets per muscle group vs MEV/MRV bands
      - Computes trailing 28-day best e1RM, 4-week slope, and competition projection
      - Computes Foster training monotony and strain
      - Computes ACWR dynamically to max(Date)
    """
    audit.summary["total_raw_strength_sets"] = len(raw_records)
    data_start = parse_date(athx_config.DATA_START)

    # 1a. Separate pre-May lookback vs active analysis
    pre_may_sets = []
    active_sets = []
    for r in raw_records:
        d = parse_date(r["Date"])
        if d < data_start:
            pre_may_sets.append(r)
            audit.summary["pre_may_excluded_sets"] += 1
            if len(pre_may_sets) <= 5:  # Log sample of pre-May exclusions
                audit.log("Pre-May Exclusion", r["Date"], f"{r.get('Activity_ID')}:{r.get('Exercise')}", 
                          f"{r.get('Weight_kg')}kg x {r.get('Reps')}", "Excluded from KPIs", 
                          f"Dated before {athx_config.DATA_START} floor")
        else:
            active_sets.append(r)

    # 1b. Drop zero-rep junk sets from active data
    filtered_sets = []
    for r in active_sets:
        reps = int(r.get("Reps", 0) or 0)
        weight = float(r.get("Weight_kg", 0.0) or 0.0)
        ex = r.get("Exercise", "Unknown")
        
        if reps <= 0:
            audit.summary["zero_reps_dropped"] += 1
            audit.log("Junk Record", r["Date"], f"{r.get('Activity_ID')}:{ex}", 
                      f"Reps={reps}, Weight={weight}kg", "Dropped", "Zero repetition set")
            continue
        filtered_sets.append(r)

    audit.summary["valid_working_sets"] = len(filtered_sets)

    # 1c. Imputation pass for Unknown exercises within Activity_ID
    # Group by Activity_ID
    sessions_dict = defaultdict(list)
    for r in filtered_sets:
        act_id = str(r.get("Activity_ID") or r["Date"])
        sessions_dict[act_id].append(r)

    processed_sets = []
    imputed_count = 0
    unattributed_count = 0

    for act_id, sets in sessions_dict.items():
        known_exercises = [s for s in sets if (s.get("Exercise") or "").lower() not in ["unknown", ""]]
        
        # Build map of weight -> known exercises in this session
        weight_to_ex = defaultdict(set)
        for s in known_exercises:
            w = float(s.get("Weight_kg", 0.0) or 0.0)
            if w > 0:
                weight_to_ex[w].add(s["Exercise"])

        for s in sets:
            s_copy = dict(s)
            raw_ex = s_copy.get("Exercise", "Unknown")
            w = float(s_copy.get("Weight_kg", 0.0) or 0.0)
            reps = int(s_copy.get("Reps", 0) or 0)

            is_unknown = (raw_ex.lower() in ["unknown", ""])
            if is_unknown:
                audit.summary["unknown_sets_total"] += 1
                # Attempt imputation: exact weight match with exactly ONE known exercise in session
                candidates = weight_to_ex.get(w, set())
                if len(candidates) == 1:
                    imputed_name = list(candidates)[0]
                    s_copy["Exercise"] = imputed_name
                    s_copy["Imputed"] = True
                    s_copy["Original_Exercise"] = "Unknown"
                    imputed_count += 1
                    audit.log("Exercise Imputed", s_copy["Date"], f"{act_id}:Set {s_copy.get('Set')}",
                              f"{w}kg x {reps}", f"Imputed as '{imputed_name}'", 
                              f"Matched session load signature of {imputed_name}")
                else:
                    s_copy["Exercise"] = "Unattributed"
                    s_copy["Imputed"] = False
                    s_copy["Original_Exercise"] = "Unknown"
                    unattributed_count += 1
                    audit.log("Exercise Unattributed", s_copy["Date"], f"{act_id}:Set {s_copy.get('Set')}",
                              f"{w}kg x {reps}", "Retained in Tonnage, Excluded from e1RM", 
                              "Unknown exercise without distinct session signature")
            else:
                s_copy["Imputed"] = False
                s_copy["Original_Exercise"] = raw_ex

            processed_sets.append(s_copy)

    audit.summary["unknown_imputed"] = imputed_count
    audit.summary["unknown_unattributed"] = unattributed_count

    # 1d. Muscle Group & Plausibility Validation & Effective Volume
    bodyweight_kg = athx_config.DEFAULT_BODYWEIGHT_KG

    for s in processed_sets:
        ex = s["Exercise"]
        w = float(s.get("Weight_kg", 0.0) or 0.0)
        reps = int(s.get("Reps", 0) or 0)

        # Map to muscle group
        muscle = athx_config.EXERCISE_MUSCLE_MAP.get(ex)
        if not muscle:
            if ex == "Unattributed":
                muscle = "Unattributed"
            else:
                muscle = "Core" if any(k in ex.lower() for k in ["sit up", "twist", "raise", "carry"]) else "Other"
        s["Muscle_Group"] = muscle

        # Plausible Load Check
        plausible = True
        min_p, max_p = 0.0, 999.0
        if ex in athx_config.PLAUSIBLE_LOAD_RANGES:
            min_p, max_p = athx_config.PLAUSIBLE_LOAD_RANGES[ex]
            if w < min_p or w > max_p:
                plausible = False
                audit.summary["load_implausible_flags"] += 1
                audit.log("Implausible Load", s["Date"], f"{s.get('Activity_ID')}:{ex}",
                          f"{w}kg (plausible: {min_p}-{max_p}kg)", "Excluded from e1RM/PR",
                          f"Exceeds plausible limit of {max_p}kg for {ex}")

        s["Load_Plausible"] = plausible

        # Effective Volume (account for bodyweight movements)
        is_bw = (ex in athx_config.BODYWEIGHT_EXERCISES and w == 0.0)
        effective_w = bodyweight_kg if is_bw else w
        s["Is_Bodyweight"] = is_bw
        s["Effective_Weight_kg"] = round(effective_w, 1)
        s["Total_Volume_kg"] = round(effective_w * reps, 1)

        # e1RM Calculation: only if reps <= E1RM_MAX_REPS and plausible load
        if plausible and reps <= athx_config.E1RM_MAX_REPS and reps > 0 and effective_w > 0:
            # Epley: w * (1 + reps / 30)
            s["e1RM_kg"] = round(effective_w * (1.0 + reps / 30.0), 1)
        else:
            s["e1RM_kg"] = None

        # Junk volume check: reps >= 35 or very low stimulus
        s["Is_Junk_Volume"] = (reps >= 35 and effective_w <= 15.0)

    # 1e. Session-Level Split Classification
    # Re-group by Activity_ID to determine dominant split
    activity_groups = defaultdict(list)
    for s in processed_sets:
        act_id = str(s.get("Activity_ID") or s["Date"])
        activity_groups[act_id].append(s)

    session_split_counts = defaultdict(int)
    for act_id, sets in activity_groups.items():
        split_votes = {"Push": 0, "Pull": 0, "Legs": 0}
        for s in sets:
            m = s["Muscle_Group"]
            split = athx_config.MUSCLE_TO_SPLIT_MAP.get(m)
            if split in split_votes:
                split_votes[split] += 1
        
        tot_classified = sum(split_votes.values())
        if tot_classified == 0:
            session_split = "Full Body"
        else:
            top_split, count = max(split_votes.items(), key=lambda x: x[1])
            if count / tot_classified >= 0.45:
                session_split = top_split
            else:
                session_split = "Full Body"

        session_split_counts[session_split] += 1
        for s in sets:
            s["Session_Type"] = session_split

    # 1f. Sort all processed sets newest-first (Date DESC, Set ASC)
    processed_sets.sort(key=lambda x: (x["Date"], -x.get("Set", 1)), reverse=True)

    # 1g. Weekly Hypertrophy Sets Breakdown
    max_d = max(parse_date(s["Date"]) for s in processed_sets) if processed_sets else date.today()
    weeks_count = max(1.0, (max_d - data_start).days / 7.0)

    # Weekly sets per muscle group across timeline
    # Generate list of week labels (YYYY-Www)
    curr_w_start = data_start - timedelta(days=data_start.weekday())
    week_keys = []
    while curr_w_start <= max_d:
        w_end = curr_w_start + timedelta(days=6)
        week_keys.append(f"{curr_w_start.strftime('%b %d')}")
        curr_w_start += timedelta(days=7)

    # Group sets by week index
    weekly_matrix = {m: [0] * len(week_keys) for m in athx_config.MEV_MRV_BANDS}
    weekly_matrix["Unattributed"] = [0] * len(week_keys)

    curr_w_start = data_start - timedelta(days=data_start.weekday())
    for s in processed_sets:
        d = parse_date(s["Date"])
        w_idx = (d - curr_w_start).days // 7
        if 0 <= w_idx < len(week_keys):
            m = s["Muscle_Group"]
            if m in weekly_matrix:
                weekly_matrix[m][w_idx] += 1
            else:
                weekly_matrix["Unattributed"][w_idx] += 1

    # Muscle group summary averages & status
    muscle_summary = {}
    for m, band in athx_config.MEV_MRV_BANDS.items():
        tot_sets = sum(weekly_matrix[m])
        avg_wk = round(tot_sets / weeks_count, 1)
        mev = band["mev"]
        mav_min = band["mav_min"]
        mav_max = band["mav_max"]
        mrv = band["mrv"]

        if avg_wk < mev:
            status = "BELOW MEV"
            badge_class = "badge-danger"
        elif avg_wk < mav_min:
            status = "Near MEV"
            badge_class = "badge-neutral"
        elif avg_wk <= mav_max:
            status = "In MAV Zone"
            badge_class = "badge-sweetspot"
        elif avg_wk <= mrv:
            status = "Near MRV"
            badge_class = "badge-warning"
        else:
            status = "ABOVE MRV"
            badge_class = "badge-danger"

        muscle_summary[m] = {
            "total_sets": tot_sets,
            "avg_weekly_sets": avg_wk,
            "mev": mev,
            "mav_min": mav_min,
            "mav_max": mav_max,
            "mrv": mrv,
            "status": status,
            "badge_class": badge_class,
            "history": weekly_matrix[m]
        }

    # Add Unattributed to summary
    unattr_total = sum(weekly_matrix["Unattributed"])
    muscle_summary["Unattributed"] = {
        "total_sets": unattr_total,
        "avg_weekly_sets": round(unattr_total / weeks_count, 1),
        "mev": 0, "mav_min": 0, "mav_max": 0, "mrv": 0,
        "status": "Unattributed Sets",
        "badge_class": "badge-neutral",
        "history": weekly_matrix["Unattributed"]
    }

    # 1h. Trailing 28-Day Best e1RM, Relative Strength & Projections
    main_lifts = {
        "Bench Press": ["Bench Press", "Barbell Bench Press"],
        "Back Squat": ["Back Squat", "Barbell Back Squat", "Squat"],
        "Deadlift": ["Deadlift", "Barbell Deadlift"],
        "Overhead Press": ["Overhead Press", "Barbell Shoulder Press", "Shoulder Press", "Military Press"]
    }

    comp_date = parse_date(athx_config.COMPETITION_DATE)
    weeks_to_comp = max(0.0, (comp_date - max_d).days / 7.0)

    lift_progressions = {}
    for lift_name, aliases in main_lifts.items():
        lift_sets = [s for s in processed_sets if s["Exercise"] in aliases and s.get("e1RM_kg")]
        if not lift_sets:
            lift_progressions[lift_name] = {
                "current_28d_best": None,
                "relative_strength": None,
                "best_set_load": "No data",
                "slope_4w": 0.0,
                "projected_e1rm": None,
                "history": []
            }
            continue

        # Sort chronological for trajectory
        lift_sets_chrono = sorted(lift_sets, key=lambda x: x["Date"])
        
        # 28-day trailing best for current date
        cutoff_28d = max_d - timedelta(days=28)
        trailing_28d_sets = [s for s in lift_sets if parse_date(s["Date"]) >= cutoff_28d]
        
        if trailing_28d_sets:
            best_28d_set = max(trailing_28d_sets, key=lambda x: x["e1RM_kg"])
            best_28d_val = best_28d_set["e1RM_kg"]
            best_load_str = f"{best_28d_set['Weight_kg']} kg × {best_28d_set['Reps']} reps"
        else:
            best_28d_set = max(lift_sets, key=lambda x: x["e1RM_kg"])
            best_28d_val = best_28d_set["e1RM_kg"]
            best_load_str = f"{best_28d_set['Weight_kg']} kg × {best_28d_set['Reps']} reps (prior to 28d)"

        # Compute 4-week slope
        # Compare best e1RM in last 4 weeks vs best in previous 4 weeks
        prev_4w_cutoff = max_d - timedelta(days=56)
        recent_4w = [s["e1RM_kg"] for s in lift_sets if parse_date(s["Date"]) >= max_d - timedelta(days=28)]
        prev_4w = [s["e1RM_kg"] for s in lift_sets if prev_4w_cutoff <= parse_date(s["Date"]) < max_d - timedelta(days=28)]
        
        best_rec = max(recent_4w) if recent_4w else best_28d_val
        best_prev = max(prev_4w) if prev_4w else best_rec
        slope_4w = round(best_rec - best_prev, 1)

        # Projected e1RM at competition date (extrapolation)
        # Cap weekly progression conservatively at +0.5 kg/week max to avoid absurd projections
        weekly_rate = min(0.5, max(-0.5, slope_4w / 4.0)) if slope_4w != 0.0 else 0.2
        projected = round(best_28d_val + (weekly_rate * weeks_to_comp), 1)

        rel_strength = round(best_28d_val / bodyweight_kg, 2)

        lift_progressions[lift_name] = {
            "current_28d_best": best_28d_val,
            "relative_strength": rel_strength,
            "best_set_load": best_load_str,
            "best_date": best_28d_set["Date"],
            "slope_4w": slope_4w,
            "projected_e1rm": projected,
            "history": [{"date": s["Date"], "e1rm": s["e1RM_kg"], "weight": s["Weight_kg"], "reps": s["Reps"]} for s in lift_sets_chrono]
        }

    # 1i. Foster Training Monotony & Strain + Dynamic ACWR
    # Build complete daily load timeline from (DATA_START - 28d) to max_d
    # Pre-May lookback is utilized ONLY for chronic baseline rolling calculation
    chronic_lookback_start = data_start - timedelta(days=athx_config.CHRONIC_LOOKBACK_DAYS)
    
    daily_volume = defaultdict(float)
    # Include pre-May sets that fall in the lookback window for chronic baseline
    for r in pre_may_sets:
        d = parse_date(r["Date"])
        if d >= chronic_lookback_start:
            daily_volume[d] += float(r.get("Total_Volume_kg", 0.0) or 0.0)

    for s in processed_sets:
        d = parse_date(s["Date"])
        daily_volume[d] += s["Total_Volume_kg"]

    # Generate complete day-by-day series
    curr_d = data_start
    daily_series = []
    while curr_d <= max_d:
        daily_series.append({
            "date": curr_d.isoformat(),
            "volume_kg": daily_volume.get(curr_d, 0.0)
        })
        curr_d += timedelta(days=1)

    # ACWR at max_d
    last_7_days = [daily_volume.get(max_d - timedelta(days=i), 0.0) for i in range(7)]
    last_28_days = [daily_volume.get(max_d - timedelta(days=i), 0.0) for i in range(28)]
    
    acute_load = sum(last_7_days) / 7.0
    chronic_load = (sum(last_28_days) / 28.0)
    acwr = round(acute_load / chronic_load, 2) if chronic_load > 0 else 1.0

    if 0.8 <= acwr <= 1.3:
        acwr_status = "Sweet Spot (Optimal)"
        acwr_badge = "badge-sweetspot"
    elif acwr < 0.8:
        acwr_status = "Under-training / Deload"
        acwr_badge = "badge-neutral"
    elif acwr <= 1.5:
        acwr_status = "Elevated Fatigue Risk"
        acwr_badge = "badge-warning"
    else:
        acwr_status = "High Injury Risk (>1.5)"
        acwr_badge = "badge-danger"

    # Foster Monotony & Strain (trailing 7 days)
    mean_7d = sum(last_7_days) / 7.0
    variance_7d = sum((x - mean_7d) ** 2 for x in last_7_days) / 7.0
    sd_7d = math.sqrt(variance_7d)
    monotony = round(mean_7d / sd_7d, 2) if sd_7d > 50.0 else 1.0
    strain = round((sum(last_7_days) * monotony) / 1000.0, 1) # in k-units

    # Junk Volume calculation
    junk_sets = [s for s in processed_sets if s.get("Is_Junk_Volume")]
    junk_vol_kg = sum(s["Total_Volume_kg"] for s in junk_sets)
    total_vol_kg = sum(s["Total_Volume_kg"] for s in processed_sets)
    junk_pct = round((junk_vol_kg / total_vol_kg * 100.0), 1) if total_vol_kg > 0 else 0.0

    # Total sessions since May 1
    total_sessions = len(sessions_dict)

    # Total volume in tons
    total_volume_tons = round(total_vol_kg / 1000.0, 1)

    return {
        "processed_sets": processed_sets,
        "total_sessions": total_sessions,
        "total_valid_sets": len(processed_sets),
        "total_volume_tons": total_volume_tons,
        "weeks_analyzed": round(weeks_count, 1),
        "as_of_date": max_d.isoformat(),
        "acwr": {
            "value": acwr,
            "acute_load_kg": round(acute_load, 1),
            "chronic_load_kg": round(chronic_load, 1),
            "status": acwr_status,
            "badge": acwr_badge,
            "note": f"Computed as of {max_d.isoformat()} (includes 28d pre-May chronic baseline lookback)"
        },
        "foster_workload": {
            "monotony": monotony,
            "strain_k": strain,
            "weekly_tonnage_t": round(sum(last_7_days) / 1000.0, 1)
        },
        "junk_volume": {
            "sets_count": len(junk_sets),
            "volume_pct": junk_pct,
            "tonnage_tons": round(junk_vol_kg / 1000.0, 2)
        },
        "session_split_counts": dict(session_split_counts),
        "muscle_summary": muscle_summary,
        "week_keys": week_keys,
        "lift_progressions": lift_progressions,
        "daily_timeline": daily_series
    }


# ------------------------------------------------------------------------------
# 2. APPLE HEALTH & SLEEP DATA ENGINE
# ------------------------------------------------------------------------------
def process_apple_health(base_dir: Path, audit: DataAuditTracker) -> dict:
    """Processes body composition, nutrition, sleep, and mobility since DATA_START."""
    data_start = parse_date(athx_config.DATA_START)

    # 2a. Body Composition
    body_comp_path = base_dir / "apple_body_composition.csv"
    raw_bc = []
    if body_comp_path.exists():
        with open(body_comp_path, "r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                audit.summary["body_comp_weigh_ins"] += 1
                d_str = r.get("Date", "")
                if d_str and parse_date(d_str) >= data_start and r.get("Weight_kg"):
                    w_val = float(r["Weight_kg"])
                    if w_val < 50.0 or w_val > 150.0:
                        audit.log("Body Comp Outlier", d_str, "Smart Scale", f"{w_val} kg",
                                  "Excluded from Weight Smoothing", "Implausible single-day scale artifact (< 50kg)")
                        continue
                    raw_bc.append({
                        "Date": d_str,
                        "Weight_kg": w_val,
                        "Body_Fat_pct": float(r["Body_Fat_pct"]) if r.get("Body_Fat_pct") else None,
                        "Lean_Mass_kg": float(r["Lean_Mass_kg"]) if r.get("Lean_Mass_kg") else None,
                        "BMI": float(r["BMI"]) if r.get("BMI") else None,
                    })
    raw_bc.sort(key=lambda x: x["Date"])

    # 7-day rolling weight smoothing
    for i, b in enumerate(raw_bc):
        d = parse_date(b["Date"])
        window = [x["Weight_kg"] for x in raw_bc if 0 <= (d - parse_date(x["Date"])).days <= 7]
        b["Weight_7d_Smooth"] = round(sum(window) / len(window), 1)

    latest_bc = raw_bc[-1] if raw_bc else {
        "Date": athx_config.DATA_START, "Weight_kg": athx_config.DEFAULT_BODYWEIGHT_KG,
        "Weight_7d_Smooth": athx_config.DEFAULT_BODYWEIGHT_KG, "Body_Fat_pct": 14.1, "Lean_Mass_kg": 68.1
    }
    curr_weight = latest_bc.get("Weight_7d_Smooth") or latest_bc.get("Weight_kg") or athx_config.DEFAULT_BODYWEIGHT_KG
    target_weight = athx_config.BODYWEIGHT_TARGET_KG
    weight_remaining = round(target_weight - curr_weight, 1)

    # 2b. Nutrition
    nutrition_path = base_dir / "apple_nutrition_macros.csv"
    raw_nut = []
    if nutrition_path.exists():
        with open(nutrition_path, "r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                d_str = r.get("Date", "")
                if d_str and parse_date(d_str) >= data_start:
                    cal = float(r.get("Calories_kcal", 0.0) or 0.0)
                    if cal >= 400:  # Valid logged day
                        audit.summary["nutrition_days_logged"] += 1
                        raw_nut.append({
                            "Date": d_str,
                            "Calories_kcal": cal,
                            "Protein_g": float(r.get("Protein_g", 0.0) or 0.0),
                            "Carbs_g": float(r.get("Carbs_g", 0.0) or 0.0),
                            "Fat_g": float(r.get("Fat_g", 0.0) or 0.0),
                        })
    raw_nut.sort(key=lambda x: x["Date"])

    avg_prot = round(sum(r["Protein_g"] for r in raw_nut) / len(raw_nut), 1) if raw_nut else 0.0
    prot_per_kg = round(avg_prot / curr_weight, 2) if curr_weight > 0 else 0.0
    avg_cals = round(sum(r["Calories_kcal"] for r in raw_nut) / len(raw_nut)) if raw_nut else 0

    # 2c. Sleep Architecture
    sleep_path = base_dir / "apple_sleep.csv"
    raw_sleep = []
    usable_efficiency_nights = 0
    if sleep_path.exists():
        with open(sleep_path, "r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                audit.summary["sleep_nights_total"] += 1
                d_str = r.get("Date", "")
                if not d_str:
                    continue
                d = parse_date(d_str)
                if d < data_start:
                    audit.summary["sleep_pre_may_excluded"] += 1
                    continue

                tot = float(r.get("Total_Sleep_hrs", 0.0) or 0.0)
                if tot < athx_config.MIN_VALID_SLEEP_HRS:
                    audit.summary["sleep_non_wear_dropped"] += 1
                    audit.log("Sleep Non-Wear", d_str, "Apple Sleep", f"{tot} hrs", "Dropped",
                              f"Total sleep < {athx_config.MIN_VALID_SLEEP_HRS}h artifact / watch off")
                    continue

                in_bed = float(r.get("In_Bed_hrs", 0.0) or tot)
                efficiency = None
                if in_bed <= athx_config.MAX_USABLE_IN_BED_HRS and in_bed >= tot:
                    efficiency = round((tot / in_bed) * 100.0, 1)
                    usable_efficiency_nights += 1
                else:
                    audit.summary["sleep_in_bed_overflow_excluded"] += 1
                    audit.log("Sleep In-Bed Overflow", d_str, "Apple Sleep", f"{in_bed} hrs in bed",
                              "Excluded from Efficiency", f"In_Bed > {athx_config.MAX_USABLE_IN_BED_HRS}h recording bug")

                deep = float(r.get("Deep_Sleep_hrs", 0.0) or 0.0)
                rem = float(r.get("REM_Sleep_hrs", 0.0) or 0.0)
                core = float(r.get("Core_Sleep_hrs", 0.0) or 0.0)
                awake = float(r.get("Awake_hrs", 0.0) or 0.0)

                raw_sleep.append({
                    "Date": d_str,
                    "Total_Sleep_hrs": round(tot, 2),
                    "Deep_Sleep_hrs": round(deep, 2),
                    "REM_Sleep_hrs": round(rem, 2),
                    "Core_Sleep_hrs": round(core, 2),
                    "Awake_hrs": round(awake, 2),
                    "In_Bed_hrs": round(in_bed, 2),
                    "Deep_pct": round((deep / tot) * 100.0, 1) if tot > 0 else 0.0,
                    "REM_pct": round((rem / tot) * 100.0, 1) if tot > 0 else 0.0,
                    "Efficiency_pct": efficiency
                })
    raw_sleep.sort(key=lambda x: x["Date"])
    audit.summary["sleep_usable_efficiency_nights"] = usable_efficiency_nights

    # Sleep coverage calculation (days from May 1 to latest sleep date)
    latest_sleep_date = parse_date(raw_sleep[-1]["Date"]) if raw_sleep else data_start
    total_calendar_days = max(1, (latest_sleep_date - data_start).days + 1)
    sleep_coverage_pct = round((len(raw_sleep) / total_calendar_days) * 100.0, 1)

    avg_sleep_dur = round(sum(r["Total_Sleep_hrs"] for r in raw_sleep) / len(raw_sleep), 1) if raw_sleep else 0.0
    avg_deep_dur = round(sum(r["Deep_Sleep_hrs"] for r in raw_sleep) / len(raw_sleep), 1) if raw_sleep else 0.0
    avg_rem_dur = round(sum(r["REM_Sleep_hrs"] for r in raw_sleep) / len(raw_sleep), 1) if raw_sleep else 0.0

    # 2d. Mobility & Biomechanics
    mob_path = base_dir / "apple_mobility_biomechanics.csv"
    raw_mob = []
    if mob_path.exists():
        with open(mob_path, "r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                d_str = r.get("Date", "")
                if not d_str:
                    continue
                d = parse_date(d_str)
                if d < data_start:
                    continue
                audit.summary["mobility_days_total"] += 1

                # Flights climbed winsorization
                flights_raw = float(r.get("Flights_Climbed", 0.0) or 0.0)
                flights_capped = min(flights_raw, athx_config.MAX_PLAUSIBLE_FLIGHTS)
                if flights_raw > athx_config.MAX_PLAUSIBLE_FLIGHTS:
                    audit.summary["mobility_flight_outliers_capped"] += 1
                    audit.log("Mobility Flight Outlier", d_str, "Apple Flights Climbed", f"{flights_raw} flights",
                              f"Winsorized to {athx_config.MAX_PLAUSIBLE_FLIGHTS}", "Pressure/flight sensor artifact")

                rhr = float(r.get("Resting_Heart_Rate_bpm", 0.0) or 0.0) if r.get("Resting_Heart_Rate_bpm") else None
                asym = float(r.get("Walking_Asymmetry_pct", 0.0) or 0.0) if r.get("Walking_Asymmetry_pct") else None
                speed = float(r.get("Walking_Speed_kmh", 0.0) or 0.0) if r.get("Walking_Speed_kmh") else None

                raw_mob.append({
                    "Date": d_str,
                    "Walking_Speed_kmh": round(speed, 2) if speed else None,
                    "Walking_Asymmetry_pct": round(asym, 2) if asym else None,
                    "Flights_Climbed": round(flights_capped, 1),
                    "Resting_Heart_Rate_bpm": round(rhr, 1) if rhr else None
                })
    raw_mob.sort(key=lambda x: x["Date"])

    # RHR Baseline (28-day) and 7-day rolling
    rhr_valid = [r for r in raw_mob if r["Resting_Heart_Rate_bpm"]]
    baseline_rhr = round(sum(r["Resting_Heart_Rate_bpm"] for r in rhr_valid) / len(rhr_valid), 1) if rhr_valid else 58.0
    recent_rhr = [r["Resting_Heart_Rate_bpm"] for r in rhr_valid[-7:]]
    curr_rhr = round(sum(recent_rhr) / len(recent_rhr), 1) if recent_rhr else baseline_rhr

    # Gait Asymmetry 7-day rolling
    asym_valid = [r["Walking_Asymmetry_pct"] for r in raw_mob if r["Walking_Asymmetry_pct"]]
    avg_asym = round(sum(asym_valid) / len(asym_valid), 2) if asym_valid else 1.8
    recent_asym = [r["Walking_Asymmetry_pct"] for r in raw_mob[-7:] if r["Walking_Asymmetry_pct"]]
    curr_asym = round(sum(recent_asym) / len(recent_asym), 2) if recent_asym else avg_asym

    # Daily Activity Steps
    act_path = base_dir / "apple_daily_activity.csv"
    raw_act = []
    if act_path.exists():
        with open(act_path, "r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                d_str = r.get("Date", "")
                if d_str and parse_date(d_str) >= data_start:
                    raw_act.append({
                        "Date": d_str,
                        "Steps": int(r.get("Steps", 0) or 0),
                        "Active_Energy_kcal": float(r.get("Active_Energy_kcal", 0.0) or 0.0),
                        "Distance_km": float(r.get("Distance_km", 0.0) or 0.0)
                    })
    raw_act.sort(key=lambda x: x["Date"])
    avg_steps = round(sum(r["Steps"] for r in raw_act) / len(raw_act)) if raw_act else 0
    max_steps = max((r["Steps"] for r in raw_act), default=0)

    # 2e. Transparent Recovery & Readiness Composite Score (0 - 100%)
    # Sleep Score (target 8.0h)
    sleep_score = min(100.0, max(0.0, (avg_sleep_dur / 8.0) * 100.0))
    
    # RHR Score (deviation from baseline: each 1 bpm elevation above baseline loses 15 points)
    rhr_diff = curr_rhr - baseline_rhr
    rhr_score = max(0.0, min(100.0, 100.0 - (max(0.0, rhr_diff) * 15.0)))

    # Gait Asymmetry Score (threshold <= 2.0%)
    if curr_asym <= 1.5:
        asym_score = 100.0
    elif curr_asym <= 2.0:
        asym_score = 85.0
    else:
        asym_score = max(40.0, 100.0 - (curr_asym - 2.0) * 50.0)

    # Protein Score (target >= 1.6 g/kg)
    protein_score = min(100.0, max(0.0, (prot_per_kg / 1.6) * 100.0))

    readiness_composite = round(
        (sleep_score * athx_config.READINESS_WEIGHTS["sleep_debt"]) +
        (rhr_score * athx_config.READINESS_WEIGHTS["rhr_baseline"]) +
        (asym_score * athx_config.READINESS_WEIGHTS["gait_asymmetry"]) +
        (100.0 * athx_config.READINESS_WEIGHTS["acwr_band"]) +  # default sweetspot
        (protein_score * athx_config.READINESS_WEIGHTS["protein_intake"]),
        1
    )

    return {
        "body_comp": {
            "current_weight": curr_weight,
            "target_weight": target_weight,
            "weight_remaining": weight_remaining,
            "goal_type": athx_config.BODYWEIGHT_GOAL_TYPE,
            "latest_bf_pct": latest_bc.get("Body_Fat_pct", 14.1),
            "latest_lean_mass": latest_bc.get("Lean_Mass_kg", 68.1),
            "history": raw_bc,
            "weigh_ins_count": len(raw_bc)
        },
        "nutrition": {
            "avg_calories": avg_cals,
            "avg_protein_g": avg_prot,
            "protein_g_per_kg": prot_per_kg,
            "days_logged": len(raw_nut),
            "history": raw_nut
        },
        "sleep": {
            "avg_sleep_hrs": avg_sleep_dur,
            "avg_deep_hrs": avg_deep_dur,
            "avg_rem_hrs": avg_rem_dur,
            "coverage_pct": sleep_coverage_pct,
            "valid_nights": len(raw_sleep),
            "calendar_days": total_calendar_days,
            "usable_efficiency_nights": usable_efficiency_nights,
            "latest_night_hrs": raw_sleep[-1]["Total_Sleep_hrs"] if raw_sleep else 0.0,
            "latest_date": raw_sleep[-1]["Date"] if raw_sleep else "",
            "history": raw_sleep
        },
        "mobility": {
            "start_date": "2026-06-06",
            "days_tracked": len(raw_mob),
            "baseline_rhr": baseline_rhr,
            "current_rhr": curr_rhr,
            "avg_asymmetry_pct": curr_asym,
            "history": raw_mob
        },
        "activity": {
            "avg_steps": avg_steps,
            "max_steps": max_steps,
            "days_logged": len(raw_act),
            "history": raw_act
        },
        "readiness_composite": {
            "score": readiness_composite,
            "components": {
                "sleep": {"score": round(sleep_score, 1), "weight": 25, "value": f"{avg_sleep_dur}h avg"},
                "rhr": {"score": round(rhr_score, 1), "weight": 25, "value": f"{curr_rhr} bpm (base {baseline_rhr})"},
                "asymmetry": {"score": round(asym_score, 1), "weight": 20, "value": f"{curr_asym}% 7d"},
                "acwr": {"score": 100.0, "weight": 20, "value": "Optimal Sweetspot"},
                "protein": {"score": round(protein_score, 1), "weight": 10, "value": f"{prot_per_kg} g/kg"}
            }
        }
    }


# ------------------------------------------------------------------------------
# 3. ATHX 2027 COMPETITION READINESS & RADAR
# ------------------------------------------------------------------------------
def evaluate_competition_readiness(strength_res: dict, apple_res: dict) -> dict:
    """Evaluates athlete standing across 5 ATHX events against Tier-1 Non-Pro standards."""
    lifts = strength_res["lift_progressions"]
    comp_date = parse_date(athx_config.COMPETITION_DATE)
    today = date.today()
    weeks_remaining = max(1.0, (comp_date - today).days / 7.0)

    # 1. Shoulder-to-Overhead (S2O)
    s2o_best = lifts.get("Overhead Press", {}).get("current_28d_best") or 55.0
    s2o_std = athx_config.COMPETITION_BENCHMARKS["s2o"]["standard"]
    s2o_gap = max(0.0, round(s2o_std - s2o_best, 1))
    s2o_req_rate = round(s2o_gap / weeks_remaining, 2)
    s2o_pct = round(min(100.0, (s2o_best / s2o_std) * 100.0), 1)

    # 2. Back Squat
    squat_best = lifts.get("Back Squat", {}).get("current_28d_best") or 110.0
    squat_std = athx_config.COMPETITION_BENCHMARKS["back_squat"]["standard"]
    squat_gap = max(0.0, round(squat_std - squat_best, 1))
    squat_req_rate = round(squat_gap / weeks_remaining, 2)
    squat_pct = round(min(100.0, (squat_best / squat_std) * 100.0), 1)

    # 3. Deadlift
    dl_best = lifts.get("Deadlift", {}).get("current_28d_best") or 145.0
    dl_std = athx_config.COMPETITION_BENCHMARKS["deadlift"]["standard"]
    dl_gap = max(0.0, round(dl_std - dl_best, 1))
    dl_req_rate = round(dl_gap / weeks_remaining, 2)
    dl_pct = round(min(100.0, (dl_best / dl_std) * 100.0), 1)

    # 4. 5km Running Pace (Standard 270s = 4:30/km. Estimate: 295s = 4:55/km)
    run_curr_s = 295.0
    run_std_s = athx_config.COMPETITION_BENCHMARKS["run_5k"]["standard"]
    run_gap_s = max(0.0, round(run_curr_s - run_std_s, 1))
    run_req_rate = round(run_gap_s / weeks_remaining, 2) # seconds drop per week
    run_pct = round(min(100.0, (run_std_s / run_curr_s) * 100.0), 1)

    # 5. Sandbag Carry / Grip (Standard 60kg)
    carry_curr = 55.0
    carry_std = athx_config.COMPETITION_BENCHMARKS["sandbag_carry"]["standard"]
    carry_gap = max(0.0, round(carry_std - carry_curr, 1))
    carry_req_rate = round(carry_gap / weeks_remaining, 2)
    carry_pct = round(min(100.0, (carry_curr / carry_std) * 100.0), 1)

    events = [
        {
            "id": "s2o",
            "name": "Shoulder-to-Overhead (S2O)",
            "current": f"{s2o_best} kg",
            "current_val": s2o_best,
            "standard": f"{s2o_std} kg",
            "standard_val": s2o_std,
            "gap": f"-{s2o_gap} kg" if s2o_gap > 0 else "Qualified",
            "gap_num": s2o_gap,
            "readiness_pct": s2o_pct,
            "required_rate": f"+{s2o_req_rate} kg/wk" if s2o_gap > 0 else "Maintained",
            "status": "In Progress" if s2o_gap > 0 else "Achieved"
        },
        {
            "id": "back_squat",
            "name": "Barbell Back Squat",
            "current": f"{squat_best} kg",
            "current_val": squat_best,
            "standard": f"{squat_std} kg",
            "standard_val": squat_std,
            "gap": f"-{squat_gap} kg" if squat_gap > 0 else "Qualified",
            "gap_num": squat_gap,
            "readiness_pct": squat_pct,
            "required_rate": f"+{squat_req_rate} kg/wk" if squat_gap > 0 else "Maintained",
            "status": "In Progress" if squat_gap > 0 else "Achieved"
        },
        {
            "id": "deadlift",
            "name": "Deadlift Floor Pull",
            "current": f"{dl_best} kg",
            "current_val": dl_best,
            "standard": f"{dl_std} kg",
            "standard_val": dl_std,
            "gap": f"-{dl_gap} kg" if dl_gap > 0 else "Qualified",
            "gap_num": dl_gap,
            "readiness_pct": dl_pct,
            "required_rate": f"+{dl_req_rate} kg/wk" if dl_gap > 0 else "Maintained",
            "status": "In Progress" if dl_gap > 0 else "Achieved"
        },
        {
            "id": "run_5k",
            "name": "5km Running Pace",
            "current": "4:55/km",
            "current_val": run_curr_s,
            "standard": "4:30/km",
            "standard_val": run_std_s,
            "gap": f"+{int(run_gap_s)}s/km",
            "gap_num": run_gap_s,
            "readiness_pct": run_pct,
            "required_rate": f"-{run_req_rate}s/wk",
            "status": "In Progress"
        },
        {
            "id": "sandbag_carry",
            "name": "Sandbag Carry / Grip",
            "current": f"{carry_curr} kg",
            "current_val": carry_curr,
            "standard": f"{carry_std} kg",
            "standard_val": carry_std,
            "gap": f"-{carry_gap} kg" if carry_gap > 0 else "Qualified",
            "gap_num": carry_gap,
            "readiness_pct": carry_pct,
            "required_rate": f"+{carry_req_rate} kg/wk" if carry_gap > 0 else "Maintained",
            "status": "In Progress"
        }
    ]

    return {
        "competition_date": athx_config.COMPETITION_DATE,
        "weeks_remaining": int(round(weeks_remaining)),
        "periodization_phase": "Phase 1: Hypertrophy & Base Capacity (Accumulation)",
        "events": events,
        "radar_data": {
            "labels": [e["name"] for e in events],
            "current_percentages": [e["readiness_pct"] for e in events],
            "benchmark_percentages": [100.0] * len(events),
            "display_benchmarks": [f"{e['current']} (std: {e['standard']})" for e in events]
        }
    }
