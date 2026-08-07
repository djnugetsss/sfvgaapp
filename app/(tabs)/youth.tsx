import * as WebBrowser from 'expo-web-browser';
import { MotiView } from 'moti';
import { useCallback } from 'react';
import { Text } from 'react-native';

import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { VolunteerHoursCard } from '@/components/youth/VolunteerHoursCard';
import { SCREEN_COPY, STATUS_COPY, YOUTH_COPY } from '@/constants/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useYouthHoursResource } from '@/services';
import { useTheme } from '@/theme';
import { resolveContent } from '@/utils/content';

const copy = SCREEN_COPY.youth;

/**
 * Youth — one thing, done properly.
 *
 * The screen's whole job is to hand a member the association's volunteer-hours
 * record, so it is built as a short piece of writing with a single action at
 * the end of it rather than as a button on an empty page.
 *
 * The URL is never written here. It comes from the `youth-hours` resource via
 * `useYouthHoursResource()`, passes through `resolveContent`, and reaches the
 * card as either a real link or `null` — so the day that row is missing, or
 * still carries a TODO marker, this screen renders its header and its copy and
 * simply omits the button.
 */
export default function YouthScreen() {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
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
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <MotiView
        from={{ opacity: 0, translateY: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: reduceMotion ? 0 : theme.motion.durations.base,
        }}
        // `xl` rather than `2xl`: the scaffold already lays a full rule and two
        // generous gaps above this, and the card below has to clear the fold.
        style={{ marginBottom: theme.spacing.xl }}
      >
        <Text
          style={[theme.typography.bodyLg, { color: theme.colors.textSecondary }]}
        >
          {YOUTH_COPY.intro}
        </Text>
      </MotiView>

      {renderAction()}
    </ScreenScaffold>
  );
}
