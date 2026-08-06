import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { polar } from '@/components/motif/geometry';
import { ThaliMark } from '@/components/motif/ThaliMark';
import {
  SEGMENT_HEIGHT,
  SEGMENT_WIDTH,
  ThaliSegment,
} from '@/components/more/ThaliSegment';
import { MORE_COPY } from '@/constants/content';
import { useTheme } from '@/theme';
import type { FeatherIconName } from '@/types';

/**
 * Below this container width the radial layout stops being comfortable and we
 * serve a grid instead. Derived, not guessed: the ring needs
 * `2 * (radius + SEGMENT_WIDTH / 2)` of width, and below ~330pt the segments
 * start crowding the centre mark.
 */
const RADIAL_MIN_WIDTH = 330;

const CENTER_MARK = 92;

export type ThaliItem = {
  id: string;
  label: string;
  icon: FeatherIconName;
  enabled: boolean;
  emphasis: boolean;
  onPress: () => void;
};

type ThaliArrangementProps = {
  items: readonly ThaliItem[];
};

/**
 * The set-piece: resources arranged as compartments around a central thali
 * mark.
 *
 * Two layouts, chosen from the measured container width rather than from a
 * device guess:
 *
 * - **Radial** — segments on a ring around the mark, clockwise from the top.
 *   This is the intended composition.
 * - **Grid** — a three-across grid under the mark, used when the container is
 *   too narrow for the ring to breathe. The mark stays as a header, so the
 *   screen keeps its identity; only the arrangement gives way.
 *
 * Responsiveness beats the gimmick here on purpose: a cramped ring with
 * overlapping labels would be worse than an honest grid.
 */
export function ThaliArrangement({ items }: ThaliArrangementProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const useRadial = width >= RADIAL_MIN_WIDTH && items.length > 2;

  // Ring radius: keep segments clear of the centre mark, and keep the whole
  // arrangement inside the measured width.
  const radius = Math.min(
    (width - SEGMENT_WIDTH) / 2,
    CENTER_MARK / 2 + SEGMENT_WIDTH * 0.72,
  );
  // Height, not width: segments are taller than they are wide, and the ring
  // must clear a full segment above and below or the top and bottom labels
  // get clipped.
  const canvas = radius * 2 + SEGMENT_HEIGHT + theme.spacing.md;

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width === 0 ? null : useRadial ? (
        <View style={[styles.canvas, { height: canvas }]}>
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel={MORE_COPY.thaliLabel}
          >
            <ThaliMark
              size={CENTER_MARK}
              segments={items.length}
              strokeColor={theme.motif.strokeStrong}
            />
          </View>

          {items.map((item, index) => {
            // Clockwise from 12 o'clock, so the first item reads first.
            const angle = (360 / items.length) * index;
            const point = polar(canvas / 2, canvas / 2, radius, angle);

            return (
              <View
                key={item.id}
                style={[
                  styles.segment,
                  {
                    left: point.x - SEGMENT_WIDTH / 2,
                    top: point.y - SEGMENT_HEIGHT / 2,
                    width: SEGMENT_WIDTH,
                  },
                ]}
              >
                <ThaliSegment
                  label={item.label}
                  icon={item.icon}
                  index={index}
                  enabled={item.enabled}
                  emphasis={item.emphasis}
                  onPress={item.onPress}
                />
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.fallback}>
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
            <ThaliMark
              size={CENTER_MARK}
              segments={items.length}
              strokeColor={theme.motif.strokeStrong}
            />
          </View>

          <View style={styles.grid}>
            {items.map((item, index) => (
              <View
                key={item.id}
                style={{ marginBottom: theme.spacing.xl, width: SEGMENT_WIDTH }}
              >
                <ThaliSegment
                  label={item.label}
                  icon={item.icon}
                  index={index}
                  enabled={item.enabled}
                  emphasis={item.emphasis}
                  onPress={item.onPress}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    position: 'absolute',
    alignItems: 'center',
  },
  fallback: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
});
