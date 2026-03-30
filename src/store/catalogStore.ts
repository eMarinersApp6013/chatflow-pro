// catalogStore — catalog UI state: cart total, wishlist count, active category etc.

import { create } from 'zustand';
import type { SortOption } from '../types/catalog';

interface CatalogState {
  searchQuery: string;
  activeCategory: string;
  sortOption: SortOption;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;

  setSearchQuery: (q: string) => void;
  setActiveCategory: (cat: string) => void;
  setSortOption: (opt: SortOption) => void;
  setCartSummary: (count: number, total: number) => void;
  setWishlistCount: (count: number) => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  searchQuery: '',
  activeCategory: 'All',
  sortOption: 'popular',
  cartCount: 0,
  cartTotal: 0,
  wishlistCount: 0,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSortOption: (sortOption) => set({ sortOption }),
  setCartSummary: (cartCount, cartTotal) => set({ cartCount, cartTotal }),
  setWishlistCount: (wishlistCount) => set({ wishlistCount }),
}));
