import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { EventHero, HERO_BLURHASH } from '@/components/events/EventHero';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import type { EventItem } from '@/types';

/** How long each frame holds before the next begins to arrive. */
const ADVANCE_MS = 3500;
/** Cross-fade duration. Long enough to read as a dissolve, not a cut. */
const FADE_MS = 700;

type HeroSlideshowProps = {
  event: EventItem;
  /** Ordered frames. Bundled modules from the registry. */
  images: readonly number[];
  height: DimensionValue;
  borderRadius?: number;
};

/**
 * The flagship hero as a slow cross-fade through several photographs.
 *
 * Reserved for Sanskriti Divas: it is the one event with a body of artwork
 * worth showing more than one frame of, and the detail hero is the one place
 * with the size to do it justice. Everything else — including this event's own
 * Home thumbnail and list card — stays a single still image.
 *
 * **Layering.** All frames are stacked and only the incoming one animates: it
 * fades 0 → 1 *on top of* the outgoing frame, which is held fully opaque
 * underneath until the fade completes. Cross-fading both at once would leave
 * the pair momentarily semi-transparent and let the ivory page colour wash
 * through the middle of every transition. `zIndex` is assigned from the
 * current and previous indices rather than from array order, so the incoming
 * frame is on top even when the rotation wraps from the last frame back to the
 * first.
 *
 * **Degradations**, in the order they are checked:
 * - no frames → the existing `EventHero`, which draws the typographic tile
 * - one frame → that frame, rendered statically; no timer, no animation
 * - reduce-motion → the first frame, held; no auto-advance and no fade
 */
export function HeroSlideshow({
  event,
  images,
  height,
  borderRadius,
}: HeroSlideshowProps) {
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
    }, ADVANCE_MS);

    return () => clearInterval(timer);
    // Re-armed if the frame count changes — appending a photo must not leave
    // the old interval running against a stale modulus.
  }, [animating, count]);

  // Appending or removing frames must never leave the index out of range.
  useEffect(() => {
    if (count > 0 && slide.index >= count) {
      setSlide({ index: 0, prev: 0 });
    }
  }, [count, slide.index]);

  const radius = borderRadius ?? theme.radii.md;

  // No artwork at all: hand back to the component that owns the fallback tile,
  // rather than reimplementing it here.
  if (count === 0) {
    return (
      <EventHero
        event={event}
        height={height}
        borderRadius={borderRadius}
        variant="detail"
      />
    );
  }

  // One frame, or reduce-motion: a plain still. No timer is armed above in
  // either case, so there is nothing to leak.
  if (count === 1 || reduceMotion) {
    return (
      <Image
        source={images[0]}
        placeholder={{ blurhash: HERO_BLURHASH }}
        transition={reduceMotion ? 0 : theme.motion.durations.base}
        contentFit="cover"
        accessibilityLabel={event.title}
        style={[styles.fill, { height, borderRadius: radius }]}
      />
    );
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={event.title}
      style={[styles.fill, { height, borderRadius: radius, overflow: 'hidden' }]}
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
  source: number;
  active: boolean;
  underneath: boolean;
  radius: number;
};

/**
 * One stacked frame, owning its own opacity.
 *
 * A component per frame rather than an array of shared values: hooks cannot be
 * called in a loop over changing data, and this keeps each frame's animation
 * entirely local.
 */
function Frame({ source, active, underneath, radius }: FrameProps) {
  const opacity = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    if (active) {
      opacity.value = withTiming(1, { duration: FADE_MS });
    } else if (underneath) {
      // Hold fully lit for the length of the fade, then drop out. By the time
      // this fires the incoming frame is opaque and covering it, so the switch
      // is invisible — and the page background never shows through mid-fade.
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
        // Incoming on top, outgoing directly beneath it, everything else below
        // both — independent of array order, so wrapping around still layers
        // correctly.
        { zIndex: active ? 2 : underneath ? 1 : 0 },
        animatedStyle,
      ]}
    >
      <Image
        source={source}
        placeholder={{ blurhash: HERO_BLURHASH }}
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
