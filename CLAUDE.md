# CLAUDE.md — ChatFlow Pro Mobile App
# Fresh project. One goal: Build the mobile app.
# Last updated: March 30, 2026

---

## WHAT IS THIS PROJECT

ChatFlow Pro is a **mobile app** (Android + iOS) that looks and feels like WhatsApp Business. It connects to any Chatwoot server via API. The user enters their Chatwoot URL and API token — the app pulls all conversations, contacts, messages and displays them in a WhatsApp-style interface.

**This project is ONLY the mobile app. Nothing else.**
- No web admin panel
- No separate backend server
- No WhatsApp Cloud API direct integration (that's later)
- Just the React Native mobile app that talks to Chatwoot

---

## TECH STACK

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native + Expo | SDK 52+ |
| Language | TypeScript | Strict mode |
| Navigation | Expo Router | v4 |
| Local Database | WatermelonDB | Latest |
| State | Zustand | Latest |
| Server State | TanStack React Query | v5 |
| Animations | React Native Reanimated 3 | Latest |
| Gestures | React Native Gesture Handler | Latest |
| WebSocket | @rails/actioncable | Latest |
| Secure Storage | expo-secure-store | Latest |
| Images | expo-image | Latest |
| Icons | lucide-react-native | Latest |

---

## FOLDER STRUCTURE

```
chatflow-pro/
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── CLAUDE.md
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── (auth)/
│   │   │   └── login.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             ← Chats tab
│   │   │   ├── dashboard.tsx         ← Analytics
│   │   │   ├── catalog.tsx           ← Catalog with 10 features
│   │   │   └── settings.tsx
│   │   ├── chat/[id].tsx
│   │   ├── contact/[id].tsx
│   │   ├── labels.tsx
│   │   ├── templates.tsx
│   │   ├── search.tsx
│   │   ├── starred.tsx
│   │   ├── catalog/
│   │   │   ├── product/[id].tsx
│   │   │   ├── cart.tsx
│   │   │   ├── wishlist.tsx
│   │   │   └── calculator.tsx
│   ├── components/
│   │   ├── chat/
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── AttachmentDrawer.tsx
│   │   │   ├── LongPressMenu.tsx
│   │   │   ├── SwipeReply.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── CheckMarks.tsx
│   │   │   └── DateSeparator.tsx
│   │   ├── conversations/
│   │   │   ├── ConversationCard.tsx
│   │   │   ├── FilterChips.tsx
│   │   │   ├── InboxIcon.tsx
│   │   │   └── UnreadBadge.tsx
│   │   ├── common/
│   │   │   ├── Avatar.tsx
│   │   │   ├── LabelDot.tsx
│   │   │   ├── StarIcon.tsx
│   │   │   ├── ConnectionStatus.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── catalog/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CategoryChips.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── CartBar.tsx
│   │   │   ├── BundleCard.tsx
│   │   │   ├── ShippingCalc.tsx
│   │   │   └── SortOptions.tsx
│   │   └── contact/
│   │       ├── ContactInfo.tsx
│   │       ├── ContactLabels.tsx
│   │       └── ConversationHistory.tsx
│   ├── services/
│   │   ├── ChatService.ts
│   │   ├── ChatwootAdapter.ts
│   │   ├── WebSocketService.ts
│   │   ├── CatalogService.ts
│   │   └── AuthService.ts
│   ├── db/
│   │   ├── schema.ts
│   │   ├── database.ts
│   │   ├── models/
│   │   │   ├── ConversationModel.ts
│   │   │   ├── MessageModel.ts
│   │   │   ├── ContactModel.ts
│   │   │   ├── LabelModel.ts
│   │   │   ├── ProductModel.ts
│   │   │   ├── CartItemModel.ts
│   │   │   └── WishlistModel.ts
│   │   └── sync.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   ├── connectionStore.ts
│   │   └── catalogStore.ts
│   ├── hooks/
│   │   ├── useConversations.ts
│   │   ├── useMessages.ts
│   │   ├── useContacts.ts
│   │   ├── useWebSocket.ts
│   │   ├── useSync.ts
│   │   ├── useCart.ts
│   │   └── useWishlist.ts
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── api.ts
│   │   └── config.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── encryption.ts
│   │   └── imageUtils.ts
│   ├── data/
│   │   └── demoProducts.ts
│   └── types/
│       ├── chatwoot.ts
│       ├── catalog.ts
│       └── app.ts
```

---

## COLORS (Dark + Light Theme)

```typescript
// Dark theme (DEFAULT)
export const DarkColors = {
  bg:'#0b141a', bg2:'#111b21', surface:'#1f2c34', surface2:'#233138', surface3:'#182229',
  bubbleOut:'#005c4b', bubbleIn:'#1f2c34', noteYellow:'#3d3522', noteBorder:'#5c4b1f',
  green:'#00a884', greenLight:'#22c55e', greenDim:'#0a332c',
  text:'#e9edef', textDim:'#8696a0', textDim2:'#667781',
  blueTick:'#53bdeb', danger:'#ea4335', orange:'#f59e0b', purple:'#a78bfa', yellow:'#fbbf24', pink:'#ec4899',
  labelRed:'#ef4444', labelGreen:'#22c55e', labelBlue:'#3b82f6', labelOrange:'#f97316', labelPurple:'#8b5cf6',
  border:'#222d34', headerBg:'#1f2c34',
};

// Light theme
export const LightColors = {
  bg:'#ffffff', bg2:'#f0f2f5', surface:'#ffffff', surface2:'#f5f6f8', surface3:'#e9ecef',
  bubbleOut:'#d9fdd3', bubbleIn:'#ffffff', noteYellow:'#fff8e1', noteBorder:'#ffe082',
  green:'#00a884', greenLight:'#25d366', greenDim:'#e7f8f0',
  text:'#111b21', textDim:'#667781', textDim2:'#8696a0',
  blueTick:'#53bdeb', danger:'#ea4335', orange:'#f59e0b', purple:'#a78bfa', yellow:'#fbbf24', pink:'#ec4899',
  labelRed:'#ef4444', labelGreen:'#22c55e', labelBlue:'#3b82f6', labelOrange:'#f97316', labelPurple:'#8b5cf6',
  border:'#e2e8f0', headerBg:'#00a884',
};
```

Use `useColorScheme()` hook + Zustand store to toggle. Default = dark. User toggles in Settings screen. Persist preference with AsyncStorage.

---

## CHATWOOT API ENDPOINTS

Base: `https://<chatwoot-url>/api/v1/accounts/<account_id>/`
Auth: `api_access_token` header

```
GET  /api/v1/profile                          → user + account_id + pubsub_token
GET  /conversations?status=&assignee_type=&page=&labels[]=
GET  /conversations/{id}
POST /conversations
POST /conversations/filter
POST /conversations/{id}/toggle_status
POST /conversations/{id}/assignments
GET  /conversations/{id}/messages?before=
POST /conversations/{id}/messages             → send text/attachment/private note
DELETE /conversations/{id}/messages/{msg_id}
GET  /conversations/{id}/labels
POST /conversations/{id}/labels
GET  /labels
GET  /contacts/search?q=
GET  /contacts/{id}
PUT  /contacts/{id}
GET  /contacts/{id}/conversations
GET  /canned_responses
GET  /teams
GET  /inboxes
GET  /agents
GET  /reports

WebSocket: wss://<url>/cable → RoomChannel with pubsub_token
Events: message.created, conversation.created, typing_on/off, presence.update
```

---

## SERVICE INTERFACE (MANDATORY)

```
Screen → Hook → ChatService (interface) → ChatwootAdapter → Chatwoot API
```

NO direct API calls from components. ChatService.ts is abstract. ChatwootAdapter.ts implements it. This allows future swap to DirectWAAdapter without changing screens.

---

## SPEED: LOCAL-FIRST

1. Read from WatermelonDB — data shows in <100ms
2. Write local first (optimistic) — message appears instantly
3. First login: sync 50 conversations
4. WebSocket for real-time, fallback to 5s polling
5. FlatList virtualization for large lists
6. Image compression + caching

---

## 10 CATALOG FEATURES

**IMPORTANT:** The catalog is our OWN independent system. It does NOT use Chatwoot API or any third-party catalog API. Products are stored in our own database (Phase 7) or locally on phone (Phase 5). Users manage products through our admin panel. This is a standalone ecommerce catalog built into the app.

### ① Smart Home Screen
Catalog opens showing: Top Sellers (4), New Arrivals (4 horizontal scroll), Recommended for You (4), Bundle Deals, Wishlist preview, Cart preview. Not all products dumped at once.

### ② AI Fuzzy Search
Search bar with autocorrect. "unifrom" → "uniform", "shrit" → "shirt". Shows "🤖 Did you mean?" banner. Local dictionary for MVP.

### ③ Voice Search
🎤 microphone button next to search. Tap → record → device speech-to-text (expo-speech) → feed text into search. Shows "Heard: {text}" confirmation.

### ④ Wishlist
❤️ heart on every product card. Toggle on/off. Stored in WatermelonDB. Dedicated wishlist screen. Shows count on home screen.

### ⑤ Persistent Cart
🛒 Cart in WatermelonDB. Survives app restart. Per-contact cart when in conversation context. Floating cart bar at bottom shows count + total.

### ⑥ AI Bundle Suggestions
Pre-defined bundles with savings. "Complete the look" card on product detail. "2nd Officer Starter Pack — 3 items, save ₹200". One-tap add all.

### ⑦ Restock Alerts
"Only X left" orange badge if stock < 5. "OUT OF STOCK" red badge if 0. "🔔 Notify me" button for out-of-stock items. Stored in local DB.

### ⑧ Photo Search
📷 camera button next to search. Take photo or pick gallery. For MVP: show "Analyzing image..." then search based on rough category detection. Full AI version later.

### ⑨ Smart "Best for Me" Sort
Sort options: Popular / Price ↑ / Price ↓ / New / ⚓ Best for Me. "Best for Me" scores: +3 if category matches cart items, +2 if in wishlist, +1 if high rating.

### ⑩ Shipping Calculator
In cart screen. Enter pincode → show estimated shipping cost from local rate table. NO courier API integration for now (will add later). Simple zone-based rates stored in app. Shows prepaid vs COD price difference.

---

## DEMO PRODUCTS

```typescript
export const demoProducts = [
  {id:'p1',name:'Navy Officer Uniform Set',price:2499,category:'Uniforms',emoji:'🎖️',stock:8,rating:4.9,reviews:342,hot:true,variants:['S','M','L','XL','XXL'],desc:'Complete officer uniform: shirt, trousers, tie.'},
  {id:'p2',name:'Boiler Suit Coverall',price:1800,category:'Uniforms',emoji:'🦺',stock:20,rating:4.4,reviews:112,variants:['S','M','L','XL'],desc:'Engine room coverall. Fire-retardant.'},
  {id:'p3',name:'Tropical White Uniform',price:1950,category:'Uniforms',emoji:'👔',stock:3,rating:4.7,reviews:89,variants:['S','M','L'],desc:'Lightweight cotton for warm ports.'},
  {id:'p4',name:'Safety Helmet SOLAS',price:1200,category:'Safety',emoji:'⛑️',stock:15,rating:4.5,reviews:98,variants:['White','Yellow','Red'],desc:'SOLAS approved. UV resistant.'},
  {id:'p5',name:'Life Jacket SOLAS',price:2200,category:'Safety',emoji:'🦺',stock:0,rating:4.9,reviews:312,variants:['Universal'],desc:'150N buoyancy. Auto inflation.'},
  {id:'p6',name:'2nd Officer Epaulette',price:450,category:'Accessories',emoji:'⭐',stock:25,rating:4.8,reviews:189,variants:['Gold','Silver'],desc:'Gold bullion wire. Clip-on.'},
  {id:'p7',name:'Captain Peak Cap',price:650,category:'Accessories',emoji:'🧢',stock:12,rating:4.7,reviews:156,variants:['Black','White','Navy'],desc:'Gold embroidered badge.'},
  {id:'p8',name:'Navigation Divider Set',price:750,category:'Accessories',emoji:'📐',stock:18,rating:4.7,reviews:89,variants:['Standard','Professional'],desc:'Brass dividers. Velvet box.'},
  {id:'p9',name:'Deck Shoes Premium',price:3200,category:'Footwear',emoji:'👞',stock:4,rating:4.8,reviews:167,variants:['Black 8','Black 9','Brown 10'],desc:'Non-slip sole. Full leather.'},
  {id:'p10',name:'Sextant Training Model',price:4500,category:'Instruments',emoji:'🔭',stock:2,rating:4.3,reviews:45,variants:['Standard'],desc:'Training grade with wooden case.'},
];

export const demoBundles = [
  {id:'b1',name:'2nd Officer Starter Pack',productIds:['p1','p6','p7'],bundlePrice:3399,savings:200,emoji:'🎁'},
  {id:'b2',name:'Safety Essentials Kit',productIds:['p4','p5'],bundlePrice:3100,savings:300,emoji:'⛑️'},
];

export const categories = ['All','Uniforms','Safety','Accessories','Footwear','Instruments'];

export const shippingRates = [
  {zone:'North',prefix:['1','2'],couriers:[{name:'Shiprocket',days:'3-4',prepaid:85,cod:125},{name:'Delhivery',days:'4-5',prepaid:70,cod:110}]},
  {zone:'South',prefix:['5','6'],couriers:[{name:'Shiprocket',days:'4-5',prepaid:99,cod:140},{name:'Delhivery',days:'5-6',prepaid:85,cod:130}]},
  {zone:'East',prefix:['7','8'],couriers:[{name:'Shiprocket',days:'4-5',prepaid:105,cod:150},{name:'DTDC',days:'5-7',prepaid:90,cod:135}]},
  {zone:'West',prefix:['3','4'],couriers:[{name:'Shiprocket',days:'3-4',prepaid:90,cod:130},{name:'Delhivery',days:'4-5',prepaid:75,cod:120}]},
];
```

---

## UI RULES

WhatsApp patterns: conversation list layout, green outgoing bubbles, swipe reply, long press menu, ✓✓ check marks, bottom tabs.
Our identity: dark mode default, #00a884 green, Reply/Note toggle, filter chips, label dots on cards.

---

## BUILD PHASES

### Phase 1 (Weeks 1-2): Setup + Auth + Data
- [ ] Expo project + deps + TypeScript
- [ ] WatermelonDB schema + all models
- [ ] ChatService interface + ChatwootAdapter
- [ ] Login screen + auth store
- [ ] First sync (50 conversations)

### Phase 2 (Weeks 3-4): Chat Screens + Real-Time
- [ ] Conversation list with filters
- [ ] Chat screen with bubbles
- [ ] Send message (optimistic)
- [ ] Reply/Note toggle
- [ ] WebSocket + typing indicators
- [ ] Connection status

### Phase 3 (Weeks 5-6): Actions + Search + Contacts
- [ ] Long press menu + swipe reply
- [ ] Star messages + starred screen
- [ ] Search (conversations + contacts)
- [ ] Contact profile
- [ ] Labels system
- [ ] Canned responses ("/" trigger)
- [ ] Media sending + image viewer

### Phase 4 (Weeks 7-8): Business Features
- [ ] Agent assignment + teams
- [ ] Status management
- [ ] WhatsApp templates
- [ ] Multi-inbox
- [ ] Dashboard with charts
- [ ] Settings screen

### Phase 5 (Weeks 9-10): Catalog — All 10 Features
- [ ] ① Smart home (Top Sellers, New Arrivals, Recommended, Bundles)
- [ ] ② AI fuzzy search with autocorrect
- [ ] ③ Voice search (speech-to-text)
- [ ] ④ Wishlist (heart icon, dedicated screen)
- [ ] ⑤ Persistent cart (survives restart)
- [ ] ⑥ Bundle suggestions ("Complete the look")
- [ ] ⑦ Restock alerts (stock badges, notify me)
- [ ] ⑧ Photo search (camera button)
- [ ] ⑨ Smart sort "Best for me"
- [ ] ⑩ Shipping calculator (3 couriers, COD vs prepaid)
- [ ] Share product/cart in chat

### Phase 6 (Weeks 11-12): Polish + Build
- [ ] Performance optimization
- [ ] Animations (Reanimated)
- [ ] Error handling + retry
- [ ] Offline message queue
- [ ] App icon + splash
- [ ] EAS Build (iOS + Android)
- [ ] Device testing

---

## ⚠️ PHASES 7-8 NEED A VPS + DOMAIN

Phases 1-6 = mobile app only, no server needed.
Phases 7-8 = backend server + web panels on VPS.

**VPS Details (already running):**
- IP: 147.93.97.186
- Backend domain: app.nodesurge.tech
- Backend port: 4110
- Folder: /var/www/chatflow-pro/backend/
- PM2 name: chatflow-pro
- PostgreSQL: port 5433 (database: chatflow_pro)
- Redis: port 6380
- Node.js 20 + Express

**DO NOT touch:** Chatwoot (3000), courier app (4000), n8n (5678), wa-chat (4100)

---

### Phase 7 (Weeks 13-16): Backend + Admin Panel

**What:** Build the backend API server + admin web panel for US (the app owner) to manage subscriptions, products, push notifications, and monitor all users.

**Backend API (Node.js + Express on port 4110):**

```
/var/www/chatflow-pro/backend/
├── server.js                    ← Express entry, port 4110
├── config/
│   ├── db.js                    ← PostgreSQL port 5433, db: chatflow_pro
│   └── redis.js                 ← Redis port 6380
├── routes/
│   ├── auth.routes.js           ← POST /register, POST /login
│   ├── subscription.routes.js   ← GET /plans, POST /subscribe, webhooks
│   ├── products.routes.js       ← CRUD products + categories + bundles
│   ├── push.routes.js           ← POST /register-fcm, POST /webhook/chatwoot
│   ├── catalog.routes.js        ← GET /catalog (public API for mobile app)
│   └── admin.routes.js          ← Admin-only endpoints
├── middleware/
│   ├── auth.middleware.js
│   └── admin.middleware.js
├── services/
│   ├── razorpay.service.js
│   ├── stripe.service.js
│   └── firebase.service.js      ← Push notifications via FCM
├── jobs/
│   └── push.job.js              ← Bull queue for push delivery
└── migrations/
    └── 001_initial.sql
```

**Database tables:**

```sql
-- Users who downloaded the app
CREATE TABLE app_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  chatwoot_url VARCHAR(500),
  plan VARCHAR(50) DEFAULT 'trial',       -- trial, pro, business
  plan_status VARCHAR(50) DEFAULT 'active',
  plan_expires_at TIMESTAMPTZ,
  fcm_token TEXT,                          -- Firebase push token
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_users(id),
  gateway VARCHAR(50),                     -- razorpay, stripe
  gateway_payment_id VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(10),
  plan VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product catalog (synced to mobile app)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(255),
  emoji VARCHAR(10),
  image_url VARCHAR(1000),
  stock INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  variants JSONB DEFAULT '[]',
  is_hot BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Bundles
CREATE TABLE bundles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(10),
  product_ids INTEGER[] NOT NULL,
  bundle_price DECIMAL(10,2) NOT NULL,
  savings DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Shipping rates
CREATE TABLE shipping_rates (
  id SERIAL PRIMARY KEY,
  zone VARCHAR(100),
  pincode_prefixes TEXT[],
  courier_name VARCHAR(100),
  days VARCHAR(20),
  prepaid_price DECIMAL(10,2),
  cod_price DECIMAL(10,2)
);

-- Restock alert subscriptions
CREATE TABLE restock_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_users(id),
  product_id INTEGER REFERENCES products(id),
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notification log
CREATE TABLE push_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_users(id),
  title VARCHAR(500),
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API endpoints:**

```
AUTH:
POST /api/auth/register        ← email + password + name
POST /api/auth/login           ← returns JWT
GET  /api/auth/me              ← current user profile

SUBSCRIPTION:
GET  /api/plans                ← list plans + pricing
POST /api/subscribe            ← create Razorpay/Stripe order
POST /api/webhook/razorpay     ← payment confirmation
POST /api/webhook/stripe       ← payment confirmation
GET  /api/subscription/status  ← check current plan

CATALOG (public — mobile app fetches this):
GET  /api/catalog/products     ← all active products
GET  /api/catalog/categories   ← all categories
GET  /api/catalog/bundles      ← all active bundles
GET  /api/catalog/shipping?pincode=400001  ← courier rates
GET  /api/catalog/search?q=uniform  ← search products

PUSH NOTIFICATIONS:
POST /api/push/register-token  ← save FCM token
POST /api/webhook/chatwoot     ← receives Chatwoot webhook → sends push

ADMIN (admin-only, JWT required):
GET  /api/admin/users          ← all app users + their plans
GET  /api/admin/revenue        ← subscription revenue stats
POST /api/admin/products       ← create product
PUT  /api/admin/products/:id   ← update product
DELETE /api/admin/products/:id ← delete product
POST /api/admin/categories     ← create category
POST /api/admin/bundles        ← create bundle
PUT  /api/admin/bundles/:id    ← update bundle
PUT  /api/admin/shipping/:id   ← update shipping rates
POST /api/admin/push/send      ← send push to all users
```

**Admin Panel (React web app — for US, the app owner):**

```
URL: app.nodesurge.tech/admin
Tech: React 18 + Tailwind CSS

Pages:
├── Login
├── Dashboard
│   ├── Total users (trial/pro/business breakdown)
│   ├── Monthly recurring revenue (MRR)
│   ├── New signups this week
│   └── Active users chart
├── Users
│   ├── User list with plan, status, last active
│   ├── Search + filter by plan
│   └── View user details + subscription history
├── Products
│   ├── Product list with stock, price, category
│   ├── Add/Edit product form (name, desc, price, stock, image, variants)
│   ├── Category manager
│   └── Import products from Excel
├── Bundles
│   ├── Bundle list
│   ├── Create: pick products, set price, auto-calc savings
│   └── Enable/disable bundles
├── Shipping
│   ├── Zone + rate table
│   ├── Edit rates inline
│   └── Test calculator
├── Subscriptions
│   ├── Plan configuration (price, features per plan)
│   ├── Payment history
│   └── Revenue reports
├── Push Notifications
│   ├── Send notification to all users
│   ├── Send to specific plan (pro/business only)
│   └── Notification history
└── Settings
    ├── Admin password change
    ├── Razorpay/Stripe keys
    └── Firebase config
```

**Update mobile app to sync from server:**
- [ ] On app launch, fetch products from `GET /api/catalog/products` → save to WatermelonDB
- [ ] Products, bundles, shipping rates now come from SERVER instead of demo data
- [ ] Wishlist + cart still stored locally on phone
- [ ] Restock "Notify me" sends POST to server → server sends push when stock changes

**Pricing tiers enforced by server:**

| Feature | Trial (14 days) | Pro $15/mo | Business $30/mo |
|---|---|---|---|
| Chat + real-time | ✅ | ✅ | ✅ |
| Labels, search, replies | ✅ | ✅ | ✅ |
| Offline caching | ✅ | ✅ | ✅ |
| Private notes | ✅ | ✅ | ✅ |
| Multi-inbox | 1 inbox | Unlimited | Unlimited |
| WhatsApp templates | ❌ | ✅ | ✅ |
| Catalog (10 features) | ❌ | ❌ | ✅ |
| Push notifications | ❌ | ✅ | ✅ |
| Analytics dashboard | ❌ | Basic | Advanced |

- [ ] Mobile app checks `GET /api/subscription/status` on launch
- [ ] Lock features behind plan check
- [ ] Show upgrade prompt for locked features

---

### Phase 8 (Weeks 17-18): Client Web Portal

**What:** A web portal where CLIENTS (the people who downloaded your app) can log in and manage their subscription, view their usage, update payment method.

**Different from Admin Panel:**
- Admin Panel = for YOU (app owner) → manage everything
- Client Portal = for CLIENTS (app users) → manage their own account

```
URL: app.nodesurge.tech/portal
Tech: React 18 + Tailwind CSS (same project, different routes)

Pages:
├── Login / Signup
├── My Account
│   ├── Current plan + expiry date
│   ├── Upgrade/downgrade plan
│   ├── Payment history
│   └── Update payment method
├── My Usage
│   ├── Conversations this month
│   ├── Messages sent/received
│   └── Storage used
├── Connect Chatwoot
│   ├── Enter Chatwoot URL
│   ├── Enter API token
│   └── Test connection button
├── Catalog Management (Business plan only)
│   ├── View products synced to their app
│   ├── Request product additions
│   └── View their customers' wishlists
└── Support
    ├── FAQ
    ├── Contact us
    └── Feature requests
```

---

## VPS DEPLOYMENT (Phases 7-8)

```bash
# Create folder and database
mkdir -p /var/www/chatflow-pro/backend
psql -U postgres -p 5433 -c "CREATE DATABASE chatflow_pro;"

# After code is pushed to GitHub
cd /var/www/chatflow-pro/backend
git pull origin main
npm install

# Create .env
cat > .env << 'EOF'
PORT=4110
DB_HOST=/var/run/postgresql
DB_PORT=5433
DB_NAME=chatflow_pro
DB_USER=postgres
DB_PASS=NavyStore2025secure
REDIS_URL=redis://localhost:6380
JWT_SECRET=ChatFlowPro_JWT_2026_xR7mK9pQ
RAZORPAY_KEY_ID=<fill>
RAZORPAY_KEY_SECRET=<fill>
STRIPE_SECRET_KEY=<fill>
FIREBASE_PROJECT_ID=<fill>
FIREBASE_PRIVATE_KEY=<fill>
FIREBASE_CLIENT_EMAIL=<fill>
ADMIN_EMAIL=rajesh@nodesurge.tech
ADMIN_PASSWORD=<your-choice>
EOF

# Start
pm2 start server.js --name chatflow-pro
pm2 save

# Nginx
cat > /etc/nginx/sites-available/app.nodesurge.tech << 'CONF'
server {
    server_name app.nodesurge.tech;
    location / {
        proxy_pass http://localhost:4110;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
CONF
ln -s /etc/nginx/sites-available/app.nodesurge.tech /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d app.nodesurge.tech
```

**DNS:** Add A record: app.nodesurge.tech → 147.93.97.186

---

## TESTING

Phase 1-6: Connect to `https://chat.nodesurge.tech`
Phase 7-8: Backend at `https://app.nodesurge.tech`
App must work with ANY Chatwoot server — never hardcode URLs.

---

## RULES

1. Service Interface — no direct API calls from components
2. Local DB first — WatermelonDB for all reads
3. TypeScript strict — no `any`
4. Explain WHY in comments
5. One phase at a time
6. Dark mode default + light mode option (user can toggle in Settings)
7. Color tokens from constants/colors.ts
8. Build all UI from scratch — no external UI libraries
9. Test each screen before next phase
10. Commit after each phase
11. PostgreSQL port 5433 — never 5432
12. Redis port 6380 — never 6379
13. PM2 name: chatflow-pro
14. Never touch Chatwoot (3000), courier (4000), n8n (5678), wa-chat (4100)
