// ProductCard — grid card for catalog with emoji, name, price, rating, stock badges, heart.

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, Star } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import type ProductModel from '../../db/models/ProductModel';

interface Props {
  product: ProductModel;
  wishlisted: boolean;
  onPress: () => void;
  onToggleWishlist: () => void;
}

export default function ProductCard({ product, wishlisted, onPress, onToggleWishlist }: Props) {
  const { colors } = useUIStore();

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Heart icon */}
      <TouchableOpacity
        style={s.heartBtn}
        onPress={onToggleWishlist}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Heart
          color={wishlisted ? '#ef4444' : colors.textDim2}
          size={18}
          fill={wishlisted ? '#ef4444' : 'transparent'}
        />
      </TouchableOpacity>

      {/* Hot badge */}
      {product.isHot && (
        <View style={[s.hotBadge, { backgroundColor: colors.danger }]}>
          <Text style={s.hotText}>🔥 HOT</Text>
        </View>
      )}

      {/* Stock badges — ⑦ Restock alerts */}
      {product.isOutOfStock && (
        <View style={[s.stockBadge, { backgroundColor: colors.danger }]}>
          <Text style={s.stockText}>OUT OF STOCK</Text>
        </View>
      )}
      {product.isLowStock && (
        <View style={[s.stockBadge, { backgroundColor: colors.orange }]}>
          <Text style={s.stockText}>Only {product.stock} left</Text>
        </View>
      )}

      {/* Emoji area */}
      <View style={[s.emojiArea, { backgroundColor: colors.surface2 }]}>
        <Text style={s.emoji}>{product.emoji || '📦'}</Text>
      </View>

      {/* Name */}
      <Text style={[s.name, { color: colors.text }]} numberOfLines={2}>
        {product.name}
      </Text>

      {/* Rating */}
      <View style={s.ratingRow}>
        <Star color={colors.yellow} size={12} fill={colors.yellow} />
        <Text style={[s.rating, { color: colors.textDim }]}>
          {product.rating} ({product.reviews})
        </Text>
      </View>

      {/* Price */}
      <Text style={[s.price, { color: colors.green }]}>₹{product.price.toLocaleString()}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    margin: 4,
    minWidth: '44%',
    maxWidth: '50%',
  },
  heartBtn: { position: 'absolute', top: 8, right: 8, zIndex: 2 },
  hotBadge: {
    position: 'absolute', top: 8, left: 8, zIndex: 2,
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  hotText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  stockBadge: {
    position: 'absolute', top: 28, left: 8, zIndex: 2,
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  stockText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  emojiArea: {
    height: 80, borderRadius: 10, justifyContent: 'center',
    alignItems: 'center', marginBottom: 8, marginTop: 4,
  },
  emoji: { fontSize: 36 },
  name: { fontSize: 13, fontWeight: '600', lineHeight: 17, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  rating: { fontSize: 11 },
  price: { fontSize: 16, fontWeight: '800' },
});
