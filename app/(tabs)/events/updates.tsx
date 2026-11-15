import { Text } from 'react-native';
import { useRouter } from 'expo-router';

import { AnnouncementRow } from '@/components/site/AnnouncementRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { NOTES_COPY, STATUS_COPY } from '@/constants/content';
import { useAnnouncements } from '@/services';
import { useTheme } from '@/theme';

/** Every community note, newest first — reached from Home's "See all" and the bell. */
export default function UpdatesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, isError } = useAnnouncements();
  const back = () => (router.canGoBack() ? router.back() : router.navigate('/'));

  return (
    <ScreenScaffold onBack={back}>
      <Section tone="pattern">
        <SectionHeader eyebrow={NOTES_COPY.listTitle} />
        {isLoading ? <LoadingState /> : null}
        {isError ? <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>{STATUS_COPY.error}</Text> : null}
        {!isLoading && !isError && (data ?? []).length === 0 ? (
          <EmptyState headline={NOTES_COPY.empty.title} body={NOTES_COPY.empty.body} />
        ) : null}
        {(data ?? []).map((a) => (
          <AnnouncementRow key={a.id} item={a} />
        ))}
      </Section>
    </ScreenScaffold>
  );
}
