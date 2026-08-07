import { LOCAL_IMAGES } from '@/constants/assets';
import { resolveContent } from '@/utils/content';

/**
 * Turns a seed `photo` / `heroImage` field into something `expo-image` can
 * render, or `null` when there is nothing real to show.
 *
 * Three cases, in order:
 * 1. Missing, blank, or a `TODO:` marker → `null`. The caller draws its
 *    designed fallback. `resolveContent` decides this, so image fields behave
 *    exactly like every other optional field in the app.
 * 2. An `http(s)` URL → passed through as a remote source. Nothing today
 *    produces one; this is the Phase 7 path, live in advance so the Firestore
 *    swap is a content change rather than a code change.
 * 3. Anything else → a key into `LOCAL_IMAGES`, resolved to a bundled module.
 *
 * An unrecognised key returns `null` rather than throwing. A record that names
 * an image we do not bundle is a content mistake, and the honest response is
 * the same graceful fallback as no image at all — never a broken tile.
 */
export function resolveImageSource(
  value: string | null | undefined,
): number | { uri: string } | null {
  const resolved = resolveContent(value);

  if (resolved === null) {
    return null;
  }

  if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
    return { uri: resolved };
  }

  return LOCAL_IMAGES[resolved] ?? null;
}
