import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { IMAGE_BLURHASH } from '@/constants/images';
import { fontFamilies, useTheme } from '@/theme';
import type { FeatherIconName } from '@/types';
import { resolveImageSource } from '@/utils/imageSource';

type ImageCardProps = {
  image: string | number | null;
  imageAlt: string;
  /** Overline above the title. */
  tag?: string;
  title: string;
  /** Icon + text row under the title, e.g. the date. */
  meta?: { icon: FeatherIconName; text: string };
  body?: string | null;
  children?: ReactNode;
};

/** The card the web app uses for events, youth programmes and resources: 4:3 picture, text below. */
export function ImageCard({ image, imageAlt, tag, title, meta, body, children }: ImageCardProps) {
  const theme = useTheme();
  const source = typeof image === 'number' ? image : resolveImageSource(image);

  return (
    <View
      style={[
        theme.shadows.sm,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radii.md,
          overflow: 'hidden',
          marginBottom: theme.spacing.md,
        },
      ]}
    >
      {source !== null ? (
        <Image
          source={source}
          placeholder={{ blurhash: IMAGE_BLURHASH }}
          contentFit="cover"
          transition={theme.motion.durations.base}
          accessibilityLabel={imageAlt}
          style={{ width: '100%', aspectRatio: 4 / 3 }}
        />
      ) : null}
      <View style={{ padding: theme.spacing.md }}>
        {tag ? (
          <Text style={[theme.typography.overline, { color: theme.colors.primary, marginBottom: theme.spacing.xs }]}>
            {tag}
          </Text>
        ) : null}
        <Text
          style={[
            theme.typography.h3,
            { color: theme.colors.textPrimary, fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined },
          ]}
        >
          {title}
        </Text>
        {meta ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm }}>
            <Feather name={meta.icon} size={15} color={theme.colors.secondary} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 6, flex: 1 }]}>
              {meta.text}
            </Text>
          </View>
        ) : null}
        {body ? (
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: theme.spacing.sm }]}>
            {body}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}
