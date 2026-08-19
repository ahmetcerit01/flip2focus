# Flip2Focus MVP Status

Last updated: 2026-08-19 (native build verified; first 3 onboarding screens visually verified against docs/ui-reference.png on-device)

## Completed

**Phase A — Scaffold**
- package.json (`flip2focus`), app.json (name/slug/scheme/bundleIdentifier `com.ahmetcerit.flip2focus`/version/orientation/userInterfaceStyle) fixed.
- Default Expo demo UI, assets, and `reset-project.js` removed.
- Branded app icon (`app-icon-master.png`) and dark splash (`logo-mark-transparent.png` on `#080D10`) wired through `expo-splash-screen`.
- Dependencies installed via `npx expo install` where applicable: expo-sqlite, expo-sensors, expo-haptics, expo-notifications, expo-linear-gradient, expo-symbols, expo-build-properties, @react-native-async-storage/async-storage; plus zustand and react-native-purchases via npm.
- `npm install` requires `--legacy-peer-deps` because `expo-router`'s optional web deps (`vaul`/`@radix-ui/*`) have a peer conflict unrelated to this app (iOS-only, no web target) — documented here so it isn't mistaken for a real problem.

**Phase B — Data layer**
- `expo-sqlite` session repository (`src/features/focus/sessionRepository.ts`) with a real `sessions` table (id, startedAt, endedAt, plannedSeconds, targetEndAt, focusedSeconds, status, mode, blockedAppCount, createdAt).
- Deterministic streak engine (`src/features/streak/streakEngine.ts`) recomputed from persisted sessions every time — 10-minute qualification rule, current + longest streak.
- Zustand stores: settings (persisted via AsyncStorage), focus (session lifecycle), stats, screen time, purchases, duration selection.

**Phase C — UI**
- Full screen set implemented and wired via Expo Router: onboarding (animated splash → value → merged Screen Time + app-blocking Setup → denied/recovery → flip tutorial) → tabs (Home, History, Settings) → Active Focus (+ grace overlay) → Session Complete → Session Interrupted → Break → Settings subpages (Appearance, Blocked Apps, Help/How-it-works, About) → Paywall (+ purchase/restore states) → dev-only Motion Diagnostics.
- The first 3 onboarding screens (Splash, Value, Setup) were pixel-matched against `docs/ui-reference.png` by actually running the app on an iPhone 16 Pro simulator (real `expo run:ios` install, not a mockup) and iterating from real screenshots: left-aligned (not centered) headlines, phone-demo row with per-side labels, page-dot indicator, gradient CTA with a trailing-edge icon, and an animated hero (breathing scale, soft multi-layer glow tuned from a hard-edged blob to a true soft ellipse, thin pulsing rings) on the splash screen. The merged Setup screen (permission card + block-apps card) intentionally does not hardcode a 5-app toggle list like the reference mockup — it uses one real, `FamilyActivityPicker`-backed row so the visual density is close without faking selection data, per the explicit instruction to keep app selection real.
- Reanimated (`react-native-reanimated`, already an SDK-bundled dependency) is now actively used for entrance/loop animations on these 3 screens — first real runtime exercise of it in this project; no issues observed.
- Centralized semantic theme tokens (`src/theme`) with System/Light/Dark modes reacting to `useColorScheme()`; Splash/onboarding hero/Active Focus/Paywall intentionally stay dark per spec.
- No fake user name, no fake stats, no hardcoded blocked-app list, no Focus Points/Tree Grown/Focus Score anywhere.

**Phase D — Flip detection**
- `src/services/motion/motionEngine.ts` normalizes `DeviceMotion.accelerationIncludingGravity` into a unit gravity vector (÷9.80665) and classifies face-down/face-up/other with lateral + rotation-rate thresholds.
- `useFlipToStartDetector`: IDLE → FACE_DOWN_CANDIDATE → (≥1000ms stable) → FIRED, re-arms only after the phone is seen face-up again. Armed only when Home is focused, no active session, not already starting.
- `usePickupDetector`: drives the Active Focus GRACE state (debounced pickup, debounced resume) — session correctness never depends on it firing.
- Dev-only Motion Diagnostics screen (Settings → About → Motion Diagnostics, `__DEV__`-gated) exposes live gravity/rotation/orientation values for real-device calibration.
- **NEEDS PHYSICAL DEVICE**: thresholds (`FLIP_THRESHOLDS` in `motionEngine.ts`) are unverified against real hardware.

**Phase E — Native Screen Time (Swift)**
- Local Expo module `flip2focus-screen-time` (Swift, `ExpoModulesCore`) exposing `requestAuthorization`, `getAuthorizationStatus`, `presentActivityPicker`, `getSelectedCount`, `startShielding`, `stopShielding`, `isShieldingActive` — `FamilyActivitySelection` never crosses the JS bridge, only a selected-app count does.
- Real `FamilyActivityPicker` (SwiftUI) presented over the current top view controller (`ActivityPickerPresenter`/`ActivityPickerSheet`).
- `ManagedSettingsStore` shielding applied/cleared via shared logic in `Flip2FocusShared.swift`, persisted through App Group `group.com.ahmetcerit.flip2focus`.
- `Flip2FocusMonitor` — a real `DeviceActivityMonitor` app-extension target — clears the shield in `intervalDidEnd` even when the JS runtime/app is not running, for sessions ≤20h (all real session durations qualify; Free Focus/open-ended sessions apply the shield directly without a schedule and are cleared by manual `stopShielding` or app-relaunch reconciliation).
- `Flip2FocusShield` — a real `ShieldConfigurationDataSource` app-extension target — renders a branded dark shield using `logo-mark-transparent.png`.
- `ios/add_screen_time_targets.rb` (xcodeproj gem) wires both extension targets, their entitlements, Info.plists, and the "Embed Foundation Extensions" copy phase into the committed Xcode project. **Do not re-run this script except against a fresh `expo prebuild` output** — see its header comment.
- **Native build verified in this environment**: `xcodebuild -workspace ios/Flip2Focus.xcworkspace -scheme Flip2Focus -configuration Debug -destination 'id=<simulator>' build` → **BUILD SUCCEEDED** (all 3 targets: Flip2Focus, Flip2FocusMonitor, Flip2FocusShield). Compiled, linked, App Group + Family Controls entitlements present.
- **NEEDS PHYSICAL DEVICE**: end-to-end runtime validation (real authorization prompt, real picker, apps actually shielded/unshielded, shield UI rendering) — a simulator build proves compilation/linking only, not Screen Time runtime behavior (FamilyControls has known simulator limitations).
- **NEEDS APPLE DEVELOPER ACTION**: Team/signing assignment, Family Controls (Distribution) entitlement approval before TestFlight/App Store — see STORE_SETUP.md.

**Phase F — Notifications / break / recovery**
- `expo-notifications` wrapper schedules/cancels focus-complete and break-complete local notifications; permission requested contextually (after first Session Complete, and from the Settings toggle) — never at first launch.
- Break flow: 5-minute countdown, unblocks apps immediately (`stopShielding()`), Skip Break, break-complete notification.
- Lifecycle recovery (`focusStore.reconcileOnLaunch`, called from `useAppBootstrap`): restores an in-progress session, or — if a timed session's `targetEndAt` already passed — finalizes it as COMPLETED exactly once and ensures shielding is cleared. Active Focus screen also re-checks completion every tick, covering the backgrounded-then-foregrounded case without a full relaunch.

**Phase G — Purchases**
- RevenueCat (`react-native-purchases`) integration: `purchasesService.ts` (configure/fetch offering/purchase/restore, all outcome-typed), `purchasesStore.ts` (entitlement state + flow state), custom paywall screen matching the reference (no hardcoded prices — `pkg.product.priceString` from the SDK).
- Free-tier gating is derived live from SQLite (`countStartedSessionsToday`), not a separate mutable counter, so it can't drift from real session history.
- Paywall handles: offering not configured (explicit message, not a fake toggle), loading, purchase success/cancel/error, restore success/nothing-to-restore/error.
- **NEEDS REVENUECAT CREDENTIALS**: `EXPO_PUBLIC_REVENUECAT_IOS_KEY` env var is unset in this environment, so `isPurchasesConfigured()` is false and the paywall shows "Purchases aren't configured in this build yet" instead of any fake/permanent Pro state. See STORE_SETUP.md.

**Phase H — Validation**
- `npx tsc --noEmit` — clean.
- `npx expo lint` — clean.
- `npx expo-doctor` — 16/18 pass. Two remaining items are expected, not bugs (see below).
- Native iOS Debug build for simulator — **BUILD SUCCEEDED** (see Phase E).

## Known/accepted expo-doctor findings (not bugs)
1. *"packages that should not be installed directly" → expo-modules-core.* Our local Screen Time module declares `expo-modules-core` as a `peerDependency`; leaving it out makes expo-doctor's *other* check ("missing peer dependency… app may crash outside Expo Go") fail instead. Between the two false positives, keeping it installed is the functionally correct choice — verified as such by the successful native build.
2. *"app config fields that may not be synced in a non-CNG project."* Expected and intentional: per `CLAUDE_MASTER_PROMPT.md`, once the Screen Time extension targets exist we deliberately stop running `expo prebuild`, so `ios/` is now hand-maintained. app.json remains as documentation of intent; native config changes going forward must be made directly in `ios/`.

## Known workaround applied
`node_modules/expo-modules-jsi` (a transitive dependency pulled in by the Expo SDK 57 JSI layer) fails to compile under the Xcode 26.2 / Swift 6 toolchain in this environment: `abs(Double)` becomes ambiguous once C++ interop is enabled, and a compound `guard` with `abs(...)` triggers a spurious "type of expression is ambiguous" diagnostic. Patched via `patches/expo-modules-jsi+57.0.4.patch` (`patch-package`, wired into `npm install` through the `postinstall` script) — splits the guard and replaces `abs(milliseconds)` with an explicit ternary so no ambiguous overload resolution is needed. This is an upstream/toolchain issue, not something introduced by Flip2Focus code; re-verify if `expo-modules-jsi` is ever upgraded.

## Remaining
- Physical-device validation of flip detection, grace/pickup, and Screen Time end-to-end behavior (see NEEDS PHYSICAL DEVICE items above).
- RevenueCat product/offering configuration once credentials exist (see STORE_SETUP.md).
- Apple Developer Team assignment + Family Controls Distribution entitlement approval before any TestFlight/App Store submission.
- Final visual QA pass against `docs/ui-reference.png` on a real device/simulator screen (structure/content implemented; pixel-level spacing not yet eyeballed on-device).
- Privacy Policy / Terms of Use / Support URLs (placeholders only — see STORE_SETUP.md).

## Bugs
- None currently open.

## Needs physical iPhone
- Flip-to-start threshold calibration (`FLIP_THRESHOLDS` in `src/services/motion/motionEngine.ts`) — use the dev Motion Diagnostics screen.
- Grace/pickup detection feel (debounce timings).
- End-to-end Screen Time: real authorization prompt, real picker, apps actually shielded during a session, branded shield rendering, automatic unblock at scheduled end while backgrounded/killed.
- Haptics feel.

## Needs Apple Developer action
- Assign a real Team ID for signing (main app + both extensions) before any device/TestFlight build.
- Family Controls capability (dev works without it; Distribution entitlement approval required before App Store/TestFlight).
- App Group `group.com.ahmetcerit.flip2focus` provisioning under a real team.

## Needs RevenueCat / App Store Connect
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (public SDK key).
- Offering + package identifiers (monthly/yearly Pro) and matching App Store Connect subscription products.
- Privacy Policy / Terms of Use / Support URLs.

## Validation performed
- `npx tsc --noEmit` — pass.
- `npx expo lint` — pass.
- `npx expo-doctor` — 16/18 pass (2 expected/false-positive, documented above).
- `xcodebuild … -scheme Flip2Focus … build` for iOS Simulator (iPhone 16 Pro, iOS 18.0) — **BUILD SUCCEEDED**, all 3 targets (Flip2Focus, Flip2FocusMonitor, Flip2FocusShield) compiled and linked; App Group + Family Controls entitlements present in the built product.
- `npx expo run:ios` — installed and launched the real dev-client build on the iPhone 16 Pro simulator (not just a compile check). Navigated to and screenshotted the Splash, Value, and Setup screens; iterated the splash glow visual directly from screenshots until it matched. Also incidentally observed: the real `requestAuthorization()` native call correctly surfaces iOS's actual Screen Time consent prompt ("Enter iPhone Passcode… to allow Flip2Focus to access Screen Time"), and the Paywall screen renders its "not configured" state correctly — both good signs the wiring is real, not mocked.
- Did NOT run/test on a physical device (not available in this environment) and did NOT complete a full end-to-end Screen Time authorization (simulator has no passcode configured, so the consent dialog can't be completed there) or verify actual app shielding at runtime.
