import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Rule } from '@/components/ui/Rule';
import { Section } from '@/components/ui/Section';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { TextLink } from '@/components/ui/TextLink';
import { EVENTS_COPY } from '@/constants/content';
import { IMAGE_BLURHASH } from '@/constants/images';
import { useEvent } from '@/services';
import { fontFamilies, useTheme } from '@/theme';
import { resolveImageSource } from '@/utils/imageSource';

export default function EventDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id ?? null);
  const source = event ? resolveImageSource(event.heroImage) : null;
  const back = () => (router.canGoBack() ? router.back() : router.navigate('/events'));

  return (
    <ScreenScaffold onBack={back} backLabel="Back">
      <Section tone="pattern">
        {isLoading ? <LoadingState /> : null}
        {!isLoading && !event ? (
          <View>
            <EmptyState headline={EVENTS_COPY.notFound.headline} body={EVENTS_COPY.notFound.body} />
            <TextLink label={EVENTS_COPY.notFound.action} onPress={() => router.navigate('/events')} />
          </View>
        ) : null}
        {event ? (
          <View>
            <Text style={[theme.typography.overline, { color: theme.colors.primary }]}>{event.tag}</Text>
            <Rule variant="short" style={{ marginVertical: theme.spacing.sm }} />
            <Text
              accessibilityRole="header"
              style={[theme.typography.h1, { color: theme.colors.textPrimary, fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined }]}
            >
              {event.title}
            </Text>
            <View style={{ marginTop: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="calendar" size={16} color={theme.colors.secondary} />
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginLeft: 8 }]}>{event.dateLabel}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Feather name="map-pin" size={16} color={theme.colors.secondary} />
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginLeft: 8 }]}>
                  {event.location ?? EVENTS_COPY.fallbackLocation}
                </Text>
              </View>
            </View>
            {source !== null ? (
              <Image
                source={source}
                placeholder={{ blurhash: IMAGE_BLURHASH }}
                contentFit="cover"
                transition={theme.motion.durations.base}
                accessibilityLabel={event.title}
                style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: theme.radii.md, marginTop: theme.spacing.md }}
              />
            ) : null}
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: theme.spacing.md }]}>
              {event.description}
            </Text>
          </View>
        ) : null}
      </Section>
    </ScreenScaffold>
  );
}
