import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCategory } from '@/types';
import { cn } from '@/lib/utils';

// Categories Configuration
const categories: { value: ProductCategory; label: string; icon: string }[] = [
  { value: 'vegetables', label: 'Vegetables', icon: '🥬' },
  { value: 'fruits', label: 'Fruits', icon: '🍎' },
  { value: 'grains', label: 'Grains', icon: '🌾' },
  { value: 'pulses', label: 'Pulses', icon: '🫘' },
  { value: 'spices', label: 'Spices', icon: '🌶️' },
  { value: 'dairy', label: 'Dairy', icon: '🥛' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [activeCategory, setActiveCategory] = useState(categoryFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Sync URL param with internal state
  useEffect(() => {
    if (categoryFilter) {
      setSelectedCategory(categoryFilter as ProductCategory);
    }
  }, [categoryFilter]);

  // Fetch from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = '/api/products';
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);

        if (selectedCategory !== 'all') {
          url += `?category=${selectedCategory}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          // Transform API data to match frontend component expectations
          const formattedProducts = data.map((p: any) => ({
            id: p._id,
            farmerId: p.farmer._id,
            farmerName: p.farmer.name,
            farmerVillage: `${p.farmer.village}, ${p.farmer.state}`,
            name: p.name,
            category: p.category,
            description: p.description,
            pricePerUnit: p.pricePerUnit,
            unit: p.unit,
            quantityAvailable: p.quantityAvailable,
            harvestDate: new Date(p.harvestDate),
            images: [],
            isOrganic: p.isOrganic,
            isAvailable: p.isAvailable,
          }));
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.farmerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      const matchesOrganic = !organicOnly || product.isOrganic;

      let matchesPrice = true;
      if (priceRange === 'low') matchesPrice = product.pricePerUnit <= 50;
      else if (priceRange === 'mid') matchesPrice = product.pricePerUnit > 50 && product.pricePerUnit <= 100;
      else if (priceRange === 'high') matchesPrice = product.pricePerUnit > 100;

      return matchesSearch && matchesCategory && matchesOrganic && matchesPrice && product.isAvailable;
    });
  }, [searchQuery, selectedCategory, organicOnly, priceRange, products]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setOrganicOnly(false);
  };

  const hasActiveFilters = selectedCategory !== 'all' || priceRange !== 'all' || organicOnly || searchQuery;

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-secondary to-background py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Fresh from the Farm</h1>
            <p className="text-muted-foreground mb-8">
              Browse through fresh produce sourced directly from verified farmers across India.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for products, farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 rounded-xl bg-card border-border"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedCategory === 'all'
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                          selectedCategory === cat.value
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <span>{cat.icon}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Price Range</h4>
                  <div className="space-y-1">
                    {[
                      { value: 'all', label: 'All Prices' },
                      { value: 'low', label: 'Under ₹50' },
                      { value: 'mid', label: '₹50 - ₹100' },
                      { value: 'high', label: 'Above ₹100' },
                    ].map((price) => (
                      <button
                        key={price.value}
                        onClick={() => setPriceRange(price.value as typeof priceRange)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          priceRange === price.value
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {price.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Organic Filter */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                  <button
                    onClick={() => setOrganicOnly(!organicOnly)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                      organicOnly
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    🌱 Organic Only
                  </button>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>

              {/* Category Pills */}
              <div className="flex-1 overflow-x-auto hide-scrollbar">
                <div className="flex gap-2">
                  {categories.slice(0, 4).map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(
                        selectedCategory === cat.value ? 'all' : cat.value
                      )}
                      className={cn(
                        "shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors",
                        selectedCategory === cat.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="lg:hidden bg-card rounded-xl p-4 border border-border mb-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Price</h4>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                      className="w-full p-2 rounded-lg border border-border bg-background"
                    >
                      <option value="all">All Prices</option>
                      <option value="low">Under ₹50</option>
                      <option value="mid">₹50 - ₹100</option>
                      <option value="high">Above ₹100</option>
                    </select>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Type</h4>
                    <button
                      onClick={() => setOrganicOnly(!organicOnly)}
                      className={cn(
                        "w-full p-2 rounded-lg border text-sm transition-colors",
                        organicOnly
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      🌱 Organic Only
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> products
                </p>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
