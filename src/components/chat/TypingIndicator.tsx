// TypingIndicator — animated three-dot bouncing indicator (WhatsApp style).
// Uses Reanimated 3 withRepeat + withSequence for smooth animation.

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useUIStore } from '../../store/uiStore';

interface Props {
  names?: string[];
}

function Dot({ delay }: { delay: number }) {
  const { colors } = useUIStore();
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-5, { duration: 250, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[styles.dot, animStyle, { backgroundColor: colors.textDim }]}
    />
  );
}

export default function TypingIndicator({ names = [] }: Props) {
  const { colors } = useUIStore();

  const label =
    names.length === 0
      ? 'Typing…'
      : names.length === 1
      ? `${names[0]} is typing`
      : `${names[0]} and ${names.length - 1} more are typing`;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.bubble,
          { backgroundColor: colors.bubbleIn, borderColor: colors.border },
        ]}
      >
        <View style={styles.dotsRow}>
          <Dot delay={0} />
          <Dot delay={160} />
          <Dot delay={320} />
        </View>
      </View>
      <Text style={[styles.label, { color: colors.textDim2 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    marginVertical: 4,
    gap: 8,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    height: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: { fontSize: 12 },
});
