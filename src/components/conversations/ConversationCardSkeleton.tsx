// Skeleton loader for conversation cards — pulsing placeholder shown during initial sync.
import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useUIStore } from '../../store/uiStore';

function SkeletonBar({
  width,
  height = 12,
  borderRadius: br,
}: {
  width: number | string;
  height?: number;
  borderRadius?: number;
}) {
  const { colors } = useUIStore();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width: width as number,
        height,
        borderRadius: br ?? height / 2,
        backgroundColor: colors.surface2,
        opacity,
      }}
    />
  );
}

export function ConversationCardSkeleton() {
  const { colors } = useUIStore();

  return (
    <View style={[styles.card, { borderBottomColor: colors.border }]}>
      {/* Avatar circle */}
      <SkeletonBar width={48} height={48} borderRadius={24} />
      <View style={styles.body}>
        {/* Name + time row */}
        <View style={styles.topRow}>
          <SkeletonBar width={130} height={14} />
          <SkeletonBar width={38} height={10} />
        </View>
        {/* Message preview */}
        <SkeletonBar width={200} height={12} />
        {/* Label chips */}
        <View style={styles.labelRow}>
          <SkeletonBar width={52} height={10} borderRadius={5} />
          <SkeletonBar width={36} height={10} borderRadius={5} />
        </View>
      </View>
    </View>
  );
}

export function ConversationListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <ConversationCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  body: { flex: 1, gap: 6 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelRow: { flexDirection: 'row', gap: 6 },
});
