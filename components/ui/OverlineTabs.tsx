import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutRectangle } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';

export type OverlineTab<K extends string> = {
  key: K;
  label: string;
};

type OverlineTabsProps<K extends string> = {
  tabs: readonly OverlineTab<K>[];
  value: K;
  onChange: (key: K) => void;
};

/**
 * Tabs set in the screen's own eyebrow — "Gatherings   Past events" — with the
 * gold tick that sits under every eyebrow in the app sliding beneath whichever
 * one is selected.
 *
 * It takes the place of the scaffold's overline and accent tick together
 * (`masthead` plus `accentVariant="none"`), so a screen with sub-views keeps
 * exactly the same header rhythm as one without: overline, gold tick, display
 * title. Nothing new is stacked on top; the header itself becomes the control.
 *
 * The tick moves on the app's one spring, the same motion as the tab bar's
 * pill. Under reduce-motion it jumps. Each label's hit area is padded out to
 * the 44pt floor around 11pt type.
 */
export function OverlineTabs<K extends string>({
  tabs,
  value,
  onChange,
}: OverlineTabsProps<K>) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [layouts, setLayouts] = useState<Partial<Record<K, LayoutRectangle>>>({});

  const active = layouts[value];

  const handlePress = (key: K) => {
    if (key === value) {
      return;
    }
    void Haptics.selectionAsync();
    onChange(key);
  };

  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <View accessibilityRole="tablist" style={styles.row}>
        {tabs.map((tab, index) => {
          const selected = tab.key === value;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.label}
              onPress={() => handlePress(tab.key)}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                setLayouts((current) => ({ ...current, [tab.key]: layout }));
              }}
              hitSlop={{ top: 14, bottom: 14 }}
              style={({ pressed }) => ({
                marginLeft: index === 0 ? 0 : theme.spacing.lg,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={[
                  theme.typography.overline,
                  { color: selected ? theme.colors.textPrimary : theme.colors.textMuted },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* The tick: as wide as the selected label, so it underlines the word
          rather than floating at a fixed length. Hidden until both labels
          have been measured, so it never flashes in at the wrong place. */}
      <View style={[styles.track, { marginTop: theme.spacing.md }]}>
        {active !== undefined ? (
          <MotiView
            animate={{ left: active.x, width: active.width }}
            transition={
              reduceMotion
                ? { type: 'timing', duration: 0 }
                : { type: 'spring', ...theme.motion.spring }
            }
            style={[
              styles.tick,
              { backgroundColor: theme.colors.primary, borderRadius: theme.radii.full },
            ]}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    height: 2,
  },
  tick: {
    position: 'absolute',
    top: 0,
    height: 2,
  },
});
