import type {
  Announcement,
  BoardMember,
  EventItem,
  Resource,
  YouthItem,
} from '@/types';

/**
 * The contract every content backend must satisfy.
 *
 * This interface is the seam the app is built against. `JsonContentRepository`
 * implements it today; `FirestoreContentRepository` will implement it later.
 * Because every method is already async and already returns domain types, the
 * swap changes no signature, no type, and no caller.
 *
 * Ordering guarantees are part of the contract, not an implementation detail —
 * callers may rely on them and a future backend must honour them:
 * - `getEvents` / `getUpcomingEvents`: ascending by `startDate`.
 * - `getBoardMembers`: ascending by `roleOrder`.
 * - `getAnnouncements`: pinned first, then descending by `date`.
 */
export interface ContentRepository {
  /**
   * All events, ascending by `startDate`.
   *
   * "All" is load-bearing: **past events must be included.** The Events screen
   * renders the whole year, de-emphasising completed events rather than hiding
   * them, and a past event must stay openable. Any implementation that filters
   * by date here — including a Firestore query with a `where` clause on
   * `startDate` — breaks that. Past/upcoming is derived for display by
   * `getEventStatus`, never stored and never filtered at the source.
   */
  getEvents(): Promise<EventItem[]>;

  /** A single event, or `null` when no event carries that id. */
  getEventById(id: string): Promise<EventItem | null>;

  /**
   * The flagship event for the year, or `null` if none is flagged. When more
   * than one is flagged, the earliest wins — a deterministic tiebreak beats a
   * silently arbitrary one.
   */
  getFeaturedEvent(): Promise<EventItem | null>;

  /**
   * Events starting on or after `fromISO`, ascending by `startDate`.
   *
   * A narrow accessor for date-bounded needs, not the general event view —
   * `getEvents()` is that. This one intentionally omits past events.
   *
   * @param fromISO ISO-8601 date or date-time. Comparison is calendar-day
   * based, so an event earlier today still counts as upcoming.
   */
  getUpcomingEvents(fromISO: string): Promise<EventItem[]>;

  /** Board members, ascending by `roleOrder`. */
  getBoardMembers(): Promise<BoardMember[]>;

  /** Announcements, pinned first then newest first. */
  getAnnouncements(): Promise<Announcement[]>;

  /** Youth items. Minimal until the Phase 5 volunteer-hours model lands. */
  getYouthItems(): Promise<YouthItem[]>;

  /** Outbound links — membership, giving, governance documents. */
  getResources(): Promise<Resource[]>;
}
