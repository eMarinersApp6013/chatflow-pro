import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import ConversationModel from './models/ConversationModel';
import MessageModel from './models/MessageModel';
import ContactModel from './models/ContactModel';
import LabelModel from './models/LabelModel';
import ProductModel from './models/ProductModel';
import CartItemModel from './models/CartItemModel';
import WishlistModel from './models/WishlistModel';

// SQLite adapter — uses JSI on native for best performance
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'chatflowpro',
  jsi: true,
  onSetUpError: (error) => {
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
