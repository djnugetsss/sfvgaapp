import { Text, View } from 'react-native';

import { BoardMemberRow } from '@/components/ui/BoardMemberRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  BOARD_CONTACT,
  LEADERSHIP_COPY,
  SCREEN_COPY,
  STATUS_COPY,
} from '@/constants/content';
import { useBoardMembers, useLeadership } from '@/services';
import { useTheme } from '@/theme';

const copy = SCREEN_COPY.board;

/**
 * Board screen — the Phase-2 proof that the data layer works end to end.
 *
 * The roster comes from `useBoardMembers()`, already sorted by `roleOrder` by
 * the repository. This screen does no sorting and holds no member data; swap
 * the repository for Firestore and this file does not change.
 *
 * Beneath the elected board sits the extended leadership — webmaster,
 * honorary CPAs, app developers — from its own collection. It is a separate
 * section rather than more rows because these are appointed helpers, not
 * officers, and it renders nothing at all while that list is loading, empty,
 * or failing: the board is the reason this screen exists, and a problem with
 * the secondary list must never put an error under it.
 */
export default function BoardScreen() {
  const theme = useTheme();
  const { data: members, isPending, isError } = useBoardMembers();
  const leadership = useLeadership();
  const leaders = leadership.data ?? [];

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

      {leaders.length > 0 ? (
        <View style={{ marginTop: theme.spacing['3xl'] }}>
          <SectionHeader
            eyebrow={LEADERSHIP_COPY.eyebrow}
            title={LEADERSHIP_COPY.title}
            body={LEADERSHIP_COPY.body}
          />
          {leaders.map((leader, index) => (
            <BoardMemberRow key={leader.id} member={leader} isFirst={index === 0} />
          ))}
        </View>
      ) : null}
    </ScreenScaffold>
  );
}
