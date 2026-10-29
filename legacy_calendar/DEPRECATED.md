# ⚠️ DEPRECATION NOTICE: Legacy Calendar Dashboard & Sync

> [!WARNING]
> **STATUS: DEPRECATED & RETIRED**  
> As of October 2026, the standalone single-file calendar dashboard (`calendar_dashboard.html`) and associated generator scripts (`generate_calendar_dashboard.py`, `unified_calendar.py`) are **officially deprecated**.

---

## 🏛️ Successor: Meeting Hub (`/meeting`)

The standalone calendar system was calendar-centric (displaying days, weeks, and raw ics event tables).  
It has been completely superseded by **[Meeting Hub](file:///Users/ayrtonandre/Documents/work/AGY/meeting_hub.html)** (`http://localhost:8080/meeting`), which provides:

1. **Meeting-Centric Work OS**: Shift from passive scheduling to active preparation, agenda setting, attendee intelligence, and instant capture.
2. **9 Configured Project Initiatives**: Automatic bracket matching (`[MO]`, `[HDJ]`, `[PRIDEFACT]`, etc.) and multi-initiative filtering across Artefact, Clariane, Healthcare, GE Healthcare, and personal mandates.
3. **Minutes Intelligence & Decision Register**: Structured capture with auto-detected action items, decisions, and cross-meeting linking.
4. **Readiness Integration**: Real-time integration with ATHX biological readiness, HRV, and sleep recovery metrics.
5. **Desktop Keyboard Controls**: Global hotkeys (`/` search, `\` toggle drawer, `1-4` tabs, `j/k` navigation).

---

## 📁 Archived Legacy Files

The following files are preserved in `legacy_calendar/` for historical reference and backup data extraction:

- `calendar_dashboard.html`: Legacy 620 KB single-file HTML/JS dashboard
- `generate_calendar_dashboard.py`: Monolithic dashboard builder script
- `unified_calendar.py`: Tri-calendar schedule aggregator
- `client_calendar.py`: Client Outlook/M365 CalDAV parser
- `calendar_sync.py`: Automated multi-calendar sync script
- `icloud_calendar.py`: Apple iCloud CalDAV synchronization
- `google_calendar_api.py`: Artefact Google Calendar API client
- `sync_training_to_google_calendar.py`: ATHX training sync into Google Calendar
- `calendar_data/`: Cached `.ics` schedules and raw JSON snapshots

---

## 🚀 Migration & Forwarding

- Root scripts (`generate_calendar_dashboard.py`, `unified_calendar.py`) now contain non-blocking forwarding shims with deprecation warnings.
- Terminal command `calendar` (`~/.local/bin/calendar`) automatically notifies the user of deprecation and redirects to `meeting`.
- The Web Orchestrator route `/calendar` displays a deprecation warning directing attention to `/meeting`.
