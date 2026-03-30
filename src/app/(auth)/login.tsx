// Login screen — user enters their Chatwoot URL and API access token.
// On success, triggers initial sync and navigates to the main tabs.

import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useSync } from '../../hooks/useSync';
import { normalizeUrl } from '../../utils/formatters';

export default function LoginScreen() {
  const { colors } = useUIStore();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { initialSync } = useSync();

  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const tokenRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    clearError();
    const cleanUrl = normalizeUrl(url);
    if (!cleanUrl) { Alert.alert('Error', 'Please enter your Chatwoot URL'); return; }
    if (!token.trim()) { Alert.alert('Error', 'Please enter your API access token'); return; }

    await login(cleanUrl, token.trim());

    // If login succeeded, trigger the initial 50-conversation sync
    const { isLoggedIn } = useAuthStore.getState();
    if (isLoggedIn) {
      initialSync(); // runs in background; don't await — let user see list immediately
      router.replace('/(tabs)');
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    logoContainer: { alignItems: 'center', marginBottom: 48 },
    appName: { fontSize: 28, fontWeight: '700', color: colors.green, letterSpacing: 0.5 },
    tagline: { fontSize: 14, color: colors.textDim, marginTop: 6 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: { fontSize: 13, color: colors.textDim, marginBottom: 6, marginTop: 16 },
    input: {
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },
    inputFocused: { borderColor: colors.green },
    hint: { fontSize: 12, color: colors.textDim2, marginTop: 4 },
    button: {
      backgroundColor: colors.green,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 28,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    errorBox: {
      backgroundColor: '#3d1a1a',
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: 10,
      padding: 12,
      marginTop: 16,
    },
    errorText: { color: colors.danger, fontSize: 13, lineHeight: 18 },
    footer: { alignItems: 'center', marginTop: 32 },
    footerText: { fontSize: 13, color: colors.textDim2 },
    link: { color: colors.green },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
    stepTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 12 },
    stepRow: { flexDirection: 'row', marginBottom: 8 },
    stepNum: { color: colors.green, fontWeight: '700', width: 20 },
    stepText: { color: colors.textDim, fontSize: 13, flex: 1, lineHeight: 18 },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={s.logoContainer}>
          <Text style={s.appName}>ChatFlow Pro</Text>
          <Text style={s.tagline}>Your Chatwoot, in your pocket</Text>
        </View>

        {/* Login Card */}
        <View style={s.card}>
          <Text style={[s.label, { marginTop: 0 }]}>Chatwoot Server URL</Text>
          <TextInput
            style={s.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://app.chatwoot.com"
            placeholderTextColor={colors.textDim2}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="next"
            onSubmitEditing={() => tokenRef.current?.focus()}
          />
          <Text style={s.hint}>Enter the URL of your Chatwoot installation</Text>

          <Text style={s.label}>API Access Token</Text>
          <TextInput
            ref={tokenRef}
            style={s.input}
            value={token}
            onChangeText={setToken}
            placeholder="Paste your API access token"
            placeholderTextColor={colors.textDim2}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Text style={s.hint}>
            Settings → Profile → Access Token in Chatwoot
          </Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[s.button, isLoading && s.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.buttonText}>Connect to Chatwoot</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* How to find token */}
        <View style={[s.card, { marginTop: 20 }]}>
          <Text style={s.stepTitle}>How to get your API token</Text>
          <View style={s.stepRow}><Text style={s.stepNum}>1</Text><Text style={s.stepText}>Log in to your Chatwoot dashboard</Text></View>
          <View style={s.stepRow}><Text style={s.stepNum}>2</Text><Text style={s.stepText}>Go to Settings → Profile</Text></View>
          <View style={s.stepRow}><Text style={s.stepNum}>3</Text><Text style={s.stepText}>Scroll to "Access Token" section</Text></View>
          <View style={s.stepRow}><Text style={s.stepNum}>4</Text><Text style={s.stepText}>Copy and paste the token above</Text></View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>
            Works with any Chatwoot server •{' '}
            <Text
              style={s.link}
              onPress={() => Linking.openURL('https://www.chatwoot.com')}
            >
              Learn more
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
