import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationsSheet } from '@/components/site/NotificationsSheet';
import { BRAND_LOGO } from '@/constants/assets';
import { HEADER_COPY } from '@/constants/content';
import { fontFamilies, useTheme } from '@/theme';

/** Logo, wordmark and the notifications bell — the web app's sticky header. */
export function SiteHeader() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: theme.colors.chrome,
        borderBottomWidth: theme.layout.hairline,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View style={[styles.row, { height: theme.layout.headerHeight, paddingHorizontal: theme.layout.screenPadding }]}>
        <Image
          source={BRAND_LOGO}
          contentFit="contain"
          accessibilityLabel={HEADER_COPY.logoLabel}
          style={{ width: 40, height: 40 }}
        />
        <Text
          numberOfLines={2}
          style={[
            theme.typography.caption,
            styles.name,
            {
              color: theme.colors.primary,
              marginLeft: theme.spacing.sm + 2,
              fontFamily: theme.fontsLoaded ? fontFamilies.bold : undefined,
              fontWeight: '700',
              letterSpacing: 0.4,
            },
          ]}
        >
          {HEADER_COPY.name}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={HEADER_COPY.notifications}
          accessibilityHint={HEADER_COPY.notificationsHint}
          onPress={() => setOpen(true)}
          hitSlop={8}
          style={styles.bell}
        >
          <Feather name="bell" size={22} color={theme.colors.textPrimary} />
          <View style={[styles.dot, { backgroundColor: theme.colors.primary, borderColor: theme.colors.background }]} />
        </Pressable>
      </View>
      <NotificationsSheet visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { flex: 1 },
  bell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
});
