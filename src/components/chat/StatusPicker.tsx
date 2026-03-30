// StatusPicker — bottom sheet for changing conversation status.
// Options: Open, Pending, Snoozed, Resolved. Active status highlighted.

import { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CheckCircle, Clock, Pause, RefreshCw } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import type { ConversationStatus } from '../../types/chatwoot';

interface StatusOption {
  value: ConversationStatus;
  label: string;
  desc: string;
  color: string;
  Icon: typeof CheckCircle;
}

interface Props {
  visible: boolean;
  currentStatus: ConversationStatus;
  onClose: () => void;
  onSelect: (status: ConversationStatus) => void;
}

export default function StatusPicker({ visible, currentStatus, onClose, onSelect }: Props) {
  const { colors } = useUIStore();

  const translateY = useSharedValue(300);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 180 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(300, { duration: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const options: StatusOption[] = [
    {
      value: 'open',
      label: 'Open',
      desc: 'Active conversation',
      color: colors.green,
      Icon: RefreshCw,
    },
    {
      value: 'pending',
      label: 'Pending',
      desc: 'Waiting for customer reply',
      color: colors.orange,
      Icon: Clock,
    },
    {
      value: 'snoozed',
      label: 'Snoozed',
      desc: 'Remind me later',
      color: colors.purple,
      Icon: Pause,
    },
    {
      value: 'resolved',
      label: 'Resolved',
      desc: 'Issue resolved',
      color: colors.blueTick,
      Icon: CheckCircle,
    },
  ];

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
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 8,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textDim,
      textAlign: 'center',
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginHorizontal: 20,
      marginBottom: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    info: { flex: 1 },
    label: { fontSize: 16, fontWeight: '500', color: colors.text },
    desc: { fontSize: 13, color: colors.textDim, marginTop: 1 },
    activeMark: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.green,
    },
  });

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[s.overlay, overlayStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[s.sheet, sheetStyle]}>
        <View style={s.handle} />
        <Text style={s.title}>Change Status</Text>

        {options.map((opt) => {
          const active = currentStatus === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={s.row}
              onPress={() => { onSelect(opt.value); onClose(); }}
              activeOpacity={0.7}
            >
              <View style={[s.iconWrap, { backgroundColor: opt.color + '22' }]}>
                <opt.Icon color={opt.color} size={20} />
              </View>
              <View style={s.info}>
                <Text style={s.label}>{opt.label}</Text>
                <Text style={s.desc}>{opt.desc}</Text>
              </View>
              {active && <View style={s.activeMark} />}
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </Modal>
  );
}
