import ManagedSettings
import ManagedSettingsUI
import UIKit

/// Branded Screen Time shield shown over blocked apps during a focus
/// session. Uses Flip2Focus's dark, calm visual language rather than the
/// default system shield.
class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    private let brandBackground = UIColor(red: 8 / 255, green: 13 / 255, blue: 16 / 255, alpha: 1)
    private let brandAccent = UIColor(red: 52 / 255, green: 120 / 255, blue: 246 / 255, alpha: 1)

    private var branded: ShieldConfiguration {
        ShieldConfiguration(
            backgroundBlurStyle: .systemMaterialDark,
            backgroundColor: brandBackground,
            icon: UIImage(named: "ShieldIcon"),
            title: ShieldConfiguration.Label(text: "Focus Mode is on", color: .white),
            subtitle: ShieldConfiguration.Label(
                text: "This app is blocked until your Flip2Focus session ends.",
                color: .lightGray
            ),
            primaryButtonLabel: ShieldConfiguration.Label(text: "OK", color: .white),
            primaryButtonBackgroundColor: brandAccent
        )
    }

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        branded
    }

    override func configuration(
        shielding application: Application,
        in category: ActivityCategory
    ) -> ShieldConfiguration {
        branded
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        branded
    }

    override func configuration(
        shielding webDomain: WebDomain,
        in category: ActivityCategory
    ) -> ShieldConfiguration {
        branded
    }
}
