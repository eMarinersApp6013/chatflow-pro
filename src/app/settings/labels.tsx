// Labels settings screen — create, edit, delete conversation labels.
// Labels are color dots shown on conversation cards and used for filtering.

import { useState, useEffect, useCallback } from 'react';
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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { chatService } from '../../services/ChatwootAdapter';
import type { ChatwootLabel } from '../../types/chatwoot';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
  '#64748b', '#00a884',
];

export default function LabelsScreen() {
  const { colors } = useUIStore();
  const router = useRouter();

  const [labels, setLabels] = useState<ChatwootLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const loadLabels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await chatService.getLabels();
      setLabels(data);
    } catch {
      Alert.alert('Error', 'Failed to load labels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  const openAdd = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setSelectedColor(PRESET_COLORS[0]);
    setModalVisible(true);
  };

  const openEdit = (item: ChatwootLabel) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description ?? '');
    setSelectedColor(item.color);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const t = title.trim();
    if (!t) {
      Alert.alert('Validation', 'Label title is required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await chatService.updateLabel(editingId, t, selectedColor, description.trim());
        setLabels((prev) => prev.map((l) => (l.id === editingId ? updated : l)));
      } else {
        const created = await chatService.createLabel(t, selectedColor, description.trim());
        setLabels((prev) => [...prev, created]);
      }
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to save label. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: ChatwootLabel) => {
    Alert.alert(
      'Delete Label',
      `Delete label "${item.title}"? This will remove it from all conversations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteLabel(item.id);
              setLabels((prev) => prev.filter((l) => l.id !== item.id));
            } catch {
              Alert.alert('Error', 'Failed to delete label.');
            }
          },
        },
      ]
    );
  };

  const s = StyleSheet.create({
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
    dot: { width: 14, height: 14, borderRadius: 7 },
    cardBody: { flex: 1 },
    labelTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
    labelDesc: { fontSize: 12, color: colors.textDim, marginTop: 2 },
    iconBtn: { padding: 4 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { fontSize: 15, color: colors.textDim, textAlign: 'center' },
    // Modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
    fieldLabel: { fontSize: 12, color: colors.textDim2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
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
    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
    colorSwatch: { width: 32, height: 32, borderRadius: 16 },
    saveBtn: { backgroundColor: colors.green, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Labels</Text>
        <TouchableOpacity onPress={openAdd} style={s.addBtn}>
          <Plus color={colors.text} size={22} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.empty}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      ) : labels.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>No labels yet.{'\n'}Tap + to create one.</Text>
        </View>
      ) : (
        <FlatList
          data={labels}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.listContent}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={[s.dot, { backgroundColor: item.color }]} />
              <View style={s.cardBody}>
                <Text style={s.labelTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={s.labelDesc} numberOfLines={1}>{item.description}</Text>
                ) : null}
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
              <Text style={s.sheetTitle}>{editingId ? 'Edit Label' : 'New Label'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={colors.textDim} size={22} />
              </TouchableOpacity>
            </View>

            <Text style={s.fieldLabel}>Title</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. VIP Customer"
              placeholderTextColor={colors.textDim2}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={s.fieldLabel}>Description (optional)</Text>
            <TextInput
              style={s.input}
              placeholder="What this label means..."
              placeholderTextColor={colors.textDim2}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={s.fieldLabel}>Color</Text>
            <View style={s.colorRow}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    s.colorSwatch,
                    { backgroundColor: color },
                    selectedColor === color && {
                      borderWidth: 3,
                      borderColor: '#fff',
                      transform: [{ scale: 1.15 }],
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

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
