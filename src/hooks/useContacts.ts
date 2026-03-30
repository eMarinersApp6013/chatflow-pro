import { useState } from 'react';
import { chatService } from '../services/ChatwootAdapter';
import type { ChatwootContact } from '../types/chatwoot';

export function useContacts() {
  const [results, setResults] = useState<ChatwootContact[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setIsSearching(true);
    try {
      const contacts = await chatService.searchContacts(query);
      setResults(contacts);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return { results, isSearching, search };
}
