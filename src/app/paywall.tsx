import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { AppText } from '@/components/ui/AppText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { isPurchasesConfigured, purchasePackage, restorePurchases } from '@/services/purchases/purchasesService';
import { usePurchasesStore } from '@/stores/purchasesStore';
import { useDarkTheme } from '@/theme/ThemeProvider';

const crown = require('@/assets/branding/pro-crown.png');

const FEATURES = [
  'Unlimited focus sessions',
  'Free Focus & Custom durations',
  'Full session history',
  'Priority support',
];

export default function PaywallScreen() {
  const { colors, radius } = useDarkTheme();
  const params = useLocalSearchParams<{ restore?: string }>();
  const { offering, offeringLoaded, flowState, setFlowState, refreshEntitlement } = usePurchasesStore();
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);

  const packages = offering?.availablePackages ?? [];
  const defaultPackage = packages.find((p) => p.packageType === 'ANNUAL') ?? packages[0] ?? null;
  const selectedPackage: PurchasesPackage | null =
    packages.find((p) => p.identifier === selectedIdentifier) ?? defaultPackage;

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    setFlowState('purchasing');
    const outcome = await purchasePackage(selectedPackage);
    setFlowState('idle');
    if (outcome.kind === 'success') {
      await refreshEntitlement();
      router.back();
    } else if (outcome.kind === 'error') {
      Alert.alert('Purchase failed', outcome.message);
    }
  };

  const handleRestore = async () => {
    setFlowState('restoring');
    const outcome = await restorePurchases();
    setFlowState('idle');
    if (outcome.kind === 'success') {
      await refreshEntitlement();
      Alert.alert('Welcome back', 'Your Flip2Focus Pro access has been restored.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else if (outcome.kind === 'nothingToRestore') {
      Alert.alert('Nothing to restore', "We couldn't find a previous Flip2Focus Pro purchase for this Apple ID.");
    } else {
      Alert.alert('Restore failed', outcome.message);
    }
  };

  useEffect(() => {
    usePurchasesStore.getState().loadOffering();
  }, []);

  useEffect(() => {
    if (params.restore === '1') handleRestore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.restore]);

  const busy = flowState !== 'idle';

  return (
    <Screen forceDark scroll contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.closeButton} hitSlop={10}>
        <Icon name="xmark" size={16} color={colors.textMuted} />
      </Pressable>

      <View style={styles.hero}>
        <Image source={crown} style={styles.crown} contentFit="contain" />
        <AppText variant="headline" weight="bold" center style={{ marginTop: 12 }}>
          Flip2Focus <AppText variant="headline" weight="bold" color={colors.accentBlue}>Pro</AppText>
        </AppText>
        <AppText secondary center style={styles.subtitle}>
          Unlock your full potential.
        </AppText>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Icon name="checkmark.circle.fill" size={16} color={colors.accentMint} />
            <AppText color={colors.text}>{f}</AppText>
          </View>
        ))}
      </View>

      {!isPurchasesConfigured() ? (
        <View style={[styles.notConfigured, { borderRadius: radius.md, borderColor: colors.border }]}>
          <AppText variant="small" muted center>
            Purchases aren&apos;t configured in this build yet. See STORE_SETUP.md for the RevenueCat API key and
            product IDs still needed.
          </AppText>
        </View>
      ) : !offeringLoaded ? (
        <ActivityIndicator style={styles.loader} color={colors.accentBlue} />
      ) : !offering || offering.availablePackages.length === 0 ? (
        <View style={[styles.notConfigured, { borderRadius: radius.md, borderColor: colors.border }]}>
          <AppText variant="small" muted center>
            No subscription plans are available right now. Please try again later.
          </AppText>
        </View>
      ) : (
        <View style={styles.plans}>
          {offering.availablePackages.map((pkg) => {
            const active = selectedPackage?.identifier === pkg.identifier;
            const isAnnual = pkg.packageType === 'ANNUAL';
            return (
              <Pressable
                key={pkg.identifier}
                onPress={() => setSelectedIdentifier(pkg.identifier)}
                style={[
                  styles.planCard,
                  {
                    borderRadius: radius.card,
                    borderColor: active ? colors.accentBlue : colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                {isAnnual ? (
                  <View style={[styles.badge, { backgroundColor: colors.accentLime }]}>
                    <AppText variant="caption" weight="semibold" color="#06090B">
                      Best Value
                    </AppText>
                  </View>
                ) : null}
                <AppText weight="semibold">{pkg.packageType === 'ANNUAL' ? 'Yearly' : 'Monthly'}</AppText>
                <AppText variant="title" weight="bold" style={{ marginTop: 4 }}>
                  {pkg.product.priceString}
                </AppText>
                <AppText variant="caption" muted>
                  {pkg.packageType === 'ANNUAL' ? '/ year' : '/ month'}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      )}

      <GradientButton
        label={selectedPackage ? 'Start Pro Trial' : 'Continue'}
        onPress={handlePurchase}
        disabled={!selectedPackage || busy}
        loading={flowState === 'purchasing'}
        style={styles.cta}
      />
      <AppText variant="small" muted center style={styles.trialNote}>
        3 days free, cancel anytime.
      </AppText>

      <Pressable onPress={handleRestore} disabled={busy} style={styles.restoreButton}>
        {flowState === 'restoring' ? (
          <ActivityIndicator color={colors.textMuted} />
        ) : (
          <AppText variant="small" secondary>
            Restore Purchases
          </AppText>
        )}
      </Pressable>

      <View style={styles.legalRow}>
        <AppText variant="caption" muted>
          Terms of Use
        </AppText>
        <AppText variant="caption" muted>
          ·
        </AppText>
        <AppText variant="caption" muted>
          Privacy Policy
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 8,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  hero: {
    alignItems: 'center',
    marginTop: 4,
  },
  crown: {
    width: 84,
    height: 84,
  },
  subtitle: {
    marginTop: 6,
  },
  features: {
    marginTop: 28,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  plans: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  planCard: {
    flex: 1,
    borderWidth: 1.5,
    padding: 16,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  notConfigured: {
    marginTop: 28,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  loader: {
    marginTop: 40,
  },
  cta: {
    marginTop: 28,
  },
  trialNote: {
    marginTop: 10,
  },
  restoreButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
});
