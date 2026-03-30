import { database, conversationsCollection, contactsCollection, labelsCollection, productsCollection } from './database';
import type { ChatwootConversation, ChatwootContact, ChatwootLabel } from '../types/chatwoot';
import type { Product } from '../types/catalog';
import { demoProducts } from '../data/demoProducts';

// Write conversations from Chatwoot API response into WatermelonDB
export async function syncConversations(conversations: ChatwootConversation[]): Promise<void> {
  await database.write(async () => {
    const ops = conversations.map((conv) => {
      const meta = conv.meta;
      return conversationsCollection.prepareCreate((record) => {
        record.remoteId = conv.id;
        record.inboxId = conv.inbox_id;
        record.status = conv.status;
        record.unreadCount = conv.unread_count;
        record.lastActivityAt = conv.last_activity_at;
        record.contactName = meta.sender.name ?? 'Unknown';
        record.contactAvatar = meta.sender.avatar_url ?? null;
        record.assigneeId = meta.assignee?.id ?? null;
        record.assigneeName = meta.assignee?.name ?? null;
        record.labelsJson = JSON.stringify(conv.labels ?? []);
        record.muted = conv.muted;
        record.channel = conv.channel ?? null;
        record.isStarred = false;
        record.syncedAt = Date.now();

        // Pull last message from nested payload if present
        const lastMsg = conv.messages?.[conv.messages.length - 1];
        record.lastMessageContent = lastMsg?.content ?? null;
        record.lastMessageAt = lastMsg?.created_at ?? conv.last_activity_at;
      });
    });

    await database.batch(...ops);
  });
}

// Upsert (update if exists, create if not) conversations during incremental sync
export async function upsertConversations(conversations: ChatwootConversation[]): Promise<void> {
  await database.write(async () => {
    const ops = await Promise.all(
      conversations.map(async (conv) => {
        const existing = await conversationsCollection
          .query()
          .fetch()
          .then((all) => all.find((c) => c.remoteId === conv.id));

        const meta = conv.meta;
        const lastMsg = conv.messages?.[conv.messages.length - 1];

        if (existing) {
          return existing.prepareUpdate((record) => {
            record.status = conv.status;
            record.unreadCount = conv.unread_count;
            record.lastActivityAt = conv.last_activity_at;
            record.labelsJson = JSON.stringify(conv.labels ?? []);
            record.muted = conv.muted;
            record.lastMessageContent = lastMsg?.content ?? record.lastMessageContent;
            record.lastMessageAt = lastMsg?.created_at ?? record.lastMessageAt;
            record.syncedAt = Date.now();
          });
        }

        return conversationsCollection.prepareCreate((record) => {
          record.remoteId = conv.id;
          record.inboxId = conv.inbox_id;
          record.status = conv.status;
          record.unreadCount = conv.unread_count;
          record.lastActivityAt = conv.last_activity_at;
          record.contactName = meta.sender.name ?? 'Unknown';
          record.contactAvatar = meta.sender.avatar_url ?? null;
          record.assigneeId = meta.assignee?.id ?? null;
          record.assigneeName = meta.assignee?.name ?? null;
          record.labelsJson = JSON.stringify(conv.labels ?? []);
          record.muted = conv.muted;
          record.channel = conv.channel ?? null;
          record.isStarred = false;
          record.syncedAt = Date.now();
          record.lastMessageContent = lastMsg?.content ?? null;
          record.lastMessageAt = lastMsg?.created_at ?? conv.last_activity_at;
        });
      })
    );

    await database.batch(...ops);
  });
}

// Seed local catalog with demo products (Phase 5 will fetch from server instead)
export async function seedDemoProducts(): Promise<void> {
  const existing = await productsCollection.query().fetchCount();
  if (existing > 0) return; // already seeded

  await database.write(async () => {
    const ops = demoProducts.map((p: Product) =>
      productsCollection.prepareCreate((record) => {
        record.remoteId = p.id;
        record.name = p.name;
        record.description = p.desc;
        record.price = p.price;
        record.category = p.category;
        record.emoji = p.emoji;
        record.imageUrl = p.imageUrl ?? null;
        record.stock = p.stock;
        record.rating = p.rating;
        record.reviews = p.reviews;
        record.variantsJson = JSON.stringify(p.variants);
        record.isHot = p.hot ?? false;
        record.sortOrder = 0;
      })
    );
    await database.batch(...ops);
  });
}
