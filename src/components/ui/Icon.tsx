import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  weight?: SymbolViewProps['weight'];
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 20, color, weight = 'regular', style }: IconProps) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight={weight}
      style={[{ width: size, height: size }, style]}
    />
  );
}
