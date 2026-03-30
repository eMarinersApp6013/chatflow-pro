// CatalogService — local catalog operations.
// Full fuzzy search with typo dictionary, Best-for-Me scoring, shipping rates.

import { productsCollection, cartItemsCollection, wishlistCollection } from '../db/database';
import { Q } from '@nozbe/watermelondb';
import type { ShippingResult, SortOption } from '../types/catalog';
import type ProductModel from '../db/models/ProductModel';
import { shippingRates } from '../data/demoProducts';

// ── Typo correction dictionary ────────────────────────────────
const CORRECTIONS: Record<string, string> = {
  unifrom: 'uniform', unifrm: 'uniform', unfirm: 'uniform',
  shrit: 'shirt', shrt: 'shirt', shirrt: 'shirt',
  helmut: 'helmet', helmit: 'helmet', helmat: 'helmet',
  jackut: 'jacket', jackt: 'jacket', jaket: 'jacket',
  shooes: 'shoes', shoos: 'shoes',
  safty: 'safety', saftey: 'safety',
  captan: 'captain', captian: 'captain',
  offficer: 'officer', oficer: 'officer',
  coveral: 'coverall', coverll: 'coverall',
  tropicl: 'tropical', tropcal: 'tropical',
  epaulet: 'epaulette', epaulete: 'epaulette',
  navigaton: 'navigation', navigtion: 'navigation',
  divder: 'divider', dividr: 'divider',
  sextnt: 'sextant', sextan: 'sextant',
  boiler: 'boiler', boilr: 'boiler',
  premum: 'premium', premiun: 'premium',
  instrment: 'instrument', instrumnt: 'instrument',
  footwer: 'footwear', footware: 'footwear',
  accessory: 'accessories', accessorie: 'accessories',
};

export const CatalogService = {
  // Correct common typos — returns [correctedQuery, didCorrect]
  correctQuery(query: string): [string, boolean] {
    const lower = query.toLowerCase().trim();
    const words = lower.split(/\s+/);
    let corrected = false;
    const fixed = words.map((w) => {
      if (CORRECTIONS[w]) {
        corrected = true;
        return CORRECTIONS[w];
      }
      // Try partial match — check if word starts with any correction key
      for (const [typo, fix] of Object.entries(CORRECTIONS)) {
        if (w.length >= 3 && typo.startsWith(w.slice(0, 3)) && w.length <= typo.length + 1) {
          corrected = true;
          return fix;
        }
      }
      return w;
    });
    return [fixed.join(' '), corrected];
  },

  // Simple fuzzy match — normalises common typos + substring check
  fuzzyMatch(query: string, target: string): boolean {
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase();

    // Direct substring match
    if (t.includes(q)) return true;

    // Check individual words
    const words = q.split(/\s+/);
    return words.every((w) => t.includes(w));
  },

  // Calculate "Best for Me" score for sorting
  async getBestForMeScore(product: ProductModel): Promise<number> {
    let score = 0;

    // +2 if product is in wishlist
    const wishlisted = await wishlistCollection
      .query(Q.where('product_remote_id', product.remoteId))
      .fetchCount();
    if (wishlisted > 0) score += 2;

    // +3 if same category as items in cart
    const cartItems = await cartItemsCollection.query().fetch();
    const cartProductIds = cartItems.map((i) => i.productRemoteId);
    if (cartProductIds.length > 0) {
      const cartProducts = await productsCollection.query().fetch();
      const cartCategories = new Set(
        cartProducts.filter((p) => cartProductIds.includes(p.remoteId)).map((p) => p.category)
      );
      if (cartCategories.has(product.category)) score += 3;
    }

    // +1 if rating > 4.5
    if (product.rating > 4.5) score += 1;

    return score;
  },

  // Sort products by option
  async sortProducts(products: ProductModel[], option: SortOption): Promise<ProductModel[]> {
    const sorted = [...products];

    switch (option) {
      case 'popular':
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'new':
        // Treat lower sort_order as newer
        sorted.sort((a, b) => a.sortOrder - b.sortOrder);
        break;
      case 'best_for_me': {
        const scores = await Promise.all(
          sorted.map(async (p) => ({
            product: p,
            score: await CatalogService.getBestForMeScore(p),
          }))
        );
        scores.sort((a, b) => b.score - a.score);
        return scores.map((s) => s.product);
      }
    }

    return sorted;
  },

  // Lookup shipping rates by pincode
  getShippingRates(pincode: string): ShippingResult {
    if (!pincode || pincode.length < 2) {
      return { zone: '', couriers: [], pincodeValid: false };
    }

    const prefix = pincode.substring(0, 1);
    const zone = shippingRates.find((z) => z.prefix.includes(prefix));

    if (!zone) {
      return { zone: 'Unknown', couriers: [], pincodeValid: true };
    }

    return {
      zone: zone.zone,
      couriers: zone.couriers,
      pincodeValid: true,
    };
  },
};
