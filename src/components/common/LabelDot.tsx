import { View, Text, StyleSheet } from 'react-native';
import { useUIStore } from '../../store/uiStore';

interface Props {
  label: string;
}

// Map label names to preset colors — unknown labels get green default
const LABEL_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e',
  billing: '#3b82f6',
  support: '#8b5cf6',
  sales: '#ec4899',
};

export default function LabelDot({ label }: Props) {
  const { colors } = useUIStore();
  const color = LABEL_COLORS[label.toLowerCase()] ?? colors.green;

  return (
    <View style={[styles.dot, { backgroundColor: color + '33', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  text: { fontSize: 10, fontWeight: '600' },
});
