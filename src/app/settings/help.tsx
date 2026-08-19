import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { useAppTheme } from '@/theme/ThemeProvider';

const STEPS: { icon: 'iphone.gen3' | 'shield.fill' | 'timer' | 'checkmark.seal.fill'; title: string; body: string }[] = [
  {
    icon: 'iphone.gen3',
    title: 'Choose a duration',
    body: 'Pick 25 or 50 minutes on Home, or unlock Free Focus and Custom durations with Pro.',
  },
  {
    icon: 'shield.fill',
    title: 'Flip your phone face down',
    body: 'Place it on a flat surface and hold it still for about a second. Your session starts automatically and your selected apps are shielded.',
  },
  {
    icon: 'timer',
    title: 'Stay focused',
    body: 'Picking the phone up briefly gives you a short grace period to put it back down. Ending early marks the session interrupted.',
  },
  {
    icon: 'checkmark.seal.fill',
    title: 'Automatic unblock',
    body: 'When time is up, blocked apps are unshielded automatically and your session is saved to History.',
  },
];

const FAQ = [
  {
    q: 'Why does Flip2Focus need Screen Time access?',
    a: 'It uses Apple’s Screen Time framework (Family Controls) to genuinely shield the apps you choose — there is no fake blocking.',
  },
  {
    q: 'Does flipping work if the app is closed?',
    a: 'No — flip detection needs Flip2Focus open and Home on screen. A timed session you already started will still auto-complete and unblock on schedule even if you switch apps.',
  },
  {
    q: 'What happens to my data?',
    a: 'Everything is stored locally on your device. There is no account and nothing is uploaded.',
  },
];

export default function HelpScreen() {
  const { colors } = useAppTheme();
  return (
    <Screen scroll>
      <AppText variant="headline" weight="bold" style={styles.title}>
        How Flip2Focus Works
      </AppText>

      <View style={styles.steps}>
        {STEPS.map((step) => (
          <Card key={step.title} style={styles.stepCard}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised }]}>
              <Icon name={step.icon} size={18} color={colors.accentBlue} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText weight="semibold">{step.title}</AppText>
              <AppText variant="small" secondary style={{ marginTop: 4, lineHeight: 19 }}>
                {step.body}
              </AppText>
            </View>
          </Card>
        ))}
      </View>

      <AppText variant="title" weight="semibold" style={styles.faqTitle}>
        FAQ
      </AppText>
      <Card>
        {FAQ.map((item, i) => (
          <View key={item.q} style={i > 0 ? styles.faqItem : undefined}>
            <AppText weight="medium">{item.q}</AppText>
            <AppText variant="small" secondary style={{ marginTop: 4, lineHeight: 19 }}>
              {item.a}
            </AppText>
          </View>
        ))}
      </Card>

      <AppText variant="small" muted center style={styles.supportNote}>
        Need more help? Support contact details will be added here before release.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
    marginBottom: 16,
  },
  steps: {
    gap: 12,
  },
  stepCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqTitle: {
    marginTop: 24,
    marginBottom: 12,
  },
  faqItem: {
    marginTop: 16,
  },
  supportNote: {
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 18,
  },
});
