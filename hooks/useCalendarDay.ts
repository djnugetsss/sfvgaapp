import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** How often to re-check the date while the app is foregrounded. */
const TICK_MS = 60 * 1000;

const currentDay = (): string => format(new Date(), 'yyyy-MM-dd');

/**
 * Today's calendar day as `yyyy-MM-dd`, kept live.
 *
 * This exists to make derived event status re-render when the date rolls over.
 * Computing `new Date()` inline during render is not enough: without a state
 * change nothing re-renders, so an app left open overnight would keep showing
 * yesterday's "today" highlight and stale past/upcoming classifications.
 *
 * Updates on two triggers:
 * - returning to the foreground (the common case — the phone was locked), and
 * - a one-minute tick, which covers the app being watched across midnight.
 *
 * The tick is cheap: it compares two short strings and only calls `setState`
 * when the day actually changes, so it causes at most one re-render per day.
 */
export function useCalendarDay(): string {
  const [day, setDay] = useState(currentDay);

  useEffect(() => {
    const sync = () => {
      const next = currentDay();
      // Only commit on a real change — `setState` with an equal string would
      // still bail out, but this keeps the intent obvious.
      setDay((previous) => (previous === next ? previous : next));
    };

    const interval = setInterval(sync, TICK_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sync();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return day;
}
