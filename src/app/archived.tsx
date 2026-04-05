// Archived conversations screen — accessible from Chats tab.
// Shows conversations marked as archived (is_archived = true).

import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Archive } from 'lucide-react-native';
import { useUIStore } from '../store/uiStore';
import { useArchivedConversations } from '../hooks/useArchivedConversations';
import { ConversationCard } from '../components/conversations/ConversationCard';
import ConversationModel from '../db/models/ConversationModel';

export default function ArchivedScreen() {
  const { colors } = useUIStore();
  const router = useRouter();
  const { conversations } = useArchivedConversations();

  const handlePress = (conv: ConversationModel) => {
    router.push(`/chat/${conv.remoteId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Archived</Text>
        <Text style={[styles.count, { color: colors.textDim }]}>{conversations.length}</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Archive color={colors.textDim2} size={48} strokeWidth={1.2} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No archived chats</Text>
          <Text style={[styles.emptyDesc, { color: colors.textDim }]}>
            Long press a conversation and tap Archive to move it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationCard conversation={item} onPress={() => handlePress(item)} />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1 },
  count: { fontSize: 14, fontWeight: '600' },
  list: { paddingBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyDesc: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});
