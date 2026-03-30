// Contact profile screen (Phase 3)

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

export default function ContactScreen() {
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
    headerTitle: { fontSize: 17, fontWeight: '600', color: '#ffffff' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    msg: { fontSize: 15, color: colors.textDim, textAlign: 'center' },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Contact #{id}</Text>
      </View>
      <View style={s.content}>
        <Text style={s.msg}>Contact profile with conversation history coming in Phase 3.</Text>
      </View>
    </View>
  );
}
