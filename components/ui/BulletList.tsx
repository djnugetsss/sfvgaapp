import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

type BulletListProps = {
  items: readonly string[];
};

/**
 * A list with small gold dots — the mission's points and each role's
 * responsibilities. The dot is drawn, not a "•" glyph, so it sits on the first
 * line's x-height in every font instead of floating with the fallback font
 * before Inter loads.
 */
export function BulletList({ items }: BulletListProps) {
  const theme = useTheme();

  return (
    <View>
      {items.map((item, index) => (
        <View
          key={`${index}-${item}`}
          style={[styles.row, { marginTop: index === 0 ? 0 : theme.spacing.sm }]}
        >
          <View
            style={[
              styles.dot,
              {
                backgroundColor: theme.colors.accent,
                marginRight: theme.spacing.md,
                // Centres the dot on the first line of body type.
                marginTop: (theme.typography.body.lineHeight - 6) / 2,
              },
            ]}
          />
          <Text
            style={[
              theme.typography.body,
              styles.text,
              { color: theme.colors.textSecondary },
            ]}
          >
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    flex: 1,
  },
});
