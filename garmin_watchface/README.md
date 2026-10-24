# ⚡ ATHX Mission Control • Garmin Venu 3 Watch Face

A high-performance custom Connect IQ Watch Face built for the **Garmin Venu 3** (454×454 circular AMOLED display).

Engineered specifically for Ayrton's hybrid athletic training and the **ATHX 2027 Games** preparation.

---

## 🎯 Features & Display Architecture

```
                  ┌───────────────────────┐
                  │    🔋 88%  •  📶 BT   │
                  │  ⚡ ATHX 2027 (W-31)   │
                  ├───────────────────────┤
                  │                       │
                  │        08 : 45        │
                  │      SATURDAY 24      │
                  │                       │
                  ├───────────────────────┤
                  │ 🏋️ CF SESSION 4       │
                  │   Team / Engine WOD   │
                  │   Saturday Box Metcon │
                  ├───────────────────────┤
                  │ ❤️ 58 bpm    🔋 BB 82%│
                  │ 👣 8,450     🔥 620k  │
                  └───────────────────────┘
```

### 1. Zone 1: Status & Competition Runway
* **Battery Pill**: Real-time percentage with dynamic health coloring (Green >30%, Amber 15–30%, Pink <15%).
* **Bluetooth Status**: Active phone connection dot.
* **ATHX 2027 Countdown Ticker**: Weeks and days remaining until May 27, 2027 (`W-31 TO ATHX`).

### 2. Zone 2: Chrono & Temporal Core
* **Bold Digital Clock**: High-contrast, clean digital typography.
* **Calendar Date**: Full day of the week and date (e.g., `SATURDAY 24 OCT`).

### 3. Zone 3: Tactical ATHX Microcycle Banner
Rotates automatically at midnight according to your prescribed 9-session microcycle:
* **Monday**: `🏋️ CF SESSION 1` · Metabolic conditioning & gymnastics.
* **Tuesday**: `🦵 GYM A: SQUAT & S2O` · Back Squats 4×6 (target kg) + Push Press 4×5.
* **Wednesday**: `🏃 CF + RUN 1 (Z2)` · Box WOD + 5.5 km Zone 2 flush (<145 bpm).
* **Thursday**: `🏋️ GYM B: DEADLIFT` · Deadlift 4×5 (target kg) + Bench Press 3×8.
* **Friday**: `⚡ CF + RUN 2 (5K)` · Box WOD + 4–5×1km Qualifying Repeats (target pace).
* **Saturday**: `🔥 CF SESSION 4` · Team / Big Engine WOD (Lactate buffering).
* **Sunday**: `🌿 RUN 3: Z2 RECOVERY` · 5.0 km Easy Active Flush (<140 bpm).

### 4. Zone 4: Physiological & Activity Bar
* **Heart Rate**: Real-time HR with aerobic zone color-coding (Cyan: Zone 2, Green: Zone 3, Amber: Zone 4, Pink: Zone 5).
* **Body Battery**: Real-time energy score (0–100%) from on-watch sensor history.
* **Daily Steps & Active Calories**: Continuous step counter and energy expenditure.

### 5. AMOLED Always-On Display (AOD) Protection
* **Low-Power Mode (<10% Luminance)**: When your wrist is down, the watch face shifts to an ultra-clean minimalist outline time with muted date and workout cue.
* **Pixel Shifting**: Subtle coordinate shifting every minute prevents OLED burn-in on the Venu 3 display.

---

## 📱 On-Demand Customization (Garmin Connect App)

You can customize targets and visual styles on the fly directly from the **Garmin Connect** app on your iPhone:

1. Open **Garmin Connect** on your phone.
2. Tap your **Venu 3** → **Watch Faces** → **ATHX Mission Control** → **Settings**.
3. Customize:
   * **Accent Theme**: *Artefact Pink*, *Electric Blue*, *Volt Green*, or *Championship Gold*.
   * **Squat Target**: Adjust target barbell load (e.g., 80 kg → 82.5 kg).
   * **Deadlift Target**: Adjust floor pull load (e.g., 120 kg → 125 kg).
   * **5K Target Pace**: Adjust interval threshold target (e.g., 270s = 4:30/km).
   * **AOD Mode**: Minimalist Anti-Burn-In, Dimmed, or Gesture Only.
   * **Countdown Ticker**: Toggle on/off.
4. Tap **Save** — updates sync over Bluetooth instantly without recompiling code!

---

## 🛠️ How to Compile & Sideload onto Venu 3

### Prerequisites
1. **Visual Studio Code** installed.
2. Install the official **Monkey C** extension (published by Garmin).
3. In VS Code, press `Cmd + Shift + P` → `Monkey C: Open SDK Manager`:
   * Download the latest Connect IQ SDK (System 7 / API 5.x).
   * In the Device Manager tab, download the **Venu 3** device package.

### Step 1: Open the Project
Open this directory in VS Code:
```bash
code /Users/ayrtonandre/Documents/work/AGY/garmin_watchface
```

### Step 2: Test in the Simulator
1. Press `F5` (or Run Without Debugging).
2. Select **Venu 3** as the target device.
3. The Connect IQ Simulator boots with the 454×454 circular display.
4. In the Simulator menu, toggle `Simulation → Low Power Mode` to inspect the AMOLED anti-burn-in AOD display.

### Step 3: Build the `.prg` Binary
1. In VS Code, press `Cmd + Shift + P`.
2. Select **`Monkey C: Build for Device`**.
3. Select **Venu 3**.
4. Choose the output folder: `bin/athx_venu3.prg` (the pre-generated `developer_key.der` is automatically used).

### Step 4: Sideload onto your Venu 3
1. Connect your Venu 3 to your Mac via USB:
   * *Note*: On macOS, use **OpenMTP** or **Android File Transfer** to access Garmin MTP storage.
2. Copy `athx_venu3.prg` directly into:
   ```text
   /GARMIN/APPS/
   ```
3. Disconnect the watch.
4. On your Venu 3, press and hold the screen (or go to **Settings → Watch Face**), scroll and select **ATHX Mission Control**!
