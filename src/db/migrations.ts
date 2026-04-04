// WatermelonDB schema migrations — run when the schema version is bumped.
// v1 → v2: added gallery_images to products, added addresses table.

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
  ],
});
