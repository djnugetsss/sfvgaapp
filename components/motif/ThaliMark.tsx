import Svg, { Circle, G, Path } from 'react-native-svg';

import { buildThali } from '@/components/motif/geometry';
import { useTheme } from '@/theme';

type ThaliMarkProps = {
  size: number;
  /** Defaults to the quiet motif stroke. Pass `motif.strokeStrong` to feature it. */
  strokeColor?: string;
  strokeWidth?: number;
  /** Number of radial compartments. 8 is the house default. */
  segments?: number;
  /** Overall opacity, for watermark use. */
  opacity?: number;
  /**
   * Colour for the centre point only. This is the one place a mark is allowed
   * a second colour, and it is a ~3pt dot — used on the More hub to spend the
   * screen's single kumkum allowance.
   */
  binduColor?: string;
  /**
   * Draws the inner ring and centre dot. Turn off when the mark frames other
   * content — over the flagship hero the centre collided with the event's
   * initials, and a mark that collides with type is decoration, not craft.
   */
  showCenter?: boolean;
};

/**
 * The app's signature mark.
 *
 * A thali abstracted to its structure: a centre point, an inner ring, a ring
 * of petals in radial symmetry, dividers between the compartments, and an
 * outer rim. Pure line art — nothing is filled except the 3pt centre dot, so
 * it reads as engraving rather than as an illustration of a plate.
 *
 * Restraint notes, since this mark is used in several places:
 * - Ring radii are deliberately unevenly spaced; even spacing reads as a
 *   target or a loading spinner from a stock icon set.
 * - The petals stop well short of the rim, leaving a band of empty space. That
 *   gap is what makes it read as considered rather than busy.
 * - It is monochrome and token-driven, so it can never fight the palette.
 */
export function ThaliMark({
  size,
  strokeColor,
  strokeWidth,
  segments = 8,
  opacity = 1,
  binduColor,
  showCenter = true,
}: ThaliMarkProps) {
  const theme = useTheme();

  const stroke = strokeColor ?? theme.motif.stroke;
  const width = strokeWidth ?? theme.motif.strokeWidth;
  const geometry = buildThali(size, segments);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} opacity={opacity}>
      <G fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round">
        {geometry.rings
          .filter((ring) => showCenter || ring.key !== 'inner')
          .map((ring) => (
            <Circle
              key={ring.key}
              cx={geometry.center}
              cy={geometry.center}
              r={ring.r}
            />
          ))}

        {geometry.petals.map((d, index) => (
          <Path key={`petal-${index}`} d={d} strokeLinejoin="round" />
        ))}

        {geometry.ticks.map((d, index) => (
          <Path key={`tick-${index}`} d={d} />
        ))}
      </G>

      {/* The bindu — the point every radial motif is measured from. */}
      {showCenter ? (
        <Circle
          cx={geometry.center}
          cy={geometry.center}
          r={geometry.binduR}
          fill={binduColor ?? stroke}
        />
      ) : null}
    </Svg>
  );
}
