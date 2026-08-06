import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Tag } from '@/components/events/Tag';
import { HOME_COPY } from '@/constants/content';
import { useTheme } from '@/theme';
import type { Announcement } from '@/types';
import { resolveContent } from '@/utils/content';
import { formatEventDayLong } from '@/utils/eventFormat';

type AnnouncementListProps = {
  announcements: readonly Announcement[];
};

/**
 * Announcements, pinned first (the repository guarantees that ordering).
 *
 * The seed announcement's body is still a TODO marker, so this degrades to
 * title-plus-date — a real, useful row rather than a placeholder. An
 * announcement with no usable title at all is skipped entirely, since a
 * headline is the one field it cannot do without.
 */
export function AnnouncementList({ announcements }: AnnouncementListProps) {
  const theme = useTheme();

  const usable = announcements.filter(
    (announcement) => resolveContent(announcement.title) !== null,
  );

  if (usable.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          {
            padding: theme.spacing.lg,
            borderRadius: theme.radii.lg,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.h3,
            { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
          ]}
        >
          {HOME_COPY.announcements.emptyHeadline}
        </Text>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
          {HOME_COPY.announcements.emptyBody}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {usable.map((announcement, index) => {
        const title = resolveContent(announcement.title) ?? '';
        const body = resolveContent(announcement.body);
        const link = resolveContent(announcement.linkUrl);

        const content = (
          <View
            style={{
              paddingVertical: theme.spacing.lg,
              borderTopWidth: index === 0 ? 0 : theme.layout.hairline,
              borderTopColor: theme.colors.border,
            }}
          >
            {announcement.pinned ? (
              <View style={{ marginBottom: theme.spacing.sm }}>
                <Tag label="Pinned" variant="accent" />
              </View>
            ) : null}

            <Text
              style={[
                theme.typography.h3,
                { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
              ]}
            >
              {title}
            </Text>

            {body !== null ? (
              <Text
                style={[
                  theme.typography.body,
                  { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
                ]}
              >
                {body}
              </Text>
            ) : null}

            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
              {formatEventDayLong(announcement.date)}
            </Text>
          </View>
        );

        if (link === null) {
          return <View key={announcement.id}>{content}</View>;
        }

        return (
          <Pressable
            key={announcement.id}
            accessibilityRole="link"
            accessibilityLabel={title}
            onPress={() => {
              void WebBrowser.openBrowserAsync(link, {
                toolbarColor: theme.colors.background,
                controlsColor: theme.colors.primary,
              });
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            {content}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
  },
});
