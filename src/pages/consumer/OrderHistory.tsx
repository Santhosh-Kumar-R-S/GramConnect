import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, RotateCcw, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { OrderTimeline } from '@/components/orders/OrderTimeline';

const STATUS_COLORS: Record<string, string> = {
  Pending:   'bg-amber-100 text-amber-700',
  Accepted:  'bg-blue-100 text-blue-700',
  Packed:    'bg-purple-100 text-purple-700',
  Shipped:   'bg-cyan-100 text-cyan-700',
  Delivered: 'bg-green-100 text-green-700',
  Rejected:  'bg-red-100 text-red-700',
};

const OrderHistory = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const res = await fetch('/api/orders/myorders', {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      const product = {
        id: item.product?._id || item.product,
        name: item.name,
        pricePerUnit: item.price,
        unit: item.product?.unit || 'kg',
        category: item.product?.category || 'vegetables',
        farmerId: item.farmer,
        farmerName: '',
        farmerVillage: '',
        images: [],
        isOrganic: false,
        isAvailable: true,
        quantityAvailable: 999,
        harvestDate: new Date(),
      };
      addToCart(product as any);
    });
    toast({ title: '🛒 Added to Cart', description: `${order.items.length} item(s) from this order have been added to your cart.` });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center text-muted-foreground">Loading orders...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Order History</h1>
              <p className="text-muted-foreground text-sm mt-1">Track and reorder your past purchases</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/products">
                <ShoppingBag className="h-4 w-4 mr-2" /> Shop More
              </Link>
            </Button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Button asChild><Link to="/products">Browse Products</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs text-muted-foreground font-mono">
                              #{order._id.slice(-8).toUpperCase()}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                            )}>
                              {order.status}
                            </span>
                          </div>

                          <p className="font-medium truncate">
                            {order.items.map((i: any) => i.name).join(', ')}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                            {order.shippingAddress?.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {order.shippingAddress.address}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                          </div>

                          {order.deliverySlot && (
                            <p className="text-xs text-primary mt-1 font-medium">
                              🕐 {order.deliverySlot.label} · {new Date(order.deliverySlot.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold text-primary">₹{order.totalAmount}</p>
                          <p className="text-xs text-muted-foreground">{order.items.length} item(s)</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="flex-1"
                        >
                          <ChevronRight className="h-3 w-3 mr-1" /> Track Order
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReorder(order)}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" /> Reorder
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Order Detail / Timeline Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder?._id?.slice(-8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                {selectedOrder.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.quantity}× {item.name}</span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{selectedOrder.totalAmount}</span>
                </div>
              </div>

              <OrderTimeline
                currentStatus={selectedOrder.status}
                statusHistory={selectedOrder.statusHistory || []}
              />

              <Button
                className="w-full"
                onClick={() => { handleReorder(selectedOrder); setSelectedOrder(null); }}
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Reorder This
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default OrderHistory;
