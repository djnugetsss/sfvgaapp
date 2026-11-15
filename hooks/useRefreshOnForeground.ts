import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { queryKeys } from '@/services';

/**
 * Re-fetches the time-sensitive collections when the app returns to the
 * foreground, so a member who opens their phone after a few days sees the
 * latest programmes and announcements rather than a snapshot from last time.
 *
 * Invalidating rather than refetching directly means React Query only does
 * work for queries that are actually mounted, and the existing cache keeps
 * rendering until the new data lands — no spinner flash on resume.
 *
 * Mounted once at the app root.
 */
export function useRefreshOnForeground(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        return;
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    });

    return () => subscription.remove();
  }, [queryClient]);
}
