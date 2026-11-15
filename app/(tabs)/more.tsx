import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ContactSections } from '@/components/site/ContactSections';
import { InfoCard } from '@/components/site/InfoCard';
import { BulletList } from '@/components/ui/BulletList';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { TextLink } from '@/components/ui/TextLink';
import { LEGAL_COPY, MORE_COPY, type SectionId } from '@/constants/content';
import { useOpenLink } from '@/hooks/useOpenLink';
import { useGovernanceRecords, useMission, useResource, useRoles } from '@/services';
import { fontFamilies, useTheme } from '@/theme';

export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const openLink = useOpenLink();
  const copy = MORE_COPY;
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Partial<Record<SectionId, number>>>({});
  const { data: mission } = useMission();
  const { data: roles } = useRoles();
  const { data: records } = useGovernanceRecords();
  const { data: bylaws } = useResource('bylaws');

  const mark = (id: SectionId) => (y: number) => {
    offsets.current[id] = y;
  };
  const scrollTo = (id: SectionId) => {
    const y = offsets.current[id];
    if (y !== undefined) scrollRef.current?.scrollTo({ y, animated: true });
  };

  const semi = theme.fontsLoaded ? fontFamilies.semiBold : undefined;
  const statement = (mission ?? []).filter((m) => m.kind === 'statement');
  const points = (mission ?? []).filter((m) => m.kind === 'point');
  const boardRoles = (roles ?? []).filter((r) => r.scope === 'board');
  const committeeRoles = (roles ?? []).filter((r) => r.scope === 'committee');
  const minutes = (records ?? []).filter((r) => r.group === 'minutes');
  const agm = (records ?? []).filter((r) => r.group === 'agm');

  const group = (title: string, items: typeof minutes) =>
    items.length === 0 ? null : (
      <View style={{ marginTop: theme.spacing.md }}>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, fontFamily: semi }]}>{title}</Text>
        {items.map((r) => (
          <TextLink key={r.id} label={r.label} icon="external-link" onPress={() => openLink(r.url)} />
        ))}
      </View>
    );

  return (
    <ScreenScaffold scrollRef={scrollRef}>
      <Section tone="pattern">
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} body={copy.subtitle} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
          {copy.sections.map((s) => (
            <View key={s.id} style={{ width: '50%', padding: 6 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={s.label}
                onPress={() => scrollTo(s.id)}
                style={({ pressed }) => [
                  theme.shadows.sm,
                  {
                    alignItems: 'center',
                    paddingVertical: theme.spacing.md,
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                    borderRadius: theme.radii.md,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Feather name={s.icon} size={22} color={theme.colors.primary} />
                <Text style={[theme.typography.caption, { color: theme.colors.textPrimary, marginTop: 6, fontFamily: semi }]}>
                  {s.label}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </Section>

      <Section tone="muted" onLayoutY={mark('mission')}>
        <SectionHeader eyebrow={copy.mission.title} />
        {statement.map((m) => (
          <Text key={m.id} style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }]}>
            {m.text}
          </Text>
        ))}
        {points.length > 0 ? (
          <View style={{ marginTop: theme.spacing.sm }}>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, fontFamily: semi, marginBottom: theme.spacing.sm }]}>
              {copy.mission.pointsTitle}
            </Text>
            <BulletList items={points.map((p) => p.text)} />
          </View>
        ) : null}
        <TextLink label={`${copy.mission.join} →`} onPress={() => router.navigate('/members')} style={{ marginTop: theme.spacing.sm }} />
      </Section>

      <Section onLayoutY={mark('roles')}>
        <SectionHeader eyebrow={copy.roles.title} body={copy.roles.body} />
        {boardRoles.map((r) => (
          <InfoCard key={r.id} title={r.title}>
            <View style={{ marginTop: theme.spacing.sm }}>
              <BulletList items={r.responsibilities} />
            </View>
          </InfoCard>
        ))}
        {committeeRoles.length > 0 ? (
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, fontFamily: semi, marginVertical: theme.spacing.sm }]}>
            {copy.roles.committeeTitle}
          </Text>
        ) : null}
        {committeeRoles.map((r) => (
          <InfoCard key={r.id} title={r.title}>
            <View style={{ marginTop: theme.spacing.sm }}>
              <BulletList items={r.responsibilities} />
            </View>
          </InfoCard>
        ))}
      </Section>

      <Section tone="muted" onLayoutY={mark('minutes')}>
        <SectionHeader eyebrow={copy.minutes.title} body={copy.minutes.body} />
        {group(copy.minutes.groups.minutes, minutes)}
        {group(copy.minutes.groups.agm, agm)}
        <TextLink
          label={copy.minutes.archive}
          icon="external-link"
          onPress={() => openLink(copy.minutes.archiveUrl)}
          style={{ marginTop: theme.spacing.md }}
        />
      </Section>

      <Section onLayoutY={mark('bylaws')}>
        <SectionHeader eyebrow={copy.bylaws.title} body={copy.bylaws.body} />
        {bylaws ? <TextLink label={copy.bylaws.action} icon="download" onPress={() => openLink(bylaws.url)} /> : null}
      </Section>

      <ContactSections onLayoutY={mark('contact')} />

      <Section tone="muted" onLayoutY={mark('legal')}>
        <SectionHeader eyebrow={LEGAL_COPY.eyebrow} />
        {LEGAL_COPY.links.map((l) => (
          <TextLink key={l.path} label={l.label} icon="external-link" onPress={() => openLink(`${LEGAL_COPY.site}${l.path}`)} />
        ))}
      </Section>
    </ScreenScaffold>
  );
}
