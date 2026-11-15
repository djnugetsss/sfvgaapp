import { useRouter } from 'expo-router';

import { EventRow } from '@/components/site/EventRow';
import { ImageCard } from '@/components/site/ImageCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { TextLink } from '@/components/ui/TextLink';
import { EVENTS_COPY, STATUS_COPY } from '@/constants/content';
import { useEvents } from '@/services';
import { Text } from 'react-native';
import { useTheme } from '@/theme';

export default function EventsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, isError } = useEvents();

  return (
    <ScreenScaffold>
      <Section tone="pattern">
        <SectionHeader eyebrow="Events" />
        {isLoading ? <LoadingState /> : null}
        {isError ? <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>{STATUS_COPY.error}</Text> : null}
        {!isLoading && !isError && (data ?? []).length === 0 ? (
          <EmptyState headline={EVENTS_COPY.empty.headline} body={EVENTS_COPY.empty.body} />
        ) : null}
        {(data ?? []).slice(0, 1).map((event) => (
          <ImageCard
            key={event.id}
            image={event.heroImage}
            imageAlt={event.title}
            tag={event.tag}
            title={event.title}
            meta={{ icon: 'calendar', text: event.dateLabel }}
            body={event.description}
          >
            <TextLink
              label={`${EVENTS_COPY.viewDetails} →`}
              onPress={() => router.push({ pathname: '/events/[id]', params: { id: event.id } })}
              style={{ marginTop: theme.spacing.xs }}
            />
          </ImageCard>
        ))}
        {(data ?? []).slice(1).map((event) => (
          <EventRow
            key={event.id}
            event={event}
            onPress={() => router.push({ pathname: '/events/[id]', params: { id: event.id } })}
          />
        ))}
      </Section>
    </ScreenScaffold>
  );
}
