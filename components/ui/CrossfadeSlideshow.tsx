import { Image, type ImageSource } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { HERO_BLURHASH as BLURHASH } from '@/components/events/EventHero';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';

/** Default hold before the next frame begins to arrive. */
const DEFAULT_ADVANCE_MS = 3500;
/** Cross-fade duration. Long enough to read as a dissolve, not a cut. */
const FADE_MS = 700;

/** A bundled module (`require`) or a remote `{ uri }`. */
export type SlideSource = number | ImageSource;

type CrossfadeSlideshowProps = {
  /** Ordered frames. Must be non-empty — the caller owns the empty fallback. */
  images: readonly SlideSource[];
  accessibilityLabel: string;
  /** Fixed height, or omit and give `aspectRatio` instead. */
  height?: DimensionValue;
  /** Width ÷ height, used when `height` is not given. */
  aspectRatio?: number;
  borderRadius?: number;
  advanceMs?: number;
};

/**
 * A slow cross-fade through stacked photographs. Extracted from the Sanskriti
 * Divas detail hero so Home's Community Moments band could share it.
 *
 * **Layering.** All frames are stacked and only the incoming one animates: it
 * fades 0 → 1 *on top of* the outgoing frame, which is held fully opaque
 * underneath until the fade completes. Cross-fading both at once would leave
 * the pair momentarily semi-transparent and let the ivory page colour wash
 * through the middle of every transition. `zIndex` comes from the current and
 * previous indices rather than array order, so the incoming frame is on top
 * even when the rotation wraps from the last frame back to the first.
 *
 * **Degradations:** one frame, or reduce-motion → the first frame, held, with
 * no timer armed and no fade.
 */
export function CrossfadeSlideshow({
  images,
  accessibilityLabel,
  height,
  aspectRatio,
  borderRadius,
  advanceMs = DEFAULT_ADVANCE_MS,
}: CrossfadeSlideshowProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  // `prev` rides along in the same state object so the pair always updates
  // atomically — a ref updated in an effect would be a frame stale on the
  // render that actually needs it.
  const [slide, setSlide] = useState({ index: 0, prev: 0 });

  const count = images.length;
  const animating = !reduceMotion && count > 1;

  useEffect(() => {
    if (!animating) {
      return;
    }

    const timer = setInterval(() => {
      setSlide((current) => ({
        index: (current.index + 1) % count,
        prev: current.index,
      }));
    }, advanceMs);

    return () => clearInterval(timer);
    // Re-armed if the frame count changes — appending a photo must not leave
    // the old interval running against a stale modulus.
  }, [animating, count, advanceMs]);

  // Appending or removing frames must never leave the index out of range.
  useEffect(() => {
    if (count > 0 && slide.index >= count) {
      setSlide({ index: 0, prev: 0 });
    }
  }, [count, slide.index]);

  const radius = borderRadius ?? theme.radii.md;
  const geometry = height !== undefined ? { height } : { aspectRatio };

  if (count === 0) {
    return null;
  }

  if (!animating) {
    return (
      <Image
        source={images[0]}
        placeholder={{ blurhash: BLURHASH }}
        transition={reduceMotion ? 0 : theme.motion.durations.base}
        contentFit="cover"
        accessibilityLabel={accessibilityLabel}
        style={[styles.fill, geometry, { borderRadius: radius }]}
      />
    );
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.fill,
        geometry,
        { borderRadius: radius, overflow: 'hidden', backgroundColor: theme.colors.border },
      ]}
    >
      {images.map((source, i) => (
        <Frame
          // Frames are a fixed, ordered list; the position is the identity.
          key={i}
          source={source}
          active={i === slide.index}
          // Held opaque beneath the incoming frame for the length of the fade.
          underneath={i === slide.prev}
          radius={radius}
        />
      ))}
    </View>
  );
}

type FrameProps = {
  source: SlideSource;
  active: boolean;
  underneath: boolean;
  radius: number;
};

/**
 * One stacked frame, owning its own opacity. A component per frame rather than
 * an array of shared values: hooks cannot be called in a loop over changing
 * data, and this keeps each frame's animation local.
 */
function Frame({ source, active, underneath, radius }: FrameProps) {
  const opacity = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    if (active) {
      opacity.value = withTiming(1, { duration: FADE_MS });
    } else if (underneath) {
      // Hold fully lit for the length of the fade, then drop out. By the time
      // this fires the incoming frame is opaque and covering it, so the switch
      // is invisible.
      opacity.value = withDelay(FADE_MS, withTiming(0, { duration: 0 }));
    } else {
      opacity.value = 0;
    }
  }, [active, underneath, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { zIndex: active ? 2 : underneath ? 1 : 0 },
        animatedStyle,
      ]}
    >
      <Image
        source={source}
        placeholder={{ blurhash: BLURHASH }}
        contentFit="cover"
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
  },
});
