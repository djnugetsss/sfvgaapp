import { useState } from 'react';
import { Text, View } from 'react-native';

import { FaqAccordion } from '@/components/site/FaqAccordion';
import { InfoCard } from '@/components/site/InfoCard';
import { BoardMemberRow } from '@/components/ui/BoardMemberRow';
import { TextField } from '@/components/forms/TextField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TextLink } from '@/components/ui/TextLink';
import { BOARD_CONTACT, CONTACT_COPY } from '@/constants/content';
import { useBoardMembers, useFaqs, useLeadership } from '@/services';
import { useTheme } from '@/theme';
import { composeEmail, looksLikeEmail } from '@/utils/mail';

type Errors = { name?: string; email?: string; message?: string };

/** Contact form, FAQs, board and extended leadership — the Contact page, now a block inside More. */
export function ContactSections({ onLayoutY }: { onLayoutY?: (y: number) => void }) {
  const theme = useTheme();
  const copy = CONTACT_COPY;
  const { data: faqs } = useFaqs();
  const { data: board } = useBoardMembers();
  const { data: extended } = useLeadership();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'form' | 'sent' | 'nomail'>('form');

  const submit = async () => {
    const next: Errors = {};
    if (name.trim() === '') next.name = copy.form.errors.name;
    if (!looksLikeEmail(email)) next.email = copy.form.errors.email;
    if (message.trim() === '') next.message = copy.form.errors.message;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const ok = await composeEmail({
      to: BOARD_CONTACT.email,
      subject: subject.trim() || copy.form.defaultSubject,
      body: `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`,
    });
    setStatus(ok ? 'sent' : 'nomail');
  };

  return (
    <>
      <Section tone="pattern" onLayoutY={onLayoutY}>
        <SectionHeader eyebrow={copy.eyebrow} body={copy.intro} />
        {status === 'form' ? (
          <View>
            <TextField label={copy.form.nameLabel} value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" autoComplete="name" />
            <TextField label={copy.form.emailLabel} value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <TextField label={copy.form.subjectLabel} placeholder={copy.form.subjectPlaceholder} value={subject} onChangeText={setSubject} />
            <TextField label={copy.form.messageLabel} value={message} onChangeText={setMessage} error={errors.message} multiline />
            <PrimaryButton label={copy.form.submit} icon="send" accessibilityHint={copy.form.submitHint} onPress={() => void submit()} />
          </View>
        ) : (
          <View>
            <InfoCard icon="check-circle" title={copy.done.title} body={status === 'sent' ? copy.done.body : `${copy.done.noMailApp} ${BOARD_CONTACT.email}.`} />
            <TextLink label={copy.done.again} icon="rotate-ccw" onPress={() => setStatus('form')} />
          </View>
        )}
      </Section>

      {(faqs ?? []).length > 0 ? (
        <Section tone="muted">
          <SectionHeader eyebrow={copy.faq.eyebrow} title={copy.faq.title} />
          <FaqAccordion faqs={faqs ?? []} />
        </Section>
      ) : null}

      <Section>
        <SectionHeader eyebrow={copy.board.eyebrow} title={copy.board.title} body={copy.board.body} />
        {(board ?? []).length === 0 ? (
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>{copy.board.empty}</Text>
        ) : null}
        {(board ?? []).map((m, i) => (
          <BoardMemberRow key={m.id} member={m} isFirst={i === 0} />
        ))}
      </Section>

      {(extended ?? []).length > 0 ? (
        <Section tone="muted">
          <SectionHeader eyebrow={copy.extended.eyebrow} title={copy.extended.title} body={copy.extended.body} />
          {(extended ?? []).map((m, i) => (
            <BoardMemberRow key={m.id} member={m} isFirst={i === 0} />
          ))}
        </Section>
      ) : null}
    </>
  );
}
