import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { getAvatarColor, } from '../../utils/imageUtils';
import { getInitials } from '../../utils/formatters';

interface Props {
  name: string;
  uri?: string;
  size?: number;
}

export default function Avatar({ name, uri, size = 40 }: Props) {
  const initials = getInitials(name || '?');
  const bgColor = getAvatarColor(name || '?');
  const fontSize = size * 0.38;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { justifyContent: 'center', alignItems: 'center' },
  initials: { color: '#ffffff', fontWeight: '700' },
});
