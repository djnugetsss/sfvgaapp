import type { ContentRepository } from '@/services/ContentRepository';
import { FirestoreContentRepository } from '@/services/FirestoreContentRepository';
import { JsonContentRepository } from '@/services/JsonContentRepository';

// ─────────────────────────────────────────────────────────────────────
// FIRESTORE SWAP POINT
//
// This binding is the only line that changed when the app moved off bundled
// JSON, and the promise held: no domain type, no query hook, and no screen
// moved with it. Every caller depends on the `ContentRepository` interface and
// on domain types that were already storage-shaped — string slug IDs that
// double as document IDs, ISO-8601 date strings rather than Timestamps, and
// explicit nulls instead of omitted fields.
//
// The ordering contract on `ContentRepository` still holds: events ascending
// by order, board by roleOrder, announcements pinned-first.
//
// One correction to the note this comment used to carry. It advised satisfying
// that contract with server-side `orderBy` clauses. `FirestoreContentRepository`
// deliberately does not: a Firestore `orderBy` returns only documents that
// *contain* the sorted field, so a field name mistyped in the console would
// make a document disappear from the app with no error anywhere. Sorting on
// the client keeps every document arriving, and a malformed one is named in a
// console warning rather than silently dropped. See the note on that class.
//
// This lives in its own module, separate from the `@/services` barrel, so the
// query hooks can depend on it without an import cycle through the barrel.
// ─────────────────────────────────────────────────────────────────────

/**
 * Which backend the app reads from.
 *
 * Flip to `false` to go back to the bundled JSON — useful on a plane, when
 * Firestore is misbehaving, or to compare behaviour while debugging a content
 * problem. `JsonContentRepository` is kept in the tree for exactly this, and
 * the seed script reads the same JSON, so the two stay in step.
 *
 * Nothing else needs to change when you flip it: both classes implement the
 * same interface, so the app cannot tell them apart.
 */
export const USE_FIRESTORE = true;

export const contentRepository: ContentRepository = USE_FIRESTORE
  ? new FirestoreContentRepository()
  : new JsonContentRepository();
