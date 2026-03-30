// App-level types shared across screens and components

export type Theme = 'dark' | 'light';

export interface AuthCredentials {
  chatwootUrl: string;
  apiToken: string;
  accountId: number;
  pubsubToken: string;
  userId: number;
  userName: string;
  userEmail: string;
  avatarUrl: string;
}

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface SyncState {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  error: string | null;
}

export type FilterTab = 'all' | 'mine' | 'unassigned';
export type StatusFilter = 'open' | 'resolved' | 'pending';

export interface ConversationFilters {
  status: StatusFilter;
  assigneeType: FilterTab;
  labels: string[];
  inboxId?: number;
}

export interface ReplyContext {
  messageId: number;
  content: string;
  senderName: string;
}

export type MessageMode = 'reply' | 'note';

// Navigation param types for expo-router
export interface ChatScreenParams {
  id: string;
}

export interface ContactScreenParams {
  id: string;
}
