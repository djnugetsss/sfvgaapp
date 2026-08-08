import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { StyleSheet, type ViewStyle } from 'react-native';

import { HERO_BLURHASH } from '@/components/events/EventHero';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import { resolveImageSource } from '@/utils/imageSource';

/**
 * A contained photographic band inside a screen's normal column.
 *
 * Distinct from `EventHero`, which belongs to an event and falls back to that
 * event's initials. This one belongs to a *screen*, has no record behind it,
 * and so has nothing to fall back to — an initials tile for "Home" would be
 * inventing content. It therefore renders nothing at all when the key does not
 * resolve, and the caller's own margins go with it: the surrounding layout
 * closes up rather than leaving a gap where a picture used to be.
 *
 * It takes a registry *key*, never a path, so the artwork can move to a
 * Firestore URL in Phase 7 without a component change.
 *
 * `aspectRatio` is fixed by the caller rather than measured from the file, so
 * the band's height is known before the image decodes and the screen does not
 * reflow around it on load.
 */
type BannerImageProps = {
  /** A key into `LOCAL_IMAGES`, or a URL. Unresolvable → nothing rendered. */
  imageKey: string;
  /** Width ÷ height. Defaults to 3:2. */
  aspectRatio?: number;
  accessibilityLabel: string;
  /** Staggers the entrance behind whatever sits above it. */
  delay?: number;
  /** Margins only — the band's own geometry is set here. */
  style?: ViewStyle;
};

export function BannerImage({
  imageKey,
  aspectRatio = 3 / 2,
  accessibilityLabel,
  delay = 0,
  style,
}: BannerImageProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  const source = resolveImageSource(imageKey);

  // Before the MotiView, so an unregistered key costs no wrapper and no
  // margin — never an empty band the reader has to interpret.
  if (source === null) {
    return null;
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: reduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: reduceMotion ? 0 : theme.motion.durations.slow,
        delay: reduceMotion ? 0 : delay,
      }}
      style={style}
    >
      <Image
        source={source}
        placeholder={{ blurhash: HERO_BLURHASH }}
        transition={theme.motion.durations.base}
        contentFit="cover"
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        style={[styles.image, { aspectRatio, borderRadius: theme.radii.lg }]}
      />
    </MotiView>
  );
}

const styles = StyleSheet.create({
  image: {
    // Fills the screen's content column, which already carries the page
    // gutter — contained, deliberately not full-bleed.
    width: '100%',
  },
});
