import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';

import type { EventItem } from '@/types';

/**
 * Presentation helpers for events. Formatting only — no filtering, no status
 * logic (that lives in `@/utils/eventStatus`).
 */

/** Calendar key: `2026-08-23`. Matches react-native-calendars' date strings. */
export function toDayKey(iso: string): string {
  return format(parseISO(iso), 'yyyy-MM-dd');
}

/** `Sunday, Aug 23` — the long form used on cards and detail. */
export function formatEventDayLong(iso: string): string {
  return format(parseISO(iso), 'EEEE, MMM d');
}

/** `Aug 23` — the compact form for dense rows. */
export function formatEventDayShort(iso: string): string {
  return format(parseISO(iso), 'MMM d');
}

/** `August 2026` — month headings. */
export function formatMonthTitle(date: Date): string {
  return format(date, 'MMMM yyyy');
}

/**
 * Date-only countdown: `Today`, `Tomorrow`, `in 18 days`, `18 days ago`.
 *
 * Deliberately computed with `differenceInCalendarDays` rather than
 * `formatDistanceToNowStrict`. The strict formatter measures elapsed time, so
 * the same event reads "in 18 days" at breakfast and "in 17 days" that evening
 * — it drifts with the hour. Counting calendar-day boundaries keeps the number
 * stable all day, which is what a countdown is expected to do and what matches
 * the date-only comparisons in `getEventStatus`.
 */
export function formatCountdown(iso: string, now: Date = new Date()): string {
  const days = differenceInCalendarDays(startOfDay(parseISO(iso)), startOfDay(now));

  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Tomorrow';
  }
  if (days === -1) {
    return 'Yesterday';
  }
  if (days > 0) {
    return `in ${days} days`;
  }
  return `${Math.abs(days)} days ago`;
}

/**
 * Up to two initials for the typographic fallback tile, e.g. "Sanskriti
 * Divas" → "SD". Falls back to a single character rather than ever returning
 * an empty string, so the tile is never blank.
 */
export function eventInitials(title: string): string {
  const words = title
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((word) => word.length > 0);

  const initials = words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  return initials.length > 0 ? initials : title.trim().charAt(0).toUpperCase() || '•';
}

/**
 * The event's time range as a display string, or `null` when the times are
 * unknown or the event is all-day.
 *
 * Callers pass already-resolved values (placeholders stripped), so this only
 * decides how to join them.
 */
export function formatTimeRange(
  startTime: string | null,
  endTime: string | null,
): string | null {
  if (startTime !== null && endTime !== null) {
    return `${startTime} – ${endTime}`;
  }
  return startTime ?? endTime;
}

/** Sorts ascending by start date. Non-mutating. */
export function sortByStartDate<T extends { startDate: string }>(items: readonly T[]): T[] {
  return [...items].sort(
    (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
  );
}

/** True when the event's start date falls inside the given month. */
export function isInMonth(event: EventItem, month: Date): boolean {
  const start = parseISO(event.startDate);
  return (
    start.getFullYear() === month.getFullYear() && start.getMonth() === month.getMonth()
  );
}
