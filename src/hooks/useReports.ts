// useReports — aggregates dashboard stats from WatermelonDB (local) + Chatwoot API.
// Local DB gives instant counts; API summary fills in avg response times.

import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { conversationsCollection, messagesCollection } from '../db/database';
import { chatService } from '../services/ChatwootAdapter';
import type { ChatwootReportSummary, ChatwootAgentReport } from '../types/chatwoot';

export interface DashboardStats {
  openCount: number;
  pendingCount: number;
  resolvedCount: number;
  // Messages sent in each of the last 7 days (index 0 = oldest, 6 = today)
  weeklyMessages: number[];
  // Average resolution time in seconds (0 if not available)
  avgResolutionTime: number;
  // Agent-level data (may be empty if API unavailable)
  agentReports: ChatwootAgentReport[];
}

const EMPTY: DashboardStats = {
  openCount: 0,
  pendingCount: 0,
  resolvedCount: 0,
  weeklyMessages: [0, 0, 0, 0, 0, 0, 0],
  avgResolutionTime: 0,
  agentReports: [],
};

export function useReports() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    try {
      // ── Local counts from WatermelonDB ──────────────────────
      const [openCount, pendingCount, resolvedCount] = await Promise.all([
        conversationsCollection.query(Q.where('status', 'open')).fetchCount(),
        conversationsCollection.query(Q.where('status', 'pending')).fetchCount(),
        conversationsCollection.query(Q.where('status', 'resolved')).fetchCount(),
      ]);

      // ── Weekly message counts (last 7 days) ─────────────────
      const now = Date.now();
      const DAY = 86_400_000;
      const weeklyMessages: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = Math.floor((now - i * DAY) / 1000);
        const dayEnd = Math.floor((now - (i - 1) * DAY) / 1000);
        const count = await messagesCollection
          .query(
            Q.where('created_at', Q.gte(dayStart)),
            Q.where('created_at', Q.lt(dayEnd))
          )
          .fetchCount();
        weeklyMessages.push(count);
      }

      // ── API data ────────────────────────────────────────────
      const [summary, agentReports] = await Promise.all([
        chatService.getReportsSummary(),
        chatService.getAgentReports(),
      ]);

      setStats({
        openCount,
        pendingCount,
        resolvedCount,
        weeklyMessages,
        avgResolutionTime: summary.avg_resolution_time,
        agentReports,
      });
    } catch {
      // Keep partial data if already loaded
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { stats, isLoading, refresh };
}
