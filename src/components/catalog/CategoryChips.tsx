// CategoryChips — grid layout: 6 chips per row, max 2 rows.
// Replaced horizontal ScrollView with flexWrap View to fix the "too tall" bug.

import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useUIStore } from '../../store/uiStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
// 6 chips per row with 4px gap between each, 12px padding each side
const CHIP_WIDTH = Math.floor((SCREEN_WIDTH - 24 - 5 * 4) / 6);

interface Props {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
}

export default function CategoryChips({ categories, active, onSelect }: Props) {
  const { colors } = useUIStore();
  // Max 12 chips (2 rows × 6)
  const visible = categories.slice(0, 12);

  return (
    <View style={s.container}>
      {visible.map((cat) => {
        const isActive = cat === active;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              s.chip,
              {
                width: CHIP_WIDTH,
                backgroundColor: isActive ? colors.green : colors.surface2,
                borderColor: isActive ? colors.green : colors.border,
              },
            ]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.7}
          >
            <Text
              style={[s.chipText, { color: isActive ? '#fff' : colors.textDim }]}
              numberOfLines={1}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  chip: {
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  chipText: { fontSize: 11, fontWeight: '600' },
});
