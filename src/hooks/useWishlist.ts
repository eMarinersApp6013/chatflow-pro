import { useEffect, useState } from 'react';
import { wishlistCollection, database } from '../db/database';
import { useCatalogStore } from '../store/catalogStore';
import WishlistModel from '../db/models/WishlistModel';

export function useWishlist() {
  const { setWishlistCount } = useCatalogStore();
  const [items, setItems] = useState<WishlistModel[]>([]);

  useEffect(() => {
    const subscription = wishlistCollection.query().observe().subscribe({
      next: (records) => setItems(records as WishlistModel[]),
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setWishlistCount(items.length);
  }, [items.length]);

  const toggle = async (productRemoteId: string) => {
    const existing = items.find((i) => i.productRemoteId === productRemoteId);
    if (existing) {
      await database.write(async () => {
        await existing.destroyPermanently();
      });
    } else {
      await database.write(async () => {
        await wishlistCollection.create((record) => {
          record.productRemoteId = productRemoteId;
          record.addedAt = Date.now();
        });
      });
    }
  };

  const isWishlisted = (productRemoteId: string): boolean =>
    items.some((i) => i.productRemoteId === productRemoteId);

  return { items, toggle, isWishlisted };
}
