import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppFonts } from '@/hooks/useAppFonts';
import { useRefreshOnForeground } from '@/hooks/useRefreshOnForeground';
import { createQueryClient } from '@/services/queryClient';
import { ThemeProvider, lightTheme } from '@/theme';

// Hold the native splash until fonts resolve, so the first frame the user sees
// is already set in Fraunces rather than reflowing from the system font.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const ready = fontsLoaded || fontError !== null;

  // Created once per app session. A module-level client would be shared across
  // Fast Refresh reloads and leak cache between them.
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    if (fontError !== null) {
      // Not fatal: the theme falls back to system fonts. Surface it anyway.
      console.warn('[fonts] Failed to load app typefaces:', fontError.message);
    }
  }, [fontError]);

  const onLayout = useCallback(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: lightTheme.colors.background }}
    >
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider fontsLoaded={fontsLoaded}>
            <AppShell onLayout={onLayout} />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * The navigator, plus the app-wide effects that must run *inside* the query
 * provider. `useRefreshOnForeground` calls `useQueryClient`, so it cannot live
 * in `RootLayout` — that component renders the provider rather than sitting
 * beneath it.
 */
function AppShell({ onLayout }: { onLayout: () => void }) {
  useRefreshOnForeground();

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: lightTheme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
