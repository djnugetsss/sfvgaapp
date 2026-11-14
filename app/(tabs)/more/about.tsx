import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { BulletList } from '@/components/ui/BulletList';
import { Disclosure } from '@/components/ui/Disclosure';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Rule } from '@/components/ui/Rule';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TextLink } from '@/components/ui/TextLink';
import { ABOUT_COPY, MORE_COPY, STATUS_COPY } from '@/constants/content';
import { useMission, useRoles } from '@/services';
import { useTheme } from '@/theme';
import type { RoleDescription } from '@/types';

const copy = ABOUT_COPY;

/**
 * Mission & roles — why the association exists and how it is run.
 *
 * Read top to bottom like a short document: the mission statement in full,
 * the ways SFVGA carries it out, then the board offices and the event
 * committee roles. Roles are collapsed to their titles, because twelve open
 * lists of responsibilities would bury the mission above them; someone
 * looking for "what does the Treasurer do" scans titles, not paragraphs.
 *
 * Ends on the one action the mission is meant to lead to: becoming a member.
 */
export default function AboutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const mission = useMission();
  const roles = useRoles();

  const statement = useMemo(
    () => mission.data?.find((entry) => entry.kind === 'statement') ?? null,
    [mission.data],
  );
  const points = useMemo(
    () =>
      (mission.data ?? [])
        .filter((entry) => entry.kind === 'point')
        .map((entry) => entry.text),
    [mission.data],
  );
  const boardRoles = useMemo(
    () => (roles.data ?? []).filter((role) => role.scope === 'board'),
    [roles.data],
  );
  const committeeRoles = useMemo(
    () => (roles.data ?? []).filter((role) => role.scope === 'committee'),
    [roles.data],
  );

  if (mission.isPending || roles.isPending) {
    return (
      <ScreenScaffold
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        onBack={() => router.back()}
        backLabel={MORE_COPY.backLabel}
      >
        <LoadingState />
      </ScreenScaffold>
    );
  }

  const failed = mission.isError && roles.isError;
  const empty =
    statement === null &&
    points.length === 0 &&
    boardRoles.length === 0 &&
    committeeRoles.length === 0;

  const renderRoles = (list: RoleDescription[]) =>
    list.map((role, index) => (
      <Disclosure key={role.id} title={role.title} isFirst={index === 0}>
        <BulletList items={role.responsibilities} />
      </Disclosure>
    ));

  return (
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      onBack={() => router.back()}
      backLabel={MORE_COPY.backLabel}
    >
      {failed ? (
        <Text style={[theme.typography.body, { color: theme.colors.error }]}>
          {STATUS_COPY.error}
        </Text>
      ) : empty ? (
        <EmptyState headline={copy.empty.headline} body={copy.empty.body} />
      ) : (
        <View>
          {statement !== null || points.length > 0 ? (
            <View>
              <SectionHeader eyebrow={copy.mission.eyebrow} title={copy.mission.title} />
              {statement !== null ? (
                <Text
                  style={[
                    theme.typography.bodyLg,
                    { color: theme.colors.textSecondary, marginBottom: theme.spacing.xl },
                  ]}
                >
                  {statement.text}
                </Text>
              ) : null}
              {points.length > 0 ? (
                <View>
                  <Text
                    style={[
                      theme.typography.h3,
                      { color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
                    ]}
                  >
                    {copy.mission.pointsTitle}
                  </Text>
                  <BulletList items={points} />
                </View>
              ) : null}
              <TextLink
                label={copy.join}
                onPress={() => router.push('/more/membership')}
                style={{ marginTop: theme.spacing.lg }}
              />
            </View>
          ) : null}

          {boardRoles.length > 0 ? (
            <View>
              <Rule style={{ marginVertical: theme.spacing['2xl'] }} />
              <SectionHeader
                eyebrow={copy.boardRoles.eyebrow}
                title={copy.boardRoles.title}
                body={copy.boardRoles.body}
              />
              {renderRoles(boardRoles)}
            </View>
          ) : null}

          {committeeRoles.length > 0 ? (
            <View>
              <Rule style={{ marginVertical: theme.spacing['2xl'] }} />
              <SectionHeader
                eyebrow={copy.committeeRoles.eyebrow}
                title={copy.committeeRoles.title}
                body={copy.committeeRoles.body}
              />
              {renderRoles(committeeRoles)}
            </View>
          ) : null}
        </View>
      )}
    </ScreenScaffold>
  );
}
