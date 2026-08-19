# Flip2Focus — App Store / External Setup

This file lists every manual external action required before submission. Do not invent URLs or credentials — placeholders below must be filled in by a human with access to the relevant accounts.

## Bundle identifier
`com.ahmetcerit.flip2focus`

## App Group
`group.com.ahmetcerit.flip2focus` — must be created/enabled in the Apple Developer portal for:
- main app target
- DeviceActivityMonitor extension target
- ShieldConfiguration extension target

## Family Controls
- Enable the **Family Controls** capability for the main app target in the Apple Developer portal.
- Request the **Family Controls (Distribution)** entitlement from Apple (com.apple.developer.family-controls) — this requires a manual request via Apple's entitlement request form; approval is not instant and is required before App Store distribution (not required for development/simulator builds signed with a personal team, but IS required before TestFlight/App Store distribution).

## Extension identifiers
- `com.ahmetcerit.flip2focus.DeviceActivityMonitor` (DeviceActivityMonitor extension)
- `com.ahmetcerit.flip2focus.ShieldConfiguration` (ShieldConfiguration extension)

## Signing / provisioning
- All three targets (app + 2 extensions) need provisioning profiles with matching App Group + Family Controls entitlements once a paid Apple Developer account/team is attached in Xcode.
- NEEDS APPLE DEVELOPER ACTION: assign a real Team ID in Xcode signing settings before device/TestFlight builds.

## RevenueCat / App Store Connect
- NEEDS CREDENTIALS: RevenueCat public SDK API key (iOS) — set in `src/config/purchases.ts` via `EXPO_PUBLIC_REVENUECAT_IOS_KEY` env var.
- NEEDS CREDENTIALS: Offering identifier (default: `default`) and package identifiers for:
  - Monthly Pro subscription
  - Yearly Pro subscription
- NEEDS ACTION: Create the corresponding in-app subscription products in App Store Connect and attach them to a RevenueCat offering.
- Entitlement identifier used in code: `pro`.

## Privacy Policy URL
NEEDS URL — placeholder, not yet provided.

## Terms of Use URL
NEEDS URL — placeholder, not yet provided.

## Support URL
NEEDS URL — placeholder, not yet provided.

## App Privacy (App Store Connect questionnaire notes)
- App collects no account data, no analytics SDK in v1.
- Focus session history stored locally on-device only (SQLite), never transmitted.
- Screen Time selection (FamilyActivitySelection) stays on-device, encoded/stored via App Group only — never sent to any server or exposed to JS.
- RevenueCat SDK transmits purchase/entitlement data to RevenueCat's servers for subscription validation — declare "Purchase History" linked-to-user data collected for app functionality per RevenueCat's own privacy documentation at the time of submission.

## Screenshots required
NEEDS SCREENSHOTS — capture on a real device/simulator once UI is finalized: Home, Active Focus, Session Complete, History, Paywall (per current App Store screenshot size requirements at submission time).

## App Review notes (draft — refine before submission)
"Flip2Focus uses Apple's Screen Time (Family Controls / ManagedSettings / DeviceActivity) APIs to let the user block their own selected distracting apps during a self-initiated focus session. No data about which apps are shielded ever leaves the device. To test: complete onboarding, grant Screen Time (Family Controls) permission, select 1-2 apps to block, return to Home, place the phone face down on a flat surface for about 1 second — a 25-minute focus session begins automatically and the selected apps become shielded. Placing the phone face down is the core interaction; alternatively wait for the session to reach its target time to observe automatic unblocking."

## Current blockers preventing full physical validation
- No physical iPhone available in this build environment — flip detection thresholds and Screen Time shielding must be calibrated/validated on a real device before shipping.
- No Apple Developer Team/paid account attached in this environment — Family Controls distribution entitlement, App Group, and provisioning cannot be finalized here. Development-only local builds may still compile and can be tested by a human with Xcode + a real device + a personal/team Apple ID (Family Controls works in development mode without the special distribution entitlement, per Apple docs, but distribution to TestFlight/App Store requires the approved entitlement).
