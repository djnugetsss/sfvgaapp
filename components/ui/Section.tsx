import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { DotPattern } from '@/components/ui/DotPattern';
import { useTheme } from '@/theme';

type SectionProps = {
  children: ReactNode;
  /** `muted` is the tinted band, `pattern` the dotted cream, `primary` the crimson band. */
  tone?: 'plain' | 'muted' | 'pattern' | 'primary';
  style?: ViewStyle;
  /** Any ID for the scroll-to measurement. */
  onLayoutY?: (y: number) => void;
};

/**
 * A full-bleed band with the content held to the web app's 700pt column.
 * Every tab is a stack of these, which is how the Base44 pages are built.
 */
export function Section({ children, tone = 'plain', style, onLayoutY }: SectionProps) {
  const theme = useTheme();
  const background =
    tone === 'primary'
      ? theme.colors.primary
      : tone === 'muted'
        ? theme.colors.surface
        : theme.colors.background;

  return (
    <View
      onLayout={onLayoutY ? (e) => onLayoutY(e.nativeEvent.layout.y) : undefined}
      style={[
        {
          backgroundColor: background,
          paddingVertical: theme.spacing.xl,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {tone === 'pattern' ? <DotPattern /> : null}
      <View
        style={{
          width: '100%',
          maxWidth: theme.layout.contentMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: theme.layout.screenPadding,
        }}
      >
        {children}
      </View>
    </View>
  );
}
