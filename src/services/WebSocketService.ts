// WebSocketService — ActionCable WebSocket connection to Chatwoot.
// Subscribes to RoomChannel, emits typed events, and reports connection state.

import type { ChatwootWebSocketEvent } from '../types/chatwoot';
import { WS_CHANNELS, WS_EVENTS } from '../constants/api';
import type { ConnectionState } from '../types/app';

type EventCallback = (event: ChatwootWebSocketEvent) => void;
type ConnectionCallback = (state: ConnectionState) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private connectionCallbacks: ConnectionCallback[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private _chatwootUrl = '';
  private _pubsubToken = '';

  connect(chatwootUrl: string, pubsubToken: string): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) return;

    this._chatwootUrl = chatwootUrl;
    this._pubsubToken = pubsubToken;
    this.isConnecting = true;
    this.emitConnection('connecting');

    const wsUrl =
      chatwootUrl
        .replace(/^https?:\/\//, (m) => (m === 'https://' ? 'wss://' : 'ws://'))
        .replace(/\/$/, '') + '/cable';

    try {
      this.socket = new WebSocket(wsUrl);
    } catch {
      this.isConnecting = false;
      this.emitConnection('disconnected');
      return;
    }

    this.socket.onopen = () => {
      this.isConnecting = false;
      this.emitConnection('connected');
      // Subscribe to RoomChannel with this user's pubsub token
      this.socket?.send(
        JSON.stringify({
          command: 'subscribe',
          identifier: JSON.stringify({
            channel: WS_CHANNELS.ROOM,
            pubsub_token: pubsubToken,
          }),
        })
      );
    };

    this.socket.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data as string);
        if (frame.type === 'welcome' || frame.type === 'ping') return;
        if (frame.type === 'confirm_subscription') return;
        if (frame.message) {
          const wsEvent: ChatwootWebSocketEvent = {
            type: frame.message.event ?? frame.message.type,
            data: frame.message.data ?? frame.message,
          };
          this.emit(wsEvent.type, wsEvent);
        }
      } catch {
        // Ignore malformed frames silently
      }
    };

    this.socket.onerror = () => {
      this.isConnecting = false;
    };

    this.socket.onclose = () => {
      this.isConnecting = false;
      this.emitConnection('reconnecting');
      // Reconnect every 5 seconds as per Phase 6 spec
      this.reconnectTimer = setTimeout(() => {
        this.emitConnection('connecting');
        this.connect(this._chatwootUrl, this._pubsubToken);
      }, 5000);
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    // Clear listeners to prevent handler accumulation on reconnect
    this.listeners.clear();
    this.socket?.close();
    this.socket = null;
    this.emitConnection('disconnected');
  }

  // Send typing indicator to Chatwoot so customers see the agent is typing
  sendTyping(conversationId: number, typing: boolean): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({
      command: 'message',
      identifier: JSON.stringify({ channel: WS_CHANNELS.ROOM, pubsub_token: this._pubsubToken }),
      data: JSON.stringify({
        action: typing ? WS_EVENTS.TYPING_ON : WS_EVENTS.TYPING_OFF,
        conversation_id: conversationId,
      }),
    }));
  }

  // Subscribe to a specific WS event type; returns unsubscribe fn
  on(eventType: string, callback: EventCallback): () => void {
    const list = this.listeners.get(eventType) ?? [];
    this.listeners.set(eventType, [...list, callback]);
    return () => {
      const updated = (this.listeners.get(eventType) ?? []).filter(
        (cb) => cb !== callback
      );
      this.listeners.set(eventType, updated);
    };
  }

  // Subscribe to connection state changes
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks = [...this.connectionCallbacks, callback];
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  private emit(eventType: string, event: ChatwootWebSocketEvent): void {
    (this.listeners.get(eventType) ?? []).forEach((cb) => cb(event));
  }

  private emitConnection(state: ConnectionState): void {
    this.connectionCallbacks.forEach((cb) => cb(state));
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
