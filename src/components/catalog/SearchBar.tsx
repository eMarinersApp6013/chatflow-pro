// SearchBar — search input with voice 🎤 and camera 📷 buttons.
// Features ② AI Fuzzy Search, ③ Voice Search, ⑧ Photo Search triggers.

import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Search, Mic, Camera, X } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

interface Props {
  value: string;
  correctedQuery: string | null;
  onChange: (q: string) => void;
  onVoicePress: () => void;
  onCameraPress: () => void;
}

export default function SearchBar({ value, correctedQuery, onChange, onVoicePress, onCameraPress }: Props) {
  const { colors } = useUIStore();

  return (
    <View style={[s.wrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={[s.inputRow, { backgroundColor: colors.surface2 }]}>
        <Search color={colors.textDim} size={16} />
        <TextInput
          style={[s.input, { color: colors.text }]}
          value={value}
          onChangeText={onChange}
          placeholder="Search products…"
          placeholderTextColor={colors.textDim2}
          returnKeyType="search"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X color={colors.textDim} size={16} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onVoicePress} style={s.iconBtn}>
          <Mic color={colors.green} size={18} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCameraPress} style={s.iconBtn}>
          <Camera color={colors.purple} size={18} />
        </TouchableOpacity>
      </View>

      {/* ② Fuzzy correction banner */}
      {correctedQuery && (
        <TouchableOpacity
          style={[s.correctionBanner, { backgroundColor: colors.green + '11' }]}
          onPress={() => onChange(correctedQuery)}
          activeOpacity={0.7}
        >
          <Text style={[s.correctionText, { color: colors.green }]}>
            🤖 Did you mean: <Text style={s.correctionBold}>{correctedQuery}</Text>?
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { borderBottomWidth: 1 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 0 },
  iconBtn: { padding: 4 },
  correctionBanner: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  correctionText: { fontSize: 13 },
  correctionBold: { fontWeight: '700' },
});
