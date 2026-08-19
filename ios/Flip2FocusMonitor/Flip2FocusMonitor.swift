import DeviceActivity
import Foundation

/// DeviceActivityMonitor extension: runs in its own process, launched by
/// the system — NOT by the app's JS runtime — when a scheduled monitoring
/// interval starts/ends. This is what lets a timed focus session clear its
/// shield on schedule even if the app was killed or backgrounded.
class Flip2FocusMonitor: DeviceActivityMonitor {
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        guard activity == Flip2FocusShared.deviceActivityName else { return }
        let selection = Flip2FocusShared.loadSelection()
        Flip2FocusShared.applyShield(selection: selection)
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        guard activity == Flip2FocusShared.deviceActivityName else { return }
        Flip2FocusShared.clearShield()
        Flip2FocusShared.clearActiveSession()
    }
}
