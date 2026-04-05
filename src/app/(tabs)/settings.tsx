// Settings tab — Phase 4 update.
// Adds: availability toggle (Available/Busy/Offline), push notification config,
// cache size display + clear button, dark/light mode toggle, account info, server details.

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { LogOut, Moon, Sun, Server, Info, Bell, Trash2, Wifi, BarChart2, MessageSquareText, Tag, ChevronRight } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { chatService } from '../../services/ChatwootAdapter';
import Avatar from '../../components/common/Avatar';
import type { AvailabilityStatus } from '../../types/chatwoot';

// ─────────────────────────────────────────────────────────────
// Availability options
// ─────────────────────────────────────────────────────────────

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: 'online', label: 'Available', color: '#22c55e' },
  { value: 'busy', label: 'Busy', color: '#f59e0b' },
  { value: 'offline', label: 'Offline', color: '#8696a0' },
];

// ─────────────────────────────────────────────────────────────
// Cache size helper
// ─────────────────────────────────────────────────────────────

async function getCacheSizeMB(): Promise<string> {
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return '—';
    const info = await FileSystem.getInfoAsync(cacheDir, { size: true });
    if (info.exists && 'size' in info && info.size) {
      const mb = (info.size / (1024 * 1024)).toFixed(1);
      return `${mb} MB`;
    }
    return '< 1 MB';
  } catch {
    return '—';
  }
}

async function clearCache(): Promise<void> {
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return;
    const entries = await FileSystem.readDirectoryAsync(cacheDir);
    await Promise.allSettled(
      entries.map((e) => FileSystem.deleteAsync(`${cacheDir}${e}`, { idempotent: true }))
    );
  } catch {
    // Best-effort
  }
}

// ─────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useUIStore();
  const { credentials, logout } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [availability, setAvailability] = useState<AvailabilityStatus>('online');
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [cacheSize, setCacheSize] = useState('Calculating…');

  // Load cache size on mount
  useEffect(() => {
    getCacheSizeMB().then(setCacheSize);
  }, []);

  const handleAvailabilityChange = async (status: AvailabilityStatus) => {
    if (availabilityUpdating) return;
    setAvailabilityUpdating(true);
    try {
      await chatService.updateAvailability(status);
      setAvailability(status);
    } catch {
      Alert.alert('Error', 'Could not update availability. Please try again.');
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached images and files. The app will reload them as needed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            const newSize = await getCacheSizeMB();
            setCacheSize(newSize);
            Alert.alert('Done', 'Cache cleared successfully.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? Your local data will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const paddingTop = insets.top;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      paddingTop: paddingTop + 12,
      paddingBottom: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.headerBg,
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
    scroll: { flex: 1 },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.surface,
      margin: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
    },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 17, fontWeight: '600', color: colors.text },
    profileEmail: { fontSize: 13, color: colors.textDim, marginTop: 2 },
    profileUrl: { fontSize: 12, color: colors.textDim2, marginTop: 2 },
    section: { marginHorizontal: 16, marginBottom: 16 },
    sectionTitle: {
      fontSize: 12, fontWeight: '600', color: colors.textDim2,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: 8, marginLeft: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 14,
    },
    rowLast: { borderBottomWidth: 0 },
    rowLabel: { flex: 1, fontSize: 15, color: colors.text },
    rowValue: { fontSize: 14, color: colors.textDim },
    dangerRow: { borderColor: colors.danger + '44' },
    dangerText: { color: colors.danger },
    // Availability chip row
    availRow: {
      flexDirection: 'row',
      padding: 12,
      gap: 8,
    },
    availChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
    },
    availDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
    availText: { fontSize: 12, fontWeight: '600' },
    versionText: {
      textAlign: 'center', fontSize: 12,
      color: colors.textDim2, marginVertical: 24,
    },
  });

  const currentAvail = AVAILABILITY_OPTIONS.find((o) => o.value === availability)!;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        {credentials && (
          <View style={s.profileCard}>
            <Avatar name={credentials.userName} uri={credentials.avatarUrl} size={52} />
            <View style={s.profileInfo}>
              <Text style={s.profileName}>{credentials.userName}</Text>
              <Text style={s.profileEmail}>{credentials.userEmail}</Text>
              <Text style={s.profileUrl} numberOfLines={1}>{credentials.chatwootUrl}</Text>
            </View>
            {/* Availability indicator dot */}
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: currentAvail.color }} />
              <Text style={{ fontSize: 10, color: colors.textDim, marginTop: 3, fontWeight: '600' }}>
                {currentAvail.label}
              </Text>
            </View>
          </View>
        )}

        {/* Quick links */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Features</Text>
          <View style={s.card}>
            <TouchableOpacity style={s.row} onPress={() => router.push('/dashboard')} activeOpacity={0.7}>
              <BarChart2 color={colors.textDim} size={20} />
              <Text style={s.rowLabel}>Dashboard & Analytics</Text>
              <ChevronRight color={colors.textDim2} size={16} />
            </TouchableOpacity>
            <TouchableOpacity style={s.row} onPress={() => router.push('/settings/canned-responses')} activeOpacity={0.7}>
              <MessageSquareText color={colors.textDim} size={20} />
              <Text style={s.rowLabel}>Canned Responses</Text>
              <ChevronRight color={colors.textDim2} size={16} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.row, s.rowLast]} onPress={() => router.push('/settings/labels')} activeOpacity={0.7}>
              <Tag color={colors.textDim} size={20} />
              <Text style={s.rowLabel}>Labels</Text>
              <ChevronRight color={colors.textDim2} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Availability */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Availability</Text>
          <View style={s.card}>
            <View style={s.availRow}>
              {AVAILABILITY_OPTIONS.map((opt) => {
                const active = availability === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      s.availChip,
                      {
                        backgroundColor: active ? opt.color + '22' : colors.surface2,
                        borderColor: active ? opt.color : colors.border,
                        opacity: availabilityUpdating ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => handleAvailabilityChange(opt.value)}
                    disabled={availabilityUpdating}
                    activeOpacity={0.7}
                  >
                    <View style={[s.availDot, { backgroundColor: opt.color }]} />
                    <Text style={[s.availText, { color: active ? opt.color : colors.textDim }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Appearance</Text>
          <View style={s.card}>
            <View style={[s.row, s.rowLast]}>
              {theme === 'dark'
                ? <Moon color={colors.textDim} size={20} />
                : <Sun color={colors.textDim} size={20} />}
              <Text style={s.rowLabel}>Dark Mode</Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={() => toggleTheme()}
                trackColor={{ false: colors.border, true: colors.green }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Push Notifications */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notifications</Text>
          <View style={s.card}>
            <View style={[s.row, s.rowLast]}>
              <Bell color={colors.textDim} size={20} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>Push Notifications</Text>
                <Text style={{ fontSize: 12, color: colors.textDim2, marginTop: 1 }}>
                  New message alerts
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={(v) => {
                  setPushEnabled(v);
                  // FCM token registration will be handled in Phase 7 (backend)
                }}
                trackColor={{ false: colors.border, true: colors.green }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Connection */}
        {credentials && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Connection</Text>
            <View style={s.card}>
              <View style={s.row}>
                <Server color={colors.textDim} size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel} numberOfLines={1}>{credentials.chatwootUrl}</Text>
                  <Text style={{ fontSize: 12, color: colors.textDim2, marginTop: 1 }}>
                    Account #{credentials.accountId}
                  </Text>
                </View>
              </View>
              <View style={[s.row, s.rowLast]}>
                <Wifi color={colors.textDim} size={20} />
                <Text style={s.rowLabel}>Agent ID</Text>
                <Text style={s.rowValue}>#{credentials.userId}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Storage */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Storage</Text>
          <View style={s.card}>
            <View style={s.row}>
              <Info color={colors.textDim} size={20} />
              <Text style={s.rowLabel}>Cache Size</Text>
              <Text style={s.rowValue}>{cacheSize}</Text>
            </View>
            <TouchableOpacity style={[s.row, s.rowLast]} onPress={handleClearCache} activeOpacity={0.7}>
              <Trash2 color={colors.orange} size={20} />
              <Text style={[s.rowLabel, { color: colors.orange }]}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>About</Text>
          <View style={s.card}>
            <View style={[s.row, s.rowLast]}>
              <Info color={colors.textDim} size={20} />
              <Text style={s.rowLabel}>Version</Text>
              <Text style={s.rowValue}>1.0.0 (Phase 6)</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={s.section}>
          <View style={[s.card, s.dangerRow]}>
            <TouchableOpacity style={[s.row, s.rowLast]} onPress={handleLogout} activeOpacity={0.7}>
              <LogOut color={colors.danger} size={20} />
              <Text style={[s.rowLabel, s.dangerText]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.versionText}>ChatFlow Pro • nodesurge.tech</Text>
      </ScrollView>
    </View>
  );
}
