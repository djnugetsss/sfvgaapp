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

export const EVENT_CATEGORIES = [
  'cultural',
  'social',
  'wellness',
  'youth',
  'governance',
  'religious',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type EventItem = {
  /** Stable slug, e.g. `sanskriti-divas`. */
  id: string;
  title: string;
  /** ISO-8601 date (or date-time) the event begins. */
  startDate: string;
  /** ISO-8601 end, or `null` for a single-day event. */
  endDate: string | null;
  allDay: boolean;
  /** Display time, e.g. "6:00 PM". `null` when unknown or all-day. */
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  description: string | null;
  /** Remote URL or bundled asset path. `null` until artwork exists. */
  heroImage: string | null;
  /** Canonical page on sfvga.org — the source of truth for unfilled fields. */
  sourceUrl: string;
  isFeatured: boolean;
  category: EventCategory;
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
