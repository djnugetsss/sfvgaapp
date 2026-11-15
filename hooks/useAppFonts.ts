import { useFonts } from 'expo-font';

// Imported by exact subpath, not from the package root. The root entry of
// `@expo-google-fonts/*` re-exports every weight and italic, and Metro would
// then bundle every TTF we never render.
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';

/**
 * Loads the typeface the design system depends on.
 *
 * The keys here MUST match `fontFamilies` in `theme/tokens.ts` — that pairing
 * is what makes the token `fontFamily` strings resolve at render time.
 *
 * Returns `[loaded, error]`. The app renders either way: until `loaded` flips,
 * `ThemeProvider` serves a system-font variant of the same scale, so a font
 * failure degrades to plain-but-correct rather than to a blank app.
 */
export function useAppFonts(): [boolean, Error | null] {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  return [loaded, error];
}
