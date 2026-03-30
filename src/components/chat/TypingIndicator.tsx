// Typing indicator — animated dots (Phase 2)

import { View, Text, StyleSheet } from 'react-native';
import { useUIStore } from '../../store/uiStore';

interface Props {
  agentName?: string;
}

export default function TypingIndicator({ agentName }: Props) {
  const { colors } = useUIStore();
  return (
    <View style={[styles.bubble, { backgroundColor: colors.bubbleIn }]}>
      <Text style={[styles.text, { color: colors.textDim }]}>
        {agentName ? `${agentName} is typing…` : 'Typing…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { marginHorizontal: 8, marginVertical: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start' },
  text: { fontSize: 13, fontStyle: 'italic' },
});
