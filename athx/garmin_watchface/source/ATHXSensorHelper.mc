import Toybox.Lang;
import Toybox.System;
import Toybox.Activity;
import Toybox.ActivityMonitor;
import Toybox.SensorHistory;
import Toybox.Graphics;

class ATHXSensorHelper {

    // Safely retrieves current Heart Rate
    static function getHeartRate() as Lang.Number? {
        // Method 1: Activity.getActivityInfo() (fastest during active wrist wake)
        var actInfo = Activity.getActivityInfo();
        if (actInfo != null && actInfo.currentHeartRate != null) {
            return actInfo.currentHeartRate;
        }

        // Method 2: SensorHistory.getHeartRateHistory() (accurate continuous sample)
        if ((Toybox has :SensorHistory) && (SensorHistory has :getHeartRateHistory)) {
            var iter = SensorHistory.getHeartRateHistory({:order => SensorHistory.ORDER_NEWEST_FIRST});
            if (iter != null) {
                var sample = iter.next();
                if (sample != null && sample.data != null) {
                    return sample.data as Lang.Number;
                }
            }
        }

        return null;
    }

    // Safely retrieves Body Battery percentage (0-100)
    static function getBodyBattery() as Lang.Number? {
        if ((Toybox has :SensorHistory) && (SensorHistory has :getBodyBatteryHistory)) {
            var iter = SensorHistory.getBodyBatteryHistory({:order => SensorHistory.ORDER_NEWEST_FIRST});
            if (iter != null) {
                var sample = iter.next();
                if (sample != null && sample.data != null) {
                    return sample.data as Lang.Number;
                }
            }
        }
        return null;
    }

    // Returns daily step count
    static function getSteps() as Lang.Number {
        var info = ActivityMonitor.getInfo();
        if (info != null && info.steps != null) {
            return info.steps;
        }
        return 0;
    }

    // Returns daily step goal
    static function getStepGoal() as Lang.Number {
        var info = ActivityMonitor.getInfo();
        if (info != null && info.stepGoal != null) {
            return info.stepGoal;
        }
        return 10000;
    }

    // Returns daily calories
    static function getCalories() as Lang.Number {
        var info = ActivityMonitor.getInfo();
        if (info != null && info.calories != null) {
            return info.calories;
        }
        return 0;
    }

    // Returns battery level (0-100)
    static function getBatteryPercent() as Lang.Float {
        var stats = System.getSystemStats();
        if (stats != null && stats.battery != null) {
            return stats.battery;
        }
        return 100.0;
    }

    // Maps heart rate to athlete's physiological zone color
    static function getHeartRateColor(hr as Lang.Number?) as Graphics.ColorType {
        if (hr == null) {
            return Graphics.COLOR_DK_GRAY;
        }
        if (hr < 120) {
            return Graphics.COLOR_LT_GRAY;
        } else if (hr <= 145) {
            return 0x06B6D4; // Zone 2 Aerobic Base (Cyan)
        } else if (hr <= 160) {
            return 0x10B981; // Zone 3 Tempo (Emerald Green)
        } else if (hr <= 172) {
            return 0xF59E0B; // Zone 4 Threshold (Amber Orange)
        } else {
            return 0xFF0066; // Zone 5 Anaerobic Max (Artefact Pink)
        }
    }
}
