// Settings tab — theme toggle, account info, logout

import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LogOut, Moon, Sun, User, Server, Info } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../../components/common/Avatar';

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useUIStore();
  const { credentials, logout } = useAuthStore();

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

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      paddingTop: 52,
      paddingBottom: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.headerBg,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
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
    section: { marginHorizontal: 16, marginBottom: 12 },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: colors.textDim2, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 2,
      gap: 14,
    },
    rowLabel: { flex: 1, fontSize: 15, color: colors.text },
    rowValue: { fontSize: 14, color: colors.textDim },
    dangerRow: { borderColor: colors.danger + '44', backgroundColor: '#3d1a1a' + '33' },
    dangerText: { color: colors.danger },
    versionText: { textAlign: 'center', fontSize: 12, color: colors.textDim2, marginVertical: 24 },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Settings</Text>
      </View>
      <ScrollView style={s.scroll}>
        {/* Profile */}
        {credentials && (
          <View style={s.profileCard}>
            <Avatar name={credentials.userName} uri={credentials.avatarUrl} size={52} />
            <View style={s.profileInfo}>
              <Text style={s.profileName}>{credentials.userName}</Text>
              <Text style={s.profileEmail}>{credentials.userEmail}</Text>
              <Text style={s.profileUrl} numberOfLines={1}>{credentials.chatwootUrl}</Text>
            </View>
          </View>
        )}

        {/* Appearance */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Appearance</Text>
          <View style={s.row}>
            {theme === 'dark' ? <Moon color={colors.textDim} size={20} /> : <Sun color={colors.textDim} size={20} />}
            <Text style={s.rowLabel}>Dark Mode</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={() => toggleTheme()}
              trackColor={{ false: colors.border, true: colors.green }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Connection */}
        {credentials && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Connection</Text>
            <View style={s.row}>
              <Server color={colors.textDim} size={20} />
              <Text style={s.rowLabel} numberOfLines={1}>{credentials.chatwootUrl}</Text>
            </View>
          </View>
        )}

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>About</Text>
          <View style={s.row}>
            <Info color={colors.textDim} size={20} />
            <Text style={s.rowLabel}>Version</Text>
            <Text style={s.rowValue}>1.0.0 (Phase 1)</Text>
          </View>
        </View>

        {/* Logout */}
        <View style={s.section}>
          <TouchableOpacity style={[s.row, s.dangerRow]} onPress={handleLogout} activeOpacity={0.7}>
            <LogOut color={colors.danger} size={20} />
            <Text style={[s.rowLabel, s.dangerText]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.versionText}>ChatFlow Pro • nodesurge.tech</Text>
      </ScrollView>
    </View>
  );
}
