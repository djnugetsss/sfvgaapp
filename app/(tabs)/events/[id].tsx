import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { MotiView } from 'moti';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventHero } from '@/components/events/EventHero';
import { FlagshipHeroOrnament } from '@/components/events/FlagshipHeroOrnament';
import { Tag } from '@/components/events/Tag';
import { Rule } from '@/components/ui/Rule';
import {
  CATEGORY_LABELS,
  EVENTS_COPY,
  STATUS_COPY,
  STATUS_LABELS,
} from '@/constants/content';
import { useCalendarDay } from '@/hooks/useCalendarDay';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useEvent } from '@/services';
import { useTheme } from '@/theme';
import { resolveContent } from '@/utils/content';
import {
  formatCountdown,
  formatEventDayLong,
  formatTimeRange,
} from '@/utils/eventFormat';
import { getEventStatus } from '@/utils/eventStatus';

const HERO_HEIGHT = 300;

/**
 * Event detail.
 *
 * Every optional field is gated on `resolveContent`, so a still-unfilled
 * `location` or `startTime` simply omits its row rather than printing a TODO
 * marker or leaving a labelled blank. The description is the one exception: it
 * falls back to a forward-looking line, because a detail page with no body
 * copy at all would read as broken.
 *
 * "View on website" opens `sourceUrl` in the in-app browser, which keeps the
 * member inside the app and, for the many fields still marked TODO, is where
 * the real answer currently lives.
 */
export default function EventDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const today = useCalendarDay();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isPending, isError } = useEvent(id ?? null);

  const openSource = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      // Match the app's chrome so the handoff doesn't feel like leaving.
      toolbarColor: theme.colors.background,
      controlsColor: theme.colors.primary,
    });
  };

  if (isPending) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted, marginTop: theme.spacing.md },
          ]}
        >
          {STATUS_COPY.loading}
        </Text>
      </View>
    );
  }

  if (isError || event === null || event === undefined) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor: theme.colors.background,
            padding: theme.layout.screenPadding,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.h2,
            { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
          ]}
        >
          {EVENTS_COPY.detail.notFound.headline}
        </Text>
        <Text
          style={[
            theme.typography.body,
            {
              color: theme.colors.textSecondary,
              textAlign: 'center',
              marginBottom: theme.spacing.lg,
            },
          ]}
        >
          {EVENTS_COPY.detail.notFound.body}
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[theme.typography.body, { color: theme.colors.primary }]}>
            {EVENTS_COPY.scopeAllYear}
          </Text>
        </Pressable>
      </View>
    );
  }

  // `today` is read so the status re-derives when the date rolls over.
  void today;
  const status = getEventStatus(event);
  const statusLabel = STATUS_LABELS[status];

  const location = resolveContent(event.location);
  const description = resolveContent(event.description);
  const time = formatTimeRange(
    resolveContent(event.startTime),
    resolveContent(event.endTime),
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Full-bleed hero: no radius, runs under the status bar. The
            flagship ornament is layered over it for Sanskriti Divas only. */}
        <View style={{ height: HERO_HEIGHT }}>
          <EventHero
            event={event}
            height={HERO_HEIGHT}
            borderRadius={0}
            variant="detail"
            dimmed={status === 'past'}
          />
          {event.isFeatured ? <FlagshipHeroOrnament height={HERO_HEIGHT} /> : null}
        </View>

        <MotiView
          from={{ opacity: 0, translateY: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: reduceMotion ? 0 : theme.motion.durations.base,
          }}
          style={{
            padding: theme.layout.screenPadding,
            marginTop: -theme.spacing.lg,
            borderTopLeftRadius: theme.radii.xl,
            borderTopRightRadius: theme.radii.xl,
            backgroundColor: theme.colors.background,
          }}
        >
          <View style={[styles.tagRow, { marginBottom: theme.spacing.md }]}>
            <Tag label={CATEGORY_LABELS[event.category]} variant="quiet" />
            {statusLabel !== null ? (
              <View style={{ marginLeft: theme.spacing.sm }}>
                <Tag
                  label={statusLabel}
                  variant={status === 'today' ? 'accent' : 'quiet'}
                />
              </View>
            ) : null}
            {event.isFeatured ? (
              <View style={{ marginLeft: theme.spacing.sm }}>
                <Tag label={EVENTS_COPY.featuredEyebrow} variant="accent" />
              </View>
            ) : null}
          </View>

          <Text
            style={[
              theme.typography.display,
              { color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
            ]}
          >
            {event.title}
          </Text>

          <Rule
            variant="short"
            style={{ marginBottom: theme.spacing.lg }}
          />

          {/* When — always present, since startDate is required. */}
          <DetailRow
            label={EVENTS_COPY.detail.whenLabel}
            value={formatEventDayLong(event.startDate)}
            hint={time ?? formatCountdown(event.startDate)}
          />

          {/* Where — omitted entirely when the venue is still unfilled. */}
          {location !== null ? (
            <DetailRow label={EVENTS_COPY.detail.whereLabel} value={location} />
          ) : null}

          <Rule style={{ marginVertical: theme.spacing.lg }} />

          <Text
            style={[
              theme.typography.bodyLg,
              {
                color:
                  description !== null
                    ? theme.colors.textSecondary
                    : theme.colors.textMuted,
              },
            ]}
          >
            {description ?? EVENTS_COPY.detail.descriptionFallback}
          </Text>

          <Pressable
            accessibilityRole="link"
            onPress={() => void openSource(event.sourceUrl)}
            style={({ pressed }) => [
              styles.linkRow,
              {
                marginTop: theme.spacing.xl,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                borderRadius: theme.radii.full,
                borderWidth: 1,
                borderColor: theme.colors.primary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[theme.typography.body, { color: theme.colors.primary }]}>
              {EVENTS_COPY.detail.viewOnWebsite}
            </Text>
            <Feather
              name="arrow-up-right"
              size={16}
              color={theme.colors.primary}
              style={{ marginLeft: theme.spacing.xs }}
            />
          </Pressable>
        </MotiView>
      </ScrollView>

      {/* Back control floats over the hero. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => router.back()}
        style={[
          styles.back,
          {
            top: insets.top + theme.spacing.sm,
            left: theme.spacing.md,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.full,
          },
          theme.shadows.sm,
        ]}
        hitSlop={8}
      >
        <Feather name="chevron-left" size={22} color={theme.colors.textPrimary} />
      </Pressable>
    </View>
  );
}

/** A labelled field. Only rendered by callers when the value is real. */
function DetailRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text
        style={[
          theme.typography.overline,
          { color: theme.colors.textMuted, marginBottom: theme.spacing.xs },
        ]}
      >
        {label}
      </Text>
      <Text style={[theme.typography.bodyLg, { color: theme.colors.textPrimary }]}>
        {value}
      </Text>
      {hint !== undefined ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  back: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
