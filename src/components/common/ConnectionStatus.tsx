// ConnectionStatus — animated banner shown when WebSocket is offline/reconnecting.
// Phase 6: Reanimated slide-down entry, slide-up exit.

import { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useConnectionStore } from '../../store/connectionStore';
import { useUIStore } from '../../store/uiStore';

export default function ConnectionStatus() {
  const { connectionState } = useConnectionStore();
  const { colors } = useUIStore();

  const isVisible = connectionState !== 'connected';
  const translateY = useSharedValue(-40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 16, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(-40, { duration: 200 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [isVisible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const statusConfig = {
    connecting: {
      label: 'Connecting…',
      bg: colors.surface2,
      color: colors.textDim,
    },
    reconnecting: {
      label: 'Reconnecting — checking connection…',
      bg: '#3d2f1a',
      color: colors.orange,
    },
    disconnected: {
      label: 'Offline — messages will queue and send when connected',
      bg: '#3d1a1a',
      color: colors.danger,
    },
  };

  const config = connectionState !== 'connected'
    ? statusConfig[connectionState as keyof typeof statusConfig]
    : null;

  if (!config && !isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: config?.bg ?? colors.surface2 },
        animStyle,
      ]}
    >
      <Text style={[styles.text, { color: config?.color ?? colors.textDim }]}>
        {config?.label ?? ''}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    overflow: 'hidden',
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
});
