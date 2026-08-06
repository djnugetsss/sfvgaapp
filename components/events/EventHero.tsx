import { Image } from 'expo-image';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { CATEGORY_LABELS } from '@/constants/content';
import { useTheme } from '@/theme';
import type { EventItem } from '@/types';
import { resolveContent } from '@/utils/content';
import { eventInitials } from '@/utils/eventFormat';

/**
 * Neutral warm blur placeholder shown while a real image decodes. Not a grey
 * box — it shares the ivory/linen cast of the rest of the app, so the load-in
 * reads as the image resolving rather than as a hole in the layout.
 */
const BLURHASH = 'L6PZ%*00-;WB~qofofof00%MofRj';

type EventHeroProps = {
  event: EventItem;
  height: DimensionValue;
  borderRadius?: number;
  /**
   * `thumb` is the small square used in narrow slots; `detail` is the
   * full-bleed hero. See the note on the category label below.
   */
  variant?: 'thumb' | 'card' | 'detail';
  /** Dims the whole tile for past events. */
  dimmed?: boolean;
};

/**
 * An event's hero image, with a typographic fallback.
 *
 * Every `heroImage` in the seed is still a "TODO:" marker, so in practice the
 * fallback is what ships today — which is exactly why it is designed rather
 * than left as an empty grey rectangle. It renders the event's initials in the
 * serif face over a warm tint, so a card with no artwork still looks
 * deliberate.
 *
 * The category label sits under the initials on wide tiles only. In the
 * `thumb` variant the tile is barely wider than the word itself — "CULTURAL"
 * at overline tracking measures ~80pt against a 68pt square — so it wrapped
 * and clipped to "CULTURA / L". The initials carry the tile on their own
 * there. The category is not lost to assistive tech either: it stays in this
 * view's `accessibilityLabel` in every variant.
 *
 * When real artwork lands, `resolveContent` starts returning a URL and the
 * image path takes over with no other change.
 */
export function EventHero({
  event,
  height,
  borderRadius,
  variant = 'card',
  dimmed = false,
}: EventHeroProps) {
  const theme = useTheme();
  const source = resolveContent(event.heroImage);
  const radius = borderRadius ?? theme.radii.md;

  if (source !== null) {
    return (
      <Image
        source={{ uri: source }}
        placeholder={{ blurhash: BLURHASH }}
        transition={theme.motion.durations.base}
        contentFit="cover"
        accessibilityLabel={event.title}
        style={[
          { height, borderRadius, opacity: dimmed ? 0.6 : 1 },
          styles.fill,
          { borderRadius: radius },
        ]}
      />
    );
  }

  const isDetail = variant === 'detail';
  const isThumb = variant === 'thumb';

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${event.title} — ${CATEGORY_LABELS[event.category]}`}
      style={[
        styles.fallback,
        {
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.accentWash,
          borderColor: theme.colors.border,
          opacity: dimmed ? 0.6 : 1,
        },
      ]}
    >
      <Text
        style={[
          isDetail ? theme.typography.display : theme.typography.h1,
          { color: theme.colors.secondary },
        ]}
      >
        {eventInitials(event.title)}
      </Text>

      {isThumb ? null : (
        <Text
          // Belt and braces: even on wide tiles the label is held to one line
          // and truncated rather than allowed to wrap, so a longer category
          // added later cannot reintroduce the clipping.
          numberOfLines={1}
          ellipsizeMode="clip"
          style={[
            theme.typography.overline,
            styles.category,
            { color: theme.colors.textMuted, marginTop: theme.spacing.xs },
          ]}
        >
          {CATEGORY_LABELS[event.category]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
  },
  fallback: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    // Keeps the contents from bleeding past the rounded corners on any tile.
    overflow: 'hidden',
  },
  category: {
    // Inset from the tile edges so the label has room before truncating.
    paddingHorizontal: 2,
  },
});
