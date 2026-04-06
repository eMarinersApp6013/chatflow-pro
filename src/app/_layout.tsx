// Root layout — sets up QueryClient, database provider, and handles auth routing.
// Phase 6: added Toast overlay for non-blocking notifications.

import { useEffect } from 'react';
import { View, AppState, AppStateStatus, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database, backfillMigrationDefaults } from '../db/database';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { CONFIG } from '../constants/config';
import ToastContainer from '../components/common/Toast';
import ErrorBoundary from '../components/common/ErrorBoundary';
import * as Notifications from 'expo-notifications';
import { wsService } from '../services/WebSocketService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CONFIG.STALE_TIME_MS,
      gcTime: CONFIG.GC_TIME_MS,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { hydrate, isLoggedIn } = useAuthStore();
  const { hydrateTheme, theme } = useUIStore();

  useEffect(() => {
    // Sequential startup: theme → auth → DB backfill. No parallel race conditions.
    const startup = async () => {
      try {
        await hydrateTheme();
        await hydrate();
        await backfillMigrationDefaults(); // one-time fix for NULL boolean columns post-migration
      } catch (e) {
        console.error('[startup]', e);
      }
    };
    startup();
  }, []);

  // Configure notification handler so foreground notifications show as banners
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  // Request push notification permissions on first launch and save token
  useEffect(() => {
    if (Platform.OS === 'web') return;
    Notifications.requestPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        // Expo SDK 52 requires projectId for getExpoPushTokenAsync
        const projectId = Constants.expoConfig?.extra?.eas?.projectId
          ?? (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;
        Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
          .then((token) => AsyncStorage.setItem('pushToken', token.data))
          .catch(() => {});
      }
    }).catch(() => {});
  }, []);

  // Deep link: tapping a push notification navigates to the conversation
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const convId = response.notification.request.content.data?.conversationId as number | undefined;
      if (convId) router.push(`/chat/${convId}`);
    });
    return () => sub.remove();
  }, []);

  // Reconnect WebSocket when app returns to foreground so chats refresh immediately
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        const store = useAuthStore.getState();
        if (store.credentials) {
          wsService.connect(store.credentials.chatwootUrl, store.credentials.pubsubToken);
        }
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider database={database}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          <ErrorBoundary>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="chat/[id]"
                options={{
                  animation: 'slide_from_right',
                  headerShown: false,
                }}
              />
              <Stack.Screen name="contact/[id]" options={{ animation: 'slide_from_right', headerShown: false }} />
              <Stack.Screen name="search" options={{ animation: 'fade', headerShown: false }} />
              <Stack.Screen name="labels" options={{ animation: 'slide_from_right', headerShown: false }} />
              <Stack.Screen name="templates" options={{ animation: 'slide_from_right', headerShown: false }} />
              <Stack.Screen name="starred" options={{ animation: 'slide_from_right', headerShown: false }} />
              <Stack.Screen name="archived" options={{ animation: 'slide_from_right', headerShown: false }} />
              <Stack.Screen name="new-conversation" options={{ animation: 'slide_from_right', headerShown: false }} />
              <Stack.Screen name="settings/canned-responses" options={{ animation: 'slide_from_right', headerShown: false }} />
              <Stack.Screen name="settings/labels" options={{ animation: 'slide_from_right', headerShown: false }} />
            </Stack>
            {/* Global toast overlay — appears above all screens */}
            <ToastContainer />
          </View>
          </ErrorBoundary>
        </QueryClientProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
