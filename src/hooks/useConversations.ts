// useConversations — live conversation list from WatermelonDB + background API sync.
// Uses WatermelonDB's observe() to auto-update when DB changes.

import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { conversationsCollection } from '../db/database';
import { chatService } from '../services/ChatwootAdapter';
import { upsertConversations } from '../db/sync';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import ConversationModel from '../db/models/ConversationModel';
import { CONFIG } from '../constants/config';

export function useConversations() {
  const { isLoggedIn } = useAuthStore();
  const { filters } = useUIStore();
  const [conversations, setConversations] = useState<ConversationModel[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Subscribe to live DB changes — re-renders automatically when data changes
  useEffect(() => {
    const query = conversationsCollection
      .query(Q.where('status', filters.status), Q.sortBy('last_activity_at', Q.desc));

    const subscription = query.observe().subscribe({
      next: (records) => setConversations(records as ConversationModel[]),
      error: (err) => console.error('[useConversations] observe error:', err),
    });

    return () => subscription.unsubscribe();
  }, [filters.status]);

  // Background sync from Chatwoot API
  const sync = async () => {
    if (!isLoggedIn || isSyncing) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const pages = Math.ceil(CONFIG.INITIAL_SYNC_COUNT / CONFIG.CONVERSATIONS_PAGE_SIZE);
      for (let page = 1; page <= pages; page++) {
        const remote = await chatService.getConversations(filters, page);
        if (remote.length === 0) break;
        await upsertConversations(remote);
      }
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, filters.status]);

  return { conversations, isSyncing, syncError, refetch: sync };
}
