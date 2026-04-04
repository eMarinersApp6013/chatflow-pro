import { useCallback, useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { cartItemsCollection, productsCollection, database } from '../db/database';
import { useCatalogStore } from '../store/catalogStore';
import CartItemModel from '../db/models/CartItemModel';

export function useCart(contactId?: string) {
  const { setCartSummary } = useCatalogStore();
  const [items, setItems] = useState<CartItemModel[]>([]);

  useEffect(() => {
    const query = cartItemsCollection.query(
      contactId ? Q.where('contact_id', contactId) : Q.where('contact_id', null)
    );
    const subscription = query.observe().subscribe({
      next: (records) => setItems(records as CartItemModel[]),
    });
    return () => subscription.unsubscribe();
  }, [contactId]);

  // Keep global cart summary store in sync
  useEffect(() => {
    let total = 0;
    Promise.all(
      items.map(async (item) => {
        const products = await productsCollection
          .query(Q.where('remote_id', item.productRemoteId))
          .fetch();
        const product = products[0];
        if (product) total += product.price * item.quantity;
      })
    ).then(() => setCartSummary(items.length, total));
  }, [items]);

  const addToCart = async (productRemoteId: string, variant?: string) => {
    const existing = items.find(
      (i) => i.productRemoteId === productRemoteId && i.selectedVariant === (variant ?? null)
    );
    if (existing) {
      await database.write(async () => {
        await existing.update((record) => { record.quantity += 1; });
      });
    } else {
      await database.write(async () => {
        await cartItemsCollection.create((record) => {
          record.productRemoteId = productRemoteId;
          record.quantity = 1;
          record.selectedVariant = variant ?? null;
          record.contactId = contactId ?? null;
          record.addedAt = Date.now();
        });
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    await database.write(async () => {
      const item = await cartItemsCollection.find(itemId);
      await item.destroyPermanently();
    });
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) { await removeFromCart(itemId); return; }
    await database.write(async () => {
      const item = await cartItemsCollection.find(itemId);
      await item.update((record) => { record.quantity = quantity; });
    });
  };

  const clearCart = useCallback(async (): Promise<void> => {
    await database.write(async () => {
      const allItems = await cartItemsCollection.query().fetch();
      for (const item of allItems) {
        await item.destroyPermanently();
      }
    });
  }, []);

  return { items, addToCart, removeFromCart, updateQuantity, clearCart };
}
