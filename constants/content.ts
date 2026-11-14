import type { EventCategory, ResourceKind } from '@/types/content';
import type { FeatherIconName, TabRouteName } from '@/types/navigation';
import type { EventStatus } from '@/utils/eventStatus';

/**
 * Screen chrome copy — headers, labels, and status messages.
 *
 * This is UI text, not content. Content (events, board members,
 * announcements) comes from `@/services` and never appears here or in a
 * component.
 */

/**
 * Board correspondence address. Belongs to the board as a body, not to any
 * individual member — which is why it is screen chrome rather than a field on
 * `BoardMember`, where it would imply eight copies of the same inbox.
 */
export const BOARD_CONTACT = {
  label: 'Board correspondence',
  email: 'sfvgabod@gmail.com',
} as const;

/** Shared loading and failure states. */
export const STATUS_COPY = {
  loading: 'Loading…',
  error: 'We couldn’t load this right now. Please try again later.',
} as const;

/**
 * Display labels for `EventCategory`. Keyed by the union so adding a category
 * to the domain type fails the build here until it has a label.
 */
export const CATEGORY_LABELS: Record<EventCategory, string> = {
  cultural: 'Cultural',
  social: 'Social',
  wellness: 'Wellness',
  youth: 'Youth',
  governance: 'Governance',
  religious: 'Religious',
};

/**
 * Labels for derived event status. Only past gets a visible tag — marking
 * every upcoming event "Upcoming" would be noise, since upcoming is the
 * default state of the calendar.
 */
export const STATUS_LABELS: Record<EventStatus, string | null> = {
  past: 'Completed',
  today: 'Today',
  upcoming: null,
};

/** Events screen and event detail. */
export const EVENTS_COPY = {
  scopeThisMonth: 'This month',
  scopeAllYear: 'All 2026',
  featuredEyebrow: 'Featured',
  /** Shown when a chosen month has no events — an invitation, not a dead end. */
  emptyMonth: {
    headline: 'Nothing scheduled this month',
    body: 'Switch to All 2026 to see the full year of gatherings.',
  },
  /** Shown when a single day is selected and holds no event. */
  emptyDay: {
    headline: 'No gathering on this day',
    body: 'Pick another date, or browse the months around it.',
  },
  clearDayFilter: 'Show the whole month',
  detail: {
    /** Forward-looking, not an apology, for events still being planned. */
    descriptionFallback: 'Details are still being finalised. Check back soon.',
    whenLabel: 'When',
    whereLabel: 'Where',
    locationFallback: 'Venue to be announced',
    viewOnWebsite: 'View on website',
    notFound: {
      headline: 'We couldn’t find that event',
      body: 'It may have been moved. Browse the full calendar to find it.',
    },
  },
} as const;

/** Home screen. */
export const HOME_COPY = {
  nextGathering: {
    eyebrow: 'Next gathering',
    /** When the whole calendar is behind us. */
    emptyHeadline: 'The year’s gatherings have wrapped',
    emptyBody: 'Next season’s calendar will appear here as soon as it’s set.',
  },
  featured: {
    eyebrow: 'Flagship celebration',
  },
  /**
   * The band under the hero. Only the alt text lives here — the artwork is
   * addressed by key from `@/constants/assets`.
   */
  banner: {
    alt: 'The SFVGA banner hung at an association gathering in the park',
  },
  announcements: {
    eyebrow: 'Announcements',
    emptyHeadline: 'News from the board lands here',
    emptyBody:
      'Invitations, reminders, and updates from the committee will appear on this screen first.',
  },
  browseAll: 'Browse all events',
} as const;

/**
 * More hub — the thali.
 *
 * `RESOURCE_DISPLAY` re-voices each resource as the thing a person gets
 * ("Read the by-laws") rather than the thing the system stores ("Association
 * By-Laws"), and pairs it with an icon. It is keyed by `ResourceKind`, so a
 * new kind fails the build here until it has a label.
 *
 * This is presentation, not content: the URL and the canonical label still
 * come from `@/services`, and a resource whose kind is unmapped falls back to
 * the label the data provides.
 */
export const RESOURCE_DISPLAY: Record<
  ResourceKind,
  { label: string; icon: FeatherIconName }
> = {
  mission: { label: 'Mission & roles', icon: 'compass' },
  membership: { label: 'Membership', icon: 'user-plus' },
  donation: { label: 'Support SFVGA', icon: 'heart' },
  bylaws: { label: 'Read the by‑laws', icon: 'file-text' },
  minutes: { label: 'Meeting minutes', icon: 'clipboard' },
  external: { label: 'Visit the website', icon: 'external-link' },
};

/**
 * The order the thali is served in, clockwise from the top. Membership leads
 * because it is the one action the association most wants a visitor to take —
 * and it is the segment that spends this screen's single kumkum allowance.
 */
export const RESOURCE_ORDER: readonly ResourceKind[] = [
  'membership',
  'donation',
  'minutes',
  'bylaws',
  'mission',
];

/**
 * Youth screen.
 *
 * **One intro, and only one.** The screen used to open with the scaffold
 * subtitle *and* a body paragraph beneath it, split by a rule. Two blocks of
 * prose saying much the same thing filled the top half of the page and pushed
 * the hours card — the reason the screen exists — off the first screen
 * entirely. The subtitle is now the whole introduction; there is no `intro`
 * field to add a second one back into. Anything more to say about the youth
 * belongs in the hours record this screen links to, not above it.
 *
 * What copy is here stays evergreen — no counts, no names, no year. Those live
 * in the linked record, which is maintained; anything restated here would go
 * stale the week after it shipped.
 */
export const YOUTH_COPY = {
  /** Alt text for the service photograph below the intro. */
  banner: {
    alt: 'SFVGA youth volunteers packing meals at a Valley food bank',
  },
  hours: {
    eyebrow: 'Volunteer hours',
    headline: 'Every hour, on the record',
    body: 'Hours are logged and kept current in the association’s shared record — the same one schools and scout troops ask for.',
    /** The primary action. Opens the record in the in-app browser. */
    action: 'View volunteer hours',
    /** Announced to screen readers so the destination is not a surprise. */
    actionHint: 'Opens the volunteer hours record',
    /** Shown in place of the button when no usable link exists yet. */
    unavailable:
      'The hours record is being prepared. It will open from here as soon as it is published.',
  },
  /** The secondary card under the hours record. */
  cpr: {
    eyebrow: 'Life skills',
    headline: 'CPR training',
    body: 'CPR training organized by SFVGA, equipping our youth with life-saving skills.',
    imageAlt: 'SFVGA youth practising CPR at an association training session',
    action: 'See the training photos',
    actionHint: 'Opens the CPR training photo album',
  },
} as const;

export const MORE_COPY = {
  emptyHeadline: 'The plate is still being set',
  emptyBody:
    'Membership, giving, and our governing documents will be linked here shortly.',
  /** Announced for the mark at the centre of the arrangement. */
  thaliLabel: 'SFVGA',
  /** The compartment for the in-app contact page, which has no resource row. */
  contact: { label: 'Contact & FAQ', icon: 'mail' as FeatherIconName },
  /** Back-control label on every page pushed from the thali. */
  backLabel: 'More',
} as const;

/* ------------------------------------------------------------------ *
 * Pages under More
 * ------------------------------------------------------------------ */

/** Membership — dues, how to pay, and online renewal. */
export const MEMBERSHIP_COPY = {
  eyebrow: 'Membership',
  title: 'Join & renew',
  subtitle:
    'Current members are asked to stay active and invite new families to enjoy the benefits.',
  dues: {
    eyebrow: 'Annual dues',
    title: 'Membership plans',
    /** Rendered before the board inbox, which is styled separately. */
    payVia: 'Pay dues via Zelle to',
  },
  join: {
    eyebrow: 'New members',
    body: 'New families, and members whose details have changed, apply through the full membership form on sfvga.org.',
    action: 'Apply on sfvga.org',
  },
  renew: {
    eyebrow: 'Existing members',
    title: 'Renew online',
    body: 'If you are an existing member and nothing about your family has changed, renew here.',
    nameLabel: 'Full name',
    emailLabel: 'Email',
    planLabel: 'Membership type',
    agreement: 'I have reviewed and agree to the SFVGA Association By-Laws and Terms & Conditions.',
    bylawsLink: 'Read the by-laws',
    submit: 'Submit renewal',
    submitHint: 'Opens your mail app with the renewal written out for you to send',
    errors: {
      name: 'Please enter your full name.',
      email: 'Please enter a valid email address.',
      plan: 'Please choose a membership type.',
      agreement: 'Please confirm you agree to the by-laws.',
    },
    /** Subject line of the composed email. `{name}` is replaced. */
    subject: 'Membership renewal — {name}',
  },
  done: {
    title: 'Almost there',
    body: 'Your renewal is written out in your mail app — press Send to deliver it to the board. Then complete your payment via Zelle to confirm your membership.',
    zelleTitle: 'Pay via Zelle',
    zelleBody: 'Zelle is available in your online banking app. Send your dues to',
    noMailApp:
      'We couldn’t open a mail app on this device. Please email your renewal to the address below, and pay via Zelle to the same address.',
    again: 'Start another renewal',
  },
  empty: {
    headline: 'Plans are being finalised',
    body: 'This year’s dues will be listed here as soon as the board confirms them.',
  },
} as const;

/** Contact & FAQ. */
export const CONTACT_COPY = {
  eyebrow: 'Contact',
  title: 'Get in touch',
  subtitle:
    'Review the questions below, and write to the board for membership and general inquiries.',
  form: {
    eyebrow: 'Write to the board',
    nameLabel: 'Name',
    emailLabel: 'Email',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Optional',
    messageLabel: 'Message',
    submit: 'Send message',
    submitHint: 'Opens your mail app with the message ready to send',
    defaultSubject: 'Message from the SFVGA app',
    errors: {
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      message: 'Please write a message.',
    },
  },
  done: {
    title: 'Ready to send',
    body: 'Your message is waiting in your mail app — press Send and the board will get back to you.',
    noMailApp:
      'We couldn’t open a mail app on this device. Please write to the board directly at',
    again: 'Write another message',
  },
  faq: {
    eyebrow: 'FAQs',
    title: 'Common questions',
  },
} as const;

/** Mission & roles. */
export const ABOUT_COPY = {
  eyebrow: 'Our association',
  title: 'Mission & roles',
  subtitle: 'Why SFVGA exists, how it carries that out, and who does what.',
  mission: {
    eyebrow: 'Mission',
    title: 'Our mission',
    pointsTitle: 'How SFVGA accomplishes its mission',
  },
  boardRoles: {
    eyebrow: 'Governance',
    title: 'Board roles',
    body: 'Board members are elected annually, each with defined responsibilities.',
  },
  committeeRoles: {
    eyebrow: 'Events',
    title: 'Event committee roles',
    body: 'Every event is run by a committee of members, each in one of these roles.',
  },
  join: 'Become a member',
  empty: {
    headline: 'This page is being written',
    body: 'The mission and role descriptions will appear here shortly.',
  },
} as const;

/** Meeting minutes, AGMs, and by-laws. */
export const RECORDS_COPY = {
  eyebrow: 'Governance',
  title: 'Records',
  subtitle: 'Official meeting minutes, annual general meeting records, and the association by-laws.',
  groups: {
    minutes: 'Board meeting minutes',
    agm: 'Annual general meetings',
  },
  open: 'Open',
  archive: 'View the full archive',
  archiveUrl: 'https://sfvga.org/board/meeting-minutes-archive',
  bylaws: {
    eyebrow: 'By-laws',
    title: 'Governance & by-laws',
    body: 'The association’s by-laws set out how SFVGA is run. Every member agrees to them on joining.',
    action: 'Read the by-laws',
  },
  empty: {
    headline: 'No records published yet',
    body: 'Minutes are added here after each board meeting is approved.',
  },
} as const;

/** The extended-leadership section beneath the board. */
export const LEADERSHIP_COPY = {
  eyebrow: 'Champions',
  title: 'Extended leadership',
  body: 'Community members who support SFVGA’s mission through their specialized roles.',
} as const;

/** Home's Community Moments band. */
export const GALLERY_COPY = {
  eyebrow: 'Community moments',
  alt: 'Photographs from SFVGA gatherings',
} as const;
export type ScreenCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly empty: {
    readonly headline: string;
    readonly body: string;
  };
};

export const SCREEN_COPY: Record<TabRouteName, ScreenCopy> = {
  index: {
    eyebrow: 'San Fernando Valley Gujarati Association',
    title: 'Welcome home.',
    subtitle:
      'One place for the gatherings, people, and traditions that hold our community together across the Valley.',
    empty: {
      headline: 'Your feed is being prepared',
      body: 'Announcements, upcoming gatherings, and community highlights will appear here.',
    },
  },
  events: {
    eyebrow: 'Gatherings',
    title: 'Events',
    subtitle:
      'Garba nights, Diwali celebrations, picnics, and the small get-togethers in between.',
    empty: {
      headline: 'No events scheduled yet',
      body: 'When the committee publishes the season calendar, every date lands here first.',
    },
  },
  board: {
    eyebrow: 'Leadership',
    title: 'The Board',
    subtitle:
      'The volunteers who plan the year, steward the funds, and answer the phone at 9pm.',
    empty: {
      headline: 'Board directory coming soon',
      body: 'Roles, terms, and the best way to reach each member will be listed here.',
    },
  },
  youth: {
    eyebrow: 'Next generation',
    title: 'Youth',
    /**
     * Youth's *only* prose. Held to two lines on a standard device, because
     * everything below it — the photograph and the hours card — has to fit on
     * the first screen. See the note on `YOUTH_COPY`.
     */
    subtitle:
      'The young volunteers who show up early, stay late, and carry this association.',
    empty: {
      headline: 'Programs are taking shape',
      body: 'Sign-ups, practice schedules, and volunteer opportunities will be published here.',
    },
  },
  more: {
    eyebrow: 'Association',
    title: 'More',
    subtitle:
      'Membership, donations, our history, and the ways to get in touch with us.',
    empty: {
      headline: 'Nothing here yet',
      body: 'Links to membership, giving, and contact details are arriving in the next release.',
    },
  },
};
