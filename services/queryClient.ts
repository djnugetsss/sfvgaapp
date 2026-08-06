import { QueryClient } from '@tanstack/react-query';

/**
 * Offline-friendly query client.
 *
 * Members open this app at a venue on bad LTE, so the defaults lean toward
 * "show what we have" over "show a spinner":
 *
 * - `networkMode: 'offlineFirst'` — run the query function even when the
 *   device reports no connection. Our repository reads bundled JSON, so it
 *   succeeds offline today, and a Firestore implementation with local
 *   persistence will serve from its cache rather than sitting paused.
 * - A long `gcTime` keeps fetched data resident across tab switches and
 *   backgrounding, so returning to a screen renders instantly.
 * - `refetchOnReconnect` picks up changes the moment signal returns;
 *   `refetchOnMount: false` avoids a redundant fetch when data is still fresh.
 * - Retries are capped with a bounded backoff — on a dead connection, failing
 *   quickly and rendering cached content beats retrying for a minute.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: 'offlineFirst',
        gcTime: 24 * 60 * 60 * 1000,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        refetchOnReconnect: true,
        refetchOnMount: false,
        // React Native has no window focus event; leaving this on would mean
        // relying on AppState wiring we have not added.
        refetchOnWindowFocus: false,
      },
      mutations: {
        networkMode: 'offlineFirst',
      },
    },
  });
}
