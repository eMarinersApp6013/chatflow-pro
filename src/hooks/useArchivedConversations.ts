// useArchivedConversations — live list of archived conversations.
import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { conversationsCollection } from '../db/database';
import ConversationModel from '../db/models/ConversationModel';

export function useArchivedConversations() {
  const [conversations, setConversations] = useState<ConversationModel[]>([]);

  useEffect(() => {
    const subscription = conversationsCollection
      .query(
        Q.where('is_archived', true),
        Q.sortBy('last_activity_at', Q.desc)
      )
      .observe()
      .subscribe({
        next: (records) => setConversations(records as ConversationModel[]),
        error: (err) => console.error('[useArchivedConversations] error:', err),
      });
    return () => subscription.unsubscribe();
  }, []);

  return { conversations };
}
