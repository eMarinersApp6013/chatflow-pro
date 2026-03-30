// Chats tab — conversation list with status + assignee filter chips.
// Real-time via WatermelonDB observe() + background API sync.

import { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useConnectionStore } from '../../store/connectionStore';
import { useConversations } from '../../hooks/useConversations';
import { wsService } from '../../services/WebSocketService';

import ConversationCard from '../../components/conversations/ConversationCard';
import FilterChips from '../../components/conversations/FilterChips';
import EmptyState from '../../components/common/EmptyState';
import ConnectionStatus from '../../components/common/ConnectionStatus';

import ConversationModel from '../../db/models/ConversationModel';
import type { StatusFilter, FilterTab } from '../../types/app';

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Pending', value: 'pending' },
];

const ASSIGNEE_OPTIONS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Mine', value: 'mine' },
  { label: 'Unassigned', value: 'unassigned' },
];

export default function ChatsScreen() {
  const { colors, filters, setFilters } = useUIStore();
  const { credentials } = useAuthStore();
  const { setConnectionState } = useConnectionStore();
  const { conversations, isSyncing, syncError, refetch } = useConversations();
  const insets = useSafeAreaInsets();

  // Wire WebSocket connection state → store so ConnectionStatus banner updates
  useEffect(() => {
    return wsService.onConnectionChange(setConnectionState);
  }, []);

  const handleConversationPress = useCallback((conv: ConversationModel) => {
    router.push(`/chat/${conv.remoteId}`);
  }, []);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? insets.top : 12,
      paddingBottom: 12,
      backgroundColor: colors.headerBg,
    },
    headerLeft: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
    agentName: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
    headerBtn: { padding: 6, marginLeft: 6 },

    filterSection: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 8,
    },
    filterRow: { paddingTop: 8, paddingHorizontal: 8 },
    filterLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textDim2,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 10,
      paddingTop: 6,
      paddingBottom: 2,
    },

    listContent: { paddingBottom: 16 },
    syncBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.greenDim,
      paddingHorizontal: 16,
      paddingVertical: 6,
      gap: 8,
    },
    syncText: { color: colors.green, fontSize: 13 },
    errorBar: { backgroundColor: '#3d1a1a', paddingHorizontal: 16, paddingVertical: 6 },
    errorText: { color: colors.danger, fontSize: 13 },
  });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ConversationModel>) => (
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
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerTitle}>ChatFlow Pro</Text>
          {credentials && (
            <Text style={s.agentName}>{credentials.userName}</Text>
          )}
        </View>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.push('/search')}>
          <Search color="#ffffff" size={22} />
        </TouchableOpacity>
      </View>

      {/* ── Filters ── */}
      <View style={s.filterSection}>
        {/* Status row */}
        <View style={s.filterRow}>
          <FilterChips
            options={STATUS_OPTIONS}
            selected={filters.status}
            onSelect={(v) => setFilters({ status: v as StatusFilter })}
          />
        </View>
        {/* Assignee row */}
        <View style={s.filterRow}>
          <FilterChips
            options={ASSIGNEE_OPTIONS}
            selected={filters.assigneeType}
            onSelect={(v) => setFilters({ assigneeType: v as FilterTab })}
            small
          />
        </View>
      </View>

      <ConnectionStatus />

      {/* ── Sync bars ── */}
      {isSyncing && conversations.length === 0 && (
        <View style={s.syncBar}>
          <ActivityIndicator color={colors.green} size="small" />
          <Text style={s.syncText}>Syncing conversations…</Text>
        </View>
      )}
      {syncError && (
        <View style={s.errorBar}>
          <Text style={s.errorText}>Sync error: {syncError}</Text>
        </View>
      )}

      {/* ── List ── */}
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={
          conversations.length === 0 ? { flex: 1 } : s.listContent
        }
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
              title="No conversations"
              description="Your Chatwoot conversations will appear here after syncing."
            />
          ) : null
        }
        windowSize={10}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={30}
        initialNumToRender={20}
      />
    </View>
  );
}
