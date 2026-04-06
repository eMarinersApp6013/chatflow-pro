// App-wide configuration constants

export const CONFIG = {
  // How many conversations to load on first login sync
  INITIAL_SYNC_COUNT: 50,

  // Polling fallback interval when WebSocket is unavailable (ms)
  POLLING_INTERVAL_MS: 5000,

  // How many messages to load per page
  MESSAGES_PAGE_SIZE: 30,

  // Conversations per page
  CONVERSATIONS_PAGE_SIZE: 25,

  // Low stock threshold for restock badge
  LOW_STOCK_THRESHOLD: 5,

  // React Query cache time
  STALE_TIME_MS: 30_000,
  GC_TIME_MS: 5 * 60_000,

  // Image compression quality (0-1)
  IMAGE_COMPRESSION_QUALITY: 0.7,
  IMAGE_MAX_WIDTH: 1024,

  // Secure storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'chatflow_auth_token',
    CHATWOOT_URL: 'chatflow_chatwoot_url',
    ACCOUNT_ID: 'chatflow_account_id',
    THEME: 'chatflow_theme',
    CREDENTIALS: 'chatflow_credentials',
  },
} as const;
