// Chat screen — full WhatsApp-style conversation view.
// Phase 2: message bubbles, optimistic send, reply/note toggle,
//           WebSocket real-time updates, typing indicators, connection status.
// Phase 3: LongPressMenu, SwipeReply, AttachmentDrawer, ImageViewer,
//           label chips in header, star/delete actions.
// Phase 4: AssignmentDrawer, StatusPicker, MacrosDrawer, templates link,
//           MoreVertical menu for header actions.

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
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft, Phone, MoreVertical, UserPlus, RefreshCw, Zap, FileText, X,
} from 'lucide-react-native';
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
import AssignmentDrawer from '../../components/chat/AssignmentDrawer';
import StatusPicker from '../../components/chat/StatusPicker';
import MacrosDrawer from '../../components/chat/MacrosDrawer';

import type MessageModel from '../../db/models/MessageModel';
import type { ReplyContext, MessageMode } from '../../types/app';
import type { ChatwootWebSocketEvent, ChatwootAgent, ChatwootTeam, ConversationStatus } from '../../types/chatwoot';
import type { PickedFile } from '../../components/chat/AttachmentDrawer';
import { formatDate } from '../../utils/formatters';
import { database, messagesCollection, conversationsCollection } from '../../db/database';
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

  // Phase 4 state
  const [assignmentVisible, setAssignmentVisible] = useState(false);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [macrosVisible, setMacrosVisible] = useState(false);
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);

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

  // ── Attachment picked → upload ─────────────────────────────
  const handleFilePicked = useCallback(
    async (file: PickedFile) => {
      try {
        await chatService.sendAttachment(remoteId, file.uri, file.name, file.mimeType, mode === 'note');
      } catch {
        // Silently fail
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

  const handleMenuReply = useCallback((msg: MessageModel) => {
    setReplyContext({
      messageId: msg.remoteId,
      content: msg.content ?? '',
      senderName: msg.senderName ?? 'Unknown',
    });
  }, []);

  const handleMenuStar = useCallback(async (msg: MessageModel) => {
    await database.write(async () => {
      await msg.update((m) => { m.isStarred = !m.isStarred; });
    });
  }, []);

  const handleMenuDelete = useCallback(
    async (msg: MessageModel) => {
      try {
        await chatService.deleteMessage(remoteId, msg.remoteId);
        await database.write(async () => { await msg.destroyPermanently(); });
      } catch {
        // Silently fail
      }
    },
    [remoteId]
  );

  const handleImagePress = useCallback((uri: string) => {
    setViewerUri(uri);
    setViewerVisible(true);
  }, []);

  // ── Phase 4: Assignment ────────────────────────────────────
  const handleAssignAgent = useCallback(
    async (agent: ChatwootAgent) => {
      try {
        await chatService.assignConversation(remoteId, agent.id);
        // Update local DB optimistically
        const convs = await conversationsCollection.query(Q.where('remote_id', remoteId)).fetch();
        if (convs.length > 0) {
          await database.write(async () => {
            await convs[0].update((c) => {
              c.assigneeId = agent.id;
              c.assigneeName = agent.name;
            });
          });
        }
      } catch {
        // Silently fail
      }
    },
    [remoteId]
  );

  const handleAssignTeam = useCallback(
    async (team: ChatwootTeam) => {
      try {
        await chatService.assignTeam(remoteId, team.id);
      } catch {
        // Silently fail
      }
    },
    [remoteId]
  );

  // ── Phase 4: Status change ─────────────────────────────────
  const handleStatusChange = useCallback(
    async (status: ConversationStatus) => {
      try {
        await chatService.toggleStatus(remoteId, status);
        const convs = await conversationsCollection.query(Q.where('remote_id', remoteId)).fetch();
        if (convs.length > 0) {
          await database.write(async () => {
            await convs[0].update((c) => { c.status = status; });
          });
        }
      } catch {
        // Silently fail
      }
    },
    [remoteId]
  );

  // ── Tail / date helpers ────────────────────────────────────
  const shouldShowTail = useCallback(
    (index: number): boolean => {
      if (index === messages.length - 1) return true;
      const curr = messages[index];
      const next = messages[index + 1];
      return curr.messageType !== next.messageType || next.isActivity;
    },
    [messages]
  );

  const shouldShowDate = useCallback(
    (index: number): boolean => {
      if (index === 0) return true;
      return formatDate(messages[index - 1].createdAt) !== formatDate(messages[index].createdAt);
    },
    [messages]
  );

  // ── Render each message row ────────────────────────────────
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<MessageModel>) => (
      <View>
        {shouldShowDate(index) && <DateSeparator timestamp={item.createdAt} />}
        <SwipeReply onReply={() => handleSwipeReply(item)} enabled={!item.isActivity}>
          <MessageBubble
            message={item}
            showTail={shouldShowTail(index)}
            onLongPress={handleLongPress}
            onImagePress={handleImagePress}
          />
        </SwipeReply>
      </View>
    ),
    [shouldShowDate, shouldShowTail, handleLongPress, handleSwipeReply, handleImagePress]
  );

  const keyExtractor = (item: MessageModel) => item.id;

  const statusLabel =
    conversation?.status === 'resolved' ? '✓ Resolved'
    : conversation?.status === 'pending' ? '⏳ Pending'
    : conversation?.status === 'snoozed' ? '💤 Snoozed'
    : null;

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
    // Header popup menu
    popupOverlay: { flex: 1 },
    popup: {
      position: 'absolute',
      top: (Platform.OS === 'ios' ? insets.top : 8) + 52,
      right: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
      overflow: 'hidden',
    },
    popupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    popupRowLast: { borderBottomWidth: 0 },
    popupLabel: { fontSize: 15, color: colors.text },
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
          onPress={() => conversation && router.push(`/contact/${conversation.remoteId}`)}
          activeOpacity={0.7}
        >
          <Text style={s.headerName} numberOfLines={1}>
            {conversation?.contactName ?? `Conversation #${id}`}
          </Text>
          {conversation?.assigneeName ? (
            <Text style={s.headerSub} numberOfLines={1}>
              {conversation.assigneeName}
            </Text>
          ) : typingUsers.length > 0 ? (
            <Text style={s.headerSub}>typing…</Text>
          ) : null}
        </TouchableOpacity>

        <View style={s.headerActions}>
          <TouchableOpacity style={s.headerBtn}>
            <Phone color="#ffffff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={() => setHeaderMenuVisible(true)}>
            <MoreVertical color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Label chips (if any) ── */}
      {convLabels.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.labelChips}>
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
          <TouchableOpacity onPress={() => setStatusPickerVisible(true)}>
            <Text style={{ fontSize: 12, color: colors.green }}>Change</Text>
          </TouchableOpacity>
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
              if (messages.length >= 30 && messages[0]) loadMore(messages[0].remoteId);
            }}
            windowSize={12}
            maxToRenderPerBatch={20}
            updateCellsBatchingPeriod={25}
            removeClippedSubviews
            initialNumToRender={25}
            onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          />
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

      {/* ── Phase 4 overlays ── */}
      <AssignmentDrawer
        visible={assignmentVisible}
        currentAssigneeId={conversation?.assigneeId ?? null}
        onClose={() => setAssignmentVisible(false)}
        onAssignAgent={handleAssignAgent}
        onAssignTeam={handleAssignTeam}
      />
      <StatusPicker
        visible={statusPickerVisible}
        currentStatus={(conversation?.status as ConversationStatus) ?? 'open'}
        onClose={() => setStatusPickerVisible(false)}
        onSelect={handleStatusChange}
      />
      <MacrosDrawer
        visible={macrosVisible}
        conversationId={remoteId}
        onClose={() => setMacrosVisible(false)}
        onMacroRun={() => {/* conversation will update via WS */}}
      />

      {/* ── Header popup menu ── */}
      <Modal
        transparent
        visible={headerMenuVisible}
        animationType="fade"
        onRequestClose={() => setHeaderMenuVisible(false)}
      >
        <TouchableOpacity
          style={s.popupOverlay}
          activeOpacity={1}
          onPress={() => setHeaderMenuVisible(false)}
        >
          <View style={s.popup}>
            <TouchableOpacity
              style={s.popupRow}
              onPress={() => { setHeaderMenuVisible(false); setAssignmentVisible(true); }}
              activeOpacity={0.7}
            >
              <UserPlus color={colors.textDim} size={18} />
              <Text style={s.popupLabel}>Assign Agent / Team</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.popupRow}
              onPress={() => { setHeaderMenuVisible(false); setStatusPickerVisible(true); }}
              activeOpacity={0.7}
            >
              <RefreshCw color={colors.textDim} size={18} />
              <Text style={s.popupLabel}>Change Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.popupRow}
              onPress={() => { setHeaderMenuVisible(false); setMacrosVisible(true); }}
              activeOpacity={0.7}
            >
              <Zap color={colors.textDim} size={18} />
              <Text style={s.popupLabel}>Quick Macros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.popupRow, s.popupRowLast]}
              onPress={() => {
                setHeaderMenuVisible(false);
                router.push(`/templates?conversationId=${remoteId}&inboxId=${conversation?.inboxId ?? 0}`);
              }}
              activeOpacity={0.7}
            >
              <FileText color={colors.textDim} size={18} />
              <Text style={s.popupLabel}>Send Template</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
