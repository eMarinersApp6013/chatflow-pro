// Orders tab — shows all placed orders from local WatermelonDB.
// Orders are created when a cart is checked out (future feature).
// For now, shows an empty state with a friendly message.

import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Package, ChevronRight } from 'lucide-react-native';
import { Q } from '@nozbe/watermelondb';
import { useUIStore } from '../../store/uiStore';
import { ordersCollection } from '../../db/database';
import OrderModel from '../../db/models/OrderModel';

const STATUS_COLORS: Record<string, string> = {
  placed: '#f59e0b',
  shipped: '#3b82f6',
  delivered: '#22c55e',
  cancelled: '#ea4335',
};

export default function OrdersScreen() {
  const { colors } = useUIStore();
  const [orders, setOrders] = useState<OrderModel[]>([]);

  useEffect(() => {
    const subscription = ordersCollection
      .query(Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe({
        next: (records) => setOrders(records as OrderModel[]),
        error: (err) => console.error('[Orders] observe error:', err),
      });
    return () => subscription.unsubscribe();
  }, []);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderOrder = ({ item }: { item: OrderModel }) => {
    const statusColor = STATUS_COLORS[item.status] ?? colors.textDim;
    const itemCount = item.items.length;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.orderRef, { color: colors.text }]}>{item.orderRef}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={[styles.contactName, { color: colors.textDim }]}>{item.contactName}</Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.meta, { color: colors.textDim2 }]}>
            {itemCount} item{itemCount !== 1 ? 's' : ''} · {formatDate(item.createdAt)}
          </Text>
          <Text style={[styles.total, { color: colors.green }]}>₹{item.total.toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package color={colors.textDim2} size={56} strokeWidth={1.2} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.textDim }]}>
            Orders will appear here when you check out a cart during a conversation.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 18,
  },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  list: { padding: 12, gap: 10 },
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderRef: { fontSize: 15, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  contactName: { fontSize: 13, marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  meta: { fontSize: 12 },
  total: { fontSize: 15, fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyDesc: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});
