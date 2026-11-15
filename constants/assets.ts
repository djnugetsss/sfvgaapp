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
  'leadership/ansh-mehta.jpg': require('@/assets/images/leadership/ansh-mehta.jpg'),

  /* Youth programme photographs. */
  'youth/cpr-training.jpg': require('@/assets/images/youth/cpr-training.jpg'),
};

/* ------------------------------------------------------------------ *
 * Brand
 * ------------------------------------------------------------------ */

/**
 * The association's round crest — the logo from the Base44 site's header.
 * A direct module rather than a registry key: it is the app's identity, not
 * content, so there is no record that could ever point at a different file.
 * 360px square, transparent, enough for the 56pt masthead at 3x and then some.
 */
export const BRAND_LOGO: number = require('@/assets/images/brand/sfvga-logo.png');

/* ------------------------------------------------------------------ *
 * Photographs taken from the Base44 web app
 * ------------------------------------------------------------------ */

/**
 * These stay remote on purpose: the web app serves them from the
 * association's Squarespace site and Base44's media store, and the app points
 * at the same URLs rather than carrying copies. `resolveImageSource` passes an
 * `https://` value straight through, so rehosting any of them later is a
 * change to this file and nothing else.
 *
 * Event artwork lives in `services/seed/events.json` (`heroImage`).
 */

/** The picture under Home's "Our Community" introduction. */
export const HOME_WELCOME_IMAGE_URL =
  'https://images.squarespace-cdn.com/content/v1/6182dd41e5fdbc615031592a/1636077374216-2T3UGHN9QPDYT0KDUMRD/image-asset.jpeg';

/** The picture on the Members tab's "Volunteer Hours" card. */
export const YOUTH_HOURS_IMAGE_URL =
  'https://images.squarespace-cdn.com/content/v1/6182dd41e5fdbc615031592a/5f9a1512-d0c4-4a69-aab2-195c39fd221f/CPRFULL.jpg';

/** The picture on the Members tab's "CPR Training" card — bundled. */
export const YOUTH_CPR_IMAGE_KEY = 'youth/cpr-training.jpg';
