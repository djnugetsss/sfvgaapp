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
 * - `getEvents`: ascending by `order`.
 * - `getBoardMembers`: ascending by `roleOrder`.
 * - `getAnnouncements`: pinned first, then descending by `date`.
 * - `getLeadership`: ascending by `roleOrder`.
 * - Every other collection (`getMembershipPlans`, `getFaqs`, `getMission`,
 *   `getRoles`, `getGovernanceRecords`, `getGallery`): ascending by `order`.
 */
export interface ContentRepository {
  /** All events, ascending by `order` — the sequence the association lists them in. */
  getEvents(): Promise<EventItem[]>;

  /** A single event, or `null` when no event carries that id. */
  getEventById(id: string): Promise<EventItem | null>;

  /**
   * The event Home highlights, or `null` if none is flagged. When more than
   * one is flagged, the first in `order` wins — a deterministic tiebreak
   * beats a silently arbitrary one.
   */
  getFeaturedEvent(): Promise<EventItem | null>;

  /** Board members, ascending by `roleOrder`. */
  getBoardMembers(): Promise<BoardMember[]>;

  /** Announcements, pinned first then newest first. */
  getAnnouncements(): Promise<Announcement[]>;

  /** Youth items. Minimal until the Phase 5 volunteer-hours model lands. */
  getYouthItems(): Promise<YouthItem[]>;

  /** Outbound links — membership, giving, governance documents. */
  getResources(): Promise<Resource[]>;

  /** Extended leadership — appointed helpers, ascending by `roleOrder`. */
  getLeadership(): Promise<Leader[]>;

  /** Membership dues, ascending by `order`. */
  getMembershipPlans(): Promise<MembershipPlan[]>;

  /** Frequently asked questions, ascending by `order`. */
  getFaqs(): Promise<Faq[]>;

  /** The mission statement and its points, ascending by `order`. */
  getMission(): Promise<MissionEntry[]>;

  /** Board and committee role descriptions, ascending by `order`. */
  getRoles(): Promise<RoleDescription[]>;

  /** Meeting minutes and AGM records, ascending by `order`. */
  getGovernanceRecords(): Promise<GovernanceRecord[]>;

  /** Community Moments photographs, ascending by `order`. */
  getGallery(): Promise<GalleryPhoto[]>;
}
