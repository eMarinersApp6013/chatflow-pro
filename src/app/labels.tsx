// Labels manager screen — lists all labels with conversation counts.
// Tapping a label filters the conversation list on the home screen.

import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ListRenderItemInfo,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Tag } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUIStore } from '../store/uiStore';
import { useLabels, LabelWithCount } from '../hooks/useLabels';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LabelsScreen() {
  const { colors, setFilters } = useUIStore();
  const insets = useSafeAreaInsets();
  const { labels, isLoading, refresh } = useLabels();

  const handleLabelPress = useCallback(
    (label: LabelWithCount) => {
      // Set the label filter on the conversation list and navigate home
      setFilters({ labels: [label.title] });
      router.push('/(tabs)/');
    },
    [setFilters]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<LabelWithCount>) => {
      const dotColor = item.color || colors.green;
      return (
        <TouchableOpacity
          style={[s.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          onPress={() => handleLabelPress(item)}
          activeOpacity={0.7}
        >
          {/* Colored dot */}
          <View style={[s.dot, { backgroundColor: dotColor }]} />

          {/* Label title */}
          <Text style={[s.label, { color: colors.text }]}>{item.title}</Text>

          {/* Conversation count badge */}
          <View style={[s.countBadge, { backgroundColor: colors.surface2 }]}>
            <Text style={[s.countText, { color: colors.textDim }]}>
              {item.count} {item.count === 1 ? 'chat' : 'chats'}
            </Text>
          </View>

          <Text style={[s.arrow, { color: colors.textDim2 }]}>›</Text>
        </TouchableOpacity>
      );
    },
    [colors, handleLabelPress]
  );

  const paddingTop = Platform.OS === 'ios' ? insets.top : 8;

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop, backgroundColor: colors.headerBg }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Labels</Text>
        <Text style={[s.headerSub, { color: 'rgba(255,255,255,0.7)' }]}>
          {labels.length} label{labels.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Helper banner */}
      <View style={[s.banner, { backgroundColor: colors.surface2, borderBottomColor: colors.border }]}>
        <Tag color={colors.textDim} size={14} />
        <Text style={[s.bannerText, { color: colors.textDim }]}>
          Tap a label to filter conversations
        </Text>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : labels.length === 0 ? (
        <EmptyState
          icon="message-circle"
          title="No labels yet"
          description="Labels are created in your Chatwoot workspace. They will appear here once synced."
        />
      ) : (
        <FlatList
          data={labels}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor={colors.green}
              colors={[colors.green]}
            />
          }
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', flex: 1 },
  headerSub: { fontSize: 13 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  bannerText: { fontSize: 13 },
  listContent: { paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: { flex: 1, fontSize: 16, fontWeight: '500' },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countText: { fontSize: 12 },
  arrow: { fontSize: 20, lineHeight: 22 },
});
