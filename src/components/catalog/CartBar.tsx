// CartBar — floating cart bar at bottom of catalog.
// Phase 6: Reanimated slide-up animation when first item is added.

import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ShoppingCart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useCatalogStore } from '../../store/catalogStore';

export default function CartBar() {
  const { colors } = useUIStore();
  const { cartCount, cartTotal } = useCatalogStore();

  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (cartCount > 0) {
      // Slide up + fade in when cart gains first item
      translateY.value = withSpring(0, { damping: 14, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      // Slide down when cart becomes empty
      translateY.value = withTiming(80, { duration: 200 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [cartCount > 0]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Always render — animation handles show/hide
  return (
    <Animated.View style={[s.wrapper, animStyle]}>
      <TouchableOpacity
        style={[s.bar, { backgroundColor: colors.green }]}
        onPress={() => router.push('/catalog/cart')}
        activeOpacity={0.85}
      >
        <View style={s.left}>
          <View style={s.badge}>
            <Text style={s.badgeText}>{cartCount}</Text>
          </View>
          <ShoppingCart color="#fff" size={20} />
          <Text style={s.label}>
            {cartCount} item{cartCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={s.total}>₹{cartTotal.toLocaleString()} →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrapper: { paddingHorizontal: 12, paddingBottom: 8 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: '#fff',
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: '#005c4b', fontSize: 12, fontWeight: '800' },
  label: { color: '#fff', fontSize: 14, fontWeight: '600' },
  total: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
