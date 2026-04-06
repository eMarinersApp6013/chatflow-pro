import { appSchema, tableSchema } from '@nozbe/watermelondb';

// WatermelonDB schema — all local tables
// Version bumps trigger migrations; always increment when changing columns.
export const schema = appSchema({
  version: 4,
  tables: [
    tableSchema({
      name: 'conversations',
      columns: [
        { name: 'remote_id', type: 'number', isIndexed: true }, // Chatwoot conversation id
        { name: 'inbox_id', type: 'number' },
        { name: 'status', type: 'string', isIndexed: true },    // open | resolved | pending | snoozed
        { name: 'unread_count', type: 'number' },
        { name: 'last_activity_at', type: 'number' },           // unix timestamp
        { name: 'contact_id', type: 'string', isOptional: true }, // local WatermelonDB id
        { name: 'contact_remote_id', type: 'number', isOptional: true }, // Chatwoot contact id (for navigation)
        { name: 'contact_name', type: 'string' },
        { name: 'contact_avatar', type: 'string', isOptional: true },
        { name: 'contact_phone', type: 'string', isOptional: true }, // for tel: link in chat header
        { name: 'assignee_id', type: 'number', isOptional: true },
        { name: 'assignee_name', type: 'string', isOptional: true },
        { name: 'labels', type: 'string' },                     // JSON array of label titles
        { name: 'last_message_content', type: 'string', isOptional: true },
        { name: 'last_message_at', type: 'number', isOptional: true },
        { name: 'muted', type: 'boolean' },
        { name: 'channel', type: 'string', isOptional: true },
        { name: 'is_starred', type: 'boolean' },
        { name: 'is_pinned', type: 'boolean' },                 // pinned to top of list
        { name: 'pin_order', type: 'number', isOptional: true }, // sort order for pinned (timestamp)
        { name: 'is_archived', type: 'boolean', isIndexed: true }, // archived (hidden from main list)
        { name: 'synced_at', type: 'number' },                  // when we last fetched from server
      ],
    }),

    tableSchema({
      name: 'messages',
      columns: [
        { name: 'remote_id', type: 'number', isIndexed: true },
        { name: 'conversation_id', type: 'string' },             // local WatermelonDB id
        { name: 'conversation_remote_id', type: 'number', isIndexed: true },
        { name: 'message_type', type: 'number' },         // 0=incoming 1=outgoing 2=activity 3=template
        { name: 'content', type: 'string', isOptional: true },
        { name: 'private', type: 'boolean' },             // private note (yellow)
        { name: 'status', type: 'string' },               // sent | delivered | read | failed
        { name: 'created_at', type: 'number' },           // unix timestamp
        { name: 'sender_id', type: 'number', isOptional: true },
        { name: 'sender_name', type: 'string', isOptional: true },
        { name: 'sender_avatar', type: 'string', isOptional: true },
        { name: 'attachments', type: 'string', isOptional: true }, // JSON
        { name: 'is_pending', type: 'boolean' },          // optimistic send in progress
        { name: 'is_starred', type: 'boolean' },
        { name: 'reply_to_id', type: 'number', isOptional: true },
        { name: 'reactions_json', type: 'string', isOptional: true }, // JSON: { "👍": 2, "❤️": 1 }
      ],
    }),

    tableSchema({
      name: 'contacts',
      columns: [
        { name: 'remote_id', type: 'number', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'phone_number', type: 'string', isOptional: true },
        { name: 'avatar_url', type: 'string', isOptional: true },
        { name: 'identifier', type: 'string', isOptional: true },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'additional_attributes', type: 'string', isOptional: true }, // JSON
        { name: 'synced_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'labels',
      columns: [
        { name: 'remote_id', type: 'number', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'color', type: 'string' },
        { name: 'show_on_sidebar', type: 'boolean' },
      ],
    }),

    tableSchema({
      name: 'products',
      columns: [
        { name: 'remote_id', type: 'string', isIndexed: true }, // 'p1', 'p2' etc from demo / server id later
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'price', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'emoji', type: 'string', isOptional: true },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'gallery_images', type: 'string', isOptional: true },  // JSON array of image URLs
        { name: 'stock', type: 'number' },
        { name: 'rating', type: 'number' },
        { name: 'reviews', type: 'number' },
        { name: 'variants', type: 'string' },             // JSON array
        { name: 'is_hot', type: 'boolean' },
        { name: 'sort_order', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'cart_items',
      columns: [
        { name: 'product_remote_id', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'selected_variant', type: 'string', isOptional: true },
        { name: 'contact_id', type: 'string', isOptional: true }, // per-conversation cart
        { name: 'added_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'wishlist_items',
      columns: [
        { name: 'product_remote_id', type: 'string' },
        { name: 'added_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'addresses',
      columns: [
        { name: 'label', type: 'string' },                // 'Home', 'Office', etc.
        { name: 'name', type: 'string' },                 // recipient name
        { name: 'phone', type: 'string' },
        { name: 'line1', type: 'string' },
        { name: 'line2', type: 'string', isOptional: true },
        { name: 'city', type: 'string' },
        { name: 'state', type: 'string' },
        { name: 'pincode', type: 'string' },
        { name: 'country', type: 'string' },
        { name: 'is_default', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'is_completed', type: 'boolean' },
        { name: 'due_date', type: 'number', isOptional: true },  // unix timestamp, optional
        { name: 'priority', type: 'string' },                    // 'low' | 'medium' | 'high'
        { name: 'created_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'orders',
      columns: [
        { name: 'order_ref', type: 'string' },                   // local reference e.g. "ORD-1234"
        { name: 'contact_name', type: 'string' },
        { name: 'conversation_remote_id', type: 'number' },
        { name: 'items_json', type: 'string' },                  // JSON snapshot of cart items
        { name: 'total', type: 'number' },
        { name: 'address_label', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },                      // placed | shipped | delivered | cancelled
        { name: 'created_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'knowledge_items',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'tags', type: 'string' },                        // space-separated tags
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
