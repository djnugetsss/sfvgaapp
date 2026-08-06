import Feather from '@expo/vector-icons/Feather';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { useTheme } from '@/theme';
import type { Theme } from '@/theme';
import type { EventWithStatus } from '@/utils/eventStatus';
import { formatMonthTitle, toDayKey } from '@/utils/eventFormat';

/**
 * What the calendar needs to know about a single day, collapsed from all the
 * events that fall on it.
 */
type DayMeta = {
  hasEvent: boolean;
  /** True when at least one event that day is still to come (or is today). */
  hasLive: boolean;
  hasFeatured: boolean;
};

type EventCalendarProps = {
  events: readonly EventWithStatus[];
  /** `yyyy-MM-dd`, or null when no single day is selected. */
  selectedDay: string | null;
  /** First day of the visible month. */
  visibleMonth: Date;
  onSelectDay: (day: string) => void;
  onChangeMonth: (month: Date) => void;
};

const DOT_SIZE = 5;
const CELL_SIZE = 38;

/**
 * The month calendar.
 *
 * `react-native-calendars` handles the grid maths and swipe gestures, but none
 * of its visual language survives: `dayComponent` replaces every cell and
 * `renderHeader` / `renderArrow` replace the chrome, so the result reads as
 * ours rather than as the library's default. The built-in marking system is
 * bypassed entirely — it cannot express all four states we need at once
 * (event / past event / featured / selected), and layering them through its
 * theme would have meant fighting it.
 *
 * Marker vocabulary, kept deliberately small:
 * - gold dot — an event still to come, or happening today
 * - muted dot — a completed event, still marked because the day still matters
 * - gold ring around the dot — the featured event
 * - soft gold wash behind the number — the selected day
 * - thin outline — today
 */
export function EventCalendar({
  events,
  selectedDay,
  visibleMonth,
  onSelectDay,
  onChangeMonth,
}: EventCalendarProps) {
  const theme = useTheme();

  // Collapse events down to one entry per day. Several events could share a
  // date, so the flags are OR-ed rather than overwritten.
  const dayMeta = useMemo(() => {
    const map = new Map<string, DayMeta>();

    for (const { event, status } of events) {
      const key = toDayKey(event.startDate);
      const existing = map.get(key);

      map.set(key, {
        hasEvent: true,
        hasLive: (existing?.hasLive ?? false) || status !== 'past',
        hasFeatured: (existing?.hasFeatured ?? false) || event.isFeatured,
      });
    }

    return map;
  }, [events]);

  const dayComponent = useMemo(
    () => makeDayComponent(theme, dayMeta, selectedDay, onSelectDay),
    [theme, dayMeta, selectedDay, onSelectDay],
  );

  return (
    <Calendar
      // `current` seeds the initial month only. Deliberately not keyed on
      // `visibleMonth`: remounting on every swipe would kill the gesture
      // mid-transition.
      current={toDayKey(visibleMonth.toISOString())}
      hideExtraDays
      firstDay={0}
      enableSwipeMonths
      onMonthChange={(month: DateData) => {
        onChangeMonth(new Date(month.year, month.month - 1, 1));
      }}
      dayComponent={dayComponent}
      // The month title comes from our own `visibleMonth`, not from the date
      // the library passes in. With `enableSwipeMonths` the calendar
      // pre-renders adjacent month pages and hands `renderHeader` the *previous*
      // page's date, which rendered "July 2026" above an August grid.
      // `onMonthChange` keeps `visibleMonth` authoritative instead.
      renderHeader={() => (
        <Text
          style={[
            theme.typography.h2,
            { color: theme.colors.textPrimary, paddingVertical: theme.spacing.sm },
          ]}
        >
          {formatMonthTitle(visibleMonth)}
        </Text>
      )}
      renderArrow={(direction) => (
        <Feather
          name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
          size={20}
          color={theme.colors.textSecondary}
        />
      )}
      style={{
        backgroundColor: theme.colors.background,
        paddingBottom: theme.spacing.sm,
      }}
      theme={{
        calendarBackground: theme.colors.background,
        textSectionTitleColor: theme.colors.textMuted,
        monthTextColor: theme.colors.textPrimary,
        arrowColor: theme.colors.textSecondary,
        // Weekday initials pick up the overline treatment.
        textDayHeaderFontSize: theme.typography.overline.fontSize,
        textDayHeaderFontFamily: theme.typography.overline.fontFamily,
      }}
    />
  );
}

type DayComponentProps = {
  date?: DateData;
  state?: string;
};

/**
 * Builds the custom day cell.
 *
 * Returned from a factory so the theme, marker map, and selection are captured
 * in a closure — `react-native-calendars` only passes `date` and `state`
 * through, and routing our data via its `marking` prop would mean casting
 * around its type.
 */
function makeDayComponent(
  theme: Theme,
  dayMeta: Map<string, DayMeta>,
  selectedDay: string | null,
  onSelectDay: (day: string) => void,
) {
  return function DayCell({ date, state }: DayComponentProps) {
    if (date === undefined) {
      return <View style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
    }

    const key = date.dateString;
    const meta = dayMeta.get(key);
    const isSelected = selectedDay === key;
    const isToday = state === 'today';

    const dotColor = meta?.hasLive === true ? theme.colors.primary : theme.colors.textMuted;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${date.day}${meta?.hasEvent === true ? ', has an event' : ''}`}
        onPress={() => onSelectDay(key)}
        style={styles.cell}
        hitSlop={4}
      >
        <View
          style={[
            styles.number,
            {
              // Selected: a soft wash, not a hard fill — the number stays
              // readable in the text colour rather than reversing out.
              backgroundColor: isSelected ? theme.colors.accentWash : 'transparent',
              // Today: a quiet outline that survives alongside the wash.
              borderWidth: isToday ? 1 : 0,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.body,
              {
                color: isSelected || isToday
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
              },
            ]}
          >
            {date.day}
          </Text>
        </View>

        <View style={styles.dotSlot}>
          {meta?.hasEvent === true ? (
            <View
              style={[
                styles.dot,
                // The featured day gets a ring around its dot rather than a
                // second colour, keeping the palette to one accent.
                meta.hasFeatured
                  ? {
                      width: DOT_SIZE + 4,
                      height: DOT_SIZE + 4,
                      backgroundColor: 'transparent',
                      borderWidth: 1.5,
                      borderColor: theme.colors.primary,
                    }
                  : {
                      width: DOT_SIZE,
                      height: DOT_SIZE,
                      backgroundColor: dotColor,
                    },
              ]}
            />
          ) : null}
        </View>
      </Pressable>
    );
  };
}

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    width: CELL_SIZE - 6,
    height: CELL_SIZE - 6,
    borderRadius: (CELL_SIZE - 6) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSlot: {
    height: DOT_SIZE + 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: DOT_SIZE,
  },
});
