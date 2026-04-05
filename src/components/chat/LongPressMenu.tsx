// LongPressMenu — animated bottom-sheet context menu triggered by long-pressing a message.
// Options: Copy, Reply, Forward, Star/Unstar, Delete. Slides up from bottom with dim overlay.
// IMPORTANT: ALL StyleSheet.create calls are outside the component to prevent re-creation on
// every render (which caused StyleSheet ID overflow and crashes).

import { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Clipboard,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Copy, Forward, Reply, Star, Trash2 } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import type MessageModel from '../../db/models/MessageModel';

interface Props {
  message: MessageModel | null;
  visible: boolean;
  onClose: () => void;
  onReply: (message: MessageModel) => void;
  onForward?: (message: MessageModel) => void;
  onStar: (message: MessageModel) => void;
  onDelete: (message: MessageModel) => void;
  onReact?: (emoji: string) => void;
}

// ── Static styles (layout / size only — no colors) ────────────────────────
const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 34, overflow: 'hidden',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  preview: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  previewText: { fontSize: 13, lineHeight: 18 },
  emojiRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emojiBtn: { padding: 6 },
  emoji: { fontSize: 26 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 16 },
});

export default function LongPressMenu({
  message, visible, onClose, onReply, onForward, onStar, onDelete, onReact,
}: Props) {
  const { colors } = useUIStore();
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 180 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(300, { duration: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!message) return null;

  const handleCopy = () => { if (message.content) Clipboard.setString(message.content); onClose(); };
  const handleReply = () => { onReply(message); onClose(); };
  const handleStar = () => { onStar(message); onClose(); };
  const handleDelete = () => {
    onClose();
    Alert.alert('Delete message', 'This will delete the message for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(message) },
    ]);
  };

  const preview = message.content
    ? message.content.length > 80 ? message.content.slice(0, 80) + '…' : message.content
    : message.attachments.length > 0 ? '📎 Attachment' : '';

  const actions = [
    { icon: <Copy color={colors.textDim} size={20} />, label: 'Copy', onPress: handleCopy, show: !!message.content, labelColor: colors.text },
    { icon: <Reply color={colors.textDim} size={20} />, label: 'Reply', onPress: handleReply, show: true, labelColor: colors.text },
    { icon: <Forward color={colors.textDim} size={20} />, label: 'Forward', onPress: () => { if (onForward) onForward(message); onClose(); }, show: !!message.content, labelColor: colors.text },
    { icon: <Star color={message.isStarred ? colors.yellow : colors.textDim} size={20} fill={message.isStarred ? colors.yellow : 'transparent'} />, label: message.isStarred ? 'Unstar' : 'Star', onPress: handleStar, show: true, labelColor: message.isStarred ? colors.yellow : colors.text },
    { icon: <Trash2 color={colors.danger} size={20} />, label: 'Delete', onPress: handleDelete, show: message.isOutgoing, labelColor: colors.danger },
  ].filter((a) => a.show);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, overlayStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { backgroundColor: colors.surface }, sheetStyle]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Quick emoji reactions */}
        <View style={[styles.emojiRow, { borderBottomColor: colors.border }]}>
          {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
            <TouchableOpacity key={emoji} style={styles.emojiBtn} onPress={() => { onReact?.(emoji); onClose(); }}>
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {preview ? (
          <View style={[styles.preview, { borderBottomColor: colors.border, backgroundColor: colors.surface2 }]}>
            <Text style={[styles.previewText, { color: colors.textDim }]} numberOfLines={3}>{preview}</Text>
          </View>
        ) : null}

        {actions.map((action) => (
          <TouchableOpacity key={action.label} style={[styles.row, { borderBottomColor: colors.border }]} onPress={action.onPress} activeOpacity={0.7}>
            {action.icon}
            <Text style={[styles.rowLabel, { color: action.labelColor }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Modal>
  );
}
