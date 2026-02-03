import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Users, Shield, TrendingUp, Truck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import heroImage from '@/assets/hero-farm-city.jpg';
import { ProductCard } from '@/components/products/ProductCard';
import { Product, ProductCategory } from '@/types';

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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const stats = [
  { value: '500+', label: 'Farmers', icon: Users },
  { value: '10K+', label: 'Orders Delivered', icon: Truck },
  { value: '50+', label: 'Villages Connected', icon: Heart },
  { value: '100%', label: 'Transparency', icon: Shield },
];

const features = [
  {
    icon: Leaf,
    title: 'Farm Fresh',
    description: 'Get produce directly from farms, harvested just for you.',
  },
  {
    icon: Users,
    title: 'Know Your Farmer',
    description: 'See exactly who grows your food and where it comes from.',
  },
  {
    icon: TrendingUp,
    title: 'Fair Prices',
    description: 'Farmers earn more, you pay less. No middlemen involved.',
  },
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'Every farmer is verified and every product is tracked.',
  },
];

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (response.ok) {
          const formattedProducts = data.slice(0, 4).map((p: any) => ({
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
          setFeaturedProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Failed to fetch featured products", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Farm to City Connection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          <motion.div
            className="max-w-2xl text-primary-foreground"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-sm px-4 py-2 text-sm font-medium mb-6"
            >
              <Leaf className="h-4 w-4" />
              Direct from Farm to Your Table
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              <span className="text-[#2D864D]">Fresh Produce,</span>{' '}
              <span className="text-accent">Fair Trade</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg"
            >
              Connect directly with farmers across India. Buy fresh, organic produce while supporting rural communities.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link to="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="hero-outline" asChild>
                <Link to="/register">
                  Become a Farmer
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore fresh produce across different categories, all sourced directly from verified farmers.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/products?category=${category.value}`}
                  className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 group"
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <span className="text-sm font-medium text-foreground">{category.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Fresh Arrivals</h2>
              <p className="text-muted-foreground">
                Just harvested and ready for you
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose GramConnect?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're building a transparent, fair, and sustainable food ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-card-hover transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Farmers CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container">
          <div className="flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Are You a Farmer?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Join GramConnect and sell your produce directly to urban consumers. No middlemen, fair prices, and a platform that values your hard work.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-10 text-left">
                <div className="flex flex-col items-center text-center p-4 bg-primary-foreground/10 rounded-xl backdrop-blur-sm border border-primary-foreground/10">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mb-3">
                    <ArrowRight className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span>List your products in minutes</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-primary-foreground/10 rounded-xl backdrop-blur-sm border border-primary-foreground/10">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mb-3">
                    <ArrowRight className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span>Get fair prices for your produce</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-primary-foreground/10 rounded-xl backdrop-blur-sm border border-primary-foreground/10">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mb-3">
                    <ArrowRight className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span>Build trust with direct relationships</span>
                </div>
              </div>

              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link to="/register?role=farmer">
                  Register as Farmer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
