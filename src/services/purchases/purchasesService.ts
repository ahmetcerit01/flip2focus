import { Platform } from 'react-native';
import Purchases, {
  PurchasesError,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import { PRO_ENTITLEMENT_ID, REVENUECAT_IOS_API_KEY } from '@/config/purchases';

let configured = false;

export function isPurchasesConfigured(): boolean {
  return configured && REVENUECAT_IOS_API_KEY.length > 0;
}

export async function configurePurchases(): Promise<void> {
  if (configured || Platform.OS !== 'ios') return;
  if (!REVENUECAT_IOS_API_KEY) {
    console.warn('[purchases] EXPO_PUBLIC_REVENUECAT_IOS_KEY is not set — Pro purchases are disabled. See STORE_SETUP.md.');
    return;
  }
  Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
  configured = true;
}

export function customerInfoHasPro(info: CustomerInfo): boolean {
  return Boolean(info.entitlements.active[PRO_ENTITLEMENT_ID]);
}

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isPurchasesConfigured()) return null;
  return Purchases.getCustomerInfo();
}

export async function fetchCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!isPurchasesConfigured()) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export function addCustomerInfoListener(listener: (info: CustomerInfo) => void): () => void {
  if (!isPurchasesConfigured()) return () => {};
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}

export type PurchaseOutcome =
  | { kind: 'success'; isPro: boolean }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string };

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { kind: 'success', isPro: customerInfoHasPro(customerInfo) };
  } catch (err) {
    const purchasesError = err as PurchasesError;
    if (purchasesError.userCancelled) return { kind: 'cancelled' };
    return { kind: 'error', message: purchasesError.message ?? 'Purchase failed. Please try again.' };
  }
}

export type RestoreOutcome =
  | { kind: 'success'; isPro: boolean }
  | { kind: 'nothingToRestore' }
  | { kind: 'error'; message: string };

export async function restorePurchases(): Promise<RestoreOutcome> {
  if (!isPurchasesConfigured()) return { kind: 'error', message: 'Purchases are not available right now.' };
  try {
    const info = await Purchases.restorePurchases();
    const isPro = customerInfoHasPro(info);
    return isPro ? { kind: 'success', isPro } : { kind: 'nothingToRestore' };
  } catch (err) {
    const purchasesError = err as PurchasesError;
    return { kind: 'error', message: purchasesError.message ?? 'Restore failed. Please try again.' };
  }
}
