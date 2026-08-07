/**
 * The bundled-image registry.
 *
 * Seed records cannot hold a `require()` — they are JSON, and a Firestore
 * document will not hold one either. So `photo` and `heroImage` carry a
 * *string key* (the asset's path under `assets/images/`), and this table is
 * the one place that turns a key into a real bundled module.
 *
 * Phase 7: local require → Firestore URL. When content moves to Firestore the
 * same field simply carries an `https://…` URL instead of a key;
 * `resolveImageSource` already routes those straight through, so no component,
 * type, or parser changes. This table then only serves whatever stays bundled.
 *
 * Every key here must name a file that actually exists — Metro resolves
 * `require()` at build time, so a typo is a build error rather than a broken
 * image at runtime. That is the point: a missing *mapping* degrades to the
 * designed fallback, and a missing *file* fails loudly in CI.
 */

export const LOCAL_IMAGES: Record<string, number> = {
  /* Board headshots. Keyed by `board/<member id>.jpg`. */
  'board/jaymeen-desai.jpg': require('@/assets/images/board/jaymeen-desai.jpg'),
  'board/monika-patel.jpg': require('@/assets/images/board/monika-patel.jpg'),
  'board/bhavin-shah.jpg': require('@/assets/images/board/bhavin-shah.jpg'),
  'board/mayank-shah.jpg': require('@/assets/images/board/mayank-shah.jpg'),
  'board/pinal-kantawala.jpg': require('@/assets/images/board/pinal-kantawala.jpg'),
  'board/ami-dave.jpg': require('@/assets/images/board/ami-dave.jpg'),
  'board/bhakti-desai.jpg': require('@/assets/images/board/bhakti-desai.jpg'),

  /* Event heroes. Filenames are the association's own, not slugs — the seed
     maps event → file, so renaming a photo touches one line there. */
  'events/dance0.jpg': require('@/assets/images/events/dance0.jpg'),
  'events/dance4.jpg': require('@/assets/images/events/dance4.jpg'),
  'events/sfvga-beach-day.jpg': require('@/assets/images/events/sfvga-beach-day.jpg'),
  'events/sfvga-volleyball.jpg': require('@/assets/images/events/sfvga-volleyball.jpg'),

  /* Present in the repo but not yet mapped to a record:
     - events/sfvgabanner.jpg generic branding, fits several events equally
     - events/youthvolunteer.jpg  food-bank service; matches no calendar event
     Wiring one is a single line here plus the key in the seed. */
};

/* ------------------------------------------------------------------ *
 * Sanskriti Divas — the flagship's own artwork
 * ------------------------------------------------------------------ */

/**
 * The single static image for the flagship on the Home strip.
 *
 * Home only, and deliberately not a slideshow frame: a 68pt thumbnail that
 * cycled would read as a glitch, not as a feature.
 */
export const SANSKRITI_THUMBNAIL_KEY = 'events/dance0.jpg';

/**
 * Frames of the Sanskriti Divas detail-hero slideshow, in display order.
 *
 * `require` cannot take a computed path — Metro resolves it at build time — so
 * every frame is listed explicitly. The order here *is* the rotation order:
 * writing the literal in sequence is what guarantees dance2 precedes dance10,
 * which a string sort of filenames would get wrong.
 *
 * Metro deduplicates identical `require` calls, so a frame that also appears
 * in `LOCAL_IMAGES` above is bundled once, not twice.
 */
export const SANSKRITI_DANCE_IMAGES: readonly number[] = [
  require('@/assets/images/events/dance1.jpg'),
  require('@/assets/images/events/dance2.jpg'),
  require('@/assets/images/events/dance3.jpg'),
  require('@/assets/images/events/dance4.jpg'),
  // Add danceN.jpg here to include it in the Sanskriti Divas hero slideshow.
];
