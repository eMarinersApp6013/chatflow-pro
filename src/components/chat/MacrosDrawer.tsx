// MacrosDrawer — quick one-tap macro actions for a conversation.
// Each macro runs a sequence of chatService calls (assign, label, send message, change status).

import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Zap, X } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { chatService } from '../../services/ChatwootAdapter';

interface Macro {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  run: (conversationId: number, agentId: number) => Promise<void>;
}

const MACROS: Macro[] = [
  {
    id: 'assign_me',
    label: 'Assign to Me',
    desc: 'Assign this conversation to yourself',
    emoji: '👤',
    run: async (convId, agentId) => {
      await chatService.assignConversation(convId, agentId);
    },
  },
  {
    id: 'resolve',
    label: 'Resolve & Thank',
    desc: 'Send a closing message and resolve',
    emoji: '✅',
    run: async (convId) => {
      await chatService.sendMessage(convId, {
        content: 'Thank you for reaching out! Your issue has been resolved. Have a great day! 😊',
        message_type: 'outgoing',
      });
      await chatService.toggleStatus(convId, 'resolved');
    },
  },
  {
    id: 'vip',
    label: 'Escalate VIP',
    desc: 'Label as VIP and assign to yourself',
    emoji: '⭐',
    run: async (convId, agentId) => {
      await Promise.all([
        chatService.setLabels(convId, ['vip']),
        chatService.assignConversation(convId, agentId),
      ]);
    },
  },
  {
    id: 'pending',
    label: 'Mark Pending',
    desc: 'Move conversation to Pending status',
    emoji: '⏳',
    run: async (convId) => {
      await chatService.toggleStatus(convId, 'pending');
    },
  },
  {
    id: 'welcome',
    label: 'Send Welcome',
    desc: 'Send a standard greeting message',
    emoji: '👋',
    run: async (convId) => {
      await chatService.sendMessage(convId, {
        content: 'Hello! Thanks for contacting us. How can I assist you today?',
        message_type: 'outgoing',
      });
    },
  },
];

interface Props {
  visible: boolean;
  conversationId: number;
  onClose: () => void;
  onMacroRun?: () => void;
}

export default function MacrosDrawer({
  visible,
  conversationId,
  onClose,
  onMacroRun,
}: Props) {
  const { colors } = useUIStore();
  const { credentials } = useAuthStore();
  const [runningId, setRunningId] = useState<string | null>(null);

  const translateY = useSharedValue(400);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 180 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(400, { duration: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleRun = async (macro: Macro) => {
    if (runningId) return;
    setRunningId(macro.id);
    try {
      await macro.run(conversationId, credentials?.userId ?? 0);
      onMacroRun?.();
      onClose();
    } catch {
      Alert.alert('Macro Failed', 'Could not complete this action. Please try again.');
    } finally {
      setRunningId(null);
    }
  };

  const s = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
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
      width: 36, height: 4,
      backgroundColor: colors.border, borderRadius: 2,
      alignSelf: 'center', marginTop: 10, marginBottom: 4,
    },
    titleRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 20, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    titleIcon: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.orange + '22',
      justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
    closeBtn: { padding: 4 },
    row: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 16,
      gap: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    },
    emoji: { fontSize: 24, width: 36, textAlign: 'center' },
    info: { flex: 1 },
    label: { fontSize: 15, fontWeight: '600', color: colors.text },
    desc: { fontSize: 13, color: colors.textDim, marginTop: 2 },
  });

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[s.overlay, overlayStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[s.sheet, sheetStyle]}>
        <View style={s.handle} />
        <View style={s.titleRow}>
          <View style={s.titleIcon}>
            <Zap color={colors.orange} size={16} />
          </View>
          <Text style={s.title}>Quick Macros</Text>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <X color={colors.textDim} size={20} />
          </TouchableOpacity>
        </View>

        {MACROS.map((macro) => {
          const running = runningId === macro.id;
          return (
            <TouchableOpacity
              key={macro.id}
              style={s.row}
              onPress={() => handleRun(macro)}
              activeOpacity={0.7}
              disabled={!!runningId}
            >
              <Text style={s.emoji}>{macro.emoji}</Text>
              <View style={s.info}>
                <Text style={s.label}>{macro.label}</Text>
                <Text style={s.desc}>{macro.desc}</Text>
              </View>
              {running && <ActivityIndicator color={colors.green} size="small" />}
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </Modal>
  );
}
