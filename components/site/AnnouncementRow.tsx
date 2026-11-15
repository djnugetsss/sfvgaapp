import Feather from '@expo/vector-icons/Feather';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { MotionPressable } from '@/components/ui/MotionPressable';
import type { Announcement } from '@/types';
import { fontFamilies, useTheme } from '@/theme';

function relative(iso: string): string | null {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return null;
  }
}

/** One community note: megaphone tile, title, two lines of body, relative time. */
export function AnnouncementRow({ item, onPress }: { item: Announcement; onPress?: () => void }) {
  const theme = useTheme();
  const when = relative(item.date);

  return (
    <MotionPressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${item.title}. ${item.body}`}
      disabled={!onPress}
      pressedScale={0.985}
      onPress={onPress}
    >
      <View style={[styles.row, { borderBottomColor: theme.colors.border, paddingVertical: theme.spacing.md }]}>
        <View style={[styles.icon, { backgroundColor: theme.colors.accentWash }]}>
          <Feather name="volume-2" size={18} color={theme.colors.primary} />
        </View>
        <View style={styles.copy}>
          <Text
            numberOfLines={1}
            style={[
              theme.typography.body,
              { color: theme.colors.textPrimary, fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined },
            ]}
          >
            {item.title}
          </Text>
          <Text numberOfLines={2} style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 2 }]}>
            {item.body}
          </Text>
          {when ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 4 }]}>{when}</Text>
          ) : null}
        </View>
        {onPress ? <Feather name="chevron-right" size={16} color={theme.colors.textMuted} /> : null}
      </View>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  copy: { flex: 1, minWidth: 0 },
});
