// WhatsApp Templates screen — searchable list of approved templates.
// Category badges (MARKETING / UTILITY / AUTHENTICATION).
// Tap a template to preview with placeholder substitution, then send.
// Templates are fetched per-inbox (only WhatsApp inboxes have templates).

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ListRenderItemInfo,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search, X, Send, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUIStore } from '../store/uiStore';
import { useInboxes } from '../hooks/useInboxes';
import type { ColorScheme } from '../constants/colors';
import { chatService } from '../services/ChatwootAdapter';
import type { ChatwootTemplate, ChatwootTemplateComponent } from '../types/chatwoot';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  MARKETING: '#f59e0b',
  UTILITY: '#3b82f6',
  AUTHENTICATION: '#8b5cf6',
};

function getCategoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? '#8696a0';
}

function bodyText(components: ChatwootTemplateComponent[]): string {
  return components.find((c) => c.type === 'BODY')?.text ?? '';
}

function headerText(components: ChatwootTemplateComponent[]): string {
  return components.find((c) => c.type === 'HEADER')?.text ?? '';
}

function footerText(components: ChatwootTemplateComponent[]): string {
  return components.find((c) => c.type === 'FOOTER')?.text ?? '';
}

// Replace {{1}}, {{2}} placeholders with user-provided values
function fillPlaceholders(text: string, values: string[]): string {
  return text.replace(/\{\{(\d+)\}\}/g, (_, n) => values[parseInt(n, 10) - 1] ?? `{{${n}}}`);
}

// Extract placeholder indices from template text
function extractPlaceholders(text: string): number[] {
  const matches = [...text.matchAll(/\{\{(\d+)\}\}/g)];
  const indices = [...new Set(matches.map((m) => parseInt(m[1], 10)))].sort();
  return indices;
}

// ─────────────────────────────────────────────────────────────
// Preview modal
// ─────────────────────────────────────────────────────────────

interface PreviewModalProps {
  template: ChatwootTemplate | null;
  conversationId: number;
  onClose: () => void;
  onSent: () => void;
  colors: ColorScheme;
}

function PreviewModal({ template, conversationId, onClose, onSent, colors }: PreviewModalProps) {
  const [values, setValues] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!template) return;
    const body = bodyText(template.components);
    const indices = extractPlaceholders(body);
    setValues(indices.map(() => ''));
  }, [template]);

  if (!template) return null;

  const body = bodyText(template.components);
  const header = headerText(template.components);
  const footer = footerText(template.components);
  const placeholders = extractPlaceholders(body);
  const filledBody = fillPlaceholders(body, values);
  const filledHeader = fillPlaceholders(header, values);

  const handleSend = async () => {
    setSending(true);
    try {
      const text = [filledHeader, filledBody, footer].filter(Boolean).join('\n\n');
      await chatService.sendMessage(conversationId, {
        content: text,
        message_type: 'outgoing',
      });
      onSent();
      onClose();
    } catch {
      Alert.alert('Send Failed', 'Could not send template message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const ps = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '85%',
      paddingBottom: 32,
    },
    handle: {
      width: 36, height: 4, backgroundColor: colors.border,
      borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 8,
    },
    titleRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 20, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
    scroll: { padding: 20 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
    bubblePreview: {
      backgroundColor: colors.bubbleOut, borderRadius: 12,
      padding: 14, marginBottom: 16,
    },
    bubbleHeader: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
    bubbleBody: { fontSize: 14, color: '#fff', lineHeight: 20 },
    bubbleFooter: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
    inputWrap: {
      backgroundColor: colors.surface2, borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 8,
      borderWidth: 1, borderColor: colors.border,
      marginBottom: 10,
    },
    inputLabel: { fontSize: 11, color: colors.textDim, marginBottom: 4 },
    input: { fontSize: 14, color: colors.text, paddingVertical: 0 },
    sendBtn: {
      margin: 20, backgroundColor: colors.green,
      borderRadius: 22, height: 48,
      justifyContent: 'center', alignItems: 'center',
      flexDirection: 'row', gap: 8,
    },
    sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View style={ps.overlay}>
        <View style={ps.sheet}>
          <View style={ps.handle} />
          <View style={ps.titleRow}>
            <Text style={ps.title}>{template.name}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X color={colors.textDim} size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView style={ps.scroll} showsVerticalScrollIndicator={false}>
            {/* Preview bubble */}
            <Text style={ps.sectionLabel}>Preview</Text>
            <View style={ps.bubblePreview}>
              {filledHeader ? <Text style={ps.bubbleHeader}>{filledHeader}</Text> : null}
              <Text style={ps.bubbleBody}>{filledBody || body}</Text>
              {footer ? <Text style={ps.bubbleFooter}>{footer}</Text> : null}
            </View>

            {/* Placeholder inputs */}
            {placeholders.length > 0 && (
              <>
                <Text style={ps.sectionLabel}>Fill placeholders</Text>
                {placeholders.map((n, i) => (
                  <View key={n} style={ps.inputWrap}>
                    <Text style={ps.inputLabel}>Variable {n}</Text>
                    <TextInput
                      style={ps.input}
                      value={values[i] ?? ''}
                      onChangeText={(v) => {
                        const next = [...values];
                        next[i] = v;
                        setValues(next);
                      }}
                      placeholder={`Enter value for {{${n}}}`}
                      placeholderTextColor={colors.textDim2}
                    />
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[ps.sendBtn, sending && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={sending}
          >
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Send color="#fff" size={18} />}
            <Text style={ps.sendBtnText}>Send Template</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────

export default function TemplatesScreen() {
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();
  // conversation ID is passed so we can send directly from this screen
  const { conversationId: convIdParam, inboxId: inboxIdParam } =
    useLocalSearchParams<{ conversationId?: string; inboxId?: string }>();

  const conversationId = parseInt(convIdParam ?? '0', 10);
  const { inboxes } = useInboxes();

  // WhatsApp inboxes only
  const whatsappInboxes = useMemo(
    () => inboxes.filter((i) => i.channel_type?.toLowerCase().includes('whatsapp')),
    [inboxes]
  );

  const [selectedInboxId, setSelectedInboxId] = useState<number | null>(
    inboxIdParam ? parseInt(inboxIdParam, 10) : null
  );
  const [templates, setTemplates] = useState<ChatwootTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [previewTemplate, setPreviewTemplate] = useState<ChatwootTemplate | null>(null);

  // Auto-select first WhatsApp inbox if not provided
  useEffect(() => {
    if (!selectedInboxId && whatsappInboxes.length > 0) {
      setSelectedInboxId(whatsappInboxes[0].id);
    }
  }, [whatsappInboxes]);

  // Fetch templates when inbox changes
  useEffect(() => {
    if (!selectedInboxId) return;
    setIsLoading(true);
    chatService.getTemplates(selectedInboxId)
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setIsLoading(false));
  }, [selectedInboxId]);

  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return ['All', ...Array.from(cats)];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return templates.filter((t) => {
      const matchCat = activeCategory === 'All' || t.category === activeCategory;
      const matchQ = !q || t.name.toLowerCase().includes(q) || bodyText(t.components).toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [templates, query, activeCategory]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatwootTemplate>) => {
      const catColor = getCategoryColor(item.category);
      const body = bodyText(item.components);
      return (
        <TouchableOpacity
          style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setPreviewTemplate(item)}
          activeOpacity={0.7}
        >
          <View style={s.cardHeader}>
            <Text style={[s.cardName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[s.catBadge, { backgroundColor: catColor + '22' }]}>
              <Text style={[s.catText, { color: catColor }]}>{item.category}</Text>
            </View>
          </View>
          {body ? (
            <Text style={[s.cardBody, { color: colors.textDim }]} numberOfLines={2}>
              {body}
            </Text>
          ) : null}
          <View style={s.cardFooter}>
            <Text style={[s.langText, { color: colors.textDim2 }]}>{item.language}</Text>
            <View style={[s.statusDot, { backgroundColor: item.status === 'approved' ? colors.green : colors.orange }]} />
            <Text style={[s.statusText, { color: item.status === 'approved' ? colors.green : colors.orange }]}>
              {item.status}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [colors]
  );

  const paddingTop = insets.top + (Platform.OS === 'android' ? 4 : 0);

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop, backgroundColor: colors.headerBg }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Templates</Text>
      </View>

      {/* Inbox selector (if multiple WhatsApp inboxes) */}
      {whatsappInboxes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[s.inboxRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
        >
          {whatsappInboxes.map((inbox) => {
            const active = selectedInboxId === inbox.id;
            return (
              <TouchableOpacity
                key={inbox.id}
                style={[
                  s.inboxChip,
                  {
                    backgroundColor: active ? colors.green : colors.surface2,
                    borderColor: active ? colors.green : colors.border,
                  },
                ]}
                onPress={() => setSelectedInboxId(inbox.id)}
              >
                <Text style={{ color: active ? '#fff' : colors.textDim, fontSize: 13, fontWeight: '600' }}>
                  {inbox.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Search bar */}
      <View style={[s.searchRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[s.searchWrap, { backgroundColor: colors.surface2 }]}>
          <Search color={colors.textDim} size={16} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search templates…"
            placeholderTextColor={colors.textDim2}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X color={colors.textDim} size={14} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[s.catRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8, alignItems: 'center' }}
      >
        {categories.map((cat) => {
          const active = activeCategory === cat;
          const catColor = cat === 'All' ? colors.green : getCategoryColor(cat);
          return (
            <TouchableOpacity
              key={cat}
              style={[
                s.catChip,
                {
                  backgroundColor: active ? catColor + '22' : colors.surface2,
                  borderColor: active ? catColor : colors.border,
                },
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={{ color: active ? catColor : colors.textDim, fontSize: 12, fontWeight: '600' }}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Template list */}
      {isLoading ? (
        <View style={s.centered}>
          <ActivityIndicator color={colors.green} size="large" />
          <Text style={[s.loadingText, { color: colors.textDim }]}>Loading templates…</Text>
        </View>
      ) : !selectedInboxId ? (
        <View style={s.centered}>
          <Text style={[s.emptyText, { color: colors.textDim }]}>
            No WhatsApp inbox found.{'\n'}Templates are only available for WhatsApp inboxes.
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.centered}>
          <Text style={[s.emptyText, { color: colors.textDim }]}>No templates found.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.listContent}
        />
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          conversationId={conversationId}
          onClose={() => setPreviewTemplate(null)}
          onSent={() => router.back()}
          colors={colors}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingBottom: 12, paddingHorizontal: 8, gap: 8,
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', flex: 1 },
  inboxRow: { borderBottomWidth: 1 },
  inboxChip: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  searchRow: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  catRow: { borderBottomWidth: 1 },
  catChip: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, height: 34, justifyContent: 'center', alignSelf: 'center' },
  listContent: { padding: 12, gap: 10 },
  card: {
    borderRadius: 14, borderWidth: 1, padding: 14,
    marginBottom: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  cardName: { flex: 1, fontSize: 15, fontWeight: '700' },
  catBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  catText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  cardBody: { fontSize: 14, lineHeight: 19, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  langText: { fontSize: 12, flex: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
