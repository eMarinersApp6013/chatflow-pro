// MessageBubble — WhatsApp-style message bubble.
// Handles: outgoing (green), incoming (surface), private note (yellow),
// activity messages, reply context preview, image attachments, check marks.

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { File, MapPin } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import type MessageModel from '../../db/models/MessageModel';
import type { ChatwootAttachment } from '../../types/chatwoot';
import { formatTime } from '../../utils/formatters';
import CheckMarks from './CheckMarks';

interface Props {
  message: MessageModel;
  // When true this is the first consecutive message from the same sender
  // → renders the bubble tail
  showTail?: boolean;
  // Reply context from DB (resolved by parent)
  replyMessage?: { content: string; senderName: string } | null;
  onLongPress?: (message: MessageModel) => void;
}

export default function MessageBubble({
  message,
  showTail = false,
  replyMessage,
  onLongPress,
}: Props) {
  const { colors } = useUIStore();

  const isOut = message.isOutgoing;
  const isNote = message.isPrivate;
  const isActivity = message.isActivity;

  // Activity messages (assignment, status change) — centred system text
  if (isActivity) {
    return (
      <View style={styles.activityRow}>
        <View style={[styles.activityPill, { backgroundColor: colors.surface2 }]}>
          <Text style={[styles.activityText, { color: colors.textDim }]}>
            {message.content ?? ''}
          </Text>
        </View>
      </View>
    );
  }

  const bubbleBg = isNote
    ? colors.noteYellow
    : isOut
    ? colors.bubbleOut
    : colors.bubbleIn;

  const borderRadius = {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: isOut ? 12 : showTail ? 2 : 12,
    borderBottomRightRadius: isOut ? (showTail ? 2 : 12) : 12,
  };

  const attachments: ChatwootAttachment[] = message.attachments;
  const hasText = !!(message.content?.trim());

  return (
    <View
      style={[
        styles.wrapper,
        isOut ? styles.wrapperOut : styles.wrapperIn,
      ]}
    >
      {/* Note badge on left side */}
      {isNote && (
        <View style={[styles.notePill, { backgroundColor: colors.orange + '22' }]}>
          <Text style={[styles.notePillText, { color: colors.orange }]}>NOTE</Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => onLongPress?.(message)}
        style={[
          styles.bubble,
          { backgroundColor: bubbleBg },
          borderRadius,
          isNote && { borderWidth: 1, borderColor: colors.noteBorder },
          isOut ? styles.bubbleOut : styles.bubbleIn,
        ]}
      >
        {/* Reply context strip */}
        {replyMessage && (
          <View
            style={[
              styles.replyStrip,
              {
                backgroundColor: isOut
                  ? 'rgba(0,0,0,0.15)'
                  : colors.surface3,
                borderLeftColor: colors.green,
              },
            ]}
          >
            <Text
              style={[styles.replySender, { color: colors.green }]}
              numberOfLines={1}
            >
              {replyMessage.senderName}
            </Text>
            <Text
              style={[styles.replyContent, { color: colors.textDim }]}
              numberOfLines={2}
            >
              {replyMessage.content}
            </Text>
          </View>
        )}

        {/* Image attachments */}
        {attachments
          .filter((a) => a.file_type === 'image')
          .map((att) => (
            <Image
              key={att.id}
              source={{ uri: att.data_url || att.file_url }}
              style={styles.attachmentImage}
              contentFit="cover"
              transition={200}
            />
          ))}

        {/* Non-image file attachments */}
        {attachments
          .filter((a) => a.file_type !== 'image' && a.file_type !== 'location')
          .map((att) => (
            <View
              key={att.id}
              style={[styles.fileRow, { backgroundColor: colors.surface3 }]}
            >
              <File color={colors.textDim} size={18} />
              <Text
                style={[styles.fileName, { color: colors.text }]}
                numberOfLines={1}
              >
                {att.file_url.split('/').pop() ?? 'Attachment'}
              </Text>
            </View>
          ))}

        {/* Message text */}
        {hasText && (
          <Text style={[styles.content, { color: colors.text }]}>
            {message.content}
          </Text>
        )}

        {/* Timestamp + check marks */}
        <View style={[styles.footer, isOut && styles.footerOut]}>
          {isNote && (
            <Text style={[styles.noteLabel, { color: colors.orange }]}>
              Note •{' '}
            </Text>
          )}
          <Text style={[styles.time, { color: isOut ? 'rgba(255,255,255,0.65)' : colors.textDim2 }]}>
            {formatTime(message.createdAt)}
          </Text>
          {isOut && !isNote && (
            <CheckMarks status={message.status} pending={message.isPending} />
          )}
        </View>
      </TouchableOpacity>

      {/* Bubble tail */}
      {showTail && (
        <View
          style={[
            styles.tail,
            isOut ? styles.tailOut : styles.tailIn,
            {
              borderBottomColor: bubbleBg,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 8,
    marginVertical: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  wrapperOut: { justifyContent: 'flex-end' },
  wrapperIn: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    // Shadow on light mode
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleOut: {},
  bubbleIn: {},

  content: {
    fontSize: 15,
    lineHeight: 21,
    flexShrink: 1,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 3,
    marginTop: 3,
  },
  footerOut: { justifyContent: 'flex-end' },

  time: { fontSize: 11 },
  noteLabel: { fontSize: 11, fontStyle: 'italic' },

  // Reply context
  replyStrip: {
    borderLeftWidth: 3,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 6,
  },
  replySender: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  replyContent: { fontSize: 13, lineHeight: 17 },

  // Attachments
  attachmentImage: {
    width: 220,
    height: 160,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileName: { fontSize: 13, flex: 1 },

  // Activity messages
  activityRow: { alignItems: 'center', marginVertical: 6 },
  activityPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activityText: { fontSize: 12, fontStyle: 'italic' },

  // Private note badge
  notePill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  notePillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  // Bubble tail (triangle)
  tail: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 0,
  },
  tailOut: { marginLeft: 2 },
  tailIn: { marginRight: 2 },
});
