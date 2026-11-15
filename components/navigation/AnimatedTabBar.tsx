import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import type { Theme } from '@/theme';
import type {
  FeatherIconName,
  TabBarProps,
  TabDefinition,
  TabRouteName,
} from '@/types/navigation';
import { TABS } from '@/constants/navigation';

/** Horizontal inset of the sliding pill inside its tab slot. */
const PILL_INSET = 10;
const PILL_HEIGHT = 40;
const ICON_SIZE = 21;

const TAB_BY_NAME = new Map<string, TabDefinition>(TABS.map((tab) => [tab.name, tab]));

/* ------------------------------------------------------------------ *
 * Tab item
 * ------------------------------------------------------------------ */

type TabItemProps = {
  label: string;
  accessibilityLabel: string;
  icon: FeatherIconName;
  focused: boolean;
  reduceMotion: boolean;
  theme: Theme;
  onPress: () => void;
  onLongPress: () => void;
};

function TabItem({
  label,
  accessibilityLabel,
  icon,
  focused,
  reduceMotion,
  theme,
  onPress,
  onLongPress,
}: TabItemProps) {
  // 0 = at rest, 1 = finger down. Drives the press micro-animation.
  const press = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    // Under reduce-motion we express the press with opacity only — no
    // geometry change, which is the part that triggers vestibular discomfort.
    if (reduceMotion) {
      return {
        opacity: 1 - press.value * 0.35,
        transform: [{ scale: 1 }],
      };
    }

    return {
      opacity: 1 - press.value * 0.2,
      transform: [{ scale: 1 - press.value * 0.08 }],
    };
  });

  const setPressed = useCallback(
    (value: number) => {
      press.value = reduceMotion
        ? withTiming(value, { duration: theme.motion.durations.fast })
        : withSpring(value, theme.motion.spring);
    },
    [press, reduceMotion, theme.motion],
  );

  const color = focused ? theme.colors.primary : theme.colors.accent;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => setPressed(1)}
      onPressOut={() => setPressed(0)}
      style={styles.pressable}
      hitSlop={{ top: 8, bottom: 8 }}
    >
      <Animated.View style={[styles.itemContent, animatedStyle]}>
        <Feather name={icon} size={ICON_SIZE} color={color} />
        <Text
          numberOfLines={1}
          style={[
            theme.typography.overline,
            styles.label,
            { color, marginTop: theme.spacing.xs, fontSize: 10, letterSpacing: 1 },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ *
 * Tab bar
 * ------------------------------------------------------------------ */

export function AnimatedTabBar({ state, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  // The bar is full-bleed, so its width is only known after layout.
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth > 0 ? barWidth / state.routes.length : 0;

  // Fractional tab index the indicator is resting at. Driven off navigation
  // state rather off the press handler, so deep links and programmatic
  // navigation move the pill too.
  const indicatorIndex = useSharedValue(state.index);

  useEffect(() => {
    indicatorIndex.value = reduceMotion
      ? state.index
      : withSpring(state.index, theme.motion.spring);
  }, [indicatorIndex, reduceMotion, state.index, theme.motion.spring]);

  const indicatorStyle = useAnimatedStyle(() => {
    const translateX = indicatorIndex.value * tabWidth + PILL_INSET;
    return {
      width: Math.max(tabWidth - PILL_INSET * 2, 0),
      transform: [{ translateX }],
      // Hide the pill until we have a real measurement, otherwise it flashes
      // at zero width on the first frame.
      opacity: tabWidth > 0 ? 1 : 0,
    };
  }, [tabWidth]);

  const handlePress = useCallback(
    (routeKey: string, routeName: string, focused: boolean) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });

      if (event.defaultPrevented) {
        return;
      }

      if (focused) {
        return;
      }

      // Fire haptics before navigation so the tap feels instant even if the
      // destination screen takes a frame to mount.
      void Haptics.selectionAsync();

      navigation.navigate(routeName);
    },
    [navigation],
  );

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.chrome,
          borderTopColor: theme.colors.border,
          borderTopWidth: theme.layout.hairline,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View
        style={[styles.row, { height: theme.layout.tabBarHeight }]}
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            indicatorStyle,
            {
              height: PILL_HEIGHT,
              borderRadius: theme.radii.full,
              backgroundColor: theme.colors.accentWash,
              marginTop: -PILL_HEIGHT / 2,
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const tab = TAB_BY_NAME.get(route.name as TabRouteName);

          if (!tab) {
            return null;
          }

          const focused = state.index === index;

          return (
            <TabItem
              key={route.key}
              label={tab.label}
              accessibilityLabel={tab.accessibilityLabel}
              icon={tab.icon}
              focused={focused}
              reduceMotion={reduceMotion}
              theme={theme}
              onPress={() => handlePress(route.key, route.name, focused)}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
