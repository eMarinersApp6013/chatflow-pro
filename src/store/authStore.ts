// authStore — manages authentication state.
// Persists credentials to expo-secure-store via AuthService.
// Configures the chatService singleton after login.

import { create } from 'zustand';
import { AuthService } from '../services/AuthService';
import { chatService } from '../services/ChatwootAdapter';
import { wsService } from '../services/WebSocketService';
import type { AuthCredentials } from '../types/app';

interface AuthState {
  credentials: AuthCredentials | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (chatwootUrl: string, apiToken: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  credentials: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    // Called on app startup — restore session from secure storage
    set({ isLoading: true });
    try {
      const creds = await AuthService.loadCredentials();
      if (creds) {
        chatService.configure(creds.chatwootUrl, creds.apiToken, creds.accountId);
        wsService.connect(creds.chatwootUrl, creds.pubsubToken);
        set({ credentials: creds, isLoggedIn: true });
      }
    } catch (e) {
      // If credentials are corrupt, clear them silently
      await AuthService.clearCredentials();
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (chatwootUrl: string, apiToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const { profile } = await chatService.login(chatwootUrl, apiToken);

      const creds: AuthCredentials = {
        chatwootUrl,
        apiToken,
        accountId: profile.account_id,
        pubsubToken: profile.pubsub_token,
        userId: profile.id,
        userName: profile.name,
        userEmail: profile.email,
        avatarUrl: profile.avatar_url,
      };

      await AuthService.saveCredentials(creds);
      wsService.connect(chatwootUrl, profile.pubsub_token);

      set({ credentials: creds, isLoggedIn: true, error: null });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Login failed. Check URL and token.';
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    wsService.disconnect();
    await AuthService.clearCredentials();
    set({ credentials: null, isLoggedIn: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
