// Checkout screen — order summary and "Place Order" button.
// Place Order sends a formatted cart+address message via chatService.sendMessage()
// into a conversation selected from a picker.

import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal,
  FlatList, ListRenderItemInfo,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, ShoppingCart, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Q } from '@nozbe/watermelondb';
import { useUIStore } from '../../store/uiStore';
import { useCart } from '../../hooks/useCart';
import { useAddresses } from '../../hooks/useAddresses';
import { productsCollection, conversationsCollection } from '../../db/database';
import { chatService } from '../../services/ChatwootAdapter';
import type ProductModel from '../../db/models/ProductModel';
import type AddressModel from '../../db/models/AddressModel';
import type ConversationModel from '../../db/models/ConversationModel';

interface CartItemWithProduct {
  itemId: string;
  product: ProductModel;
  quantity: number;
  variant: string | null;
}

export default function CheckoutScreen() {
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();
  const { convId } = useLocalSearchParams<{ convId?: string }>();
  const { items, clearCart } = useCart();
  const { addresses, defaultAddress } = useAddresses();

  const [enriched, setEnriched] = useState<CartItemWithProduct[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressModel | null>(null);
  const [conversations, setConversations] = useState<ConversationModel[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(convId ? parseInt(convId, 10) : null);
  const [convPickerVisible, setConvPickerVisible] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Load cart items with product details
  useEffect(() => {
    if (items.length === 0) { setEnriched([]); return; }
    const load = async () => {
      const results: CartItemWithProduct[] = [];
      for (const item of items) {
        const products = await productsCollection
          .query(Q.where('remote_id', item.productRemoteId)).fetch();
        const product = products[0] as ProductModel | undefined;
        if (product) {
          results.push({ itemId: item.id, product, quantity: item.quantity, variant: item.selectedVariant });
        }
      }
      setEnriched(results);
    };
    load();
  }, [items]);

  // Set default address
  useEffect(() => {
    if (defaultAddress && !selectedAddress) setSelectedAddress(defaultAddress);
  }, [defaultAddress]);

  // Load conversations for picker
  useEffect(() => {
    conversationsCollection.query().fetch().then((records) => {
      setConversations(records as ConversationModel[]);
    });
  }, []);

  const subtotal = enriched.reduce((sum, e) => sum + e.product.price * e.quantity, 0);
  const totalItems = enriched.reduce((sum, e) => sum + e.quantity, 0);

  const selectedConv = conversations.find((c) => c.remoteId === selectedConvId);

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress) {
      Alert.alert('No Address', 'Please select a delivery address.');
      return;
    }
    if (!selectedConvId) {
      Alert.alert('No Conversation', 'Please select a conversation to send the order to.');
      return;
    }
    if (enriched.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }

    setPlacingOrder(true);
    try {
      const lines = enriched.map(
        (e) => `${e.product.emoji || ''} ${e.product.name}${e.variant ? ` (${e.variant})` : ''} \u00d7 ${e.quantity} = \u20b9${(e.product.price * e.quantity).toLocaleString()}`
      );
      const addrLine = [
        selectedAddress.name,
        selectedAddress.phone,
        selectedAddress.line1,
        selectedAddress.line2,
        `${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
        selectedAddress.country,
      ].filter(Boolean).join('\n');

      const orderMsg = [
        '\ud83d\uded2 *New Order*',
        '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
        ...lines,
        '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
        `*Subtotal: \u20b9${subtotal.toLocaleString()}* (${totalItems} items)`,
        '',
        '\ud83d\udce6 *Delivery Address:*',
        addrLine,
        '',
        '\ud83d\udcb3 Payment: Cash on Delivery',
        '',
        '_Please confirm this order._',
      ].join('\n');

      await chatService.sendMessage(selectedConvId, {
        content: orderMsg,
        message_type: 'outgoing',
        private: false,
      });

      await clearCart();
      Alert.alert('Order Placed! \ud83c\udf89', 'Your order has been sent to the customer.', [
        { text: 'OK', onPress: () => router.replace(`/chat/${selectedConvId}`) },
      ]);
    } catch {
      Alert.alert('Error', 'Could not place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  }, [selectedAddress, selectedConvId, enriched, subtotal, totalItems]);

  const renderConvItem = useCallback(({ item }: ListRenderItemInfo<ConversationModel>) => (
    <TouchableOpacity
      style={[cs.convItem, { borderBottomColor: colors.border }]}
      onPress={() => { setSelectedConvId(item.remoteId); setConvPickerVisible(false); }}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={[cs.convName, { color: colors.text }]} numberOfLines={1}>{item.contactName}</Text>
        <Text style={[cs.convSub, { color: colors.textDim }]}>#{item.remoteId}</Text>
      </View>
      {selectedConvId === item.remoteId && <Check color={colors.green} size={18} />}
    </TouchableOpacity>
  ), [colors, selectedConvId]);

  return (
    <View style={[cs.container, { backgroundColor: colors.bg }]}>
      <View style={[cs.header, { paddingTop: insets.top + 8, backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={cs.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Order items */}
        <Text style={[cs.sectionTitle, { color: colors.text }]}>Order Items</Text>
        {enriched.map((e) => (
          <View key={e.itemId} style={[cs.itemRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={cs.itemEmoji}>{e.product.emoji || '\ud83d\udce6'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[cs.itemName, { color: colors.text }]} numberOfLines={2}>{e.product.name}</Text>
              {e.variant && <Text style={[cs.itemVariant, { color: colors.textDim }]}>{e.variant}</Text>}
            </View>
            <View style={cs.itemRight}>
              <Text style={[cs.itemQty, { color: colors.textDim }]}>\u00d7{e.quantity}</Text>
              <Text style={[cs.itemPrice, { color: colors.green }]}>\u20b9{(e.product.price * e.quantity).toLocaleString()}</Text>
            </View>
          </View>
        ))}

        {/* Total */}
        <View style={[cs.totalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[cs.totalLabel, { color: colors.text }]}>Total ({totalItems} items)</Text>
          <Text style={[cs.totalValue, { color: colors.green }]}>\u20b9{subtotal.toLocaleString()}</Text>
        </View>

        {/* Delivery address */}
        <Text style={[cs.sectionTitle, { color: colors.text, marginTop: 20 }]}>Delivery Address</Text>
        {selectedAddress ? (
          <TouchableOpacity
            style={[cs.addrCard, { backgroundColor: colors.surface, borderColor: colors.green }]}
            onPress={() => router.push('/catalog/addresses' as never)}
            activeOpacity={0.8}
          >
            <MapPin color={colors.green} size={18} />
            <View style={{ flex: 1 }}>
              <Text style={[cs.addrName, { color: colors.text }]}>{selectedAddress.name} \u00b7 {selectedAddress.label}</Text>
              <Text style={[cs.addrLine, { color: colors.textDim }]}>
                {selectedAddress.line1}, {selectedAddress.city} - {selectedAddress.pincode}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[cs.addAddrBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            onPress={() => router.push('/catalog/addresses' as never)}
            activeOpacity={0.8}
          >
            <MapPin color={colors.textDim} size={18} />
            <Text style={[cs.addAddrText, { color: colors.textDim }]}>Add Delivery Address</Text>
          </TouchableOpacity>
        )}

        {/* Send to conversation */}
        <Text style={[cs.sectionTitle, { color: colors.text, marginTop: 20 }]}>Send Order to Conversation</Text>
        <TouchableOpacity
          style={[cs.addrCard, { backgroundColor: colors.surface, borderColor: selectedConv ? colors.green : colors.border }]}
          onPress={() => setConvPickerVisible(true)}
          activeOpacity={0.8}
        >
          <ShoppingCart color={selectedConv ? colors.green : colors.textDim} size={18} />
          <View style={{ flex: 1 }}>
            {selectedConv ? (
              <>
                <Text style={[cs.addrName, { color: colors.text }]}>{selectedConv.contactName}</Text>
                <Text style={[cs.addrLine, { color: colors.textDim }]}>#{selectedConv.remoteId}</Text>
              </>
            ) : (
              <Text style={[cs.addAddrText, { color: colors.textDim }]}>Select a conversation</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Payment mode */}
        <Text style={[cs.sectionTitle, { color: colors.text, marginTop: 20 }]}>Payment</Text>
        <View style={[cs.addrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Check color={colors.green} size={18} />
          <Text style={[cs.addrName, { color: colors.text }]}>Cash on Delivery (COD)</Text>
        </View>
      </ScrollView>

      {/* Place Order button */}
      <View style={[cs.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[cs.placeBtn, { backgroundColor: placingOrder ? colors.surface2 : colors.green }]}
          onPress={handlePlaceOrder}
          disabled={placingOrder}
          activeOpacity={0.8}
        >
          {placingOrder ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={cs.placeBtnText}>Place Order \u00b7 \u20b9{subtotal.toLocaleString()}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Conversation picker modal */}
      <Modal visible={convPickerVisible} animationType="slide" onRequestClose={() => setConvPickerVisible(false)}>
        <View style={[cs.modal, { backgroundColor: colors.bg }]}>
          <View style={[cs.header, { paddingTop: insets.top + 8, backgroundColor: colors.headerBg }]}>
            <TouchableOpacity onPress={() => setConvPickerVisible(false)}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={cs.headerTitle}>Select Conversation</Text>
          </View>
          <FlatList
            data={conversations}
            renderItem={renderConvItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 8 }}
          />
        </View>
      </Modal>
    </View>
  );
}

const cs = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12, paddingHorizontal: 12 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#fff' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8, gap: 10 },
  itemEmoji: { fontSize: 28 },
  itemName: { fontSize: 13, fontWeight: '600' },
  itemVariant: { fontSize: 12, marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemQty: { fontSize: 13 },
  itemPrice: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  totalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 14 },
  totalLabel: { fontSize: 15, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '800' },
  addrCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderRadius: 10, padding: 14 },
  addAddrBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 10, padding: 14, borderStyle: 'dashed' },
  addAddrText: { fontSize: 14 },
  addrName: { fontSize: 14, fontWeight: '600' },
  addrLine: { fontSize: 13, marginTop: 2 },
  footer: { borderTopWidth: 1, padding: 16 },
  placeBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  placeBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  modal: { flex: 1 },
  convItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  convName: { fontSize: 15, fontWeight: '600' },
  convSub: { fontSize: 13, marginTop: 2 },
});
