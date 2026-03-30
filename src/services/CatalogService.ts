// CatalogService — local catalog operations.
// Phase 5 will add server sync; for now works from WatermelonDB seeded with demo data.

import { productsCollection, cartItemsCollection, wishlistCollection } from '../db/database';
import { database } from '../db/database';
import type { Product, SortOption, ShippingResult } from '../types/catalog';
import { shippingRates } from '../data/demoProducts';

export const CatalogService = {
  // Calculate "Best for Me" score — weights products by cart categories + wishlist
  async getBestForMeScore(productId: string): Promise<number> {
    let score = 0;

    // +2 if in wishlist
    const wishlisted = await wishlistCollection
      .query()
      .fetch()
      .then((items) => items.some((i) => i.productRemoteId === productId));
    if (wishlisted) score += 2;

    // +1 base score for all
    score += 1;

    return score;
  },

  // Lookup shipping rates by pincode
  getShippingRates(pincode: string): ShippingResult {
    if (!pincode || pincode.length < 2) {
      return { zone: '', couriers: [], pincodeValid: false };
    }

    const prefix = pincode.substring(0, 1);
    const zone = shippingRates.find((z) =>
      z.prefix.includes(prefix)
    );

    if (!zone) {
      return { zone: 'Unknown', couriers: [], pincodeValid: true };
    }

    return {
      zone: zone.zone,
      couriers: zone.couriers,
      pincodeValid: true,
    };
  },

  // Simple fuzzy match — normalises common typos
  fuzzyMatch(query: string, target: string): boolean {
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase();

    // Direct substring match
    if (t.includes(q)) return true;

    // Check if most characters match (Levenshtein-lite: allow 1 char off per 4)
    if (q.length < 3) return false;
    const threshold = Math.floor(q.length / 4);
    let mismatches = 0;
    for (let i = 0; i < Math.min(q.length, t.length); i++) {
      if (!t.includes(q[i])) mismatches++;
      if (mismatches > threshold) return false;
    }
    return true;
  },
};
