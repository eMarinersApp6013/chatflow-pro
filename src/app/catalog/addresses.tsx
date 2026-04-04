// Addresses screen — manage saved delivery addresses.

import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Trash2, Check, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/uiStore';
import { useAddresses, type AddressInput } from '../../hooks/useAddresses';
import type AddressModel from '../../db/models/AddressModel';

export default function AddressesScreen() {
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();
  const { addresses, defaultAddress, addAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<AddressInput>({
    label: 'Home',
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  const handleAdd = useCallback(async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.line1.trim() || !form.city.trim() || !form.pincode.trim()) {
      Alert.alert('Required Fields', 'Please fill Name, Phone, Address Line 1, City, and Pincode.');
      return;
    }
    await addAddress(form);
    setModalVisible(false);
    setForm({ label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
  }, [form, addAddress]);

  const handleDelete = useCallback((addr: AddressModel) => {
    Alert.alert('Delete Address', `Delete "${addr.label}" address?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAddress(addr.id) },
    ]);
  }, [deleteAddress]);

  // Suppress unused variable warning — defaultAddress used for future enhancements
  void defaultAddress;

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <View style={[s.header, { paddingTop: insets.top + 8, backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Delivery Addresses</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Plus color="#fff" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {addresses.length === 0 ? (
          <View style={s.empty}>
            <MapPin color={colors.textDim} size={48} />
            <Text style={[s.emptyTitle, { color: colors.text }]}>No addresses saved</Text>
            <Text style={[s.emptySubtitle, { color: colors.textDim }]}>
              Add a delivery address to proceed with orders.
            </Text>
            <TouchableOpacity
              style={[s.addBtn, { backgroundColor: colors.green }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={s.addBtnText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => (
            <View
              key={addr.id}
              style={[s.card, { backgroundColor: colors.surface, borderColor: addr.isDefault ? colors.green : colors.border }]}
            >
              <View style={s.cardTop}>
                <View style={[s.labelChip, { backgroundColor: colors.green + '22' }]}>
                  <Text style={[s.labelChipText, { color: colors.green }]}>{addr.label}</Text>
                </View>
                {addr.isDefault && (
                  <View style={[s.defaultChip, { backgroundColor: colors.green }]}>
                    <Text style={s.defaultChipText}>Default</Text>
                  </View>
                )}
                <View style={{ flex: 1 }} />
                {!addr.isDefault && (
                  <TouchableOpacity onPress={() => setDefaultAddress(addr.id)} style={s.iconBtn}>
                    <Check color={colors.textDim} size={16} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(addr)} style={s.iconBtn}>
                  <Trash2 color={colors.danger} size={16} />
                </TouchableOpacity>
              </View>
              <Text style={[s.addrName, { color: colors.text }]}>{addr.name}</Text>
              <Text style={[s.addrLine, { color: colors.textDim }]}>{addr.phone}</Text>
              <Text style={[s.addrLine, { color: colors.textDim }]}>
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
              </Text>
              <Text style={[s.addrLine, { color: colors.textDim }]}>
                {addr.city}, {addr.state} - {addr.pincode}
              </Text>
              <Text style={[s.addrLine, { color: colors.textDim }]}>{addr.country}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={[s.modal, { backgroundColor: colors.bg }]}>
          <View style={[s.modalHeader, { paddingTop: insets.top + 8, backgroundColor: colors.headerBg }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Add Address</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {([
              { key: 'label', placeholder: 'Label (Home, Office...)' },
              { key: 'name', placeholder: 'Full Name *' },
              { key: 'phone', placeholder: 'Phone Number *' },
              { key: 'line1', placeholder: 'Address Line 1 *' },
              { key: 'line2', placeholder: 'Address Line 2 (optional)' },
              { key: 'city', placeholder: 'City *' },
              { key: 'state', placeholder: 'State' },
              { key: 'pincode', placeholder: 'Pincode *' },
              { key: 'country', placeholder: 'Country' },
            ] as Array<{ key: keyof AddressInput; placeholder: string }>).map(({ key, placeholder }) => (
              <TextInput
                key={key}
                style={[s.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder={placeholder}
                placeholderTextColor={colors.textDim}
                value={String(form[key] ?? '')}
                onChangeText={(val) => setForm((f) => ({ ...f, [key]: val }))}
                keyboardType={key === 'phone' || key === 'pincode' ? 'phone-pad' : 'default'}
              />
            ))}
            <TouchableOpacity
              style={[s.saveBtn, { backgroundColor: colors.green }]}
              onPress={handleAdd}
            >
              <Text style={s.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingBottom: 12, paddingHorizontal: 12,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  addBtn: { borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  card: {
    borderWidth: 1, borderRadius: 12,
    padding: 14, marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  labelChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  labelChipText: { fontSize: 11, fontWeight: '700' },
  defaultChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  defaultChipText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  iconBtn: { padding: 6 },
  addrName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  addrLine: { fontSize: 13, lineHeight: 19 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingBottom: 12, paddingHorizontal: 12,
  },
  input: {
    borderRadius: 10, borderWidth: 1,
    padding: 12, fontSize: 14,
    marginBottom: 10,
  },
  saveBtn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
