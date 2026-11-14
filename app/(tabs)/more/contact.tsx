import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/forms/TextField';
import { Disclosure } from '@/components/ui/Disclosure';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Rule } from '@/components/ui/Rule';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TextLink } from '@/components/ui/TextLink';
import { BOARD_CONTACT, CONTACT_COPY, MORE_COPY, STATUS_COPY } from '@/constants/content';
import { useFaqs } from '@/services';
import { useTheme } from '@/theme';
import { composeEmail, looksLikeEmail } from '@/utils/mail';

const copy = CONTACT_COPY;

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;
type Outcome = 'sent' | 'no-mail-app';

/**
 * Contact & FAQ — answers first, then a way to ask.
 *
 * The FAQ leads because most people who open "Contact" have one of five
 * questions, and reading the answer is faster than waiting for a reply. The
 * form below it composes an email to the board inbox rather than posting to
 * a server — see `composeEmail` — so the message arrives from the member's
 * own address and the board can simply reply.
 */
export default function ContactScreen() {
  const theme = useTheme();
  const router = useRouter();
  const faqs = useFaqs();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const submit = async () => {
    const found: Errors = {};
    if (name.trim().length === 0) found.name = copy.form.errors.name;
    if (!looksLikeEmail(email)) found.email = copy.form.errors.email;
    if (message.trim().length === 0) found.message = copy.form.errors.message;
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    const opened = await composeEmail({
      to: BOARD_CONTACT.email,
      subject: subject.trim() || copy.form.defaultSubject,
      body: [message.trim(), '', '—', name.trim(), email.trim()].join('\n'),
    });
    setOutcome(opened ? 'sent' : 'no-mail-app');
  };

  const reset = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setErrors({});
    setOutcome(null);
  };

  const renderFaqs = () => {
    if (faqs.isPending) {
      return <LoadingState />;
    }
    if (faqs.isError) {
      return (
        <Text style={[theme.typography.body, { color: theme.colors.error }]}>
          {STATUS_COPY.error}
        </Text>
      );
    }
    // No empty state: with no questions published the section simply isn't
    // there, and the form below still works.
    return faqs.data.map((faq, index) => (
      <Disclosure key={faq.id} title={faq.question} isFirst={index === 0}>
        <Text
          selectable
          style={[theme.typography.body, { color: theme.colors.textSecondary }]}
        >
          {faq.answer}
        </Text>
      </Disclosure>
    ));
  };

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
        name="send"
        size={28}
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
      <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
        {outcome === 'sent' ? copy.done.body : copy.done.noMailApp}
      </Text>
      {outcome === 'no-mail-app' ? (
        <Text
          selectable
          style={[theme.typography.bodyLg, { color: theme.colors.textPrimary }]}
        >
          {BOARD_CONTACT.email}
        </Text>
      ) : null}
      <TextLink
        label={copy.done.again}
        icon="rotate-ccw"
        onPress={reset}
        style={{ marginTop: theme.spacing.md }}
      />
    </View>
  );

  const renderForm = () => (
    <View>
      <TextField
        label={copy.form.nameLabel}
        value={name}
        onChangeText={setName}
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
        error={errors.name}
      />
      <TextField
        label={copy.form.emailLabel}
        value={email}
        onChangeText={setEmail}
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
      />
      <TextField
        label={copy.form.subjectLabel}
        placeholder={copy.form.subjectPlaceholder}
        value={subject}
        onChangeText={setSubject}
      />
      <TextField
        label={copy.form.messageLabel}
        value={message}
        onChangeText={setMessage}
        multiline
        error={errors.message}
      />
      <PrimaryButton
        label={copy.form.submit}
        accessibilityHint={copy.form.submitHint}
        icon="send"
        onPress={() => void submit()}
        style={{ marginTop: theme.spacing.sm }}
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
      <SectionHeader eyebrow={copy.faq.eyebrow} title={copy.faq.title} />
      {renderFaqs()}

      <Rule style={{ marginVertical: theme.spacing['2xl'] }} />

      <SectionHeader eyebrow={copy.form.eyebrow} title={BOARD_CONTACT.email} />
      {outcome !== null ? renderDone() : renderForm()}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  bordered: {
    borderWidth: 1,
  },
});
