import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

type TagVariant = 'neutral' | 'accent' | 'quiet';

type TagProps = {
  label: string;
  variant?: TagVariant;
};

/**
 * A small pill label — category, status, "Featured".
 *
 * Three weights so the same primitive can carry the accent (featured, today)
 * or recede entirely (a completed event), keeping the accent budget under
 * control: on any given card at most one tag is allowed to be gold.
 */
export function Tag({ label, variant = 'neutral' }: TagProps) {
  const theme = useTheme();

  const palette: Record<TagVariant, { background: string; text: string }> = {
    neutral: {
      background: theme.colors.background,
      text: theme.colors.textSecondary,
    },
    accent: {
      background: theme.colors.accentWash,
      text: theme.colors.primary,
    },
    quiet: {
      background: 'transparent',
      text: theme.colors.textMuted,
    },
  };

  const { background, text } = palette[variant];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.full,
        backgroundColor: background,
        borderWidth: variant === 'quiet' ? theme.layout.hairline : 0,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={[theme.typography.overline, { color: text }]}>{label}</Text>
    </View>
  );
}
