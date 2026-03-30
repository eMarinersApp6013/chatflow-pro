// useLabels — fetches labels from Chatwoot API and caches in WatermelonDB.
// Returns labels with live conversation counts from local DB.

import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { labelsCollection, conversationsCollection, database } from '../db/database';
import { chatService } from '../services/ChatwootAdapter';
import LabelModel from '../db/models/LabelModel';

export interface LabelWithCount {
  id: string;
  remoteId: number;
  title: string;
  color: string;
  count: number;
}

export function useLabels() {
  const [labels, setLabels] = useState<LabelWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live DB subscription for labels
  useEffect(() => {
    const subscription = labelsCollection
      .query(Q.sortBy('title', Q.asc))
      .observe()
      .subscribe({
        next: async (records) => {
          // For each label, count conversations that have it
          const withCounts = await Promise.all(
            (records as LabelModel[]).map(async (label) => {
              const allConvs = await conversationsCollection.query().fetch();
              const count = allConvs.filter((c) =>
                c.labels.includes(label.title)
              ).length;
              return {
                id: label.id,
                remoteId: label.remoteId,
                title: label.title,
                color: label.color,
                count,
              };
            })
          );
          setLabels(withCounts);
          setIsLoading(false);
        },
      });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch labels from API and save to local DB
  const refresh = async () => {
    try {
      const remote = await chatService.getLabels();
      await database.write(async () => {
        // Upsert each label
        const ops = await Promise.all(
          remote.map(async (rl) => {
            const existing = await labelsCollection
              .query(Q.where('remote_id', rl.id))
              .fetch();
            if (existing.length > 0) {
              return existing[0].prepareUpdate((l) => {
                l.title = rl.title;
                l.color = rl.color;
                l.description = rl.description;
                l.showOnSidebar = rl.show_on_sidebar;
              });
            }
            return labelsCollection.prepareCreate((l) => {
              l.remoteId = rl.id;
              l.title = rl.title;
              l.color = rl.color;
              l.description = rl.description;
              l.showOnSidebar = rl.show_on_sidebar;
            });
          })
        );
        await database.batch(...ops);
      });
    } catch {
      /* silently use cached data */
    }
  };

  useEffect(() => { refresh(); }, []);

  return { labels, isLoading, refresh };
}
