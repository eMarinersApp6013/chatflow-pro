// Root layout — sets up QueryClient, database provider, and handles auth routing.

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database } from '../db/database';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { CONFIG } from '../constants/config';

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
    // Restore auth session and theme preference on cold start
    hydrateTheme();
    hydrate();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider database={database}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
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
          </Stack>
        </QueryClientProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
