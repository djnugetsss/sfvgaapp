import { compareAsc, isBefore, parseISO, startOfDay } from 'date-fns';

import type { ContentRepository } from '@/services/ContentRepository';
import {
  parseAnnouncement,
  parseBoardMember,
  parseCollection,
  parseEventItem,
  parseFaq,
  parseGalleryPhoto,
  parseGovernanceRecord,
  parseLeader,
  parseMembershipPlan,
  parseMissionEntry,
  parseResource,
  parseRoleDescription,
  parseYouthItem,
} from '@/services/parsers';
import { SEED_COLLECTIONS } from '@/services/seedCollections';
import announcementsJson from '@/services/seed/announcements.json';
import boardJson from '@/services/seed/board.json';
import eventsJson from '@/services/seed/events.json';
import resourcesJson from '@/services/seed/resources.json';
import youthJson from '@/services/seed/youth.json';
import type {
  Announcement,
  BoardMember,
  EventItem,
  Faq,
  GalleryPhoto,
  GovernanceRecord,
  Leader,
  MembershipPlan,
  MissionEntry,
  Resource,
  RoleDescription,
  YouthItem,
} from '@/types';
import { byOrder, byRoleOrder } from '@/utils/order';

/**
 * `ContentRepository` backed by JSON bundled with the app.
 *
 * Two deliberate choices keep this behaviourally identical to the Firestore
 * implementation that replaces it:
 *
 * 1. Every method is genuinely async and yields to the event loop, so callers
 *    that would break on a real network round-trip break here too, in
 *    development, rather than in production.
 * 2. Parsing happens per call, not once at module load. A Firestore read
 *    validates each response; so does this. It also means a parse failure
 *    surfaces through the same rejected-promise path React Query already
 *    handles, instead of throwing during app startup.
 *
 * Note on seed content: unfilled fields carry the literal marker
 * "TODO: fill from sourceUrl" (events) or "TODO: rehost headshot" (board).
 * These are values, not nulls, precisely so they are greppable and so a
 * half-populated record cannot masquerade as a complete one.
 *
 * TODO: confirm a dedicated donate URL — `resources.json` currently points the
 * `donation` entry at the membership page, which is the only giving link the
 * association publishes today.
 *
 * TODO: confirm final public/published sheet URL before release for the
 * `youth-hours` resource — the seed carries a Google Sheets `/edit` link, which
 * may error in a mobile in-app browser for anyone without edit access. A
 * Publish-to-web or preview URL is more robust.
 */
export class JsonContentRepository implements ContentRepository {
  /**
   * Simulated latency. Non-zero so a caller that renders without a loading
   * state shows the flicker now, while it is cheap to fix.
   */
  private static readonly LATENCY_MS = 60;

  private async delay(): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, JsonContentRepository.LATENCY_MS);
    });
  }

  private async loadEvents(): Promise<EventItem[]> {
    await this.delay();
    const events = parseCollection(eventsJson, parseEventItem, 'events');
    return events.sort((a, b) =>
      compareAsc(parseISO(a.startDate), parseISO(b.startDate)),
    );
  }

  async getEvents(): Promise<EventItem[]> {
    return this.loadEvents();
  }

  async getEventById(id: string): Promise<EventItem | null> {
    const events = await this.loadEvents();
    return events.find((event) => event.id === id) ?? null;
  }

  async getFeaturedEvent(): Promise<EventItem | null> {
    const events = await this.loadEvents();
    // Already sorted ascending, so `find` yields the earliest flagged event —
    // a deterministic winner if the data ever flags more than one.
    return events.find((event) => event.isFeatured) ?? null;
  }

  async getUpcomingEvents(fromISO: string): Promise<EventItem[]> {
    const events = await this.loadEvents();
    // Compare on calendar-day boundaries: an event earlier today is still
    // "upcoming" to a member checking the app that afternoon.
    const cutoff = startOfDay(parseISO(fromISO));

    return events.filter(
      (event) => !isBefore(startOfDay(parseISO(event.startDate)), cutoff),
    );
  }

  async getBoardMembers(): Promise<BoardMember[]> {
    await this.delay();
    const members = parseCollection(boardJson, parseBoardMember, 'board');
    return members.sort((a, b) => a.roleOrder - b.roleOrder);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    await this.delay();
    const announcements = parseCollection(
      announcementsJson,
      parseAnnouncement,
      'announcements',
    );

    return announcements.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      // Newest first within each pinned group.
      return compareAsc(parseISO(b.date), parseISO(a.date));
    });
  }

  async getYouthItems(): Promise<YouthItem[]> {
    await this.delay();
    return parseCollection(youthJson, parseYouthItem, 'youth');
  }

  async getResources(): Promise<Resource[]> {
    await this.delay();
    return parseCollection(resourcesJson, parseResource, 'resources');
  }

  async getLeadership(): Promise<Leader[]> {
    await this.delay();
    return parseCollection(
      SEED_COLLECTIONS.leadership,
      parseLeader,
      'leadership',
    ).sort(byRoleOrder);
  }

  async getMembershipPlans(): Promise<MembershipPlan[]> {
    await this.delay();
    return parseCollection(
      SEED_COLLECTIONS.membershipPlans,
      parseMembershipPlan,
      'membershipPlans',
    ).sort(byOrder);
  }

  async getFaqs(): Promise<Faq[]> {
    await this.delay();
    return parseCollection(SEED_COLLECTIONS.faqs, parseFaq, 'faqs').sort(byOrder);
  }

  async getMission(): Promise<MissionEntry[]> {
    await this.delay();
    return parseCollection(
      SEED_COLLECTIONS.mission,
      parseMissionEntry,
      'mission',
    ).sort(byOrder);
  }

  async getRoles(): Promise<RoleDescription[]> {
    await this.delay();
    return parseCollection(
      SEED_COLLECTIONS.roles,
      parseRoleDescription,
      'roles',
    ).sort(byOrder);
  }

  async getGovernanceRecords(): Promise<GovernanceRecord[]> {
    await this.delay();
    return parseCollection(
      SEED_COLLECTIONS.records,
      parseGovernanceRecord,
      'records',
    ).sort(byOrder);
  }

  async getGallery(): Promise<GalleryPhoto[]> {
    await this.delay();
    return parseCollection(
      SEED_COLLECTIONS.gallery,
      parseGalleryPhoto,
      'gallery',
    ).sort(byOrder);
  }
}
