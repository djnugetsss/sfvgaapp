import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { MotionPressable } from '@/components/ui/MotionPressable';
import { IMAGE_BLURHASH } from '@/constants/images';
import type { EventItem } from '@/types';
import { fontFamilies, useTheme } from '@/theme';
import { resolveImageSource } from '@/utils/imageSource';

/** Compact event row: 84×76 thumbnail, title, date, chevron. */
export function EventRow({ event, onPress }: { event: EventItem; onPress: () => void }) {
  const theme = useTheme();
  const source = resolveImageSource(event.heroImage);

  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.dateLabel}`}
      pressedScale={0.985}
      onPress={onPress}
    >
      <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
        {source !== null ? (
          <Image
            source={source}
            placeholder={{ blurhash: IMAGE_BLURHASH }}
            contentFit="cover"
            accessible={false}
            style={styles.thumb}
          />
        ) : (
          <View style={[styles.thumb, { backgroundColor: theme.colors.accentWash, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={[theme.typography.h3, { color: theme.colors.primary }]}>SF</Text>
          </View>
        )}
        <View style={styles.copy}>
          <Text style={[theme.typography.overline, { color: theme.colors.primary }]} numberOfLines={1}>
            {event.tag}
          </Text>
          <Text
            numberOfLines={2}
            style={[
              theme.typography.h3,
              { color: theme.colors.textPrimary, fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined },
            ]}
          >
            {event.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Feather name="calendar" size={14} color={theme.colors.secondary} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 6, flex: 1 }]} numberOfLines={1}>
              {event.dateLabel}
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={17} color={theme.colors.textMuted} />
      </View>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  thumb: { width: 84, height: 76, borderRadius: 4, marginRight: 12 },
  copy: { flex: 1, minWidth: 0 },
});
