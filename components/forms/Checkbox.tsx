import Feather from '@expo/vector-icons/Feather';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

const BOX = 22;

type CheckboxProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** The statement being agreed to. May contain inline links. */
  children: ReactNode;
  accessibilityLabel: string;
};

/**
 * A square check with its statement beside it. The whole row is the target,
 * not just the 22pt box, so it clears the 44pt floor without looking oversized.
 */
export function Checkbox({
  checked,
  onChange,
  children,
  accessibilityLabel,
}: CheckboxProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onChange(!checked)}
      style={[styles.row, { paddingVertical: theme.spacing.sm }]}
    >
      <View
        style={[
          styles.box,
          {
            borderRadius: theme.radii.sm / 2,
            borderColor: checked ? theme.colors.primary : theme.colors.textMuted,
            backgroundColor: checked ? theme.colors.primary : theme.colors.surface,
            marginRight: theme.spacing.md,
          },
        ]}
      >
        {checked ? (
          <Feather name="check" size={16} color={theme.colors.textPrimary} />
        ) : null}
      </View>
      <View style={styles.label}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  box: {
    width: BOX,
    height: BOX,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  label: {
    flex: 1,
  },
});
