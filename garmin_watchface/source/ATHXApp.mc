import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class ATHXApp extends Application.AppBase {

    function initialize() {
        AppBase.initialize();
    }

    // onStart() is called on application start up
    function onStart(state as Lang.Dictionary?) as Void {
    }

    // onStop() is called when your application is exiting
    function onStop(state as Lang.Dictionary?) as Void {
    }

    // Return the initial view of your application here
    function getInitialView() as [WatchUi.Views] or [WatchUi.Views, WatchUi.InputDelegates] {
        return [ new ATHXView() ];
    }

    // New app settings have been received from Garmin Connect Mobile via Bluetooth
    function onSettingsChanged() as Void {
        WatchUi.requestUpdate();
    }
}

function getApp() as ATHXApp {
    return Application.getApp() as ATHXApp;
}
