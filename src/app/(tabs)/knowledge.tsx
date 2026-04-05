// Knowledge tab — searchable knowledge base with categories.
// Articles are static seed data displayed from a local array.

import { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { knowledgeArticles, knowledgeCategories, type KnowledgeArticle } from '../../data/knowledgeBase';

export default function KnowledgeScreen() {
  const { colors } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let results = knowledgeArticles;
    if (selectedCategory !== 'All') {
      results = results.filter((a) => a.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.tags.toLowerCase().includes(q)
      );
    }
    return results;
  }, [searchQuery, selectedCategory]);

  const renderArticle = ({ item, index }: { item: KnowledgeArticle; index: number }) => {
    const isExpanded = expandedIndex === index;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
        onPress={() => setExpandedIndex(isExpanded ? null : index)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category, colors) }]} />
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={isExpanded ? undefined : 2}>
              {item.title}
            </Text>
          </View>
          {isExpanded ? (
            <ChevronUp color={colors.textDim} size={18} />
          ) : (
            <ChevronDown color={colors.textDim} size={18} />
          )}
        </View>
        <Text style={[styles.categoryLabel, { color: colors.textDim2 }]}>{item.category}</Text>
        {isExpanded && (
          <Text style={[styles.content, { color: colors.textDim }]}>{item.content}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Knowledge Base</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: colors.surface }]}>
        <Search color={colors.textDim2} size={18} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search articles..."
          placeholderTextColor={colors.textDim2}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category chips */}
      <FlatList
        horizontal
        data={knowledgeCategories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        renderItem={({ item: cat }) => {
          const active = cat === selectedCategory;
          return (
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.green : colors.surface,
                  borderColor: active ? colors.green : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : colors.textDim }]}>{cat}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Articles */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BookOpen color={colors.textDim2} size={48} strokeWidth={1.2} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No articles found</Text>
          <Text style={[styles.emptyDesc, { color: colors.textDim }]}>
            Try a different search term or category.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderArticle}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

function getCategoryColor(category: string, colors: { green: string; orange: string; purple: string; blueTick: string; pink: string; danger: string }): string {
  switch (category) {
    case 'Safety': return colors.danger;
    case 'Uniforms': return colors.purple;
    case 'Navigation': return colors.blueTick;
    case 'Shipping': return colors.orange;
    case 'Catalog': return colors.green;
    case 'Communication': return colors.pink;
    default: return colors.green;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 14, paddingHorizontal: 18 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  list: { padding: 12, gap: 10, paddingBottom: 30 },
  card: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  categoryLabel: { fontSize: 11, marginTop: 4, marginLeft: 16 },
  content: { fontSize: 13, lineHeight: 20, marginTop: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyDesc: { fontSize: 13, textAlign: 'center', marginTop: 6 },
});
