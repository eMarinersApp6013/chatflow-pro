// BundleCard — bundle deal card with product list + savings + one-tap add.

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Gift, Plus } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import type { Bundle, Product } from '../../types/catalog';

interface Props {
  bundle: Bundle;
  products: Product[];
  onAddAll: () => void;
}

export default function BundleCard({ bundle, products, onAddAll }: Props) {
  const { colors } = useUIStore();
  const originalTotal = products.reduce((s, p) => s + p.price, 0);

  return (
    <View style={[s.card, { backgroundColor: colors.purple + '11', borderColor: colors.purple + '44' }]}>
      <View style={s.header}>
        <Text style={s.emoji}>{bundle.emoji}</Text>
        <View style={s.headerInfo}>
          <Text style={[s.name, { color: colors.text }]}>{bundle.name}</Text>
          <Text style={[s.products, { color: colors.textDim }]}>
            {products.map((p) => p.emoji + ' ' + p.name.split(' ')[0]).join(' · ')}
          </Text>
        </View>
      </View>

      <View style={s.priceRow}>
        <Text style={[s.original, { color: colors.textDim }]}>₹{originalTotal.toLocaleString()}</Text>
        <Text style={[s.bundle, { color: colors.purple }]}>₹{bundle.bundlePrice.toLocaleString()}</Text>
        <View style={[s.saveBadge, { backgroundColor: colors.green + '22' }]}>
          <Text style={[s.saveText, { color: colors.green }]}>Save ₹{bundle.savings}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[s.addBtn, { backgroundColor: colors.purple }]}
        onPress={onAddAll}
        activeOpacity={0.7}
      >
        <Plus color="#fff" size={16} />
        <Text style={s.addBtnText}>Add All to Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  emoji: { fontSize: 28 },
  headerInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700' },
  products: { fontSize: 12, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  original: { fontSize: 14, textDecorationLine: 'line-through' },
  bundle: { fontSize: 18, fontWeight: '800' },
  saveBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  saveText: { fontSize: 12, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
