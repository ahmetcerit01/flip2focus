import type { ScreenTimeAuthorizationStatus } from 'flip2focus-screen-time';

type NativeModule = typeof import('flip2focus-screen-time');

let nativeModule: NativeModule | null = null;
let resolved = false;

/**
 * Lazily resolves the native module. Returns null when it isn't compiled
 * into the current binary yet (e.g. an interim JS-only dev iteration before
 * a fresh native build) so the rest of the app can degrade gracefully
 * instead of crashing on import.
 */
function getNative(): NativeModule | null {
  if (resolved) return nativeModule;
  resolved = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    nativeModule = require('flip2focus-screen-time');
  } catch {
    nativeModule = null;
  }
  return nativeModule;
}

export function isScreenTimeModuleAvailable(): boolean {
  return getNative() !== null;
}

export async function requestScreenTimeAuthorization(): Promise<ScreenTimeAuthorizationStatus> {
  const native = getNative();
  if (!native) return 'notDetermined';
  return native.requestAuthorization();
}

export async function getScreenTimeAuthorizationStatus(): Promise<ScreenTimeAuthorizationStatus> {
  const native = getNative();
  if (!native) return 'notDetermined';
  return native.getAuthorizationStatus();
}

export async function presentBlockedAppsPicker(): Promise<number> {
  const native = getNative();
  if (!native) return 0;
  const result = await native.presentActivityPicker();
  return result.selectedCount;
}

export async function getBlockedAppsCount(): Promise<number> {
  const native = getNative();
  if (!native) return 0;
  return native.getSelectedCount();
}

export async function startShielding(sessionId: string, endsAt: number): Promise<void> {
  const native = getNative();
  if (!native) return;
  await native.startShielding(sessionId, endsAt);
}

export async function stopShielding(sessionId?: string): Promise<void> {
  const native = getNative();
  if (!native) return;
  await native.stopShielding(sessionId);
}

export async function isShieldingActive(): Promise<boolean> {
  const native = getNative();
  if (!native) return false;
  return native.isShieldingActive();
}
