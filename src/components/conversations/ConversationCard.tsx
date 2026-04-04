// ConversationCard — WhatsApp-style conversation row with swipe gestures.
// Swipe RIGHT → opens contact profile.
// Swipe LEFT  → triggers label action.

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { User, Tag } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import Avatar from '../common/Avatar';
import UnreadBadge from './UnreadBadge';
import LabelDot from '../common/LabelDot';
import InboxIcon from './InboxIcon';
import { formatTime, truncateText } from '../../utils/formatters';
import type ConversationModel from '../../db/models/ConversationModel';

const SWIPE_THRESHOLD = 72;
const ACTION_WIDTH = 72;

interface Props {
  conversation: ConversationModel;
  onPress: () => void;
  onLabelPress?: () => void;
}

export default function ConversationCard({ conversation, onPress, onLabelPress }: Props) {
  const { colors } = useUIStore();
  const labels = conversation.labels;
  const hasUnread = conversation.unreadCount > 0;
  const preview = conversation.lastMessageContent
    ? truncateText(conversation.lastMessageContent, 58)
    : 'Tap to open conversation';

  const translateX = useSharedValue(0);
  const triggered = useSharedValue(false);

  const openContact = () => {
    router.push(`/contact/${conversation.remoteId}`);
  };

  const openLabels = () => {
    if (onLabelPress) onLabelPress();
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      const tx = e.translationX;
      if (tx > 0) {
        // Swipe right — reveal contact action
        translateX.value = Math.min(tx * 0.55, ACTION_WIDTH + 16);
        if (tx >= SWIPE_THRESHOLD && !triggered.value) {
          triggered.value = true;
          runOnJS(openContact)();
        }
      } else {
        // Swipe left — reveal label action
        translateX.value = Math.max(tx * 0.55, -(ACTION_WIDTH + 16));
        if (tx <= -SWIPE_THRESHOLD && !triggered.value) {
          triggered.value = true;
          runOnJS(openLabels)();
        }
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      triggered.value = false;
    });

  const rowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rightRevealOpacity = useAnimatedStyle(() => ({
    opacity: Math.max(0, -translateX.value / ACTION_WIDTH),
  }));

  const leftRevealOpacity = useAnimatedStyle(() => ({
    opacity: Math.max(0, translateX.value / ACTION_WIDTH),
  }));

  const s = StyleSheet.create({
    wrapper: { overflow: 'hidden' },
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
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
    nameRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8 },
    name: { fontSize: 15.5, fontWeight: '600', color: colors.text, flexShrink: 1 },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    time: { fontSize: 12, color: colors.textDim2 },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    preview: { fontSize: 14, color: colors.textDim, flex: 1, marginRight: 8 },
    previewUnread: { color: colors.text, fontWeight: '500' },
    labelsRow: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
    // Reveal actions
    actionLeft: {
      position: 'absolute', left: 0, top: 0, bottom: 0,
      width: ACTION_WIDTH, justifyContent: 'center', alignItems: 'center',
      backgroundColor: colors.green,
    },
    actionRight: {
      position: 'absolute', right: 0, top: 0, bottom: 0,
      width: ACTION_WIDTH, justifyContent: 'center', alignItems: 'center',
      backgroundColor: colors.purple,
    },
    actionText: { fontSize: 10, color: '#fff', fontWeight: '600', marginTop: 4 },
  });

  return (
    <View style={s.wrapper}>
      {/* Left action (revealed by swiping right) — contact profile */}
      <Animated.View style={[s.actionLeft, leftRevealOpacity]}>
        <User color="#fff" size={22} />
        <Text style={s.actionText}>Profile</Text>
      </Animated.View>

      {/* Right action (revealed by swiping left) — labels */}
      <Animated.View style={[s.actionRight, rightRevealOpacity]}>
        <Tag color="#fff" size={22} />
        <Text style={s.actionText}>Labels</Text>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={rowAnimStyle}>
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
                    {conversation.lastMessageAt ? formatTime(conversation.lastMessageAt) : ''}
                  </Text>
                </View>
              </View>
              <View style={s.bottomRow}>
                <Text style={[s.preview, hasUnread && s.previewUnread]} numberOfLines={1}>
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
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
