/**
 * The shape of `config/firebaseConfig.ts` — kept as documentation.
 *
 * As of Phase 8 the real `config/firebaseConfig.ts` is **committed** rather
 * than git-ignored, because EAS Build compiles from the repository in the
 * cloud and a git-ignored file is absent there. The reasoning — why a Firebase
 * web config is publishable and what must never join it — is written out at
 * the top of that file. Read it there.
 *
 * This example therefore exists only to describe the expected keys, e.g. when
 * pointing the app at a different Firebase project:
 *
 *     Firebase console → Project settings (gear icon) → General →
 *     "Your apps" → the Web app → "SDK setup and configuration" → Config
 */

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'sfvga-4ac6b.firebaseapp.com',
  projectId: 'sfvga-4ac6b',
  storageBucket: 'sfvga-4ac6b.firebasestorage.app',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID_HERE',
  appId: 'YOUR_APP_ID_HERE',
} as const;
