import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { GradientButton } from '@/components/ui/GradientButton';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import {
  getScreenTimeAuthorizationStatus,
  presentBlockedAppsPicker,
  requestScreenTimeAuthorization,
} from '@/services/screenTime/screenTimeService';
import { useDarkTheme } from '@/theme/ThemeProvider';

const CARD_BG = '#171D21';

export default function ScreenTimeSetupScreen() {
  const { colors } = useDarkTheme();
  const [authorized, setAuthorized] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [opening, setOpening] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getScreenTimeAuthorizationStatus().then((status) => setAuthorized(status === 'approved'));
    }, []),
  );

  const handlePermissionTap = async () => {
    if (authorized || requesting) return;
    setRequesting(true);
    try {
      const status = await requestScreenTimeAuthorization();
      if (status === 'approved') {
        setAuthorized(true);
      } else if (status === 'denied') {
        router.push('/onboarding/screentime-denied');
      }
    } finally {
      setRequesting(false);
    }
  };

  const handleAppListTap = async () => {
    if (opening) return;
    setOpening(true);
    try {
      if (!authorized) {
        const status = await requestScreenTimeAuthorization();
        if (status !== 'approved') {
          if (status === 'denied') router.push('/onboarding/screentime-denied');
          return;
        }
        setAuthorized(true);
      }
      const count = await presentBlockedAppsPicker();
      setSelectedCount(count);
    } finally {
      setOpening(false);
    }
  };

  const appRowLabel =
    selectedCount == null
      ? 'Choose apps to block'
      : `${selectedCount} app${selectedCount === 1 ? '' : 's'} selected`;

  return (
    <Screen forceDark padded={false} contentContainerStyle={styles.safeArea}>
      <View style={styles.headlineBlock}>
        <Text style={styles.headline}>Focus starts{'\n'}with fewer distractions</Text>
        <Text style={styles.body}>Allow permissions and choose apps{'\n'}to block during focus sessions.</Text>
      </View>

      <View style={styles.cardsWrap}>
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <Pressable onPress={handlePermissionTap} disabled={requesting}>
            <View style={styles.card}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(52,120,246,0.14)' }]}>
                <Icon name="shield.fill" size={18} color={colors.accentBlue} />
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardTitle}>Allow Focus Mode Access</Text>
                <Text style={styles.cardSubtitle}>Required to block apps{'\n'}and track sessions</Text>
              </View>
              {authorized ? (
                <View style={styles.checkBadge}>
                  <Icon name="checkmark" size={13} color="#06090B" weight="bold" />
                </View>
              ) : (
                <Icon name="chevron.right" size={14} color="rgba(247,248,249,0.4)" />
              )}
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(220).duration(500)}>
          <Text style={styles.sectionLabel}>Block distracting apps</Text>
          <Pressable onPress={handleAppListTap} disabled={opening}>
            <View style={styles.card}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(97,217,194,0.14)' }]}>
                <Icon name="apps.iphone" size={18} color={colors.accentMint} />
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardTitle}>{appRowLabel}</Text>
                <Text style={styles.cardSubtitle}>Uses Apple&apos;s picker — we never see which apps</Text>
              </View>
              {selectedCount != null && selectedCount > 0 ? (
                <View style={[styles.checkBadge, { backgroundColor: colors.accentLime }]}>
                  <Icon name="checkmark" size={13} color="#06090B" weight="bold" />
                </View>
              ) : (
                <Icon name="chevron.right" size={14} color="rgba(247,248,249,0.4)" />
              )}
            </View>
          </Pressable>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.footer}>
        <GradientButton label="Continue" onPress={() => router.push('/onboarding/tutorial')} height={58} radius={19} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  headlineBlock: {
    marginTop: '12%',
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 33,
  },
  body: {
    marginTop: 12,
    color: 'rgba(247,248,249,0.68)',
    fontSize: 15,
    lineHeight: 20,
  },
  cardsWrap: {
    flex: 1,
    marginTop: 28,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CARD_BG,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 66,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cardSubtitle: {
    marginTop: 3,
    color: 'rgba(247,248,249,0.5)',
    fontSize: 12,
    lineHeight: 16,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#61D9C2',
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 8,
  },
  footer: {
    paddingBottom: 20,
  },
});
