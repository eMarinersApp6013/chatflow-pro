// CategoryChips — horizontal scrollable category filter.

import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useUIStore } from '../../store/uiStore';

interface Props {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
}

export default function CategoryChips({ categories, active, onSelect }: Props) {
  const { colors } = useUIStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
    >
      {categories.map((cat) => {
        const isActive = cat === active;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              s.chip,
              {
                backgroundColor: isActive ? colors.green : colors.surface2,
                borderColor: isActive ? colors.green : colors.border,
              },
            ]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.7}
          >
            <Text style={[s.chipText, { color: isActive ? '#fff' : colors.textDim }]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
});
