# Flip2Focus MVP Status

Last updated: 2026-08-19 (autonomous build session start)

## Plan (implementation order)

- Phase A — scaffold metadata fix, remove demo UI, install deps, design tokens
- Phase B — SQLite session domain, streak engine, zustand stores, settings storage
- Phase C — navigation shell + all screens (onboarding, home, focus, history, settings, paywall)
- Phase D — DeviceMotion flip-detection state machine + dev diagnostics
- Phase E — native Swift Screen Time module + DeviceActivity/Shield extensions
- Phase F — notifications, break flow, lifecycle/session recovery
- Phase G — RevenueCat paywall + purchase gating
- Phase H — error/empty states, typecheck/lint/expo-doctor, native build
- Phase I — finalize MVP_STATUS.md / STORE_SETUP.md

## Completed
- (starting)

## Currently implementing
- Phase A

## Remaining
- Phases B–I

## Bugs
- none yet

## Needs physical iPhone
- Flip detection real-world calibration
- Screen Time shielding end-to-end validation
- Haptics feel

## Needs Apple Developer action
- Family Controls capability + Distribution entitlement request (Apple approval required)
- App Group provisioning
- Signing/provisioning profiles for main app + extensions

## Needs RevenueCat / App Store Connect
- Public SDK key
- Product/offering IDs
- App Store Connect subscription products

## Validation performed
- (none yet — session just started)
