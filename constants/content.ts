import type { FeatherIconName } from '@/types/navigation';

/**
 * Screen chrome copy — headers, labels, and status messages.
 *
 * This is UI text, not content. Content (events, board members,
 * announcements, dues, roles) comes from `@/services` and never appears here
 * or in a component. The wording below is the Base44 web app's, screen by
 * screen.
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

/** The header every tab shares. */
export const HEADER_COPY = {
  name: 'San Fernando Valley Gujarati Association',
  logoLabel: 'SFVGA — San Fernando Valley Gujarati Association',
  notifications: 'Notifications',
  notificationsHint: 'Opens the latest updates from the board',
  viewAll: 'View all updates',
  close: 'Close',
  back: 'Back',
} as const;

/** Home screen. */
export const HOME_COPY = {
  community: {
    eyebrow: 'Our Community',
    body: 'One place for the gatherings, people, and traditions that hold our community together across the San Fernando Valley.',
    imageAlt: 'SFVGA members at an association gathering',
  },
  upcoming: {
    eyebrow: 'Upcoming Event',
    action: 'Register & View Details',
    emptyHeadline: 'The calendar is being set',
    emptyBody: 'The next event will appear here as soon as the board confirms it.',
  },
  updates: {
    eyebrow: 'Latest Updates',
    title: 'Membership 2026 Open',
    body: 'Renew your membership or invite new members to join our vibrant community.',
    action: 'Renew Membership',
  },
  moments: {
    eyebrow: 'Community Moments',
    alt: 'Photographs from SFVGA gatherings',
    previous: 'Previous photo',
    next: 'Next photo',
  },
} as const;

/** Events list and event detail. */
export const EVENTS_COPY = {
  viewDetails: 'View Details',
  /** Detail-page venue when an event names no town. */
  fallbackLocation: 'San Fernando Valley',
  empty: {
    headline: 'No events listed yet',
    body: 'When the committee publishes the season’s programmes, they land here first.',
  },
  notFound: {
    headline: 'Event not found',
    body: 'This event is no longer listed. Browse all upcoming events instead.',
    action: 'Back to all events',
  },
} as const;

/** Members tab — dues, renewal and the Youth Corner. */
export const MEMBERS_COPY = {
  resources: {
    eyebrow: 'Member Resources',
    /** Followed by the board inbox, which is styled separately. */
    intro:
      'Current members are requested to be active and invite new members to enjoy the benefits. Membership dues via Zelle to',
    empty: 'This year’s dues will be listed here as soon as the board confirms them.',
  },
  renewal: {
    icon: 'refresh-cw' as FeatherIconName,
    title: 'Membership Renewal',
    body: 'Review the terms and conditions and renew your membership online.',
    action: 'Renew Membership',
  },
  youth: {
    eyebrow: 'Youth Corner',
    body: 'SFVGA’s youth initiatives build leadership, community service, and life skills.',
    cpr: {
      title: 'CPR Training',
      body: 'CPR training organized by SFVGA, equipping our youth with life-saving skills.',
      imageAlt: 'SFVGA youth CPR training',
      action: 'CPR Training Pictures',
      actionHint: 'Opens the CPR training photo album',
    },
    hours: {
      title: 'Volunteer Hours',
      body: 'Track community service hours contributed by SFVGA youth members.',
      imageAlt: 'SFVGA volunteer hours',
      action: 'Review Volunteer Hours Log',
      actionHint: 'Opens the volunteer hours record',
    },
  },
} as const;

/** Membership renewal form (pushed from the Members tab). */
export const MEMBERSHIP_COPY = {
  renew: {
    eyebrow: 'Renew Membership',
    /** The sentence before the apply link. */
    intro:
      'Renew your membership below if you are an existing member and there is no change to your information. New members and members with updates please',
    applyLink: 'click here to apply on the sfvga.org website',
    nameLabel: 'Full Name',
    emailLabel: 'Email',
    planLabel: 'Membership type',
    agreement:
      'I have reviewed and agree to the SFVGA Association By-Laws and Terms & Conditions.',
    bylawsLink: 'Read the by-laws',
    submit: 'Submit Renewal',
    submitHint: 'Opens your mail app with the renewal written out for you to send',
    errors: {
      name: 'Please enter your full name.',
      email: 'Please enter a valid email address.',
      plan: 'Please choose a membership type.',
      agreement: 'Please confirm you agree to the by-laws.',
    },
    /** Subject line of the composed email. `{name}` is replaced. */
    subject: 'Membership renewal: {name}',
  },
  done: {
    title: 'Thank you for renewing!',
    body: 'Your renewal is written out in your mail app. Press Send to deliver it to the board, then complete your payment via Zelle to confirm your membership.',
    zelleTitle: 'Pay via Zelle',
    zelleBody: 'Zelle is available in your online banking app. Send your dues to',
    noMailApp:
      'We couldn’t open a mail app on this device. Please email your renewal to the address below, and pay via Zelle to the same address.',
    again: 'Start another renewal',
    back: 'Back to Members',
  },
} as const;

/** Contact tab. */
export const CONTACT_COPY = {
  eyebrow: 'Contact',
  intro: 'Review the FAQ below and contact us for membership & general inquiries.',
  form: {
    nameLabel: 'Name',
    emailLabel: 'Email',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Optional',
    messageLabel: 'Message',
    submit: 'Send Message',
    submitHint: 'Opens your mail app with the message ready to send',
    defaultSubject: 'Message from the SFVGA app',
    errors: {
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      message: 'Please write a message.',
    },
  },
  done: {
    title: 'Thank you!',
    body: 'Your message is waiting in your mail app. Press Send and the board will get back to you shortly.',
    noMailApp:
      'We couldn’t open a mail app on this device. Please write to the board directly at',
    again: 'Send another message',
  },
  faq: {
    eyebrow: 'FAQs',
    title: 'Common Questions',
  },
  board: {
    eyebrow: 'Leadership',
    title: 'Board of Directors',
    body: 'The volunteers who plan the year, steward the funds, and answer the phone at 9pm.',
    empty: 'The board directory will be listed here shortly.',
  },
  extended: {
    eyebrow: 'Champions',
    title: 'Extended Leadership',
    body: 'Dedicated community members who support SFVGA’s mission through their specialized roles.',
  },
} as const;

/** Tickets tab — the wallet layout from the Codex build. */
export const TICKETS_COPY = {
  title: 'My tickets',
  segments: [
    { value: 'upcoming', label: 'Upcoming', accessibilityLabel: 'Upcoming tickets' },
    { value: 'past', label: 'Past', accessibilityLabel: 'Past tickets' },
  ] as const,
  empty: {
    upcoming: 'Approved tickets will appear here. Check your event for registration status.',
    past: 'Past event tickets will appear here.',
  },
  emptyTitle: 'No tickets yet',
  browse: 'Browse Events',
  status: {
    valid: 'Ready',
    redeemed: 'Checked In',
    revoked: 'No longer valid',
    past: 'Past event',
  },
  hint: { open: 'Tap to view QR', past: 'View ticket history', revoked: 'This ticket is no longer valid' },
} as const;

/** Community notes (announcements feed) on Home and its full list. */
export const NOTES_COPY = {
  eyebrow: 'Community Notes',
  seeAll: 'See all',
  listTitle: 'Community Notes',
  empty: { title: 'No community notes yet', body: 'Updates will appear here.' },
} as const;

/** Privacy & help rows at the foot of More. */
export const LEGAL_COPY = {
  eyebrow: 'Privacy & Help',
  site: 'https://sfvga-cabe6.web.app',
  links: [
    { label: 'Privacy notice', path: '/privacy.html' },
    { label: 'Terms of use', path: '/terms.html' },
  ] as const,
} as const;

/** More tab — mission, roles, minutes and by-laws on one page. */
export const MORE_COPY = {
  eyebrow: 'Association',
  title: 'More',
  subtitle: 'Our mission, the people behind it, governance records, and how to get in touch.',
  /** The four quick-link tiles, in order. `id` is also the section's anchor. */
  sections: [
    { id: 'mission', label: 'Mission', icon: 'compass' },
    { id: 'roles', label: 'Roles', icon: 'users' },
    { id: 'minutes', label: 'Meeting Minutes', icon: 'clipboard' },
    { id: 'bylaws', label: 'By Laws', icon: 'file-text' },
    { id: 'contact', label: 'Contact', icon: 'phone' },
    { id: 'legal', label: 'Privacy & Help', icon: 'shield' },
  ] as readonly { id: SectionId; label: string; icon: FeatherIconName }[],
  mission: {
    title: 'Our Mission',
    pointsTitle: 'How SFVGA Accomplishes Its Mission',
    join: 'Become a Member',
  },
  roles: {
    title: 'Board Roles & Responsibilities',
    body: 'Seven board members are elected annually, each with defined responsibilities.',
    committeeTitle: 'Event Committee Roles',
  },
  minutes: {
    title: 'Board Meeting Minutes',
    body: 'Official meeting minutes and annual general meeting records.',
    groups: {
      minutes: 'Meeting Minutes',
      agm: 'AGM',
    },
    open: 'View',
    archive: 'View Archives',
    archiveUrl: 'https://sfvga.org/board/meeting-minutes-archive',
  },
  bylaws: {
    title: 'Governance & By-Laws',
    body: 'Association by-laws and governance details are available for review.',
    action: 'Download By-Laws',
  },
  empty: 'This section will be filled in shortly.',
} as const;

export type SectionId = 'mission' | 'roles' | 'minutes' | 'bylaws' | 'contact' | 'legal';
