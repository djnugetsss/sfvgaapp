import Feather from '@expo/vector-icons/Feather';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import type { FeatherIconName } from '@/types';

/** Diameter of the icon disc. Comfortably over the 44pt tap-target floor. */
export const SEGMENT_DISC = 58;
/** Width reserved for a segment including its label. */
export const SEGMENT_WIDTH = 96;
/**
 * Disc + gap + two lines of label. Used by the arrangement to centre a segment
 * on its ring position — segments are taller than they are wide, so treating
 * them as square pushed every label off its mark.
 */
export const SEGMENT_HEIGHT = 104;

type ThaliSegmentProps = {
  label: string;
  icon: FeatherIconName;
  /** Index in the radial order, for the staggered reveal. */
  index: number;
  /** Spends the screen's single kumkum allowance. At most one may set this. */
  emphasis?: boolean;
  /** False when the resource has no usable URL yet. */
  enabled: boolean;
  onPress: () => void;
};

/**
 * One compartment of the thali: an icon disc with its label beneath.
 *
 * The disc is a ring, not a filled circle — filled discs at this size start to
 * look like app icons, and the whole design language here is linework. The
 * emphasised segment gets a kumkum ring and label; everything else is gold on
 * ivory.
 *
 * A segment whose resource has no URL yet renders muted and non-interactive
 * rather than disappearing, so the arrangement keeps its symmetry.
 */
export function ThaliSegment({
  label,
  icon,
  index,
  emphasis = false,
  enabled,
  onPress,
}: ThaliSegmentProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  const accent = emphasis ? theme.colors.kumkum : theme.colors.primary;
  const tint = enabled ? accent : theme.colors.textMuted;

  return (
    <MotiView
      from={{
        opacity: 0,
        scale: reduceMotion ? 1 : 0.86,
      }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'timing',
        duration: reduceMotion ? 0 : theme.motion.durations.base,
        // Radial reveal: each compartment is served a beat after the last.
        delay: reduceMotion ? 0 : 120 + index * 90,
      }}
    >
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !enabled }}
        disabled={!enabled}
        onPress={onPress}
        hitSlop={6}
        style={({ pressed }) => [
          styles.root,
          { width: SEGMENT_WIDTH, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <View
          style={[
            styles.disc,
            {
              width: SEGMENT_DISC,
              height: SEGMENT_DISC,
              borderRadius: SEGMENT_DISC / 2,
              borderColor: tint,
              // Always the plain surface. An emphasised segment is marked by
              // its ring and icon, never by a tinted fill: kumkum is barred
              // from large fills, and a filled 58pt disc read as an alert
              // badge rather than as jewellery.
              backgroundColor: theme.colors.surface,
            },
            theme.shadows.sm,
          ]}
        >
          <Feather name={icon} size={20} color={tint} />
        </View>

        <Text
          numberOfLines={2}
          style={[
            theme.typography.caption,
            styles.label,
            {
              color: enabled ? theme.colors.textSecondary : theme.colors.textMuted,
              marginTop: theme.spacing.sm,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    textAlign: 'center',
  },
});
