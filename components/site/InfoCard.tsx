import Feather from '@expo/vector-icons/Feather';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { fontFamilies, useTheme } from '@/theme';
import type { FeatherIconName } from '@/types';

type InfoCardProps = {
  icon?: FeatherIconName;
  title: string;
  body?: string | null;
  children?: ReactNode;
};

/** A plain bordered card: optional icon, semibold title, body, then any actions. */
export function InfoCard({ icon, title, body, children }: InfoCardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        theme.shadows.sm,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
        },
      ]}
    >
      {icon ? <Feather name={icon} size={22} color={theme.colors.primary} style={{ marginBottom: theme.spacing.sm }} /> : null}
      <Text
        style={[
          theme.typography.h3,
          { color: theme.colors.textPrimary, fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined },
        ]}
      >
        {title}
      </Text>
      {body ? (
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: theme.spacing.xs }]}>{body}</Text>
      ) : null}
      {children}
    </View>
  );
}
