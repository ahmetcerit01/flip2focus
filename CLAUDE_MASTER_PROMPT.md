# Flip2Focus — React Native iOS MVP Rebuild

You are rebuilding the Flip2Focus mobile app from scratch in the current Git repository.

## Operating rules

- Preserve `.git` and Git history. Do not create a nested second repository.
- The old application UI/code is deprecated. Inspect first, then remove/replace obsolete application code as needed.
- Build the new product as a clean React Native + TypeScript app using Expo.
- iOS is the only release target for v1. Android is explicitly out of scope.
- This is a production MVP, not a visual prototype. Do not ship mock buttons, fake stats, hardcoded sessions, fake app selections, or UI that claims functionality that does not exist.
- Do not declare the MVP complete until the acceptance criteria near the end of this document are satisfied.
- Run the relevant commands yourself when possible. Fix errors instead of only reporting them.
- Maintain `MVP_STATUS.md` with completed items, remaining items, blockers, and manual Apple/App Store steps.
- Keep code modular. Do not put the entire app or native bridge into one giant file.
- Do not add account creation, Google login, Apple login, Firebase, backend APIs, cloud sync, friends, leaderboards, AI, widgets, Apple Watch, achievements, points, or a tree-growth game in v1.
- Do not use Expo Go as the target development environment. This app requires custom native iOS code. Use an Expo development build.
- Use compatible Expo-managed package versions (`npx expo install` where appropriate) instead of arbitrarily forcing package versions.
- Before destructive changes, ensure the working tree is understood and record the current state in `MVP_STATUS.md`.

## Visual source of truth

Use:

`docs/ui-reference.png`

as the visual reference for the main UI.

The product should feel premium, calm, native, modern and focused. The reference deliberately mixes:
- deep dark screens for onboarding, active focus and paywall;
- warm off-white screens for Home, History, Settings and completion;
- restrained blue → mint → lime accents.

Do **not** turn the entire app into a neon interface. Glow is allowed only on one or two hero assets such as the focus orb. Cards, navigation, settings rows, typography and most controls should remain clean and subtle.

Use the system font / SF-style typography. Prefer native-feeling spacing and interactions.

Suggested tokens:
- dark background: `#080D10`
- dark surface: `#12191D`
- light background: `#F7F6F2`
- light surface: `#FFFFFF`
- blue: `#3478F6`
- mint: `#61D9C2`
- lime: `#B9F246`
- dark text: `#0C1115`
- light text: `#F7F8F9`
- muted: `#899297`
- card radius: ~20–24
- pill radius: 999
- normal horizontal screen padding: ~20

Do not hardcode a fake user name such as “Alex”. The app has no account in v1.

## Assets

The production files already exist under:

`src/assets/branding/`

Use these exact files:

- `app-icon-master.png`
- `logo-mark-transparent.png`
- `flip-phone-hero.png`
- `phone-face-up.png`
- `phone-face-down.png`
- `focus-orb.png`
- `seedling.png`
- `session-complete-badge.png`
- `empty-history.png`
- `pro-crown.png`

Use `logo-mark-transparent.png` for a branded Screen Time shield where appropriate.

Do not add the discarded lightning/hourglass experiments. Do not generate replacement assets unless a required asset is genuinely missing. Use SF Symbols/native icons or a sensible React Native icon library for utility icons.

## Technology

Use:
- React Native + TypeScript
- Expo
- Expo Router
- Expo development build / Xcode for iOS native work
- Zustand for transient app state
- `expo-sqlite` for focus-session persistence
- AsyncStorage (or an equally lightweight local key/value solution) for simple settings/onboarding flags
- `expo-sensors` DeviceMotion for foreground flip detection first
- `expo-haptics`
- `expo-notifications`
- `expo-linear-gradient`
- RevenueCat React Native SDK for StoreKit purchases/subscriptions
- a local Expo native module written in Swift for Screen Time APIs

If `expo-sensors` is not reliable enough after real-device testing, isolate the motion implementation behind a service interface and replace only that implementation with Core Motion in the local native module. Do not rewrite the UI.

## Native project rule

Generate the native iOS project once when needed and commit it.

Because Screen Time requires native extension targets, after those targets are configured do **not** casually run destructive commands such as `expo prebuild --clean` that would remove manual native target changes. If you decide to automate native changes with a config plugin, verify that it recreates every required entitlement/target before relying on it.

## Suggested repository structure

Keep a clean structure similar to:

```text
app/
  _layout.tsx
  index.tsx
  onboarding/
  home/
  focus/
  history/
  settings/
  paywall/

src/
  assets/
  components/
    ui/
    focus/
    stats/
    onboarding/
  features/
    focus/
    history/
    streak/
    purchases/
    screenTime/
  hooks/
  services/
    motion/
    notifications/
    purchases/
    persistence/
    screenTime/
  stores/
  theme/
  types/

modules/
  flip2focus-screen-time/
    ios/
    src/

ios/
```

The exact structure may vary slightly if Expo Router conventions make another layout cleaner, but preserve separation of concerns.

## Navigation

The high-level navigation should be:

```text
Root
├── onboarding flow
└── main app
    ├── Home
    ├── History
    └── Settings
```

Active Focus is a dedicated full-screen flow rather than a normal bottom tab.

Paywall, duration picker and some permission explanations may be modal/sheet flows.

## First-launch onboarding

Implement these states:

1. Splash / launch
2. Value onboarding:
   - “Flip your phone.”
   - “Focus instantly.”
   - explain that placing the phone face down starts focus
3. Screen Time permission explanation
4. Real Family Controls authorization request
5. Real distracting-app selection using Apple’s Family Activity picker
6. “Try your first flip” tutorial using `phone-face-up.png` and `phone-face-down.png`
7. Home

Persist onboarding completion locally.

If Screen Time authorization is denied, show a clear denied state with Retry / Open Settings guidance. Do not dead-end or crash.

If no apps are selected, allow the timer to work while clearly explaining that no distractions will be blocked.

## Screen Time native module

Create a local Expo native module in Swift. Keep Apple-only functionality out of ordinary React components.

The JS-facing API should be intentionally small, along these lines:

```ts
type ScreenTimeAuthorizationStatus =
  | 'notDetermined'
  | 'approved'
  | 'denied';

requestAuthorization(): Promise<ScreenTimeAuthorizationStatus>
getAuthorizationStatus(): Promise<ScreenTimeAuthorizationStatus>
presentActivityPicker(): Promise<{ selectedCount: number }>
getSelectedCount(): Promise<number>
startShielding(sessionId: string, endsAt: number): Promise<void>
stopShielding(sessionId?: string): Promise<void>
isShieldingActive(): Promise<boolean>
```

Do not try to expose private Screen Time token internals to JS merely to recreate a fake app list. Keep `FamilyActivitySelection` native and persist it in a shared native/App Group location.

The React Native UI only needs the selected count for the MVP.

Use Apple Screen Time frameworks appropriately:
- FamilyControls
- ManagedSettings
- DeviceActivity
- ManagedSettingsUI where needed

Set up the native targets required for a reliable production implementation. At minimum, implement the pieces needed so that:
- selected apps are shielded when a focus session starts;
- restrictions remain active even if the React Native JS runtime is no longer active;
- restrictions are automatically cleared when a timed focus session ends;
- manually ending a focus session clears restrictions immediately;
- the custom shield is branded cleanly with Flip2Focus styling.

Use an App Group/shared native persistence mechanism for data needed by the main app and Screen Time extensions.

Create the needed entitlement files and document the exact Developer Portal/App Store configuration still requiring manual action in `STORE_SETUP.md`.

Do not fake Screen Time behavior with a hardcoded list of Instagram/TikTok/etc.

## Focus model

Create a real focus-session model stored in SQLite.

At minimum:

```text
id
startedAt
endedAt
plannedSeconds
focusedSeconds
status
createdAt
```

Statuses:

```text
ACTIVE
COMPLETED
INTERRUPTED
```

Use timestamps as the source of truth.

Do not implement a timer by decrementing a persisted integer every second.

For a timed session:

```text
remaining = targetEndAt - Date.now()
```

For a free-focus session:

```text
elapsed = Date.now() - startedAt
```

The UI may update once per second, but session truth must derive from timestamps.

Implement app relaunch/session recovery:
- if a session is still active, restore it;
- if its target end time passed while the app was not active, reconcile it as completed;
- ensure shields are not accidentally left on forever;
- ensure completion is not recorded twice.

## Flip detection

The core interaction is:

> User chooses a duration, opens Home, and places the phone face down on the table. The session starts automatically.

This is mandatory.

Use DeviceMotion in the foreground and implement a state machine, not a single noisy threshold.

Example conceptual states:

```text
IDLE
→ FACE_DOWN_CANDIDATE
→ STABLE_FACE_DOWN
→ START_SESSION
```

Requirements:
- Only arm flip-to-start when Home is the active screen and the app is ready.
- Require the phone to remain face down and reasonably stable for roughly 1 second before triggering.
- Use gravity/orientation plus movement/stability information to avoid false positives.
- Trigger only once per deliberate flip.
- Give subtle haptic feedback when the session starts.
- Add a development-only motion diagnostics view/logging mode so the face-down threshold can be calibrated on a real iPhone instead of assuming a coordinate sign incorrectly.
- Remove/disable debug overlays in production builds.

Do not promise reliable “flip while the app is completely killed and iOS wakes it up” behavior.

Early end behavior:
- provide a visible “End Session” control;
- if foreground motion reliably detects the phone being picked up, show a short grace overlay (for example 5 seconds) allowing the user to place it back down;
- do not make session correctness depend on receiving background motion events.

## Home

Match the visual language of screen 4 in the reference.

Content:
- heading: `Ready to focus?`
- Today’s focused time
- today’s session count
- current streak
- duration selector
- large “Ready to Flip” card using the phone asset
- selected blocked-app count

Duration presets:
- 25 min
- 50 min
- Free Focus
- Custom

Free/Pro gating:
- 25 and 50 min are Free
- Free Focus and Custom are Pro
- Free users get up to 3 started focus sessions per local calendar day
- if the user reaches the free limit, present the paywall before a new session starts

Do not display “Focus Score”, fake points, fake growth stats or fake user names.

## Active Focus

Match screen 5.

Dark background.

Show:
- `Focus Mode`
- large timer
- calm supporting copy
- `focus-orb.png` as the main hero
- selected blocked-app count
- subtle End Session action

Do not add extra neon cards or excessive particles around the entire screen.

For a timed session, automatically complete when the target time is reached.

Schedule a local notification for focus completion and cancel/reconcile it if the session ends early.

## Grace / interruption

If foreground pickup detection is reliable:
- enter a `GRACE` UI state;
- display a small countdown such as 5 seconds;
- if the device returns face down, resume;
- otherwise end early.

If pickup cannot be detected because the app is inactive, the session continues until the scheduled end or until the user reopens the app and manually ends it. Do not invent unreliable background sensor behavior.

For an early end, save the actual focused duration and mark the session `INTERRUPTED`.

## Session complete

Match screen 6 visually.

Use:
- `session-complete-badge.png`
- actual focused minutes
- current streak
- today’s total focused time

Do not use:
- Focus Points
- Tree Grown
- invented scores

Actions:
- Done
- Start 5 min break (for timed Pomodoro-style sessions)

Keep confetti restrained and preferably code-based rather than another full-screen asset.

## Break

Simple warm/light screen:
- `Break Time`
- countdown
- “Stretch. Walk. Breathe.”
- Skip Break

Distractions may be unblocked during the break.

Schedule a local notification for the end of the break.

## Streak

Implement a real deterministic streak.

Rule for v1:
- a local calendar day qualifies if the user completes at least one focus session of 10 minutes or longer;
- current streak counts consecutive qualifying calendar days;
- store/recompute from session records so it cannot easily become inconsistent.

Expose:
- current streak
- longest streak

No points system.

## History

Match screen 7.

Implement real data from SQLite:
- Day / Week / Month segmented selector
- total focus for selected period
- simple bar chart
- recent sessions
- completed/interrupted status

Empty state:
- use `empty-history.png`
- `No focus sessions yet`
- CTA back to Home

Do not add an “Insights” tab in v1.

Bottom tabs:
- Home
- History
- Settings

## Settings

Match screen 8.

Sections:

Focus:
- Blocked Apps
- Default Focus Duration
- Grace Period

Experience:
- Haptics
- Sounds
- Notifications

Flip2Focus Pro:
- Upgrade to Pro
- Restore Purchases

General:
- How Flip2Focus Works
- Privacy Policy
- Terms of Use
- Help & Support
- About Flip2Focus
- version/build number

No account/profile section in v1.

If Screen Time permission has been revoked, Home/Settings must visibly warn that app blocking is unavailable and offer a recovery action.

## Notifications

Do not request notification permission immediately on first launch.

Ask contextually after the user understands why notifications are useful.

Use notifications only for:
- focus session completed
- break completed

Respect denied permission without breaking the app.

## Purchases / paywall

Use RevenueCat’s React Native SDK with a custom Flip2Focus paywall matching screen 9 rather than hardcoding App Store prices.

Do not hardcode `$19.99`, `$3.99`, etc.

Load products/offerings from the purchase SDK.

Use `pro-crown.png` as a restrained paywall hero.

Free:
- 25 and 50 minute presets
- up to 3 started sessions/day
- current streak
- basic history

Pro:
- unlimited sessions
- Free Focus
- custom duration
- full history

Only advertise features that actually exist in this build.

Implement:
- purchase
- purchase cancellation
- purchase error
- entitlement refresh on app launch
- restore purchases
- restore success/nothing-to-restore/error states

Create a configuration layer for the RevenueCat public SDK key; do not commit secret server keys.

If App Store / RevenueCat product configuration is not available yet, keep the implementation production-ready but document the exact external IDs/settings required in `STORE_SETUP.md`. Do not replace the real purchase layer with a permanently fake “Pro = true” button.

## Privacy and account scope

There is no Flip2Focus account in v1.

No:
- Gmail/Google registration
- Sign in with Apple
- email/password login
- Firebase Auth
- backend
- cloud sync

All focus history is local in this MVP.

Write the app so authentication can be added later without entangling it with focus-session logic, but do not implement it now.

## Error, empty and recovery states

Production MVP must include:
- Screen Time not determined
- Screen Time denied
- Screen Time revoked after onboarding
- no blocked apps selected
- no history
- no notification permission
- active session recovered after relaunch
- session target passed while app inactive
- purchase cancelled
- purchase failed
- restore failed / nothing to restore
- SQLite/persistence initialization failure with a user-safe fallback/error state

No blank white screens.

## App-store-facing quality

Create `STORE_SETUP.md` containing every manual external action required before submission, including:
- bundle identifier placeholder/current value
- App Group
- Family Controls capability
- Family Controls Distribution entitlement request for the app and applicable Screen Time extensions
- provisioning/signing notes
- notification capability if required
- RevenueCat/App Store Connect product IDs
- privacy policy URL placeholder
- terms URL placeholder
- support URL placeholder
- App Privacy questionnaire notes
- screenshots required
- review notes explaining why Screen Time access is used and how to test the flip interaction

Do not invent URLs or legal text. Mark missing external values clearly.

## Quality checks

Keep `MVP_STATUS.md` current.

Run and fix, where applicable:
- TypeScript typecheck
- ESLint
- Expo Doctor
- iOS development build
- native Xcode build after Screen Time targets are introduced

Do not mark a phase complete just because TypeScript compiles; native functionality requires a physical iPhone test.

## Acceptance criteria — do not call the MVP done before these pass

The v1 implementation is complete only when all of the following are true:

1. Clean install opens onboarding.
2. Returning install skips completed onboarding.
3. Screen Time authorization is real.
4. User can open the real Apple app/category picker.
5. Selected apps are genuinely shielded during focus.
6. Timed shielding is automatically cleared at the scheduled end even if JS was not active.
7. Manual session end clears shielding immediately.
8. Home shows real Today time/session/streak values.
9. 25-minute session can be started by putting the phone face down and holding it stable.
10. Accidental motion does not repeatedly start sessions.
11. Active Focus timer is derived from timestamps and survives app lifecycle changes.
12. Relaunch correctly recovers or reconciles an active session.
13. Completed sessions persist to SQLite.
14. Interrupted sessions persist with actual duration.
15. Streak follows the documented 10-minute qualification rule.
16. History is built from real SQLite data.
17. Empty/error/permission states are implemented.
18. Focus completion notification works when permission is granted.
19. Break timer and break completion notification work.
20. Free daily limit is enforced.
21. RevenueCat purchase/restore code paths are implemented and real products can be plugged in without UI rewrites.
22. No nonexistent Pro feature is advertised.
23. UI substantially matches `docs/ui-reference.png`.
24. UI does not contain excessive added neon/glow.
25. The app can be built as a real iOS development build.
26. `STORE_SETUP.md` clearly lists every external manual blocker before App Store submission.
27. `MVP_STATUS.md` truthfully states what still needs physical-device or App Store Connect verification.

## Implementation order

Work in this order so we surface risky native problems early:

Phase A — repo reset/scaffold/design system/assets/navigation  
Phase B — SQLite/settings/session domain/streak/history data layer  
Phase C — Home/onboarding/focus/history/settings UI  
Phase D — flip detection and physical-device calibration hooks  
Phase E — native Screen Time module + picker + shielding + extensions + automatic unshielding  
Phase F — notifications + break + lifecycle/session recovery  
Phase G — RevenueCat/paywall/restore/gating  
Phase H — error states/polish/typecheck/lint/expo doctor/native build  
Phase I — update `MVP_STATUS.md` and `STORE_SETUP.md`

Do not postpone Screen Time implementation until the very end. It is the highest-risk product feature.

Start now by:
1. Inspecting the current repo.
2. Creating/updating `MVP_STATUS.md`.
3. Showing a concise file-level implementation plan based on the actual repo.
4. Then execute the rebuild without waiting for cosmetic approval after every individual component, unless you encounter a destructive ambiguity or a required external identifier/value.
