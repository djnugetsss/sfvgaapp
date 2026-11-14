import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

/**
 * Stack nested inside the More tab, the same pattern as Events: the thali is
 * the root, and Membership, Contact & FAQ, Mission & roles, and Records push
 * over it while the tab bar stays put.
 *
 * Headers are off — each page draws its own back control in the scaffold, so
 * the editorial header is the first thing on every screen.
 */
export default function MoreLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="membership" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="about" />
      <Stack.Screen name="records" />
    </Stack>
  );
}
