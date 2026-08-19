import { Text, TextProps } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

type Variant = 'display' | 'headline' | 'title' | 'bodyLarge' | 'body' | 'small' | 'caption' | 'timer';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

interface AppTextProps extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: string;
  muted?: boolean;
  secondary?: boolean;
  center?: boolean;
}

const fontWeights: Record<Weight, TextProps['style']> = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
};

export function AppText({
  variant = 'body',
  weight = 'regular',
  color,
  muted,
  secondary,
  center,
  style,
  ...rest
}: AppTextProps) {
  const { colors, fontSizes } = useAppTheme();

  const sizeMap: Record<Variant, number> = {
    display: fontSizes.display,
    headline: fontSizes.headline,
    title: fontSizes.title,
    bodyLarge: fontSizes.bodyLarge,
    body: fontSizes.body,
    small: fontSizes.small,
    caption: fontSizes.caption,
    timer: fontSizes.timer,
  };

  const resolvedColor = color ?? (muted ? colors.textMuted : secondary ? colors.textSecondary : colors.text);

  return (
    <Text
      {...rest}
      style={[
        { fontSize: sizeMap[variant], color: resolvedColor },
        fontWeights[weight],
        center ? { textAlign: 'center' } : null,
        style,
      ]}
    />
  );
}
