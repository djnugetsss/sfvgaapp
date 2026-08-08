import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnnouncementList } from '@/components/home/AnnouncementList';
import { FeaturedStrip } from '@/components/home/FeaturedStrip';
import { NextGatheringCard } from '@/components/home/NextGatheringCard';
import { BannerImage } from '@/components/ui/BannerImage';
import { Rule } from '@/components/ui/Rule';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { HOME_BANNER_KEY } from '@/constants/assets';
import { HOME_COPY, SCREEN_COPY } from '@/constants/content';
import { useAnnouncements, useFeaturedEvent, useNextUpcomingEvent } from '@/services';
import { useTheme } from '@/theme';
import type { EventItem } from '@/types';

const copy = SCREEN_COPY.index;

/**
 * Home — forward-looking and warm.
 *
 * Order is deliberate: the hero header sets the voice, the banner band puts a
 * face to it, Next Gathering answers "what's next?", the flagship strip gives
 * the year its anchor, announcements carry news, and a quiet link hands off to
 * the full calendar.
 *
 * The banner is decoration, not content, which is why it sits *below* the hero
 * type rather than behind it: text over a photograph would cost the display
 * face its contrast, and this screen's voice is carried by the words.
 *
 * All three data hooks share cached queries with the Events screen, so moving
 * between tabs costs nothing.
 */
export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const nextEvent = useNextUpcomingEvent();
  const featured = useFeaturedEvent();
  const announcements = useAnnouncements();

  const openEvent = useCallback(
    (event: EventItem) => {
      router.push(`/events/${event.id}`);
    },
    [router],
  );

  const next = nextEvent.data ?? null;
  const flagship = featured.data ?? null;

  // If the flagship event *is* the next gathering, it is already the hero of
  // this screen — showing it twice would read as a bug.
  const showFeatured = flagship !== null && flagship.id !== next?.id;

  return (
    // TODO: Gujarati script accent (board-vetted) — a short Gujarati line
    // belongs beside this eyebrow, above the English headline. Held back until
    // a board member vets the wording and transliteration.
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      accentVariant="lattice"
    >
      {/* The association's own banner, as a quiet band between the hero copy
          and the first card. Contained rather than full-bleed so the page
          gutter reads straight down the screen. 16:9 on a 4:3 source crops
          evenly top and bottom, which centres the printed banner and takes the
          empty tablecloth out of the frame; it also keeps the band short
          enough that "Next Gathering" still shows on first paint.
          Unregistered → nothing renders, margin included, and Home reads
          exactly as it did before. */}
      <BannerImage
        imageKey={HOME_BANNER_KEY}
        aspectRatio={16 / 9}
        accessibilityLabel={HOME_COPY.banner.alt}
        // Equal `md` gutters above and below, so the band reads as part of the
        // opening rather than as a third separated section.
        //
        // The top one is negative because there is no positive margin here to
        // shrink: the space above the band is the scaffold's own rule margin,
        // which every tab shares and which must not move for one screen. So
        // Home pulls the band up into it instead — `2xl` (48) less `xl` (32)
        // leaves the `md` (16) gutter, tokens throughout, and nothing outside
        // this screen changes. When the key is unregistered the component
        // renders nothing at all, negative margin included, so the fallback
        // returns to the untouched scaffold rhythm exactly as before.
        style={{
          marginTop: -theme.spacing.xl,
          marginBottom: theme.spacing.md,
        }}
      />

      {nextEvent.isPending ? (
        <LoadingState />
      ) : next !== null ? (
        <NextGatheringCard event={next} onPress={openEvent} />
      ) : (
        <View
          style={[
            styles.emptyCard,
            {
              padding: theme.spacing.lg,
              borderRadius: theme.radii.lg,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.h3,
              { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
            ]}
          >
            {HOME_COPY.nextGathering.emptyHeadline}
          </Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
            {HOME_COPY.nextGathering.emptyBody}
          </Text>
        </View>
      )}

      {showFeatured ? (
        <View style={{ marginTop: theme.spacing['2xl'] }}>
          <FeaturedStrip event={flagship} onPress={openEvent} />
        </View>
      ) : null}

      <Rule style={{ marginVertical: theme.spacing['2xl'] }} />

      <Text
        style={[
          theme.typography.overline,
          { color: theme.colors.textMuted, marginBottom: theme.spacing.sm },
        ]}
      >
        {HOME_COPY.announcements.eyebrow}
      </Text>

      <AnnouncementList announcements={announcements.data ?? []} />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/events')}
        style={({ pressed }) => [
          styles.browseRow,
          {
            marginTop: theme.spacing['2xl'],
            paddingVertical: theme.spacing.md,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[theme.typography.body, { color: theme.colors.primary }]}>
          {HOME_COPY.browseAll}
        </Text>
        <Feather
          name="arrow-right"
          size={16}
          color={theme.colors.primary}
          style={{ marginLeft: theme.spacing.sm }}
        />
      </Pressable>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    borderWidth: 1,
  },
  browseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
