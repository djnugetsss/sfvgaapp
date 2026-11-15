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

export { contentRepository, USE_FIRESTORE } from '@/services/repository';

export type { ContentRepository } from '@/services/ContentRepository';
export { FirestoreContentRepository } from '@/services/FirestoreContentRepository';
export { JsonContentRepository } from '@/services/JsonContentRepository';
export { ContentParseError } from '@/services/parsers';

export {
  queryKeys,
  staleTimes,
  useAnnouncements,
  useBoardMembers,
  useEvent,
  useEvents,
  useFeaturedEvent,
  useResource,
  useResources,
  useYouthHoursResource,
  useYouthItems,
  YOUTH_HOURS_RESOURCE_ID,
  SCREEN_OWNED_RESOURCE_IDS,
  useFaqs,
  useGallery,
  useGovernanceRecords,
  useLeadership,
  useMembershipPlans,
  useMission,
  useRoles,
  useYouthCprResource,
  YOUTH_CPR_RESOURCE_ID,
} from '@/services/queries';
