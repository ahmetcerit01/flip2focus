import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { presentBlockedAppsPicker } from '@/services/screenTime/screenTimeService';
import { useDarkTheme } from '@/theme/ThemeProvider';

export default function ChooseAppsScreen() {
  const { colors, radius } = useDarkTheme();
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [opening, setOpening] = useState(false);

  const openPicker = async () => {
    setOpening(true);
    try {
      const count = await presentBlockedAppsPicker();
      setSelectedCount(count);
    } finally {
      setOpening(false);
    }
  };

  return (
    <Screen forceDark contentContainerStyle={styles.container}>
      <View>
        <AppText variant="headline" weight="bold" color={colors.text}>
          Choose what to block
        </AppText>
        <AppText secondary style={styles.subtitle}>
          Pick the apps that pull your attention. They&apos;ll be shielded automatically during every focus session.
        </AppText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderRadius: radius.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised }]}>
          <Icon name="apps.iphone" size={22} color={colors.accentMint} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="medium" color={colors.text}>
            {selectedCount == null ? 'No apps selected yet' : `${selectedCount} app${selectedCount === 1 ? '' : 's'} selected`}
          </AppText>
          <AppText variant="small" muted style={{ marginTop: 2 }}>
            Uses Apple&apos;s app picker — Flip2Focus never sees which apps you chose
          </AppText>
        </View>
      </View>

      <GradientButton label="Choose Apps" onPress={openPicker} loading={opening} style={styles.chooseCta} />

      {selectedCount === 0 ? (
        <AppText variant="small" muted center style={styles.warning}>
          No apps selected — the timer will still run, but nothing will be blocked.
        </AppText>
      ) : null}

      <GradientButton
        label="Continue"
        onPress={() => router.push('/onboarding/tutorial')}
        style={styles.continueCta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 20,
  },
  subtitle: {
    marginTop: 10,
    lineHeight: 21,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chooseCta: {
    marginTop: 4,
  },
  warning: {
    lineHeight: 18,
  },
  continueCta: {
    marginTop: 8,
  },
});
