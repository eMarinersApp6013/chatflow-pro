// MessageInput — bottom bar with text input + send button (Phase 2)

import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Send, StickyNote } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import type { MessageMode } from '../../types/app';

interface Props {
  mode: MessageMode;
  onSend: (content: string, mode: MessageMode) => void;
  onModeChange: (mode: MessageMode) => void;
}

export default function MessageInput({ mode, onSend, onModeChange }: Props) {
  const { colors } = useUIStore();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim(), mode);
    setText('');
  };

  const s = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 8,
    },
    noteToggle: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: mode === 'note' ? colors.noteYellow : 'transparent',
    },
    inputWrap: {
      flex: 1,
      backgroundColor: colors.surface2,
      borderRadius: 22,
      paddingHorizontal: 14,
      paddingVertical: 8,
      minHeight: 40,
      justifyContent: 'center',
    },
    input: { fontSize: 15, color: colors.text, maxHeight: 100 },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.green,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={s.container}>
      <TouchableOpacity
        style={s.noteToggle}
        onPress={() => onModeChange(mode === 'note' ? 'reply' : 'note')}
      >
        <StickyNote color={mode === 'note' ? colors.orange : colors.textDim} size={20} />
      </TouchableOpacity>
      <View style={s.inputWrap}>
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder={mode === 'note' ? 'Add a private note…' : 'Type a message…'}
          placeholderTextColor={colors.textDim2}
          multiline
          returnKeyType="default"
        />
      </View>
      <TouchableOpacity style={s.sendBtn} onPress={handleSend}>
        <Send color="#ffffff" size={18} />
      </TouchableOpacity>
    </View>
  );
}
