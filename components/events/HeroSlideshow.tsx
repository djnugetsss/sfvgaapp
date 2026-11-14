import { type DimensionValue } from 'react-native';

import { EventHero } from '@/components/events/EventHero';
import { CrossfadeSlideshow } from '@/components/ui/CrossfadeSlideshow';
import type { EventItem } from '@/types';

type HeroSlideshowProps = {
  event: EventItem;
  /** Ordered frames. Bundled modules from the registry. */
  images: readonly number[];
  height: DimensionValue;
  borderRadius?: number;
};

/**
 * The flagship hero as a slow cross-fade through several photographs.
 *
 * Reserved for Sanskriti Divas: it is the one event with a body of artwork
 * worth showing more than one frame of, and the detail hero is the one place
 * with the size to do it justice. Everything else — including this event's own
 * Home thumbnail and list card — stays a single still image.
 *
 * The cross-fade itself (layering, reduce-motion, single-frame still) lives in
 * `CrossfadeSlideshow`. This wrapper adds the one thing specific to an event:
 * with no frames at all it hands back to `EventHero`, which draws the event's
 * typographic tile.
 */
export function HeroSlideshow({
  event,
  images,
  height,
  borderRadius,
}: HeroSlideshowProps) {
  if (images.length === 0) {
    return (
      <EventHero
        event={event}
        height={height}
        borderRadius={borderRadius}
        variant="detail"
      />
    );
  }

  return (
    <CrossfadeSlideshow
      images={images}
      height={height}
      borderRadius={borderRadius}
      accessibilityLabel={event.title}
    />
  );
}
