import { useFonts } from 'expo-font';

// Imported by exact subpath, not from the package root. The root entry of
// `@expo-google-fonts/*` re-exports every weight and italic, and Metro would
// then bundle ~11MB of TTFs we never render. These six imports ship ~1MB.
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';

/**
 * Loads the two typefaces the design system depends on.
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
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return [loaded, error];
}
