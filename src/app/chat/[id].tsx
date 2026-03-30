// Chat screen — full WhatsApp-style conversation view.
// Phase 2: message bubbles, optimistic send, reply/note toggle,
//           WebSocket real-time updates, typing indicators, connection status.
// Phase 3: LongPressMenu, SwipeReply, AttachmentDrawer, ImageViewer,
//           label chips in header, star/delete actions.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Phone, MoreVertical } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUIStore } from '../../store/uiStore';
import { useConnectionStore } from '../../store/connectionStore';
import { useMessages } from '../../hooks/useMessages';
import { useConversation } from '../../hooks/useConversation';
import { useTyping } from '../../hooks/useTyping';
import { wsService } from '../../services/WebSocketService';
import { chatService } from '../../services/ChatwootAdapter';
import { WS_EVENTS } from '../../constants/api';

import Avatar from '../../components/common/Avatar';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import MessageBubble from '../../components/chat/MessageBubble';
import MessageInput from '../../components/chat/MessageInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import DateSeparator from '../../components/chat/DateSeparator';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LongPressMenu from '../../components/chat/LongPressMenu';
import SwipeReply from '../../components/chat/SwipeReply';
import AttachmentDrawer from '../../components/chat/AttachmentDrawer';
import ImageViewer from '../../components/chat/ImageViewer';

import type MessageModel from '../../db/models/MessageModel';
import type { ReplyContext, MessageMode } from '../../types/app';
import type { ChatwootWebSocketEvent } from '../../types/chatwoot';
import type { PickedFile } from '../../components/chat/AttachmentDrawer';
import { formatDate } from '../../utils/formatters';
import { database, messagesCollection } from '../../db/database';
import { Q } from '@nozbe/watermelondb';

// ─────────────────────────────────────────────────────────────
// Chat screen component
// ─────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const remoteId = parseInt(id ?? '0', 10);

  const { colors } = useUIStore();
  const { setConnectionState } = useConnectionStore();
  const insets = useSafeAreaInsets();

  const { conversation, isLoading } = useConversation(remoteId);
  const { messages, sendMessage, loadMore } = useMessages(remoteId);
  const { typingUsers } = useTyping(remoteId);

  const [mode, setMode] = useState<MessageMode>('reply');
  const [replyContext, setReplyContext] = useState<ReplyContext | null>(null);

  // Phase 3 state
  const [menuMessage, setMenuMessage] = useState<MessageModel | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [attachmentDrawerVisible, setAttachmentDrawerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const listRef = useRef<FlatList>(null);
  const prevMessageCount = useRef(0);

  // ── Scroll to bottom when new messages arrive ──────────────
  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      prevMessageCount.current = messages.length;
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  // ── Wire WebSocket connection state → store ────────────────
  useEffect(() => {
    return wsService.onConnectionChange(setConnectionState);
  }, []);

  // ── Handle incoming WebSocket messages for this conversation ─
  useEffect(() => {
    const unsub = wsService.on(
      WS_EVENTS.MESSAGE_CREATED,
      async (event: ChatwootWebSocketEvent) => {
        const payload = event.data as Record<string, unknown>;
        const convId = payload?.conversation_id as number | undefined;
        if (convId !== remoteId) return;

        const msg = payload as {
          id: number;
          message_type: number;
          content: string | null;
          private: boolean;
          status: string;
          created_at: number;
          sender?: { id: number; name: string; avatar_url: string | null };
        };

        await database.write(async () => {
          const existing = await messagesCollection
            .query(Q.where('remote_id', msg.id))
            .fetchCount();
          if (existing > 0) return;

          await messagesCollection.create((record) => {
            record.remoteId = msg.id;
            record.conversationRemoteId = remoteId;
            record.conversationId = '';
            record.messageType = msg.message_type;
            record.content = msg.content ?? null;
            record.isPrivate = msg.private ?? false;
            record.status = msg.status ?? 'sent';
            record.createdAt = msg.created_at;
            record.senderId = msg.sender?.id ?? null;
            record.senderName = msg.sender?.name ?? null;
            record.senderAvatar = msg.sender?.avatar_url ?? null;
            record.attachmentsJson = null;
            record.isPending = false;
            record.isStarred = false;
            record.replyToId = null;
          });
        });
      }
    );
    return () => unsub();
  }, [remoteId]);

  // ── Send text handler ──────────────────────────────────────
  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content, mode);
      setReplyContext(null);
    },
    [mode, sendMessage]
  );

  // ── Attachment picked → upload via chatService ─────────────
  const handleFilePicked = useCallback(
    async (file: PickedFile) => {
      try {
        await chatService.sendAttachment(
          remoteId,
          file.uri,
          file.name,
          file.mimeType,
          mode === 'note'
        );
      } catch {
        // Silently fail — user can retry
      }
    },
    [remoteId, mode]
  );

  // ── Long press → open context menu ────────────────────────
  const handleLongPress = useCallback((msg: MessageModel) => {
    setMenuMessage(msg);
    setMenuVisible(true);
  }, []);

  // ── Swipe-right → set reply context ───────────────────────
  const handleSwipeReply = useCallback((msg: MessageModel) => {
    setReplyContext({
      messageId: msg.remoteId,
      content: msg.content ?? '',
      senderName: msg.senderName ?? 'Unknown',
    });
  }, []);

  // ── Menu: Reply ────────────────────────────────────────────
  const handleMenuReply = useCallback((msg: MessageModel) => {
    setReplyContext({
      messageId: msg.remoteId,
      content: msg.content ?? '',
      senderName: msg.senderName ?? 'Unknown',
    });
  }, []);

  // ── Menu: Star / Unstar ────────────────────────────────────
  const handleMenuStar = useCallback(async (msg: MessageModel) => {
    await database.write(async () => {
      await msg.update((m) => { m.isStarred = !m.isStarred; });
    });
  }, []);

  // ── Menu: Delete ───────────────────────────────────────────
  const handleMenuDelete = useCallback(
    async (msg: MessageModel) => {
      try {
        await chatService.deleteMessage(remoteId, msg.remoteId);
        await database.write(async () => {
          await msg.destroyPermanently();
        });
      } catch {
        // Silently fail
      }
    },
    [remoteId]
  );

  // ── Image viewer ───────────────────────────────────────────
  const handleImagePress = useCallback((uri: string) => {
    setViewerUri(uri);
    setViewerVisible(true);
  }, []);

  // ── Determine if tail should show (last of a run) ─────────
  const shouldShowTail = useCallback(
    (index: number): boolean => {
      if (index === messages.length - 1) return true;
      const curr = messages[index];
      const next = messages[index + 1];
      return curr.messageType !== next.messageType || next.isActivity;
    },
    [messages]
  );

  // ── Determine if date separator should show ────────────────
  const shouldShowDate = useCallback(
    (index: number): boolean => {
      if (index === 0) return true;
      const prev = messages[index - 1];
      const curr = messages[index];
      return formatDate(prev.createdAt) !== formatDate(curr.createdAt);
    },
    [messages]
  );

  // ── Render each message row ────────────────────────────────
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<MessageModel>) => {
      const showDate = shouldShowDate(index);
      const showTail = shouldShowTail(index);

      return (
        <View>
          {showDate && <DateSeparator timestamp={item.createdAt} />}
          <SwipeReply
            onReply={() => handleSwipeReply(item)}
            enabled={!item.isActivity}
          >
            <MessageBubble
              message={item}
              showTail={showTail}
              onLongPress={handleLongPress}
              onImagePress={handleImagePress}
            />
          </SwipeReply>
        </View>
      );
    },
    [shouldShowDate, shouldShowTail, handleLongPress, handleSwipeReply, handleImagePress]
  );

  const keyExtractor = (item: MessageModel) => item.id;

  // ── Status display ─────────────────────────────────────────
  const statusLabel =
    conversation?.status === 'resolved'
      ? '✓ Resolved'
      : conversation?.status === 'pending'
      ? '⏳ Pending'
      : null;

  // ── Conversation labels ────────────────────────────────────
  const convLabels: string[] = conversation?.labels ?? [];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: Platform.OS === 'ios' ? insets.top : 8,
      paddingBottom: 10,
      paddingHorizontal: 8,
      backgroundColor: colors.headerBg,
      gap: 8,
    },
    backBtn: { padding: 6 },
    headerAvatar: { marginRight: 2 },
    headerInfo: { flex: 1 },
    headerName: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
    headerActions: { flexDirection: 'row', gap: 4 },
    headerBtn: { padding: 6 },
    labelChips: {
      flexDirection: 'row',
      paddingHorizontal: 14,
      paddingVertical: 6,
      gap: 6,
      backgroundColor: colors.surface2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    labelChip: {
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
      backgroundColor: colors.green + '22',
    },
    labelChipText: { fontSize: 11, color: colors.green, fontWeight: '600' },
    resolvedBanner: {
      backgroundColor: colors.surface2,
      paddingVertical: 6,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resolvedText: { fontSize: 13, color: colors.textDim, fontStyle: 'italic' },
    chatBackground: { flex: 1, backgroundColor: colors.bg },
    listContent: { paddingTop: 8, paddingBottom: 4 },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>

        <View style={s.headerAvatar}>
          <Avatar
            name={conversation?.contactName ?? '…'}
            uri={conversation?.contactAvatar ?? undefined}
            size={38}
          />
        </View>

        <TouchableOpacity
          style={s.headerInfo}
          onPress={() =>
            conversation &&
            router.push(`/contact/${conversation.remoteId}`)
          }
          activeOpacity={0.7}
        >
          <Text style={s.headerName} numberOfLines={1}>
            {conversation?.contactName ?? `Conversation #${id}`}
          </Text>
          {conversation?.assigneeName ? (
            <Text style={s.headerSub} numberOfLines={1}>
              Assigned to {conversation.assigneeName}
            </Text>
          ) : typingUsers.length > 0 ? (
            <Text style={s.headerSub}>typing…</Text>
          ) : null}
        </TouchableOpacity>

        <View style={s.headerActions}>
          <TouchableOpacity style={s.headerBtn}>
            <Phone color="#ffffff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn}>
            <MoreVertical color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Label chips (if any) ── */}
      {convLabels.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.labelChips}
        >
          {convLabels.map((lbl) => (
            <View key={lbl} style={s.labelChip}>
              <Text style={s.labelChipText}>{lbl}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Connection status banner ── */}
      <ConnectionStatus />

      {/* ── Resolved/pending banner ── */}
      {statusLabel && (
        <View style={s.resolvedBanner}>
          <Text style={s.resolvedText}>{statusLabel}</Text>
        </View>
      )}

      {/* ── Message list ── */}
      {isLoading && messages.length === 0 ? (
        <LoadingSpinner fullScreen />
      ) : (
        <View style={s.chatBackground}>
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={s.listContent}
            onScrollBeginDrag={() => {
              if (messages.length >= 30 && messages[0]) {
                loadMore(messages[0].remoteId);
              }
            }}
            windowSize={12}
            maxToRenderPerBatch={20}
            updateCellsBatchingPeriod={25}
            removeClippedSubviews
            initialNumToRender={25}
            onLayout={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
          />

          {/* ── Typing indicator ── */}
          {typingUsers.length > 0 && (
            <TypingIndicator names={typingUsers.map((u) => u.userName)} />
          )}
        </View>
      )}

      {/* ── Composer ── */}
      <MessageInput
        mode={mode}
        replyContext={replyContext}
        onSend={handleSend}
        onModeChange={setMode}
        onClearReply={() => setReplyContext(null)}
        onAttachmentPress={() => setAttachmentDrawerVisible(true)}
      />

      {/* ── Phase 3 overlays ── */}
      <LongPressMenu
        message={menuMessage}
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onReply={handleMenuReply}
        onStar={handleMenuStar}
        onDelete={handleMenuDelete}
      />

      <AttachmentDrawer
        visible={attachmentDrawerVisible}
        onClose={() => setAttachmentDrawerVisible(false)}
        onFilePicked={handleFilePicked}
      />

      <ImageViewer
        uri={viewerUri}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
