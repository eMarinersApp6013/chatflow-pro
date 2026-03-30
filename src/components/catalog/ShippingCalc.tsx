// ShippingCalc — ⑩ Pincode entry + zone-based shipping rates display.

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Truck, Lightbulb } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { CatalogService } from '../../services/CatalogService';
import type { ShippingResult } from '../../types/catalog';

export default function ShippingCalc() {
  const { colors } = useUIStore();
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<ShippingResult | null>(null);

  const handleCheck = () => {
    const r = CatalogService.getShippingRates(pincode.trim());
    setResult(r);
  };

  return (
    <View style={[s.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={s.header}>
        <Truck color={colors.green} size={18} />
        <Text style={[s.title, { color: colors.text }]}>Shipping Calculator</Text>
      </View>

      <View style={s.inputRow}>
        <TextInput
          style={[s.input, { backgroundColor: colors.surface2, color: colors.text, borderColor: colors.border }]}
          value={pincode}
          onChangeText={setPincode}
          placeholder="Enter pincode"
          placeholderTextColor={colors.textDim2}
          keyboardType="number-pad"
          maxLength={6}
        />
        <TouchableOpacity
          style={[s.checkBtn, { backgroundColor: colors.green }]}
          onPress={handleCheck}
          activeOpacity={0.7}
        >
          <Text style={s.checkBtnText}>Check</Text>
        </TouchableOpacity>
      </View>

      {result && !result.pincodeValid && (
        <Text style={[s.error, { color: colors.danger }]}>Enter a valid 6-digit pincode</Text>
      )}

      {result && result.pincodeValid && result.couriers.length > 0 && (
        <View style={s.results}>
          <Text style={[s.zone, { color: colors.textDim }]}>Zone: {result.zone}</Text>

          {result.couriers.map((c) => (
            <View
              key={c.name}
              style={[s.courierRow, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <View style={s.courierInfo}>
                <Text style={[s.courierName, { color: colors.text }]}>{c.name}</Text>
                <Text style={[s.courierDays, { color: colors.textDim }]}>{c.days} days</Text>
              </View>
              <View style={s.priceCol}>
                <Text style={[s.priceLabel, { color: colors.textDim2 }]}>Prepaid</Text>
                <Text style={[s.priceValue, { color: colors.green }]}>₹{c.prepaid}</Text>
              </View>
              <View style={s.priceCol}>
                <Text style={[s.priceLabel, { color: colors.textDim2 }]}>COD</Text>
                <Text style={[s.priceValue, { color: colors.orange }]}>₹{c.cod}</Text>
              </View>
            </View>
          ))}

          {/* Prepaid tip */}
          <View style={[s.tip, { backgroundColor: colors.green + '11' }]}>
            <Lightbulb color={colors.green} size={14} />
            <Text style={[s.tipText, { color: colors.green }]}>
              💡 Save by choosing Prepaid! Up to ₹{Math.max(...result.couriers.map((c) => c.cod - c.prepaid))} cheaper.
            </Text>
          </View>
        </View>
      )}

      {result && result.pincodeValid && result.couriers.length === 0 && (
        <Text style={[s.noService, { color: colors.textDim }]}>
          Delivery not available for this pincode yet.
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { borderRadius: 14, borderWidth: 1, padding: 14, margin: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  title: { fontSize: 15, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15, borderWidth: 1,
  },
  checkBtn: { borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center' },
  checkBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  error: { fontSize: 13, marginTop: 8 },
  results: { marginTop: 12, gap: 8 },
  zone: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  courierInfo: { flex: 1 },
  courierName: { fontSize: 14, fontWeight: '700' },
  courierDays: { fontSize: 12, marginTop: 1 },
  priceCol: { width: 70, alignItems: 'center' },
  priceLabel: { fontSize: 10, fontWeight: '600' },
  priceValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, padding: 10, marginTop: 4 },
  tipText: { fontSize: 12, fontWeight: '600', flex: 1 },
  noService: { fontSize: 13, marginTop: 8, textAlign: 'center' },
});
