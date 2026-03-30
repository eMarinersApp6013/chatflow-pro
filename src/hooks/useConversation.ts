// useConversation — fetches a single conversation by its Chatwoot id.
// Reads from WatermelonDB first (instant), then refreshes from API.

import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { conversationsCollection } from '../db/database';
import { chatService } from '../services/ChatwootAdapter';
import { upsertConversations } from '../db/sync';
import ConversationModel from '../db/models/ConversationModel';

export function useConversation(remoteId: number) {
  const [conversation, setConversation] = useState<ConversationModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Live DB subscription for this specific conversation
  useEffect(() => {
    if (!remoteId) return;
    const query = conversationsCollection.query(Q.where('remote_id', remoteId));
    const subscription = query.observe().subscribe({
      next: (records) => {
        setConversation((records[0] as ConversationModel) ?? null);
        setIsLoading(false);
      },
    });
    return () => subscription.unsubscribe();
  }, [remoteId]);

  // Refresh from API in background
  useEffect(() => {
    if (!remoteId) return;
    chatService
      .getConversation(remoteId)
      .then((remote) => upsertConversations([remote]))
      .catch(() => {
        /* silently use cached data */
      });
  }, [remoteId]);

  return { conversation, isLoading };
}
