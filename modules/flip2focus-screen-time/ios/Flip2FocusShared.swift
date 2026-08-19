import DeviceActivity
import FamilyControls
import Foundation
import ManagedSettings

/// Shared constants and helpers used by the main app target, the
/// DeviceActivityMonitor extension, and the ShieldConfiguration extension.
/// Added as a Compile Sources member of all three targets so they agree on
/// the App Group, store name, and persisted keys without duplicating logic.
enum Flip2FocusShared {
    static let appGroupID = "group.com.ahmetcerit.flip2focus"
    static let managedSettingsStoreName = ManagedSettingsStore.Name("Flip2FocusStore")
    static let deviceActivityName = DeviceActivityName("flip2focus.session")

    static var sharedDefaults: UserDefaults? {
        UserDefaults(suiteName: appGroupID)
    }

    enum Keys {
        static let selection = "flip2focus.selection"
        static let activeSessionID = "flip2focus.activeSessionID"
        static let activeSessionEndsAt = "flip2focus.activeSessionEndsAt"
    }

    static func loadSelection() -> FamilyActivitySelection {
        guard
            let data = sharedDefaults?.data(forKey: Keys.selection),
            let decoded = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
        else {
            return FamilyActivitySelection()
        }
        return decoded
    }

    static func saveSelection(_ selection: FamilyActivitySelection) {
        guard let data = try? JSONEncoder().encode(selection) else { return }
        sharedDefaults?.set(data, forKey: Keys.selection)
    }

    static func selectedCount(_ selection: FamilyActivitySelection) -> Int {
        selection.applicationTokens.count + selection.categoryTokens.count
    }

    /// Applies (or clears, when `selection` has no tokens) the shield for the
    /// current selection. Safe to call from the main app or from the
    /// DeviceActivityMonitor extension — both share the same store name.
    static func applyShield(selection: FamilyActivitySelection) {
        let store = ManagedSettingsStore(named: managedSettingsStoreName)
        if selection.applicationTokens.isEmpty && selection.categoryTokens.isEmpty {
            store.shield.applications = nil
            store.shield.applicationCategories = nil
        } else {
            store.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
            store.shield.applicationCategories = selection.categoryTokens.isEmpty
                ? nil
                : .specific(selection.categoryTokens)
        }
    }

    static func clearShield() {
        let store = ManagedSettingsStore(named: managedSettingsStoreName)
        store.shield.applications = nil
        store.shield.applicationCategories = nil
    }

    static func setActiveSession(id: String, endsAt: Double?) {
        sharedDefaults?.set(id, forKey: Keys.activeSessionID)
        if let endsAt {
            sharedDefaults?.set(endsAt, forKey: Keys.activeSessionEndsAt)
        } else {
            sharedDefaults?.removeObject(forKey: Keys.activeSessionEndsAt)
        }
    }

    static func clearActiveSession() {
        sharedDefaults?.removeObject(forKey: Keys.activeSessionID)
        sharedDefaults?.removeObject(forKey: Keys.activeSessionEndsAt)
    }

    static func isShieldingActive() -> Bool {
        sharedDefaults?.string(forKey: Keys.activeSessionID) != nil
    }
}
