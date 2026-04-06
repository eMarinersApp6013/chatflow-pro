import { Q } from '@nozbe/watermelondb';
import { database, conversationsCollection, productsCollection } from './database';
import type { ChatwootConversation } from '../types/chatwoot';
import type { Product } from '../types/catalog';
import { demoProducts } from '../data/demoProducts';

// Upsert (update if exists, create if not) conversations during sync.
// Reads are done BEFORE the write block — WatermelonDB does not support
// nested async reads inside database.write(). The query below fetches only
// the rows we need in one pass (O(n)) instead of fetching all rows per
// conversation (O(n²)).
export async function upsertConversations(conversations: ChatwootConversation[]): Promise<void> {
  if (conversations.length === 0) return;

  const remoteIds = conversations.map((c) => c.id);
  const now = Date.now();

  await database.write(async () => {
    // Read INSIDE the write transaction — prevents stale data from concurrent syncs
    const existingRecords = await conversationsCollection
      .query(Q.where('remote_id', Q.oneOf(remoteIds)))
      .fetch();
    const existingMap = new Map(existingRecords.map((r) => [r.remoteId, r]));

    const ops = conversations.map((conv) => {
      const existing = existingMap.get(conv.id);
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
          record.syncedAt = now;
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
        record.contactRemoteId = meta.sender.id ?? null;
        record.contactPhone = (meta.sender as Record<string, unknown>).phone_number as string ?? null;
        record.assigneeId = meta.assignee?.id ?? null;
        record.assigneeName = meta.assignee?.name ?? null;
        record.labelsJson = JSON.stringify(conv.labels ?? []);
        record.muted = conv.muted;
        record.channel = conv.channel ?? null;
        record.isStarred = false;
        record.syncedAt = now;
        record.lastMessageContent = lastMsg?.content ?? null;
        record.lastMessageAt = lastMsg?.created_at ?? conv.last_activity_at;
      });
    });

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
