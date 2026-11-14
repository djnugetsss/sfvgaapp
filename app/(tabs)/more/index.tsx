import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import {
  ThaliArrangement,
  type ThaliItem,
} from '@/components/more/ThaliArrangement';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import {
  MORE_COPY,
  RESOURCE_DISPLAY,
  RESOURCE_ORDER,
  SCREEN_COPY,
  STATUS_COPY,
} from '@/constants/content';
import { useOpenLink } from '@/hooks/useOpenLink';
import { SCREEN_OWNED_RESOURCE_IDS, useResources } from '@/services';
import { useTheme } from '@/theme';
import type { Resource, ResourceKind } from '@/types';
import { resolveContent } from '@/utils/content';

const copy = SCREEN_COPY.more;

/**
 * Compartments that open a page inside the app rather than a website.
 *
 * Membership, the mission, and the minutes used to be link-outs to sfvga.org;
 * their content now lives in the app (see `app/(tabs)/more/*`), so those
 * compartments push a page instead. The resource row still decides whether a
 * compartment appears at all and where it sits, and its URL is still used —
 * Membership links to the full application form, Records to the by-laws.
 * Giving and the by-laws stay link-outs: there is nothing to show in-app that
 * the document itself doesn't.
 */
const IN_APP_ROUTES: Partial<Record<ResourceKind, Href>> = {
  membership: '/more/membership',
  mission: '/more/about',
  minutes: '/more/records',
};

const CONTACT_ROUTE: Href = '/more/contact';

/**
 * More — the thali.
 *
 * The association's resources served as compartments around a central mark:
 * join us, support the work, read how we govern ourselves. The metaphor earns
 * its place only because the result is genuinely usable — every compartment is
 * a labelled control with a ≥44pt target, and the whole arrangement falls back
 * to a grid when the screen is too narrow for a ring.
 *
 * Order comes from `RESOURCE_ORDER`, not from the data, so the plate is always
 * arranged the same way. Membership leads and carries the screen's single
 * kumkum accent. Some compartments open a page in this tab's stack, the rest
 * open a document or website; see `IN_APP_ROUTES`.
 */
export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const openLink = useOpenLink();
  const { data: resources, isPending, isError } = useResources();

  const items = useMemo<ThaliItem[]>(() => {
    if (resources === undefined) {
      return [];
    }

    const byKind = new Map<string, Resource>(
      resources
        // The volunteer-hours record and the CPR album are resources in the
        // data layer, but they belong to the Youth screen — they would
        // otherwise land here as compartments labelled from their `external`
        // kind.
        .filter((resource) => !SCREEN_OWNED_RESOURCE_IDS.has(resource.id))
        .map((resource) => [resource.kind, resource]),
    );

    // Walk the intended order first so the arrangement is stable, then append
    // anything the data carries that the order does not know about.
    const ordered: Resource[] = [];
    for (const kind of RESOURCE_ORDER) {
      const match = byKind.get(kind);
      if (match !== undefined) {
        ordered.push(match);
        byKind.delete(kind);
      }
    }
    ordered.push(...byKind.values());

    const compartments: ThaliItem[] = ordered.map((resource) => {
      const display = RESOURCE_DISPLAY[resource.kind];
      const route = IN_APP_ROUTES[resource.kind];
      const url = resolveContent(resource.url);

      return {
        id: resource.id,
        // Prefer the interface's voice; fall back to whatever the data calls
        // it if a future kind has no display entry.
        label: display.label || (resolveContent(resource.label) ?? resource.id),
        icon: display.icon,
        // An in-app page is always reachable; a link-out needs a real URL.
        enabled: route !== undefined || url !== null,
        emphasis: resource.kind === 'membership',
        onPress: () => {
          if (route !== undefined) {
            router.push(route);
          } else if (url !== null) {
            openLink(url);
          }
        },
      };
    });

    // Contact has no resource row — it is a page, not a link — so it joins
    // the plate last, after everything the data orders.
    compartments.push({
      id: 'contact',
      label: MORE_COPY.contact.label,
      icon: MORE_COPY.contact.icon,
      enabled: true,
      emphasis: false,
      onPress: () => router.push(CONTACT_ROUTE),
    });

    return compartments;
  }, [resources, router, openLink]);

  const renderBody = () => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <Text style={[theme.typography.body, { color: theme.colors.error }]}>
          {STATUS_COPY.error}
        </Text>
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          headline={MORE_COPY.emptyHeadline}
          body={MORE_COPY.emptyBody}
          delay={theme.motion.durations.fast}
        />
      );
    }

    return <ThaliArrangement items={items} />;
  };

  return (
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      {/* No separate intro line here on purpose. The scaffold subtitle already
          says what this screen holds, and a second sentence saying it again
          pushed the thali below the fold — the one thing on this screen that
          has to be seen. Ornament added, then one thing removed. */}
      <View>{renderBody()}</View>
    </ScreenScaffold>
  );
}
