// Catalog domain types — our own system, independent of Chatwoot

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  stock: number;
  rating: number;
  reviews: number;
  hot?: boolean;
  variants: string[];
  desc: string;
  imageUrl?: string;
}

export interface Bundle {
  id: string;
  name: string;
  productIds: string[];
  bundlePrice: number;
  savings: number;
  emoji: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedVariant: string;
  contactId?: string; // per-conversation cart context
}

export interface WishlistItem {
  id: string;
  productId: string;
}

export interface CourierRate {
  name: string;
  days: string;
  prepaid: number;
  cod: number;
}

export interface ShippingZone {
  zone: string;
  prefix: string[];
  couriers: CourierRate[];
}

export interface ShippingResult {
  zone: string;
  couriers: CourierRate[];
  pincodeValid: boolean;
}

export type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'new' | 'best_for_me';

export interface ProductScore {
  product: Product;
  score: number;
}
