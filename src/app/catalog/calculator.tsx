// Shipping calculator screen (Phase 5)

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

export default function CalculatorScreen() {
  const { colors } = useUIStore();
  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 12, backgroundColor: colors.headerBg, gap: 12 },
    headerTitle: { fontSize: 17, fontWeight: '600', color: '#ffffff' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    msg: { fontSize: 15, color: colors.textDim, textAlign: 'center' },
  });
  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft color="#ffffff" size={24} /></TouchableOpacity>
        <Text style={s.headerTitle}>Shipping Calculator</Text>
      </View>
      <View style={s.content}><Text style={s.msg}>Zone-based shipping calculator with COD vs prepaid coming in Phase 5.</Text></View>
    </View>
  );
}
