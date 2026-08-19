import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { useDurationSelectionStore } from '@/stores/durationSelectionStore';
import { useAppTheme } from '@/theme/ThemeProvider';

const STEP = 5;
const MIN_MINUTES = 10;
const MAX_MINUTES = 180;

export default function DurationSheetScreen() {
  const { colors, radius } = useAppTheme();
  const customMinutes = useDurationSelectionStore((s) => s.customMinutes);
  const setCustomMinutes = useDurationSelectionStore((s) => s.setCustomMinutes);
  const select = useDurationSelectionStore((s) => s.select);

  const adjust = (delta: number) => {
    const next = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, customMinutes + delta));
    setCustomMinutes(next);
  };

  const confirm = () => {
    select('custom');
    router.back();
  };

  const stepperStyle = [styles.stepperButton, { backgroundColor: colors.surfaceRaised, borderRadius: radius.pill }];

  return (
    <Screen contentContainerStyle={styles.container}>
      <AppText variant="title" weight="semibold" center>
        Custom Duration
      </AppText>
      <AppText secondary center style={styles.subtitle}>
        Choose how long this focus session should run.
      </AppText>

      <View style={styles.stepperRow}>
        <Pressable onPress={() => adjust(-STEP)} style={stepperStyle}>
          <Icon name="minus" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.valueWrap}>
          <AppText variant="display" weight="bold">
            {customMinutes}
          </AppText>
          <AppText muted variant="small">
            minutes
          </AppText>
        </View>
        <Pressable onPress={() => adjust(STEP)} style={stepperStyle}>
          <Icon name="plus" size={20} color={colors.text} />
        </Pressable>
      </View>

      <GradientButton label="Set Duration" onPress={confirm} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 32,
    paddingTop: 12,
  },
  subtitle: {
    marginTop: -20,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  stepperButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueWrap: {
    alignItems: 'center',
    minWidth: 100,
  },
  cta: {
    marginTop: 8,
  },
});
