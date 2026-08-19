/**
 * RevenueCat configuration. Real values must come from env vars set at build
 * time (EAS secrets / .env, never committed). See STORE_SETUP.md for what's
 * still missing.
 */
export const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

export const PRO_ENTITLEMENT_ID = 'pro';

export const FREE_DAILY_SESSION_LIMIT = 3;
