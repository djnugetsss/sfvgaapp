import Svg, { Circle, G, Path } from 'react-native-svg';

import { petalPath } from '@/components/motif/geometry';
import { useTheme } from '@/theme';

type RangoliMarkProps = {
  size: number;
  strokeColor?: string;
  strokeWidth?: number;
  /** Petals in the outer round. */
  segments?: number;
  opacity?: number;
};

/**
 * A smaller radial mark for empty states.
 *
 * Same family as `ThaliMark` — same petal construction, same centre-outward
 * symmetry — but with no rim and no dividers, so it reads as a drawn rangoli
 * rather than as a vessel. That distinction matters: an empty state should
 * feel like something not yet filled in, not like an empty plate.
 *
 * Two rounds of petals, offset by half a step, give it enough interest to
 * carry a large empty card without needing a second colour.
 */
export function RangoliMark({
  size,
  strokeColor,
  strokeWidth,
  segments = 8,
  opacity = 1,
}: RangoliMarkProps) {
  const theme = useTheme();

  const stroke = strokeColor ?? theme.motif.stroke;
  const width = strokeWidth ?? theme.motif.strokeWidth;
  const c = size / 2;
  const step = 360 / segments;

  const outer: string[] = [];
  const inner: string[] = [];

  for (let i = 0; i < segments; i += 1) {
    outer.push(petalPath(c, c, size * 0.22, size * 0.46, i * step, 12));
    // Offset half a step so the inner round sits in the outer round's gaps.
    inner.push(petalPath(c, c, size * 0.09, size * 0.21, i * step + step / 2, 16));
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} opacity={opacity}>
      <G
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {outer.map((d, index) => (
          <Path key={`outer-${index}`} d={d} />
        ))}
        {inner.map((d, index) => (
          <Path key={`inner-${index}`} d={d} />
        ))}
        <Circle cx={c} cy={c} r={size * 0.045} />
      </G>
    </Svg>
  );
}
