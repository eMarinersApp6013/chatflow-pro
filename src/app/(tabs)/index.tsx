// Chats tab — conversation list with status, assignee, and inbox filter chips.
// Real-time via WatermelonDB observe() + background API sync.
// Phase 4: added inbox filter row below status/assignee chips.

import { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ListRenderItemInfo,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Search, Archive } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useConnectionStore } from '../../store/connectionStore';
import { useConversations } from '../../hooks/useConversations';
import { useInboxes } from '../../hooks/useInboxes';
import { wsService } from '../../services/WebSocketService';

import ConversationCard from '../../components/conversations/ConversationCard';
import FilterChips from '../../components/conversations/FilterChips';
import EmptyState from '../../components/common/EmptyState';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import { TaskChecklist } from '../../components/common/TaskChecklist';
import { ConversationListSkeleton } from '../../components/conversations/ConversationCardSkeleton';

import ConversationModel from '../../db/models/ConversationModel';
import type { StatusFilter, FilterTab } from '../../types/app';

// ─────────────────────────────────────────────────────────────
// Filter options
// ─────────────────────────────────────────────────────────────

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

// Channel type → emoji icon
function channelEmoji(channelType: string): string {
  const t = channelType?.toLowerCase() ?? '';
  if (t.includes('whatsapp')) return '💬';
  if (t.includes('telegram')) return '✈️';
  if (t.includes('email')) return '📧';
  if (t.includes('facebook')) return '👤';
  if (t.includes('twitter') || t.includes('x_twitter')) return '𝕏';
  if (t.includes('instagram')) return '📷';
  if (t.includes('web')) return '🌐';
  return '💬';
}

// ─────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────

export default function ChatsScreen() {
  const { colors, filters, setFilters } = useUIStore();
  const { credentials } = useAuthStore();
  const { setConnectionState } = useConnectionStore();
  const { conversations, isSyncing, syncError, refetch } = useConversations();
  const { inboxes } = useInboxes();
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
      paddingTop: insets.top,
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
      paddingBottom: 4,
    },
    filterRow: { paddingTop: 8, paddingHorizontal: 8 },
    inboxRow: {
      paddingTop: 6,
      paddingBottom: 4,
    },
    inboxScroll: { paddingHorizontal: 10, gap: 6 },
    inboxChip: {
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    inboxChipText: { fontSize: 12, fontWeight: '600' },
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
    archivedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderTopWidth: 0.5,
    },
    archivedText: { fontSize: 14, fontWeight: '500' },
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

        {/* Inbox row — shown only when multiple inboxes exist */}
        {inboxes.length > 1 && (
          <View style={s.inboxRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.inboxScroll}
            >
              {/* "All" chip */}
              {(() => {
                const active = !filters.inboxId;
                return (
                  <TouchableOpacity
                    style={[
                      s.inboxChip,
                      {
                        backgroundColor: active ? colors.green + '22' : colors.surface2,
                        borderColor: active ? colors.green : colors.border,
                      },
                    ]}
                    onPress={() => setFilters({ inboxId: undefined })}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.inboxChipText, { color: active ? colors.green : colors.textDim }]}>
                      All Inboxes
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              {inboxes.map((inbox) => {
                const active = filters.inboxId === inbox.id;
                return (
                  <TouchableOpacity
                    key={inbox.id}
                    style={[
                      s.inboxChip,
                      {
                        backgroundColor: active ? colors.green + '22' : colors.surface2,
                        borderColor: active ? colors.green : colors.border,
                      },
                    ]}
                    onPress={() => setFilters({ inboxId: active ? undefined : inbox.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 13 }}>{channelEmoji(inbox.channel_type)}</Text>
                    <Text style={[s.inboxChipText, { color: active ? colors.green : colors.textDim }]}>
                      {inbox.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      <ConnectionStatus />

      {/* ── Sync bars ── */}
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
        contentContainerStyle={conversations.length === 0 ? { flex: 1 } : s.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={refetch}
            tintColor={colors.green}
            colors={[colors.green]}
          />
        }
        ListHeaderComponent={
          <TaskChecklist />
        }
        ListEmptyComponent={
          isSyncing ? (
            <ConversationListSkeleton count={8} />
          ) : (
            <EmptyState
              icon="message-circle"
              title="No conversations"
              description="Your Chatwoot conversations will appear here after syncing."
            />
          )
        }
        ListFooterComponent={
          conversations.length > 0 ? (
            <TouchableOpacity
              style={[s.archivedRow, { borderTopColor: colors.border }]}
              onPress={() => router.push('/archived')}
              activeOpacity={0.7}
            >
              <Archive color={colors.textDim} size={18} />
              <Text style={[s.archivedText, { color: colors.textDim }]}>Archived chats</Text>
            </TouchableOpacity>
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
