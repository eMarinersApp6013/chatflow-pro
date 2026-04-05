// WatermelonDB schema migrations — run when the schema version is bumped.
// v1 → v2: added gallery_images to products, added addresses table.
// v2 → v3: added is_pinned/pin_order/is_archived to conversations, reactions_json to messages,
//           added tasks, orders, knowledge_items tables.

import { addColumns, createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'products',
          columns: [
            { name: 'gallery_images', type: 'string', isOptional: true },
          ],
        }),
        createTable({
          name: 'addresses',
          columns: [
            { name: 'label', type: 'string' },
            { name: 'name', type: 'string' },
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
      ],
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'conversations',
          columns: [
            { name: 'is_pinned', type: 'boolean' },
            { name: 'pin_order', type: 'number', isOptional: true },
            { name: 'is_archived', type: 'boolean' },
          ],
        }),
        addColumns({
          table: 'messages',
          columns: [
            { name: 'reactions_json', type: 'string', isOptional: true },
          ],
        }),
        createTable({
          name: 'tasks',
          columns: [
            { name: 'title', type: 'string' },
            { name: 'is_completed', type: 'boolean' },
            { name: 'due_date', type: 'number', isOptional: true },
            { name: 'priority', type: 'string' },
            { name: 'created_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'orders',
          columns: [
            { name: 'order_ref', type: 'string' },
            { name: 'contact_name', type: 'string' },
            { name: 'conversation_remote_id', type: 'number' },
            { name: 'items_json', type: 'string' },
            { name: 'total', type: 'number' },
            { name: 'address_label', type: 'string', isOptional: true },
            { name: 'status', type: 'string' },
            { name: 'created_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'knowledge_items',
          columns: [
            { name: 'title', type: 'string' },
            { name: 'content', type: 'string' },
            { name: 'category', type: 'string' },
            { name: 'tags', type: 'string' },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
  ],
});
