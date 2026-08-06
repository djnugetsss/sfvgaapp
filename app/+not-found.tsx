import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Rule } from '@/components/ui/Rule';
import { useTheme } from '@/theme';

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View
        style={[
          styles.root,
          {
            backgroundColor: theme.colors.background,
            padding: theme.layout.screenPadding,
          },
        ]}
      >
        <Rule variant="short" style={{ marginBottom: theme.spacing.lg }} />

        <Text
          style={[
            theme.typography.h1,
            { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
          ]}
        >
          This page doesn’t exist.
        </Text>

        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textSecondary, marginBottom: theme.spacing.xl },
          ]}
        >
          The link may be out of date, or the section hasn’t been published yet.
        </Text>

        <Link href="/" style={[theme.typography.body, { color: theme.colors.primary }]}>
          Return home
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
  },
});
