import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LatticeRule } from '@/components/motif/LatticeRule';
import { Rule } from '@/components/ui/Rule';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';

type ScreenScaffoldProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
  /**
   * The ornament under the eyebrow. `accent` is the short gold tick used
   * everywhere; `lattice` is the diamond band, reserved for Home so the app's
   * front door carries the cultural detail without every screen repeating it.
   */
  accentVariant?: 'accent' | 'lattice';
};

/**
 * The editorial page frame every tab shares: a tracked overline, an accent
 * tick, a serif display title, and a measured subtitle — then generous space
 * before the content begins.
 *
 * Whitespace here is intentional and load-bearing. Resist compressing it.
 */
export function ScreenScaffold({
  eyebrow,
  title,
  subtitle,
  children,
  accentVariant = 'accent',
}: ScreenScaffoldProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + theme.spacing['2xl'],
          paddingBottom: theme.spacing['3xl'],
          paddingHorizontal: theme.layout.screenPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: reduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: theme.motion.durations.base }}
        >
          <Text
            style={[
              theme.typography.overline,
              { color: theme.colors.textMuted, marginBottom: theme.spacing.md },
            ]}
          >
            {eyebrow}
          </Text>

          {accentVariant === 'lattice' ? (
            <LatticeRule
              height={8}
              unit={10}
              // The default stroke is already 45% alpha; multiplying it by the
              // hairline opacity again left the band at ~13% and it read as a
              // rendering artefact. As an *accent* rather than a divider this
              // needs the confidence of the gold tick it replaced.
              strokeColor={theme.motif.strokeStrong}
              opacity={0.6}
              style={{ marginBottom: theme.spacing.lg, width: 110 }}
            />
          ) : (
            <Rule variant="short" style={{ marginBottom: theme.spacing.lg }} />
          )}

          <Text
            style={[
              theme.typography.display,
              { color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              theme.typography.bodyLg,
              styles.subtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {subtitle}
          </Text>
        </MotiView>

        <Rule
          style={{
            marginTop: theme.spacing['2xl'],
            marginBottom: theme.spacing['2xl'],
          }}
        />

        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  subtitle: {
    // Keeps the measure near 60 characters — the readable range for body copy.
    maxWidth: 460,
  },
});
