// useMessages — live message list from WatermelonDB + API fetch.
// Phase 6: offline queue (status='queued'), flush on reconnect, retry failed messages.
// Optimistic sends write to DB first, confirm with server response.

import { useEffect, useRef, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { messagesCollection, conversationsCollection, database } from '../db/database';
import { chatService } from '../services/ChatwootAdapter';
import { useConnectionStore } from '../store/connectionStore';
import { toast } from '../store/toastStore';
import type { ChatwootSendMessagePayload } from '../types/chatwoot';
import type { MessageMode } from '../types/app';
import MessageModel from '../db/models/MessageModel';

export function useMessages(conversationRemoteId: number) {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const { connectionState } = useConnectionStore();
  const isOnline = connectionState === 'connected';
  // Concurrency guard — prevents duplicate writes from rapid mount/unmount
  const loadingRef = useRef(false);
  // Track online ref so flush effect can read latest value
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;

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

  // Fetch messages from server and write to DB (with upsert to avoid duplicates)
  const loadMessages = async (before?: number) => {
    // Concurrency guard — prevents duplicate writes from rapid mount/navigation
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const remote = await chatService.getMessages(conversationRemoteId, before);

      await database.write(async () => {
        // Resolve local WatermelonDB conversation ID for the relational foreign key
        const convRecords = await conversationsCollection
          .query(Q.where('remote_id', conversationRemoteId))
          .fetch();
        const localConvId = convRecords[0]?.id ?? '';

        // Only check the IDs in the incoming batch — avoids loading the full message table
        const incomingIds = remote.map((m) => m.id);
        const existingRecords = await messagesCollection
          .query(Q.where('remote_id', Q.oneOf(incomingIds)))
          .fetch();
        const existingIds = new Set(existingRecords.map((m) => m.remoteId));

        const ops = remote
          .filter((msg) => !existingIds.has(msg.id)) // skip already-stored
          .map((msg) =>
            messagesCollection.prepareCreate((record) => {
              record.remoteId = msg.id;
              record.conversationRemoteId = conversationRemoteId;
              record.conversationId = localConvId; // correct FK — was '' before
              record.messageType = msg.message_type;
              record.content = msg.content ?? null;
              record.isPrivate = msg.private;
              record.status = msg.status;
              record.createdAt = msg.created_at;
              record.senderId = msg.sender?.id ?? null;
              record.senderName = msg.sender?.name ?? null;
              record.senderAvatar = msg.sender?.avatar_url ?? null;
              record.attachmentsJson = msg.attachments
                ? JSON.stringify(msg.attachments)
                : null;
              record.isPending = false;
              record.isStarred = false;
              record.replyToId = (msg as unknown as { reply_to_id?: number }).reply_to_id ?? null;
            })
          );

        if (ops.length > 0) await database.batch(...ops);
      });
    } catch {
      // Silently fail — messages will load when connection returns
    } finally {
      loadingRef.current = false;
    }
  };

  // ── Flush queued messages when connection is restored ──────────
  useEffect(() => {
    if (!isOnline) return;

    const flushQueue = async () => {
      const queued = await messagesCollection
        .query(
          Q.where('conversation_remote_id', conversationRemoteId),
          Q.where('status', 'queued')
        )
        .fetch();

      if (queued.length === 0) return;

      for (const qMsg of queued) {
        const content = qMsg.content;
        const isPrivate = qMsg.isPrivate;
        if (!content) continue;

        try {
          const payload: ChatwootSendMessagePayload = {
            content,
            message_type: 'outgoing',
            private: isPrivate,
          };
          const confirmed = await chatService.sendMessage(conversationRemoteId, payload);

          await database.write(async () => {
            await qMsg.update((m) => {
              m.remoteId = confirmed.id;
              m.status = confirmed.status;
              m.isPending = false;
            });
          });
        } catch {
          // Mark as failed if flush fails
          await database.write(async () => {
            await qMsg.update((m) => {
              m.status = 'failed';
              m.isPending = false;
            });
          });
        }
      }

      if (queued.length > 0) {
        toast.success(`${queued.length} queued message${queued.length > 1 ? 's' : ''} sent`);
      }
    };

    flushQueue();
  }, [isOnline, conversationRemoteId]);

  // ── Send message — queues if offline, sends immediately if online ──
  const sendMessage = async (content: string, mode: MessageMode, replyToId?: number) => {
    if (!content.trim()) return;

    const isCurrentlyOnline = isOnlineRef.current;
    const status = isCurrentlyOnline ? 'sent' : 'queued';

    let localId: string | null = null;

    await database.write(async () => {
      // Resolve local WatermelonDB conversation ID for the relational foreign key
      const convRecords = await conversationsCollection
        .query(Q.where('remote_id', conversationRemoteId))
        .fetch();
      const localConvId = convRecords[0]?.id ?? '';

      const record = await messagesCollection.create((msg) => {
        msg.remoteId = 0;
        msg.conversationRemoteId = conversationRemoteId;
        msg.conversationId = localConvId; // correct FK — was '' before
        msg.messageType = 1; // outgoing
        msg.content = content;
        msg.isPrivate = mode === 'note';
        msg.status = status; // 'sent' online, 'queued' offline
        msg.createdAt = Math.floor(Date.now() / 1000);
        msg.isPending = isCurrentlyOnline; // pending = awaiting server confirmation
        msg.isStarred = false;
        msg.replyToId = replyToId ?? null;
      });
      localId = record.id;
    });

    // If offline — message is queued, no API call yet
    if (!isCurrentlyOnline) {
      toast.warning('No connection — message queued and will send automatically');
      return;
    }

    // Online — send to server
    try {
      const payload: ChatwootSendMessagePayload = {
        content,
        message_type: 'outgoing',
        private: mode === 'note',
        ...(replyToId ? { reply_to_id: replyToId } : {}),
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
      toast.error('Message failed to send — tap to retry');
    }
  };

  // ── Retry a specific failed message ──────────────────────────────
  const retryMessage = async (message: MessageModel) => {
    if (!isOnlineRef.current) {
      toast.warning('Still offline — message will send automatically when connected');
      return;
    }

    const content = message.content;
    if (!content) return;

    // Mark as pending again
    await database.write(async () => {
      await message.update((m) => {
        m.status = 'sent';
        m.isPending = true;
      });
    });

    try {
      const payload: ChatwootSendMessagePayload = {
        content,
        message_type: 'outgoing',
        private: message.isPrivate,
      };
      const confirmed = await chatService.sendMessage(conversationRemoteId, payload);

      await database.write(async () => {
        await message.update((m) => {
          m.remoteId = confirmed.id;
          m.isPending = false;
          m.status = confirmed.status;
        });
      });
    } catch {
      await database.write(async () => {
        await message.update((m) => {
          m.status = 'failed';
          m.isPending = false;
        });
      });
      toast.error('Retry failed — check your connection');
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversationRemoteId]);

  return {
    messages,
    sendMessage,
    retryMessage,
    loadMore: (before: number) => loadMessages(before),
  };
}
