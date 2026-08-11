/**
 * One-time (and safely repeatable) seed of Firestore from the bundled JSON.
 *
 * ────────────────────────────────────────────────────────────────────────
 * RUN
 *
 *     npx tsx scripts/seedFirestore.ts
 *
 * from the **project root**. `npx` downloads `tsx` on first use; nothing is
 * added to the project's dependencies.
 *
 * ────────────────────────────────────────────────────────────────────────
 * BEFORE YOU RUN IT — the rules will refuse these writes
 *
 * This is the *client* SDK, and the production rules say "no client write", so
 * a first run will fail with `permission-denied`. That is the rules working
 * correctly, not a bug in this script. Open
 *
 *     Firebase console → Firestore Database → Rules
 *
 * and publish this temporarily:
 *
 *     rules_version = '2';
 *     service cloud.firestore {
 *       match /databases/{database}/documents {
 *         match /{document=**} {
 *           allow read: if true;
 *           allow write: if true;   // TEMPORARY — for seeding only
 *         }
 *       }
 *     }
 *
 * run the script, confirm the documents landed, then **immediately** publish
 * the locked-down rules again:
 *
 *     rules_version = '2';
 *     service cloud.firestore {
 *       match /databases/{database}/documents {
 *         match /{document=**} {
 *           allow read: if true;
 *           allow write: if false;
 *         }
 *       }
 *     }
 *
 * The window where anyone can write to the database is however long you leave
 * the first ruleset published, so keep it to the length of one run. (The
 * alternative — the Firebase Admin SDK with a service-account key — needs a
 * private key file on disk, which is a real secret and a worse thing to have
 * lying around for a job you run once.)
 *
 * ────────────────────────────────────────────────────────────────────────
 * WHAT IT DOES
 *
 * Reads `services/seed/*.json` and writes each record to the matching
 * collection, using the record's own `id` as the document id. That makes it
 * idempotent: a second run overwrites the same five documents rather than
 * creating five more. It never deletes — a document you added by hand in the
 * console survives, and a record removed from the JSON is left in place rather
 * than being cleaned up behind your back.
 *
 * It writes nothing that the app would not read: same field names, same
 * ISO-8601 date strings, same string image keys resolved against the bundled
 * registry. No images are uploaded; artwork stays in the app bundle.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { initializeApp } from 'firebase/app';
import {
  doc,
  getFirestore,
  terminate,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';

import { firebaseConfig } from '../config/firebaseConfig';

/** Seed file → destination collection. Mirrors `FirestoreContentRepository`. */
const SEEDS = [
  { file: 'events.json', collection: 'events' },
  { file: 'board.json', collection: 'board' },
  { file: 'announcements.json', collection: 'announcements' },
  { file: 'youth.json', collection: 'youth' },
  { file: 'resources.json', collection: 'resources' },
] as const;

type SeedRecord = Record<string, unknown> & { id: string };

/**
 * Reads one seed file.
 *
 * Resolved from `process.cwd()` rather than from this file's own location:
 * `tsx` may run the script as ESM or CJS depending on how it is invoked, and
 * `import.meta.url` is only defined in one of those. Requiring the project
 * root as the working directory is the simpler contract, and the error below
 * says so plainly when it is not met.
 */
const readSeed = (file: string): unknown => {
  const path = resolve(process.cwd(), 'services', 'seed', file);

  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not read ${path} — ${reason}\n` +
        'Run this script from the project root: npx tsx scripts/seedFirestore.ts',
    );
  }
};

/**
 * Keeps only records usable as documents.
 *
 * Deliberately shallow. The app's real validation lives in `services/parsers`
 * and runs at *read* time, where it belongs — a hand-edited console document
 * has never been through this script. Importing those parsers here would drag
 * the `@/` path alias into a plain Node process for no benefit, so this checks
 * the one thing the write itself depends on: a usable document id.
 */
const usableRecords = (input: unknown, collection: string): SeedRecord[] => {
  if (!Array.isArray(input)) {
    throw new Error(`${collection}: expected the seed file to hold an array.`);
  }

  const records: SeedRecord[] = [];

  input.forEach((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      console.warn(`  ! ${collection}[${index}] is not an object — skipped.`);
      return;
    }

    const id = (item as Record<string, unknown>).id;

    if (typeof id !== 'string' || id.length === 0) {
      console.warn(
        `  ! ${collection}[${index}] has no usable string "id" — skipped. ` +
          'The id becomes the Firestore document id, so it cannot be empty.',
      );
      return;
    }

    records.push({ ...(item as Record<string, unknown>), id });
  });

  return records;
};

const seedCollection = async (
  db: Firestore,
  collection: string,
  records: SeedRecord[],
): Promise<void> => {
  if (records.length === 0) {
    console.log(`  ${collection}: nothing to write (seed file is empty).`);
    return;
  }

  // One batch per collection: these are tens of documents, far below the 500
  // per batch limit, and a batch means a collection lands whole or not at all.
  const batch = writeBatch(db);

  for (const record of records) {
    batch.set(doc(db, collection, record.id), record);
  }

  await batch.commit();
  console.log(
    `  ${collection}: wrote ${records.length} document(s) — ` +
      `${records.map((record) => record.id).join(', ')}`,
  );
};

const main = async (): Promise<void> => {
  if (Object.values(firebaseConfig).some((value) => value.includes('YOUR_'))) {
    throw new Error(
      'config/firebaseConfig.ts still holds placeholder values. Paste your ' +
        'real config from the Firebase console before seeding.',
    );
  }

  console.log(`Seeding Firestore project "${firebaseConfig.projectId}"…\n`);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    for (const { file, collection } of SEEDS) {
      await seedCollection(db, collection, usableRecords(readSeed(file), collection));
    }

    console.log(
      '\nDone. Verify in the Firebase console → Firestore Database → Data: ' +
        'you should see the collections events, board, announcements, youth ' +
        '(may be absent if empty), and resources, each holding documents named ' +
        'by their slug id.\n' +
        'Now restore the locked-down rules (allow write: if false).',
    );
  } finally {
    // The SDK holds a connection open, so Node would otherwise hang here.
    await terminate(db);
  }
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('permission-denied') || message.includes('PERMISSION_DENIED')) {
    console.error(
      '\nFirestore refused the write (permission-denied).\n\n' +
        'This is expected on a first run: the production rules block client ' +
        'writes. Publish the temporary rules documented at the top of this ' +
        'file, run the script again, then restore the locked-down rules.\n',
    );
  } else {
    console.error(`\nSeed failed: ${message}\n`);
  }

  process.exitCode = 1;
});
