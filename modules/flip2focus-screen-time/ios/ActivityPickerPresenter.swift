import FamilyControls
import SwiftUI
import UIKit

/// Presents Apple's real FamilyActivityPicker over the app's current top
/// view controller and resolves with whatever selection the user leaves
/// with — whether they tap Done or dismiss the sheet by swiping.
@MainActor
final class ActivityPickerPresenter: NSObject, UIAdaptivePresentationControllerDelegate {
    static let shared = ActivityPickerPresenter()

    private var pendingResume: ((FamilyActivitySelection) -> Void)?
    private var latestSelection = FamilyActivitySelection()

    func present() async -> FamilyActivitySelection {
        let initial = Flip2FocusShared.loadSelection()

        return await withCheckedContinuation { (continuation: CheckedContinuation<FamilyActivitySelection, Never>) in
            var didResume = false
            let resume: (FamilyActivitySelection) -> Void = { [weak self] selection in
                guard !didResume else { return }
                didResume = true
                self?.pendingResume = nil
                continuation.resume(returning: selection)
            }
            pendingResume = resume
            latestSelection = initial

            let sheet = ActivityPickerSheet(initialSelection: initial) { [weak self] result in
                self?.latestSelection = result
                self?.dismissAndResume(with: result)
            }
            let hosting = UIHostingController(rootView: sheet)
            hosting.modalPresentationStyle = .formSheet
            hosting.presentationController?.delegate = self

            guard let root = Self.topViewController() else {
                resume(initial)
                return
            }
            root.present(hosting, animated: true)
        }
    }

    private func dismissAndResume(with selection: FamilyActivitySelection) {
        Self.topViewController()?.dismiss(animated: true)
        pendingResume?(selection)
    }

    nonisolated func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
        Task { @MainActor in
            self.pendingResume?(self.latestSelection)
        }
    }

    private static func topViewController() -> UIViewController? {
        guard
            let scene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive })
                as? UIWindowScene,
            let root = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController
        else {
            return nil
        }
        var top = root
        while let presented = top.presentedViewController {
            top = presented
        }
        return top
    }
}
