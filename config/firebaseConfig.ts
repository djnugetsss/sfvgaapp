/**
 * Firebase **web client** configuration for project `sfvga-4ac6b`.
 *
 * ────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE IS COMMITTED ON PURPOSE
 * ────────────────────────────────────────────────────────────────────────
 *
 * It was git-ignored until Phase 8. It is now tracked, deliberately, for two
 * reasons — one practical, one about what these values actually are.
 *
 * Practical: EAS Build compiles from the git repository, in the cloud. A
 * git-ignored file is simply absent up there, so the build would either fail
 * to resolve `@/config/firebaseConfig` or ship an app that cannot reach
 * Firestore. The config has to be in the repo for a cloud build to work.
 *
 * Substantive: a Firebase *web* config is not a credential. `apiKey` here is
 * a project identifier that routes requests to the right Firebase project —
 * not a bearer token, and it grants nothing on its own. Google documents it
 * as safe to include in client code, and it necessarily is: every one of
 * these values is extractable from any shipped app bundle by anyone who cares
 * to look. Committing them changes nothing about who can read them.
 *
 * What actually protects the data is the Firestore security rules — public
 * read, no client write. Those rules are the security boundary. If they were
 * wrong, hiding this file would not save us; because they are right, showing
 * it costs us nothing. For a read-only app over public community data, that
 * is the whole threat model.
 *
 * ────────────────────────────────────────────────────────────────────────
 * WHAT MUST NEVER BE ADDED TO THIS FILE
 * ────────────────────────────────────────────────────────────────────────
 *
 * Everything above applies to the web client config and *only* to it. A
 * Firebase service-account JSON, an Admin SDK private key, a `client_email` /
 * `private_key` pair, or any Cloud API key with write scope is a real secret
 * that bypasses the security rules entirely. None of those belong in this
 * repo, in this file, or in the client bundle at any time. If a future task
 * seems to need one, it belongs in a server or a Cloud Function, not here.
 *
 * ────────────────────────────────────────────────────────────────────────
 * WHERE THESE VALUES COME FROM (to rotate or re-check them)
 * ────────────────────────────────────────────────────────────────────────
 *
 *   Firebase console (https://console.firebase.google.com/)
 *     → project **sfvga-4ac6b**
 *     → Project settings (the gear beside "Project Overview")
 *     → General tab → "Your apps" → the Web app
 *     → "SDK setup and configuration" → **Config**
 *
 * The Firebase JS SDK uses the Web config even when running natively, so
 * there is no separate iOS config to register here.
 *
 * `config/firebaseConfig.example.ts` still documents the shape. If a value
 * below is ever replaced with a `YOUR_…_HERE` placeholder, `services/firebase.ts`
 * detects it and logs a loud error rather than failing opaquely at read time.
 */

export const firebaseConfig = {
  apiKey: 'AIzaSyDoC3xFpXx8n5W2jg4lj0iMdhMNyi2qpwQ',
  authDomain: 'sfvga-4ac6b.firebaseapp.com',
  projectId: 'sfvga-4ac6b',
  storageBucket: 'sfvga-4ac6b.firebasestorage.app',
  messagingSenderId: '601050530562',
  appId: '1:601050530562:web:dfee78355ce348fbf5b81b',
  measurementId: "G-WMGFLBV49X",
} as const;
