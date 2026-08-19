import ExpoModulesCore

public class Flip2FocusScreenTimeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Flip2FocusScreenTimeModule")

    AsyncFunction("requestAuthorization") { () -> String in
      await ScreenTimeController.shared.requestAuthorization()
    }

    AsyncFunction("getAuthorizationStatus") { () -> String in
      ScreenTimeController.shared.currentAuthorizationStatus()
    }

    AsyncFunction("presentActivityPicker") { () -> [String: Int] in
      let count = await ScreenTimeController.shared.presentActivityPicker()
      return ["selectedCount": count]
    }

    AsyncFunction("getSelectedCount") { () -> Int in
      ScreenTimeController.shared.selectedCount()
    }

    AsyncFunction("startShielding") { (sessionId: String, endsAt: Double) in
      ScreenTimeController.shared.startShielding(sessionId: sessionId, endsAt: endsAt)
    }

    AsyncFunction("stopShielding") { (sessionId: String?) in
      ScreenTimeController.shared.stopShielding()
    }

    AsyncFunction("isShieldingActive") { () -> Bool in
      Flip2FocusShared.isShieldingActive()
    }
  }
}
