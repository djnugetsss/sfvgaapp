import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { buildThali } from '@/components/motif/geometry';
import { ThaliMark } from '@/components/motif/ThaliMark';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Milliseconds each petal takes to light and hand over to the next. */
const STEP_MS = 190;
/** Opacity a petal rests at when it is not the one currently lighting. */
const REST_OPACITY = 0.2;

type ThaliSpinnerProps = {
  size?: number;
  segments?: number;
  strokeColor?: string;
};

/**
 * The app's loading indicator: the thali's petals brighten one after another,
 * the way a rangoli is laid outward from its centre.
 *
 * It is the same mark as `ThaliMark` — same geometry module — so loading does
 * not introduce a second visual idea. A travelling highlight was chosen over a
 * rotating arc because rotation reads as a generic spinner from any icon set,
 * while a sequence of petals filling reads as something being *made*.
 *
 * Under reduce-motion this renders the static mark. A loading state that
 * cannot animate is still perfectly legible — the surrounding copy says
 * "Loading…" — so there is no need for a degraded animation.
 */
export function ThaliSpinner({
  size = 44,
  segments = 8,
  strokeColor,
}: ThaliSpinnerProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  const stroke = strokeColor ?? theme.motif.strokeStrong;
  const geometry = buildThali(size, segments);

  // Sweeps 0 → segments and wraps, so petal `i` peaks as it passes `i`.
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    progress.value = 0;
    progress.value = withRepeat(
      withTiming(segments, {
        duration: segments * STEP_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [progress, reduceMotion, segments]);

  if (reduceMotion) {
    return <ThaliMark size={size} segments={segments} strokeColor={stroke} />;
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G
        fill="none"
        stroke={stroke}
        strokeWidth={theme.motif.strokeWidth}
        strokeLinecap="round"
      >
        {/* The vessel stays constant; only the petals animate. */}
        {geometry.rings.map((ring) => (
          <Circle
            key={ring.key}
            cx={geometry.center}
            cy={geometry.center}
            r={ring.r}
            opacity={REST_OPACITY + 0.15}
          />
        ))}

        {geometry.petals.map((d, index) => (
          <SpinnerPetal
            key={`petal-${index}`}
            d={d}
            index={index}
            count={segments}
            progress={progress}
          />
        ))}
      </G>

      <Circle
        cx={geometry.center}
        cy={geometry.center}
        r={geometry.binduR}
        fill={stroke}
      />
    </Svg>
  );
}

type SpinnerPetalProps = {
  d: string;
  index: number;
  count: number;
  progress: SharedValue<number>;
};

/**
 * One petal. Split into its own component because each needs its own
 * `useAnimatedProps` hook, and hooks cannot be called in a loop.
 */
function SpinnerPetal({ d, index, count, progress }: SpinnerPetalProps) {
  const animatedProps = useAnimatedProps(() => {
    // Distance, in petals, since the highlight passed this one. Wrapping keeps
    // the sequence continuous across the loop boundary.
    const phase = (progress.value - index + count) % count;
    const lit = phase < 1 ? 1 - phase : 0;

    return { opacity: REST_OPACITY + (1 - REST_OPACITY) * lit };
  });

  return <AnimatedPath d={d} strokeLinejoin="round" animatedProps={animatedProps} />;
}
