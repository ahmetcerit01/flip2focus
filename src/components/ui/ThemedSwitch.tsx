import { Switch } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

interface ThemedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ThemedSwitch({ value, onValueChange, disabled }: ThemedSwitchProps) {
  const { colors } = useAppTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.border, true: colors.accentBlue }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.border}
    />
  );
}
