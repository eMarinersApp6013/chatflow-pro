// ConversationCard — WhatsApp-style row in the conversation list.

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import Avatar from '../common/Avatar';
import UnreadBadge from './UnreadBadge';
import LabelDot from '../common/LabelDot';
import { formatTime, truncateText } from '../../utils/formatters';
import type ConversationModel from '../../db/models/ConversationModel';

interface Props {
  conversation: ConversationModel;
  onPress: () => void;
}

export default function ConversationCard({ conversation, onPress }: Props) {
  const { colors } = useUIStore();

  const s = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.bg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    avatar: { marginRight: 12 },
    content: { flex: 1, minWidth: 0 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    name: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
    time: { fontSize: 12, color: colors.textDim2 },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
    preview: { fontSize: 14, color: colors.textDim, flex: 1, marginRight: 8 },
    previewBold: { color: colors.text },
    labelsRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
    rightCol: { alignItems: 'flex-end', gap: 4 },
  });

  const labels = conversation.labels;
  const hasUnread = conversation.unreadCount > 0;
  const preview = conversation.lastMessageContent
    ? truncateText(conversation.lastMessageContent, 55)
    : 'No messages yet';

  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={s.avatar}>
        <Avatar
          name={conversation.contactName}
          uri={conversation.contactAvatar ?? undefined}
          size={48}
        />
      </View>

      <View style={s.content}>
        <View style={s.topRow}>
          <Text style={s.name} numberOfLines={1}>
            {conversation.contactName}
          </Text>
          <Text style={s.time}>
            {conversation.lastMessageAt
              ? formatTime(conversation.lastMessageAt)
              : ''}
          </Text>
        </View>

        <View style={s.bottomRow}>
          <Text
            style={[s.preview, hasUnread && s.previewBold]}
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
