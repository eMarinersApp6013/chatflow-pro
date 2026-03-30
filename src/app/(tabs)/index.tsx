// Chats tab — conversation list with filter chips and real-time sync.

import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useConversations } from '../../hooks/useConversations';
import ConversationCard from '../../components/conversations/ConversationCard';
import FilterChips from '../../components/conversations/FilterChips';
import EmptyState from '../../components/common/EmptyState';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import ConversationModel from '../../db/models/ConversationModel';
import type { StatusFilter } from '../../types/app';

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Pending', value: 'pending' },
];

export default function ChatsScreen() {
  const { colors, filters, setFilters } = useUIStore();
  const { credentials } = useAuthStore();
  const { conversations, isSyncing, syncError, refetch } = useConversations();

  const handleConversationPress = useCallback((conv: ConversationModel) => {
    router.push(`/chat/${conv.remoteId}`);
  }, []);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 52,
      paddingBottom: 12,
      backgroundColor: colors.headerBg,
    },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#ffffff' },
    headerBtn: { padding: 4, marginLeft: 12 },
    agentName: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    filterRow: {
      paddingVertical: 8,
      paddingHorizontal: 8,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listContent: { paddingBottom: 16 },
    syncingBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.greenDim,
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
    },
    syncingText: { color: colors.green, fontSize: 13 },
    errorBar: {
      backgroundColor: '#3d1a1a',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    errorText: { color: colors.danger, fontSize: 13 },
  });

  const renderItem = useCallback(
    ({ item }: { item: ConversationModel }) => (
      <ConversationCard
        conversation={item}
        onPress={() => handleConversationPress(item)}
      />
    ),
    [handleConversationPress]
  );

  const keyExtractor = (item: ConversationModel) => item.id;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>ChatFlow Pro</Text>
          {credentials && (
            <Text style={s.agentName}>{credentials.userName}</Text>
          )}
        </View>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.push('/search')}>
          <Search color="#ffffff" size={22} />
        </TouchableOpacity>
      </View>

      {/* Status filter chips */}
      <View style={s.filterRow}>
        <FilterChips
          options={STATUS_FILTERS}
          selected={filters.status}
          onSelect={(value) => setFilters({ status: value as StatusFilter })}
        />
      </View>

      <ConnectionStatus />

      {/* Sync indicators */}
      {isSyncing && conversations.length === 0 && (
        <View style={s.syncingBar}>
          <ActivityIndicator color={colors.green} size="small" />
          <Text style={s.syncingText}>Syncing conversations…</Text>
        </View>
      )}
      {syncError && (
        <View style={s.errorBar}>
          <Text style={s.errorText}>Sync error: {syncError}</Text>
        </View>
      )}

      {/* Conversation list */}
      <FlatList
        data={conversations as ConversationModel[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={conversations.length === 0 ? { flex: 1 } : s.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={refetch}
            tintColor={colors.green}
            colors={[colors.green]}
          />
        }
        ListEmptyComponent={
          !isSyncing ? (
            <EmptyState
              icon="message-circle"
              title="No conversations yet"
              description="Your Chatwoot conversations will appear here after syncing."
            />
          ) : null
        }
        // Virtualization — only render visible items for performance
        windowSize={10}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={30}
      />
    </View>
  );
}
