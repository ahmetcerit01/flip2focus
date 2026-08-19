import { Stack } from 'expo-router';

import { Palette } from '@/theme/tokens';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Palette.darkBg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="value" />
      <Stack.Screen name="screentime" />
      <Stack.Screen name="screentime-denied" />
      <Stack.Screen name="apps" />
      <Stack.Screen name="tutorial" />
    </Stack>
  );
}
