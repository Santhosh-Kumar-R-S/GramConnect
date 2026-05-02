import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, MapPin, Leaf } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { DeliverySlotPicker } from '@/components/checkout/DeliverySlotPicker';
import { ProductCategory } from '@/types';

// Razorpay Script Loader
const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.pricePerUnit * item.quantity), 0);
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress || !contactPhone) {
      toast({ title: 'Error', description: 'Please fill in delivery details', variant: 'destructive' });
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!userInfo.token) {
        toast({ title: 'Error', description: 'Please login to place an order', variant: 'destructive' });
        return;
      }

      // 1. Create Order in Backend
      const orderItems = cartItems.map(item => ({
        product: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.pricePerUnit,
        farmer: item.product.farmerId
      }));

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: total,
          deliverySlotId: selectedSlotId || undefined,
          shippingAddress: {
            address: deliveryAddress,
            city: 'Unknown',
            postalCode: '000000',
            country: 'India',
          },
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderRes.json();

      // 2. Load Razorpay SDK
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        toast({ title: 'Error', description: 'Razorpay SDK failed to load', variant: 'destructive' });
        return;
      }

      // 3. Create Razorpay Order
      const rzpOrderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ orderId: order._id }),
      });

      if (!rzpOrderRes.ok) {
        throw new Error('Failed to initialize payment');
      }

      const rzpOrder = await rzpOrderRes.json();

      // 4a. Test Mode — simulate payment without opening Razorpay modal
      if (rzpOrder._testMode) {
        toast({ title: '✅ Order Placed!', description: 'Your order has been confirmed successfully. (Demo Mode)' });
        clearCart();
        setDeliveryAddress('');
        setContactPhone('');
        return;
      }

      // 4b. Production — open real Razorpay modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "GramConnect",
        description: "Fresh produce directly from farmers",
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          // 5. Verify Payment
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
              },
              body: JSON.stringify({
                orderId: order._id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              toast({ title: 'Success', description: 'Payment successful! Order placed.' });
              clearCart();
              setDeliveryAddress('');
              setContactPhone('');
            } else {
              toast({ title: 'Error', description: 'Payment verification failed', variant: 'destructive' });
            }
          } catch (error) {
            toast({ title: 'Error', description: 'Failed to verify payment', variant: 'destructive' });
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: contactPhone,
        },
        theme: {
          color: "#16a34a",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error.message || 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleSplitPayment = async () => {
    if (!deliveryAddress || !contactPhone) {
      toast({ title: 'Error', description: 'Please fill in delivery details', variant: 'destructive' });
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!userInfo.token) {
        toast({ title: 'Error', description: 'Please login to place an order', variant: 'destructive' });
        return;
      }

      // 1. Create Order in Backend (Payment Status: Pending)
      const orderItems = cartItems.map(item => ({
        product: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.pricePerUnit,
        farmer: item.product.farmerId
      }));

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: total,
          deliverySlotId: selectedSlotId || undefined,
          shippingAddress: {
            address: deliveryAddress,
            city: 'Unknown',
            postalCode: '000000',
            country: 'India',
          },
        }),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const order = await orderRes.json();

      // 2. Initiate Split Payment (Demo: 50/50 split with a friend)
      const halfAmount = total / 2;
      const splitRes = await fetch('/api/split-payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          orderId: order._id,
          contributors: [
            { userId: userInfo._id, name: userInfo.name || 'You', amountAllocated: halfAmount },
            { userId: null, name: 'Your Friend', amountAllocated: halfAmount },
          ]
        }),
      });

      if (!splitRes.ok) throw new Error('Failed to initiate split payment');
      const splitData = await splitRes.json();

      clearCart();
      toast({ title: 'Group Payment Created', description: 'Redirecting to split payment page...' });
      navigate(`/consumer/split-payment/${splitData.groupId}`);

    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error.message || 'Something went wrong', variant: 'destructive' });
    }
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Start shopping to add fresh produce to your cart
            </p>
            <Button asChild>
              <Link to="/products">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="h-20 w-20 rounded-xl bg-gram-green-50 flex items-center justify-center text-3xl shrink-0">
                          {categories.find(c => c.value === item.product.category)?.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold">{item.product.name}</h3>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {item.product.farmerVillage}
                              </div>
                              {item.product.isOrganic && (
                                <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary">
                                  <Leaf className="h-3 w-3" />
                                  Organic
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm text-muted-foreground ml-1">{item.product.unit}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                ₹{item.product.pricePerUnit * item.quantity}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ₹{item.product.pricePerUnit}/{item.product.unit}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Delivery Details */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Delivery Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Delivery Address</label>
                      <Input
                        placeholder="Enter your full delivery address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Contact Phone</label>
                      <Input
                        placeholder="+91 98765 43210"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                     </div>
                     <div className="pt-2 border-t border-border">
                       <DeliverySlotPicker
                         selectedSlotId={selectedSlotId}
                         onSelect={setSelectedSlotId}
                         token={userInfo.token || ""}
                       />
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>

             {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>{deliveryFee === 0 ? <span className="text-green-600">Free</span> : `₹${deliveryFee}`}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Free delivery on orders above ₹500
                      </p>
                    )}
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">₹{total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
                      Place Order (Full Payment)
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <Button className="w-full" variant="outline" size="lg" onClick={handleSplitPayment}>
                      Split Payment with Friends
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Payment: Securely via Razorpay
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Cart;
