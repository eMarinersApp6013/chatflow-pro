// New Conversation screen — start an outbound conversation with a contact.
// Flow: search contacts → pick inbox → write first message → creates conversation in Chatwoot.

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../store/uiStore';
import { useInboxes } from '../hooks/useInboxes';
import { chatService } from '../services/ChatwootAdapter';
import Avatar from '../components/common/Avatar';
import type { ChatwootContact, ChatwootInbox } from '../types/chatwoot';
import { upsertConversations } from '../db/sync';

export default function NewConversationScreen() {
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();
  const { inboxes } = useInboxes();

  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<ChatwootContact[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ChatwootContact | null>(null);
  const [selectedInbox, setSelectedInbox] = useState<ChatwootInbox | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length < 2) { setContacts([]); return; }
    setSearching(true);
    try {
      const results = await chatService.searchContacts(text);
      setContacts(results);
    } catch {
      setContacts([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleCreate = async () => {
    if (!selectedContact || !selectedInbox || !message.trim()) {
      Alert.alert('Missing info', 'Please select a contact, inbox, and write a message.');
      return;
    }
    setSending(true);
    try {
      const conv = await chatService.createConversation(
        selectedContact.id,
        selectedInbox.id,
        message.trim()
      );
      await upsertConversations([conv]);
      router.replace(`/chat/${conv.id}`);
    } catch (err) {
      Alert.alert('Failed', err instanceof Error ? err.message : 'Could not create conversation');
    } finally {
      setSending(false);
    }
  };

  const s = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingTop: insets.top, paddingBottom: 12,
      paddingHorizontal: 14, backgroundColor: colors.headerBg, gap: 12,
    },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff' },
    searchBar: {
      flexDirection: 'row', alignItems: 'center',
      margin: 12, paddingHorizontal: 12,
      backgroundColor: colors.surface2, borderRadius: 12,
      borderWidth: 1, borderColor: colors.border, gap: 8,
    },
    searchInput: { flex: 1, height: 44, color: colors.text, fontSize: 15 },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textDim2, textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: 14, marginBottom: 6, marginTop: 12 },
    contactRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
    contactSelected: { backgroundColor: colors.green + '22' },
    contactName: { fontSize: 15, fontWeight: '600', color: colors.text },
    contactSub: { fontSize: 13, color: colors.textDim },
    inboxRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 14, paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
      gap: 10,
    },
    inboxSelected: { backgroundColor: colors.green + '22' },
    inboxName: { flex: 1, fontSize: 15, color: colors.text },
    inboxCheck: { fontSize: 18, color: colors.green },
    messageBox: {
      margin: 12, padding: 12,
      backgroundColor: colors.surface2,
      borderRadius: 12, borderWidth: 1, borderColor: colors.border,
      minHeight: 100,
    },
    messageInput: { fontSize: 15, color: colors.text, textAlignVertical: 'top' },
    sendBtn: {
      margin: 12, backgroundColor: colors.green,
      borderRadius: 14, paddingVertical: 14,
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    },
    sendBtnDisabled: { opacity: 0.5 },
    sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  }), [colors, insets.top]);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={22} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Conversation</Text>
      </View>

      {/* Step 1: Search contact */}
      <Text style={s.sectionLabel}>1. Select Contact</Text>
      <View style={s.searchBar}>
        <Search color={colors.textDim} size={16} />
        <TextInput
          style={s.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder="Search by name, email or phone…"
          placeholderTextColor={colors.textDim2}
          autoCapitalize="none"
        />
        {searching && <ActivityIndicator size="small" color={colors.green} />}
      </View>

      {contacts.length > 0 && (
        <FlatList
          data={contacts}
          keyExtractor={(item) => String(item.id)}
          style={{ maxHeight: 220 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.contactRow, selectedContact?.id === item.id && s.contactSelected]}
              onPress={() => setSelectedContact(item)}
              activeOpacity={0.7}
            >
              <Avatar name={item.name} uri={item.avatar_url ?? undefined} size={38} />
              <View>
                <Text style={s.contactName}>{item.name}</Text>
                {item.email ? <Text style={s.contactSub}>{item.email}</Text> : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Step 2: Pick inbox */}
      {selectedContact && (
        <>
          <Text style={s.sectionLabel}>2. Select Inbox</Text>
          {inboxes.map((inbox) => (
            <TouchableOpacity
              key={inbox.id}
              style={[s.inboxRow, selectedInbox?.id === inbox.id && s.inboxSelected]}
              onPress={() => setSelectedInbox(inbox)}
              activeOpacity={0.7}
            >
              <Text style={s.inboxName}>{inbox.name}</Text>
              {selectedInbox?.id === inbox.id && <Text style={s.inboxCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Step 3: Write message */}
      {selectedContact && selectedInbox && (
        <>
          <Text style={s.sectionLabel}>3. First Message</Text>
          <View style={s.messageBox}>
            <TextInput
              style={s.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your opening message…"
              placeholderTextColor={colors.textDim2}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[s.sendBtn, (!message.trim() || sending) && s.sendBtnDisabled]}
            onPress={handleCreate}
            disabled={!message.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Send color="#fff" size={18} /><Text style={s.sendBtnText}>Start Conversation</Text></>
            }
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
