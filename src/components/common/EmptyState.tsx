import { View, Text, StyleSheet } from 'react-native';
import { MessageCircle, Users, Star, Search, ShoppingBag } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

type IconName = 'message-circle' | 'users' | 'star' | 'search' | 'shopping-bag';

interface Props {
  icon: IconName;
  title: string;
  description: string;
}

const ICONS: Record<IconName, typeof MessageCircle> = {
  'message-circle': MessageCircle,
  users: Users,
  star: Star,
  search: Search,
  'shopping-bag': ShoppingBag,
};

export default function EmptyState({ icon, title, description }: Props) {
  const { colors } = useUIStore();
  const Icon = ICONS[icon];

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surface2 }]}>
        <Icon color={colors.textDim} size={40} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.desc, { color: colors.textDim }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
