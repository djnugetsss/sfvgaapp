import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingState } from '@/components/ui/LoadingState';
import { TextLink } from '@/components/ui/TextLink';
import { HEADER_COPY, STATUS_COPY } from '@/constants/content';
import { useAnnouncements } from '@/services';
import { fontFamilies, useTheme } from '@/theme';

type Props = { visible: boolean; onClose: () => void };

function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

/** The bell's bottom sheet: latest announcements, newest first. */
export function NotificationsSheet({ visible, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading, isError } = useAnnouncements();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel={HEADER_COPY.close} accessibilityRole="button" />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.background,
            paddingBottom: insets.bottom + theme.spacing.md,
            paddingHorizontal: theme.layout.screenPadding,
            paddingTop: theme.spacing.md,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, flex: 1 }]}>
            {HEADER_COPY.notifications}
          </Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={HEADER_COPY.close}>
            <Feather name="x" size={22} color={theme.colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
          {isLoading ? <LoadingState compact /> : null}
          {isError ? (
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>{STATUS_COPY.error}</Text>
          ) : null}
          {(data ?? []).map((item) => (
            <View
              key={item.id}
              style={[
                styles.item,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radii.md,
                  padding: theme.spacing.md,
                  marginTop: theme.spacing.sm + 2,
                },
              ]}
            >
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{formatDate(item.date)}</Text>
              <Text
                style={[
                  theme.typography.body,
                  {
                    color: theme.colors.textPrimary,
                    fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined,
                    marginTop: 2,
                  },
                ]}
              >
                {item.title}
              </Text>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 2 }]}>{item.body}</Text>
            </View>
          ))}
        </ScrollView>

        <TextLink
          label={HEADER_COPY.viewAll}
          onPress={() => {
            onClose();
            router.navigate('/events/updates');
          }}
          style={{ marginTop: theme.spacing.sm }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(10,51,66,0.4)' },
  sheet: { borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  item: { borderWidth: 1 },
});
