import { Palette, ResolvedScheme } from './tokens';

export type SemanticColors = {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accentBlue: string;
  accentMint: string;
  accentLime: string;
  danger: string;
  warning: string;
  onAccent: string;
  tabBarBackground: string;
  tabBarInactive: string;
  shadow: string;
};

const light: SemanticColors = {
  background: Palette.lightBg,
  surface: Palette.lightSurface,
  surfaceRaised: Palette.lightSurfaceRaised,
  border: Palette.lightBorder,
  text: Palette.darkText,
  textSecondary: '#3A4146',
  textMuted: Palette.mutedLight,
  accentBlue: Palette.blue,
  accentMint: Palette.mint,
  accentLime: '#8FC627',
  danger: '#D9483F',
  warning: '#C98A1F',
  onAccent: '#FFFFFF',
  tabBarBackground: 'rgba(255,255,255,0.92)',
  tabBarInactive: Palette.mutedLight,
  shadow: 'rgba(12,17,21,0.08)',
};

const dark: SemanticColors = {
  background: Palette.darkBg,
  surface: Palette.darkSurface,
  surfaceRaised: Palette.darkSurfaceRaised,
  border: Palette.darkBorder,
  text: Palette.lightText,
  textSecondary: '#C7CDD1',
  textMuted: Palette.mutedDark,
  accentBlue: Palette.blue,
  accentMint: Palette.mint,
  accentLime: Palette.lime,
  danger: '#FF6B6B',
  warning: Palette.amber,
  onAccent: '#06090B',
  tabBarBackground: 'rgba(18,25,29,0.92)',
  tabBarInactive: Palette.mutedDark,
  shadow: 'rgba(0,0,0,0.35)',
};

export const ThemeColors: Record<ResolvedScheme, SemanticColors> = { light, dark };
