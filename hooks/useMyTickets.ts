import type { TicketSections } from '@/types/ticket';

const NONE: TicketSections = { upcoming: [], past: [] };

/**
 * The tickets the signed-in member holds.
 *
 * This app has no accounts, registration or payment backend, so there are no
 * tickets to show and this returns the empty set. It is the one seam to
 * replace when registration is built: return grouped tickets and the Tickets
 * tab renders them with no other change.
 */
export function useMyTickets(): { data: TicketSections; isLoading: false } {
  return { data: NONE, isLoading: false };
}
