// Static knowledge base articles — seeded into WatermelonDB on first load.
export interface KnowledgeArticle {
  title: string;
  content: string;
  category: string;
  tags: string; // space-separated
}

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    title: 'SOLAS Safety Equipment Requirements',
    content: 'The International Convention for the Safety of Life at Sea (SOLAS) requires all vessels to carry: life jackets for every person on board, lifeboats or life rafts with capacity for all persons, fire extinguishers in all engine rooms and galley areas, smoke detectors in all cabins, and an Emergency Position Indicating Radio Beacon (EPIRB).',
    category: 'Safety',
    tags: 'solas safety equipment lifejacket lifeboat',
  },
  {
    title: 'Uniform Care Guide — Officer Whites',
    content: 'To maintain officer white uniforms: wash in cold water with mild detergent, never use bleach on gold epaulettes, hang dry in shade (direct sunlight causes yellowing), iron at medium heat with steam, store in garment bags between uses. Starch collars lightly for a crisp look.',
    category: 'Uniforms',
    tags: 'uniform care washing ironing whites officer',
  },
  {
    title: 'Bridge Equipment Checklist',
    content: 'Before departure, verify: GPS and ECDIS are operational, radar (X-band and S-band) tested, VHF radio channels 16 and 13 clear, AIS transponder transmitting, compass error checked and recorded, navigation lights tested, sound signals operational, GMDSS equipment logged.',
    category: 'Navigation',
    tags: 'bridge checklist equipment gps radar vhf navigation',
  },
  {
    title: 'Shipping Zones — India Domestic',
    content: 'India domestic shipping is divided into 4 zones: North (pincodes starting 1-2), South (pincodes 5-6), East (pincodes 7-8), West (pincodes 3-4). Delivery times: same zone 2-3 days, adjacent zone 3-5 days, cross-country 5-7 days. Metro cities often get next-day delivery with premium couriers.',
    category: 'Shipping',
    tags: 'shipping zones india domestic pincode delivery',
  },
  {
    title: 'COD vs Prepaid — Best Practices',
    content: 'Cash on Delivery (COD) orders have 15-20% higher return rates. Best practices: set a COD surcharge (₹30-50) to discourage frivolous orders, verify phone numbers via OTP before dispatch, limit COD to orders under ₹5000, offer a small discount (2-3%) for prepaid to incentivize online payment.',
    category: 'Shipping',
    tags: 'cod prepaid payment shipping returns',
  },
  {
    title: 'Product Photography Tips',
    content: 'For catalog product photos: use natural daylight or a lightbox, shoot against a white/neutral background, capture front, back, and detail shots, maintain consistent aspect ratio (4:3 recommended), compress images to under 500KB for fast mobile loading, add a scale reference for size context.',
    category: 'Catalog',
    tags: 'photography product catalog images tips',
  },
  {
    title: 'Customer Communication Templates',
    content: 'Essential message templates for customer support: Order Confirmation ("Your order #X has been placed..."), Shipping Update ("Your package is on its way via {courier}..."), Delivery Confirmation ("Your order has been delivered..."), Return Request Acknowledgment, Payment Reminder for COD.',
    category: 'Communication',
    tags: 'templates messages customer communication support',
  },
  {
    title: 'Inventory Management Basics',
    content: 'Key inventory rules: set reorder points at 20% of average monthly sales, conduct physical stock counts weekly, use FIFO (First In First Out) for perishable/seasonal items, maintain a safety stock of 10% for bestsellers, update stock in real-time after every sale to prevent overselling.',
    category: 'Catalog',
    tags: 'inventory stock management reorder restock',
  },
];

export const knowledgeCategories = ['All', 'Safety', 'Uniforms', 'Navigation', 'Shipping', 'Catalog', 'Communication'];
