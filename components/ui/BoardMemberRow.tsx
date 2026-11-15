import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { IMAGE_BLURHASH } from '@/constants/images';
import { useTheme } from '@/theme';
import type { BoardMember } from '@/types';
import { resolveImageSource } from '@/utils/imageSource';

/**
 * Warm blur placeholder while a headshot decodes — the same ivory/linen cast
 * used for event heroes, so a loading portrait reads as resolving rather than
 * as a hole in the roster.
 */

/** Portrait size. Comfortably above the 44pt floor if it ever becomes tappable. */
const AVATAR = 64;

type BoardMemberRowProps = {
  member: BoardMember;
  /** Suppresses the divider above the first row. */
  isFirst: boolean;
};

/**
 * One board member: portrait at the left, role as a tracked overline in the
 * accent, name in the serif voice.
 *
 * Two shapes, chosen by the data rather than by a flag:
 *
 * - **With a photo** — the portrait card. This is every serving officer and
 *   director, and most of the extended leadership.
 * - **Without one** — a text-only row, no portrait and no initials tile. A
 *   monogram would invent an identity that isn't there. Letting absence of a
 *   photo pick the shape means no new field on `BoardMember`, and anyone
 *   awaiting a headshot degrades to the same honest row instead of a
 *   placeholder.
 *
 * The text-only row keeps the portrait rows' left inset deliberately *unset*
 * — it spans the full width. Indenting it to align under the portraits would
 * leave a conspicuous empty square, which reads as a failed image rather than
 * as a different kind of entry.
 */
export function BoardMemberRow({ member, isFirst }: BoardMemberRowProps) {
  const theme = useTheme();
  const photo = resolveImageSource(member.photo);

  return (
    <View
      style={[
        styles.root,
        {
          paddingVertical: theme.spacing.lg,
          borderTopWidth: isFirst ? 0 : theme.layout.hairline,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      {photo !== null ? (
        <Image
          source={photo}
          placeholder={{ blurhash: IMAGE_BLURHASH }}
          transition={theme.motion.durations.base}
          contentFit="cover"
          accessibilityLabel={member.name}
          style={[
            styles.avatar,
            {
              width: AVATAR,
              height: AVATAR,
              borderRadius: theme.radii.full,
              marginRight: theme.spacing.md,
              backgroundColor: theme.colors.accentWash,
              borderWidth: 2,
              borderColor: theme.colors.primary,
            },
          ]}
        />
      ) : null}

      <View style={styles.text}>
        <Text
          style={[
            theme.typography.overline,
            { color: theme.colors.primary, marginBottom: theme.spacing.xs },
          ]}
        >
          {member.role}
        </Text>

        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          {member.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    // Keeps a portrait from being stretched by the row's cross-axis stretch.
    flexShrink: 0,
  },
  text: {
    // Takes the remaining width so a long name wraps instead of pushing the
    // portrait off the row.
    flex: 1,
  },
});
