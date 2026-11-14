import Feather from '@expo/vector-icons/Feather';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  COUNTDOWN_BADGE_SIZE,
  CountdownBadge,
} from '@/components/events/CountdownBadge';
import { EventHero } from '@/components/events/EventHero';
import { Tag } from '@/components/events/Tag';
import { CATEGORY_LABELS, EVENTS_COPY, STATUS_LABELS } from '@/constants/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import type { EventItem } from '@/types';
import { resolveContent } from '@/utils/content';
import { formatEventDayLong, formatTimeRange } from '@/utils/eventFormat';
import type { EventStatus } from '@/utils/eventStatus';

/** Opacity applied to a completed event. Muted, never hidden. */
const PAST_OPACITY = 0.6;

const HERO_HEIGHT = 132;
const FEATURED_HERO_HEIGHT = 176;

type EventCardProps = {
  event: EventItem;
  status: EventStatus;
  onPress: (event: EventItem) => void;
  /** Position in the list, for the staggered entrance. */
  index: number;
  /**
   * Marks the card as the Events screen's current highlight — happening today,
   * or the next event up — by giving it a countdown seal. The value is whole
   * calendar days to go (`0` = today). `null`, the default, is an ordinary card.
   */
  countdownDays?: number | null;
};

/**
 * One event in the agenda.
 *
 * Three presentation states, all driven by the derived `status` — never
 * recomputed here:
 * - `past` — 60% opacity and a "Completed" tag, but fully tappable. Muting is
 *   a visual cue, not a soft delete.
 * - `today` — accent border and a gold "Today" tag.
 * - `upcoming` — full strength, quiet.
 *
 * A featured event is elevated on top of whichever state it is in: taller
 * hero, accent hairline, and a "Featured" eyebrow. Sanskriti Divas therefore
 * headlines the list while still reading as upcoming.
 *
 * A **highlighted** card — the event happening now, or the next one up — gets
 * a firmer gold border, a lifted shadow, and a `CountdownBadge` seal laid over
 * the corner of its photograph. The seal carries the whole message; there is
 * no extra caption line. The taller featured hero still applies.
 *
 * Every optional field passes through `resolveContent`, so a row simply
 * disappears when its value is still a TODO marker rather than rendering the
 * placeholder or leaving an empty line.
 */
export function EventCard({
  event,
  status,
  onPress,
  index,
  countdownDays = null,
}: EventCardProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  const isPast = status === 'past';
  const isToday = status === 'today';
  const isFeatured = event.isFeatured;

  const location = resolveContent(event.location);
  const time = formatTimeRange(
    resolveContent(event.startTime),
    resolveContent(event.endTime),
  );
  const statusLabel = STATUS_LABELS[status];

  const isHighlighted = countdownDays !== null;

  // Accent budget: the border goes gold for a highlight, today, or featured,
  // and stays a plain hairline otherwise.
  const borderColor =
    isHighlighted || isToday || isFeatured ? theme.colors.primary : theme.colors.border;
  const borderWidth = isHighlighted
    ? 1.5
    : isToday || isFeatured
      ? 1
      : theme.layout.hairline;

  return (
    <MotiView
      from={{ opacity: 0, translateY: reduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: theme.motion.durations.base,
        // One tasteful entrance: a short stagger that settles quickly, capped
        // so a long list never leaves the last card visibly waiting.
        delay: reduceMotion ? 0 : Math.min(index, 6) * 60,
      }}
      style={{ marginBottom: theme.spacing.md }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${event.title}, ${formatEventDayLong(event.startDate)}${
          statusLabel !== null ? `, ${statusLabel}` : ''
        }`}
        onPress={() => onPress(event)}
        style={({ pressed }) => [
          styles.card,
          isHighlighted ? theme.shadows.md : theme.shadows.sm,
          {
            padding: theme.spacing.md,
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.surface,
            borderColor,
            borderWidth,
            opacity: isPast ? PAST_OPACITY : 1,
            transform: [{ scale: pressed && !reduceMotion ? 0.985 : 1 }],
          },
        ]}
      >
        {isFeatured ? (
          <Text
            style={[
              theme.typography.overline,
              { color: theme.colors.primary, marginBottom: theme.spacing.sm },
            ]}
          >
            {EVENTS_COPY.featuredEyebrow}
          </Text>
        ) : null}

        <View>
          <EventHero
            event={event}
            height={isFeatured ? FEATURED_HERO_HEIGHT : HERO_HEIGHT}
            borderRadius={theme.radii.md}
          />
          {isHighlighted ? (
            // Half on the photograph, half below it, so it reads as laid on
            // the card rather than printed into the image.
            <View
              style={[
                styles.badge,
                { right: theme.spacing.md, bottom: -COUNTDOWN_BADGE_SIZE / 2 },
              ]}
            >
              <CountdownBadge days={countdownDays} />
            </View>
          ) : null}
        </View>

        <View
          style={{
            marginTop: theme.spacing.md,
            // Keeps the date and title clear of the seal's lower half.
            paddingRight: isHighlighted ? COUNTDOWN_BADGE_SIZE + theme.spacing.sm : 0,
          }}
        >
          <Text
            style={[
              theme.typography.overline,
              { color: theme.colors.textMuted, marginBottom: theme.spacing.xs },
            ]}
          >
            {formatEventDayLong(event.startDate)}
            {time !== null ? ` · ${time}` : ''}
          </Text>

          <Text
            style={[
              isFeatured ? theme.typography.h2 : theme.typography.h3,
              { color: theme.colors.textPrimary },
            ]}
          >
            {event.title}
          </Text>

          {location !== null ? (
            <View style={[styles.metaRow, { marginTop: theme.spacing.sm }]}>
              <Feather name="map-pin" size={13} color={theme.colors.textMuted} />
              <Text
                numberOfLines={1}
                style={[
                  theme.typography.caption,
                  { color: theme.colors.textSecondary, marginLeft: theme.spacing.xs },
                ]}
              >
                {location}
              </Text>
            </View>
          ) : null}

          <View style={[styles.tagRow, { marginTop: theme.spacing.md }]}>
            <Tag label={CATEGORY_LABELS[event.category]} variant="quiet" />
            {statusLabel !== null ? (
              <View style={{ marginLeft: theme.spacing.sm }}>
                <Tag
                  label={statusLabel}
                  variant={isToday ? 'accent' : 'quiet'}
                />
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    position: 'absolute',
    zIndex: 1,
  },
});
