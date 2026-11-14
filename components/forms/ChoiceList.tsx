import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type Choice = {
  id: string;
  label: string;
  /** Right-aligned detail, e.g. a price. */
  detail?: string;
};

type ChoiceListProps = {
  label: string;
  choices: readonly Choice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  error?: string | null;
};

const DOT = 20;

/**
 * Single choice from a short list, drawn as stacked rows with a radio dot —
 * the native replacement for the web form's `<select>`. With four or five
 * options, showing every one at once beats a picker that hides them behind a
 * tap: the reader compares prices without opening anything.
 */
export function ChoiceList({
  label,
  choices,
  selectedId,
  onSelect,
  error,
}: ChoiceListProps) {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: theme.spacing.md }} accessibilityRole="radiogroup">
      <Text
        style={[
          theme.typography.overline,
          { color: theme.colors.textMuted, marginBottom: theme.spacing.xs },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.group,
          {
            borderColor: error ? theme.colors.error : theme.colors.border,
            borderRadius: theme.radii.sm,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {choices.map((choice, index) => {
          const selected = choice.id === selectedId;
          return (
            <Pressable
              key={choice.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={
                choice.detail ? `${choice.label}, ${choice.detail}` : choice.label
              }
              onPress={() => onSelect(choice.id)}
              style={({ pressed }) => [
                styles.row,
                {
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.md - 2,
                  borderTopWidth: index === 0 ? 0 : theme.layout.hairline,
                  borderTopColor: theme.colors.border,
                  backgroundColor: selected
                    ? theme.colors.accentWash
                    : pressed
                      ? theme.colors.background
                      : 'transparent',
                },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  {
                    borderColor: selected ? theme.colors.primary : theme.colors.textMuted,
                    marginRight: theme.spacing.md,
                  },
                ]}
              >
                {selected ? (
                  <View
                    style={[styles.dotFill, { backgroundColor: theme.colors.primary }]}
                  />
                ) : null}
              </View>
              <Text
                style={[
                  theme.typography.body,
                  styles.choiceLabel,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {choice.label}
              </Text>
              {choice.detail ? (
                <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>
                  {choice.detail}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            theme.typography.caption,
            { color: theme.colors.error, marginTop: theme.spacing.xs },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFill: {
    width: DOT / 2,
    height: DOT / 2,
    borderRadius: DOT / 4,
  },
  choiceLabel: {
    flex: 1,
  },
});
