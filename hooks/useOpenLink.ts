import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

import { useTheme } from '@/theme';

/**
 * Opens a URL in the in-app browser, dressed in the app's chrome so the
 * handoff doesn't feel like leaving.
 *
 * Every screen that links out used to repeat this call and its two colours;
 * this is the one place they live now.
 */
export function useOpenLink(): (url: string) => void {
  const theme = useTheme();

  return useCallback(
    (url: string) => {
      void WebBrowser.openBrowserAsync(url, {
        toolbarColor: theme.colors.background,
        controlsColor: theme.colors.primary,
      });
    },
    [theme.colors.background, theme.colors.primary],
  );
}
