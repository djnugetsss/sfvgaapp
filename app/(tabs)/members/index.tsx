import { useRouter } from 'expo-router';
import { Text } from 'react-native';

import { ImageCard } from '@/components/site/ImageCard';
import { InfoCard } from '@/components/site/InfoCard';
import { BulletList } from '@/components/ui/BulletList';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { TextLink } from '@/components/ui/TextLink';
import { LOCAL_IMAGES, YOUTH_CPR_IMAGE_KEY, YOUTH_HOURS_IMAGE_URL } from '@/constants/assets';
import { BOARD_CONTACT, MEMBERS_COPY } from '@/constants/content';
import { useOpenLink } from '@/hooks/useOpenLink';
import { useMembershipPlans, useYouthCprResource, useYouthHoursResource } from '@/services';
import { fontFamilies, useTheme } from '@/theme';

export default function MembersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const openLink = useOpenLink();
  const { data: plans } = useMembershipPlans();
  const { data: cpr } = useYouthCprResource();
  const { data: hours } = useYouthHoursResource();
  const copy = MEMBERS_COPY;

  return (
    <ScreenScaffold>
      <Section tone="pattern">
        <SectionHeader eyebrow={copy.resources.eyebrow} />
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
          {copy.resources.intro}{' '}
          <Text style={{ color: theme.colors.primary, fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined }}>
            {BOARD_CONTACT.email}
          </Text>
          .
        </Text>
        <BulletList
          items={(plans ?? []).map((p) => `$${p.price} - ${p.name}`)}
        />
        <InfoCard icon={copy.renewal.icon} title={copy.renewal.title} body={copy.renewal.body}>
          <TextLink label={`${copy.renewal.action} →`} onPress={() => router.push('/members/renew')} />
        </InfoCard>
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow={copy.youth.eyebrow} body={copy.youth.body} />
        <ImageCard
          image={LOCAL_IMAGES[YOUTH_CPR_IMAGE_KEY] ?? null}
          imageAlt={copy.youth.cpr.imageAlt}
          title={copy.youth.cpr.title}
          body={copy.youth.cpr.body}
        >
          {cpr ? (
            <TextLink label={copy.youth.cpr.action} icon="external-link" accessibilityHint={copy.youth.cpr.actionHint} onPress={() => openLink(cpr.url)} />
          ) : null}
        </ImageCard>
        <ImageCard
          image={YOUTH_HOURS_IMAGE_URL}
          imageAlt={copy.youth.hours.imageAlt}
          title={copy.youth.hours.title}
          body={copy.youth.hours.body}
        >
          {hours ? (
            <TextLink label={copy.youth.hours.action} icon="external-link" accessibilityHint={copy.youth.hours.actionHint} onPress={() => openLink(hours.url)} />
          ) : null}
        </ImageCard>
      </Section>
    </ScreenScaffold>
  );
}
