// connectionStore — tracks WebSocket connectivity and per-conversation typing state.

import { create } from 'zustand';
import type { ConnectionState } from '../types/app';

interface TypingUser {
  userId: number;
  userName: string;
}

interface ConnectionStoreState {
  connectionState: ConnectionState;
  // Map of conversationId → list of currently-typing users
  typingByConversation: Map<number, TypingUser[]>;

  setConnectionState: (state: ConnectionState) => void;
  setTyping: (conversationId: number, user: TypingUser) => void;
  clearTyping: (conversationId: number, userId: number) => void;
  getTypingUsers: (conversationId: number) => TypingUser[];
}

export const useConnectionStore = create<ConnectionStoreState>((set, get) => ({
  connectionState: 'disconnected',
  typingByConversation: new Map(),

  setConnectionState: (connectionState) => set({ connectionState }),

  setTyping: (conversationId, user) => {
    const map = new Map(get().typingByConversation);
    const existing = map.get(conversationId) ?? [];
    // Replace if same userId already present, otherwise append
    const updated = existing.filter((u) => u.userId !== user.userId);
    map.set(conversationId, [...updated, user]);
    set({ typingByConversation: map });
  },

  clearTyping: (conversationId, userId) => {
    const map = new Map(get().typingByConversation);
    const existing = map.get(conversationId) ?? [];
    map.set(conversationId, existing.filter((u) => u.userId !== userId));
    set({ typingByConversation: map });
  },

  getTypingUsers: (conversationId) => {
    return get().typingByConversation.get(conversationId) ?? [];
  },
}));
