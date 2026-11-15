import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * SFVGA design tokens — the single source of truth for every visual value in
 * the app. No raw hex, font name, spacing number, or duration may appear
 * outside this file.
 *
 * The look is the Base44 web app's: a warm cream page, deep-teal text, a
 * crimson primary, a teal secondary and a saffron-orange accent, set in
 * Poppins with nearly square corners. The values below are that app's HSL
 * variables (`src/index.css`) converted to hex.
 *
 * Structured for a future dark theme: `palette` holds the raw ramps, and each
 * theme (`lightColors`, and later `darkColors`) is a *semantic* mapping onto
 * it. Adding dark mode means adding one object, not refactoring consumers.
 */

/* ------------------------------------------------------------------ *
 * Palette — raw values. Never consumed by components directly.
 * ------------------------------------------------------------------ */

const palette = {
  /** --background: 33 99% 99% */
  cream: '#FFFDFA',
  /** --card / --muted: 42 60% 98% */
  card: '#FDFBF7',
  /** --foreground: 196 73% 15% — a deep teal-black. */
  ink: '#0A3342',
  /** foreground at ~80% over the page — body copy. */
  slate: '#3B5B67',
  /** --muted-foreground: 196 25% 40% — meta text; 5:1 on the page. */
  mist: '#4D7280',
  /** --border: 33 35% 88% */
  linen: '#EBE1D6',

  /** --primary: 350 58% 40% — crimson. */
  crimson: '#A12B3F',
  /** --primary-foreground / --secondary-foreground: 48 80% 98% */
  paper: '#FEFCF6',
  /** --secondary: 186 82% 30% — teal. */
  teal: '#0E7F8B',
  /** --accent: 30 80% 50% — saffron orange. */
  saffron: '#E68019',

  jade: '#3C7A5A',
  /** --destructive: 0 72% 45% */
  clay: '#C52020',

  /** Shadow base — the page's ink, never pure #000. */
  shadow: '#0A3342',
} as const;

/* ------------------------------------------------------------------ *
 * Colors — semantic layer.
 * ------------------------------------------------------------------ */

export const lightColors = {
  /** Dominant surfaces. */
  background: palette.cream,
  surface: palette.card,
  surfaceElevated: palette.card,

  /** Text ramp, high → low emphasis. */
  textPrimary: palette.ink,
  textSecondary: palette.slate,
  textMuted: palette.mist,

  /** Hairlines and dividers. */
  border: palette.linen,

  /** Crimson — the brand colour: eyebrows, filled buttons, the active tab. */
  primary: palette.crimson,
  primaryContrast: palette.paper,
  /** Teal — secondary actions and prices. */
  secondary: palette.teal,
  secondaryContrast: palette.paper,
  /** Saffron — links, bullets and inactive tabs. */
  accent: palette.saffron,
  accentContrast: palette.ink,

  /** Semantic feedback. */
  success: palette.jade,
  error: palette.clay,

  /**
   * Retained for the few motif components that still name it. In this look the
   * brand red *is* `primary`, so there is no separate festive red to ration.
   */
  kumkum: palette.crimson,
  kumkumMuted: 'rgba(161, 43, 63, 0.12)',

  /** Non-content utility. */
  shadow: palette.shadow,
  /** Tint behind icon circles and the active tab. Primary at 10%. */
  accentWash: 'rgba(161, 43, 63, 0.10)',
  /** Scrim for the translucent tab bar and header over content. */
  chrome: 'rgba(255, 253, 250, 0.94)',
  /** The diya-dot texture: primary at 8%. */
  pattern: 'rgba(161, 43, 63, 0.08)',
} as const;

export type Colors = typeof lightColors;

/* ------------------------------------------------------------------ *
 * Typography
 * ------------------------------------------------------------------ */

/**
 * Font family keys as registered with expo-font. `ThemeProvider` swaps these
 * for `undefined` (→ system font) until the webfonts have loaded, so first
 * paint is never blank text.
 *
 * One family throughout, as on the web app: headings, display and body are all
 * Poppins, told apart by weight and size.
 */
export const fontFamilies = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export type FontFamilyKey = keyof typeof fontFamilies;

export type TypeVariant = {
  fontFamily: string | undefined;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: TextStyle['fontWeight'];
  textTransform?: TextStyle['textTransform'];
};

/**
 * The scale. Poppins everywhere; hierarchy comes from weight, size and the
 * tracked-out, bold, uppercase overline the web app opens every section with.
 *
 * Note on `fontWeight`: when a custom family is loaded, the *file* carries the
 * weight and iOS ignores the numeric value. It is kept so the fallback system
 * font renders at the right weight before fonts resolve.
 */
export const typography: Record<
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bodyLg'
  | 'body'
  | 'caption'
  | 'overline',
  TypeVariant
> = {
  display: {
    fontFamily: fontFamilies.medium,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.4,
    fontWeight: '500',
  },
  h1: {
    fontFamily: fontFamilies.medium,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.3,
    fontWeight: '500',
  },
  h2: {
    fontFamily: fontFamilies.medium,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
    fontWeight: '500',
  },
  h3: {
    fontFamily: fontFamilies.medium,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
    fontWeight: '500',
  },
  bodyLg: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
    fontWeight: '400',
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 23,
    letterSpacing: 0,
    fontWeight: '400',
  },
  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.1,
    fontWeight: '400',
  },
  overline: {
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2.4,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
};

export type Typography = typeof typography;
export type TypeVariantName = keyof Typography;

/* ------------------------------------------------------------------ *
 * Spacing — 4-based
 * ------------------------------------------------------------------ */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export type Spacing = typeof spacing;

/* ------------------------------------------------------------------ *
 * Radii
 * ------------------------------------------------------------------ */

export const radii = {
  /** Cards and photographs — the web app's `rounded-lg` is only 2px. */
  sm: 2,
  /** Inputs. */
  md: 4,
  lg: 4,
  xl: 8,
  /** Pills: buttons and avatars. */
  full: 999,
} as const;

export type Radii = typeof radii;

/* ------------------------------------------------------------------ *
 * Shadows — soft, low-opacity, warm. Cross-platform safe.
 * ------------------------------------------------------------------ */

type Shadow = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

const makeShadow = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
): Shadow => ({
  shadowColor: palette.shadow,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: blur,
  ...Platform.select({ android: { elevation }, default: {} }),
});

export const shadows = {
  sm: makeShadow(1, 3, 0.04, 1),
  md: makeShadow(4, 12, 0.06, 4),
  lg: makeShadow(10, 28, 0.08, 10),
} as const;

export type Shadows = typeof shadows;

/* ------------------------------------------------------------------ *
 * Motif — line-ornament styling
 * ------------------------------------------------------------------ */

/**
 * Stroke values for the SVG motif system (thali, lattice, rangoli).
 *
 * All motifs are monochrome line art. These are the only colours they are
 * allowed to use, which is what keeps them reading as engraved detail rather
 * than as clip-art stickers. Nothing here is ever used as a fill for an area.
 */
export const motif = {
  /** Default linework: crimson, quiet enough to sit under content. */
  stroke: 'rgba(161, 43, 63, 0.45)',
  /** For the one mark on a screen that is meant to be looked at. */
  strokeStrong: 'rgba(161, 43, 63, 0.85)',
  /** Opacity for the faintest tier — dividers, watermarks. */
  hairline: 0.28,
  /** Default stroke width, in px. Thin is the whole point. */
  strokeWidth: 1,
} as const;

export type Motif = typeof motif;

/* ------------------------------------------------------------------ *
 * Motion
 * ------------------------------------------------------------------ */

/**
 * One spring, used app-wide. Critically-ish damped: it settles without
 * overshoot, which is what "quiet and expensive" feels like.
 */
export const spring = {
  damping: 22,
  stiffness: 190,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
} as const;

export const motion = {
  durations: {
    fast: 180,
    base: 260,
    slow: 420,
  },
  spring,
} as const;

export type Motion = typeof motion;

/* ------------------------------------------------------------------ *
 * Layout constants that are genuinely design decisions.
 * ------------------------------------------------------------------ */

export const layout = {
  /** Horizontal page gutter (the web app's `px-5`). */
  screenPadding: 20,
  /** Reading column. Every section is centred in this, as on the web app. */
  contentMaxWidth: 700,
  /** Height of the tab bar's content row, above the safe-area inset. */
  tabBarHeight: 58,
  /** Height of the logo/notifications header, below the status bar. */
  headerHeight: 64,
  /** Hairline width — sub-pixel on iOS for a crisp, printed feel. */
  hairline: 1,
} as const;

export type Layout = typeof layout;

/* ------------------------------------------------------------------ *
 * Theme assembly
 * ------------------------------------------------------------------ */

export type Theme = {
  readonly name: 'light' | 'dark';
  readonly colors: Colors;
  readonly typography: Typography;
  readonly spacing: Spacing;
  readonly radii: Radii;
  readonly shadows: Shadows;
  readonly motion: Motion;
  readonly layout: Layout;
  readonly motif: Motif;
  /** False until expo-font resolves; typography falls back to system fonts. */
  readonly fontsLoaded: boolean;
};

/** Strips custom `fontFamily` values so text renders in the system font. */
const withSystemFonts = (scale: Typography): Typography => {
  const entries = Object.entries(scale).map(([key, variant]) => [
    key,
    { ...variant, fontFamily: undefined },
  ]);
  return Object.fromEntries(entries) as Typography;
};

export const createTheme = (fontsLoaded: boolean): Theme => ({
  name: 'light',
  colors: lightColors,
  typography: fontsLoaded ? typography : withSystemFonts(typography),
  spacing,
  radii,
  shadows,
  motion,
  layout,
  motif,
  fontsLoaded,
});

/** Default (fonts-not-yet-loaded) theme — safe for module-scope consumers. */
export const lightTheme = createTheme(false);
