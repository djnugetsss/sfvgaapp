import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AnnouncementRow } from '@/components/site/AnnouncementRow';
import { MomentsGallery } from '@/components/site/MomentsGallery';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { TextLink } from '@/components/ui/TextLink';
import { HOME_COPY, NOTES_COPY } from '@/constants/content';
import { HOME_WELCOME_IMAGE_URL } from '@/constants/assets';
import { IMAGE_BLURHASH } from '@/constants/images';
import { useAnnouncements, useFeaturedEvent } from '@/services';
import { fontFamilies, useTheme } from '@/theme';
import { resolveImageSource } from '@/utils/imageSource';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: event, isLoading } = useFeaturedEvent();
  const { data: notes } = useAnnouncements();
  const heroSource = event ? resolveImageSource(event.heroImage) : null;

  const semi = theme.fontsLoaded ? fontFamilies.semiBold : undefined;

  return (
    <ScreenScaffold>
      <Section tone="pattern">
        <SectionHeader eyebrow={HOME_COPY.community.eyebrow} body={HOME_COPY.community.body} />
        <Image
          source={{ uri: HOME_WELCOME_IMAGE_URL }}
          placeholder={{ blurhash: IMAGE_BLURHASH }}
          contentFit="cover"
          transition={theme.motion.durations.base}
          accessibilityLabel={HOME_COPY.community.imageAlt}
          style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: theme.radii.md }}
        />
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow={HOME_COPY.upcoming.eyebrow} />
        {isLoading ? <LoadingState compact /> : null}
        {!isLoading && !event ? (
          <EmptyState headline={HOME_COPY.upcoming.emptyHeadline} body={HOME_COPY.upcoming.emptyBody} />
        ) : null}
        {event ? (
          <View>
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, fontFamily: semi }]}>{event.title}</Text>
            {event.teaser ? (
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: theme.spacing.sm }]}>
                {event.teaser}
              </Text>
            ) : null}
            <View style={{ marginTop: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="calendar" size={16} color={theme.colors.secondary} />
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginLeft: 8 }]}>{event.dateLabel}</Text>
              </View>
              {event.location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <Feather name="map-pin" size={16} color={theme.colors.secondary} />
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginLeft: 8 }]}>{event.location}</Text>
                </View>
              ) : null}
            </View>
            {heroSource !== null ? (
              <Image
                source={heroSource}
                placeholder={{ blurhash: IMAGE_BLURHASH }}
                contentFit="cover"
                transition={theme.motion.durations.base}
                accessibilityLabel={event.title}
                style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: theme.radii.md, marginTop: theme.spacing.md }}
              />
            ) : null}
            <TextLink
              label={`${HOME_COPY.upcoming.action} →`}
              icon="arrow-right"
              onPress={() => router.navigate('/events')}
              style={{ marginTop: theme.spacing.sm }}
            />
          </View>
        ) : null}
      </Section>

      <Section>
        <SectionHeader eyebrow={HOME_COPY.updates.eyebrow} />
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, fontFamily: semi }]}>{HOME_COPY.updates.title}</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: theme.spacing.xs }]}>
          {HOME_COPY.updates.body}
        </Text>
        <TextLink label={`${HOME_COPY.updates.action} →`} onPress={() => router.navigate('/members/renew')} style={{ marginTop: theme.spacing.xs }} />
      </Section>

      {(notes ?? []).length > 0 ? (
        <Section tone="muted">
          <SectionHeader eyebrow={NOTES_COPY.eyebrow} />
          {(notes ?? []).slice(0, 3).map((a) => (
            <AnnouncementRow key={a.id} item={a} onPress={() => router.push('/events/updates')} />
          ))}
          <TextLink label={`${NOTES_COPY.seeAll} →`} onPress={() => router.push('/events/updates')} style={{ marginTop: theme.spacing.xs }} />
        </Section>
      ) : null}

      <MomentsGallery />
    </ScreenScaffold>
  );
}
