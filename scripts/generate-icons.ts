/**
 * Brand raster generator — app icon and splash mark.
 *
 * Run with:  node --experimental-strip-types scripts/generate-icons.ts
 *
 * Two rules govern this script, and both exist so the icon can never drift
 * from the app:
 *
 * 1. **The geometry is imported, not redrawn.** It calls the real
 *    `buildThali()` from `components/motif/geometry.ts` and rasterises the
 *    exact SVG path strings `ThaliMark` renders on screen. Change the mark and
 *    the icon changes with it.
 * 2. **The colours are read out of `theme/tokens.ts`** at run time rather than
 *    retyped here. `tokens.ts` imports react-native, so Node cannot import it —
 *    the palette is scraped from the source text instead. A hex literal in this
 *    file would be a second source of truth, which is the thing the token
 *    system exists to prevent.
 *
 * There is no SVG→PNG converter on this machine (no rsvg, ImageMagick, or
 * Inkscape), so the rasteriser is here too: paths are flattened to line
 * segments and stamped into a coverage buffer with a one-pixel antialias band,
 * then encoded as PNG with Node's built-in zlib.
 */

import { deflateSync } from 'node:zlib';
import { readFileSync, writeFileSync } from 'node:fs';
import { buildThali } from '../components/motif/geometry.ts';

/* ------------------------------------------------------------------ *
 * Palette, read from the token source
 * ------------------------------------------------------------------ */

type RGB = [number, number, number];

const TOKENS = readFileSync(new URL('../theme/tokens.ts', import.meta.url), 'utf8');

function token(name: string): RGB {
  const match = TOKENS.match(new RegExp(`${name}:\\s*'#([0-9A-Fa-f]{6})'`));
  if (match === null) {
    throw new Error(`Palette entry "${name}" not found in theme/tokens.ts`);
  }
  const hex = match[1];
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

const IVORY = token('ivory');
const MARIGOLD = token('marigold');
const KUMKUM = token('kumkum');
const INK = token('ink');

/* ------------------------------------------------------------------ *
 * Path parsing — M / L / Q only, which is all buildThali emits
 * ------------------------------------------------------------------ */

type Pt = { x: number; y: number };
type Seg = [Pt, Pt];

/** Flattens one quadratic Bézier into line segments. */
function flattenQuadratic(p0: Pt, c: Pt, p1: Pt, steps = 48): Seg[] {
  const out: Seg[] = [];
  let prev = p0;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    const next = {
      x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
      y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
    };
    out.push([prev, next]);
    prev = next;
  }
  return out;
}

function parsePath(d: string): Seg[] {
  const tokens = d.trim().split(/[\s,]+/);
  const segs: Seg[] = [];
  let i = 0;
  let cursor: Pt = { x: 0, y: 0 };
  let start: Pt = { x: 0, y: 0 };

  while (i < tokens.length) {
    const cmd = tokens[i];
    i += 1;
    if (cmd === 'M') {
      cursor = { x: Number(tokens[i]), y: Number(tokens[i + 1]) };
      start = cursor;
      i += 2;
    } else if (cmd === 'L') {
      const next = { x: Number(tokens[i]), y: Number(tokens[i + 1]) };
      i += 2;
      segs.push([cursor, next]);
      cursor = next;
    } else if (cmd === 'Q') {
      const c = { x: Number(tokens[i]), y: Number(tokens[i + 1]) };
      const next = { x: Number(tokens[i + 2]), y: Number(tokens[i + 3]) };
      i += 4;
      segs.push(...flattenQuadratic(cursor, c, next));
      cursor = next;
    } else if (cmd === 'Z' || cmd === 'z') {
      segs.push([cursor, start]);
      cursor = start;
    } else {
      throw new Error(`Unsupported path command "${cmd}" — extend the parser.`);
    }
  }
  return segs;
}

/** A circle as a closed polyline, so rings stamp through the same code path. */
function circleSegments(cx: number, cy: number, r: number, steps = 720): Seg[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  const segs: Seg[] = [];
  for (let i = 0; i < pts.length - 1; i += 1) {
    segs.push([pts[i], pts[i + 1]]);
  }
  return segs;
}

/* ------------------------------------------------------------------ *
 * Rasteriser
 * ------------------------------------------------------------------ */

class Coverage {
  readonly size: number;
  readonly data: Float32Array;

  constructor(size: number) {
    this.size = size;
    this.data = new Float32Array(size * size);
  }

  /** Stamps a stroked segment, keeping the maximum coverage per pixel. */
  stroke(seg: Seg, halfWidth: number): void {
    const [a, b] = seg;
    const pad = halfWidth + 1;
    const minX = Math.max(0, Math.floor(Math.min(a.x, b.x) - pad));
    const maxX = Math.min(this.size - 1, Math.ceil(Math.max(a.x, b.x) + pad));
    const minY = Math.max(0, Math.floor(Math.min(a.y, b.y) - pad));
    const maxY = Math.min(this.size - 1, Math.ceil(Math.max(a.y, b.y) + pad));

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const px = x + 0.5;
        const py = y + 0.5;
        let t = lenSq === 0 ? 0 : ((px - a.x) * dx + (py - a.y) * dy) / lenSq;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const qx = a.x + t * dx;
        const qy = a.y + t * dy;
        const dist = Math.hypot(px - qx, py - qy);
        // One-pixel linear ramp at the edge — cheap, and visually clean at
        // these stroke widths.
        const alpha = Math.min(1, Math.max(0, halfWidth + 0.5 - dist));
        const idx = y * this.size + x;
        if (alpha > this.data[idx]) {
          this.data[idx] = alpha;
        }
      }
    }
  }

  /** Stamps a filled disc — the bindu. */
  disc(cx: number, cy: number, r: number): void {
    const minX = Math.max(0, Math.floor(cx - r - 1));
    const maxX = Math.min(this.size - 1, Math.ceil(cx + r + 1));
    const minY = Math.max(0, Math.floor(cy - r - 1));
    const maxY = Math.min(this.size - 1, Math.ceil(cy + r + 1));

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dist = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        const alpha = Math.min(1, Math.max(0, r + 0.5 - dist));
        const idx = y * this.size + x;
        if (alpha > this.data[idx]) {
          this.data[idx] = alpha;
        }
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * PNG encoding
 * ------------------------------------------------------------------ */

function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, crc]);
}

/**
 * Encodes raw pixels as a PNG.
 *
 * `alpha: false` writes colour type 2 (RGB, no alpha). The iOS app icon must
 * not carry an alpha channel — App Store validation rejects it — so the icon
 * is written opaque and only the splash mark keeps transparency.
 */
function encodePNG(
  size: number,
  pixel: (x: number, y: number) => [number, number, number, number],
  alpha: boolean,
): Buffer {
  const channels = alpha ? 4 : 3;
  const stride = size * channels;
  const raw = Buffer.alloc((stride + 1) * size);

  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = pixel(x, y);
      const o = y * (stride + 1) + 1 + x * channels;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      if (alpha) {
        raw[o + 3] = a;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = alpha ? 6 : 2; // colour type
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ *
 * Composition
 * ------------------------------------------------------------------ */

type MarkOptions = {
  size: number;
  /** Mark diameter as a fraction of the canvas. Icons need generous margin. */
  scale: number;
  segments: number;
  /** Stroke width as a fraction of the mark diameter. */
  strokeRatio: number;
};

function renderMark({ size, scale, segments, strokeRatio }: MarkOptions): Coverage {
  const cov = new Coverage(size);
  const mark = size * scale;
  const offset = (size - mark) / 2;
  const half = (mark * strokeRatio) / 2;

  // The real geometry, from the real module.
  const g = buildThali(mark, segments);
  const shift = (p: Pt): Pt => ({ x: p.x + offset, y: p.y + offset });

  for (const ring of g.rings) {
    for (const seg of circleSegments(g.center + offset, g.center + offset, ring.r)) {
      cov.stroke(seg, half);
    }
  }
  for (const d of [...g.petals, ...g.ticks]) {
    for (const [a, b] of parsePath(d)) {
      cov.stroke([shift(a), shift(b)], half);
    }
  }
  cov.disc(g.center + offset, g.center + offset, g.binduR);

  return cov;
}

function composite(cov: Coverage, fg: RGB, bg: RGB | null): Buffer {
  const { size, data } = cov;
  return encodePNG(
    size,
    (x, y) => {
      const a = data[y * size + x];
      if (bg === null) {
        // Transparent canvas: premultiplied-free straight alpha.
        return [fg[0], fg[1], fg[2], Math.round(a * 255)];
      }
      return [
        Math.round(bg[0] + (fg[0] - bg[0]) * a),
        Math.round(bg[1] + (fg[1] - bg[1]) * a),
        Math.round(bg[2] + (fg[2] - bg[2]) * a),
        255,
      ];
    },
    bg === null,
  );
}

/* ------------------------------------------------------------------ *
 * Outputs
 * ------------------------------------------------------------------ */

const out = (name: string) => new URL(`../assets/${name}`, import.meta.url);

/**
 * `--explore <dir>` writes a matrix of ground colour × segment count × stroke
 * weight so the small-size legibility call is made by looking rather than by
 * guessing. Exploration output goes to a scratch directory, never to assets/.
 */
const exploreIndex = process.argv.indexOf('--explore');
if (exploreIndex !== -1) {
  const dir = process.argv[exploreIndex + 1];
  for (const [groundName, ground] of [
    ['kumkum', KUMKUM],
    ['ink', INK],
  ] as const) {
    for (const segments of [6, 8]) {
      for (const strokeRatio of [0.028, 0.038, 0.048]) {
        const cov = renderMark({ size: 1024, scale: 0.72, segments, strokeRatio });
        const name = `x-${groundName}-s${segments}-w${String(strokeRatio).slice(2)}.png`;
        writeFileSync(`${dir}/${name}`, composite(cov, MARIGOLD, ground));
      }
    }
  }
  console.log('explore matrix written');
  process.exit(0);
}

/**
 * The icon mark. Three parameters differ from the in-app mark, each because a
 * 60pt home-screen tile is not a 92pt screen element — the matrix under
 * `--explore` is what settled them:
 *
 * - **6 segments, not 8.** At 60px the eight-petal ring crowds: adjacent
 *   petals and their dividers merge into a dotted band. Six stays articulate.
 * - **4.8% stroke, not a 1pt hairline.** "Thin is the whole point" holds on a
 *   screen you are already looking at; on a home screen a hairline vanishes.
 * - **Ink ground, not kumkum.** Gold on kumkum measures ~2.6:1 and went muddy
 *   at 60px; gold on warm ink is ~6.2:1 and stayed crisp. `icon-kumkum.png`
 *   holds the alternate — it is a legitimate, more festive choice if you would
 *   rather trade some legibility for distinctiveness on a crowded home screen.
 */
const ICON: MarkOptions = {
  size: 1024,
  scale: 0.72,
  segments: 6,
  strokeRatio: 0.048,
};

const iconCoverage = renderMark(ICON);
writeFileSync(out('icon.png'), composite(iconCoverage, MARIGOLD, INK));
writeFileSync(out('icon-kumkum.png'), composite(iconCoverage, MARIGOLD, KUMKUM));

// Splash mark: transparent, so app.json's ivory backgroundColor shows through.
// Eight segments here, matching the in-app mark rather than the icon — the
// splash renders at 180pt, where the full mark is legible and the handoff into
// the app should look like the same object.
writeFileSync(
  out('splash-icon.png'),
  composite(
    renderMark({ size: 512, scale: 0.86, segments: 8, strokeRatio: 0.016 }),
    MARIGOLD,
    null,
  ),
);

// Web favicon: opaque, icon parameters at favicon scale.
writeFileSync(
  out('favicon.png'),
  composite(
    renderMark({ size: 196, scale: 0.72, segments: 6, strokeRatio: 0.055 }),
    MARIGOLD,
    INK,
  ),
);

// Android adaptive foreground: transparent, mark inset to survive the system
// mask, which crops to roughly the centre 66%.
const ANDROID: MarkOptions = {
  size: 1024,
  scale: 0.45,
  segments: 6,
  strokeRatio: 0.048,
};
writeFileSync(
  out('android-icon-foreground.png'),
  composite(renderMark(ANDROID), MARIGOLD, null),
);
writeFileSync(
  out('android-icon-monochrome.png'),
  composite(renderMark(ANDROID), [255, 255, 255], null),
);

console.log('Wrote icon.png, icon-kumkum.png, splash-icon.png,');
console.log('favicon.png, android-icon-foreground.png, android-icon-monochrome.png');
console.log(`ivory=${IVORY} marigold=${MARIGOLD} kumkum=${KUMKUM} ink=${INK}`);
