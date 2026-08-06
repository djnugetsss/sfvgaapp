import type Feather from '@expo/vector-icons/Feather';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

/**
 * Props handed to a custom `tabBar` renderer.
 *
 * Expo Router SDK 57 vendors React Navigation rather than depending on
 * `@react-navigation/bottom-tabs`, so we derive the type straight off the
 * `Tabs` component. That keeps us correct across router upgrades without a
 * deep import into `expo-router/build/...` or a second, skew-prone copy of
 * React Navigation in the dependency tree.
 */
export type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

/** Icon names available to the tab bar, narrowed to the Feather set. */
export type FeatherIconName = ComponentProps<typeof Feather>['name'];

/** The five Phase-1 tab routes, as file names under `app/(tabs)/`. */
export type TabRouteName = 'index' | 'events' | 'board' | 'youth' | 'more';

export type TabDefinition = {
  /** Must match the route file name inside `app/(tabs)/`. */
  readonly name: TabRouteName;
  /** Visible label in the tab bar. */
  readonly label: string;
  /** Longer label announced to screen readers. */
  readonly accessibilityLabel: string;
  readonly icon: FeatherIconName;
};
