import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';

import { firebaseConfig } from '@/config/firebaseConfig';

/**
 * The Firebase app and Firestore handle, initialised once.
 *
 * Expo Go rules the choice of SDK: this is the **Firebase JS SDK**, not React
 * Native Firebase, because the latter needs native modules and therefore a
 * development build. Expo requires `firebase@12` or newer here — older
 * versions fail to resolve as ES modules under Metro.
 *
 * Read-only by construction. Nothing in the app imports a write function, and
 * the Firestore rules refuse client writes regardless; content is edited in
 * the Firebase console.
 */

/**
 * True while `config/firebaseConfig.ts` still holds the shipped placeholders.
 *
 * Worth detecting explicitly: a placeholder `apiKey` does not fail at
 * `initializeApp`, it fails later inside a read, as an opaque
 * `auth/invalid-api-key` or a permission error that reads like a rules
 * problem. Naming it here turns twenty minutes of rule-debugging into one
 * line of console output.
 */
const isPlaceholderConfig = Object.values(firebaseConfig).some((value) =>
  value.includes('YOUR_'),
);

if (isPlaceholderConfig) {
  console.error(
    '[firebase] config/firebaseConfig.ts still contains placeholder values. ' +
      'Paste your real values from the Firebase console → Project settings → ' +
      'General → Your apps → Web app → SDK setup and configuration → Config. ' +
      'Until then every content read will fail and screens will show their ' +
      'error state.',
  );
}

/**
 * Fast refresh re-evaluates this module while the previous Firebase app is
 * still registered, and `initializeApp` throws on a duplicate. Reusing the
 * registered app is the documented guard.
 */
const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * `initializeFirestore` rather than `getFirestore` so the transport is stated
 * rather than inherited.
 *
 * `experimentalAutoDetectLongPolling` is the SDK default; writing it down
 * makes the escape hatch obvious. Firestore's normal transport is WebChannel,
 * which some React Native networking stacks mishandle — the symptom is reads
 * that hang forever rather than erroring. If that ever happens in Expo Go,
 * swap this one line for:
 *
 *     experimentalForceLongPolling: true,
 *
 * and remove the auto-detect flag (the two are mutually exclusive).
 *
 * It throws if the same app is initialised twice, which fast refresh will do,
 * so the catch falls back to the instance already attached to the app.
 */
function createFirestore(): Firestore {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
}

export const db: Firestore = createFirestore();

export { app as firebaseApp };
