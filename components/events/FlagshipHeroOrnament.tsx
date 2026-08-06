import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { ThaliMark } from '@/components/motif/ThaliMark';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';

/** Full cycle of the diya flicker. Slow on purpose — this is a lamp, not a strobe. */
const FLICKER_MS = 2600;
/** Resting luminance, and how far it drifts. Low amplitude is the whole point. */
const GLOW_BASE = 0.62;
const GLOW_SWING = 0.22;

const BLOOM_MS = 900;

type FlagshipHeroOrnamentProps = {
  /** Matches the hero height so the ornament sits exactly over it. */
  height: number;
};

/**
 * The signature moment, reserved for Sanskriti Divas alone.
 *
 * Two layers, both centred on the hero:
 *
 * 1. **Diya glow** — a radial gradient in kumkum whose opacity drifts slowly,
 *    the way an oil lamp breathes. Amplitude is deliberately small (0.62 ±
 *    0.22) and the cycle long, so it registers as warmth rather than as
 *    blinking. This is the one place kumkum appears prominently, and it is the
 *    only kumkum on the screen.
 * 2. **Rangoli bloom** — the thali mark settling into place on mount: scaling
 *    up from just under full size while rotating a few degrees into radial
 *    alignment, then stopping. It draws itself once and never loops; a
 *    permanently animating hero would be exhausting.
 *
 * Under reduce-motion the glow is held at its resting value and the mark is
 * simply present at its final transform — a clean, static, still-beautiful
 * hero with no bloom and no flicker.
 */
export function FlagshipHeroOrnament({ height }: FlagshipHeroOrnamentProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  const glow = useSharedValue(GLOW_BASE);
  const bloom = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      glow.value = GLOW_BASE;
      bloom.value = 1;
      return;
    }

    glow.value = withRepeat(
      withTiming(GLOW_BASE + GLOW_SWING, {
        duration: FLICKER_MS,
        // Sinusoidal in and out: no hard turn at the extremes, which is what
        // would read as a flash.
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    bloom.value = withDelay(
      120,
      withTiming(1, { duration: BLOOM_MS, easing: Easing.out(Easing.cubic) }),
    );
  }, [bloom, glow, reduceMotion]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: bloom.value,
    transform: [
      { scale: 0.82 + 0.18 * bloom.value },
      { rotate: `${(1 - bloom.value) * -14}deg` },
    ],
  }));

  // Large enough that the petal ring clears the hero's initials; the centre
  // is omitted so nothing is drawn on top of the type.
  const markSize = Math.min(height * 0.92, 300);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.root]}>
      <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="diya" cx="50%" cy="50%" r="62%">
              <Stop offset="0%" stopColor={theme.colors.kumkum} stopOpacity={0.3} />
              <Stop offset="55%" stopColor={theme.colors.primary} stopOpacity={0.12} />
              <Stop offset="100%" stopColor={theme.colors.kumkum} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#diya)" />
        </Svg>
      </Animated.View>

      <Animated.View style={bloomStyle}>
        <ThaliMark
          size={markSize}
          segments={10}
          strokeColor={theme.motif.strokeStrong}
          opacity={0.5}
          showCenter={false}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
