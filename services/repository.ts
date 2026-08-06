import type { ContentRepository } from '@/services/ContentRepository';
import { JsonContentRepository } from '@/services/JsonContentRepository';

// ─────────────────────────────────────────────────────────────────────
// FIRESTORE SWAP POINT
//
// This binding is the only line that changes when the app moves off bundled
// JSON. A future `FirestoreContentRepository` implements the same
// `ContentRepository` interface, and the swap is:
//
//     export const contentRepository: ContentRepository =
//       new FirestoreContentRepository(firestoreInstance);
//
// Nothing else moves. Not the domain types, not the query hooks, not a single
// screen — because every caller depends on the interface and on domain types
// that are already storage-shaped: string slug IDs that double as document
// IDs, ISO-8601 date strings rather than Timestamps, and explicit nulls
// instead of omitted fields.
//
// The one obligation on a new implementation is the ordering contract
// documented on `ContentRepository` (events ascending by startDate, board by
// roleOrder, announcements pinned-first). Firestore should satisfy those with
// server-side `orderBy` clauses rather than re-sorting on the client.
//
// This lives in its own module, separate from the `@/services` barrel, so the
// query hooks can depend on it without an import cycle through the barrel.
// ─────────────────────────────────────────────────────────────────────
export const contentRepository: ContentRepository = new JsonContentRepository();
