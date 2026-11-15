import { Text, View } from 'react-native';

import { MotionPressable } from '@/components/ui/MotionPressable';
import { fontFamilies, useTheme } from '@/theme';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  accessibilityLabel?: string;
};

type Props<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Two-or-more option switch with 48pt targets; the active segment takes the crimson wash. */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.xl,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <MotionPressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            pressedScale={0.97}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radii.lg,
              backgroundColor: selected ? theme.colors.accentWash : 'transparent',
            }}
          >
            <Text
              style={[
                theme.typography.body,
                {
                  color: selected ? theme.colors.primary : theme.colors.textSecondary,
                  fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined,
                },
              ]}
            >
              {option.label}
            </Text>
          </MotionPressable>
        );
      })}
    </View>
  );
}
