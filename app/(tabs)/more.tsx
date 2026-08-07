import * as WebBrowser from 'expo-web-browser';
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
import { useResources, YOUTH_HOURS_RESOURCE_ID } from '@/services';
import { useTheme } from '@/theme';
import type { Resource } from '@/types';
import { resolveContent } from '@/utils/content';

const copy = SCREEN_COPY.more;

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
 * kumkum accent.
 */
export default function MoreScreen() {
  const theme = useTheme();
  const { data: resources, isPending, isError } = useResources();

  const openResource = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      toolbarColor: theme.colors.background,
      controlsColor: theme.colors.primary,
    });
  };

  const items = useMemo<ThaliItem[]>(() => {
    if (resources === undefined) {
      return [];
    }

    const byKind = new Map<string, Resource>(
      resources
        // The volunteer-hours record is a resource in the data layer, but it
        // belongs to the Youth screen — it would otherwise land here as a
        // sixth compartment labelled from its `external` kind.
        .filter((resource) => resource.id !== YOUTH_HOURS_RESOURCE_ID)
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

    return ordered.map((resource) => {
      const display = RESOURCE_DISPLAY[resource.kind];
      const url = resolveContent(resource.url);

      return {
        id: resource.id,
        // Prefer the interface's voice; fall back to whatever the data calls
        // it if a future kind has no display entry.
        label: display.label || (resolveContent(resource.label) ?? resource.id),
        icon: display.icon,
        enabled: url !== null,
        emphasis: resource.kind === 'membership',
        onPress: () => {
          if (url !== null) {
            void openResource(url);
          }
        },
      };
    });
    // `openResource` closes over the theme only for browser chrome colours.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

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
