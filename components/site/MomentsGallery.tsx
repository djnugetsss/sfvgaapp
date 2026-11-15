import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { IMAGE_BLURHASH } from '@/constants/images';
import { HOME_COPY } from '@/constants/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useGallery } from '@/services';
import { useTheme } from '@/theme';
import { resolveImageSource } from '@/utils/imageSource';

const ADVANCE_MS = 5000;

/** "Community Moments": the crimson band with a 16:10 photo carousel. */
export function MomentsGallery() {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const { data } = useGallery();
  const photos = data ?? [];
  const [index, setIndex] = useState(0);
  const count = photos.length;

  const step = useCallback(
    (delta: number) => setIndex((i) => (count === 0 ? 0 : (i + delta + count) % count)),
    [count],
  );

  useEffect(() => {
    if (count < 2 || reduceMotion) return undefined;
    const id = setInterval(() => step(1), ADVANCE_MS);
    return () => clearInterval(id);
  }, [count, reduceMotion, step, index]);

  if (count === 0) return null;
  const current = photos[index % count];
  const source = current ? resolveImageSource(current.image) : null;

  const arrow = (name: 'chevron-left' | 'chevron-right', label: string, delta: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => step(delta)}
      style={[styles.arrow, { backgroundColor: 'rgba(254,252,246,0.2)' }]}
    >
      <Feather name={name} size={20} color={theme.colors.primaryContrast} />
    </Pressable>
  );

  return (
    <Section tone="primary">
      <SectionHeader eyebrow={HOME_COPY.moments.eyebrow} inverse />
      {source !== null ? (
        <Image
          source={source}
          placeholder={{ blurhash: IMAGE_BLURHASH }}
          contentFit="cover"
          transition={theme.motion.durations.base}
          accessibilityLabel={current?.caption ?? HOME_COPY.moments.alt}
          style={{ width: '100%', aspectRatio: 16 / 10, borderRadius: theme.radii.md }}
        />
      ) : null}
      {count > 1 ? (
        <View style={[styles.controls, { marginTop: theme.spacing.md }]}>
          {arrow('chevron-left', HOME_COPY.moments.previous, -1)}
          <View style={styles.dots}>
            {photos.map((p, i) => (
              <View
                key={p.id}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 3,
                  backgroundColor: theme.colors.primaryContrast,
                  opacity: i === index % count ? 1 : 0.4,
                }}
              />
            ))}
          </View>
          {arrow('chevron-right', HOME_COPY.moments.next, 1)}
        </View>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', alignItems: 'center' },
  arrow: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
