import { View, Text, StyleSheet } from 'react-native';
import { useUIStore } from '../../store/uiStore';

interface Props {
  count: number;
}

export default function UnreadBadge({ count }: Props) {
  const { colors } = useUIStore();
  if (count <= 0) return null;

  return (
    <View style={[styles.badge, { backgroundColor: colors.green }]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
});
