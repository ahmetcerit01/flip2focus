import { Image, type ImageSource } from 'expo-image';
import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useDarkTheme } from '@/theme/ThemeProvider';

type HeroSource = ImageSource | number | string;

interface OnboardingLayoutProps extends PropsWithChildren {
  heroSource?: HeroSource;
  heroSlot?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  footer?: React.ReactNode;
  step?: { index: number; total: number };
}

export function OnboardingLayout({ heroSource, heroSlot, title, subtitle, footer, step, children }: OnboardingLayoutProps) {
  const { colors } = useDarkTheme();
  return (
    <Screen forceDark scroll contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        {heroSlot ?? (heroSource ? <Image source={heroSource} style={styles.heroImage} contentFit="contain" /> : null)}
      </View>

      <View style={styles.textBlock}>
        <AppText variant="headline" weight="bold" color={colors.text}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText secondary style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {children}

      <View style={styles.footer}>
        {footer}
        {step ? (
          <View style={styles.dots}>
            {Array.from({ length: step.total }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === step.index ? colors.accentMint : colors.border },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  hero: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    marginTop: 8,
  },
  subtitle: {
    marginTop: 10,
    lineHeight: 21,
  },
  footer: {
    marginTop: 24,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
