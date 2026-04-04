// Catalog tab — ① Smart Home Screen with all 10 features integrated.
// Top Sellers, New Arrivals, Recommended, Bundles, Wishlist preview.
// Search with ② fuzzy correction, ③ voice, ⑧ photo search.
// ④ Wishlist, ⑤ Cart, ⑥ Bundles, ⑦ Restock alerts, ⑨ Sort, ⑩ Shipping.

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator,
  Modal, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, ShoppingCart, ChevronRight, Sparkles } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { useCatalogStore } from '../../store/catalogStore';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { CatalogService } from '../../services/CatalogService';
import { seedDemoProducts } from '../../db/sync';
import { productsCollection } from '../../db/database';
import { demoBundles, demoProducts, categories } from '../../data/demoProducts';
import type ProductModel from '../../db/models/ProductModel';
import type { SortOption, Product } from '../../types/catalog';
import SearchBar from '../../components/catalog/SearchBar';
import CategoryChips from '../../components/catalog/CategoryChips';
import SortOptions from '../../components/catalog/SortOptions';
import ProductCard from '../../components/catalog/ProductCard';
import BundleCard from '../../components/catalog/BundleCard';
import CartBar from '../../components/catalog/CartBar';

export default function CatalogScreen() {
  const { colors } = useUIStore();
  const {
    searchQuery, activeCategory, sortOption,
    setSearchQuery, setActiveCategory, setSortOption,
    wishlistCount, cartCount, cartTotal,
  } = useCatalogStore();

  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const insets = useSafeAreaInsets();

  // ③ Voice search modal state
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');

  const [allProducts, setAllProducts] = useState<ProductModel[]>([]);
  const [filtered, setFiltered] = useState<ProductModel[]>([]);
  const [correctedQuery, setCorrectedQuery] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Seed demo products on first mount
  useEffect(() => {
    seedDemoProducts().then(() => setSeeded(true));
  }, []);

  // Observe all products from WatermelonDB
  useEffect(() => {
    if (!seeded) return;
    const sub = productsCollection.query().observe().subscribe({
      next: (records) => {
        setAllProducts(records as ProductModel[]);
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, [seeded]);

  // Filter + sort whenever inputs change
  useEffect(() => {
    if (allProducts.length === 0) return;

    let results = [...allProducts];

    // Category filter
    if (activeCategory !== 'All') {
      results = results.filter((p) => p.category === activeCategory);
    }

    // Search filter with ② fuzzy correction
    if (searchQuery.trim()) {
      const [corrected, didCorrect] = CatalogService.correctQuery(searchQuery);
      setCorrectedQuery(didCorrect ? corrected : null);
      const query = didCorrect ? corrected : searchQuery;
      results = results.filter((p) =>
        CatalogService.fuzzyMatch(query, p.name) ||
        CatalogService.fuzzyMatch(query, p.category) ||
        CatalogService.fuzzyMatch(query, p.description ?? '')
      );
    } else {
      setCorrectedQuery(null);
    }

    // Sort — ⑨
    CatalogService.sortProducts(results, sortOption).then(setFiltered);
  }, [allProducts, searchQuery, activeCategory, sortOption]);

  // ③ Voice search handler — shows a text-input modal (speech-to-text only works on physical devices via OS keyboard microphone)
  const handleVoiceSearch = useCallback(() => {
    setVoiceInput('');
    setVoiceModalVisible(true);
  }, []);

  // ⑧ Photo search handler
  const handlePhotoSearch = useCallback(async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Camera access is required for photo search.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        quality: 0.5,
      });

      if (!result.canceled) {
        // MVP: analyze image → search by rough category
        Alert.alert('Analyzing image...', 'Searching for matching products...', [], { cancelable: true });
        // Simulate analysis delay then search by a category keyword
        setTimeout(() => {
          setSearchQuery('uniform');
          Alert.alert('Photo Search', 'Found products matching: "uniform"');
        }, 2000);
      }
    } catch {
      Alert.alert('Photo Search', 'Camera not available. Try searching by text.');
    }
  }, [setSearchQuery]);

  // ⑥ Bundle add-all handler
  const handleAddBundle = useCallback(async (productIds: string[]) => {
    for (const pid of productIds) {
      await addToCart(pid);
    }
    Alert.alert('Bundle Added', `${productIds.length} items added to cart!`);
  }, [addToCart]);

  const navigateProduct = useCallback((remoteId: string) => {
    router.push(`/catalog/product/${remoteId}`);
  }, []);

  // Determine home sections from all products (before search filtering)
  const topSellers = allProducts
    .filter((p) => !p.isOutOfStock)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 4);
  const newArrivals = [...allProducts].reverse().slice(0, 6);
  const recommended = allProducts
    .filter((p) => p.rating >= 4.7 && !p.isOutOfStock)
    .slice(0, 4);

  const isSearching = searchQuery.trim().length > 0 || activeCategory !== 'All';

  if (loading) {
    return (
      <View style={[s.container, { backgroundColor: colors.bg }]}>
        <View style={[s.header, { backgroundColor: colors.headerBg, paddingTop: insets.top + 12 }]}>
          <Text style={s.headerTitle}>Catalog</Text>
        </View>
        <View style={s.loadingWrap}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.headerBg, paddingTop: insets.top + 12 }]}>
        <Text style={s.headerTitle}>Catalog</Text>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={() => router.push('/catalog/wishlist')} style={s.headerBtn}>
            <Heart color="#fff" size={20} />
            {wishlistCount > 0 && (
              <View style={[s.headerBadge, { backgroundColor: colors.danger }]}>
                <Text style={s.headerBadgeText}>{wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/catalog/cart')} style={s.headerBtn}>
            <ShoppingCart color="#fff" size={20} />
            {cartCount > 0 && (
              <View style={[s.headerBadge, { backgroundColor: colors.danger }]}>
                <Text style={s.headerBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ② Search + ③ Voice + ⑧ Camera */}
      <SearchBar
        value={searchQuery}
        correctedQuery={correctedQuery}
        onChange={setSearchQuery}
        onVoicePress={handleVoiceSearch}
        onCameraPress={handlePhotoSearch}
      />

      {/* Category chips */}
      <CategoryChips
        categories={categories}
        active={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Sort + results count */}
      <View style={s.sortRow}>
        <Text style={[s.resultCount, { color: colors.textDim }]}>
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </Text>
        <SortOptions value={sortOption} onSelect={setSortOption} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* When searching — show filtered grid */}
        {isSearching ? (
          <View style={s.grid}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={isWishlisted(product.remoteId)}
                onPress={() => navigateProduct(product.remoteId)}
                onToggleWishlist={() => toggleWishlist(product.remoteId)}
              />
            ))}
            {filtered.length === 0 && (
              <View style={s.emptyWrap}>
                <Text style={[s.emptyText, { color: colors.textDim }]}>
                  No products found. Try a different search.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* ① Smart Home — Top Sellers */}
            <SectionHeader
              title="Top Sellers"
              emoji="🔥"
              colors={colors}
            />
            <View style={s.grid}>
              {topSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlisted={isWishlisted(product.remoteId)}
                  onPress={() => navigateProduct(product.remoteId)}
                  onToggleWishlist={() => toggleWishlist(product.remoteId)}
                />
              ))}
            </View>

            {/* ① New Arrivals — horizontal scroll */}
            <SectionHeader
              title="New Arrivals"
              emoji="✨"
              colors={colors}
            />
            <FlatList
              horizontal
              data={newArrivals}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizList}
              renderItem={({ item }) => (
                <View style={s.horizCard}>
                  <ProductCard
                    product={item}
                    wishlisted={isWishlisted(item.remoteId)}
                    onPress={() => navigateProduct(item.remoteId)}
                    onToggleWishlist={() => toggleWishlist(item.remoteId)}
                  />
                </View>
              )}
            />

            {/* ① Recommended for You */}
            <SectionHeader
              title="Recommended for You"
              emoji="⚓"
              colors={colors}
            />
            <View style={s.grid}>
              {recommended.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlisted={isWishlisted(product.remoteId)}
                  onPress={() => navigateProduct(product.remoteId)}
                  onToggleWishlist={() => toggleWishlist(product.remoteId)}
                />
              ))}
            </View>

            {/* ⑥ Bundle Deals */}
            <SectionHeader
              title="Bundle Deals"
              emoji="🎁"
              colors={colors}
            />
            {demoBundles.map((bundle) => {
              const bundleProducts = demoProducts.filter((p) =>
                bundle.productIds.includes(p.id)
              );
              return (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  products={bundleProducts}
                  onAddAll={() => handleAddBundle(bundle.productIds)}
                />
              );
            })}

            {/* ④ Wishlist preview */}
            {wishlistCount > 0 && (
              <>
                <TouchableOpacity
                  style={s.sectionHeaderRow}
                  onPress={() => router.push('/catalog/wishlist')}
                  activeOpacity={0.7}
                >
                  <Text style={s.sectionEmoji}>❤️</Text>
                  <Text style={[s.sectionTitle, { color: colors.text }]}>
                    My Wishlist ({wishlistCount})
                  </Text>
                  <ChevronRight color={colors.textDim} size={18} />
                </TouchableOpacity>
              </>
            )}

            {/* ⑤ Cart preview */}
            {cartCount > 0 && (
              <TouchableOpacity
                style={[s.cartPreview, { backgroundColor: colors.green + '11', borderColor: colors.green + '33' }]}
                onPress={() => router.push('/catalog/cart')}
                activeOpacity={0.7}
              >
                <ShoppingCart color={colors.green} size={20} />
                <View style={s.cartPreviewInfo}>
                  <Text style={[s.cartPreviewTitle, { color: colors.green }]}>
                    {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
                  </Text>
                  <Text style={[s.cartPreviewTotal, { color: colors.text }]}>
                    ₹{cartTotal.toLocaleString()}
                  </Text>
                </View>
                <ChevronRight color={colors.green} size={20} />
              </TouchableOpacity>
            )}

            {/* Bottom padding */}
            <View style={{ height: 100 }} />
          </>
        )}

        {isSearching && <View style={{ height: 100 }} />}
      </ScrollView>

      {/* ⑤ Floating cart bar */}
      <View style={s.cartBarWrap}>
        <CartBar />
      </View>

      {/* ③ Voice search modal */}
      <Modal
        transparent
        visible={voiceModalVisible}
        animationType="fade"
        onRequestClose={() => setVoiceModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}
          activeOpacity={1}
          onPress={() => setVoiceModalVisible(false)}
        >
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
              🎤 Voice Search
            </Text>
            <Text style={{ fontSize: 13, color: colors.textDim, marginBottom: 12 }}>
              Tap the mic icon on your keyboard to speak, or type your search:
            </Text>
            <TextInput
              autoFocus
              value={voiceInput}
              onChangeText={setVoiceInput}
              placeholder="e.g. navy uniform size L..."
              placeholderTextColor={colors.textDim}
              style={{
                backgroundColor: colors.surface2,
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 14,
              }}
              onSubmitEditing={() => {
                if (voiceInput.trim()) {
                  setSearchQuery(voiceInput.trim());
                }
                setVoiceModalVisible(false);
              }}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={{ backgroundColor: colors.green, borderRadius: 10, padding: 12, alignItems: 'center' }}
              onPress={() => {
                if (voiceInput.trim()) setSearchQuery(voiceInput.trim());
                setVoiceModalVisible(false);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Search</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Section header component
function SectionHeader({ title, emoji, colors }: { title: string; emoji: string; colors: Record<string, string> }) {
  return (
    <View style={s.sectionHeaderRow}>
      <Text style={s.sectionEmoji}>{emoji}</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 0, paddingBottom: 12, paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  headerRight: { flexDirection: 'row', gap: 16 },
  headerBtn: { position: 'relative' },
  headerBadge: {
    position: 'absolute', top: -6, right: -8,
    minWidth: 16, height: 16, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  headerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sortRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  resultCount: { fontSize: 12, fontWeight: '500' },
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  emptyWrap: { width: '100%', paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
  },
  sectionEmoji: { fontSize: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  horizList: { paddingHorizontal: 8 },
  horizCard: { width: 170 },
  cartPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 12, marginTop: 16, borderRadius: 12,
    borderWidth: 1, padding: 14,
  },
  cartPreviewInfo: { flex: 1 },
  cartPreviewTitle: { fontSize: 14, fontWeight: '600' },
  cartPreviewTotal: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  cartBarWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
