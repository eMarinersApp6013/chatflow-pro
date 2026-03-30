// Starred messages screen — shows all messages starred by the agent.
// Grouped by conversation. Tap a group header to open that chat.

import { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUIStore } from '../store/uiStore';
import { useStarredMessages } from '../hooks/useStarredMessages';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';

import type MessageModel from '../db/models/MessageModel';

// ─────────────────────────────────────────────────────────────
// List item types
// ─────────────────────────────────────────────────────────────

type GroupHeader = {
  type: 'header';
  convId: number;
  senderName: string;
  senderAvatar: string | null;
};

type MessageItem = {
  type: 'message';
  message: MessageModel;
};

type ListItem = GroupHeader | MessageItem;

// ─────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────

export default function StarredScreen() {
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();
  const { messages, toggleStar } = useStarredMessages();

  // Group messages by conversation, preserving insertion order
  const listData = useMemo<ListItem[]>(() => {
    const seenConvs = new Set<number>();
    const items: ListItem[] = [];

    for (const msg of messages) {
      const convId = msg.conversationRemoteId;
      if (!seenConvs.has(convId)) {
        seenConvs.add(convId);
        items.push({
          type: 'header',
          convId,
          senderName: msg.senderName ?? `Conversation #${convId}`,
          senderAvatar: msg.senderAvatar ?? null,
        });
      }
      items.push({ type: 'message', message: msg });
    }

    return items;
  }, [messages]);

  const handleOpenChat = useCallback((convId: number) => {
    router.push(`/chat/${convId}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ListItem>) => {
      if (item.type === 'header') {
        return (
          <TouchableOpacity
            style={[s.groupHeader, { backgroundColor: colors.surface2, borderBottomColor: colors.border }]}
            onPress={() => handleOpenChat(item.convId)}
            activeOpacity={0.7}
          >
            <Avatar name={item.senderName} uri={item.senderAvatar ?? undefined} size={32} />
            <Text style={[s.groupName, { color: colors.green }]} numberOfLines={1}>
              {item.senderName}
            </Text>
            <Text style={[s.tapHint, { color: colors.textDim }]}>Open chat →</Text>
          </TouchableOpacity>
        );
      }

      const msg = item.message;
      const isOut = msg.isOutgoing;
      const bgColor = isOut ? colors.bubbleOut : colors.surface2;

      return (
        <View style={[s.messageRow, { borderBottomColor: colors.border }]}>
          <View style={[s.bubble, { backgroundColor: bgColor, borderColor: colors.border }]}>
            {msg.content ? (
              <Text style={[s.bubbleText, { color: colors.text }]}>{msg.content}</Text>
            ) : (
              <Text style={[s.bubbleText, { color: colors.textDim }]}>📎 Attachment</Text>
            )}
            <Text style={[s.timestamp, { color: colors.textDim2 }]}>
              {formatTs(msg.createdAt)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => toggleStar(msg)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Star color={colors.yellow} size={18} fill={colors.yellow} />
          </TouchableOpacity>
        </View>
      );
    },
    [colors, handleOpenChat, toggleStar]
  );

  const keyExtractor = useCallback((item: ListItem) => {
    if (item.type === 'header') return `h-${item.convId}`;
    return `m-${item.message.id}`;
  }, []);

  const paddingTop = Platform.OS === 'ios' ? insets.top : 8;

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop, backgroundColor: colors.headerBg }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Starred Messages</Text>
      </View>

      {messages.length === 0 ? (
        <EmptyState
          icon="star"
          title="No starred messages"
          description="Long-press any message and tap Star to save it here."
        />
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={s.listContent}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatTs(ts: number): string {
  const d = new Date(ts < 1e12 ? ts * 1000 : ts);
  const now = new Date();
  if (now.getTime() - d.getTime() < 86_400_000) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', flex: 1 },
  listContent: { paddingBottom: 24 },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginTop: 12,
    gap: 10,
  },
  groupName: { flex: 1, fontSize: 14, fontWeight: '700' },
  tapHint: { fontSize: 12 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  bubble: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  timestamp: { fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },
});
