import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { EventCalendar } from '@/components/events/EventCalendar';
import { EventCard } from '@/components/events/EventCard';
import { LatticeRule } from '@/components/motif/LatticeRule';
import { ScopeToggle, type AgendaScope } from '@/components/events/ScopeToggle';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { EVENTS_COPY, SCREEN_COPY, STATUS_COPY } from '@/constants/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useEventsWithStatus } from '@/services';
import { useTheme } from '@/theme';
import type { EventItem } from '@/types';
import { formatMonthTitle, isInMonth, toDayKey } from '@/utils/eventFormat';

const copy = SCREEN_COPY.events;

/** The seed calendar is a 2026 season; the year view is scoped to it. */
const SEASON_START = new Date(2026, 7, 1); // August 2026 — between past and upcoming.

/**
 * Events — the app's signature screen: a themed month calendar above a
 * scrollable agenda, both bound to the same real data.
 *
 * Two rules shape the behaviour:
 * - **Nothing is ever filtered out by date.** `useEventsWithStatus()` returns
 *   the whole year; past events are muted, never removed, and stay tappable.
 * - **The default view is never empty.** The calendar opens on August 2026,
 *   which sits between the completed half of the year and the upcoming half,
 *   and the month scope has content there. Selecting an empty day offers a way
 *   back rather than dead-ending.
 */
export default function EventsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const { data: events, isPending, isError } = useEventsWithStatus();

  const [visibleMonth, setVisibleMonth] = useState<Date>(SEASON_START);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [scope, setScope] = useState<AgendaScope>('month');

  const handleOpenEvent = useCallback(
    (event: EventItem) => {
      router.push(`/events/${event.id}`);
    },
    [router],
  );

  const handleSelectDay = useCallback((day: string) => {
    // Tapping the selected day again clears the filter — a second tap
    // shouldn't trap the user on one date.
    setSelectedDay((current) => (current === day ? null : day));
    setScope('month');
  }, []);

  const handleChangeMonth = useCallback((month: Date) => {
    setVisibleMonth(month);
    setSelectedDay(null);
  }, []);

  /** The agenda's contents, following scope and day selection. */
  const visibleEvents = useMemo(() => {
    if (events === undefined) {
      return [];
    }

    if (scope === 'year') {
      return events;
    }

    const inMonth = events.filter(({ event }) => isInMonth(event, visibleMonth));

    if (selectedDay === null) {
      return inMonth;
    }

    return inMonth.filter(({ event }) => toDayKey(event.startDate) === selectedDay);
  }, [events, scope, visibleMonth, selectedDay]);

  const monthLabel = formatMonthTitle(visibleMonth);

  const renderAgenda = () => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <Text style={[theme.typography.body, { color: theme.colors.error }]}>
          {STATUS_COPY.error}
        </Text>
      );
    }

    if (visibleEvents.length === 0) {
      const empty = selectedDay !== null ? EVENTS_COPY.emptyDay : EVENTS_COPY.emptyMonth;
      return (
        <EmptyState headline={empty.headline} body={empty.body} />
      );
    }

    return (
      <MotiView
        // Re-keying on the active slice gives one clean cross-fade when the
        // month, day, or scope changes — instead of every card re-animating
        // independently on each state change.
        key={`${scope}-${monthLabel}-${selectedDay ?? 'all'}`}
        from={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: reduceMotion ? 0 : theme.motion.durations.fast,
        }}
      >
        {visibleEvents.map(({ event, status }, index) => (
          <EventCard
            key={event.id}
            event={event}
            status={status}
            index={index}
            onPress={handleOpenEvent}
          />
        ))}
      </MotiView>
    );
  };

  return (
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <EventCalendar
        events={events ?? []}
        selectedDay={selectedDay}
        visibleMonth={visibleMonth}
        onSelectDay={handleSelectDay}
        onChangeMonth={handleChangeMonth}
      />

      {/* The one motif on this screen. The calendar grid itself stays plain —
          legibility of dates beats decoration. */}
      <LatticeRule
        style={{
          marginTop: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        }}
      />

      <View style={{ marginBottom: theme.spacing.lg }}>
        <ScopeToggle
          value={scope}
          onChange={(next) => {
            setScope(next);
            setSelectedDay(null);
          }}
          monthLabel={EVENTS_COPY.scopeThisMonth}
          yearLabel={EVENTS_COPY.scopeAllYear}
        />
      </View>

      {selectedDay !== null ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted, marginBottom: theme.spacing.md },
          ]}
          onPress={() => setSelectedDay(null)}
        >
          {EVENTS_COPY.clearDayFilter}
        </Text>
      ) : null}

      {renderAgenda()}
    </ScreenScaffold>
  );
}
