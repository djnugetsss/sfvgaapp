import { Tabs } from 'expo-router';

import { AnimatedTabBar } from '@/components/navigation/AnimatedTabBar';
import { TABS } from '@/constants/navigation';
import { useTheme } from '@/theme';

/**
 * The tab navigator. The stock bar is fully replaced by `AnimatedTabBar` via
 * the `tabBar` prop — screen order here defines the order the pill travels
 * through, and both read from the same `TABS` constant.
 */
export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.label }}
        />
      ))}
    </Tabs>
  );
}
