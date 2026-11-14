import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { BRAND_LOGO } from '@/constants/assets';
import { fontFamilies, useTheme } from '@/theme';

/** Crest size. Large enough to read the "SFVGA" at its centre. */
const LOGO = 56;

type MastheadProps = {
  /** The association's name, set beside the crest. */
  name: string;
};

/**
 * The association's crest at top left with its name beside it — the header of
 * the Base44 site, brought onto Home.
 *
 * Home only. It replaces the overline eyebrow there, so the front door opens
 * with the association's own mark and name rather than with small caps; every
 * other screen keeps its overline.
 *
 * The name is set in the serif at semibold and in kumkum, the nearest token to
 * the site's deep-red title. That spends Home's single kumkum allowance, which
 * nothing else on Home uses — this *is* the special emphasis the budget is for.
 * The crest itself is decorative to a screen reader: the name beside it
 * already says everything it says.
 */
export function Masthead({ name }: MastheadProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { marginBottom: theme.spacing.lg }]}>
      <Image
        source={BRAND_LOGO}
        contentFit="contain"
        accessible={false}
        style={{ width: LOGO, height: LOGO, marginRight: theme.spacing.md }}
      />
      <Text
        accessibilityRole="header"
        style={[
          theme.typography.h3,
          styles.name,
          {
            color: theme.colors.kumkum,
            fontFamily: theme.fontsLoaded ? fontFamilies.serifSemiBold : undefined,
          },
        ]}
      >
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontWeight: '600',
  },
});
