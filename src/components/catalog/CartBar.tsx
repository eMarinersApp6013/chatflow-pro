// CartBar — floating bar at bottom of catalog showing item count + total.

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useCatalogStore } from '../../store/catalogStore';

export default function CartBar() {
  const { colors } = useUIStore();
  const { cartCount, cartTotal } = useCatalogStore();

  if (cartCount === 0) return null;

  return (
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
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 8,
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
