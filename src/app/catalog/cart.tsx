// Cart screen — ⑤ persistent cart with quantity controls, ⑩ shipping calc, share in chat.

import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Minus, Plus, Trash2, ShoppingCart, Share2,
} from 'lucide-react-native';
import { Q } from '@nozbe/watermelondb';
import { useUIStore } from '../../store/uiStore';
import { useCart } from '../../hooks/useCart';
import { productsCollection } from '../../db/database';
import ShippingCalc from '../../components/catalog/ShippingCalc';
import type ProductModel from '../../db/models/ProductModel';

interface CartItemWithProduct {
  itemId: string;
  product: ProductModel;
  quantity: number;
  variant: string | null;
}

export default function CartScreen() {
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();
  const { items, removeFromCart, updateQuantity } = useCart();
  const [enriched, setEnriched] = useState<CartItemWithProduct[]>([]);

  // Enrich cart items with product data
  useEffect(() => {
    if (items.length === 0) { setEnriched([]); return; }

    const load = async () => {
      const results: CartItemWithProduct[] = [];
      for (const item of items) {
        const products = await productsCollection
          .query(Q.where('remote_id', item.productRemoteId))
          .fetch();
        const product = products[0] as ProductModel | undefined;
        if (product) {
          results.push({
            itemId: item.id,
            product,
            quantity: item.quantity,
            variant: item.selectedVariant,
          });
        }
      }
      setEnriched(results);
    };
    load();
  }, [items]);

  const subtotal = enriched.reduce((sum, e) => sum + e.product.price * e.quantity, 0);
  const totalItems = enriched.reduce((sum, e) => sum + e.quantity, 0);

  // Share cart summary in chat
  const handleShareCart = () => {
    if (enriched.length === 0) return;
    const lines = enriched.map(
      (e) =>
        `${e.product.emoji} ${e.product.name}${e.variant ? ` (${e.variant})` : ''} × ${e.quantity} = ₹${(e.product.price * e.quantity).toLocaleString()}`
    );
    const summary = [
      '🛒 *Cart Summary*',
      '─────────────',
      ...lines,
      '─────────────',
      `*Total: ₹${subtotal.toLocaleString()}* (${totalItems} items)`,
    ].join('\n');

    Alert.alert('Share Cart', 'Cart summary copied! Open a chat to share.', [{ text: 'OK' }]);
  };

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.headerBg, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Cart ({totalItems})</Text>
        {enriched.length > 0 && (
          <TouchableOpacity onPress={handleShareCart}>
            <Share2 color="#fff" size={20} />
          </TouchableOpacity>
        )}
      </View>

      {enriched.length === 0 ? (
        <View style={s.emptyWrap}>
          <ShoppingCart color={colors.textDim} size={56} />
          <Text style={[s.emptyTitle, { color: colors.text }]}>Cart is empty</Text>
          <Text style={[s.emptySubtitle, { color: colors.textDim }]}>
            Add products from the catalog to get started.
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
          {/* Cart items */}
          {enriched.map((entry) => (
            <View
              key={entry.itemId}
              style={[s.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[s.itemEmoji, { backgroundColor: colors.surface2 }]}>
                <Text style={s.emoji}>{entry.product.emoji || '📦'}</Text>
              </View>

              <View style={s.itemInfo}>
                <Text style={[s.itemName, { color: colors.text }]} numberOfLines={2}>
                  {entry.product.name}
                </Text>
                {entry.variant && (
                  <Text style={[s.itemVariant, { color: colors.textDim }]}>
                    Variant: {entry.variant}
                  </Text>
                )}
                <Text style={[s.itemPrice, { color: colors.green }]}>
                  ₹{entry.product.price.toLocaleString()}
                </Text>
              </View>

              <View style={s.itemActions}>
                <TouchableOpacity
                  onPress={() => removeFromCart(entry.itemId)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 color={colors.danger} size={16} />
                </TouchableOpacity>

                <View style={[s.qtyRow, { borderColor: colors.border }]}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(entry.itemId, entry.quantity - 1)}
                    style={s.qtyBtn}
                  >
                    <Minus color={colors.text} size={14} />
                  </TouchableOpacity>
                  <Text style={[s.qtyText, { color: colors.text }]}>{entry.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(entry.itemId, entry.quantity + 1)}
                    style={s.qtyBtn}
                  >
                    <Plus color={colors.text} size={14} />
                  </TouchableOpacity>
                </View>

                <Text style={[s.lineTotal, { color: colors.text }]}>
                  ₹{(entry.product.price * entry.quantity).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}

          {/* Order summary */}
          <View style={[s.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.summaryTitle, { color: colors.text }]}>Order Summary</Text>
            <View style={s.summaryRow}>
              <Text style={[s.summaryLabel, { color: colors.textDim }]}>
                Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})
              </Text>
              <Text style={[s.summaryValue, { color: colors.text }]}>
                ₹{subtotal.toLocaleString()}
              </Text>
            </View>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.summaryRow}>
              <Text style={[s.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[s.totalValue, { color: colors.green }]}>
                ₹{subtotal.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* ⑩ Shipping Calculator */}
          <ShippingCalc />

          {/* Address + Checkout section */}
          <View style={[s.checkoutSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.checkoutTitle, { color: colors.text }]}>Ready to Order?</Text>
            <Text style={[s.checkoutSubtitle, { color: colors.textDim }]}>
              Add a delivery address and send the order to a customer conversation.
            </Text>
            <TouchableOpacity
              style={[s.checkoutBtn, { backgroundColor: colors.green }]}
              onPress={() => router.push('/catalog/checkout' as never)}
              activeOpacity={0.8}
            >
              <Text style={s.checkoutBtnText}>Proceed to Checkout →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.addressBtn, { borderColor: colors.border }]}
              onPress={() => router.push('/catalog/addresses' as never)}
              activeOpacity={0.8}
            >
              <Text style={[s.addressBtnText, { color: colors.textDim }]}>Manage Delivery Addresses</Text>
            </TouchableOpacity>
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
    paddingTop: 0, paddingBottom: 12, paddingHorizontal: 12,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#fff' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  shopBtn: { borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  shopBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scroll: { flex: 1 },
  itemCard: {
    flexDirection: 'row', borderWidth: 1, borderRadius: 12,
    marginHorizontal: 12, marginTop: 12, padding: 12, gap: 10,
  },
  itemEmoji: {
    width: 56, height: 56, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  emoji: { fontSize: 28 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', lineHeight: 18 },
  itemVariant: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  itemActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, borderWidth: 1, marginVertical: 4,
  },
  qtyBtn: { padding: 6 },
  qtyText: { fontSize: 14, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  lineTotal: { fontSize: 14, fontWeight: '800' },
  summary: {
    borderWidth: 1, borderRadius: 14,
    marginHorizontal: 12, marginTop: 16, padding: 16,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800' },
  checkoutSection: {
    borderWidth: 1, borderRadius: 14,
    marginHorizontal: 12, marginTop: 16, padding: 16,
  },
  checkoutTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  checkoutSubtitle: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
  checkoutBtn: { borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 8 },
  checkoutBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  addressBtn: { borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1 },
  addressBtnText: { fontSize: 14, fontWeight: '500' },
});
