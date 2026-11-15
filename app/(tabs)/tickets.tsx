import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { TicketCard } from '@/components/site/TicketCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { Section } from '@/components/ui/Section';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextLink } from '@/components/ui/TextLink';
import { TICKETS_COPY } from '@/constants/content';
import { useMyTickets } from '@/hooks/useMyTickets';
import { fontFamilies, useTheme } from '@/theme';

type Filter = 'upcoming' | 'past';

export default function TicketsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const copy = TICKETS_COPY;
  const [filter, setFilter] = useState<Filter>('upcoming');
  const { data } = useMyTickets();
  const groups = data[filter];

  return (
    <ScreenScaffold>
      <Section tone="pattern">
        <SectionHeader eyebrow={copy.title} />
        <SegmentedControl<Filter> options={copy.segments} value={filter} onChange={setFilter} />
        <View style={{ marginTop: theme.spacing.lg }}>
          {groups.length === 0 ? (
            <View>
              <EmptyState headline={copy.emptyTitle} body={copy.empty[filter]} />
              {filter === 'upcoming' ? (
                <TextLink label={`${copy.browse} →`} onPress={() => router.navigate('/events')} style={{ marginTop: theme.spacing.sm }} />
              ) : null}
            </View>
          ) : (
            groups.map((group) => (
              <View key={group.eventId} style={{ marginBottom: theme.spacing.lg }}>
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined }]}>
                  {group.eventTitle}
                </Text>
                {group.eventDateLabel ? (
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }]}>
                    {group.eventDateLabel}
                  </Text>
                ) : null}
                {group.tickets.map((t) => (
                  <TicketCard key={t.id} ticket={t} pastEvent={filter === 'past'} />
                ))}
              </View>
            ))
          )}
        </View>
      </Section>
    </ScreenScaffold>
  );
}
