import { Database } from '@nozbe/watermelondb';
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
