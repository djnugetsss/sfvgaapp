import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { useTheme } from '@/theme';

type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label: string;
  /** Shown under the field in the error colour; also announced. */
  error?: string | null;
};

/**
 * A labelled text input in the app's voice: overline label above, a surface
 * field with a hairline border that turns gold on focus, and an error line
 * beneath when there is one.
 *
 * The label is a visible `Text`, not a placeholder — a placeholder disappears
 * the moment someone starts typing, which is exactly when they most need to
 * know which field they are in.
 */
export function TextField({ label, error, multiline, ...inputProps }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.error
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text
        style={[
          theme.typography.overline,
          { color: theme.colors.textMuted, marginBottom: theme.spacing.xs },
        ]}
      >
        {label}
      </Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={error ?? undefined}
        placeholderTextColor={theme.colors.textMuted}
        onFocus={(event) => {
          setFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          inputProps.onBlur?.(event);
        }}
        style={[
          theme.typography.body,
          styles.input,
          {
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
            borderColor,
            borderRadius: theme.radii.sm,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm + 4,
            minHeight: multiline ? 120 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            theme.typography.caption,
            { color: theme.colors.error, marginTop: theme.spacing.xs },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
  },
});
