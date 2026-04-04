// Contact profile screen.
// The `id` param is a CONVERSATION remote ID (the chat screen navigates here via
// conversation.remoteId). We fetch the conversation first, then the contact from it.

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Mail, Phone, MessageCircle, ExternalLink, MapPin, Building, UserCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUIStore } from '../../store/uiStore';
import { chatService } from '../../services/ChatwootAdapter';
import type { ColorScheme } from '../../constants/colors';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import type { ChatwootContact, ChatwootConversation } from '../../types/chatwoot';

export default function ContactScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const convRemoteId = parseInt(id ?? '0', 10);

  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();

  const [contact, setContact] = useState<ChatwootContact | null>(null);
  const [conversations, setConversations] = useState<ChatwootConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const conv = await chatService.getConversation(convRemoteId);
        if (cancelled) return;
        const contactId = conv.meta?.sender?.id;
        if (!contactId) { setError('Contact not found.'); return; }

        const [contactData, contactConvs] = await Promise.all([
          chatService.getContact(contactId),
          chatService.getContactConversations(contactId),
        ]);
        if (cancelled) return;
        setContact(contactData);
        setConversations(contactConvs);
      } catch {
        if (!cancelled) setError('Could not load contact. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [convRemoteId]);

  const handleCallPress = useCallback(() => {
    if (contact?.phone_number) Linking.openURL(`tel:${contact.phone_number}`);
  }, [contact]);

  const handleEmailPress = useCallback(() => {
    if (contact?.email) Linking.openURL(`mailto:${contact.email}`);
  }, [contact]);

  const handleSaveToContacts = useCallback(async () => {
    if (!contact) return;
    setSavingContact(true);
    try {
      const Contacts = await import('expo-contacts');
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow contacts access in your device settings.');
        return;
      }
      const nameParts = contact.name.split(' ');
      // Use a plain object matching the Contact shape — dynamic import means we can't use Contacts.Contact type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newContact: any = {
        contactType: 'person',
        name: contact.name,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || undefined,
      };
      if (contact.phone_number) {
        newContact.phoneNumbers = [{ label: 'mobile', number: contact.phone_number }];
      }
      if (contact.email) {
        newContact.emails = [{ label: 'work', email: contact.email }];
      }
      await Contacts.addContactAsync(newContact);
      Alert.alert('Saved!', `${contact.name} has been saved to your contacts.`);
    } catch {
      Alert.alert('Error', 'Could not save contact. Please try again.');
    } finally {
      setSavingContact(false);
    }
  }, [contact]);

  const company = (contact?.additional_attributes as Record<string, string> | undefined)?.company;

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top, backgroundColor: colors.headerBg }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Contact</Text>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : error ? (
        <View style={s.errorWrap}>
          <Text style={[s.errorText, { color: colors.danger }]}>{error}</Text>
          <TouchableOpacity
            style={[s.retryBtn, { backgroundColor: colors.green }]}
            onPress={() => { setError(null); setIsLoading(true); }}
          >
            <Text style={s.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : contact ? (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Profile card */}
          <View style={[s.profileCard, { backgroundColor: colors.surface }]}>
            <Avatar name={contact.name} uri={contact.avatar_url ?? undefined} size={96} />
            <Text style={[s.contactName, { color: colors.text }]}>{contact.name}</Text>
            {contact.identifier ? (
              <Text style={[s.contactIdentifier, { color: colors.textDim2 }]}>ID: {contact.identifier}</Text>
            ) : null}
            {contact.email ? (
              <Text style={[s.contactMeta, { color: colors.textDim }]}>{contact.email}</Text>
            ) : null}
            {contact.phone_number ? (
              <Text style={[s.contactMeta, { color: colors.textDim }]}>{contact.phone_number}</Text>
            ) : null}
          </View>

          {/* Action buttons */}
          <View style={[s.actionsRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
            {contact.phone_number ? (
              <TouchableOpacity style={s.actionBtn} onPress={handleCallPress} activeOpacity={0.7}>
                <View style={[s.actionIcon, { backgroundColor: colors.green + '22' }]}>
                  <Phone color={colors.green} size={22} />
                </View>
                <Text style={[s.actionLabel, { color: colors.textDim }]}>Call</Text>
              </TouchableOpacity>
            ) : null}
            {contact.email ? (
              <TouchableOpacity style={s.actionBtn} onPress={handleEmailPress} activeOpacity={0.7}>
                <View style={[s.actionIcon, { backgroundColor: colors.purple + '22' }]}>
                  <Mail color={colors.purple} size={22} />
                </View>
                <Text style={[s.actionLabel, { color: colors.textDim }]}>Email</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={s.actionBtn} onPress={() => router.push(`/chat/${convRemoteId}`)} activeOpacity={0.7}>
              <View style={[s.actionIcon, { backgroundColor: colors.orange + '22' }]}>
                <MessageCircle color={colors.orange} size={22} />
              </View>
              <Text style={[s.actionLabel, { color: colors.textDim }]}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={handleSaveToContacts} activeOpacity={0.7} disabled={savingContact}>
              <View style={[s.actionIcon, { backgroundColor: colors.green + '22' }]}>
                {savingContact
                  ? <ActivityIndicator color={colors.green} size="small" />
                  : <UserCheck color={colors.green} size={22} />}
              </View>
              <Text style={[s.actionLabel, { color: colors.textDim }]}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Details section */}
          {(contact.location || company || contact.phone_number || contact.email) ? (
            <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.sectionTitle, { color: colors.textDim, borderBottomColor: colors.border }]}>Details</Text>
              {contact.phone_number ? <DetailRow label="Phone" value={contact.phone_number} colors={colors} /> : null}
              {contact.email ? <DetailRow label="Email" value={contact.email} colors={colors} /> : null}
              {contact.location ? <DetailRow label="Location" value={contact.location} colors={colors} /> : null}
              {company ? <DetailRow label="Company" value={company} colors={colors} /> : null}
            </View>
          ) : null}

          {/* Conversation history */}
          <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.sectionTitle, { color: colors.textDim, borderBottomColor: colors.border }]}>
              Conversations ({conversations.length})
            </Text>
            {conversations.length === 0 ? (
              <Text style={[s.noConvs, { color: colors.textDim }]}>No other conversations.</Text>
            ) : (
              conversations.map((conv) => (
                <TouchableOpacity
                  key={conv.id}
                  style={[s.convRow, { borderBottomColor: colors.border }]}
                  onPress={() => router.push(`/chat/${conv.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={s.convInfo}>
                    <Text style={[s.convId, { color: colors.textDim }]}>
                      #{conv.id} · {conv.inbox_id ? `Inbox ${conv.inbox_id}` : ''}
                    </Text>
                    <Text style={[s.convLast, { color: colors.text }]} numberOfLines={1}>
                      {conv.channel ?? ''}
                    </Text>
                  </View>
                  <View style={[s.convStatus, { backgroundColor: statusBg(conv.status, colors) }]}>
                    <Text style={[s.convStatusText, { color: statusFg(conv.status, colors) }]}>
                      {conv.status}
                    </Text>
                  </View>
                  <ExternalLink color={colors.textDim2} size={14} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: ColorScheme }) {
  return (
    <View style={dr.row}>
      <Text style={[dr.label, { color: colors.textDim }]}>{label}</Text>
      <Text style={[dr.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}
const dr = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  label: { width: 70, fontSize: 13, fontWeight: '600' },
  value: { flex: 1, fontSize: 14 },
});

function statusBg(status: string, colors: ColorScheme): string {
  if (status === 'resolved') return colors.green + '22';
  if (status === 'pending') return colors.orange + '22';
  return colors.surface2;
}
function statusFg(status: string, colors: ColorScheme): string {
  if (status === 'resolved') return colors.green;
  if (status === 'pending') return colors.orange;
  return colors.textDim;
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, paddingHorizontal: 8, gap: 8 },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', flex: 1 },
  scroll: { paddingBottom: 40 },
  profileCard: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, marginBottom: 2 },
  contactName: { fontSize: 22, fontWeight: '700', marginTop: 14, marginBottom: 4 },
  contactIdentifier: { fontSize: 12, marginTop: 2, marginBottom: 2 },
  contactMeta: { fontSize: 14, marginTop: 2 },
  actionsRow: {
    flexDirection: 'row', justifyContent: 'space-evenly',
    paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 16,
  },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '500' },
  section: { marginHorizontal: 12, marginBottom: 12, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  noConvs: { padding: 16, fontSize: 14 },
  convRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 10 },
  convInfo: { flex: 1 },
  convId: { fontSize: 12 },
  convLast: { fontSize: 14, marginTop: 1 },
  convStatus: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  convStatusText: { fontSize: 11, fontWeight: '600' },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  errorText: { fontSize: 15, textAlign: 'center' },
  retryBtn: { borderRadius: 22, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
