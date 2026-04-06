// CatalogService — local catalog operations.
// Full fuzzy search with typo dictionary, Best-for-Me scoring, shipping rates.

import { productsCollection, cartItemsCollection, wishlistCollection } from '../db/database';
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
      // Try partial match — check if any correction key starts with the typed prefix
      for (const [typo, fix] of Object.entries(CORRECTIONS)) {
        if (w.length >= 3 && w.startsWith(typo.slice(0, 3)) && w.length <= typo.length + 1) {
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
        // Prefetch ALL data once — avoids 3 DB queries per product (N+1)
        const [wishlistItems, cartItems, allProducts] = await Promise.all([
          wishlistCollection.query().fetch(),
          cartItemsCollection.query().fetch(),
          productsCollection.query().fetch(),
        ]);
        const wishedIds = new Set(wishlistItems.map((w) => w.productRemoteId));
        const cartProductIds = new Set(cartItems.map((ci) => ci.productRemoteId));
        const cartCategories = new Set(
          allProducts.filter((p) => cartProductIds.has(p.remoteId)).map((p) => p.category)
        );
        const scores = sorted.map((p) => ({
          product: p,
          score: (wishedIds.has(p.remoteId) ? 2 : 0)
               + (cartCategories.has(p.category) ? 3 : 0)
               + (p.rating > 4.5 ? 1 : 0),
        }));
        scores.sort((a, b) => b.score - a.score);
        return scores.map((s) => s.product);
      }
    }

    return sorted;
  },

  // Lookup shipping rates by pincode (uses first 2 digits for zone detection in India)
  getShippingRates(pincode: string): ShippingResult {
    if (!pincode || pincode.length !== 6) {
      return { zone: '', couriers: [], pincodeValid: false };
    }

    // Use first 2 digits — first digit alone can't distinguish zones in India
    const zone = shippingRates.find((z) => z.prefix.some((p) => pincode.startsWith(p)));

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
