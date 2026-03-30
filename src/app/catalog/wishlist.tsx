// Wishlist screen — ④ grid of wishlisted products with heart toggle.

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Heart } from 'lucide-react-native';
import { Q } from '@nozbe/watermelondb';
import { useUIStore } from '../../store/uiStore';
import { useWishlist } from '../../hooks/useWishlist';
import { productsCollection } from '../../db/database';
import ProductCard from '../../components/catalog/ProductCard';
import type ProductModel from '../../db/models/ProductModel';

export default function WishlistScreen() {
  const { colors } = useUIStore();
  const { items, toggle: toggleWishlist, isWishlisted } = useWishlist();
  const [products, setProducts] = useState<ProductModel[]>([]);

  // Load product models for wishlisted items
  useEffect(() => {
    if (items.length === 0) { setProducts([]); return; }

    const load = async () => {
      const ids = items.map((i) => i.productRemoteId);
      const results: ProductModel[] = [];
      for (const rid of ids) {
        const found = await productsCollection
          .query(Q.where('remote_id', rid))
          .fetch();
        if (found[0]) results.push(found[0] as ProductModel);
      }
      setProducts(results);
    };
    load();
  }, [items]);

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Wishlist ({items.length})</Text>
      </View>

      {products.length === 0 ? (
        <View style={s.emptyWrap}>
          <Heart color={colors.textDim} size={56} />
          <Text style={[s.emptyTitle, { color: colors.text }]}>Wishlist is empty</Text>
          <Text style={[s.emptySubtitle, { color: colors.textDim }]}>
            Tap the heart icon on any product to save it here.
          </Text>
          <TouchableOpacity
            style={[s.shopBtn, { backgroundColor: colors.green }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={s.shopBtnText}>Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.grid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={isWishlisted(product.remoteId)}
                onPress={() => router.push(`/catalog/product/${product.remoteId}`)}
                onToggleWishlist={() => toggleWishlist(product.remoteId)}
              />
            ))}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 52, paddingBottom: 12, paddingHorizontal: 12,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#fff' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  shopBtn: { borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  shopBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 8, paddingTop: 8,
  },
});
