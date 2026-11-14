import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { fontFamilies, useTheme } from '@/theme';
import type { FeatherIconName } from '@/types';

/** Comfortably clear of the 44pt tap-target floor. */
const ACTION_HEIGHT = 54;

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  /** Trailing glyph. `arrow-up-right` for a link out, `send` for a form. */
  icon?: FeatherIconName;
  /** Announced to screen readers so the destination is not a surprise. */
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link';
  disabled?: boolean;
  style?: ViewStyle;
};

/**
 * The app's filled gold control — the one thing a screen asks someone to do.
 *
 * Extracted from `VolunteerHoursCard` once the membership and contact forms
 * needed the same control, so the rule it encodes lives in one place: the fill
 * is `primary` with `textPrimary` type, not the `primaryContrast` white the
 * token pairing suggests. White on marigold measures about 2.9:1, under the
 * 4.5:1 floor at this size; ink on gold measures about 7.4:1.
 *
 * Spend it once per screen. A second filled button dilutes both.
 */
export function PrimaryButton({
  label,
  onPress,
  icon,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        theme.shadows.sm,
        {
          height: ACTION_HEIGHT,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.full,
          backgroundColor: theme.colors.primary,
          opacity: disabled ? 0.45 : pressed ? 0.86 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          theme.typography.bodyLg,
          styles.label,
          {
            color: theme.colors.textPrimary,
            // Guarded on `fontsLoaded` the same way the type scale is, so the
            // label is never blank on first paint.
            fontFamily: theme.fontsLoaded ? fontFamilies.sansSemiBold : undefined,
          },
        ]}
      >
        {label}
      </Text>
      {icon !== undefined ? (
        <Feather
          name={icon}
          size={18}
          color={theme.colors.textPrimary}
          style={{ marginLeft: theme.spacing.sm }}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
});
