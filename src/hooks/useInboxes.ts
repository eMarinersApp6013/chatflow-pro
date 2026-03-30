// useInboxes — fetches all inboxes for the connected Chatwoot account.
// Used for inbox filter chips in the conversation list.

import { useEffect, useState } from 'react';
import { chatService } from '../services/ChatwootAdapter';
import type { ChatwootInbox } from '../types/chatwoot';

export function useInboxes() {
  const [inboxes, setInboxes] = useState<ChatwootInbox[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await chatService.getInboxes();
      setInboxes(data);
    } catch {
      // Keep cached state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { inboxes, isLoading, refresh };
}
