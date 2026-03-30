// Dashboard tab — analytics overview (Phase 4)

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { BarChart2 } from 'lucide-react-native';

export default function DashboardScreen() {
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
    icon: { marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center' },
    subtitle: { fontSize: 14, color: colors.textDim, textAlign: 'center', marginTop: 8 },
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
        <Text style={s.headerTitle}>Dashboard</Text>
      </View>
      <View style={s.content}>
        <BarChart2 color={colors.textDim} size={56} style={s.icon} />
        <Text style={s.title}>Analytics Dashboard</Text>
        <Text style={s.subtitle}>
          Conversation stats, agent performance, and response time metrics coming in Phase 4.
        </Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>Coming in Phase 4</Text>
        </View>
      </View>
    </View>
  );
}
