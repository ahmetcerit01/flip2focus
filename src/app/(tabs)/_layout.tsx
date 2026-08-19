import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentBlue,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.tabBarBackground, borderTopColor: colors.border }],
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Icon name="house.fill" size={size} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Icon name="clock.fill" size={size} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Icon name="gearshape.fill" size={size} color={String(color)} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
