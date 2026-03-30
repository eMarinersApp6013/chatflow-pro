// MessageBubble — WhatsApp-style message bubble (Phase 2)
// Stub for Phase 1

import { View, Text, StyleSheet } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import type MessageModel from '../../db/models/MessageModel';
import { formatTime } from '../../utils/formatters';
import CheckMarks from './CheckMarks';

interface Props {
  message: MessageModel;
}

export default function MessageBubble({ message }: Props) {
  const { colors } = useUIStore();
  const isOut = message.isOutgoing;
  const isNote = message.isPrivate;

  const bubbleBg = isNote
    ? colors.noteYellow
    : isOut
    ? colors.bubbleOut
    : colors.bubbleIn;

  const s = StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      justifyContent: isOut ? 'flex-end' : 'flex-start',
      marginHorizontal: 8,
      marginVertical: 2,
    },
    bubble: {
      maxWidth: '78%',
      backgroundColor: bubbleBg,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: isNote ? 1 : 0,
      borderColor: isNote ? colors.noteBorder : 'transparent',
    },
    content: { fontSize: 15, color: colors.text, lineHeight: 20 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 2 },
    time: { fontSize: 11, color: colors.textDim2 },
    noteLabel: { fontSize: 11, color: colors.orange, fontStyle: 'italic' },
  });

  return (
    <View style={s.wrapper}>
      <View style={s.bubble}>
        {isNote && <Text style={s.noteLabel}>Private Note</Text>}
        <Text style={s.content}>{message.content ?? ''}</Text>
        <View style={s.footer}>
          <Text style={s.time}>{formatTime(message.createdAt)}</Text>
          {isOut && <CheckMarks status={message.status} />}
        </View>
      </View>
    </View>
  );
}
