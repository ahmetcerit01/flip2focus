import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';

import { ThemeColors, type SemanticColors } from './colors';
import { FontSizes, Radius, Spacing } from './tokens';
import type { ResolvedScheme } from './tokens';

interface ThemeContextValue {
  scheme: ResolvedScheme;
  colors: SemanticColors;
  isDark: boolean;
  spacing: typeof Spacing;
  radius: typeof Radius;
  fontSizes: typeof FontSizes;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const appearance = useSettingsStore((s) => s.appearance);

  const scheme: ResolvedScheme = useMemo(() => {
    if (appearance === 'system') return systemScheme === 'dark' ? 'dark' : 'light';
    return appearance;
  }, [appearance, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      colors: ThemeColors[scheme],
      isDark: scheme === 'dark',
      spacing: Spacing,
      radius: Radius,
      fontSizes: FontSizes,
    }),
    [scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within AppThemeProvider');
  return ctx;
}

/** Fixed-dark theme for screens that intentionally never adapt (Splash, onboarding hero, Active Focus, Paywall). */
export function useDarkTheme(): ThemeContextValue {
  return {
    scheme: 'dark',
    colors: ThemeColors.dark,
    isDark: true,
    spacing: Spacing,
    radius: Radius,
    fontSizes: FontSizes,
  };
}
