// Canned Responses settings screen — create, edit, delete pre-written responses.
// "/" in the message input triggers canned response suggestions on the chat screen.

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit2, Trash2, X, Check } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { chatService } from '../../services/ChatwootAdapter';

interface CannedResponse {
  id: number;
  short_code: string;
  content: string;
}

export default function CannedResponsesScreen() {
  const { colors } = useUIStore();
  const { credentials } = useAuthStore();
  const router = useRouter();

  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [shortCode, setShortCode] = useState('');
  const [content, setContent] = useState('');

  const loadResponses = useCallback(async () => {
    if (!credentials) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await chatService.getCannedResponses('');
      setResponses(data as CannedResponse[]);
    } catch {
      Alert.alert('Error', 'Failed to load canned responses');
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  const openAdd = () => {
    setEditingId(null);
    setShortCode('');
    setContent('');
    setModalVisible(true);
  };

  const openEdit = (item: CannedResponse) => {
    setEditingId(item.id);
    setShortCode(item.short_code);
    setContent(item.content);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const code = shortCode.trim();
    const body = content.trim();
    if (!code || !body) {
      Alert.alert('Validation', 'Both short code and content are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await chatService.updateCannedResponse(editingId, code, body);
        setResponses((prev) =>
          prev.map((r) => (r.id === editingId ? { ...r, short_code: code, content: body } : r))
        );
      } else {
        const created = await chatService.createCannedResponse(code, body);
        setResponses((prev) => [...prev, created]);
      }
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to save canned response. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: CannedResponse) => {
    Alert.alert(
      'Delete Response',
      `Delete "/${item.short_code}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteCannedResponse(item.id);
              setResponses((prev) => prev.filter((r) => r.id !== item.id));
            } catch {
              Alert.alert('Error', 'Failed to delete. Please try again.');
            }
          },
        },
      ]
    );
  };

  // useMemo prevents StyleSheet.create from running on every render — avoids ID registry overflow crash
  const s = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 50,
      paddingBottom: 14,
      paddingHorizontal: 14,
      backgroundColor: colors.headerBg,
      gap: 12,
    },
    backBtn: { padding: 4 },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.text },
    addBtn: { padding: 6 },
    listContent: { padding: 12, gap: 8, paddingBottom: 30 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardBody: { flex: 1 },
    code: { fontSize: 14, fontWeight: '700', color: colors.green },
    preview: { fontSize: 13, color: colors.textDim, marginTop: 3 },
    iconBtn: { padding: 4 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { fontSize: 15, color: colors.textDim, textAlign: 'center' },
    // Modal
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
    label: { fontSize: 12, color: colors.textDim2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
    input: {
      backgroundColor: colors.surface2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 14,
      marginBottom: 14,
    },
    textArea: { height: 90, textAlignVertical: 'top' },
    saveBtn: {
      backgroundColor: colors.green,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 4,
    },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  }), [colors]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Canned Responses</Text>
        <TouchableOpacity onPress={openAdd} style={s.addBtn}>
          <Plus color={colors.text} size={22} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.empty}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      ) : responses.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>
            No canned responses yet.{'\n'}Tap + to create one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={responses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.listContent}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardBody}>
                <Text style={s.code}>/{item.short_code}</Text>
                <Text style={s.preview} numberOfLines={2}>{item.content}</Text>
              </View>
              <TouchableOpacity onPress={() => openEdit(item)} style={s.iconBtn}>
                <Edit2 color={colors.textDim} size={18} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={s.iconBtn}>
                <Trash2 color={colors.danger} size={18} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>{editingId ? 'Edit Response' : 'New Response'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={colors.textDim} size={22} />
              </TouchableOpacity>
            </View>

            <Text style={s.label}>Short Code</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. greeting"
              placeholderTextColor={colors.textDim2}
              value={shortCode}
              onChangeText={setShortCode}
              autoCapitalize="none"
            />

            <Text style={s.label}>Content</Text>
            <TextInput
              style={[s.input, s.textArea]}
              placeholder="Full response text..."
              placeholderTextColor={colors.textDim2}
              value={content}
              onChangeText={setContent}
              multiline
            />

            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.saveBtnText}>{editingId ? 'Update' : 'Create'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
