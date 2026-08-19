import type { PurchasesOffering } from 'react-native-purchases';
import { create } from 'zustand';

import {
  addCustomerInfoListener,
  configurePurchases,
  customerInfoHasPro,
  fetchCurrentOffering,
  fetchCustomerInfo,
  isPurchasesConfigured,
} from '@/services/purchases/purchasesService';

export type PurchaseFlowState = 'idle' | 'purchasing' | 'restoring';

interface PurchasesState {
  isPro: boolean;
  entitlementLoaded: boolean;
  offering: PurchasesOffering | null;
  offeringLoaded: boolean;
  flowState: PurchaseFlowState;
  lastError: string | null;
  init: () => Promise<void>;
  refreshEntitlement: () => Promise<void>;
  loadOffering: () => Promise<void>;
  setFlowState: (state: PurchaseFlowState) => void;
  setLastError: (message: string | null) => void;
}

export const usePurchasesStore = create<PurchasesState>()((set, get) => ({
  isPro: false,
  entitlementLoaded: false,
  offering: null,
  offeringLoaded: false,
  flowState: 'idle',
  lastError: null,

  init: async () => {
    await configurePurchases();
    if (isPurchasesConfigured()) {
      addCustomerInfoListener((info) => set({ isPro: customerInfoHasPro(info) }));
    }
    await get().refreshEntitlement();
  },

  refreshEntitlement: async () => {
    try {
      const info = await fetchCustomerInfo();
      set({ isPro: info ? customerInfoHasPro(info) : false, entitlementLoaded: true });
    } catch {
      set({ entitlementLoaded: true });
    }
  },

  loadOffering: async () => {
    try {
      const offering = await fetchCurrentOffering();
      set({ offering, offeringLoaded: true });
    } catch (err) {
      set({ offeringLoaded: true, lastError: err instanceof Error ? err.message : String(err) });
    }
  },

  setFlowState: (flowState) => set({ flowState }),
  setLastError: (lastError) => set({ lastError }),
}));
