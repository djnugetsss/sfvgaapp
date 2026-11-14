import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Checkbox } from '@/components/forms/Checkbox';
import { ChoiceList, type Choice } from '@/components/forms/ChoiceList';
import { TextField } from '@/components/forms/TextField';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Rule } from '@/components/ui/Rule';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TextLink } from '@/components/ui/TextLink';
import {
  BOARD_CONTACT,
  MEMBERSHIP_COPY,
  MORE_COPY,
  STATUS_COPY,
} from '@/constants/content';
import { useOpenLink } from '@/hooks/useOpenLink';
import { useMembershipPlans, useResource } from '@/services';
import { useTheme } from '@/theme';
import type { MembershipPlan } from '@/types';
import { resolveContent } from '@/utils/content';
import { composeEmail, looksLikeEmail } from '@/utils/mail';

const copy = MEMBERSHIP_COPY;

const formatPrice = (plan: MembershipPlan): string => `$${plan.price}`;

type Errors = Partial<Record<'name' | 'email' | 'plan' | 'agreement', string>>;

/** Where a submitted renewal landed. */
type Outcome = 'sent' | 'no-mail-app';

/**
 * Membership — what it costs, how to pay, and renewal for existing members.
 *
 * Ported from the Base44 site's Members and Renew pages, merged into one
 * screen because they answer one question ("how do I stay a member?") and a
 * phone does not need two pages for it.
 *
 * **Renewal has no backend of its own, on purpose.** The web version showed a
 * thank-you and sent nothing anywhere. Here the form composes an email to the
 * board inbox with everything filled in, and the member presses Send in their
 * own mail app — so the board actually receives it, and receives it from an
 * address it can reply to. Payment stays Zelle, exactly as the association
 * runs it today.
 *
 * Dues come from the `membershipPlans` collection. The application and
 * by-laws links come from `resources`, so this screen holds no URL.
 */
export default function MembershipScreen() {
  const theme = useTheme();
  const router = useRouter();
  const openLink = useOpenLink();

  const plans = useMembershipPlans();
  const application = useResource('membership');
  const bylaws = useResource('bylaws');
  const applicationUrl = resolveContent(application.data?.url);
  const bylawsUrl = resolveContent(bylaws.data?.url);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const renewable = useMemo(
    () => (plans.data ?? []).filter((plan) => plan.renewable),
    [plans.data],
  );

  const choices = useMemo<Choice[]>(
    () =>
      renewable.map((plan) => ({
        id: plan.id,
        label: plan.name,
        detail: formatPrice(plan),
      })),
    [renewable],
  );

  const validate = (): Errors => {
    const next: Errors = {};
    if (name.trim().length === 0) next.name = copy.renew.errors.name;
    if (!looksLikeEmail(email)) next.email = copy.renew.errors.email;
    if (renewable.find((plan) => plan.id === planId) === undefined) {
      next.plan = copy.renew.errors.plan;
    }
    if (!agreed) next.agreement = copy.renew.errors.agreement;
    return next;
  };

  const submit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    const plan = renewable.find((candidate) => candidate.id === planId);
    if (plan === undefined) {
      return;
    }

    const opened = await composeEmail({
      to: BOARD_CONTACT.email,
      subject: copy.renew.subject.replace('{name}', name.trim()),
      body: [
        'Hello SFVGA Board,',
        '',
        'I would like to renew my membership. There are no changes to my information.',
        '',
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Membership type: ${plan.name} (${formatPrice(plan)})`,
        '',
        'I have reviewed and agree to the SFVGA Association By-Laws and Terms & Conditions.',
        `I will send my dues via Zelle to ${BOARD_CONTACT.email}.`,
        '',
        'Thank you,',
        name.trim(),
      ].join('\n'),
    });

    setOutcome(opened ? 'sent' : 'no-mail-app');
  };

  const reset = () => {
    setName('');
    setEmail('');
    setPlanId(null);
    setAgreed(false);
    setErrors({});
    setOutcome(null);
  };

  const renderPlans = () => {
    if (plans.isPending) {
      return <LoadingState />;
    }
    if (plans.isError) {
      return (
        <Text style={[theme.typography.body, { color: theme.colors.error }]}>
          {STATUS_COPY.error}
        </Text>
      );
    }
    if (plans.data.length === 0) {
      return <EmptyState headline={copy.empty.headline} body={copy.empty.body} />;
    }

    return (
      <View>
        {plans.data.map((plan, index) => (
          <View
            key={plan.id}
            style={[
              styles.planRow,
              {
                paddingVertical: theme.spacing.md,
                borderTopWidth: index === 0 ? 0 : theme.layout.hairline,
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.planText}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
                {plan.name}
              </Text>
              {resolveContent(plan.note) !== null ? (
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.textMuted, marginTop: 2 },
                  ]}
                >
                  {plan.note}
                </Text>
              ) : null}
            </View>
            <Text
              style={[
                theme.typography.h2,
                { color: theme.colors.secondary, marginLeft: theme.spacing.md },
              ]}
            >
              {formatPrice(plan)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderZelle = () => (
    <View
      style={[
        styles.callout,
        {
          padding: theme.spacing.lg,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.accentWash,
        },
      ]}
    >
      <Feather
        name="credit-card"
        size={20}
        color={theme.colors.secondary}
        style={{ marginRight: theme.spacing.md, marginTop: 2 }}
      />
      <View style={styles.planText}>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
          {copy.dues.payVia}
        </Text>
        <Text
          selectable
          style={[theme.typography.bodyLg, { color: theme.colors.textPrimary }]}
        >
          {BOARD_CONTACT.email}
        </Text>
      </View>
    </View>
  );

  const renderDone = () => (
    <View
      style={[
        styles.bordered,
        theme.shadows.sm,
        {
          padding: theme.spacing.xl,
          borderRadius: theme.radii.lg,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <Feather
        name="check-circle"
        size={32}
        color={theme.colors.success}
        style={{ marginBottom: theme.spacing.md }}
      />
      <Text
        accessibilityRole="header"
        style={[
          theme.typography.h2,
          { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
        ]}
      >
        {copy.done.title}
      </Text>
      <Text
        style={[
          theme.typography.body,
          { color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
        ]}
      >
        {outcome === 'sent' ? copy.done.body : copy.done.noMailApp}
      </Text>
      <Text
        style={[
          theme.typography.overline,
          { color: theme.colors.textMuted, marginBottom: theme.spacing.xs },
        ]}
      >
        {copy.done.zelleTitle}
      </Text>
      <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
        {copy.done.zelleBody}
      </Text>
      <Text
        selectable
        style={[
          theme.typography.bodyLg,
          { color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
        ]}
      >
        {BOARD_CONTACT.email}
      </Text>
      <TextLink label={copy.done.again} icon="rotate-ccw" onPress={reset} />
    </View>
  );

  const renderForm = () => (
    <View>
      <TextField
        label={copy.renew.nameLabel}
        value={name}
        onChangeText={setName}
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
        returnKeyType="next"
        error={errors.name}
      />
      <TextField
        label={copy.renew.emailLabel}
        value={email}
        onChangeText={setEmail}
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
      />
      {choices.length > 0 ? (
        <ChoiceList
          label={copy.renew.planLabel}
          choices={choices}
          selectedId={planId}
          onSelect={setPlanId}
          error={errors.plan}
        />
      ) : null}

      <Checkbox
        checked={agreed}
        onChange={setAgreed}
        accessibilityLabel={copy.renew.agreement}
      >
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
          {copy.renew.agreement}
        </Text>
      </Checkbox>
      {errors.agreement ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[theme.typography.caption, { color: theme.colors.error }]}
        >
          {errors.agreement}
        </Text>
      ) : null}
      {bylawsUrl !== null ? (
        <TextLink
          label={copy.renew.bylawsLink}
          icon="arrow-up-right"
          onPress={() => openLink(bylawsUrl)}
        />
      ) : null}

      <PrimaryButton
        label={copy.renew.submit}
        accessibilityHint={copy.renew.submitHint}
        icon="send"
        onPress={() => void submit()}
        style={{ marginTop: theme.spacing.lg }}
      />
    </View>
  );

  return (
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      onBack={() => router.back()}
      backLabel={MORE_COPY.backLabel}
    >
      <SectionHeader eyebrow={copy.dues.eyebrow} title={copy.dues.title} />
      {renderPlans()}
      <View style={{ marginTop: theme.spacing.lg }}>{renderZelle()}</View>

      <Rule style={{ marginVertical: theme.spacing['2xl'] }} />

      <Text
        style={[
          theme.typography.overline,
          { color: theme.colors.textMuted, marginBottom: theme.spacing.sm },
        ]}
      >
        {copy.join.eyebrow}
      </Text>
      <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
        {copy.join.body}
      </Text>
      {applicationUrl !== null ? (
        <TextLink
          label={copy.join.action}
          icon="arrow-up-right"
          onPress={() => openLink(applicationUrl)}
        />
      ) : null}

      <Rule style={{ marginVertical: theme.spacing['2xl'] }} />

      <SectionHeader
        eyebrow={copy.renew.eyebrow}
        title={copy.renew.title}
        body={copy.renew.body}
      />
      {outcome !== null ? renderDone() : renderForm()}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planText: {
    flex: 1,
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bordered: {
    borderWidth: 1,
  },
});
