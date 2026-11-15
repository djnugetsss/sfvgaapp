import Feather from '@expo/vector-icons/Feather';
import type { ReactNode, Ref } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SiteHeader } from '@/components/site/SiteHeader';
import { HEADER_COPY } from '@/constants/content';
import { fontFamilies, useTheme } from '@/theme';

type ScreenScaffoldProps = {
  children?: ReactNode;
  /** Shows the "‹ Back" link above the content (pushed screens). */
  onBack?: () => void;
  backLabel?: string;
  scrollRef?: Ref<ScrollView>;
};

/** Every tab's frame: the site header, then a scrolling column of sections. */
export function ScreenScaffold({ children, onBack, backLabel = HEADER_COPY.back, scrollRef }: ScreenScaffoldProps) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SiteHeader />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: theme.spacing['2xl'] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        {onBack !== undefined ? (
          <View
            style={{
              width: '100%',
              maxWidth: theme.layout.contentMaxWidth,
              alignSelf: 'center',
              paddingHorizontal: theme.layout.screenPadding,
              paddingTop: theme.spacing.md,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${backLabel}`}
              onPress={onBack}
              hitSlop={theme.spacing.sm}
              style={({ pressed }) => [styles.back, { paddingVertical: theme.spacing.sm, opacity: pressed ? 0.6 : 1 }]}
            >
              <Feather name="chevron-left" size={18} color={theme.colors.accent} />
              <Text
                style={[
                  theme.typography.body,
                  { color: theme.colors.accent, fontFamily: theme.fontsLoaded ? fontFamilies.medium : undefined },
                ]}
              >
                {backLabel}
              </Text>
            </Pressable>
          </View>
        ) : null}
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
});
