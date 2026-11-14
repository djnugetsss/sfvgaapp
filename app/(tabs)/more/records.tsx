import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Rule } from '@/components/ui/Rule';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TextLink } from '@/components/ui/TextLink';
import { MORE_COPY, RECORDS_COPY, STATUS_COPY } from '@/constants/content';
import { useOpenLink } from '@/hooks/useOpenLink';
import { useGovernanceRecords, useResource } from '@/services';
import { useTheme } from '@/theme';
import { RECORD_GROUPS, type GovernanceRecord } from '@/types';
import { resolveContent } from '@/utils/content';

const copy = RECORDS_COPY;

/**
 * Records — the association's governance paper trail.
 *
 * Minutes and AGM records grouped under their own headings, newest first, each
 * a row that opens the document in the in-app browser (most are .docx, .pdf,
 * or .pptx on sfvga.org, which the system viewer renders). The by-laws close
 * the page with the screen's one filled button, since agreeing to them is the
 * one thing every member is asked to do.
 *
 * Group order comes from `RECORD_GROUPS`, so minutes always lead even if the
 * data happens to list an AGM first.
 */
export default function RecordsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const openLink = useOpenLink();
  const records = useGovernanceRecords();
  const bylaws = useResource('bylaws');
  const bylawsUrl = resolveContent(bylaws.data?.url);

  const groups = useMemo(
    () =>
      RECORD_GROUPS.map((group) => ({
        group,
        items: (records.data ?? []).filter((record) => record.group === group),
      })).filter(({ items }) => items.length > 0),
    [records.data],
  );

  const renderRow = (record: GovernanceRecord, index: number) => {
    const url = resolveContent(record.url);
    return (
      <Pressable
        key={record.id}
        accessibilityRole="link"
        accessibilityLabel={`${record.label}, ${copy.open}`}
        disabled={url === null}
        onPress={() => {
          if (url !== null) openLink(url);
        }}
        style={({ pressed }) => [
          styles.row,
          {
            paddingVertical: theme.spacing.md,
            borderTopWidth: index === 0 ? 0 : theme.layout.hairline,
            borderTopColor: theme.colors.border,
            opacity: url === null ? 0.45 : pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather
          name="file-text"
          size={18}
          color={theme.colors.secondary}
          style={{ marginRight: theme.spacing.md }}
        />
        <Text
          style={[theme.typography.body, styles.label, { color: theme.colors.textPrimary }]}
        >
          {record.label}
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>
          {copy.open}
        </Text>
        <Feather
          name="arrow-up-right"
          size={14}
          color={theme.colors.primary}
          style={{ marginLeft: theme.spacing.xs }}
        />
      </Pressable>
    );
  };

  const renderRecords = () => {
    if (records.isPending) {
      return <LoadingState />;
    }
    if (records.isError) {
      return (
        <Text style={[theme.typography.body, { color: theme.colors.error }]}>
          {STATUS_COPY.error}
        </Text>
      );
    }
    if (groups.length === 0) {
      return <EmptyState headline={copy.empty.headline} body={copy.empty.body} />;
    }

    return groups.map(({ group, items }, index) => (
      <View key={group} style={{ marginTop: index === 0 ? 0 : theme.spacing.xl }}>
        <Text
          accessibilityRole="header"
          style={[
            theme.typography.overline,
            { color: theme.colors.textMuted, marginBottom: theme.spacing.xs },
          ]}
        >
          {copy.groups[group]}
        </Text>
        {items.map(renderRow)}
      </View>
    ));
  };

  return (
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      onBack={() => router.back()}
      backLabel={MORE_COPY.backLabel}
    >
      {renderRecords()}

      <TextLink
        label={copy.archive}
        icon="arrow-up-right"
        onPress={() => openLink(copy.archiveUrl)}
        style={{ marginTop: theme.spacing.md }}
      />

      {bylawsUrl !== null ? (
        <View>
          <Rule style={{ marginVertical: theme.spacing['2xl'] }} />
          <SectionHeader
            eyebrow={copy.bylaws.eyebrow}
            title={copy.bylaws.title}
            body={copy.bylaws.body}
          />
          <PrimaryButton
            accessibilityRole="link"
            label={copy.bylaws.action}
            icon="arrow-up-right"
            onPress={() => openLink(bylawsUrl)}
          />
        </View>
      ) : null}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flex: 1,
  },
});
