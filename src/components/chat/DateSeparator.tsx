import { View, Text, StyleSheet } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { formatDate } from '../../utils/formatters';

interface Props {
  timestamp: number;
}

export default function DateSeparator({ timestamp }: Props) {
  const { colors } = useUIStore();
  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <Text style={[styles.label, { backgroundColor: colors.surface2, color: colors.textDim }]}>
        {formatDate(timestamp)}
      </Text>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, paddingHorizontal: 16 },
  line: { flex: 1, height: 1 },
  label: { fontSize: 12, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginHorizontal: 8 },
});
