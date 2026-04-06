// connectionStore — tracks WebSocket connectivity and per-conversation typing state.
// Record<number, TypingUser[]> instead of Map — Map is not serializable in Zustand.

import { create } from 'zustand';
import type { ConnectionState } from '../types/app';

interface TypingUser {
  userId: number;
  userName: string;
}

interface ConnectionStoreState {
  connectionState: ConnectionState;
  // Record instead of Map — serializable, works with Zustand DevTools
  typingByConversation: Record<number, TypingUser[]>;

  setConnectionState: (state: ConnectionState) => void;
  setTyping: (conversationId: number, user: TypingUser) => void;
  clearTyping: (conversationId: number, userId: number) => void;
  getTypingUsers: (conversationId: number) => TypingUser[];
}

export const useConnectionStore = create<ConnectionStoreState>((set, get) => ({
  connectionState: 'disconnected',
  typingByConversation: {},

  setConnectionState: (connectionState) => set({ connectionState }),

  setTyping: (conversationId, user) => set((state) => ({
    typingByConversation: {
      ...state.typingByConversation,
      [conversationId]: [
        ...(state.typingByConversation[conversationId] ?? []).filter((u) => u.userId !== user.userId),
        user,
      ],
    },
  })),

  clearTyping: (conversationId, userId) => set((state) => ({
    typingByConversation: {
      ...state.typingByConversation,
      [conversationId]: (state.typingByConversation[conversationId] ?? []).filter(
        (u) => u.userId !== userId
      ),
    },
  })),

  getTypingUsers: (conversationId) => {
    return get().typingByConversation[conversationId] ?? [];
  },
}));
