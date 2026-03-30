import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useUIStore } from '../../store/uiStore';

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterChips({ options, selected, onSelect }: Props) {
  const { colors } = useUIStore();

  const s = StyleSheet.create({
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      marginRight: 8,
    },
    chipText: { fontSize: 13, fontWeight: '500' },
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
      {options.map((opt) => {
        const isActive = opt.value === selected;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[
              s.chip,
              {
                backgroundColor: isActive ? colors.green : colors.surface2,
                borderColor: isActive ? colors.green : colors.border,
              },
            ]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[s.chipText, { color: isActive ? '#ffffff' : colors.textDim }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
