import Feather from '@expo/vector-icons/Feather';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EventHero } from '@/components/events/EventHero';
import { HOME_COPY } from '@/constants/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import type { EventItem } from '@/types';
import { formatEventDayLong } from '@/utils/eventFormat';

const THUMB_SIZE = 68;

type FeaturedStripProps = {
  event: EventItem;
  onPress: (event: EventItem) => void;
};

/**
 * The flagship celebration, as a horizontal strip rather than a second big
 * card.
 *
 * Deliberately smaller than Next Gathering: two full-width cards stacked would
 * compete, and the screen's job is to answer "what's next?" first. The gold
 * hairline and eyebrow give it status without stealing that hierarchy.
 */
export function FeaturedStrip({ event, onPress }: FeaturedStripProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <MotiView
      from={{ opacity: 0, translateY: reduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: reduceMotion ? 0 : theme.motion.durations.slow,
        delay: reduceMotion ? 0 : theme.motion.durations.fast,
      }}
    >
      <Text
        style={[
          theme.typography.overline,
          { color: theme.colors.primary, marginBottom: theme.spacing.md },
        ]}
      >
        {HOME_COPY.featured.eyebrow}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${HOME_COPY.featured.eyebrow}: ${event.title}, ${formatEventDayLong(event.startDate)}`}
        onPress={() => onPress(event)}
        style={({ pressed }) => [
          styles.row,
          {
            padding: theme.spacing.md,
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary,
            borderWidth: 1,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={{ width: THUMB_SIZE }}>
          <EventHero
            event={event}
            height={THUMB_SIZE}
            borderRadius={theme.radii.md}
            variant="thumb"
          />
        </View>

        <View style={[styles.body, { marginLeft: theme.spacing.md }]}>
          <Text
            style={[
              theme.typography.h3,
              { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
            ]}
          >
            {event.title}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
            {formatEventDayLong(event.startDate)}
          </Text>
        </View>

        <Feather name="chevron-right" size={18} color={theme.colors.primary} />
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
});
