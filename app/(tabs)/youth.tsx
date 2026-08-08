import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { Text } from 'react-native';

import { BannerImage } from '@/components/ui/BannerImage';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { VolunteerHoursCard } from '@/components/youth/VolunteerHoursCard';
import { YOUTH_BANNER_KEY } from '@/constants/assets';
import { SCREEN_COPY, STATUS_COPY, YOUTH_COPY } from '@/constants/content';
import { useYouthHoursResource } from '@/services';
import { useTheme } from '@/theme';
import { resolveContent } from '@/utils/content';

const copy = SCREEN_COPY.youth;

/**
 * Youth — one thing, done properly.
 *
 * The screen's whole job is to hand a member the association's volunteer-hours
 * record, so it is built as one line of writing, one photograph, and the
 * action — in that order, and nothing else. It used to carry a second
 * paragraph under a rule; between them they filled the first screen and left
 * the card, which is the point, below the fold.
 *
 * The URL is never written here. It comes from the `youth-hours` resource via
 * `useYouthHoursResource()`, passes through `resolveContent`, and reaches the
 * card as either a real link or `null` — so the day that row is missing, or
 * still carries a TODO marker, this screen renders its header and its copy and
 * simply omits the button.
 */
export default function YouthScreen() {
  const theme = useTheme();
  const { data: hours, isPending, isError } = useYouthHoursResource();

  const openHours = useCallback(
    (url: string) => {
      void WebBrowser.openBrowserAsync(url, {
        // Match the app's chrome so the handoff doesn't feel like leaving.
        toolbarColor: theme.colors.background,
        controlsColor: theme.colors.primary,
      });
    },
    [theme.colors.background, theme.colors.primary],
  );

  const renderAction = () => {
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

    return (
      <VolunteerHoursCard
        url={resolveContent(hours?.url)}
        onOpen={openHours}
        delay={theme.motion.durations.fast}
      />
    );
  };

  return (
    // `showDivider={false}`: the subtitle is now this screen's only prose, so
    // the rule under it had nothing left to divide.
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      showDivider={false}
    >
      {/* The subtitle says the youth carry this association; the photograph is
          the evidence, and it sits between the claim and the ask.

          21:9 — the shallowest band in the app, and the only one whose height
          is charged against something else: every point of it delays the hours
          card, which is the reason the screen exists. The crop suits this
          photograph anyway, since the volunteers work across the middle of the
          frame and the trim takes empty ceiling and floor.

          Unregistered → nothing renders, margin included, and the card simply
          moves up under the header. */}
      <BannerImage
        imageKey={YOUTH_BANNER_KEY}
        aspectRatio={21 / 9}
        accessibilityLabel={YOUTH_COPY.banner.alt}
        delay={theme.motion.durations.fast}
        style={{ marginBottom: theme.spacing.md }}
      />

      {renderAction()}
    </ScreenScaffold>
  );
}
