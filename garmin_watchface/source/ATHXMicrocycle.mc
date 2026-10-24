import Toybox.Lang;
import Toybox.Time;
import Toybox.Time.Gregorian;

class ATHXMicrocycle {

    // Target competition date: May 27, 2027
    // Calculates countdown in weeks and days
    static function getCountdownString() as Lang.String {
        var now = Time.now();
        var nowSec = now.value();
        
        // Target: 2027-05-27 08:00:00 UTC
        // Unix timestamp for 2027-05-27 08:00:00 is 1811404800
        var targetSec = 1811404800;
        var diffSec = targetSec - nowSec;
        if (diffSec <= 0) {
            return "ATHX GAMES READY";
        }

        var diffDays = diffSec / (24 * 3600);
        var diffWeeks = diffDays / 7;

        return Lang.format("W-$1$ ($2$d) TO ATHX", [diffWeeks.format("%d"), diffDays.format("%d")]);
    }

    // Format seconds into MM:SS / km
    static function formatPace(paceSec as Lang.Number) as Lang.String {
        var mins = paceSec / 60;
        var secs = paceSec % 60;
        return Lang.format("$1$:$2$/km", [mins.format("%d"), secs.format("%02d")]);
    }

    // Returns today's tactical workout prescription based on day of week (1=Sun, 2=Mon... 7=Sat)
    static function getPrescription(
        dow as Lang.Number, 
        squatKg as Lang.Number, 
        deadliftKg as Lang.Number, 
        paceSec as Lang.Number
    ) as Lang.Dictionary {
        var paceStr = formatPace(paceSec);

        switch (dow) {
            case 2: // Monday
                return {
                    :title => "CF SESSION 1",
                    :sub => "Metcon & Gymnastics",
                    :cue => "Box WOD · Protect quads for Tue",
                    :icon => "🏋️"
                };

            case 3: // Tuesday
                return {
                    :title => "GYM A: SQUAT & S2O",
                    :sub => Lang.format("Squat 4x6 @ $1$kg", [squatKg.format("%d")]),
                    :cue => "Back Squats + Push Press 4x5",
                    :icon => "🦵"
                };

            case 4: // Wednesday
                return {
                    :title => "CF + RUN 1 (Z2)",
                    :sub => "Box WOD + 5.5km Run",
                    :cue => "HR <145 bpm · 172 spm cadence",
                    :icon => "🏃"
                };

            case 5: // Thursday
                return {
                    :title => "GYM B: DEADLIFT",
                    :sub => Lang.format("Deadlift 4x5 @ $1$kg", [deadliftKg.format("%d")]),
                    :cue => "Floor Pull + Bench Press 3x8",
                    :icon => "🏋️"
                };

            case 6: // Friday
                return {
                    :title => "CF + RUN 2 (5K)",
                    :sub => Lang.format("Repeats @ $1$", [paceStr]),
                    :cue => "Box WOD + 4-5x1km Intervals",
                    :icon => "⚡"
                };

            case 7: // Saturday
                return {
                    :title => "CF SESSION 4",
                    :sub => "Team / Engine WOD",
                    :cue => "Saturday Metcon · Durability",
                    :icon => "🔥"
                };

            case 1: // Sunday
            default:
                return {
                    :title => "RUN 3: Z2 RECOVERY",
                    :sub => "5.0 km Easy Active Flush",
                    :cue => "HR <140 bpm · 20m Mobility",
                    :icon => "🌿"
                };
        }
    }
}
