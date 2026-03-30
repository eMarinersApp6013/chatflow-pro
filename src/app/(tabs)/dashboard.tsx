// Dashboard tab — analytics overview.
// Stat cards (Open/Pending/Resolved/Avg Response), weekly bar chart built
// from scratch with Views, agent performance list.

import { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshCw } from 'lucide-react-native';

import { useUIStore } from '../../store/uiStore';
import { useReports } from '../../hooks/useReports';
import type { ColorScheme } from '../../constants/colors';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function dayLabel(daysAgo: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return days[d.getDay()];
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  bg: string;
  borderColor: string;
}

function StatCard({ label, value, color, bg, borderColor }: StatCardProps) {
  return (
    <View style={[sc.card, { backgroundColor: bg, borderColor }]}>
      <Text style={[sc.value, { color }]}>{value}</Text>
      <Text style={[sc.label, { color: color + 'cc' }]}>{label}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    minWidth: '45%',
    alignItems: 'center',
  },
  value: { fontSize: 32, fontWeight: '800', lineHeight: 36 },
  label: { fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'center' },
});

// ─────────────────────────────────────────────────────────────
// Bar chart — built from scratch with Views
// ─────────────────────────────────────────────────────────────

interface BarChartProps {
  data: number[];      // 7 values (oldest→newest)
  colors: ColorScheme;
}

function BarChart({ data, colors }: BarChartProps) {
  const max = Math.max(...data, 1);
  const BAR_H = 100;

  return (
    <View style={bar.wrap}>
      {data.map((val, i) => {
        const daysAgo = 6 - i;
        const height = Math.round((val / max) * BAR_H);
        const isToday = daysAgo === 0;
        return (
          <View key={i} style={bar.col}>
            <Text style={[bar.count, { color: colors.textDim }]}>
              {val > 0 ? val : ''}
            </Text>
            <View style={bar.barTrack}>
              <View
                style={[
                  bar.bar,
                  {
                    height,
                    backgroundColor: isToday ? colors.green : colors.green + '55',
                    borderRadius: 4,
                  },
                ]}
              />
            </View>
            <Text style={[bar.dayLabel, { color: isToday ? colors.green : colors.textDim }]}>
              {dayLabel(daysAgo)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const bar = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingHorizontal: 4 },
  col: { flex: 1, alignItems: 'center' },
  count: { fontSize: 10, marginBottom: 3 },
  barTrack: { height: 100, justifyContent: 'flex-end', width: '100%' },
  bar: { width: '100%' },
  dayLabel: { fontSize: 11, fontWeight: '600', marginTop: 5 },
});

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();
  const { stats, isLoading, refresh } = useReports();

  const paddingTop = Platform.OS === 'ios' ? insets.top : 0;

  if (isLoading && stats.openCount === 0) {
    return (
      <View style={[s.container, { backgroundColor: colors.bg }]}>
        <View style={[s.header, { paddingTop, backgroundColor: colors.headerBg }]}>
          <Text style={s.headerTitle}>Dashboard</Text>
        </View>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  const totalMessages = stats.weeklyMessages.reduce((a, b) => a + b, 0);

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop, backgroundColor: colors.headerBg }]}>
        <Text style={s.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={refresh}>
          <RefreshCw color="rgba(255,255,255,0.8)" size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.green}
            colors={[colors.green]}
          />
        }
        contentContainerStyle={s.scroll}
      >
        {/* ── Stat cards ── */}
        <Text style={[s.sectionTitle, { color: colors.textDim }]}>Conversations</Text>
        <View style={s.cardsRow}>
          <StatCard
            label="Open"
            value={stats.openCount}
            color={colors.green}
            bg={colors.greenDim}
            borderColor={colors.green + '44'}
          />
          <StatCard
            label="Pending"
            value={stats.pendingCount}
            color={colors.orange}
            bg={colors.orange + '11'}
            borderColor={colors.orange + '44'}
          />
        </View>
        <View style={[s.cardsRow, { marginTop: 10 }]}>
          <StatCard
            label="Resolved"
            value={stats.resolvedCount}
            color={colors.blueTick}
            bg={colors.blueTick + '11'}
            borderColor={colors.blueTick + '44'}
          />
          <StatCard
            label="Avg Resolution"
            value={formatDuration(stats.avgResolutionTime)}
            color={colors.purple}
            bg={colors.purple + '11'}
            borderColor={colors.purple + '44'}
          />
        </View>

        {/* ── Weekly message chart ── */}
        <View style={[s.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.chartHeader}>
            <View>
              <Text style={[s.chartTitle, { color: colors.text }]}>Messages — Last 7 Days</Text>
              <Text style={[s.chartSub, { color: colors.textDim }]}>{totalMessages} total messages</Text>
            </View>
          </View>
          <BarChart data={stats.weeklyMessages} colors={colors} />
        </View>

        {/* ── Agent performance ── */}
        {stats.agentReports.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: colors.textDim }]}>Agent Performance</Text>
            <View style={[s.agentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Table header */}
              <View style={[s.agentRow, s.agentHeader, { borderBottomColor: colors.border }]}>
                <Text style={[s.agentHeaderCell, { color: colors.textDim2, flex: 3 }]}>Agent</Text>
                <Text style={[s.agentHeaderCell, { color: colors.textDim2 }]}>Open</Text>
                <Text style={[s.agentHeaderCell, { color: colors.textDim2 }]}>Resolved</Text>
              </View>
              {stats.agentReports.map((agent) => (
                <View
                  key={agent.id}
                  style={[s.agentRow, { borderBottomColor: colors.border }]}
                >
                  <View style={s.agentName}>
                    <Avatar name={agent.name} size={28} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[s.agentNameText, { color: colors.text }]} numberOfLines={1}>
                        {agent.name}
                      </Text>
                      <Text style={[s.agentEmail, { color: colors.textDim }]} numberOfLines={1}>
                        {agent.email}
                      </Text>
                    </View>
                  </View>
                  <Text style={[s.agentStat, { color: colors.orange }]}>
                    {agent.open_conversations_count}
                  </Text>
                  <Text style={[s.agentStat, { color: colors.green }]}>
                    {agent.resolved_conversations_count}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* No agent data notice */}
        {stats.agentReports.length === 0 && (
          <View style={[s.noDataCard, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Text style={[s.noDataText, { color: colors.textDim }]}>
              Agent performance data will appear here once your Chatwoot account has resolved conversations.
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 52,
  },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '800', color: '#ffffff' },
  refreshBtn: { padding: 6 },
  scroll: { padding: 16, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 2,
  },
  cardsRow: { flexDirection: 'row', gap: 10 },
  chartCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 15, fontWeight: '700' },
  chartSub: { fontSize: 12, marginTop: 2 },
  agentCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  agentHeader: { paddingVertical: 8 },
  agentHeaderCell: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, width: 70, textAlign: 'center' },
  agentName: { flex: 3, flexDirection: 'row', alignItems: 'center' },
  agentNameText: { fontSize: 14, fontWeight: '600' },
  agentEmail: { fontSize: 11, marginTop: 1 },
  agentStat: { width: 70, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  noDataCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
  },
  noDataText: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
