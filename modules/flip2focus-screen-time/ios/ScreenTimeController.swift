import DeviceActivity
import FamilyControls
import Foundation

/// Owns every Screen Time side effect for the main app process: requesting
/// Family Controls authorization, presenting Apple's real activity picker,
/// applying/clearing the ManagedSettings shield, and scheduling the
/// DeviceActivityMonitor interval that lets the shield clear itself even
/// when this app is not running. FamilyActivitySelection itself never
/// crosses the JS bridge — only a selected-app count does.
@MainActor
final class ScreenTimeController {
    static let shared = ScreenTimeController()

    private let activityCenter = DeviceActivityCenter()

    /// Sessions longer than this are treated as open-ended (Free Focus):
    /// the shield is applied immediately but no DeviceActivitySchedule is
    /// registered, since DeviceActivitySchedule expresses a time-of-day
    /// window rather than an arbitrary far-future timestamp. Manual end or
    /// app-relaunch reconciliation clears these instead.
    private let maxScheduledSessionSeconds: Double = 20 * 60 * 60

    func requestAuthorization() async -> String {
        do {
            try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
        } catch {
            // Authorization can also have been granted/denied by a prior
            // request; fall through and report the resulting status either way.
        }
        return currentAuthorizationStatus()
    }

    func currentAuthorizationStatus() -> String {
        switch AuthorizationCenter.shared.authorizationStatus {
        case .notDetermined:
            return "notDetermined"
        case .denied:
            return "denied"
        case .approved:
            return "approved"
        @unknown default:
            return "notDetermined"
        }
    }

    func presentActivityPicker() async -> Int {
        let selection = await ActivityPickerPresenter.shared.present()
        Flip2FocusShared.saveSelection(selection)
        return Flip2FocusShared.selectedCount(selection)
    }

    func selectedCount() -> Int {
        Flip2FocusShared.selectedCount(Flip2FocusShared.loadSelection())
    }

    func startShielding(sessionId: String, endsAt: Double) {
        let selection = Flip2FocusShared.loadSelection()
        Flip2FocusShared.applyShield(selection: selection)

        let endDate = Date(timeIntervalSince1970: endsAt / 1000)
        let secondsUntilEnd = endDate.timeIntervalSinceNow

        activityCenter.stopMonitoring([Flip2FocusShared.deviceActivityName])

        if secondsUntilEnd > 0 && secondsUntilEnd <= maxScheduledSessionSeconds {
            Flip2FocusShared.setActiveSession(id: sessionId, endsAt: endsAt)
            let calendar = Calendar.current
            let startComponents = calendar.dateComponents([.hour, .minute, .second], from: Date())
            let endComponents = calendar.dateComponents([.hour, .minute, .second], from: endDate)
            let schedule = DeviceActivitySchedule(
                intervalStart: startComponents,
                intervalEnd: endComponents,
                repeats: false
            )
            do {
                try activityCenter.startMonitoring(Flip2FocusShared.deviceActivityName, during: schedule)
            } catch {
                // Scheduling failed (e.g. simulator/entitlement limitations) —
                // the shield is still applied; it will be cleared by an
                // explicit stopShielding call or app-relaunch reconciliation.
            }
        } else {
            // Free Focus / open-ended session: no scheduled auto-clear.
            Flip2FocusShared.setActiveSession(id: sessionId, endsAt: nil)
        }
    }

    func stopShielding() {
        activityCenter.stopMonitoring([Flip2FocusShared.deviceActivityName])
        Flip2FocusShared.clearShield()
        Flip2FocusShared.clearActiveSession()
    }
}
