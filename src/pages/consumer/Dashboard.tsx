import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Package, MapPin, Clock,
  ArrowRight, Star, Heart, Handshake, ChevronDown, ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Product, Order, ProductCategory } from '@/types';
import { useCart } from '@/context/CartContext';
import { OrderTimeline } from '@/components/orders/OrderTimeline';

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

const ConsumerDashboard = () => {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'negotiations'>('orders');
  const [consumerOrders, setConsumerOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

        // Fetch Orders
        if (userInfo.token) {
          const orderRes = await fetch('/api/orders/myorders', {
            headers: { Authorization: `Bearer ${userInfo.token}` }
          });
          const orderData = await orderRes.json();
          if (orderRes.ok) {
            setConsumerOrders(orderData.map((o: any) => ({
              id: o._id,
              consumerId: o.consumer._id,
              consumerName: o.consumer.name,
              farmerId: 'unknown',
              farmerName: 'Various Farmers', // Logic simplification for MVP
              items: o.items.map((i: any) => ({
                productId: i.product,
                productName: i.name,
                quantity: i.quantity,
                pricePerUnit: i.price,
                total: i.quantity * i.price
              })),
              totalAmount: o.totalAmount,
              status: o.status,
              statusHistory: o.statusHistory || [],
              deliveryAddress: o.shippingAddress?.address || 'N/A',
              contactPhone: 'N/A',
              createdAt: new Date(o.createdAt),
              updatedAt: new Date(o.updatedAt)
            })));
          }
        }

        // Fetch Negotiations
        if (userInfo.token) {
          const negRes = await fetch('/api/negotiations', {
            headers: { Authorization: `Bearer ${userInfo.token}` }
          });
          const negData = await negRes.json();
          if (negRes.ok) {
            setNegotiations(negData);
          }
        }

        // Fetch Products for Quick Shop
        const productRes = await fetch('/api/products');
        const productData = await productRes.json();
        if (productRes.ok) {
          const formattedProducts = productData.slice(0, 4).map((p: any) => ({
            id: p._id,
            farmerId: p.farmer._id,
            farmerName: p.farmer.name,
            farmerVillage: p.farmer.village,
            name: p.name,
            category: p.category,
            description: p.description,
            pricePerUnit: p.price || p.pricePerUnit,
            unit: p.unit,
            quantityAvailable: p.quantity || p.quantityAvailable,
            harvestDate: new Date(p.harvestDate),
            images: [],
            isOrganic: p.isOrganic,
            isAvailable: p.isAvailable,
          }));
          setRecentProducts(formattedProducts);
        }

      } catch (error) {
        console.error("Failed to fetch consumer dashboard data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
                <p className="text-muted-foreground">Manage your orders and favorites</p>
              </div>
              <Button asChild>
                <Link to="/products">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Products
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{consumerOrders.length}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{consumerOrders.filter(o => o.status === 'Pending').length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-4 text-center">
                  <Heart className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Saved Items</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Farmers Following</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              onClick={() => setActiveTab('orders')}
            >
              <Package className="h-4 w-4 mr-2" />
              Orders
            </Button>
            <Button
              variant={activeTab === 'negotiations' ? 'default' : 'outline'}
              onClick={() => setActiveTab('negotiations')}
            >
              <Handshake className="h-4 w-4 mr-2" />
              Negotiations
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Content Area */}
            <div className="lg:col-span-2">
              {activeTab === 'orders' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Orders</h2>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/consumer/orders">
                        View All <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

              <div className="space-y-4">
                {consumerOrders.length === 0 ? <p className="text-muted-foreground">No orders found.</p> : consumerOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">Order #{order.id}</span>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                order.status === 'Pending'   && "bg-amber-100 text-amber-700",
                                order.status === 'Accepted'  && "bg-blue-100 text-blue-700",
                                order.status === 'Packed'    && "bg-purple-100 text-purple-700",
                                order.status === 'Shipped'   && "bg-cyan-100 text-cyan-700",
                                order.status === 'Delivered' && "bg-green-100 text-green-700",
                                order.status === 'Rejected'  && "bg-red-100 text-red-700",
                              )}>
                                {order.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              {/* Assuming single farmer for MVP or mixed */}
                              <span>Items: {order.items.length}</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {order.items.map((item, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 bg-muted rounded-full"
                                >
                                  {item.quantity}x {item.productName}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">₹{order.totalAmount}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Order Status — collapsible timeline */}
                        <div className="mt-3 pt-3 border-t border-border">
                          {/* Current status row + expand toggle */}
                          <button
                            type="button"
                            onClick={() => toggleOrderExpand(order.id)}
                            className="w-full flex items-center justify-between text-sm hover:bg-muted/50 rounded-lg px-2 py-1.5 transition-colors"
                          >
                            <span className="flex items-center gap-2 font-medium">
                              <span className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                order.status === 'Pending'   && "bg-amber-400",
                                order.status === 'Accepted'  && "bg-blue-400",
                                order.status === 'Packed'    && "bg-purple-400",
                                order.status === 'Shipped'   && "bg-cyan-400",
                                order.status === 'Delivered' && "bg-green-500",
                                order.status === 'Rejected'  && "bg-red-400",
                              )} />
                              {order.status}
                            </span>
                            {expandedOrders.has(order.id)
                              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </button>

                          {/* Full timeline — visible only when expanded */}
                          {expandedOrders.has(order.id) && (
                            <div className="mt-2">
                              <OrderTimeline
                                currentStatus={order.status}
                                statusHistory={(order as any).statusHistory || []}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">My Negotiations</h2>
                  </div>
                  <div className="space-y-4">
                    {negotiations.length === 0 ? <p className="text-muted-foreground">No active negotiations.</p> : negotiations.map((neg, index) => (
                      <motion.div
                        key={neg._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{neg.product?.name}</h3>
                                <p className="text-sm text-muted-foreground">Farmer: {neg.farmer?.name}</p>
                              </div>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold",
                                neg.status === 'PENDING' && "bg-amber-100 text-amber-700",
                                neg.status === 'ACCEPTED' && "bg-green-100 text-green-700",
                                neg.status === 'REJECTED' && "bg-red-100 text-red-700",
                                neg.status === 'EXPIRED' && "bg-gray-100 text-gray-700"
                              )}>
                                {neg.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                              <div>
                                <p className="text-muted-foreground">Quantity Requested</p>
                                <p className="font-medium">{neg.quantity} {neg.product?.unit}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Your Offer</p>
                                <p className="font-bold text-primary">₹{neg.requestedPrice}/{neg.product?.unit}</p>
                              </div>
                            </div>
                            {neg.status === 'ACCEPTED' && (
                              <div className="mt-4 pt-4 border-t flex justify-end">
                                <Button>Proceed to Checkout</Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right: Quick Shop */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Quick Shop</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/products">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {recentProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => addToCart(product)}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gram-green-50 flex items-center justify-center text-2xl shrink-0">
                            {categories.find(c => c.value === product.category)?.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{product.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{product.farmerVillage}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">₹{product.pricePerUnit}</p>
                            <p className="text-xs text-muted-foreground">/{product.unit}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Categories Quick Access */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Shop by Category</h3>
                <div className="grid grid-cols-4 gap-2">
                  {categories.slice(0, 4).map((cat) => (
                    <Link
                      key={cat.value}
                      to={`/products?category=${cat.value}`}
                      className="flex flex-col items-center p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                      <span className="text-2xl mb-1">{cat.icon}</span>
                      <span className="text-xs text-center">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConsumerDashboard;
