import faqsJson from '@/services/seed/faqs.json';
import galleryJson from '@/services/seed/gallery.json';
import leadershipJson from '@/services/seed/leadership.json';
import membershipPlansJson from '@/services/seed/membershipPlans.json';
import missionJson from '@/services/seed/mission.json';
import recordsJson from '@/services/seed/records.json';
import rolesJson from '@/services/seed/roles.json';

/**
 * The bundled copy of each reference collection that arrived with the Base44
 * content (membership, FAQs, mission, roles, records, leadership, gallery).
 *
 * Two readers depend on this:
 * - `JsonContentRepository` reads it outright.
 * - `FirestoreContentRepository` falls back to it while the matching Firestore
 *   collection is still empty — the window between shipping this code and
 *   running `scripts/seedFirestore.ts`. See `readWithSeedFallback` there.
 *
 * The values are raw, unparsed JSON. Both readers send them through the same
 * parsers a Firestore document goes through.
 */
export const SEED_COLLECTIONS = {
  leadership: leadershipJson as unknown,
  membershipPlans: membershipPlansJson as unknown,
  faqs: faqsJson as unknown,
  mission: missionJson as unknown,
  roles: rolesJson as unknown,
  records: recordsJson as unknown,
  gallery: galleryJson as unknown,
} as const;

export type SeedCollectionName = keyof typeof SEED_COLLECTIONS;
