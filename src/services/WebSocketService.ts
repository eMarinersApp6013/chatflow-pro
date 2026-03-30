// WebSocketService — ActionCable WebSocket connection to Chatwoot.
// Subscribes to RoomChannel and emits events for the app to react to.

import type { ChatwootWebSocketEvent } from '../types/chatwoot';
import { WS_CHANNELS, WS_EVENTS } from '../constants/api';

type EventCallback = (event: ChatwootWebSocketEvent) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private subscription: string | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;

  connect(chatwootUrl: string, pubsubToken: string): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) return;

    this.isConnecting = true;
    const wsUrl = chatwootUrl
      .replace(/^https?:\/\//, (match) => (match === 'https://' ? 'wss://' : 'ws://'))
      .replace(/\/$/, '') + '/cable';

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.isConnecting = false;
      // Subscribe to the room channel with the user's pubsub token
      const subscribeCmd = JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({
          channel: WS_CHANNELS.ROOM,
          pubsub_token: pubsubToken,
        }),
      });
      this.socket?.send(subscribeCmd);
    };

    this.socket.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data as string);

        // ActionCable welcome / ping frames
        if (frame.type === 'welcome' || frame.type === 'ping') return;

        if (frame.type === 'confirm_subscription') {
          this.subscription = frame.identifier;
          return;
        }

        if (frame.message) {
          const wsEvent: ChatwootWebSocketEvent = {
            type: frame.message.event,
            data: frame.message.data ?? frame.message,
          };
          this.emit(wsEvent.type, wsEvent);
        }
      } catch {
        // Ignore malformed frames
      }
    };

    this.socket.onerror = () => {
      this.isConnecting = false;
    };

    this.socket.onclose = () => {
      this.isConnecting = false;
      // Auto-reconnect after 3s
      this.reconnectTimer = setTimeout(() => {
        this.connect(chatwootUrl, pubsubToken);
      }, 3000);
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
    this.subscription = null;
  }

  on(eventType: string, callback: EventCallback): () => void {
    const list = this.listeners.get(eventType) ?? [];
    this.listeners.set(eventType, [...list, callback]);

    // Return unsubscribe function
    return () => {
      const updated = (this.listeners.get(eventType) ?? []).filter(
        (cb) => cb !== callback
      );
      this.listeners.set(eventType, updated);
    };
  }

  private emit(eventType: string, event: ChatwootWebSocketEvent): void {
    (this.listeners.get(eventType) ?? []).forEach((cb) => cb(event));
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
