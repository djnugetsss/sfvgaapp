import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Faq } from '@/types';
import { fontFamilies, useTheme } from '@/theme';

/** One-open-at-a-time FAQ list. Renders nothing when there are no questions. */
export function FaqAccordion({ faqs }: { faqs: readonly Faq[] }) {
  const theme = useTheme();
  const [open, setOpen] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  return (
    <View accessibilityRole="list">
      {faqs.map((faq, index) => {
        const expanded = open === faq.id;
        return (
          <View
            key={faq.id}
            style={{
              borderTopWidth: index === 0 ? 0 : theme.layout.hairline,
              borderTopColor: theme.colors.border,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={faq.question}
              accessibilityHint={expanded ? 'Collapse answer' : 'Expand answer'}
              onPress={() => setOpen(expanded ? null : faq.id)}
              style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm }}
            >
              <Text
                style={[
                  theme.typography.body,
                  {
                    flex: 1,
                    color: theme.colors.textPrimary,
                    fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined,
                  },
                ]}
              >
                {faq.question}
              </Text>
              <Feather
                name={expanded ? 'minus' : 'plus'}
                size={18}
                color={theme.colors.accent}
                style={{ marginLeft: theme.spacing.sm }}
              />
            </Pressable>
            {expanded ? (
              <Text
                style={[
                  theme.typography.body,
                  { color: theme.colors.textSecondary, paddingBottom: theme.spacing.md },
                ]}
              >
                {faq.answer}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
