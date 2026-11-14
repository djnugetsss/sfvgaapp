import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';

import { RangoliMark } from '@/components/motif/RangoliMark';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { YOUTH_COPY } from '@/constants/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';

type VolunteerHoursCardProps = {
  /**
   * The resolved record URL, or `null` when the resource is missing or still
   * carries a TODO marker. `null` renders the card without its button rather
   * than with a button that goes nowhere.
   */
  url: string | null;
  onOpen: (url: string) => void;
  /** Staggers the entrance behind the screen header. */
  delay?: number;
};

/**
 * The Youth screen's one action, given a card of its own.
 *
 * A bare button on an empty page would have been the whole feature; this gives
 * it a reason to be looked at — a drawn rangoli, an overline, a line of type
 * that says what the record is, and then the action. The card is the screen's
 * single motif touch, so nothing else on Youth carries ornament.
 *
 * The button is the app's first genuinely *filled* control. Everywhere else,
 * gold is a hairline or a line of text; here the accent is spent once, at
 * full strength, on the only thing this screen asks anyone to do.
 *
 * The button itself is `PrimaryButton`, which owns the ink-on-gold contrast
 * rule that used to be written out here.
 */
export function VolunteerHoursCard({
  url,
  onOpen,
  delay = 0,
}: VolunteerHoursCardProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

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
          padding: theme.spacing.xl,
          borderRadius: theme.radii.lg,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      {/* The screen's single motif, at the quiet stroke — an accent, not a
          subject. */}
      <View style={{ marginBottom: theme.spacing.md }}>
        <RangoliMark size={40} />
      </View>

      <Text
        style={[
          theme.typography.overline,
          { color: theme.colors.textMuted, marginBottom: theme.spacing.sm },
        ]}
      >
        {YOUTH_COPY.hours.eyebrow}
      </Text>

      <Text
        style={[
          theme.typography.h2,
          { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
        ]}
      >
        {YOUTH_COPY.hours.headline}
      </Text>

      <Text
        style={[
          theme.typography.body,
          { color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
        ]}
      >
        {YOUTH_COPY.hours.body}
      </Text>

      {url !== null ? (
        <PrimaryButton
          accessibilityRole="link"
          label={YOUTH_COPY.hours.action}
          accessibilityHint={YOUTH_COPY.hours.actionHint}
          icon="arrow-up-right"
          onPress={() => onOpen(url)}
        />
      ) : (
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
          {YOUTH_COPY.hours.unavailable}
        </Text>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
