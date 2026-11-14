import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';

import { HERO_BLURHASH } from '@/components/events/EventHero';
import { TextLink } from '@/components/ui/TextLink';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import { resolveImageSource } from '@/utils/imageSource';

type ProgramCardProps = {
  /** Registry key or URL. Unresolvable → the card renders without a photo. */
  imageKey: string;
  imageAlt: string;
  eyebrow: string;
  headline: string;
  body: string;
  actionLabel: string;
  actionHint: string;
  /** Resolved destination, or `null` to render the card without its link. */
  url: string | null;
  onOpen: (url: string) => void;
  delay?: number;
};

/**
 * A youth programme beneath the hours record: photograph, overline, a line of
 * serif, a sentence, and a quiet link.
 *
 * Deliberately a step down from `VolunteerHoursCard`. That card holds the
 * screen's one filled button and its one motif; this one has neither — its
 * action is a `TextLink`, so the hours record stays the obvious thing to do.
 */
export function ProgramCard({
  imageKey,
  imageAlt,
  eyebrow,
  headline,
  body,
  actionLabel,
  actionHint,
  url,
  onOpen,
  delay = 0,
}: ProgramCardProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const source = resolveImageSource(imageKey);

  return (
    <MotiView
      from={{ opacity: 0, translateY: reduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: reduceMotion ? 0 : theme.motion.durations.slow,
        delay: reduceMotion ? 0 : delay,
      }}
      style={[
        styles.card,
        theme.shadows.sm,
        {
          borderRadius: theme.radii.lg,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      {source !== null ? (
        <Image
          source={source}
          placeholder={{ blurhash: HERO_BLURHASH }}
          transition={theme.motion.durations.base}
          contentFit="cover"
          accessibilityLabel={imageAlt}
          style={styles.photo}
        />
      ) : null}

      <View style={{ padding: theme.spacing.xl }}>
        <Text
          style={[
            theme.typography.overline,
            { color: theme.colors.textMuted, marginBottom: theme.spacing.sm },
          ]}
        >
          {eyebrow}
        </Text>
        <Text
          style={[
            theme.typography.h2,
            { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
          ]}
        >
          {headline}
        </Text>
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
          ]}
        >
          {body}
        </Text>
        {url !== null ? (
          <TextLink
            label={actionLabel}
            accessibilityHint={actionHint}
            icon="arrow-up-right"
            onPress={() => onOpen(url)}
          />
        ) : null}
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
});
