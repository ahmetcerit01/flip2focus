export const Palette = {
  darkBg: '#080D10',
  darkSurface: '#12191D',
  darkSurfaceRaised: '#1A2227',
  darkBorder: '#232C31',
  lightBg: '#F7F6F2',
  lightSurface: '#FFFFFF',
  lightSurfaceRaised: '#FCFBF8',
  lightBorder: '#E7E4DC',
  blue: '#3478F6',
  mint: '#61D9C2',
  lime: '#B9F246',
  red: '#FF5B5B',
  amber: '#F5B942',
  darkText: '#0C1115',
  lightText: '#F7F8F9',
  mutedDark: '#899297',
  mutedLight: '#6B7176',
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  card: 22,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const FontSizes = {
  caption: 12,
  small: 13,
  body: 15,
  bodyLarge: 17,
  title: 22,
  headline: 28,
  display: 40,
  timer: 56,
} as const;

export type AppearancePreference = 'system' | 'light' | 'dark';
export type ResolvedScheme = 'light' | 'dark';
