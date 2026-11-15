import type { TabDefinition } from '@/types/navigation';

/**
 * The tab bar's source of truth. `app/(tabs)/_layout.tsx` renders one
 * `<Tabs.Screen>` per entry and `AnimatedTabBar` lays them out in this order,
 * so the two can never drift apart.
 *
 * Home, Events, Tickets, Members and More. Contact lives inside More.
 */
export const TABS: readonly TabDefinition[] = [
  {
    name: 'index',
    label: 'Home',
    accessibilityLabel: 'Home',
    icon: 'home',
  },
  {
    name: 'events',
    label: 'Events',
    accessibilityLabel: 'Events and programmes',
    icon: 'calendar',
  },
  {
    name: 'tickets',
    label: 'Tickets',
    accessibilityLabel: 'My tickets',
    icon: 'tag',
  },
  {
    name: 'members',
    label: 'Members',
    accessibilityLabel: 'Members: dues, renewal and youth corner',
    icon: 'user-plus',
  },
  {
    name: 'more',
    label: 'More',
    accessibilityLabel: 'More: mission, roles, minutes, by-laws and contact',
    icon: 'menu',
  },
] as const;
