// useAgents — fetches agents + teams from Chatwoot API.
// Results cached in component state; refreshed on mount.

import { useEffect, useState } from 'react';
import { chatService } from '../services/ChatwootAdapter';
import type { ChatwootAgent } from '../types/chatwoot';
import type { ChatwootTeam } from '../types/chatwoot';

export function useAgents() {
  const [agents, setAgents] = useState<ChatwootAgent[]>([]);
  const [teams, setTeams] = useState<ChatwootTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const [a, t] = await Promise.all([
        chatService.getAgents(),
        chatService.getTeams(),
      ]);
      setAgents(a);
      setTeams(t);
    } catch {
      // Use cached state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { agents, teams, isLoading, refresh };
}
