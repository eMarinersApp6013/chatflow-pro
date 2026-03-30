// useCannedResponses — searches Chatwoot canned responses for "/" autocomplete.
// Debounced to avoid hitting the API on every keystroke.

import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/ChatwootAdapter';

interface CannedResponse {
  id: number;
  short_code: string;
  content: string;
}

export function useCannedResponses(query: string, enabled: boolean) {
  const [results, setResults] = useState<CannedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !query) {
      setResults([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await chatService.getCannedResponses(query);
        setResults(data.slice(0, 8)); // cap at 8 suggestions
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, enabled]);

  return { results, isLoading };
}
