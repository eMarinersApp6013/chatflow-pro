// useConversations — live conversation list from WatermelonDB + background API sync.
// Uses WatermelonDB's observe() to auto-update when DB changes.

import { useEffect, useRef, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { conversationsCollection } from '../db/database';
import { chatService } from '../services/ChatwootAdapter';
import { upsertConversations } from '../db/sync';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import ConversationModel from '../db/models/ConversationModel';
import { CONFIG } from '../constants/config';

export function useConversations() {
  const { isLoggedIn, credentials } = useAuthStore();
  const { filters } = useUIStore();
  const [conversations, setConversations] = useState<ConversationModel[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Subscribe to live DB changes — re-renders automatically when data changes
  useEffect(() => {
    // Build filter clauses — spread into query for clean TypeScript inference
    const whereClauses = [
      Q.where('status', filters.status),
      Q.where('is_archived', false),
      ...(filters.assigneeType === 'mine' && credentials?.userId
        ? [Q.where('assignee_id', credentials.userId)]
        : []),
      ...(filters.assigneeType === 'unassigned'
        ? [Q.where('assignee_id', null)]
        : []),
      ...(filters.inboxId
        ? [Q.where('inbox_id', filters.inboxId)]
        : []),
    ];
    const query = conversationsCollection.query(
      ...whereClauses,
      Q.sortBy('is_pinned', Q.desc),      // pinned conversations first
      Q.sortBy('last_activity_at', Q.desc)
    );

    const subscription = query.observe().subscribe({
      next: (records) => {
        let result = records as ConversationModel[];
        // Label filter — WatermelonDB can't query JSON arrays; filter in JS
        if (filters.labels && filters.labels.length > 0) {
          result = result.filter((c) =>
            filters.labels.some((label) => c.labels.includes(label))
          );
        }
        setConversations(result);
      },
      error: (err) => console.error('[useConversations] observe error:', err),
    });

    return () => subscription.unsubscribe();
  }, [filters.status, filters.labels, filters.assigneeType, filters.inboxId, credentials?.userId]);

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

  // Track last sync time per filter key to avoid redundant syncs on tab switches
  const lastSyncRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!isLoggedIn) return;
    const key = `${filters.status}:${filters.assigneeType ?? 'all'}`;
    const lastSync = lastSyncRef.current.get(key) ?? 0;
    const STALE_MS = 30_000; // 30 seconds
    if (Date.now() - lastSync < STALE_MS) return; // Skip — recently synced
    lastSyncRef.current.set(key, Date.now());
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, filters.status, filters.assigneeType, filters.inboxId]);

  return { conversations, isSyncing, syncError, refetch: sync };
}
