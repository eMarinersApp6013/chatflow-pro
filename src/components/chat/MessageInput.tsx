// MessageInput — bottom composer bar.
// Features: Reply/Note mode toggle, send button, reply preview strip.

import { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Send, StickyNote, MessageSquare, X } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import type { MessageMode, ReplyContext } from '../../types/app';

interface Props {
  mode: MessageMode;
  replyContext: ReplyContext | null;
  onSend: (content: string) => void;
  onModeChange: (mode: MessageMode) => void;
  onClearReply: () => void;
}

export default function MessageInput({
  mode,
  replyContext,
  onSend,
  onModeChange,
  onClearReply,
}: Props) {
  const { colors } = useUIStore();
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const isNote = mode === 'note';
  const inputBg = isNote ? colors.noteYellow : colors.surface2;
  const borderColor = isNote ? colors.noteBorder : colors.border;

  const s = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    // Reply preview strip
    replyStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.surface2,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 10,
    },
    replyBar: { width: 3, height: '100%', backgroundColor: colors.green, borderRadius: 2 },
    replyContent: { flex: 1 },
    replySender: { fontSize: 12, fontWeight: '700', color: colors.green, marginBottom: 2 },
    replyText: { fontSize: 13, color: colors.textDim, numberOfLines: 1 } as object,
    replyClose: { padding: 4 },

    // Mode toggle + input row
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 8,
      paddingVertical: 8,
      gap: 8,
    },
    modeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isNote ? colors.orange + '33' : colors.surface2,
      borderWidth: 1,
      borderColor: isNote ? colors.orange : colors.border,
    },
    inputWrap: {
      flex: 1,
      backgroundColor: inputBg,
      borderRadius: 22,
      borderWidth: 1,
      borderColor,
      paddingHorizontal: 14,
      paddingVertical: 8,
      minHeight: 40,
      justifyContent: 'center',
    },
    input: { fontSize: 15, color: colors.text, maxHeight: 120 },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.green,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noteBanner: {
      paddingHorizontal: 14,
      paddingTop: 6,
      paddingBottom: 2,
    },
    noteBannerText: {
      fontSize: 11,
      color: colors.orange,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={s.container}>
      {/* Reply preview */}
      {replyContext && (
        <View style={s.replyStrip}>
          <View style={s.replyBar} />
          <View style={s.replyContent}>
            <Text style={s.replySender}>{replyContext.senderName}</Text>
            <Text style={s.replyText} numberOfLines={1}>
              {replyContext.content}
            </Text>
          </View>
          <TouchableOpacity style={s.replyClose} onPress={onClearReply}>
            <X color={colors.textDim} size={16} />
          </TouchableOpacity>
        </View>
      )}

      {/* Note mode banner */}
      {isNote && (
        <View style={s.noteBanner}>
          <Text style={s.noteBannerText}>
            📝 Private note — only visible to agents
          </Text>
        </View>
      )}

      <View style={s.inputRow}>
        {/* Reply / Note toggle */}
        <TouchableOpacity
          style={s.modeBtn}
          onPress={() => onModeChange(isNote ? 'reply' : 'note')}
          activeOpacity={0.7}
        >
          {isNote ? (
            <StickyNote color={colors.orange} size={18} />
          ) : (
            <MessageSquare color={colors.textDim} size={18} />
          )}
        </TouchableOpacity>

        <View style={s.inputWrap}>
          <TextInput
            ref={inputRef}
            style={s.input}
            value={text}
            onChangeText={setText}
            placeholder={isNote ? 'Add a private note…' : 'Type a message…'}
            placeholderTextColor={colors.textDim2}
            multiline
            returnKeyType="default"
          />
        </View>

        <TouchableOpacity
          style={[s.sendBtn, !text.trim() && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={!text.trim()}
          activeOpacity={0.8}
        >
          <Send color="#ffffff" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
