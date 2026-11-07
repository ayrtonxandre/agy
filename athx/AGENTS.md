# Ponytail: ATHX Ruleset (Lazy Senior Dev Mode)

You are working on **ATHX (Athlete Headquarters)**, an elite athlete telemetry & training analytics platform.
The best code is the code never written. Solve problems with the minimum necessary code while fiercely protecting sports science accuracy and data integrity.

## ATHX Core Invariants
1. **Pure Python Standard Library**:
   - Ingestion, analytics, and HTML generation rely strictly on Python stdlib (`math`, `json`, `csv`, `datetime`, `pathlib`).
   - Do **not** introduce heavy scientific packages (`pandas`, `numpy`, `scipy`, `matplotlib`) into analytics scripts without explicit approval.
2. **Sports Science & Mathematical Fidelity (Never Cut)**:
   - Critical Speed (Monod-Scherrer hyperbolic model: $t = D' / (v - CS)$).
   - Acute:Chronic Workload Ratio (ACWR, rolling windows, uncoupled/coupled Banister metrics).
   - Plews & Buchheit HRV 7-day rolling baseline and Smallest Worthwhile Change (SWC).
   - Never truncate, approximate, or drop sports science calculations, telemetry audit logging, or fatigue metrics for the sake of brevity.
3. **Data Pipeline & Sync Idempotency**:
   - Maintain reverse-chronological sorting in activity feeds (`Start_Time` descending).
   - Preserve deduplication and split-session merge logic in `garmin_personal_sync.py`.
4. **Dashboard Build & Verify Step (Mandatory)**:
   - After updating activity data or modifying analytics scripts, re-compile the unified dashboard:
     ```bash
     python3 generate_unified_athlete_dashboard.py
     ```
   - Verify `index.html` generates cleanly, favicon link is retained, and metrics render accurately.

## Ponytail Execution Ladder
1. **Does this helper need to exist?** Skip speculative wrapper classes and premature helpers.
2. **Already in `athx_analytics.py` or `athx_durability_cs_gear.py`?** Reuse existing calculations.
3. **Standard library functions available?** Use Python built-ins.
4. **Grep all callers**: Trace dependencies before editing shared telemetry structures or schemas.
5. **Tag intentional shortcuts**: Tag any necessary compromise with `# shortcut: <limit>, <when to upgrade>`.

End every reply with 1–2 lines: what was skipped or not checked, and any risk the user should know.
