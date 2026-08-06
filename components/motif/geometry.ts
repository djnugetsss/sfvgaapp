/**
 * Original vector geometry for the motif system.
 *
 * Everything here is constructed mathematically from polar coordinates — a
 * centre, a set of radii, and an even angular division. Nothing is traced,
 * sampled, or derived from any specific textile, artwork, or artist's work.
 * The *structural ideas* are drawn from three traditions:
 *
 * - a thali: a round vessel divided into radial compartments around a centre
 * - rangoli: symmetry radiating outward from a single point
 * - Kutchi mirror-work: a diamond lattice whose cells hold small radial motifs
 *
 * Keeping the maths in one place means `ThaliMark`, `ThaliSpinner`, and
 * `RangoliMark` all describe the *same* mark, so the app has one signature
 * rather than three lookalikes.
 */

export type Point = { x: number; y: number };

/** Polar → cartesian. Angles in degrees, 0° at 12 o'clock, clockwise. */
export function polar(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

const fmt = (n: number): string => n.toFixed(2);

/**
 * A single petal: a lens shape pointing outward along `angleDeg`, built from
 * two quadratic curves that meet at the inner and outer radius.
 *
 * `spread` is the angular offset of the control points — it governs how full
 * the petal reads. Small values give a taut almond; large values bulge and
 * start to look cartoonish, which is exactly what this design must avoid.
 */
export function petalPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  angleDeg: number,
  spread: number,
): string {
  const midR = (innerR + outerR) / 2;
  const tip = polar(cx, cy, outerR, angleDeg);
  const base = polar(cx, cy, innerR, angleDeg);
  const left = polar(cx, cy, midR, angleDeg - spread);
  const right = polar(cx, cy, midR, angleDeg + spread);

  return [
    `M ${fmt(base.x)} ${fmt(base.y)}`,
    `Q ${fmt(left.x)} ${fmt(left.y)} ${fmt(tip.x)} ${fmt(tip.y)}`,
    `Q ${fmt(right.x)} ${fmt(right.y)} ${fmt(base.x)} ${fmt(base.y)}`,
  ].join(' ');
}

/** A radial tick between two radii — the thali's compartment dividers. */
export function radialTickPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  angleDeg: number,
): string {
  const a = polar(cx, cy, innerR, angleDeg);
  const b = polar(cx, cy, outerR, angleDeg);
  return `M ${fmt(a.x)} ${fmt(a.y)} L ${fmt(b.x)} ${fmt(b.y)}`;
}

/**
 * The thali mark, as proportions of its bounding box.
 *
 * Radii are fractions of `size` so the mark scales cleanly from a 20pt spinner
 * to a 280pt hero without re-tuning. The ring spacing is deliberately uneven —
 * evenly spaced concentric circles read as a target, not as an object.
 */
export const THALI_RATIOS = {
  outerRing: 0.47,
  petalOuter: 0.4,
  petalInner: 0.235,
  innerRing: 0.185,
  bindu: 0.05,
  /** Dividers sit between petals, bridging the petal ring and the outer ring. */
  tickInner: 0.42,
  tickOuter: 0.455,
  petalSpread: 13,
} as const;

export type ThaliGeometry = {
  center: number;
  rings: { r: number; key: string }[];
  petals: string[];
  ticks: string[];
  binduR: number;
};

/**
 * Builds every path for one thali mark.
 *
 * `segments` is the number of compartments. Six to ten reads as considered;
 * beyond about twelve the petals crowd and the mark turns into a doily.
 */
export function buildThali(size: number, segments: number): ThaliGeometry {
  const c = size / 2;
  const step = 360 / segments;

  const petals: string[] = [];
  const ticks: string[] = [];

  for (let i = 0; i < segments; i += 1) {
    const angle = i * step;
    petals.push(
      petalPath(
        c,
        c,
        size * THALI_RATIOS.petalInner,
        size * THALI_RATIOS.petalOuter,
        angle,
        THALI_RATIOS.petalSpread,
      ),
    );
    // Offset by half a step so a divider falls between two petals.
    ticks.push(
      radialTickPath(
        c,
        c,
        size * THALI_RATIOS.tickInner,
        size * THALI_RATIOS.tickOuter,
        angle + step / 2,
      ),
    );
  }

  return {
    center: c,
    rings: [
      { r: size * THALI_RATIOS.outerRing, key: 'outer' },
      { r: size * THALI_RATIOS.innerRing, key: 'inner' },
    ],
    petals,
    ticks,
    binduR: size * THALI_RATIOS.bindu,
  };
}

/**
 * A continuous diamond lattice as two interlocking zigzags.
 *
 * Drawing it as two polylines rather than as discrete diamonds means adjacent
 * cells share their edges exactly, so the band tiles to any width with no
 * seams and no double-struck strokes.
 *
 * @param width total band width
 * @param height band height; also the diamond's vertical diameter
 * @param unit horizontal width of one diamond
 */
export function latticePaths(
  width: number,
  height: number,
  unit: number,
): { upper: string; lower: string } {
  const midY = height / 2;
  const half = unit / 2;
  const upper: string[] = [`M 0 ${fmt(midY)}`];
  const lower: string[] = [`M 0 ${fmt(midY)}`];

  for (let x = 0; x < width; x += unit) {
    upper.push(`L ${fmt(x + half)} 0`, `L ${fmt(x + unit)} ${fmt(midY)}`);
    lower.push(`L ${fmt(x + half)} ${fmt(height)}`, `L ${fmt(x + unit)} ${fmt(midY)}`);
  }

  return { upper: upper.join(' '), lower: lower.join(' ') };
}
