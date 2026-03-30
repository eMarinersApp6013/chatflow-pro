// Toast — animated, auto-dismissing notification overlay (Reanimated 3).
// Renders above everything in the root layout.
// Green = success, Red = error, Orange = warning, Blue = info.

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useToastStore } from '../../store/toastStore';
import type { Toast as ToastItem } from '../../store/toastStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Individual toast item with slide-down + fade-out
function ToastItem({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    // Slide in + fade in
    opacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.back(1.2)) });

    // Auto-dismiss after duration
    opacity.value = withDelay(
      toast.duration - 300,
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onDismiss)(toast.id);
      })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const bgColor = {
    success: '#166534',
    error: '#7f1d1d',
    warning: '#78350f',
    info: '#1e3a5f',
  }[toast.type];

  const borderColor = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  }[toast.type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[toast.type];

  const iconColor = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  }[toast.type];

  return (
    <Animated.View
      style={[s.toast, { backgroundColor: bgColor, borderLeftColor: borderColor }, animStyle]}
    >
      <Text style={[s.icon, { color: iconColor }]}>{icon}</Text>
      <Text style={s.message} numberOfLines={2}>{toast.message}</Text>
    </Animated.View>
  );
}

// Toast container — shows stack of toasts at top of screen
export default function ToastContainer() {
  const { toasts, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[s.container, { top: insets.top + 8 }]} pointerEvents="none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={hideToast} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: { fontSize: 15, fontWeight: '800', width: 18, textAlign: 'center' },
  message: { flex: 1, color: '#ffffff', fontSize: 14, fontWeight: '500', lineHeight: 20 },
});
