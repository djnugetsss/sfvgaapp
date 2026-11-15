/**
 * Domain types for SFVGA content.
 *
 * These are the contract between the data layer and everything above it.
 * They are storage-agnostic on purpose: the current implementation reads
 * bundled JSON, a later phase reads Firestore, and neither of those facts is
 * visible here.
 *
 * Conventions that make the Firestore swap a non-event:
 * - `id` is always a stable string slug, usable directly as a document ID.
 * - Every date is an ISO-8601 string, never a `Date` and never a Timestamp.
 *   Callers parse at the point of display; the repository parses at the point
 *   of ingest. Nothing in between holds a live Date object.
 * - Absent values are explicit `null`, never `undefined` and never omitted,
 *   so a document round-trips through JSON and Firestore identically.
 */

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

/**
 * An SFVGA programme, as the Base44 web app lists it.
 *
 * These are the association's recurring programmes — Sanskriti Divas,
 * Navratri & Garba, and so on — not individually ticketed dates, so the date
 * is display text ("September 13, 2026", "Spring 2026", "Past Events") rather
 * than an ISO-8601 value. Nothing here is derived from the clock.
 */
export type EventItem = {
  /** Stable slug, e.g. `sanskriti-divas`. */
  id: string;
  /** Programme name. */
  title: string;
  /** Short overline, e.g. "Flagship Cultural Night". */
  tag: string;
  description: string;
  /** One-line invitation shown on Home. `null` for events Home never features. */
  teaser: string | null;
  /** When it next happens, as the association words it. */
  dateLabel: string;
  /** Venue town, e.g. "Chatsworth, CA". `null` falls back to the Valley. */
  location: string | null;
  /** Remote URL or bundled asset key. `null` renders no picture. */
  heroImage: string | null;
  /** The event Home highlights under "Upcoming Event". */
  isFeatured: boolean;
  /** Ascending display order. */
  order: number;
};

/* ------------------------------------------------------------------ *
 * Board
 * ------------------------------------------------------------------ */

export type BoardMember = {
  id: string;
  name: string;
  /** Title as the association words it, e.g. "Vice President". */
  role: string;
  /** Ascending display order. Not an index — gaps are allowed. */
  roleOrder: number;
  photo: string | null;
  email: string | null;
  bio: string | null;
};

/* ------------------------------------------------------------------ *
 * Announcements
 * ------------------------------------------------------------------ */

export type Announcement = {
  id: string;
  title: string;
  body: string;
  /** ISO-8601 publication date. */
  date: string;
  linkUrl: string | null;
  /** Pinned items sort above the rest regardless of date. */
  pinned: boolean;
};

/* ------------------------------------------------------------------ *
 * Youth
 * ------------------------------------------------------------------ */

/**
 * Deliberately minimal for now.
 *
 * TODO: youth volunteer-hours model (Phase 5) — the real shape will track
 * per-student hour logs, approvals, and program enrollment. Do not grow this
 * type ad hoc in the meantime; replace it wholesale when that lands.
 */
export type YouthItem = {
  id: string;
  title: string;
  body: string | null;
};

/* ------------------------------------------------------------------ *
 * Resources
 * ------------------------------------------------------------------ */

export const RESOURCE_KINDS = [
  'membership',
  'donation',
  'bylaws',
  'minutes',
  'mission',
  'external',
] as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export type Resource = {
  id: string;
  label: string;
  url: string;
  kind: ResourceKind;
};

/* ------------------------------------------------------------------ *
 * Association reference content
 *
 * Everything below arrived with the Base44 web app's content: membership
 * dues, FAQs, the mission, role descriptions, governance records, the
 * extended leadership, and the community photo gallery. Each is its own
 * collection so the board can edit one without touching the others, and each
 * carries an explicit `order` rather than relying on document order — Firestore
 * returns documents by id, which is never the order a reader wants.
 * ------------------------------------------------------------------ */

/**
 * The extended leadership — webmaster, honorary CPAs, app developers.
 *
 * Same shape as `BoardMember` on purpose, so the same row renders both, but a
 * separate collection: these are appointed helpers, not elected officers, and
 * mixing them into `board` would put a CPA in the officers' running order.
 */
export type Leader = BoardMember;

export type MembershipPlan = {
  id: string;
  /** As the association words it, e.g. "Family Membership Renewal". */
  name: string;
  /** Whole US dollars. */
  price: number;
  note: string | null;
  /**
   * True for plans an existing member can renew online. The new-family plan is
   * false: joining goes through the full application on sfvga.org.
   */
  renewable: boolean;
  order: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

export const MISSION_ENTRY_KINDS = ['statement', 'point'] as const;
export type MissionEntryKind = (typeof MISSION_ENTRY_KINDS)[number];

/**
 * One paragraph of the mission: the statement itself, or one of the ways the
 * association carries it out.
 */
export type MissionEntry = {
  id: string;
  kind: MissionEntryKind;
  text: string;
  order: number;
};

export const ROLE_SCOPES = ['board', 'committee'] as const;
export type RoleScope = (typeof ROLE_SCOPES)[number];

/** A role's written responsibilities — board office or event committee. */
export type RoleDescription = {
  id: string;
  title: string;
  scope: RoleScope;
  responsibilities: string[];
  order: number;
};

export const RECORD_GROUPS = ['minutes', 'agm'] as const;
export type RecordGroup = (typeof RECORD_GROUPS)[number];

/** A governance document: a set of meeting minutes or an AGM record. */
export type GovernanceRecord = {
  id: string;
  /** As published, e.g. "2026 Q1" or "AGM 2025". */
  label: string;
  url: string;
  group: RecordGroup;
  /** Ascending display order within the group — newest first by convention. */
  order: number;
};

/** One frame of the Community Moments gallery on Home. */
export type GalleryPhoto = {
  id: string;
  /** Remote URL or bundled asset key, resolved by `resolveImageSource`. */
  image: string;
  caption: string | null;
  order: number;
};
