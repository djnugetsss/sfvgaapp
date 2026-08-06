import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';

import { RangoliMark } from '@/components/motif/RangoliMark';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';

type EmptyStateProps = {
  headline: string;
  body: string;
  /** Staggers the entrance behind the screen header. */
  delay?: number;
};

/**
 * A deliberate empty state — a bordered card with a drawn rangoli, not a shrug.
 *
 * The mark replaced a generic Feather glyph here. A stock outline icon said
 * "no data"; a rangoli says "not yet filled in", which is both warmer and true
 * — every one of these screens is waiting on content, not broken.
 *
 * The ring around it was dropped at the same time: a circle around a circular
 * radial mark read as two competing containers.
 */
export function EmptyState({ headline, body, delay = 0 }: EmptyStateProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <MotiView
      from={{ opacity: 0, translateY: reduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: theme.motion.durations.slow,
        delay: reduceMotion ? 0 : delay,
      }}
      style={[
        styles.card,
        theme.shadows.sm,
        {
          padding: theme.spacing.xl,
          borderRadius: theme.radii.lg,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <View style={{ marginBottom: theme.spacing.lg }}>
        <RangoliMark size={44} />
      </View>

      <Text
        style={[
          theme.typography.h3,
          { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
        ]}
      >
        {headline}
      </Text>

      <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
        {body}
      </Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
