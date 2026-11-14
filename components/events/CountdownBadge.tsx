import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';

import { RangoliMark } from '@/components/motif/RangoliMark';
import { EVENTS_COPY } from '@/constants/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fontFamilies, useTheme } from '@/theme';

/** Diameter. Big enough that the numeral reads from arm's length. */
export const COUNTDOWN_BADGE_SIZE = 84;

type CountdownBadgeProps = {
  /** Whole calendar days until the event; `0` means it is on today. */
  days: number;
};

/**
 * A round seal that counts down to the highlighted event — a struck medal, not
 * a status line.
 *
 * Two faces:
 * - **Days to go** — one large Fraunces numeral in kumkum, with "days" set
 *   small beneath it. The number is the whole message; nothing else competes.
 * - **Today** — the numeral would be a zero, which reads as "nothing". The
 *   seal shows a rangoli in place of the number instead, the same mark the
 *   app uses wherever something is being celebrated.
 *
 * Kumkum is spent here once. This seal is the only kumkum on the Events list,
 * which keeps to the one-per-screen budget, and it is the screen's single
 * genuinely special emphasis: what is on next.
 *
 * The seal sits on the corner of the hero photograph (the card positions it),
 * with a double ring — a gold outer line and an ivory inner gap — so it reads
 * as a separate object laid on the card rather than a sticker printed on it.
 */
export function CountdownBadge({ days }: CountdownBadgeProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const isToday = days <= 0;

  // Three digits will not fit the seal; past 99 days the event is not
  // "imminent" in any useful sense, so the badge shows the floor instead of
  // shrinking type until it is unreadable.
  const shown = Math.min(days, 99);
  const unit = shown === 1 ? EVENTS_COPY.countdown.day : EVENTS_COPY.countdown.days;

  return (
    <MotiView
      accessible
      accessibilityRole="text"
      accessibilityLabel={
        isToday ? EVENTS_COPY.countdown.today : `${shown} ${unit} ${EVENTS_COPY.countdown.toGo}`
      }
      from={{ scale: reduceMotion ? 1 : 0.6, opacity: 0, rotate: reduceMotion ? '0deg' : '-12deg' }}
      animate={{ scale: 1, opacity: 1, rotate: '0deg' }}
      transition={{ type: 'spring', ...theme.motion.spring, delay: reduceMotion ? 0 : 180 }}
      style={[
        styles.seal,
        theme.shadows.md,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          { borderColor: theme.colors.border, backgroundColor: theme.colors.background },
        ]}
      >
        {isToday ? (
          <>
            <RangoliMark size={30} strokeColor={theme.colors.kumkum} />
            <Text
              style={[
                theme.typography.overline,
                styles.unit,
                { color: theme.colors.kumkum, marginTop: 4 },
              ]}
            >
              {EVENTS_COPY.countdown.today}
            </Text>
          </>
        ) : (
          <>
            <Text
              style={[
                styles.numeral,
                {
                  color: theme.colors.kumkum,
                  fontFamily: theme.fontsLoaded ? fontFamilies.serifSemiBold : undefined,
                },
              ]}
            >
              {shown}
            </Text>
            <Text
              style={[theme.typography.overline, styles.unit, { color: theme.colors.textMuted }]}
            >
              {unit}
            </Text>
          </>
        )}
      </View>
    </MotiView>
  );
}

const INNER = COUNTDOWN_BADGE_SIZE - 12;

const styles = StyleSheet.create({
  seal: {
    width: COUNTDOWN_BADGE_SIZE,
    height: COUNTDOWN_BADGE_SIZE,
    borderRadius: COUNTDOWN_BADGE_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: INNER,
    height: INNER,
    borderRadius: INNER / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeral: {
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -1,
    fontWeight: '600',
  },
  unit: {
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 1.4,
  },
});
