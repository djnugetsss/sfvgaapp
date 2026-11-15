import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

const CELL = 24;

/** The web app's `pattern-diya` background: one small dot every 24pt. */
export function DotPattern() {
  const theme = useTheme();

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="diya" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
          <Circle cx={CELL / 2} cy={CELL / 2} r={1} fill={theme.colors.pattern} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#diya)" />
    </Svg>
  );
}
