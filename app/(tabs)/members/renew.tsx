import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { InfoCard } from '@/components/site/InfoCard';
import { Checkbox } from '@/components/forms/Checkbox';
import { ChoiceList } from '@/components/forms/ChoiceList';
import { TextField } from '@/components/forms/TextField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { TextLink } from '@/components/ui/TextLink';
import { BOARD_CONTACT, MEMBERSHIP_COPY } from '@/constants/content';
import { useOpenLink } from '@/hooks/useOpenLink';
import { useMembershipPlans, useResource } from '@/services';
import { fontFamilies, useTheme } from '@/theme';
import { composeEmail, looksLikeEmail } from '@/utils/mail';

const APPLY_URL = 'https://sfvga.org/membership';

type Errors = { name?: string; email?: string; plan?: string; agreement?: string };

export default function RenewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const openLink = useOpenLink();
  const copy = MEMBERSHIP_COPY;
  const { data: plans } = useMembershipPlans();
  const { data: bylaws } = useResource('bylaws');
  const renewable = (plans ?? []).filter((p) => p.renewable);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'form' | 'sent' | 'nomail'>('form');

  const back = () => (router.canGoBack() ? router.back() : router.navigate('/members'));

  const submit = async () => {
    const next: Errors = {};
    if (name.trim() === '') next.name = copy.renew.errors.name;
    if (!looksLikeEmail(email)) next.email = copy.renew.errors.email;
    const plan = renewable.find((p) => p.id === planId);
    if (!plan) next.plan = copy.renew.errors.plan;
    if (!agreed) next.agreement = copy.renew.errors.agreement;
    setErrors(next);
    if (!plan || Object.keys(next).length > 0) return;

    const ok = await composeEmail({
      to: BOARD_CONTACT.email,
      subject: copy.renew.subject.replace('{name}', name.trim()),
      body: [
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Membership: ${plan.name} ($${plan.price})`,
        'I have reviewed and agree to the SFVGA By-Laws and Terms & Conditions.',
      ].join('\n'),
    });
    setStatus(ok ? 'sent' : 'nomail');
  };

  const semi = theme.fontsLoaded ? fontFamilies.semiBold : undefined;

  return (
    <ScreenScaffold onBack={back} backLabel="Back to Members">
      <Section tone="pattern">
        <SectionHeader eyebrow={copy.renew.eyebrow} />
        {status === 'form' ? (
          <View>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
              {copy.renew.intro}{' '}
              <Text onPress={() => openLink(APPLY_URL)} accessibilityRole="link" style={{ color: theme.colors.accent, fontFamily: semi }}>
                {copy.renew.applyLink}
              </Text>
              .
            </Text>
            <TextField label={copy.renew.nameLabel} value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" autoComplete="name" />
            <TextField label={copy.renew.emailLabel} value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <ChoiceList
              label={copy.renew.planLabel}
              choices={renewable.map((p) => ({ id: p.id, label: p.name, detail: `$${p.price}` }))}
              selectedId={planId}
              onSelect={setPlanId}
              error={errors.plan}
            />
            <Checkbox checked={agreed} onChange={setAgreed} accessibilityLabel={copy.renew.agreement}>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                {copy.renew.agreement}{' '}
                {bylaws ? (
                  <Text onPress={() => openLink(bylaws.url)} accessibilityRole="link" style={{ color: theme.colors.accent, fontFamily: semi }}>
                    {copy.renew.bylawsLink}
                  </Text>
                ) : null}
              </Text>
            </Checkbox>
            {errors.agreement ? (
              <Text style={[theme.typography.caption, { color: theme.colors.error }]}>{errors.agreement}</Text>
            ) : null}
            <PrimaryButton
              label={copy.renew.submit}
              icon="send"
              accessibilityHint={copy.renew.submitHint}
              onPress={() => void submit()}
              style={{ marginTop: theme.spacing.md }}
            />
          </View>
        ) : (
          <View>
            <InfoCard icon="check-circle" title={copy.done.title} body={status === 'sent' ? copy.done.body : copy.done.noMailApp}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, fontFamily: semi, marginTop: theme.spacing.md }]}>
                {copy.done.zelleTitle}
              </Text>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: theme.spacing.xs }]}>
                {copy.done.zelleBody}{' '}
                <Text style={{ color: theme.colors.primary, fontFamily: semi }}>{BOARD_CONTACT.email}</Text>.
              </Text>
            </InfoCard>
            <TextLink label={copy.done.again} icon="rotate-ccw" onPress={() => setStatus('form')} />
            <TextLink label={copy.done.back} icon="arrow-left" onPress={back} />
          </View>
        )}
      </Section>
    </ScreenScaffold>
  );
}
