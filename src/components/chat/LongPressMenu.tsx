// LongPressMenu — animated bottom-sheet context menu triggered by long-pressing a message.
// Options: Copy, Reply, Star/Unstar, Delete. Slides up from bottom with dim overlay.

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
  runOnJS,
} from 'react-native-reanimated';
import { Copy, Reply, Star, Trash2, X } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import type MessageModel from '../../db/models/MessageModel';

interface Props {
  message: MessageModel | null;
  visible: boolean;
  onClose: () => void;
  onReply: (message: MessageModel) => void;
  onStar: (message: MessageModel) => void;
  onDelete: (message: MessageModel) => void;
}

export default function LongPressMenu({
  message,
  visible,
  onClose,
  onReply,
  onStar,
  onDelete,
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

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!message) return null;

  const handleCopy = () => {
    if (message.content) {
      Clipboard.setString(message.content);
    }
    onClose();
  };

  const handleReply = () => { onReply(message); onClose(); };
  const handleStar = () => { onStar(message); onClose(); };

  const handleDelete = () => {
    onClose();
    Alert.alert(
      'Delete message',
      'This will delete the message for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(message) },
      ]
    );
  };

  // Message preview shown at the top of the sheet
  const preview = message.content
    ? message.content.length > 80
      ? message.content.slice(0, 80) + '…'
      : message.content
    : message.attachments.length > 0
    ? '📎 Attachment'
    : '';

  const s = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 34,
      overflow: 'hidden',
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 4,
    },
    preview: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface2,
    },
    previewText: { fontSize: 13, color: colors.textDim, lineHeight: 18 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    rowLabel: { fontSize: 16, color: colors.text },
    deleteLabel: { color: colors.danger },
    starredLabel: { color: colors.yellow },
  });

  const actions = [
    {
      icon: <Copy color={colors.textDim} size={20} />,
      label: 'Copy',
      onPress: handleCopy,
      show: !!message.content,
    },
    {
      icon: <Reply color={colors.textDim} size={20} />,
      label: 'Reply',
      onPress: handleReply,
      show: true,
    },
    {
      icon: <Star color={message.isStarred ? colors.yellow : colors.textDim} size={20} fill={message.isStarred ? colors.yellow : 'transparent'} />,
      label: message.isStarred ? 'Unstar' : 'Star',
      onPress: handleStar,
      show: true,
      labelStyle: message.isStarred ? s.starredLabel : undefined,
    },
    {
      icon: <Trash2 color={colors.danger} size={20} />,
      label: 'Delete',
      onPress: handleDelete,
      show: message.isOutgoing,
      labelStyle: s.deleteLabel,
    },
  ].filter((a) => a.show);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[s.overlay, overlayStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[s.sheet, sheetStyle]}>
        <View style={s.handle} />

        {preview ? (
          <View style={s.preview}>
            <Text style={s.previewText} numberOfLines={3}>{preview}</Text>
          </View>
        ) : null}

        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={s.row}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            {action.icon}
            <Text style={[s.rowLabel, action.labelStyle]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Modal>
  );
}
