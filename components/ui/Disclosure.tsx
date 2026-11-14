import Feather from '@expo/vector-icons/Feather';
import { MotiView } from 'moti';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';

type DisclosureProps = {
  title: string;
  children: ReactNode;
  /** Suppresses the hairline above the first row in a list. */
  isFirst: boolean;
};

/**
 * A titled row that opens to reveal what is under it — FAQ answers, role
 * responsibilities.
 *
 * Collapsed by default: on a phone, every answer stacked open is a wall, and
 * the titles alone are what someone scans for. The whole row toggles, and the
 * expanded state is announced so a screen-reader user knows content follows.
 */
export function Disclosure({ title, children, isFirst }: DisclosureProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  return (
    <View
      style={{
        borderTopWidth: isFirst ? 0 : theme.layout.hairline,
        borderTopColor: theme.colors.border,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [
          styles.row,
          { paddingVertical: theme.spacing.md + 2, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text
          style={[
            theme.typography.h3,
            styles.title,
            { color: theme.colors.textPrimary, marginRight: theme.spacing.md },
          ]}
        >
          {title}
        </Text>
        <Feather name={open ? 'minus' : 'plus'} size={18} color={theme.colors.primary} />
      </Pressable>
      {open ? (
        <MotiView
          from={{ opacity: 0, translateY: reduceMotion ? 0 : -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: reduceMotion ? 0 : theme.motion.durations.base,
          }}
          style={{ paddingBottom: theme.spacing.md }}
        >
          {children}
        </MotiView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
});
