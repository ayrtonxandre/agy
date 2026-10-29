import Toybox.WatchUi;
import Toybox.Graphics;
import Toybox.System;
import Toybox.Lang;
import Toybox.Time;
import Toybox.Time.Gregorian;
import Toybox.Application.Properties;

class ATHXView extends WatchUi.WatchFace {

    private var _isSleeping as Lang.Boolean = false;

    // Palette Constants
    private static const COL_BG = 0x080C1A;           // Deep Navy base
    private static const COL_SURFACE = 0x131F47;      // Elevated card
    private static const COL_PINK = 0xFF0066;         // Artefact Pink
    private static const COL_BLUE = 0x1F65FF;         // Electric Blue
    private static const COL_GREEN = 0x10B981;        // Volt Green
    private static const COL_GOLD = 0xFFD700;         // Championship Gold
    private static const COL_TEXT_MUTED = 0x94A3B8;   // Slate grey

    function initialize() {
        WatchFace.initialize();
    }

    function onLayout(dc as Graphics.Dc) as Void {
        // Dynamic procedural rendering via dc; no static XML layout needed
    }

    function onShow() as Void {
    }

    function onHide() as Void {
    }

    function onEnterSleep() as Void {
        _isSleeping = true;
        WatchUi.requestUpdate();
    }

    function onExitSleep() as Void {
        _isSleeping = false;
        WatchUi.requestUpdate();
    }

    // Retrieve active accent color from user settings
    private function getAccentColor() as Graphics.ColorType {
        var themeIdx = 0;
        try {
            var val = Properties.getValue("themeColor");
            if (val != null) {
                themeIdx = val as Lang.Number;
            }
        } catch (e) {
            themeIdx = 0;
        }

        switch (themeIdx) {
            case 1: return COL_BLUE;
            case 2: return COL_GREEN;
            case 3: return COL_GOLD;
            case 0:
            default: return COL_PINK;
        }
    }

    // Retrieve user training target settings
    private function getTargetSettings() as Lang.Dictionary {
        var squat = 80;
        var deadlift = 120;
        var pace = 270;
        var aod = 0;
        var countdown = true;

        try {
            var s = Properties.getValue("squatTargetKg");
            if (s != null) { squat = s as Lang.Number; }
            var d = Properties.getValue("deadliftTargetKg");
            if (d != null) { deadlift = d as Lang.Number; }
            var p = Properties.getValue("runningPaceSeconds");
            if (p != null) { pace = p as Lang.Number; }
            var a = Properties.getValue("aodMode");
            if (a != null) { aod = a as Lang.Number; }
            var c = Properties.getValue("showCountdown");
            if (c != null) { countdown = c as Lang.Boolean; }
        } catch (e) {
            // Use defaults
        }

        return {
            :squat => squat,
            :deadlift => deadlift,
            :pace => pace,
            :aod => aod,
            :countdown => countdown
        };
    }

    // Main render loop
    function onUpdate(dc as Graphics.Dc) as Void {
        var width = dc.getWidth();
        var height = dc.getHeight();
        var cx = width / 2;
        var cy = height / 2;

        var clockTime = System.getClockTime();
        var timeStr = Lang.format("$1$:$2$", [
            clockTime.hour.format("%02d"),
            clockTime.min.format("%02d")
        ]);

        var now = Time.now();
        var info = Gregorian.info(now, Time.FORMAT_MEDIUM);
        var dowNum = Gregorian.info(now, Time.FORMAT_SHORT).day_of_week;

        var settings = getTargetSettings();
        var accentCol = getAccentColor();

        // =========================================================================
        // 1. LOW-POWER AMOLED AOD SLEEP MODE (<10% screen luminance)
        // =========================================================================
        if (_isSleeping) {
            var aodMode = settings[:aod] as Lang.Number;
            if (aodMode == 2) {
                // Completely Off
                dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
                dc.clear();
                return;
            }

            dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
            dc.clear();

            // Coordinate micro-shifting to avoid burn-in on Venu 3 AMOLED
            var shiftX = (clockTime.min % 7) - 3;
            var shiftY = ((clockTime.min / 7) % 7) - 3;

            // Minimalist Dimmed Time
            dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(
                cx + shiftX, 
                cy - 35 + shiftY, 
                Graphics.FONT_NUMBER_HOT, 
                timeStr, 
                Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER
            );

            // Subtle Date
            var dateStr = Lang.format("$1$ $2$", [info.day_of_week.toUpper(), info.day]);
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(
                cx + shiftX, 
                cy + 25 + shiftY, 
                Graphics.FONT_XTINY, 
                dateStr, 
                Graphics.TEXT_JUSTIFY_CENTER
            );

            // Subtle Workout Cue
            var rx = ATHXMicrocycle.getPrescription(
                dowNum, 
                settings[:squat] as Lang.Number, 
                settings[:deadlift] as Lang.Number, 
                settings[:pace] as Lang.Number
            );
            dc.setColor(accentCol, Graphics.COLOR_TRANSPARENT);
            dc.drawText(
                cx + shiftX, 
                cy + 52 + shiftY, 
                Graphics.FONT_XTINY, 
                rx[:title] as Lang.String, 
                Graphics.TEXT_JUSTIFY_CENTER
            );

            return;
        }

        // =========================================================================
        // 2. HIGH-POWER WAKE MODE (Full 454x454 Mission Control Canvas)
        // =========================================================================

        // Background: Deep Navy
        dc.setColor(COL_BG, COL_BG);
        dc.clear();

        // Ambient border circle
        dc.setColor(0x131F47, Graphics.COLOR_TRANSPARENT);
        dc.setPenWidth(2);
        dc.drawCircle(cx, cy, (width / 2) - 4);

        // -------------------------------------------------------------------------
        // ZONE 1: TOP STATUS & ATHX 2027 COUNTDOWN
        // -------------------------------------------------------------------------
        var bat = ATHXSensorHelper.getBatteryPercent();
        var batColor = (bat > 30.0) ? COL_GREEN : ((bat > 15.0) ? 0xF59E0B : COL_PINK);

        // Battery Pill (Top-Left)
        var bx = cx - 85;
        var by = 36;
        dc.setColor(0x1F293D, Graphics.COLOR_TRANSPARENT);
        dc.fillRoundedRectangle(bx, by, 38, 16, 4);
        dc.setColor(batColor, Graphics.COLOR_TRANSPARENT);
        var fillW = ((bat / 100.0) * 32.0).toNumber();
        if (fillW < 2) { fillW = 2; }
        dc.fillRoundedRectangle(bx + 3, by + 3, fillW, 10, 2);
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(bx + 44, by - 1, Graphics.FONT_XTINY, Lang.format("$1$%", [bat.toNumber().format("%d")]), Graphics.TEXT_JUSTIFY_LEFT);

        // Bluetooth Icon (Top-Right)
        var devSettings = System.getDeviceSettings();
        if (devSettings != null && devSettings.phoneConnected) {
            dc.setColor(COL_BLUE, Graphics.COLOR_TRANSPARENT);
            dc.drawText(cx + 90, by - 1, Graphics.FONT_XTINY, "BT", Graphics.TEXT_JUSTIFY_CENTER);
        }

        // Center Countdown Pill (Top-Center)
        if (settings[:countdown] as Lang.Boolean) {
            var cdStr = ATHXMicrocycle.getCountdownString();
            dc.setColor(0x1F293D, Graphics.COLOR_TRANSPARENT);
            dc.fillRoundedRectangle(cx - 75, by + 20, 150, 20, 10);
            dc.setColor(accentCol, Graphics.COLOR_TRANSPARENT);
            dc.drawText(cx, by + 20, Graphics.FONT_XTINY, cdStr, Graphics.TEXT_JUSTIFY_CENTER);
        }

        // -------------------------------------------------------------------------
        // ZONE 2: DIGITAL CLOCK & DATE (CENTER HORIZON)
        // -------------------------------------------------------------------------
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            cx, 
            cy - 65, 
            Graphics.FONT_NUMBER_HOT, 
            timeStr, 
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER
        );

        // Date Display
        var fullDateStr = Lang.format("$1$ $2$ $3$", [info.day_of_week.toUpper(), info.day, info.month.toUpper()]);
        dc.setColor(COL_TEXT_MUTED, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            cx, 
            cy - 12, 
            Graphics.FONT_TINY, 
            fullDateStr, 
            Graphics.TEXT_JUSTIFY_CENTER
        );

        // -------------------------------------------------------------------------
        // ZONE 3: TACTICAL ATHX MICROCYCLE WORKOUT CARD
        // -------------------------------------------------------------------------
        var cardW = (width * 0.82).toNumber();
        var cardH = 68;
        var cardX = cx - (cardW / 2);
        var cardY = cy + 18;

        // Card Container
        dc.setColor(COL_SURFACE, Graphics.COLOR_TRANSPARENT);
        dc.fillRoundedRectangle(cardX, cardY, cardW, cardH, 10);

        // Accent strip on left
        dc.setColor(accentCol, Graphics.COLOR_TRANSPARENT);
        dc.fillRoundedRectangle(cardX, cardY, 6, cardH, 3);

        // Prescription Content
        var presc = ATHXMicrocycle.getPrescription(
            dowNum, 
            settings[:squat] as Lang.Number, 
            settings[:deadlift] as Lang.Number, 
            settings[:pace] as Lang.Number
        );

        // Workout Title
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            cardX + 16, 
            cardY + 8, 
            Graphics.FONT_SMALL, 
            presc[:title] as Lang.String, 
            Graphics.TEXT_JUSTIFY_LEFT
        );

        // Subtitle / Prescription Load
        dc.setColor(accentCol, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            cardX + 16, 
            cardY + 30, 
            Graphics.FONT_XTINY, 
            presc[:sub] as Lang.String, 
            Graphics.TEXT_JUSTIFY_LEFT
        );

        // Tactical Cue
        dc.setColor(COL_TEXT_MUTED, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            cardX + 16, 
            cardY + 47, 
            Graphics.FONT_XTINY, 
            presc[:cue] as Lang.String, 
            Graphics.TEXT_JUSTIFY_LEFT
        );

        // -------------------------------------------------------------------------
        // ZONE 4: PHYSIOLOGICAL & ACTIVITY CHIPS (BOTTOM ARC)
        // -------------------------------------------------------------------------
        var hr = ATHXSensorHelper.getHeartRate();
        var bb = ATHXSensorHelper.getBodyBattery();
        var steps = ATHXSensorHelper.getSteps();
        var cals = ATHXSensorHelper.getCalories();

        var botY1 = cardY + cardH + 12;
        var botY2 = botY1 + 22;

        // Heart Rate & Body Battery (Row 1)
        var hrColor = ATHXSensorHelper.getHeartRateColor(hr);
        var hrStr = (hr != null) ? hr.format("%d") + " bpm" : "-- bpm";
        var bbStr = (bb != null) ? bb.format("%d") + "%" : "--%";

        dc.setColor(hrColor, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx - 50, botY1, Graphics.FONT_TINY, "HR " + hrStr, Graphics.TEXT_JUSTIFY_CENTER);

        dc.setColor(0x06B6D4, Graphics.COLOR_TRANSPARENT); // Cyan Body Battery
        dc.drawText(cx + 50, botY1, Graphics.FONT_TINY, "BB " + bbStr, Graphics.TEXT_JUSTIFY_CENTER);

        // Steps & Calories (Row 2)
        var stepsStr = steps.format("%d") + " steps";
        var calStr = cals.format("%d") + " kcal";

        dc.setColor(COL_TEXT_MUTED, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx - 55, botY2, Graphics.FONT_XTINY, stepsStr, Graphics.TEXT_JUSTIFY_CENTER);
        dc.drawText(cx + 55, botY2, Graphics.FONT_XTINY, calStr, Graphics.TEXT_JUSTIFY_CENTER);
    }
}
