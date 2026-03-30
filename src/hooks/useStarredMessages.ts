// useStarredMessages — live query of all starred messages from WatermelonDB.
// Grouped by conversation for display on the starred screen.

import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { messagesCollection, database } from '../db/database';
import MessageModel from '../db/models/MessageModel';

export function useStarredMessages() {
  const [messages, setMessages] = useState<MessageModel[]>([]);

  useEffect(() => {
    const subscription = messagesCollection
      .query(Q.where('is_starred', true), Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe({ next: (records) => setMessages(records as MessageModel[]) });
    return () => subscription.unsubscribe();
  }, []);

  const toggleStar = async (message: MessageModel) => {
    await database.write(async () => {
      await message.update((m) => { m.isStarred = !m.isStarred; });
    });
  };

  return { messages, toggleStar };
}
