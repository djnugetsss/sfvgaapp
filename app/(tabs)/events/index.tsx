import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { EventCard } from '@/components/events/EventCard';
import { LatticeRule } from '@/components/motif/LatticeRule';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { OverlineTabs, type OverlineTab } from '@/components/ui/OverlineTabs';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EVENTS_COPY, SCREEN_COPY, STATUS_COPY } from '@/constants/content';
import { useEventsWithStatus } from '@/services';
import { useTheme } from '@/theme';
import type { EventItem } from '@/types';
import { daysUntil, formatMonthTitle, monthKey } from '@/utils/eventFormat';
import type { EventWithStatus } from '@/utils/eventStatus';

const copy = SCREEN_COPY.events;
const sections = EVENTS_COPY.sections;

type EventsView = 'current' | 'past';

const VIEWS: readonly OverlineTab<EventsView>[] = [
  { key: 'current', label: EVENTS_COPY.tabs.current.label },
  { key: 'past', label: EVENTS_COPY.tabs.past.label },
];

type MonthGroup = {
  key: string;
  title: string;
  events: EventWithStatus[];
};

/** Groups events under month headings, preserving the order they arrive in. */
function groupByMonth(events: readonly EventWithStatus[]): MonthGroup[] {
  const byMonth = new Map<string, MonthGroup>();

  for (const item of events) {
    const key = monthKey(item.event.startDate);
    let group = byMonth.get(key);
    if (group === undefined) {
      group = {
        key,
        title: formatMonthTitle(new Date(`${key}-01T00:00:00`)),
        events: [],
      };
      byMonth.set(key, group);
    }
    group.events.push(item);
  }

  return [...byMonth.values()];
}

/**
 * Events — what's on now and what's coming, with the past one tab over.
 *
 * Two views, switched from the screen's own eyebrow ("Gatherings   Past
 * events") rather than from a control stacked under the header. Everything is
 * derived from each event's live status, which re-derives at midnight, so an
 * event moves from one view to the other on its own while the app stays open.
 *
 * **Gatherings:**
 *
 * 1. **The highlight.** Every event happening today, each wearing a "Today"
 *    seal; on an ordinary day with nothing on, the single next event instead,
 *    with a seal counting the days. It is the first thing on the screen
 *    because it is what people open this tab to find.
 * 2. **Coming up** — the remaining future events, by month, soonest first.
 *
 * **Past events:** everything already finished, by month, most recent first,
 * so last month's gathering sits at the top rather than the bottom. Still
 * muted, still tappable: past events move, they are never removed.
 *
 * Nothing is filtered at the source. `useEventsWithStatus()` returns the whole
 * year; this screen only decides which section each event sits in.
 */
export default function EventsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { data: events, isPending, isError } = useEventsWithStatus();
  // `/events?view=past` opens straight onto the archive — for a link from an
  // announcement, and for testing. Anything else opens on Gatherings.
  const params = useLocalSearchParams<{ view?: string }>();
  const [view, setView] = useState<EventsView>(
    params.view === 'past' ? 'past' : 'current',
  );

  // The screen stays mounted inside the tab, so a link arriving while it is
  // already open changes the param without remounting — follow it.
  useEffect(() => {
    if (params.view === 'past' || params.view === 'current') {
      setView(params.view);
    }
  }, [params.view]);

  const handleOpenEvent = useCallback(
    (event: EventItem) => {
      router.push(`/events/${event.id}`);
    },
    [router],
  );

  const { highlighted, upcoming, past } = useMemo(() => {
    const all = events ?? [];
    const today = all.filter(({ status }) => status === 'today');
    const future = all.filter(({ status }) => status === 'upcoming');
    const finished = all.filter(({ status }) => status === 'past');

    // Today's events win the highlight; otherwise the next one up takes it.
    // Either way, a highlighted event is not repeated in the list below.
    const isToday = today.length > 0;
    const lead = isToday ? today : future.slice(0, 1);

    return {
      highlighted: lead,
      upcoming: groupByMonth(isToday ? future : future.slice(1)),
      // Events arrive ascending; reversed, both the months and the events
      // inside each month run newest first.
      past: groupByMonth([...finished].reverse()),
    };
  }, [events]);

  const renderGroups = (groups: MonthGroup[], startIndex: number) => {
    // `index` runs across the section, not per month, so the cards' staggered
    // entrance reads as one cascade down the page.
    let index = startIndex;

    return groups.map((group, groupIndex) => (
      <View key={group.key} style={{ marginTop: groupIndex === 0 ? 0 : theme.spacing.lg }}>
        <Text
          accessibilityRole="header"
          style={[
            theme.typography.overline,
            { color: theme.colors.textMuted, marginBottom: theme.spacing.md },
          ]}
        >
          {group.title}
        </Text>
        {group.events.map(({ event, status }) => (
          <EventCard
            key={event.id}
            event={event}
            status={status}
            index={index++}
            onPress={handleOpenEvent}
          />
        ))}
      </View>
    ));
  };

  const renderBody = () => {
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

    if ((events ?? []).length === 0) {
      return <EmptyState headline={copy.empty.headline} body={copy.empty.body} />;
    }

    if (view === 'past') {
      return past.length > 0 ? (
        <View>{renderGroups(past, 0)}</View>
      ) : (
        <EmptyState headline={EVENTS_COPY.emptyPast.headline} body={EVENTS_COPY.emptyPast.body} />
      );
    }

    return (
      <View>
        {highlighted.length > 0 ? (
          <View>
            {highlighted.map((item, index) => (
              <EventCard
                key={item.event.id}
                event={item.event}
                status={item.status}
                index={index}
                // A multi-day event that began yesterday is still "today";
                // clamp so the seal never shows a negative count.
                countdownDays={item.status === 'today' ? 0 : daysUntil(item.event.startDate)}
                onPress={handleOpenEvent}
              />
            ))}
          </View>
        ) : (
          <EmptyState headline={EVENTS_COPY.allPast.headline} body={EVENTS_COPY.allPast.body} />
        )}

        {upcoming.length > 0 ? (
          <View style={{ marginTop: theme.spacing['2xl'] }}>
            <SectionHeader eyebrow={sections.upcomingEyebrow} title={sections.upcoming} />
            {renderGroups(upcoming, highlighted.length)}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      masthead={<OverlineTabs tabs={VIEWS} value={view} onChange={setView} />}
      accentVariant="none"
      title={copy.title}
      subtitle={EVENTS_COPY.tabs[view].subtitle}
      showDivider={false}
    >
      {/* The one motif on this screen, opening the list. */}
      <LatticeRule style={{ marginBottom: theme.spacing.xl }} />

      {/* Re-keyed on the view so switching tabs replays the cards' entrance
          instead of swapping lists in place. */}
      <View key={view}>{renderBody()}</View>
    </ScreenScaffold>
  );
}
