import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUIStore } from '../../store/uiStore';

interface Props {
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'large', fullScreen = false }: Props) {
  const { colors } = useUIStore();
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, { backgroundColor: fullScreen ? colors.bg : 'transparent' }]}>
      <ActivityIndicator color={colors.green} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  fullScreen: { flex: 1 },
});
