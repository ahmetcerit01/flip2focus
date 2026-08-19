import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { AppThemeProvider } from '@/theme/ThemeProvider';
import { Palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

function BootErrorScreen({ error }: { error: Error }) {
  return (
    <Screen forceDark>
      <AppText variant="title" weight="semibold" style={{ marginBottom: 12 }}>
        Flip2Focus couldn&apos;t start
      </AppText>
      <AppText secondary>
        Local storage failed to initialize on this device, so your focus history can&apos;t be saved right now.
        Restarting the app usually fixes this.
      </AppText>
      <AppText variant="small" muted style={{ marginTop: 16 }}>
        {error.message}
      </AppText>
    </Screen>
  );
}

function RootNavigator() {
  const { ready, dbError } = useAppBootstrap();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;
  if (dbError) return <BootErrorScreen error={dbError} />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.darkBg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="focus/active" options={{ gestureEnabled: false }} />
      <Stack.Screen name="focus/complete" options={{ gestureEnabled: false }} />
      <Stack.Screen name="focus/interrupted" options={{ gestureEnabled: false }} />
      <Stack.Screen name="focus/break" options={{ gestureEnabled: false }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      <Stack.Screen name="duration-sheet" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.55] }} />
      <Stack.Screen name="settings/appearance" options={{ presentation: 'card' }} />
      <Stack.Screen name="settings/blocked-apps" options={{ presentation: 'card' }} />
      <Stack.Screen name="settings/help" options={{ presentation: 'card' }} />
      <Stack.Screen name="settings/about" options={{ presentation: 'card' }} />
      {__DEV__ ? <Stack.Screen name="settings/motion-debug" options={{ presentation: 'card' }} /> : null}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <RootNavigator />
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
