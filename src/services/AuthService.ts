// AuthService — handles credential persistence via expo-secure-store.
// Called from authStore; never called directly from screens.

import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/config';
import type { AuthCredentials } from '../types/app';

export const AuthService = {
  async saveCredentials(creds: AuthCredentials): Promise<void> {
    await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN, creds.apiToken);
    await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.CHATWOOT_URL, creds.chatwootUrl);
    await SecureStore.setItemAsync(
      CONFIG.STORAGE_KEYS.ACCOUNT_ID,
      String(creds.accountId)
    );
    // Store the full credentials as JSON for convenience
    await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.CREDENTIALS, JSON.stringify(creds));
  },

  async loadCredentials(): Promise<AuthCredentials | null> {
    try {
      const raw = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.CREDENTIALS);
      if (!raw) return null;
      return JSON.parse(raw) as AuthCredentials;
    } catch {
      return null;
    }
  },

  async clearCredentials(): Promise<void> {
    await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.CHATWOOT_URL);
    await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.ACCOUNT_ID);
    await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.CREDENTIALS);
  },
};
