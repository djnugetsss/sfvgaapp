import { isAfter, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';

import type { EventItem } from '@/types';

/**
 * Time-status for an event, derived at runtime.
 *
 * This is deliberately NOT stored in the seed JSON. A stored flag is wrong the
 * moment the clock advances past it — an event marked "upcoming" in the data
 * would still claim to be upcoming the day after it happened. Deriving it from
 * `now` means it is correct by construction, forever, with no migration.
 *
 * It is a *display* state, not a filter. Every query still returns every
 * event; this only tells the UI how to present each one.
 */
export type EventStatus = 'past' | 'today' | 'upcoming';

/** An event paired with its derived status, ready for rendering. */
export type EventWithStatus = {
  event: EventItem;
  status: EventStatus;
};

/**
 * Classifies an event as past, today, or upcoming.
 *
 * All comparisons are **date-only**: the times are normalised to midnight
 * before comparing, so an event happening later today reads `'today'` rather
 * than `'past'`, and one that started this morning does too. Time-of-day is
 * ignored entirely — which is also why the unfilled `startTime` markers in the
 * seed data cannot affect the result.
 *
 * Multi-day events use `endDate` as the boundary, so a festival that began
 * yesterday and runs through tomorrow reads `'today'`. An event is only
 * `'past'` once its **end** date has fully passed.
 *
 * @param event The event to classify.
 * @param now Injectable clock. Defaults to the current time; pass an explicit
 * date in tests so results do not drift with the calendar.
 */
export function getEventStatus(event: EventItem, now: Date = new Date()): EventStatus {
  const today = startOfDay(now);
  const start = startOfDay(parseISO(event.startDate));
  // A null endDate means a single-day event: it ends the day it starts.
  const end = startOfDay(parseISO(event.endDate ?? event.startDate));

  // Landing on either boundary is "today" — covers single-day events and the
  // first and last day of a multi-day run.
  if (isSameDay(today, start) || isSameDay(today, end)) {
    return 'today';
  }

  if (isBefore(end, today)) {
    return 'past';
  }

  if (isAfter(start, today)) {
    return 'upcoming';
  }

  // Neither before the end nor after the start: today falls inside a
  // multi-day span.
  return 'today';
}

/** Pairs each event with its derived status, preserving the input order. */
export function withEventStatus(
  events: readonly EventItem[],
  now: Date = new Date(),
): EventWithStatus[] {
  return events.map((event) => ({ event, status: getEventStatus(event, now) }));
}

/**
 * The event a member most likely cares about next: the earliest one that has
 * not finished. An event happening *today* wins over a later one — "next" to
 * someone opening the app this morning means tonight's garba, not next month.
 *
 * Expects `events` already sorted ascending by `startDate`, which is the
 * `ContentRepository` ordering contract.
 *
 * @returns The event, or `null` when the whole calendar is in the past.
 */
export function findNextUpcomingEvent(
  events: readonly EventItem[],
  now: Date = new Date(),
): EventItem | null {
  return events.find((event) => getEventStatus(event, now) !== 'past') ?? null;
}
