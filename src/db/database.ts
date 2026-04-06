import { Database, Q } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { migrations } from './migrations';
import ConversationModel from './models/ConversationModel';
import MessageModel from './models/MessageModel';
import ContactModel from './models/ContactModel';
import LabelModel from './models/LabelModel';
import ProductModel from './models/ProductModel';
import CartItemModel from './models/CartItemModel';
import WishlistModel from './models/WishlistModel';
import AddressModel from './models/AddressModel';
import TaskModel from './models/TaskModel';
import OrderModel from './models/OrderModel';
import KnowledgeItemModel from './models/KnowledgeItemModel';

// SQLite adapter.
// jsi: false — JSI mode requires extra C++ native setup not available in
// expo-managed builds. Bridge mode works reliably across all configurations.
// newArchEnabled must be false in app.json (android section) because
// WatermelonDB 0.28 is incompatible with React Native New Architecture.
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'chatflowpro',
  jsi: false,
  onSetUpError: (error) => {
    // Called if the SQLite file can't be opened/created.
    // Logging is the best we can do here; the app will show an error
    // via DatabaseProvider's onError prop in _layout.tsx.
    console.error('[DB] Setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    ConversationModel,
    MessageModel,
    ContactModel,
    LabelModel,
    ProductModel,
    CartItemModel,
    WishlistModel,
    AddressModel,
    TaskModel,
    OrderModel,
    KnowledgeItemModel,
  ],
});

// Convenience collection references
export const conversationsCollection =
  database.get<ConversationModel>('conversations');
export const messagesCollection =
  database.get<MessageModel>('messages');
export const contactsCollection =
  database.get<ContactModel>('contacts');
export const labelsCollection =
  database.get<LabelModel>('labels');
export const productsCollection =
  database.get<ProductModel>('products');
export const cartItemsCollection =
  database.get<CartItemModel>('cart_items');
export const wishlistCollection =
  database.get<WishlistModel>('wishlist_items');
export const addressesCollection =
  database.get<AddressModel>('addresses');
export const tasksCollection = database.get<TaskModel>('tasks');
export const ordersCollection = database.get<OrderModel>('orders');
export const knowledgeCollection = database.get<KnowledgeItemModel>('knowledge_items');

// One-time backfill: rows created before v3 migration have NULL for is_pinned/is_archived.
// Q.where('is_archived', false) skips NULL rows → Chats tab appears empty after upgrade.
export async function backfillMigrationDefaults(): Promise<void> {
  try {
    // Fetch conversations where is_archived is not strictly false (catches NULL rows)
    const convs = await conversationsCollection
      .query(Q.where('is_archived', Q.notEq(false)))
      .fetch();
    if (convs.length === 0) return;
    const nullRows = convs.filter(
      (c) => (c as ConversationModel & { _raw: Record<string, unknown> })._raw.is_archived == null
         || (c as ConversationModel & { _raw: Record<string, unknown> })._raw.is_pinned == null
    );
    if (nullRows.length === 0) return;
    await database.write(async () => {
      const ops = nullRows.map((c) =>
        c.prepareUpdate((r) => {
          if (r.isArchived == null) r.isArchived = false;
          if (r.isPinned == null) r.isPinned = false;
        })
      );
      await database.batch(...ops);
    });
  } catch (e) {
    console.error('[DB] backfillMigrationDefaults failed:', e);
  }
}
