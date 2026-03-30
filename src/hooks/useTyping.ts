// useTyping — manages typing indicators for a specific conversation.
// Listens to WebSocket typing_on / typing_off events and auto-clears after timeout.

import { useEffect, useRef } from 'react';
import { wsService } from '../services/WebSocketService';
import { useConnectionStore } from '../store/connectionStore';
import { WS_EVENTS } from '../constants/api';

const TYPING_TIMEOUT_MS = 5000; // Clear typing status if no update for 5s

interface TypingPayload {
  conversation_id: number;
  user: { id: number; name: string };
}

export function useTyping(conversationId: number) {
  const { setTyping, clearTyping, getTypingUsers } = useConnectionStore();
  // Map userId → clear timer
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const unsubOn = wsService.on(WS_EVENTS.TYPING_ON, (event) => {
      const payload = event.data as unknown as TypingPayload;
      if (payload?.conversation_id !== conversationId) return;
      const user = payload.user;
      if (!user) return;

      // Reset the auto-clear timer for this user
      const existing = timers.current.get(user.id);
      if (existing) clearTimeout(existing);

      setTyping(conversationId, { userId: user.id, userName: user.name });

      const timer = setTimeout(() => {
        clearTyping(conversationId, user.id);
        timers.current.delete(user.id);
      }, TYPING_TIMEOUT_MS);
      timers.current.set(user.id, timer);
    });

    const unsubOff = wsService.on(WS_EVENTS.TYPING_OFF, (event) => {
      const payload = event.data as unknown as TypingPayload;
      if (payload?.conversation_id !== conversationId) return;
      const user = payload.user;
      if (!user) return;

      const existing = timers.current.get(user.id);
      if (existing) clearTimeout(existing);
      timers.current.delete(user.id);
      clearTyping(conversationId, user.id);
    });

    return () => {
      unsubOn();
      unsubOff();
      // Clear all timers on unmount
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, [conversationId]);

  return { typingUsers: getTypingUsers(conversationId) };
}
