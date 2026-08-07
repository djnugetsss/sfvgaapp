/**
 * The app's data layer.
 *
 * Screens import from `@/services` and nothing else — never a JSON file,
 * never a repository class directly. In practice they use the query hooks;
 * `contentRepository` is exported for non-React callers (future background
 * refresh, prefetching, tests).
 *
 * The Firestore swap point lives in `@/services/repository`.
 */

export { contentRepository } from '@/services/repository';

export type { ContentRepository } from '@/services/ContentRepository';
export { JsonContentRepository } from '@/services/JsonContentRepository';
export { ContentParseError } from '@/services/parsers';

export {
  queryKeys,
  staleTimes,
  useAnnouncements,
  useBoardMembers,
  useEvent,
  useEvents,
  useEventsWithStatus,
  useFeaturedEvent,
  useNextUpcomingEvent,
  useResource,
  useResources,
  useUpcomingEvents,
  useYouthHoursResource,
  useYouthItems,
  YOUTH_HOURS_RESOURCE_ID,
} from '@/services/queries';

/**
 * Derived event time-status. Exported here so screens get it from the same
 * `@/services` boundary as the data itself.
 */
export {
  findNextUpcomingEvent,
  getEventStatus,
  withEventStatus,
  type EventStatus,
  type EventWithStatus,
} from '@/utils/eventStatus';
