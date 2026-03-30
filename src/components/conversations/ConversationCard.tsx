// ConversationCard — WhatsApp-style conversation row.
// Shows: avatar, contact name, last message preview, timestamp,
// unread badge, label dots, and inbox channel icon.

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import Avatar from '../common/Avatar';
import UnreadBadge from './UnreadBadge';
import LabelDot from '../common/LabelDot';
import InboxIcon from './InboxIcon';
import { formatTime, truncateText } from '../../utils/formatters';
import type ConversationModel from '../../db/models/ConversationModel';

interface Props {
  conversation: ConversationModel;
  onPress: () => void;
}

export default function ConversationCard({ conversation, onPress }: Props) {
  const { colors } = useUIStore();
  const labels = conversation.labels;
  const hasUnread = conversation.unreadCount > 0;
  const preview = conversation.lastMessageContent
    ? truncateText(conversation.lastMessageContent, 58)
    : 'Tap to open conversation';

  const s = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 11,
      backgroundColor: colors.bg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    content: { flex: 1, minWidth: 0, marginLeft: 12 },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    nameRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8 },
    name: { fontSize: 15.5, fontWeight: '600', color: colors.text, flexShrink: 1 },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    time: { fontSize: 12, color: colors.textDim2 },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    preview: { fontSize: 14, color: colors.textDim, flex: 1, marginRight: 8 },
    previewUnread: { color: colors.text, fontWeight: '500' },
    labelsRow: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  });

  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.65}>
      <Avatar
        name={conversation.contactName}
        uri={conversation.contactAvatar ?? undefined}
        size={50}
      />

      <View style={s.content}>
        <View style={s.topRow}>
          <View style={s.nameRow}>
            <InboxIcon channel={conversation.channel ?? ''} size={14} />
            <Text style={s.name} numberOfLines={1}>
              {conversation.contactName}
            </Text>
          </View>
          <View style={s.timeRow}>
            <Text style={s.time}>
              {conversation.lastMessageAt
                ? formatTime(conversation.lastMessageAt)
                : ''}
            </Text>
          </View>
        </View>

        <View style={s.bottomRow}>
          <Text
            style={[s.preview, hasUnread && s.previewUnread]}
            numberOfLines={1}
          >
            {preview}
          </Text>
          {hasUnread && <UnreadBadge count={conversation.unreadCount} />}
        </View>

        {labels.length > 0 && (
          <View style={s.labelsRow}>
            {labels.slice(0, 3).map((label) => (
              <LabelDot key={label} label={label} />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
