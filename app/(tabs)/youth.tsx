import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { SCREEN_COPY } from '@/constants/content';
import { useTheme } from '@/theme';

const copy = SCREEN_COPY.youth;

export default function YouthScreen() {
  const theme = useTheme();

  return (
    <ScreenScaffold
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <EmptyState
        headline={copy.empty.headline}
        body={copy.empty.body}
        delay={theme.motion.durations.fast}
      />
    </ScreenScaffold>
  );
}
