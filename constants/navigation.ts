import type { TabDefinition } from '@/types/navigation';

/**
 * The tab bar's source of truth. `app/(tabs)/_layout.tsx` renders one
 * `<Tabs.Screen>` per entry and `AnimatedTabBar` lays them out in this order,
 * so the two can never drift apart.
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
    accessibilityLabel: 'Events and gatherings',
    icon: 'calendar',
  },
  {
    name: 'board',
    label: 'Board',
    accessibilityLabel: 'Board and leadership',
    icon: 'users',
  },
  {
    name: 'youth',
    label: 'Youth',
    accessibilityLabel: 'Youth programs',
    icon: 'sunrise',
  },
  {
    name: 'more',
    label: 'More',
    accessibilityLabel: 'More options',
    icon: 'more-horizontal',
  },
] as const;
