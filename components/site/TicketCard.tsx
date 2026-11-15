import Feather from '@expo/vector-icons/Feather';
import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { MotionPressable } from '@/components/ui/MotionPressable';
import { TICKETS_COPY } from '@/constants/content';
import type { Ticket } from '@/types/ticket';
import { fontFamilies, useTheme } from '@/theme';

type Props = { ticket: Ticket; pastEvent?: boolean; onPress?: () => void };

/** One ticket in the wallet: QR tile, attendee, calm status badge. */
export function TicketCard({ ticket, pastEvent = false, onPress }: Props) {
  const theme = useTheme();
  const copy = TICKETS_COPY;
  const revoked = ticket.status === 'revoked';
  const tag =
    pastEvent && ticket.status === 'valid'
      ? { label: copy.status.past, variant: 'neutral' as const }
      : ticket.status === 'valid'
        ? { label: copy.status.valid, variant: 'success' as const }
        : ticket.status === 'redeemed'
          ? { label: copy.status.redeemed, variant: 'info' as const }
          : { label: copy.status.revoked, variant: 'neutral' as const };
  const canOpen = onPress !== undefined && !revoked;

  const body = (
    <View
      style={[
        theme.shadows.sm,
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
          marginBottom: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radii.md,
          opacity: revoked ? 0.72 : 1,
        },
      ]}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: theme.radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          backgroundColor: revoked ? theme.colors.border : theme.colors.accentWash,
        }}
      >
        <Feather name={revoked ? 'x-circle' : 'grid'} size={22} color={revoked ? theme.colors.textMuted : theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={[
            theme.typography.bodyLg,
            { color: theme.colors.textPrimary, fontFamily: theme.fontsLoaded ? fontFamilies.semiBold : undefined },
          ]}
        >
          {ticket.attendeeName}
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
          {revoked ? copy.hint.revoked : pastEvent ? copy.hint.past : copy.hint.open}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Badge label={tag.label} variant={tag.variant} />
        {canOpen ? <Feather name="chevron-right" size={17} color={theme.colors.textMuted} style={{ marginTop: 8 }} /> : null}
      </View>
    </View>
  );

  if (!canOpen) return <View accessibilityLabel={`${ticket.attendeeName}, ${tag.label}`}>{body}</View>;

  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`${ticket.attendeeName}, ${tag.label}, tap to view ticket`}
      pressedScale={0.985}
      onPress={onPress}
    >
      {body}
    </MotionPressable>
  );
}
