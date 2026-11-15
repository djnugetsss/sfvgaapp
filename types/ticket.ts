/** A member's ticket. Mirrors the Codex build's ticket shape; nothing in this app issues one yet. */
export type TicketStatus = 'valid' | 'redeemed' | 'revoked';

export type Ticket = {
  id: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  status: TicketStatus;
  /** Display text for the event date, e.g. "October 17, 2026". */
  eventDateLabel: string | null;
};

export type TicketGroup = {
  eventId: string;
  eventTitle: string;
  eventDateLabel: string | null;
  tickets: Ticket[];
};

export type TicketSections = { upcoming: TicketGroup[]; past: TicketGroup[] };
