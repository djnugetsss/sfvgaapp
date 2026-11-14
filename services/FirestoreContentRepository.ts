import { compareAsc, format, isBefore, parseISO, startOfDay } from 'date-fns';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import type { ContentRepository } from '@/services/ContentRepository';
import { db } from '@/services/firebase';
import {
  parseAnnouncement,
  parseBoardMember,
  parseCollection,
  parseEventItem,
  parseFaq,
  parseGalleryPhoto,
  parseGovernanceRecord,
  parseLeader,
  parseMembershipPlan,
  parseMissionEntry,
  parseResource,
  parseRoleDescription,
  parseYouthItem,
} from '@/services/parsers';
import {
  SEED_COLLECTIONS,
  type SeedCollectionName,
} from '@/services/seedCollections';
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
import { byOrder, byRoleOrder } from '@/utils/order';

/**
 * `ContentRepository` backed by Firestore.
 *
 * Behaviourally identical to `JsonContentRepository` — same methods, same
 * ordering guarantees, same domain types, same string image keys resolved
 * against the bundled registry by `resolveImageSource`. Firestore stores text
 * and dates only; no image data and no derived state live there.
 *
 * Three decisions are worth stating, because each is a deliberate departure
 * from the obvious Firestore idiom.
 *
 * **1. No `where` filters, ever, in `getEvents`.** The interface documents
 * that past events must be returned; the Events screen de-emphasises them
 * rather than hiding them, and a past event stays openable by deep link. A
 * `where('startDate', '>=', …)` here would be a silent regression that only
 * shows up next year.
 *
 * **2. No `orderBy` either — sorting happens on the client.** This one reverses
 * the suggestion left in `repository.ts`, and the reason is specific to a
 * hand-edited database: a Firestore query with `orderBy('startDate')` returns
 * only documents that *have* a `startDate` field. A typo in the console — an
 * event saved with `startdate` — would vanish from the app with no error
 * anywhere. Fetching the collection whole and sorting here means that document
 * still arrives, fails validation, and is named in a console warning. The
 * collections are a few dozen documents each, so the cost is nil and the
 * failure mode is loud instead of silent.
 *
 * **3. A bad document is skipped, not thrown.** Content is hand-edited in the
 * console by one admin, so a single mistyped field must not blank the app.
 * Each document is parsed in isolation by the *same* parsers the JSON path
 * uses, and one that fails is dropped with a warning naming the collection,
 * the document id, and the offending field. Everything else still renders.
 * Field-level fallbacks are unchanged: `resolveContent` still turns a "TODO:"
 * marker into the designed fallback, and `resolveImageSource` still degrades
 * an unregistered image key to nothing.
 *
 * Reads are one-shot `getDocs`/`getDoc`, not realtime listeners. React Query
 * owns caching and refetch timing, exactly as it did over the JSON, so the
 * stale times in `queries.ts` keep meaning what they said.
 */

/** Top-level collection names, as created by `scripts/seedFirestore.ts`. */
const COLLECTIONS = {
  events: 'events',
  board: 'board',
  announcements: 'announcements',
  youth: 'youth',
  resources: 'resources',
  leadership: 'leadership',
  membershipPlans: 'membershipPlans',
  faqs: 'faqs',
  mission: 'mission',
  roles: 'roles',
  records: 'records',
  gallery: 'gallery',
} as const;

/**
 * Converts the values Firestore can hand back into the plain JSON shapes the
 * parsers expect.
 *
 * The one real case is `Timestamp`. Domain types carry ISO-8601 *strings*, and
 * the seed writes strings, but the console's field-type dropdown offers
 * "timestamp" prominently for anything date-shaped — so an edit made by hand
 * can easily come back as a `Timestamp` and fail a string check. Rather than
 * discard the document, the value is formatted to the same `yyyy-MM-dd` shape
 * the rest of the content uses, and the coercion is announced.
 *
 * The formatting is deliberately local-time, not `toISOString()`. A UTC
 * midnight instant rendered in Pacific time is the *previous day*, so a
 * timestamp round-tripped through UTC would show events a day early. Local
 * formatting keeps the calendar day the admin picked in the console.
 */
const normalizeValue = (
  value: unknown,
  path: string,
): unknown => {
  if (value instanceof Timestamp) {
    const asDate = value.toDate();
    const asCalendarDay = format(asDate, 'yyyy-MM-dd');
    console.warn(
      `[firestore] ${path} is a Timestamp; coerced to "${asCalendarDay}". ` +
        'Prefer a string field in the console so the stored value matches ' +
        'what the app displays.',
    );
    return asCalendarDay;
  }
  return value;
};

/**
 * Flattens a document into the record shape the parsers accept.
 *
 * The document **id wins** over any `id` field stored inside the document. The
 * seed writes both (so the console is readable), and if the two ever drift the
 * path you navigated to is the more trustworthy of the pair.
 */
const toRecord = (
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
  collectionName: string,
): Record<string, unknown> => {
  const data = snapshot.data() ?? {};
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    normalized[key] = normalizeValue(value, `${collectionName}/${snapshot.id}.${key}`);
  }

  normalized.id = snapshot.id;
  return normalized;
};

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Parses a whole collection, dropping — and reporting — documents that fail.
 *
 * The parser's `index` argument only shapes its error text ("events[3]"), so
 * the document id is prepended to the warning; "events[3]" alone is useless
 * when you are looking at a console full of named documents.
 */
const parseDocuments = <T>(
  snapshots: QueryDocumentSnapshot<DocumentData>[],
  parseItem: (input: unknown, index: number) => T,
  collectionName: string,
): T[] => {
  const parsed: T[] = [];

  snapshots.forEach((snapshot, index) => {
    try {
      parsed.push(parseItem(toRecord(snapshot, collectionName), index));
    } catch (error) {
      console.warn(
        `[firestore] Skipped ${collectionName}/${snapshot.id} — ` +
          `${describeError(error)} Fix the field in the Firebase console; ` +
          'the rest of this collection still rendered.',
      );
    }
  });

  return parsed;
};

export class FirestoreContentRepository implements ContentRepository {
  /**
   * The Firestore handle is injected rather than imported at the point of use,
   * so a test (or a second project) can pass its own instance. It defaults to
   * the app's shared instance, which is what `repository.ts` relies on.
   */
  constructor(private readonly firestore: Firestore = db) {}

  private async readCollection<T>(
    collectionName: string,
    parseItem: (input: unknown, index: number) => T,
  ): Promise<T[]> {
    const snapshot = await getDocs(
      collection(this.firestore, collectionName),
    );
    return parseDocuments(snapshot.docs, parseItem, collectionName);
  }

  /**
   * Every event, ascending by `startDate` — past ones included.
   *
   * See the class note: no `where`, no `orderBy`, on purpose.
   */
  private async loadEvents(): Promise<EventItem[]> {
    const events = await this.readCollection(COLLECTIONS.events, parseEventItem);
    return events.sort((a, b) =>
      compareAsc(parseISO(a.startDate), parseISO(b.startDate)),
    );
  }

  async getEvents(): Promise<EventItem[]> {
    return this.loadEvents();
  }

  /**
   * A single event by id.
   *
   * Reads the one document directly rather than filtering the collection —
   * `id` is the document id, so this is a point read. A document that exists
   * but fails validation returns `null` (with a warning) rather than throwing,
   * which the detail screen already renders as its not-found state.
   */
  async getEventById(id: string): Promise<EventItem | null> {
    const snapshot = await getDoc(doc(this.firestore, COLLECTIONS.events, id));

    if (!snapshot.exists()) {
      return null;
    }

    try {
      return parseEventItem(toRecord(snapshot, COLLECTIONS.events), 0);
    } catch (error) {
      console.warn(
        `[firestore] Skipped ${COLLECTIONS.events}/${snapshot.id} — ` +
          `${describeError(error)} Fix the field in the Firebase console.`,
      );
      return null;
    }
  }

  async getFeaturedEvent(): Promise<EventItem | null> {
    const events = await this.loadEvents();
    // Sorted ascending already, so `find` yields the earliest flagged event —
    // a deterministic winner if the data ever flags more than one.
    return events.find((event) => event.isFeatured) ?? null;
  }

  async getUpcomingEvents(fromISO: string): Promise<EventItem[]> {
    const events = await this.loadEvents();
    // Calendar-day comparison, matching the JSON implementation: an event
    // earlier today is still "upcoming" to someone checking that afternoon.
    // Filtered here rather than in the query so the rule stays in one place
    // and cannot drift from `getEventStatus`.
    const cutoff = startOfDay(parseISO(fromISO));

    return events.filter(
      (event) => !isBefore(startOfDay(parseISO(event.startDate)), cutoff),
    );
  }

  async getBoardMembers(): Promise<BoardMember[]> {
    const members = await this.readCollection(
      COLLECTIONS.board,
      parseBoardMember,
    );
    return members.sort(byRoleOrder);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const announcements = await this.readCollection(
      COLLECTIONS.announcements,
      parseAnnouncement,
    );

    return announcements.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      // Newest first within each pinned group.
      return compareAsc(parseISO(b.date), parseISO(a.date));
    });
  }

  async getYouthItems(): Promise<YouthItem[]> {
    return this.readCollection(COLLECTIONS.youth, parseYouthItem);
  }

  async getResources(): Promise<Resource[]> {
    return this.readCollection(COLLECTIONS.resources, parseResource);
  }

  /**
   * Reads one of the reference collections that arrived with the Base44
   * content, falling back to the bundled seed while it is **empty**.
   *
   * This is the one place this class reads anything but Firestore, and it is
   * narrow on purpose. An empty collection is the state between shipping these
   * screens and running `scripts/seedFirestore.ts` — Firestore answers a read
   * of a collection that was never written with zero documents, not an error —
   * and during that window the screens should show the association's real
   * content, not an empty state. The moment the collection holds even one
   * document, Firestore is the whole truth: a row the admin deleted in the
   * console stays deleted, and nothing is merged back in from the bundle.
   *
   * A failed read still rejects, exactly as `readCollection` does, so offline
   * and permission errors keep surfacing through React Query.
   */
  private async readWithSeedFallback<T>(
    name: SeedCollectionName,
    parseItem: (input: unknown, index: number) => T,
  ): Promise<T[]> {
    const fromFirestore = await this.readCollection(COLLECTIONS[name], parseItem);

    if (fromFirestore.length > 0) {
      return fromFirestore;
    }

    return parseCollection(SEED_COLLECTIONS[name], parseItem, name);
  }

  async getLeadership(): Promise<Leader[]> {
    const leaders = await this.readWithSeedFallback('leadership', parseLeader);
    return leaders.sort(byRoleOrder);
  }

  async getMembershipPlans(): Promise<MembershipPlan[]> {
    const plans = await this.readWithSeedFallback(
      'membershipPlans',
      parseMembershipPlan,
    );
    return plans.sort(byOrder);
  }

  async getFaqs(): Promise<Faq[]> {
    const faqs = await this.readWithSeedFallback('faqs', parseFaq);
    return faqs.sort(byOrder);
  }

  async getMission(): Promise<MissionEntry[]> {
    const entries = await this.readWithSeedFallback('mission', parseMissionEntry);
    return entries.sort(byOrder);
  }

  async getRoles(): Promise<RoleDescription[]> {
    const roles = await this.readWithSeedFallback('roles', parseRoleDescription);
    return roles.sort(byOrder);
  }

  async getGovernanceRecords(): Promise<GovernanceRecord[]> {
    const records = await this.readWithSeedFallback(
      'records',
      parseGovernanceRecord,
    );
    return records.sort(byOrder);
  }

  async getGallery(): Promise<GalleryPhoto[]> {
    const photos = await this.readWithSeedFallback('gallery', parseGalleryPhoto);
    return photos.sort(byOrder);
  }
}
