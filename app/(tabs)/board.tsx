import { Text, View } from 'react-native';

import { BoardMemberRow } from '@/components/ui/BoardMemberRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { BOARD_CONTACT, SCREEN_COPY, STATUS_COPY } from '@/constants/content';
import { useBoardMembers } from '@/services';
import { useTheme } from '@/theme';

const copy = SCREEN_COPY.board;

/**
 * Board screen — the Phase-2 proof that the data layer works end to end.
 *
 * The roster comes from `useBoardMembers()`, already sorted by `roleOrder` by
 * the repository. This screen does no sorting and holds no member data; swap
 * the repository for Firestore and this file does not change.
 *
 * Phase 3 gives this screen its real design (headshots, bios, contact
 * actions). The styling here is Phase 1's tokens, unchanged.
 */
export default function BoardScreen() {
  const theme = useTheme();
  const { data: members, isPending, isError } = useBoardMembers();

  return (
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <View style={{ marginBottom: theme.spacing.xl }}>
        <Text
          style={[
            theme.typography.overline,
            { color: theme.colors.textMuted, marginBottom: theme.spacing.xs },
          ]}
        >
          {BOARD_CONTACT.label}
        </Text>
        <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>
          {BOARD_CONTACT.email}
        </Text>
      </View>

      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <Text style={[theme.typography.body, { color: theme.colors.error }]}>
          {STATUS_COPY.error}
        </Text>
      ) : members.length === 0 ? (
        <EmptyState
          headline={copy.empty.headline}
          body={copy.empty.body}
          delay={theme.motion.durations.fast}
        />
      ) : (
        <View>
          {members.map((member, index) => (
            <BoardMemberRow key={member.id} member={member} isFirst={index === 0} />
          ))}
        </View>
      )}
    </ScreenScaffold>
  );
}
