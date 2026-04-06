// MessageInput — bottom composer bar.
// Phase 3 additions: attachment button, canned-response "/" autocomplete overlay.

import { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  Keyboard,
} from 'react-native';
import { Send, StickyNote, MessageSquare, X, Paperclip } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { useCannedResponses } from '../../hooks/useCannedResponses';
import { wsService } from '../../services/WebSocketService';
import type { MessageMode, ReplyContext } from '../../types/app';

interface CannedItem {
  id: number;
  short_code: string;
  content: string;
}

interface Props {
  mode: MessageMode;
  replyContext: ReplyContext | null;
  onSend: (content: string) => void;
  onModeChange: (mode: MessageMode) => void;
  onClearReply: () => void;
  onAttachmentPress: () => void;
  conversationRemoteId?: number; // needed to send typing indicator to Chatwoot
}

export default function MessageInput({
  mode,
  replyContext,
  onSend,
  onModeChange,
  onClearReply,
  onAttachmentPress,
  conversationRemoteId,
}: Props) {
  const { colors } = useUIStore();
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  // Typing indicator: debounce — send typing_off 3s after user stops typing
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Canned responses: active when text starts with "/"
  const isCannedActive = text.startsWith('/') && text.length > 1;
  const cannedQuery = isCannedActive ? text.slice(1) : '';
  const { results: cannedResults } = useCannedResponses(cannedQuery, isCannedActive);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }, [text, onSend]);

  const insertCanned = useCallback((item: CannedItem) => {
    // Intentional: replace "/" trigger text with full canned response content
    setText(item.content);
    inputRef.current?.focus();
  }, []);

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    if (conversationRemoteId && value.length > 0) {
      wsService.sendTyping(conversationRemoteId, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        wsService.sendTyping(conversationRemoteId, false);
      }, 3000);
    }
  }, [conversationRemoteId]);

  const isNote = mode === 'note';
  const inputBg = isNote ? colors.noteYellow : colors.surface2;
  const borderColor = isNote ? colors.noteBorder : colors.border;

  // useMemo prevents StyleSheet.create from running on every render — avoids ID registry overflow crash
  const s = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    // Canned responses overlay (above composer)
    cannedList: {
      maxHeight: 200,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    cannedItem: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    cannedCode: { fontSize: 12, color: colors.green, fontWeight: '700', marginBottom: 2 },
    cannedContent: { fontSize: 14, color: colors.text },
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
    replyBar: { width: 3, borderRadius: 2, backgroundColor: colors.green, alignSelf: 'stretch' },
    replyContent: { flex: 1 },
    replySender: { fontSize: 12, fontWeight: '700', color: colors.green, marginBottom: 2 },
    replyText: { fontSize: 13, color: colors.textDim },
    noteBanner: { paddingHorizontal: 14, paddingTop: 5, paddingBottom: 1 },
    noteBannerText: { fontSize: 11, color: colors.orange, fontStyle: 'italic' },
    // Composer row
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 8,
      paddingVertical: 8,
      gap: 6,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modeActive: { backgroundColor: colors.orange + '33' },
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
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.green,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendDisabled: { opacity: 0.45 },
  }), [colors, mode]);

  return (
    <View style={s.container}>
      {/* Canned response suggestions */}
      {isCannedActive && cannedResults.length > 0 && (
        <FlatList
          style={s.cannedList}
          data={cannedResults}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="always"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.cannedItem}
              onPress={() => insertCanned(item)}
              activeOpacity={0.7}
            >
              <Text style={s.cannedCode}>/{item.short_code}</Text>
              <Text style={s.cannedContent} numberOfLines={2}>{item.content}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Reply preview */}
      {replyContext && (
        <View style={s.replyStrip}>
          <View style={s.replyBar} />
          <View style={s.replyContent}>
            <Text style={s.replySender}>{replyContext.senderName}</Text>
            <Text style={s.replyText} numberOfLines={1}>{replyContext.content}</Text>
          </View>
          <TouchableOpacity onPress={onClearReply} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X color={colors.textDim} size={16} />
          </TouchableOpacity>
        </View>
      )}

      {/* Note mode banner */}
      {isNote && (
        <View style={s.noteBanner}>
          <Text style={s.noteBannerText}>📝 Private note — only visible to agents</Text>
        </View>
      )}

      <View style={s.inputRow}>
        {/* Attachment */}
        <TouchableOpacity
          style={s.iconBtn}
          onPress={onAttachmentPress}
          activeOpacity={0.7}
        >
          <Paperclip color={colors.textDim} size={20} />
        </TouchableOpacity>

        {/* Reply / Note toggle */}
        <TouchableOpacity
          style={[s.iconBtn, isNote && s.modeActive]}
          onPress={() => onModeChange(isNote ? 'reply' : 'note')}
          activeOpacity={0.7}
        >
          {isNote
            ? <StickyNote color={colors.orange} size={18} />
            : <MessageSquare color={colors.textDim} size={18} />}
        </TouchableOpacity>

        <View style={s.inputWrap}>
          <TextInput
            ref={inputRef}
            style={s.input}
            value={text}
            onChangeText={handleTextChange}
            placeholder={isNote ? 'Add a private note…' : 'Type / for quick replies…'}
            placeholderTextColor={colors.textDim2}
            multiline
            returnKeyType="default"
          />
        </View>

        <TouchableOpacity
          style={[s.sendBtn, !text.trim() && s.sendDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
          activeOpacity={0.8}
        >
          <Send color="#fff" size={17} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
