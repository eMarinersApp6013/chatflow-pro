// Chat screen — full conversation view with message bubbles (Phase 2)
// Phase 1: Shows conversation header and placeholder content

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useUIStore();

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 52,
      paddingBottom: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.headerBg,
      gap: 12,
    },
    backBtn: { padding: 4 },
    headerInfo: { flex: 1 },
    headerTitle: { fontSize: 17, fontWeight: '600', color: '#ffffff' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    msg: { fontSize: 15, color: colors.textDim, textAlign: 'center' },
    badge: {
      marginTop: 12,
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
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>Conversation #{id}</Text>
          <Text style={s.headerSub}>Chat view</Text>
        </View>
        <TouchableOpacity style={s.backBtn}>
          <MoreVertical color="#ffffff" size={22} />
        </TouchableOpacity>
      </View>
      <View style={s.content}>
        <Text style={s.msg}>Full chat UI with message bubbles, swipe-to-reply, long press menu, and WebSocket real-time updates coming in Phase 2.</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>Coming in Phase 2</Text>
        </View>
      </View>
    </View>
  );
}
