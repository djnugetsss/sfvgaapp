import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type MotionPressableProps = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

/** A Pressable that dips slightly on touch; plain under Reduce Motion. */
export function MotionPressable({
  children,
  style,
  pressedScale = 0.975,
  onPressIn,
  onPressOut,
  ...props
}: MotionPressableProps) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(e) => {
        scale.value = reduceMotion ? 1 : withTiming(pressedScale, { duration: 120 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = reduceMotion ? 1 : withTiming(1, { duration: 150 });
        onPressOut?.(e);
      }}
      style={[style, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}
