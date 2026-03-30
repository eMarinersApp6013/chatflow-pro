import { useState } from 'react';
import { upsertConversations, seedDemoProducts } from '../db/sync';
import { chatService } from '../services/ChatwootAdapter';
import { CONFIG } from '../constants/config';
import type { SyncState, ConversationFilters } from '../types/app';

export function useSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncAt: null,
    error: null,
  });

  // Perform the initial sync of 50 conversations after login
  const initialSync = async (filters: Partial<ConversationFilters> = {}) => {
    setSyncState({ isSyncing: true, lastSyncAt: null, error: null });
    try {
      const pages = Math.ceil(CONFIG.INITIAL_SYNC_COUNT / CONFIG.CONVERSATIONS_PAGE_SIZE);
      for (let page = 1; page <= pages; page++) {
        const conversations = await chatService.getConversations(filters, page);
        if (conversations.length === 0) break;
        await upsertConversations(conversations);
      }
      await seedDemoProducts();
      setSyncState({ isSyncing: false, lastSyncAt: new Date(), error: null });
    } catch (e) {
      setSyncState({
        isSyncing: false,
        lastSyncAt: null,
        error: e instanceof Error ? e.message : 'Sync failed',
      });
    }
  };

  return { syncState, initialSync };
}
