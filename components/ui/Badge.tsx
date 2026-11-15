import { Text, View } from 'react-native';

import { fontFamilies, useTheme } from '@/theme';

type BadgeVariant = 'success' | 'accent' | 'neutral' | 'info';

/** A small status pill — "Ready", "Checked In", "Past event". */
export function Badge({ label, variant = 'neutral' }: { label: string; variant?: BadgeVariant }) {
  const theme = useTheme();
  const palette: Record<BadgeVariant, { bg: string; fg: string }> = {
    success: { bg: 'rgba(30,120,80,0.12)', fg: theme.colors.success },
    accent: { bg: 'rgba(230,128,25,0.14)', fg: '#9A5300' },
    neutral: { bg: theme.colors.border, fg: theme.colors.textSecondary },
    info: { bg: theme.colors.accentWash, fg: theme.colors.primary },
  };
  const { bg, fg } = palette[variant];

  return (
    <View
      accessibilityLabel={label}
      style={{
        alignSelf: 'flex-start',
        backgroundColor: bg,
        borderRadius: 999,
        paddingHorizontal: theme.spacing.sm + 2,
        paddingVertical: theme.spacing.xs,
      }}
    >
      <Text
        style={[
          theme.typography.caption,
          { color: fg, fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
