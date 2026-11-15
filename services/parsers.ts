import { isValid, parseISO } from 'date-fns';

import {
  MISSION_ENTRY_KINDS,
  RECORD_GROUPS,
  RESOURCE_KINDS,
  ROLE_SCOPES,
  type Announcement,
  type BoardMember,
  type EventItem,
  type Faq,
  type GalleryPhoto,
  type GovernanceRecord,
  type Leader,
  type MembershipPlan,
  type MissionEntry,
  type MissionEntryKind,
  type RecordGroup,
  type Resource,
  type ResourceKind,
  type RoleDescription,
  type RoleScope,
  type YouthItem,
} from '@/types';

/**
 * Runtime parsing and validation — the "edge" of the data layer.
 *
 * Everything entering the app passes through here, whether it came from a
 * bundled JSON file or (later) a Firestore document. A raw JSON import is
 * typed as loosely as `string` where the domain wants `'cultural' | 'social'`,
 * so a cast alone would be a lie; these parsers actually check.
 *
 * Failures throw rather than silently coercing. Bad content should surface
 * loudly in development, not render as a blank row in production. When
 * Firestore arrives, a malformed document fails in exactly this same place.
 */

export class ContentParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentParseError';
  }
}

/* ------------------------------------------------------------------ *
 * Primitive readers
 * ------------------------------------------------------------------ */

const asRecord = (value: unknown, context: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ContentParseError(`${context}: expected an object.`);
  }
  return value as Record<string, unknown>;
};

const readString = (
  source: Record<string, unknown>,
  key: string,
  context: string,
): string => {
  const value = source[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new ContentParseError(`${context}: "${key}" must be a non-empty string.`);
  }
  return value;
};

/**
 * Reads `string | null`. A missing key is treated as `null` so a backend that
 * omits empty fields (Firestore does) parses the same as one that writes an
 * explicit null (our JSON does).
 */
const readNullableString = (
  source: Record<string, unknown>,
  key: string,
  context: string,
): string | null => {
  const value = source[key];
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new ContentParseError(`${context}: "${key}" must be a string or null.`);
  }
  return value;
};

const readBoolean = (
  source: Record<string, unknown>,
  key: string,
  context: string,
): boolean => {
  const value = source[key];
  if (typeof value !== 'boolean') {
    throw new ContentParseError(`${context}: "${key}" must be a boolean.`);
  }
  return value;
};

const readNumber = (
  source: Record<string, unknown>,
  key: string,
  context: string,
): number => {
  const value = source[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ContentParseError(`${context}: "${key}" must be a finite number.`);
  }
  return value;
};

/**
 * Reads an ISO-8601 date string and proves it actually parses.
 *
 * The value is returned as the original string, not a `Date` — domain types
 * carry ISO strings end to end. This validates without converting.
 */
const readISODate = (
  source: Record<string, unknown>,
  key: string,
  context: string,
): string => {
  const value = readString(source, key, context);
  if (!isValid(parseISO(value))) {
    throw new ContentParseError(
      `${context}: "${key}" must be an ISO-8601 date, received "${value}".`,
    );
  }
  return value;
};

/**
 * Reads a non-empty array of non-empty strings — a role's responsibilities.
 * An empty list is rejected: a role with nothing under it is a half-entered
 * document, and should be named in a warning rather than render as a bare title.
 */
const readStringArray = (
  source: Record<string, unknown>,
  key: string,
  context: string,
): string[] => {
  const value = source[key];
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((item) => typeof item === 'string' && item.length > 0)
  ) {
    throw new ContentParseError(
      `${context}: "${key}" must be a non-empty array of non-empty strings.`,
    );
  }
  return value as string[];
};

/** Narrows a string to one of a fixed set of literals. */
const readUnion = <T extends string>(
  source: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
  context: string,
): T => {
  const value = readString(source, key, context);
  const match = allowed.find((candidate) => candidate === value);
  if (match === undefined) {
    throw new ContentParseError(
      `${context}: "${key}" must be one of ${allowed.join(' | ')}, received "${value}".`,
    );
  }
  return match;
};

/* ------------------------------------------------------------------ *
 * Domain parsers
 * ------------------------------------------------------------------ */

export const parseEventItem = (input: unknown, index: number): EventItem => {
  const context = `events[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    title: readString(raw, 'title', context),
    tag: readString(raw, 'tag', context),
    description: readString(raw, 'description', context),
    teaser: readNullableString(raw, 'teaser', context),
    dateLabel: readString(raw, 'dateLabel', context),
    location: readNullableString(raw, 'location', context),
    heroImage: readNullableString(raw, 'heroImage', context),
    isFeatured: readBoolean(raw, 'isFeatured', context),
    order: readNumber(raw, 'order', context),
  };
};

export const parseBoardMember = (input: unknown, index: number): BoardMember => {
  const context = `board[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    name: readString(raw, 'name', context),
    role: readString(raw, 'role', context),
    roleOrder: readNumber(raw, 'roleOrder', context),
    photo: readNullableString(raw, 'photo', context),
    email: readNullableString(raw, 'email', context),
    bio: readNullableString(raw, 'bio', context),
  };
};

export const parseAnnouncement = (input: unknown, index: number): Announcement => {
  const context = `announcements[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    title: readString(raw, 'title', context),
    body: readString(raw, 'body', context),
    date: readISODate(raw, 'date', context),
    linkUrl: readNullableString(raw, 'linkUrl', context),
    pinned: readBoolean(raw, 'pinned', context),
  };
};

export const parseYouthItem = (input: unknown, index: number): YouthItem => {
  const context = `youth[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    title: readString(raw, 'title', context),
    body: readNullableString(raw, 'body', context),
  };
};

export const parseResource = (input: unknown, index: number): Resource => {
  const context = `resources[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    label: readString(raw, 'label', context),
    url: readString(raw, 'url', context),
    kind: readUnion<ResourceKind>(raw, 'kind', RESOURCE_KINDS, context),
  };
};

/** Extended leadership — the same shape, and so the same checks, as the board. */
export const parseLeader = (input: unknown, index: number): Leader => {
  const context = `leadership[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    name: readString(raw, 'name', context),
    role: readString(raw, 'role', context),
    roleOrder: readNumber(raw, 'roleOrder', context),
    photo: readNullableString(raw, 'photo', context),
    email: readNullableString(raw, 'email', context),
    bio: readNullableString(raw, 'bio', context),
  };
};

export const parseMembershipPlan = (
  input: unknown,
  index: number,
): MembershipPlan => {
  const context = `membershipPlans[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    name: readString(raw, 'name', context),
    price: readNumber(raw, 'price', context),
    note: readNullableString(raw, 'note', context),
    renewable: readBoolean(raw, 'renewable', context),
    order: readNumber(raw, 'order', context),
  };
};

export const parseFaq = (input: unknown, index: number): Faq => {
  const context = `faqs[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    question: readString(raw, 'question', context),
    answer: readString(raw, 'answer', context),
    order: readNumber(raw, 'order', context),
  };
};

export const parseMissionEntry = (
  input: unknown,
  index: number,
): MissionEntry => {
  const context = `mission[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    kind: readUnion<MissionEntryKind>(raw, 'kind', MISSION_ENTRY_KINDS, context),
    text: readString(raw, 'text', context),
    order: readNumber(raw, 'order', context),
  };
};

export const parseRoleDescription = (
  input: unknown,
  index: number,
): RoleDescription => {
  const context = `roles[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    title: readString(raw, 'title', context),
    scope: readUnion<RoleScope>(raw, 'scope', ROLE_SCOPES, context),
    responsibilities: readStringArray(raw, 'responsibilities', context),
    order: readNumber(raw, 'order', context),
  };
};

export const parseGovernanceRecord = (
  input: unknown,
  index: number,
): GovernanceRecord => {
  const context = `records[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    label: readString(raw, 'label', context),
    url: readString(raw, 'url', context),
    group: readUnion<RecordGroup>(raw, 'group', RECORD_GROUPS, context),
    order: readNumber(raw, 'order', context),
  };
};

export const parseGalleryPhoto = (
  input: unknown,
  index: number,
): GalleryPhoto => {
  const context = `gallery[${index}]`;
  const raw = asRecord(input, context);

  return {
    id: readString(raw, 'id', context),
    image: readString(raw, 'image', context),
    caption: readNullableString(raw, 'caption', context),
    order: readNumber(raw, 'order', context),
  };
};

/** Applies an item parser across an array from an untrusted source. */
export const parseCollection = <T>(
  input: unknown,
  parseItem: (item: unknown, index: number) => T,
  context: string,
): T[] => {
  if (!Array.isArray(input)) {
    throw new ContentParseError(`${context}: expected an array.`);
  }
  return input.map(parseItem);
};
