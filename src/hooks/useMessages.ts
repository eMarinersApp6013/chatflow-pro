// useMessages — live message list from WatermelonDB + API fetch.
// Optimistic sends write to DB first, confirm with server response.

import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { messagesCollection, database } from '../db/database';
import { chatService } from '../services/ChatwootAdapter';
import type { ChatwootSendMessagePayload } from '../types/chatwoot';
import type { MessageMode } from '../types/app';
import MessageModel from '../db/models/MessageModel';

export function useMessages(conversationRemoteId: number) {
  const [messages, setMessages] = useState<MessageModel[]>([]);

  // Live subscription — sorted oldest-first for chat display
  useEffect(() => {
    const query = messagesCollection.query(
      Q.where('conversation_remote_id', conversationRemoteId),
      Q.sortBy('created_at', Q.asc)
    );

    const subscription = query.observe().subscribe({
      next: (records) => setMessages(records as MessageModel[]),
      error: (err) => console.error('[useMessages] observe error:', err),
    });

    return () => subscription.unsubscribe();
  }, [conversationRemoteId]);

  // Fetch messages from server and write to DB
  const loadMessages = async (before?: number) => {
    try {
      const remote = await chatService.getMessages(conversationRemoteId, before);
      await database.write(async () => {
        const ops = remote.map((msg) =>
          messagesCollection.prepareCreate((record) => {
            record.remoteId = msg.id;
            record.conversationRemoteId = conversationRemoteId;
            record.conversationId = '';
            record.messageType = msg.message_type;
            record.content = msg.content ?? null;
            record.isPrivate = msg.private;
            record.status = msg.status;
            record.createdAt = msg.created_at;
            record.senderId = msg.sender?.id ?? null;
            record.senderName = msg.sender?.name ?? null;
            record.senderAvatar = msg.sender?.avatar_url ?? null;
            record.attachmentsJson = msg.attachments ? JSON.stringify(msg.attachments) : null;
            record.isPending = false;
            record.isStarred = false;
            record.replyToId = null;
          })
        );
        await database.batch(...ops);
      });
    } catch (e) {
      console.error('[useMessages] loadMessages error:', e);
    }
  };

  // Optimistic send: local write first, then server confirmation
  const sendMessage = async (content: string, mode: MessageMode) => {
    if (!content.trim()) return;

    let localId: string | null = null;
    await database.write(async () => {
      const record = await messagesCollection.create((msg) => {
        msg.remoteId = 0;
        msg.conversationRemoteId = conversationRemoteId;
        msg.conversationId = '';
        msg.messageType = 1; // outgoing
        msg.content = content;
        msg.isPrivate = mode === 'note';
        msg.status = 'sent';
        msg.createdAt = Math.floor(Date.now() / 1000);
        msg.isPending = true;
        msg.isStarred = false;
        msg.replyToId = null;
      });
      localId = record.id;
    });

    try {
      const payload: ChatwootSendMessagePayload = {
        content,
        message_type: 'outgoing',
        private: mode === 'note',
      };
      const confirmed = await chatService.sendMessage(conversationRemoteId, payload);

      if (localId) {
        await database.write(async () => {
          const record = await messagesCollection.find(localId!);
          await record.update((msg) => {
            msg.remoteId = confirmed.id;
            msg.isPending = false;
            msg.status = confirmed.status;
          });
        });
      }
    } catch {
      if (localId) {
        await database.write(async () => {
          const record = await messagesCollection.find(localId!);
          await record.update((msg) => {
            msg.status = 'failed';
            msg.isPending = false;
          });
        });
      }
    }
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationRemoteId]);

  return { messages, sendMessage, loadMore: (before: number) => loadMessages(before) };
}
