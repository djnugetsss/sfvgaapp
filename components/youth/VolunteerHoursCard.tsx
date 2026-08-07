import Feather from '@expo/vector-icons/Feather';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RangoliMark } from '@/components/motif/RangoliMark';
import { YOUTH_COPY } from '@/constants/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fontFamilies, useTheme } from '@/theme';

/** Comfortably clear of the 44pt tap-target floor. */
const ACTION_HEIGHT = 54;

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
 * Note on the label colour: the fill is `primary` with `textPrimary` type, not
 * the `primaryContrast` white the token pairing suggests. White on marigold
 * measures about 2.9:1 — under the 4.5:1 floor for type at this size. Ink on
 * gold measures about 7.4:1, and reads like foil-stamped letterpress besides.
 * Both values are tokens; only the pairing is chosen here.
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
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={YOUTH_COPY.hours.action}
          accessibilityHint={YOUTH_COPY.hours.actionHint}
          onPress={() => onOpen(url)}
          style={({ pressed }) => [
            styles.action,
            theme.shadows.sm,
            {
              height: ACTION_HEIGHT,
              paddingHorizontal: theme.spacing.lg,
              borderRadius: theme.radii.full,
              backgroundColor: theme.colors.primary,
              opacity: pressed ? 0.86 : 1,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.bodyLg,
              styles.actionLabel,
              {
                color: theme.colors.textPrimary,
                // Guarded on `fontsLoaded` the same way the type scale is, so
                // the label is never blank on first paint.
                fontFamily: theme.fontsLoaded
                  ? fontFamilies.sansSemiBold
                  : undefined,
              },
            ]}
          >
            {YOUTH_COPY.hours.action}
          </Text>
          <Feather
            name="arrow-up-right"
            size={18}
            color={theme.colors.textPrimary}
            style={{ marginLeft: theme.spacing.sm }}
          />
        </Pressable>
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
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontWeight: '600',
  },
});
