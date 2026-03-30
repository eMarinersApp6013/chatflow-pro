// SortOptions — ⑨ dropdown for sort selection including "Best for Me".

import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { ArrowUpDown } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import type { SortOption } from '../../types/catalog';

interface Props {
  value: SortOption;
  onSelect: (opt: SortOption) => void;
}

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Popular' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'new', label: 'New' },
  { value: 'best_for_me', label: '⚓ Best for Me' },
];

export default function SortOptions({ value, onSelect }: Props) {
  const { colors } = useUIStore();
  const [visible, setVisible] = useState(false);

  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 180 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
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

  const activeLabel = OPTIONS.find((o) => o.value === value)?.label ?? 'Sort';

  return (
    <>
      <TouchableOpacity
        style={[s.trigger, { backgroundColor: colors.surface2, borderColor: colors.border }]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <ArrowUpDown color={colors.textDim} size={14} />
        <Text style={[s.triggerText, { color: colors.textDim }]}>{activeLabel}</Text>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="none" onRequestClose={() => setVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <Animated.View style={[s.overlay, overlayStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[s.sheet, sheetStyle, { backgroundColor: colors.surface }]}>
          <View style={[s.handle, { backgroundColor: colors.border }]} />
          <Text style={[s.sheetTitle, { color: colors.textDim, borderBottomColor: colors.border }]}>
            Sort By
          </Text>

          {OPTIONS.map((opt) => {
            const active = value === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[s.optRow, { borderBottomColor: colors.border }]}
                onPress={() => { onSelect(opt.value); setVisible(false); }}
                activeOpacity={0.7}
              >
                <Text style={[s.optLabel, { color: active ? colors.green : colors.text }]}>
                  {opt.label}
                </Text>
                {active && <View style={[s.activeDot, { backgroundColor: colors.green }]} />}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1,
  },
  triggerText: { fontSize: 12, fontWeight: '600' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginTop: 10, marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 14, fontWeight: '600', textAlign: 'center',
    paddingBottom: 12, borderBottomWidth: 1, marginHorizontal: 20,
  },
  optRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optLabel: { fontSize: 16, fontWeight: '500' },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
});
