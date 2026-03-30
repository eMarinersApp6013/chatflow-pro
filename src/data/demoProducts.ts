import type { Product, Bundle, ShippingZone } from '../types/catalog';

export const demoProducts: Product[] = [
  { id: 'p1', name: 'Navy Officer Uniform Set', price: 2499, category: 'Uniforms', emoji: '🎖️', stock: 8, rating: 4.9, reviews: 342, hot: true, variants: ['S', 'M', 'L', 'XL', 'XXL'], desc: 'Complete officer uniform: shirt, trousers, tie.' },
  { id: 'p2', name: 'Boiler Suit Coverall', price: 1800, category: 'Uniforms', emoji: '🦺', stock: 20, rating: 4.4, reviews: 112, variants: ['S', 'M', 'L', 'XL'], desc: 'Engine room coverall. Fire-retardant.' },
  { id: 'p3', name: 'Tropical White Uniform', price: 1950, category: 'Uniforms', emoji: '👔', stock: 3, rating: 4.7, reviews: 89, variants: ['S', 'M', 'L'], desc: 'Lightweight cotton for warm ports.' },
  { id: 'p4', name: 'Safety Helmet SOLAS', price: 1200, category: 'Safety', emoji: '⛑️', stock: 15, rating: 4.5, reviews: 98, variants: ['White', 'Yellow', 'Red'], desc: 'SOLAS approved. UV resistant.' },
  { id: 'p5', name: 'Life Jacket SOLAS', price: 2200, category: 'Safety', emoji: '🦺', stock: 0, rating: 4.9, reviews: 312, variants: ['Universal'], desc: '150N buoyancy. Auto inflation.' },
  { id: 'p6', name: '2nd Officer Epaulette', price: 450, category: 'Accessories', emoji: '⭐', stock: 25, rating: 4.8, reviews: 189, variants: ['Gold', 'Silver'], desc: 'Gold bullion wire. Clip-on.' },
  { id: 'p7', name: 'Captain Peak Cap', price: 650, category: 'Accessories', emoji: '🧢', stock: 12, rating: 4.7, reviews: 156, variants: ['Black', 'White', 'Navy'], desc: 'Gold embroidered badge.' },
  { id: 'p8', name: 'Navigation Divider Set', price: 750, category: 'Accessories', emoji: '📐', stock: 18, rating: 4.7, reviews: 89, variants: ['Standard', 'Professional'], desc: 'Brass dividers. Velvet box.' },
  { id: 'p9', name: 'Deck Shoes Premium', price: 3200, category: 'Footwear', emoji: '👞', stock: 4, rating: 4.8, reviews: 167, variants: ['Black 8', 'Black 9', 'Brown 10'], desc: 'Non-slip sole. Full leather.' },
  { id: 'p10', name: 'Sextant Training Model', price: 4500, category: 'Instruments', emoji: '🔭', stock: 2, rating: 4.3, reviews: 45, variants: ['Standard'], desc: 'Training grade with wooden case.' },
];

export const demoBundles: Bundle[] = [
  { id: 'b1', name: '2nd Officer Starter Pack', productIds: ['p1', 'p6', 'p7'], bundlePrice: 3399, savings: 200, emoji: '🎁' },
  { id: 'b2', name: 'Safety Essentials Kit', productIds: ['p4', 'p5'], bundlePrice: 3100, savings: 300, emoji: '⛑️' },
];

export const categories: string[] = ['All', 'Uniforms', 'Safety', 'Accessories', 'Footwear', 'Instruments'];

export const shippingRates: ShippingZone[] = [
  { zone: 'North', prefix: ['1', '2'], couriers: [{ name: 'Shiprocket', days: '3-4', prepaid: 85, cod: 125 }, { name: 'Delhivery', days: '4-5', prepaid: 70, cod: 110 }] },
  { zone: 'South', prefix: ['5', '6'], couriers: [{ name: 'Shiprocket', days: '4-5', prepaid: 99, cod: 140 }, { name: 'Delhivery', days: '5-6', prepaid: 85, cod: 130 }] },
  { zone: 'East', prefix: ['7', '8'], couriers: [{ name: 'Shiprocket', days: '4-5', prepaid: 105, cod: 150 }, { name: 'DTDC', days: '5-7', prepaid: 90, cod: 135 }] },
  { zone: 'West', prefix: ['3', '4'], couriers: [{ name: 'Shiprocket', days: '3-4', prepaid: 90, cod: 130 }, { name: 'Delhivery', days: '4-5', prepaid: 75, cod: 120 }] },
];
