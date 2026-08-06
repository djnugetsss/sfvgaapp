import { StyleSheet, Text, View } from 'react-native';

import { ThaliSpinner } from '@/components/motif/ThaliSpinner';
import { STATUS_COPY } from '@/constants/content';
import { useTheme } from '@/theme';

type LoadingStateProps = {
  /** Vertical breathing room; smaller inside cards. */
  compact?: boolean;
};

/**
 * The app's single loading treatment: the thali spinner over the shared
 * "Loading…" line.
 *
 * Centralised so every screen loads the same way — previously each screen
 * hand-rolled an `ActivityIndicator` block, which meant four chances to drift.
 */
export function LoadingState({ compact = false }: LoadingStateProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={STATUS_COPY.loading}
      style={[
        styles.root,
        { paddingVertical: compact ? theme.spacing.lg : theme.spacing['2xl'] },
      ]}
    >
      <ThaliSpinner size={compact ? 36 : 48} />
      <Text
        style={[
          theme.typography.caption,
          { color: theme.colors.textMuted, marginTop: theme.spacing.md },
        ]}
      >
        {STATUS_COPY.loading}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
