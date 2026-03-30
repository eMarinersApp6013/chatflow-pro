// connectionStore — tracks WebSocket + network connectivity state.

import { create } from 'zustand';
import type { ConnectionState } from '../types/app';

interface ConnectionStoreState {
  connectionState: ConnectionState;
  setConnectionState: (state: ConnectionState) => void;
}

export const useConnectionStore = create<ConnectionStoreState>((set) => ({
  connectionState: 'disconnected',
  setConnectionState: (connectionState) => set({ connectionState }),
}));
