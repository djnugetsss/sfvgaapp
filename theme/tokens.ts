import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * SFVGA design tokens — the single source of truth for every visual value in
 * the app. No raw hex, font name, spacing number, or duration may appear
 * outside this file.
 *
 * Aesthetic brief: premium editorial. Warm neutrals carry ~90% of every
 * screen; the marigold accent behaves like jewelry — small, deliberate, rare.
 *
 * Structured for a future dark theme: `palette` holds the raw ramps, and each
 * theme (`lightColors`, and later `darkColors`) is a *semantic* mapping onto
 * it. Adding dark mode means adding one object, not refactoring consumers.
 */

/* ------------------------------------------------------------------ *
 * Palette — raw values. Never consumed by components directly.
 * ------------------------------------------------------------------ */

const palette = {
  ivory: '#FAF6EF',
  white: '#FFFFFF',
  ink: '#17130F',
  stone: '#5A5147',
  ash: '#8C8175',
  linen: '#EAE2D6',

  marigold: '#C0912F',
  sienna: '#6E4A34',

  /**
   * Kumkum — the deep festive red of vermilion powder. Chosen at the darker,
   * browner end of the range so it reads as pigment rather than as an alert
   * colour, and so it sits beside the sienna and marigold without clashing.
   */
  kumkum: '#A32C26',

  jade: '#3C7A5A',
  clay: '#B33A2F',

  /** Shadow base — a warm near-black, never pure #000 (which reads cheap). */
  shadow: '#3A2E20',
} as const;

/* ------------------------------------------------------------------ *
 * Colors — semantic layer.
 * ------------------------------------------------------------------ */

export const lightColors = {
  /** Dominant surfaces. */
  background: palette.ivory,
  surface: palette.white,
  surfaceElevated: palette.white,

  /** Text ramp, high → low emphasis. */
  textPrimary: palette.ink,
  textSecondary: palette.stone,
  textMuted: palette.ash,

  /** Hairlines and dividers. */
  border: palette.linen,

  /** Accent — key actions and small details only. */
  primary: palette.marigold,
  primaryContrast: palette.white,
  secondary: palette.sienna,

  /** Semantic feedback. */
  success: palette.jade,
  error: palette.clay,

  /**
   * Kumkum — the rare accent.
   *
   * BUDGET RULE: kumkum may appear **at most once per screen**, and only for
   * the flagship Sanskriti Divas moment or a single genuinely special
   * emphasis. It is never used for body text, never for large fills, and
   * never as a second general-purpose accent alongside gold. If a screen
   * needs two red things, it needs zero.
   */
  kumkum: palette.kumkum,
  /** Kumkum at wash strength, for a glow or a single tinted ring. */
  kumkumMuted: 'rgba(163, 44, 38, 0.12)',

  /** Non-content utility. */
  shadow: palette.shadow,
  /** Tint used behind pressed/active chrome. Accent at low opacity. */
  accentWash: 'rgba(192, 145, 47, 0.10)',
  /** Scrim for the translucent tab bar over content. */
  chrome: 'rgba(250, 246, 239, 0.94)',
} as const;

export type Colors = typeof lightColors;

/* ------------------------------------------------------------------ *
 * Typography
 * ------------------------------------------------------------------ */

/**
 * Font family keys as registered with expo-font. `ThemeProvider` swaps these
 * for `undefined` (→ system font) until the webfonts have loaded, so first
 * paint is never blank text.
 */
export const fontFamilies = {
  serifRegular: 'Fraunces_400Regular',
  serifMedium: 'Fraunces_500Medium',
  serifSemiBold: 'Fraunces_600SemiBold',
  sansRegular: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
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
 * The scale. Serif (Fraunces) for display + headings, sans (Inter) for
 * everything a user actually reads at length.
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
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.8,
    fontWeight: '600',
  },
  h1: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
    fontWeight: '600',
  },
  h2: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
    fontWeight: '500',
  },
  h3: {
    fontFamily: fontFamilies.serifRegular,
    fontSize: 19,
    lineHeight: 26,
    letterSpacing: -0.1,
    fontWeight: '400',
  },
  bodyLg: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 17,
    lineHeight: 27,
    letterSpacing: 0,
    fontWeight: '400',
  },
  body: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0,
    fontWeight: '400',
  },
  caption: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    fontWeight: '400',
  },
  overline: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.6,
    fontWeight: '500',
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
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
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
  /** Default linework: gold, quiet enough to sit under content. */
  stroke: 'rgba(192, 145, 47, 0.45)',
  /** For the one mark on a screen that is meant to be looked at. */
  strokeStrong: 'rgba(192, 145, 47, 0.85)',
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
  /** Horizontal page gutter. Generous — this is what reads as editorial. */
  screenPadding: spacing.lg,
  /** Height of the tab bar's content row, above the safe-area inset. */
  tabBarHeight: 58,
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
