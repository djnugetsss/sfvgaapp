import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

/** Members tab stack: the resources page, with the renewal form pushed over it. */
export default function MembersLayout() {
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
      <Stack.Screen name="renew" />
    </Stack>
  );
}
