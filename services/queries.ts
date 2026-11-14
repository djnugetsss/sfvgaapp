import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useCalendarDay } from '@/hooks/useCalendarDay';
import { contentRepository } from '@/services/repository';
import type {
  Announcement,
  BoardMember,
  EventItem,
  Faq,
  GalleryPhoto,
  GovernanceRecord,
  Leader,
  MembershipPlan,
  MissionEntry,
  Resource,
  RoleDescription,
  YouthItem,
} from '@/types';
import {
  findNextUpcomingEvent,
  withEventStatus,
  type EventWithStatus,
} from '@/utils/eventStatus';

/**
 * Typed React Query hooks over the repository.
 *
 * These are the app's read API. Components call these; they never touch
 * `contentRepository` directly, so caching, retries, and loading state are
 * uniform across every screen.
 *
 * Stale times are tuned to how often each collection actually changes. Board
 * rosters turn over annually and resource links effectively never move, so
 * refetching them on every mount is pure waste; announcements are the one
 * genuinely time-sensitive collection.
 */

/* ------------------------------------------------------------------ *
 * Query keys
 * ------------------------------------------------------------------ */

/**
 * Hierarchical keys, so a future mutation can invalidate broadly
 * (`queryKeys.events.all`) or narrowly (`queryKeys.events.byId(id)`).
 */
export const queryKeys = {
  events: {
    all: ['events'] as const,
    list: () => [...queryKeys.events.all, 'list'] as const,
    byId: (id: string) => [...queryKeys.events.all, 'detail', id] as const,
    featured: () => [...queryKeys.events.all, 'featured'] as const,
    upcoming: (fromISO: string) =>
      [...queryKeys.events.all, 'upcoming', fromISO] as const,
  },
  board: {
    all: ['board'] as const,
  },
  announcements: {
    all: ['announcements'] as const,
  },
  youth: {
    all: ['youth'] as const,
  },
  resources: {
    all: ['resources'] as const,
  },
  leadership: {
    all: ['leadership'] as const,
  },
  membershipPlans: {
    all: ['membershipPlans'] as const,
  },
  faqs: {
    all: ['faqs'] as const,
  },
  mission: {
    all: ['mission'] as const,
  },
  roles: {
    all: ['roles'] as const,
  },
  records: {
    all: ['records'] as const,
  },
  gallery: {
    all: ['gallery'] as const,
  },
} as const;

/** Shared stale windows, in milliseconds. */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const staleTimes = {
  /** Time-sensitive: a new post should appear without a restart. */
  announcements: 5 * MINUTE,
  /** The calendar shifts occasionally through the year. */
  events: 30 * MINUTE,
  /** Effectively annual. */
  board: 12 * HOUR,
  youth: 30 * MINUTE,
  /** Static link-outs. */
  resources: 24 * HOUR,
  /** Appointed annually, like the board. */
  leadership: 12 * HOUR,
  /** Dues change once a year at most. */
  membershipPlans: 12 * HOUR,
  /** Reference text — effectively static. */
  faqs: 24 * HOUR,
  mission: 24 * HOUR,
  roles: 24 * HOUR,
  /** A new set of minutes lands a few times a year. */
  records: 6 * HOUR,
  gallery: 12 * HOUR,
} as const;

/* ------------------------------------------------------------------ *
 * Hooks
 * ------------------------------------------------------------------ */

/**
 * The full calendar — every event, past included, ascending by `startDate`.
 *
 * This is the Events screen's source. Nothing here filters by date: a member
 * looking back at Navratri in December must still find it. "Past" is a
 * presentation concern, handled by `useEventsWithStatus`.
 */
export function useEvents(): UseQueryResult<EventItem[], Error> {
  return useQuery({
    queryKey: queryKeys.events.list(),
    queryFn: () => contentRepository.getEvents(),
    staleTime: staleTimes.events,
  });
}

/**
 * The full calendar with each event's derived `'past' | 'today' | 'upcoming'`
 * status attached — what the Events screen renders from.
 *
 * Still every event; the status only tells the UI how to present each one.
 *
 * Derivation runs through React Query's `select`, so this shares one cache
 * entry with `useEvents()` rather than fetching twice. The selector is keyed
 * on `useCalendarDay()`, which is live state rather than a value read during
 * render — that is what actually triggers a re-render at midnight, so an app
 * left open overnight re-derives instead of keeping yesterday's
 * classifications.
 */
export function useEventsWithStatus(): UseQueryResult<EventWithStatus[], Error> {
  const todayKey = useCalendarDay();

  const select = useCallback(
    (events: EventItem[]) => withEventStatus(events),
    // `todayKey` is intentionally the only dependency: it is not read in the
    // body, it exists to rebuild this selector when the date rolls over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayKey],
  );

  return useQuery({
    queryKey: queryKeys.events.list(),
    queryFn: () => contentRepository.getEvents(),
    staleTime: staleTimes.events,
    select,
  });
}

/**
 * The single event for Home's "next event" slot: the earliest one that has not
 * finished, so an event happening today wins over one next month. `null` when
 * the whole calendar is in the past.
 *
 * Shares the same cache entry as `useEvents()`.
 */
export function useNextUpcomingEvent(): UseQueryResult<EventItem | null, Error> {
  const todayKey = useCalendarDay();

  const select = useCallback(
    (events: EventItem[]) => findNextUpcomingEvent(events),
    // See `useEventsWithStatus` — this dependency exists to re-derive at
    // midnight, not because it is read below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayKey],
  );

  return useQuery({
    queryKey: queryKeys.events.list(),
    queryFn: () => contentRepository.getEvents(),
    staleTime: staleTimes.events,
    select,
  });
}

export function useEvent(id: string | null): UseQueryResult<EventItem | null, Error> {
  return useQuery({
    // `id ?? ''` never runs as a query — `enabled` gates it — but keeps the
    // key type stable rather than conditionally shaped.
    queryKey: queryKeys.events.byId(id ?? ''),
    queryFn: () => contentRepository.getEventById(id as string),
    enabled: id !== null,
    staleTime: staleTimes.events,
  });
}

export function useFeaturedEvent(): UseQueryResult<EventItem | null, Error> {
  return useQuery({
    queryKey: queryKeys.events.featured(),
    queryFn: () => contentRepository.getFeaturedEvent(),
    staleTime: staleTimes.events,
  });
}

/**
 * Events from a cutoff forward — a **narrow accessor**, not the default view.
 *
 * Use this only where a date-bounded list is genuinely wanted. The Events
 * screen must use `useEventsWithStatus()` instead: this one drops past events
 * entirely, which would make the completed half of the year unreachable.
 * For Home's single "next event" slot, prefer `useNextUpcomingEvent()`.
 *
 * @param fromISO ISO-8601 cutoff. Pass a *date* (`2026-08-05`) rather than a
 * full timestamp: the value is part of the query key, so a per-millisecond
 * value would mint a new cache entry on every render.
 */
export function useUpcomingEvents(fromISO: string): UseQueryResult<EventItem[], Error> {
  return useQuery({
    queryKey: queryKeys.events.upcoming(fromISO),
    queryFn: () => contentRepository.getUpcomingEvents(fromISO),
    staleTime: staleTimes.events,
  });
}

export function useBoardMembers(): UseQueryResult<BoardMember[], Error> {
  return useQuery({
    queryKey: queryKeys.board.all,
    queryFn: () => contentRepository.getBoardMembers(),
    staleTime: staleTimes.board,
  });
}

export function useAnnouncements(): UseQueryResult<Announcement[], Error> {
  return useQuery({
    queryKey: queryKeys.announcements.all,
    queryFn: () => contentRepository.getAnnouncements(),
    staleTime: staleTimes.announcements,
  });
}

export function useYouthItems(): UseQueryResult<YouthItem[], Error> {
  return useQuery({
    queryKey: queryKeys.youth.all,
    queryFn: () => contentRepository.getYouthItems(),
    staleTime: staleTimes.youth,
  });
}

export function useResources(): UseQueryResult<Resource[], Error> {
  return useQuery({
    queryKey: queryKeys.resources.all,
    queryFn: () => contentRepository.getResources(),
    staleTime: staleTimes.resources,
  });
}

/**
 * A single resource by id, or `null` when the collection carries no such
 * entry.
 *
 * Selects out of the same cache entry as `useResources()` rather than adding a
 * repository method: resources are a handful of rows that every screen already
 * has in memory, so a second fetch would buy nothing. A screen wanting one
 * specific link-out gets it here instead of hardcoding a URL.
 */
export function useResource(id: string): UseQueryResult<Resource | null, Error> {
  const select = useCallback(
    (resources: Resource[]) =>
      resources.find((resource) => resource.id === id) ?? null,
    [id],
  );

  return useQuery({
    queryKey: queryKeys.resources.all,
    queryFn: () => contentRepository.getResources(),
    staleTime: staleTimes.resources,
    select,
  });
}

/**
 * Id of the SFVGA Youth volunteer-hours record in `resources`.
 *
 * Named here rather than typed as a literal at the two call sites, so the
 * Youth screen and the More hub agree on which row this is — More filters it
 * out of the thali precisely because this screen owns it.
 *
 * TODO: confirm final public/published sheet URL before release (an /edit link
 * may error in mobile in-app browser; a Publish-to-web or preview URL is more
 * robust). The URL itself lives in `services/seed/resources.json`, which
 * cannot carry a comment.
 */
export const YOUTH_HOURS_RESOURCE_ID = 'youth-hours';

/**
 * The volunteer-hours record the Youth screen links out to. `null` when the
 * row is absent, which is the screen's cue to render without its button
 * rather than with a broken one.
 */
export function useYouthHoursResource(): UseQueryResult<Resource | null, Error> {
  return useResource(YOUTH_HOURS_RESOURCE_ID);
}

/* ------------------------------------------------------------------ *
 * Association reference content
 * ------------------------------------------------------------------ */

export function useLeadership(): UseQueryResult<Leader[], Error> {
  return useQuery({
    queryKey: queryKeys.leadership.all,
    queryFn: () => contentRepository.getLeadership(),
    staleTime: staleTimes.leadership,
  });
}

export function useMembershipPlans(): UseQueryResult<MembershipPlan[], Error> {
  return useQuery({
    queryKey: queryKeys.membershipPlans.all,
    queryFn: () => contentRepository.getMembershipPlans(),
    staleTime: staleTimes.membershipPlans,
  });
}

export function useFaqs(): UseQueryResult<Faq[], Error> {
  return useQuery({
    queryKey: queryKeys.faqs.all,
    queryFn: () => contentRepository.getFaqs(),
    staleTime: staleTimes.faqs,
  });
}

export function useMission(): UseQueryResult<MissionEntry[], Error> {
  return useQuery({
    queryKey: queryKeys.mission.all,
    queryFn: () => contentRepository.getMission(),
    staleTime: staleTimes.mission,
  });
}

export function useRoles(): UseQueryResult<RoleDescription[], Error> {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: () => contentRepository.getRoles(),
    staleTime: staleTimes.roles,
  });
}

export function useGovernanceRecords(): UseQueryResult<GovernanceRecord[], Error> {
  return useQuery({
    queryKey: queryKeys.records.all,
    queryFn: () => contentRepository.getGovernanceRecords(),
    staleTime: staleTimes.records,
  });
}

export function useGallery(): UseQueryResult<GalleryPhoto[], Error> {
  return useQuery({
    queryKey: queryKeys.gallery.all,
    queryFn: () => contentRepository.getGallery(),
    staleTime: staleTimes.gallery,
  });
}

/**
 * Id of the CPR-training photo album in `resources`. Like the hours record,
 * it belongs to the Youth screen, and More leaves it off the thali.
 */
export const YOUTH_CPR_RESOURCE_ID = 'youth-cpr';

/** The CPR album the Youth screen links to; `null` hides that card. */
export function useYouthCprResource(): UseQueryResult<Resource | null, Error> {
  return useResource(YOUTH_CPR_RESOURCE_ID);
}

/**
 * Resource ids that belong to a specific screen rather than to the More hub.
 * More filters these out of the thali so they don't show up there as stray
 * "Visit the website" compartments.
 */
export const SCREEN_OWNED_RESOURCE_IDS: ReadonlySet<string> = new Set([
  YOUTH_HOURS_RESOURCE_ID,
  YOUTH_CPR_RESOURCE_ID,
]);
