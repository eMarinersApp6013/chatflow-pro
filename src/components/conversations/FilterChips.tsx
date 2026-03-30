import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useUIStore } from '../../store/uiStore';

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  // small = compact chips for the second filter row
  small?: boolean;
}

export default function FilterChips({ options, selected, onSelect, small = false }: Props) {
  const { colors } = useUIStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 8, gap: 6 }}
    >
      {options.map((opt) => {
        const isActive = opt.value === selected;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.chip,
              small && styles.chipSmall,
              {
                backgroundColor: isActive ? colors.green : 'transparent',
                borderColor: isActive ? colors.green : colors.border,
              },
            ]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                small && styles.chipTextSmall,
                { color: isActive ? '#ffffff' : colors.textDim },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  chipTextSmall: { fontSize: 12 },
});
