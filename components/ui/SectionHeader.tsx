import { Text, View, type ViewStyle } from 'react-native';

import { Rule } from '@/components/ui/Rule';
import { useTheme } from '@/theme';

type SectionHeaderProps = {
  eyebrow: string;
  title?: string;
  body?: string | null;
  /** Use on the crimson band. */
  inverse?: boolean;
  style?: ViewStyle;
};

/** Uppercase tracked overline, the 64pt rule, then an optional title and body. */
export function SectionHeader({ eyebrow, title, body, inverse = false, style }: SectionHeaderProps) {
  const theme = useTheme();
  const accent = inverse ? theme.colors.primaryContrast : theme.colors.primary;

  return (
    <View style={[{ marginBottom: theme.spacing.lg }, style]}>
      <Text
        accessibilityRole="header"
        style={[theme.typography.overline, { color: accent, marginBottom: theme.spacing.sm }]}
      >
        {eyebrow}
      </Text>
      <Rule
        variant="short"
        style={{ backgroundColor: accent, marginBottom: title || body ? theme.spacing.md : 0 }}
      />
      {title ? (
        <Text style={[theme.typography.h2, { color: inverse ? theme.colors.primaryContrast : theme.colors.textPrimary }]}>
          {title}
        </Text>
      ) : null}
      {body ? (
        <Text
          style={[
            theme.typography.body,
            { color: inverse ? theme.colors.primaryContrast : theme.colors.textSecondary, marginTop: theme.spacing.sm },
          ]}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}
