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

  /* Extended leadership headshots. Keyed by `leadership/<leader id>.jpg`.
     Rehosted from the Base44 site's media store and re-encoded without
     metadata (one original carried GPS coordinates). */
  'leadership/namrata-shah.jpg': require('@/assets/images/leadership/namrata-shah.jpg'),
  'leadership/mike-taylor.jpg': require('@/assets/images/leadership/mike-taylor.jpg'),
  'leadership/vaishali-mehta.jpg': require('@/assets/images/leadership/vaishali-mehta.jpg'),
  'leadership/rahil-shah.jpg': require('@/assets/images/leadership/rahil-shah.jpg'),
  'leadership/maahi-desai.jpg': require('@/assets/images/leadership/maahi-desai.jpg'),

  /* Youth programme photographs. */
  'youth/cpr-training.jpg': require('@/assets/images/youth/cpr-training.jpg'),

  /* Event heroes. Filenames are the association's own, not slugs — the seed
     maps event → file, so renaming a photo touches one line there. */
  'events/dance0.jpg': require('@/assets/images/events/dance0.jpg'),
  'events/dance4.jpg': require('@/assets/images/events/dance4.jpg'),
  'events/sfvga-beach-day.jpg': require('@/assets/images/events/sfvga-beach-day.jpg'),
  'events/sfvga-volleyball.jpg': require('@/assets/images/events/sfvga-volleyball.jpg'),

  /* Screen banners. Neither belongs to a calendar record — the first is
     generic association branding, the second is food-bank service that matches
     no single event — so they are addressed by the named keys below rather
     than through a seed's `heroImage`. */
  'events/sfvgabanner.jpg': require('@/assets/images/events/sfvgabanner.jpg'),
  /* Despite the extension this file is actually WebP. Metro bundles it and
     iOS decodes it fine, so it renders correctly today; the mismatch is
     flagged for the Phase 7 content-type cleanup. Do not rename it here
     alone — the filename is the key, so the rename and this line move
     together. */
  'events/youthvolunteer.jpg': require('@/assets/images/events/youthvolunteer.jpg'),
};

/* ------------------------------------------------------------------ *
 * Screen banner keys
 * ------------------------------------------------------------------ */

/**
 * The contained band under Home's hero text.
 *
 * Named here rather than written into the screen for the same reason as the
 * Sanskriti thumbnail: components address artwork by key, so Phase 7 can swap
 * this for a Firestore URL without touching a component. Unmapping the key
 * above degrades the band to nothing rendered.
 */
export const HOME_BANNER_KEY = 'events/sfvgabanner.jpg';

/** The service photograph between Youth's intro and its hours card. */
export const YOUTH_BANNER_KEY = 'events/youthvolunteer.jpg';

/** The photograph on Youth's CPR-training card. */
export const YOUTH_CPR_IMAGE_KEY = 'youth/cpr-training.jpg';

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
