import Feather from '@expo/vector-icons/Feather';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EventHero } from '@/components/events/EventHero';
import { Tag } from '@/components/events/Tag';
import { CATEGORY_LABELS, HOME_COPY } from '@/constants/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import type { EventItem } from '@/types';
import { resolveContent } from '@/utils/content';
import {
  formatCountdown,
  formatEventDayLong,
  formatTimeRange,
} from '@/utils/eventFormat';

const HERO_HEIGHT = 190;

type NextGatheringCardProps = {
  event: EventItem;
  onPress: (event: EventItem) => void;
};

/**
 * Home's centrepiece: the one thing a member most likely opened the app to
 * check.
 *
 * It is the largest, warmest object on the screen and carries the only
 * countdown in the app — "in 18 days" is the line that makes the card feel
 * alive rather than informational. Location and time drop out silently when
 * still unfilled.
 */
export function NextGatheringCard({ event, onPress }: NextGatheringCardProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  const location = resolveContent(event.location);
  const time = formatTimeRange(
    resolveContent(event.startTime),
    resolveContent(event.endTime),
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: reduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: reduceMotion ? 0 : theme.motion.durations.slow,
      }}
    >
      <Text
        style={[
          theme.typography.overline,
          { color: theme.colors.textMuted, marginBottom: theme.spacing.md },
        ]}
      >
        {HOME_COPY.nextGathering.eyebrow}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${HOME_COPY.nextGathering.eyebrow}: ${event.title}, ${formatEventDayLong(event.startDate)}`}
        onPress={() => onPress(event)}
        style={({ pressed }) => [
          styles.card,
          theme.shadows.md,
          {
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: theme.layout.hairline,
            transform: [{ scale: pressed && !reduceMotion ? 0.99 : 1 }],
          },
        ]}
      >
        <EventHero event={event} height={HERO_HEIGHT} borderRadius={0} />

        <View style={{ padding: theme.spacing.lg }}>
          <View style={[styles.dateRow, { marginBottom: theme.spacing.sm }]}>
            <Text
              style={[theme.typography.overline, { color: theme.colors.textMuted }]}
            >
              {formatEventDayLong(event.startDate)}
              {time !== null ? ` · ${time}` : ''}
            </Text>
          </View>

          <Text
            style={[
              theme.typography.h1,
              { color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
            ]}
          >
            {event.title}
          </Text>

          <View style={styles.metaRow}>
            <Tag label={formatCountdown(event.startDate)} variant="accent" />
            <View style={{ marginLeft: theme.spacing.sm }}>
              <Tag label={CATEGORY_LABELS[event.category]} variant="quiet" />
            </View>
          </View>

          {location !== null ? (
            <View style={[styles.metaRow, { marginTop: theme.spacing.md }]}>
              <Feather name="map-pin" size={14} color={theme.colors.textMuted} />
              <Text
                numberOfLines={1}
                style={[
                  theme.typography.body,
                  { color: theme.colors.textSecondary, marginLeft: theme.spacing.xs },
                ]}
              >
                {location}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
