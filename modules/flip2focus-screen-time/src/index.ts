import { requireNativeModule } from 'expo-modules-core';

import type { ActivityPickerResult, ScreenTimeAuthorizationStatus } from './Flip2FocusScreenTime.types';

interface Flip2FocusScreenTimeNativeModule {
  requestAuthorization(): Promise<ScreenTimeAuthorizationStatus>;
  getAuthorizationStatus(): Promise<ScreenTimeAuthorizationStatus>;
  presentActivityPicker(): Promise<ActivityPickerResult>;
  getSelectedCount(): Promise<number>;
  startShielding(sessionId: string, endsAt: number): Promise<void>;
  stopShielding(sessionId?: string): Promise<void>;
  isShieldingActive(): Promise<boolean>;
}

const nativeModule = requireNativeModule<Flip2FocusScreenTimeNativeModule>('Flip2FocusScreenTimeModule');

export function requestAuthorization(): Promise<ScreenTimeAuthorizationStatus> {
  return nativeModule.requestAuthorization();
}

export function getAuthorizationStatus(): Promise<ScreenTimeAuthorizationStatus> {
  return nativeModule.getAuthorizationStatus();
}

export function presentActivityPicker(): Promise<ActivityPickerResult> {
  return nativeModule.presentActivityPicker();
}

export function getSelectedCount(): Promise<number> {
  return nativeModule.getSelectedCount();
}

export function startShielding(sessionId: string, endsAt: number): Promise<void> {
  return nativeModule.startShielding(sessionId, endsAt);
}

export function stopShielding(sessionId?: string): Promise<void> {
  return nativeModule.stopShielding(sessionId);
}

export function isShieldingActive(): Promise<boolean> {
  return nativeModule.isShieldingActive();
}

export type { ActivityPickerResult, ScreenTimeAuthorizationStatus };
