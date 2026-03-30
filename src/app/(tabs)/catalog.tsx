// Catalog tab — 10-feature catalog (Phase 5)

import { View, Text, StyleSheet } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

export default function CatalogScreen() {
  const { colors } = useUIStore();

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      paddingTop: 52,
      paddingBottom: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.headerBg,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
    content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: 16 },
    subtitle: { fontSize: 14, color: colors.textDim, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    badge: {
      marginTop: 16,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeText: { color: colors.green, fontSize: 13, fontWeight: '600' },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Catalog</Text>
      </View>
      <View style={s.content}>
        <ShoppingBag color={colors.textDim} size={56} />
        <Text style={s.title}>Product Catalog</Text>
        <Text style={s.subtitle}>
          Smart home screen, AI fuzzy search, voice search, wishlist, cart, bundles, restock alerts, photo search, smart sort, and shipping calculator.
        </Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>Coming in Phase 5</Text>
        </View>
      </View>
    </View>
  );
}
