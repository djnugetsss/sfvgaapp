import { Text, View } from 'react-native';

import { useTheme } from '@/theme';
import type { BoardMember } from '@/types';

type BoardMemberRowProps = {
  member: BoardMember;
  /** Suppresses the divider above the first row. */
  isFirst: boolean;
};

/**
 * One board member: name in the serif voice, role as a tracked overline in the
 * accent. Photo and bio are ignored for now — the seed carries a
 * "TODO: rehost headshot" marker rather than a real image, and rendering that
 * string would be worse than rendering nothing.
 */
export function BoardMemberRow({ member, isFirst }: BoardMemberRowProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        paddingVertical: theme.spacing.lg,
        borderTopWidth: isFirst ? 0 : theme.layout.hairline,
        borderTopColor: theme.colors.border,
      }}
    >
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
  );
}
