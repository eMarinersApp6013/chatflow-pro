import { useEffect } from 'react';
import { wsService } from '../services/WebSocketService';
import { useConnectionStore } from '../store/connectionStore';
import { WS_EVENTS } from '../constants/api';
import type { ChatwootWebSocketEvent } from '../types/chatwoot';

export function useWebSocket(
  onMessageCreated?: (event: ChatwootWebSocketEvent) => void,
  onConversationCreated?: (event: ChatwootWebSocketEvent) => void
) {
  const { setConnectionState } = useConnectionStore();

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    if (onMessageCreated) {
      unsubs.push(wsService.on(WS_EVENTS.MESSAGE_CREATED, onMessageCreated));
    }
    if (onConversationCreated) {
      unsubs.push(wsService.on(WS_EVENTS.CONVERSATION_CREATED, onConversationCreated));
    }

    return () => unsubs.forEach((fn) => fn());
  }, [onMessageCreated, onConversationCreated]);
}
