import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { queryKeys } from '@/services';

const currentDay = (): string => format(new Date(), 'yyyy-MM-dd');

/**
 * Re-fetches events when the app returns to the foreground, and whenever the
 * calendar day changes.
 *
 * This is the second half of the midnight-staleness fix. `useCalendarDay`
 * makes the *derivation* re-run when the date rolls over; this makes the
 * *data* fresh again, so a member who leaves the app open on Sunday and opens
 * their phone on Monday sees the calendar re-evaluated rather than a snapshot
 * of yesterday.
 *
 * Invalidating rather than refetching directly means React Query only does
 * work for queries that are actually mounted, and the existing cache keeps
 * rendering until the new data lands — no spinner flash on resume.
 *
 * Mounted once at the app root.
 */
export function useRefreshOnForeground(): void {
  const queryClient = useQueryClient();
  const lastDayRef = useRef(currentDay());

  useEffect(() => {
    const invalidateEvents = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        return;
      }
      lastDayRef.current = currentDay();
      invalidateEvents();
    });

    // Covers the app being left open across midnight, where no foreground
    // transition ever fires.
    const interval = setInterval(() => {
      const today = currentDay();
      if (today !== lastDayRef.current) {
        lastDayRef.current = today;
        invalidateEvents();
      }
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [queryClient]);
}
