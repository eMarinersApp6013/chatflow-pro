// Product detail — variant selector, bundle suggestions, restock alert, share in chat.

import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft, Heart, Star, ShoppingCart, Minus, Plus, Bell, Share2,
} from 'lucide-react-native';
import { useUIStore } from '../../../store/uiStore';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../hooks/useWishlist';
import { productsCollection } from '../../../db/database';
import { Q } from '@nozbe/watermelondb';
import { demoBundles, demoProducts } from '../../../data/demoProducts';
import BundleCard from '../../../components/catalog/BundleCard';
import type ProductModel from '../../../db/models/ProductModel';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useUIStore();
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState<ProductModel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notifyMe, setNotifyMe] = useState(false);

  useEffect(() => {
    if (!id) return;
    const sub = productsCollection
      .query(Q.where('remote_id', id))
      .observe()
      .subscribe({
        next: (records) => {
          const p = records[0] as ProductModel | undefined;
          if (p) {
            setProduct(p);
            if (!selectedVariant && p.variants.length > 0) {
              setSelectedVariant(p.variants[0]);
            }
          }
        },
      });
    return () => sub.unsubscribe();
  }, [id]);

  // Find bundles containing this product — ⑥
  const relatedBundles = demoBundles.filter((b) => b.productIds.includes(id ?? ''));

  const handleAddToCart = async () => {
    if (!product || !id) return;
    if (product.isOutOfStock) {
      Alert.alert('Out of Stock', 'This product is currently unavailable.');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      await addToCart(id, selectedVariant ?? undefined);
    }
    Alert.alert('Added to Cart', `${quantity}x ${product.name} added!`);
  };

  const handleBundleAdd = async (productIds: string[]) => {
    for (const pid of productIds) {
      await addToCart(pid);
    }
    Alert.alert('Bundle Added', `${productIds.length} items added to cart!`);
  };

  // ⑦ Restock notify
  const handleNotifyMe = () => {
    setNotifyMe(true);
    Alert.alert('Notification Set', "We'll notify you when this item is back in stock!");
  };

  // Share product in chat
  const handleShare = () => {
    if (!product) return;
    const text = [
      `${product.emoji} *${product.name}*`,
      `Price: ₹${product.price.toLocaleString()}`,
      `Rating: ⭐ ${product.rating} (${product.reviews} reviews)`,
      product.description ?? '',
      selectedVariant ? `Variant: ${selectedVariant}` : '',
    ].filter(Boolean).join('\n');

    Alert.alert('Share Product', 'Product details copied! Open a chat to share.', [
      { text: 'OK' },
    ]);
  };

  if (!product) {
    return (
      <View style={[s.container, { backgroundColor: colors.bg }]}>
        <View style={[s.header, { backgroundColor: colors.headerBg }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Loading...</Text>
        </View>
      </View>
    );
  }

  const wishlisted = isWishlisted(product.remoteId);

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{product.name}</Text>
        <View style={s.headerActions}>
          <TouchableOpacity onPress={() => toggleWishlist(product.remoteId)}>
            <Heart color="#fff" size={22} fill={wishlisted ? '#ef4444' : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Share2 color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Emoji hero area */}
        <View style={[s.emojiHero, { backgroundColor: colors.surface2 }]}>
          <Text style={s.emojiLarge}>{product.emoji || '📦'}</Text>

          {/* Stock badges — ⑦ */}
          {product.isOutOfStock && (
            <View style={[s.stockBadgeLg, { backgroundColor: colors.danger }]}>
              <Text style={s.stockBadgeText}>OUT OF STOCK</Text>
            </View>
          )}
          {product.isLowStock && (
            <View style={[s.stockBadgeLg, { backgroundColor: colors.orange }]}>
              <Text style={s.stockBadgeText}>Only {product.stock} left!</Text>
            </View>
          )}
          {product.isHot && (
            <View style={[s.hotBadgeLg, { backgroundColor: colors.danger }]}>
              <Text style={s.stockBadgeText}>🔥 HOT SELLER</Text>
            </View>
          )}
        </View>

        <View style={s.body}>
          {/* Name + rating */}
          <Text style={[s.name, { color: colors.text }]}>{product.name}</Text>
          <View style={s.ratingRow}>
            <Star color={colors.yellow} size={16} fill={colors.yellow} />
            <Text style={[s.ratingText, { color: colors.text }]}>{product.rating}</Text>
            <Text style={[s.reviewCount, { color: colors.textDim }]}>
              ({product.reviews} reviews)
            </Text>
          </View>

          {/* Price */}
          <Text style={[s.price, { color: colors.green }]}>
            ₹{product.price.toLocaleString()}
          </Text>

          {/* Description */}
          {product.description && (
            <Text style={[s.desc, { color: colors.textDim }]}>{product.description}</Text>
          )}

          {/* Category */}
          <View style={[s.categoryChip, { backgroundColor: colors.surface2 }]}>
            <Text style={[s.categoryText, { color: colors.textDim }]}>{product.category}</Text>
          </View>

          {/* Variant selector */}
          {product.variants.length > 0 && (
            <View style={s.variantSection}>
              <Text style={[s.sectionLabel, { color: colors.text }]}>Select Variant</Text>
              <View style={s.variantRow}>
                {product.variants.map((v) => {
                  const active = selectedVariant === v;
                  return (
                    <TouchableOpacity
                      key={v}
                      style={[
                        s.variantChip,
                        {
                          backgroundColor: active ? colors.green : colors.surface2,
                          borderColor: active ? colors.green : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedVariant(v)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[s.variantText, { color: active ? '#fff' : colors.text }]}
                      >
                        {v}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Quantity + Add to Cart */}
          {!product.isOutOfStock && (
            <View style={s.addSection}>
              <View style={[s.qtyRow, { borderColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={s.qtyBtn}
                >
                  <Minus color={colors.text} size={18} />
                </TouchableOpacity>
                <Text style={[s.qtyText, { color: colors.text }]}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={s.qtyBtn}
                >
                  <Plus color={colors.text} size={18} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[s.addBtn, { backgroundColor: colors.green }]}
                onPress={handleAddToCart}
                activeOpacity={0.7}
              >
                <ShoppingCart color="#fff" size={18} />
                <Text style={s.addBtnText}>
                  Add to Cart · ₹{(product.price * quantity).toLocaleString()}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ⑦ Notify me for out of stock */}
          {product.isOutOfStock && (
            <TouchableOpacity
              style={[
                s.notifyBtn,
                { backgroundColor: notifyMe ? colors.surface2 : colors.orange },
              ]}
              onPress={handleNotifyMe}
              disabled={notifyMe}
              activeOpacity={0.7}
            >
              <Bell color={notifyMe ? colors.textDim : '#fff'} size={18} />
              <Text style={[s.notifyText, { color: notifyMe ? colors.textDim : '#fff' }]}>
                {notifyMe ? 'Notification Set' : 'Notify Me When Available'}
              </Text>
            </TouchableOpacity>
          )}

          {/* ⑥ Complete the Look — bundle suggestions */}
          {relatedBundles.length > 0 && (
            <View style={s.bundleSection}>
              <Text style={[s.sectionLabel, { color: colors.text }]}>Complete the Look</Text>
              {relatedBundles.map((bundle) => {
                const bundleProducts = demoProducts.filter((p) =>
                  bundle.productIds.includes(p.id)
                );
                return (
                  <BundleCard
                    key={bundle.id}
                    bundle={bundle}
                    products={bundleProducts}
                    onAddAll={() => handleBundleAdd(bundle.productIds)}
                  />
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
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
  headerActions: { flexDirection: 'row', gap: 16 },
  scroll: { flex: 1 },
  emojiHero: {
    height: 200, justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  emojiLarge: { fontSize: 80 },
  stockBadgeLg: {
    position: 'absolute', bottom: 12,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  hotBadgeLg: {
    position: 'absolute', top: 12, right: 12,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  stockBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  body: { padding: 16 },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  ratingText: { fontSize: 16, fontWeight: '700' },
  reviewCount: { fontSize: 14 },
  price: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  desc: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  categoryChip: {
    alignSelf: 'flex-start', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16,
  },
  categoryText: { fontSize: 12, fontWeight: '600' },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  variantSection: { marginBottom: 20 },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantChip: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  variantText: { fontSize: 14, fontWeight: '600' },
  addSection: { marginBottom: 20 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    borderRadius: 10, borderWidth: 1, marginBottom: 12,
  },
  qtyBtn: { padding: 12 },
  qtyText: { fontSize: 18, fontWeight: '700', minWidth: 40, textAlign: 'center' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 14, gap: 8,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  notifyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 14, gap: 8, marginBottom: 20,
  },
  notifyText: { fontSize: 15, fontWeight: '700' },
  bundleSection: { marginTop: 8 },
});
