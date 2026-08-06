/**
 * Barrel export for the design system. Import everything theme-related from
 * `@/theme` so the token surface stays a single, greppable boundary.
 */
export { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

export {
  createTheme,
  lightTheme,
  lightColors,
  typography,
  fontFamilies,
  spacing,
  radii,
  shadows,
  motion,
  spring,
  layout,
} from '@/theme/tokens';

export type {
  Theme,
  Colors,
  Typography,
  TypeVariant,
  TypeVariantName,
  FontFamilyKey,
  Spacing,
  Radii,
  Shadows,
  Motion,
  Layout,
} from '@/theme/tokens';
