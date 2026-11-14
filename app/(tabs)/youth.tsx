import { Text, View } from 'react-native';

import { BannerImage } from '@/components/ui/BannerImage';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ProgramCard } from '@/components/youth/ProgramCard';
import { VolunteerHoursCard } from '@/components/youth/VolunteerHoursCard';
import { YOUTH_BANNER_KEY, YOUTH_CPR_IMAGE_KEY } from '@/constants/assets';
import { SCREEN_COPY, STATUS_COPY, YOUTH_COPY } from '@/constants/content';
import { useOpenLink } from '@/hooks/useOpenLink';
import { useYouthCprResource, useYouthHoursResource } from '@/services';
import { useTheme } from '@/theme';
import { resolveContent } from '@/utils/content';

const copy = SCREEN_COPY.youth;

/**
 * Youth — the hours record first, then the programmes.
 *
 * The screen's main job is still to hand a member the association's
 * volunteer-hours record, so the order is one line of writing, one
 * photograph, and that action — all on the first screen. CPR training sits
 * *below* it as a quieter card (a text link, no filled button, no motif), so
 * adding a programme never pushes the hours card down or competes with it.
 *
 * No URL is written here. Both come from `resources` via their hooks and pass
 * through `resolveContent`, so a missing row or a TODO marker renders the card
 * without its link instead of with a broken one. The CPR card goes further and
 * is omitted entirely until its resource exists — in Firestore that means
 * until the seed has been re-run.
 */
export default function YouthScreen() {
  const theme = useTheme();
  const openLink = useOpenLink();
  const { data: hours, isPending, isError } = useYouthHoursResource();
  const cpr = useYouthCprResource();
  const cprUrl = resolveContent(cpr.data?.url);

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
        onOpen={openLink}
        delay={theme.motion.durations.fast}
      />
    );
  };

  return (
    // `showDivider={false}`: the subtitle is this screen's only prose, so a
    // rule under it would have nothing to divide.
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      showDivider={false}
    >
      {/* 21:9 — the shallowest band in the app, because every point of it
          delays the hours card. Unregistered → nothing renders, margin
          included, and the card moves up under the header. */}
      <BannerImage
        imageKey={YOUTH_BANNER_KEY}
        aspectRatio={21 / 9}
        accessibilityLabel={YOUTH_COPY.banner.alt}
        delay={theme.motion.durations.fast}
        style={{ marginBottom: theme.spacing.md }}
      />

      {renderAction()}

      {cprUrl !== null ? (
        <View style={{ marginTop: theme.spacing.xl }}>
          <ProgramCard
            imageKey={YOUTH_CPR_IMAGE_KEY}
            imageAlt={YOUTH_COPY.cpr.imageAlt}
            eyebrow={YOUTH_COPY.cpr.eyebrow}
            headline={YOUTH_COPY.cpr.headline}
            body={YOUTH_COPY.cpr.body}
            actionLabel={YOUTH_COPY.cpr.action}
            actionHint={YOUTH_COPY.cpr.actionHint}
            url={cprUrl}
            onOpen={openLink}
            delay={theme.motion.durations.base}
          />
        </View>
      ) : null}
    </ScreenScaffold>
  );
}
