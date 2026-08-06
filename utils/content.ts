/**
 * Guards for partially-filled content.
 *
 * The seed data carries literal placeholder markers ("TODO: fill from
 * sourceUrl", "TODO: rehost headshot") in fields nobody has filled yet. Those
 * markers exist so the gaps are greppable — but they must never reach a user's
 * screen.
 *
 * Every component that renders an optional field routes it through
 * `resolveContent` first. Treating a placeholder as "absent" means the UI
 * takes its graceful-fallback path automatically, and it keeps working
 * unchanged once the real values land.
 */

/** Placeholder prefix used throughout the seed data. */
const PLACEHOLDER_PREFIX = 'TODO';

/**
 * Returns trimmed content, or `null` when the value is missing, blank, or a
 * placeholder marker.
 *
 * @example
 * resolveContent('Encino Community Center') // 'Encino Community Center'
 * resolveContent('TODO: fill from sourceUrl') // null
 * resolveContent(null) // null
 */
export function resolveContent(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.toUpperCase().startsWith(PLACEHOLDER_PREFIX)) {
    return null;
  }

  return trimmed;
}

/** True when a field holds real, displayable content. */
export function hasContent(value: string | null | undefined): boolean {
  return resolveContent(value) !== null;
}
