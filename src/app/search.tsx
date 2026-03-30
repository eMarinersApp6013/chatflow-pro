// Global search screen — tabbed: Conversations | Contacts | Messages.
// Conversations and messages are searched locally in WatermelonDB.
// Contacts are searched via the Chatwoot API (debounced 400ms).

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, X, MessageCircle, Users, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Q } from '@nozbe/watermelondb';

import { useUIStore } from '../store/uiStore';
import { chatService } from '../services/ChatwootAdapter';
import type { ColorScheme } from '../constants/colors';
import { conversationsCollection, messagesCollection } from '../db/database';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';

import type ConversationModel from '../db/models/ConversationModel';
import type MessageModel from '../db/models/MessageModel';
import type { ChatwootContact } from '../types/chatwoot';

// ─────────────────────────────────────────────────────────────
// Tab type
// ─────────────────────────────────────────────────────────────

type Tab = 'conversations' | 'contacts' | 'messages';

// ─────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('conversations');

  // Results
  const [convResults, setConvResults] = useState<ConversationModel[]>([]);
  const [msgResults, setMsgResults] = useState<MessageModel[]>([]);
  const [contactResults, setContactResults] = useState<ChatwootContact[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Run search whenever query changes (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();

    if (!q) {
      setConvResults([]);
      setMsgResults([]);
      setContactResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      const lower = q.toLowerCase();

      // Local conversation search
      const allConvs = await conversationsCollection.query().fetch();
      const filteredConvs = (allConvs as ConversationModel[]).filter(
        (c) =>
          c.contactName?.toLowerCase().includes(lower) ||
          c.lastMessageContent?.toLowerCase().includes(lower)
      );
      setConvResults(filteredConvs.slice(0, 30));

      // Local message search
      const allMsgs = await messagesCollection
        .query(Q.where('content', Q.notEq(null)))
        .fetch();
      const filteredMsgs = (allMsgs as MessageModel[]).filter((m) =>
        m.content?.toLowerCase().includes(lower)
      );
      setMsgResults(filteredMsgs.slice(0, 30));

      // API contact search
      try {
        const contacts = await chatService.searchContacts(q);
        setContactResults(contacts.slice(0, 30));
      } catch {
        setContactResults([]);
      }

      setIsSearching(false);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  // ── Render helpers ─────────────────────────────────────────

  const renderConversation = useCallback(
    ({ item }: ListRenderItemInfo<ConversationModel>) => (
      <TouchableOpacity
        style={[s.resultRow, { borderBottomColor: colors.border }]}
        onPress={() => router.push(`/chat/${item.remoteId}`)}
        activeOpacity={0.7}
      >
        <Avatar name={item.contactName ?? '?'} uri={item.contactAvatar ?? undefined} size={40} />
        <View style={s.resultInfo}>
          <Text style={[s.resultName, { color: colors.text }]} numberOfLines={1}>
            {item.contactName ?? `Conversation #${item.remoteId}`}
          </Text>
          {item.lastMessageContent ? (
            <Text style={[s.resultSub, { color: colors.textDim }]} numberOfLines={1}>
              {highlight(item.lastMessageContent, query)}
            </Text>
          ) : null}
        </View>
        <View style={[s.statusPill, { backgroundColor: statusColor(item.status, colors) }]}>
          <Text style={s.statusText}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    ),
    [colors, query]
  );

  const renderContact = useCallback(
    ({ item }: ListRenderItemInfo<ChatwootContact>) => (
      <TouchableOpacity
        style={[s.resultRow, { borderBottomColor: colors.border }]}
        onPress={() => router.push(`/contact/${item.id}`)}
        activeOpacity={0.7}
      >
        <Avatar name={item.name} uri={item.avatar_url ?? undefined} size={40} />
        <View style={s.resultInfo}>
          <Text style={[s.resultName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.email ? (
            <Text style={[s.resultSub, { color: colors.textDim }]} numberOfLines={1}>
              {item.email}
            </Text>
          ) : item.phone_number ? (
            <Text style={[s.resultSub, { color: colors.textDim }]} numberOfLines={1}>
              {item.phone_number}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    ),
    [colors]
  );

  const renderMessage = useCallback(
    ({ item }: ListRenderItemInfo<MessageModel>) => (
      <TouchableOpacity
        style={[s.resultRow, { borderBottomColor: colors.border }]}
        onPress={() => router.push(`/chat/${item.conversationRemoteId}`)}
        activeOpacity={0.7}
      >
        <View style={[s.msgIcon, { backgroundColor: colors.surface2 }]}>
          <MessageCircle color={colors.textDim} size={20} />
        </View>
        <View style={s.resultInfo}>
          <Text style={[s.resultName, { color: colors.textDim }]} numberOfLines={1}>
            {item.senderName ?? `Conversation #${item.conversationRemoteId}`}
          </Text>
          <Text style={[s.resultSub, { color: colors.text }]} numberOfLines={2}>
            {item.content}
          </Text>
        </View>
        <Text style={[s.msgTs, { color: colors.textDim2 }]}>
          {formatTs(item.createdAt)}
        </Text>
      </TouchableOpacity>
    ),
    [colors]
  );

  const paddingTop = Platform.OS === 'ios' ? insets.top : 8;

  // ── Count badges ───────────────────────────────────────────
  const counts: Record<Tab, number> = {
    conversations: convResults.length,
    contacts: contactResults.length,
    messages: msgResults.length,
  };

  const activeData = tab === 'conversations' ? convResults
    : tab === 'contacts' ? contactResults
    : msgResults;

  const isEmpty = query.trim().length > 0 && !isSearching && activeData.length === 0;

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header with search bar */}
      <View style={[s.header, { paddingTop, backgroundColor: colors.headerBg }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>

        <View style={[s.searchWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Search color="rgba(255,255,255,0.6)" size={16} />
          <TextInput
            ref={inputRef}
            style={[s.searchInput, { color: '#ffffff' }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search conversations, contacts…"
            placeholderTextColor="rgba(255,255,255,0.5)"
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearQuery} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X color="rgba(255,255,255,0.7)" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab bar */}
      <View style={[s.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(['conversations', 'contacts', 'messages'] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              style={[s.tab, active && { borderBottomColor: colors.green, borderBottomWidth: 2 }]}
              onPress={() => setTab(t)}
            >
              <Text style={[s.tabLabel, { color: active ? colors.green : colors.textDim }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
              {counts[t] > 0 && (
                <View style={[s.tabBadge, { backgroundColor: colors.green }]}>
                  <Text style={s.tabBadgeText}>{counts[t]}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Results */}
      {isSearching ? (
        <View style={s.centered}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      ) : isEmpty ? (
        <EmptyState
          icon="search"
          title="No results"
          description={`No ${tab} matched "${query}"`}
        />
      ) : query.trim().length === 0 ? (
        <View style={s.centered}>
          <Search color={colors.textDim} size={48} />
          <Text style={[s.hint, { color: colors.textDim }]}>Type to search</Text>
        </View>
      ) : tab === 'conversations' ? (
        <FlatList
          data={convResults}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
        />
      ) : tab === 'contacts' ? (
        <FlatList
          data={contactResults}
          renderItem={renderContact}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.listContent}
        />
      ) : (
        <FlatList
          data={msgResults}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function highlight(text: string, q: string): string {
  // Just return plain text — React Native has no HTML renderer
  return text;
}

function formatTs(ts: number): string {
  const d = new Date(ts < 1e12 ? ts * 1000 : ts);
  const now = new Date();
  if (now.getTime() - d.getTime() < 86_400_000) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function statusColor(
  status: string,
  colors: ColorScheme
): string {
  if (status === 'resolved') return colors.green + '33';
  if (status === 'pending') return colors.orange + '33';
  return colors.surface2;
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 8,
    gap: 8,
  },
  backBtn: { padding: 6 },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 5,
  },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  tabBadge: {
    borderRadius: 8,
    minWidth: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  listContent: { paddingBottom: 24 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
  resultSub: { fontSize: 13 },
  statusPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: { fontSize: 11, color: '#ffffff', fontWeight: '600' },
  msgIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgTs: { fontSize: 11 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  hint: { fontSize: 15 },
});
