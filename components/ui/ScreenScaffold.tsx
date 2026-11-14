import Feather from '@expo/vector-icons/Feather';
import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  /**
   * The rule between the header and the content.
   *
   * It divides two things, so a screen whose subtitle *is* its only prose has
   * nothing to divide — the rule there reads as a section break announcing a
   * section that never arrives. Youth turns it off for that reason. The gap it
   * leaves behind is smaller but never zero, so the header still breathes and
   * a screen whose first child fails to render does not collide with the type
   * above it.
   */
  showDivider?: boolean;
  /**
   * Renders a back control above the eyebrow. For screens pushed onto a tab's
   * own stack (the pages under More), which keep the tab bar and so need a way
   * home that is not the system swipe alone.
   */
  onBack?: () => void;
  /** Label beside the back chevron — the name of the screen it returns to. */
  backLabel?: string;
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
  showDivider = true,
  onBack,
  backLabel = 'Back',
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
        // Forms live in some scaffolds now: a tap on the submit button must
        // land while the keyboard is up, and iOS should scroll the focused
        // field clear of the keyboard rather than leave it underneath.
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        {onBack !== undefined ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Back to ${backLabel}`}
            onPress={onBack}
            hitSlop={theme.spacing.sm}
            style={({ pressed }) => [
              styles.back,
              {
                marginTop: -theme.spacing.lg,
                marginBottom: theme.spacing.lg,
                paddingVertical: theme.spacing.sm,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Feather name="chevron-left" size={20} color={theme.colors.secondary} />
            <Text
              style={[
                theme.typography.body,
                { color: theme.colors.secondary, marginLeft: theme.spacing.xs },
              ]}
            >
              {backLabel}
            </Text>
          </Pressable>
        ) : null}

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

        {showDivider ? (
          <Rule
            style={{
              marginTop: theme.spacing['2xl'],
              marginBottom: theme.spacing['2xl'],
            }}
          />
        ) : (
          <View style={{ height: theme.spacing.xl }} />
        )}

        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  subtitle: {
    // Keeps the measure near 60 characters — the readable range for body copy.
    maxWidth: 460,
  },
});
