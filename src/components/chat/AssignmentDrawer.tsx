// AssignmentDrawer — bottom sheet for assigning a conversation to an agent or team.
// Two tabs: Agents | Teams. Search bar filters the list. Tap to assign.

import { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Search, User, Users, X } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { useAgents } from '../../hooks/useAgents';
import type { ChatwootAgent, ChatwootTeam } from '../../types/chatwoot';

interface Props {
  visible: boolean;
  currentAssigneeId: number | null;
  onClose: () => void;
  onAssignAgent: (agent: ChatwootAgent) => void;
  onAssignTeam: (team: ChatwootTeam) => void;
}

type Tab = 'agents' | 'teams';

export default function AssignmentDrawer({
  visible,
  currentAssigneeId,
  onClose,
  onAssignAgent,
  onAssignTeam,
}: Props) {
  const { colors } = useUIStore();
  const { agents, teams, isLoading } = useAgents();
  const [tab, setTab] = useState<Tab>('agents');
  const [query, setQuery] = useState('');

  const translateY = useSharedValue(400);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 180 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(400, { duration: 200 });
      setQuery('');
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const filteredAgents = useMemo(
    () =>
      agents.filter((a) =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.email.toLowerCase().includes(query.toLowerCase())
      ),
    [agents, query]
  );

  const filteredTeams = useMemo(
    () =>
      teams.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase())
      ),
    [teams, query]
  );

  const s = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '75%',
      paddingBottom: 32,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
    closeBtn: { padding: 4 },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
    tabText: { fontSize: 13, fontWeight: '600' },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 12,
      backgroundColor: colors.surface2,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 8,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 12,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.green + '33',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: { fontSize: 14, fontWeight: '700', color: colors.green },
    info: { flex: 1 },
    name: { fontSize: 15, color: colors.text, fontWeight: '500' },
    sub: { fontSize: 12, color: colors.textDim, marginTop: 1 },
    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
    emptyText: { textAlign: 'center', color: colors.textDim, padding: 24, fontSize: 14 },
  });

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[s.overlay, overlayStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[s.sheet, sheetStyle]}>
        <View style={s.handle} />
        <View style={s.titleRow}>
          <Text style={s.title}>Assign Conversation</Text>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <X color={colors.textDim} size={20} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          {(['agents', 'teams'] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <TouchableOpacity
                key={t}
                style={[s.tab, active && { borderBottomWidth: 2, borderBottomColor: colors.green }]}
                onPress={() => setTab(t)}
              >
                {t === 'agents'
                  ? <User color={active ? colors.green : colors.textDim} size={16} />
                  : <Users color={active ? colors.green : colors.textDim} size={16} />
                }
                <Text style={[s.tabText, { color: active ? colors.green : colors.textDim }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Search color={colors.textDim} size={16} />
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={tab === 'agents' ? 'Search agents…' : 'Search teams…'}
            placeholderTextColor={colors.textDim2}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.green} style={{ padding: 24 }} />
        ) : tab === 'agents' ? (
          <FlatList
            data={filteredAgents}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.row}
                onPress={() => { onAssignAgent(item); onClose(); }}
                activeOpacity={0.7}
              >
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{item.name[0]?.toUpperCase()}</Text>
                </View>
                <View style={s.info}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.sub}>{item.email}</Text>
                </View>
                {item.id === currentAssigneeId && <View style={s.activeDot} />}
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={s.emptyText}>No agents found</Text>}
          />
        ) : (
          <FlatList
            data={filteredTeams}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.row}
                onPress={() => { onAssignTeam(item); onClose(); }}
                activeOpacity={0.7}
              >
                <View style={s.avatar}>
                  <Users color={colors.green} size={18} />
                </View>
                <View style={s.info}>
                  <Text style={s.name}>{item.name}</Text>
                  {item.description ? <Text style={s.sub}>{item.description}</Text> : null}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={s.emptyText}>No teams found</Text>}
          />
        )}
      </Animated.View>
    </Modal>
  );
}
