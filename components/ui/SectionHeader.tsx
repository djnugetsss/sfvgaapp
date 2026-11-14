import { Text, View, type ViewStyle } from 'react-native';

import { Rule } from '@/components/ui/Rule';
import { useTheme } from '@/theme';

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  body?: string | null;
  style?: ViewStyle;
};

/**
 * Opens a section partway down a screen: overline, gold tick, serif heading,
 * and an optional line of context. The same voice as `ScreenScaffold`'s header
 * at one size down, so a long screen reads as chapters of one document rather
 * than as a stack of unrelated cards.
 */
export function SectionHeader({ eyebrow, title, body, style }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[{ marginBottom: theme.spacing.lg }, style]}>
      <Text
        style={[
          theme.typography.overline,
          { color: theme.colors.textMuted, marginBottom: theme.spacing.sm },
        ]}
      >
        {eyebrow}
      </Text>
      <Rule variant="short" style={{ marginBottom: theme.spacing.md }} />
      <Text
        accessibilityRole="header"
        style={[theme.typography.h2, { color: theme.colors.textPrimary }]}
      >
        {title}
      </Text>
      {body ? (
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
          ]}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}
