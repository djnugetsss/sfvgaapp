import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { fontFamilies, useTheme } from '@/theme';
import type { FeatherIconName } from '@/types';

type TextLinkProps = {
  label: string;
  onPress: () => void;
  /** `arrow-right` for in-app, `arrow-up-right` for a link that leaves. */
  icon?: FeatherIconName;
  accessibilityHint?: string;
  style?: ViewStyle;
};

/**
 * A quiet gold link with a trailing arrow — Home's "Browse all events" row,
 * made reusable. The secondary action on a screen whose primary action is a
 * `PrimaryButton`, or the only action on a screen that should not shout.
 *
 * The vertical padding is part of the control, not decoration: it lifts the
 * hit area to the 44pt floor around a single line of body type.
 */
export function TextLink({
  label,
  onPress,
  icon = 'arrow-right',
  accessibilityHint,
  style,
}: TextLinkProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      hitSlop={theme.spacing.xs}
      style={({ pressed }) => [
        styles.row,
        { paddingVertical: theme.spacing.sm + 2, opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <Text style={[theme.typography.body, { color: theme.colors.accent, fontFamily: theme.fontsLoaded ? fontFamilies.medium : undefined }]}>
        {label}
      </Text>
      <Feather
        name={icon}
        size={16}
        color={theme.colors.accent}
        style={{ marginLeft: theme.spacing.sm }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
