import { Linking } from 'react-native';

type Draft = {
  to: string;
  subject: string;
  /** Plain text. Line breaks survive as `\n`. */
  body: string;
};

/**
 * Builds a `mailto:` URL with the subject and body encoded.
 *
 * `encodeURIComponent`, not `encodeURI`: the body holds `&`, `?` and `#`
 * (an email address, a "Q&A"), any of which would otherwise end the field
 * early and silently drop the rest of the message.
 */
export function buildMailto({ to, subject, body }: Draft): string {
  return (
    `mailto:${to}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}

/**
 * Hands a pre-written email to the device's mail app.
 *
 * The forms that call this have no backend of their own — the association's
 * inbox *is* the backend — so the message is composed here and the member
 * presses Send in their own mail app, from their own address, which is also
 * what lets the board reply.
 *
 * Resolves `false` rather than throwing when no mail app can take it (a
 * simulator, or a phone with Mail deleted). Callers show the address instead,
 * so the member can still write by hand; nothing is lost.
 */
export async function composeEmail(draft: Draft): Promise<boolean> {
  try {
    await Linking.openURL(buildMailto(draft));
    return true;
  } catch {
    return false;
  }
}

/** A deliberately loose check — enough to catch a typo, not to validate RFC 5322. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
