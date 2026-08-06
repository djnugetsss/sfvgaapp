import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';

/** Which slice of the calendar the agenda is showing. */
export type AgendaScope = 'month' | 'year';

type ScopeToggleProps = {
  value: AgendaScope;
  onChange: (scope: AgendaScope) => void;
  monthLabel: string;
  yearLabel: string;
};

/**
 * Two-position toggle between the visible month and the whole year.
 *
 * The selected pill slides between the halves with Moti rather than snapping,
 * echoing the tab bar's indicator so the app has one motion idiom instead of
 * two. Under reduce-motion the pill jumps and only the label colour changes.
 */
export function ScopeToggle({
  value,
  onChange,
  monthLabel,
  yearLabel,
}: ScopeToggleProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  const options: { key: AgendaScope; label: string }[] = [
    { key: 'month', label: monthLabel },
    { key: 'year', label: yearLabel },
  ];

  const handlePress = (scope: AgendaScope) => {
    if (scope === value) {
      return;
    }
    void Haptics.selectionAsync();
    onChange(scope);
  };

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.track,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.full,
          padding: theme.spacing.xs,
        },
      ]}
    >
      <MotiView
        animate={{ left: value === 'month' ? '1%' : '50%' }}
        transition={
          reduceMotion
            ? { type: 'timing', duration: 0 }
            : { type: 'spring', ...theme.motion.spring }
        }
        style={[
          styles.pill,
          {
            backgroundColor: theme.colors.accentWash,
            borderRadius: theme.radii.full,
          },
        ]}
      />

      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => handlePress(option.key)}
            style={styles.option}
          >
            <Text
              style={[
                theme.typography.overline,
                {
                  color: selected ? theme.colors.primary : theme.colors.textMuted,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderWidth: 1,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: '6%',
    height: '88%',
    width: '49%',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
