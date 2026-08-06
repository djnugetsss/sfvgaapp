import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { createTheme, lightTheme, type Theme } from '@/theme/tokens';

/**
 * Theme context. Seeded with the fonts-not-loaded light theme so a component
 * rendered outside the provider (tests, Storybook) still gets valid tokens
 * instead of throwing — but `useTheme` warns in dev if that happens.
 */
const ThemeContext = createContext<Theme | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  /**
   * Whether the custom typefaces have resolved. Drives the graceful
   * system-font fallback inside `createTheme`.
   */
  fontsLoaded: boolean;
};

export function ThemeProvider({ children, fontsLoaded }: ThemeProviderProps) {
  // Only two possible values, so this memo genuinely prevents re-renders of
  // every themed component on unrelated root-level state changes.
  const theme = useMemo(() => createTheme(fontsLoaded), [fontsLoaded]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Returns the active theme tokens. */
export function useTheme(): Theme {
  const theme = useContext(ThemeContext);

  if (theme === null) {
    if (__DEV__) {
      console.warn(
        '[theme] useTheme() called outside <ThemeProvider>. Falling back to the default light theme.',
      );
    }
    return lightTheme;
  }

  return theme;
}
