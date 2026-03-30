import { View, Text, StyleSheet } from 'react-native';
import { useConnectionStore } from '../../store/connectionStore';
import { useUIStore } from '../../store/uiStore';

export default function ConnectionStatus() {
  const { connectionState } = useConnectionStore();
  const { colors } = useUIStore();

  if (connectionState === 'connected') return null;

  const statusConfig = {
    connecting: { label: 'Connecting…', bg: colors.surface2, color: colors.textDim },
    reconnecting: { label: 'Reconnecting…', bg: '#3d2f1a', color: colors.orange },
    disconnected: { label: 'Offline — changes will sync when connected', bg: '#3d1a1a', color: colors.danger },
  } as const;

  const config = statusConfig[connectionState as keyof typeof statusConfig];
  if (!config) return null;

  return (
    <View style={[styles.bar, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingVertical: 6, paddingHorizontal: 16, alignItems: 'center' },
  text: { fontSize: 12, fontWeight: '500' },
});
