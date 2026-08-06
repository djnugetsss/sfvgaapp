import { useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { latticePaths } from '@/components/motif/geometry';
import { useTheme } from '@/theme';

type LatticeRuleProps = {
  /** Band height. Also the diamond's vertical diameter. */
  height?: number;
  /** Width of one diamond. Wider reads calmer; narrower reads like texture. */
  unit?: number;
  strokeColor?: string;
  opacity?: number;
  style?: ViewStyle;
};

/**
 * A divider drawn as a diamond lattice rather than a plain line — the quieter,
 * more considered alternative to `Rule`.
 *
 * The band is two interlocking zigzags, so cells share edges exactly and it
 * tiles to any width without seams. Width comes from `onLayout` rather than a
 * fixed count, so it adapts to any container and any screen size.
 *
 * Deliberately low contrast: at a glance this should read as a textured rule,
 * and only reward a second look with the lattice. If it ever reads as a
 * pattern swatch, drop the opacity — do not shrink the unit.
 */
export function LatticeRule({
  height = 10,
  unit = 14,
  strokeColor,
  opacity,
  style,
}: LatticeRuleProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const stroke = strokeColor ?? theme.motif.stroke;
  const bandOpacity = opacity ?? theme.motif.hairline;

  // Overdraw by one unit so the final partial diamond is clipped by the
  // container edge rather than ending mid-air.
  const paths = latticePaths(width + unit, height, unit);

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[{ height, overflow: 'hidden' }, style]}
    >
      {width > 0 ? (
        <Svg width={width} height={height} opacity={bandOpacity}>
          <G
            fill="none"
            stroke={stroke}
            strokeWidth={theme.motif.strokeWidth}
            strokeLinejoin="round"
          >
            <Path d={paths.upper} />
            <Path d={paths.lower} />
          </G>
        </Svg>
      ) : null}
    </View>
  );
}
