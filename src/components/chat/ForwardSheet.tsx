// ForwardSheet — bottom sheet for forwarding a message to another conversation.
// Shows a searchable list of open conversations. Select one to forward the message text.

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { X, Search } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { conversationsCollection } from '../../db/database';
import { chatService } from '../../services/ChatwootAdapter';
import type ConversationModel from '../../db/models/ConversationModel';

interface Props {
  visible: boolean;
  messageContent: string;
  onClose: () => void;
  onForwarded?: () => void;
}

export default function ForwardSheet({ visible, messageContent, onClose, onForwarded }: Props) {
  const { colors } = useUIStore();
  const [conversations, setConversations] = useState<ConversationModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [forwarding, setForwarding] = useState<string | null>(null);

  const translateY = useSharedValue(500);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 180 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      // Load all conversations
      conversationsCollection.query().fetch().then((records) => {
        setConversations(records as ConversationModel[]);
      });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(500, { duration: 200 });
      setSearchQuery('');
      setForwarding(null);
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const filtered = conversations.filter((c) =>
    !searchQuery || c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleForward = useCallback(async (conv: ConversationModel) => {
    if (!messageContent.trim()) return;
    setForwarding(conv.id);
    try {
      await chatService.sendMessage(conv.remoteId, {
        content: `↩️ Forwarded:\n${messageContent}`,
        message_type: 'outgoing',
        private: false,
      });
      onForwarded?.();
      onClose();
    } catch {
      setForwarding(null);
    }
  }, [messageContent, onClose, onForwarded]);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<ConversationModel>) => (
    <TouchableOpacity
      style={[si.item, { borderBottomColor: colors.border }]}
      onPress={() => handleForward(item)}
      activeOpacity={0.7}
      disabled={forwarding !== null}
    >
      <View style={[si.avatar, { backgroundColor: colors.green + '33' }]}>
        <Text style={[si.avatarText, { color: colors.green }]}>
          {item.contactName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[si.name, { color: colors.text }]} numberOfLines={1}>{item.contactName}</Text>
        <Text style={[si.preview, { color: colors.textDim }]} numberOfLines={1}>
          #{item.remoteId}
        </Text>
      </View>
      {forwarding === item.id && <ActivityIndicator color={colors.green} size="small" />}
    </TouchableOpacity>
  ), [colors, forwarding, handleForward]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[si.overlay, overlayStyle]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[si.sheet, { backgroundColor: colors.surface }, sheetStyle]}>
        <View style={si.handle} />
        <View style={[si.titleRow, { borderBottomColor: colors.border }]}>
          <Text style={[si.title, { color: colors.text }]}>Forward to…</Text>
          <TouchableOpacity onPress={onClose} style={si.closeBtn}>
            <X color={colors.textDim} size={20} />
          </TouchableOpacity>
        </View>

        {/* Message preview */}
        <View style={[si.msgPreview, { backgroundColor: colors.surface2 }]}>
          <Text style={[si.msgPreviewText, { color: colors.textDim }]} numberOfLines={2}>
            {messageContent}
          </Text>
        </View>

        {/* Search */}
        <View style={[si.searchRow, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
          <Search color={colors.textDim} size={16} />
          <TextInput
            style={[si.searchInput, { color: colors.text }]}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={{ maxHeight: 320 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[si.empty, { color: colors.textDim }]}>No conversations found</Text>
          }
        />
      </Animated.View>
    </Modal>
  );
}

const si = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    overflow: 'hidden',
  },
  handle: { width: 36, height: 4, backgroundColor: '#555', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 17, fontWeight: '700' },
  closeBtn: { padding: 4 },
  msgPreview: { marginHorizontal: 16, marginTop: 10, borderRadius: 8, padding: 10 },
  msgPreviewText: { fontSize: 13, fontStyle: 'italic' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 10, marginBottom: 6, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '600' },
  preview: { fontSize: 13, marginTop: 1 },
  empty: { padding: 20, textAlign: 'center', fontSize: 14 },
});
