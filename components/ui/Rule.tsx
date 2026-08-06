import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

type RuleProps = {
  /**
   * `full` spans the container; `short` is a 40pt accent tick used to open a
   * section — the single most-used piece of "jewelry" in the design.
   */
  variant?: 'full' | 'short';
  style?: ViewStyle;
};

/** A hairline rule. Editorial layouts live or die on their horizontal rules. */
export function Rule({ variant = 'full', style }: RuleProps) {
  const theme = useTheme();

  if (variant === 'short') {
    return (
      <View
        style={[
          {
            width: theme.spacing['2xl'],
            height: 2,
            borderRadius: theme.radii.full,
            backgroundColor: theme.colors.primary,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          height: theme.layout.hairline,
          backgroundColor: theme.colors.border,
        },
        style,
      ]}
    />
  );
}
