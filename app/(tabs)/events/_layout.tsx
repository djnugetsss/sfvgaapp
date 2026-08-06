import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

/**
 * Stack nested inside the Events tab, so event detail pushes over the calendar
 * while the tab bar stays put — the standard iOS pattern, and it keeps the
 * user's place in the agenda when they come back.
 *
 * Headers are off: detail renders its own full-bleed hero and back control.
 */
export default function EventsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        // A clean push. The hero carries the visual continuity between the
        // card and the detail page.
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
