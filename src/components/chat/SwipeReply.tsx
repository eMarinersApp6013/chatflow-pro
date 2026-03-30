// SwipeReply — wraps a message row and detects a rightward pan gesture.
// On threshold (60px), triggers onReply and springs back to origin.
// Uses GestureDetector + Reanimated 3.

import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { Reply } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

const REPLY_THRESHOLD = 64;

interface Props {
  children: React.ReactNode;
  onReply: () => void;
  // Only enable swipe for non-activity messages
  enabled?: boolean;
}

export default function SwipeReply({ children, onReply, enabled = true }: Props) {
  const { colors } = useUIStore();
  const translateX = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const triggered = useSharedValue(false);

  const triggerReply = useCallback(() => {
    onReply();
  }, [onReply]);

  const pan = Gesture.Pan()
    .enabled(enabled)
    // Only activate for clear rightward swipes
    .activeOffsetX(12)
    .failOffsetX(-5)
    .onUpdate((e) => {
      // Clamp to positive x only (right swipe), with resistance
      const x = Math.max(0, e.translationX);
      translateX.value = Math.min(x * 0.6, REPLY_THRESHOLD + 12);
      iconOpacity.value = Math.min(translateX.value / REPLY_THRESHOLD, 1);

      if (translateX.value >= REPLY_THRESHOLD && !triggered.value) {
        triggered.value = true;
        runOnJS(triggerReply)();
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      iconOpacity.value = withSpring(0);
      triggered.value = false;
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: 0.7 + iconOpacity.value * 0.3 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.container}>
        {/* Reply icon that appears behind as you swipe */}
        <Animated.View style={[styles.replyIcon, iconStyle]}>
          <Reply color={colors.green} size={20} />
        </Animated.View>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  replyIcon: {
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
  },
});
