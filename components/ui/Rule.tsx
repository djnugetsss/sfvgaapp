import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

type RuleProps = {
  /** `full` spans the container; `short` is the 64pt crimson rule under an overline. */
  variant?: 'full' | 'short';
  style?: ViewStyle;
};

/** A hairline rule, or the short crimson rule that opens a section. */
export function Rule({ variant = 'full', style }: RuleProps) {
  const theme = useTheme();

  if (variant === 'short') {
    return (
      <View
        style={[
          {
            width: 64,
            height: 1,
            backgroundColor: theme.colors.primary,
            opacity: 0.8,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        { height: theme.layout.hairline, backgroundColor: theme.colors.border },
        style,
      ]}
    />
  );
}
