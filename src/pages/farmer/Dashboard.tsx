import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Plus, ShoppingBag, TrendingUp, Clock,
  Check, Truck, Edit, Trash2, Eye, Handshake, X
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Product, Order, ProductCategory } from '@/types';
import { cn } from '@/lib/utils';
// Keeping categories configuration local or moved to a constants file. Reusing local definition for now.
const categoriesList: { value: ProductCategory; label: string; icon: string }[] = [
  { value: 'vegetables', label: 'Vegetables', icon: '🥬' },
  { value: 'fruits', label: 'Fruits', icon: '🍎' },
  { value: 'grains', label: 'Grains', icon: '🌾' },
  { value: 'pulses', label: 'Pulses', icon: '🫘' },
  { value: 'spices', label: 'Spices', icon: '🌶️' },
  { value: 'dairy', label: 'Dairy', icon: '🥛' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const FarmerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'negotiations'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'vegetables',
    unit: 'kg',
    pricePerUnit: '',
    quantityAvailable: '',
    harvestDate: '',
    description: '',
    isOrganic: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!userInfo.token) return;

      // Fetch Farmer's Products using the specific endpoint
      const productRes = await fetch('/api/products/farmer', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const productData = await productRes.json();

      if (productRes.ok) {
        const myProducts = productData.map((p: any) => ({
          id: p._id,
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
          farmerId: userInfo.user?.id,
          farmerName: userInfo.user?.name,
          farmerVillage: userInfo.user?.village || ''
        }));
        setProducts(myProducts);
      }

      // Fetch Orders
      const orderRes = await fetch('/api/orders/myorders', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const orderData = await orderRes.json();
      if (orderRes.ok) {
        // Transform if necessary
        setOrders(orderData.map((o: any) => ({
          id: o._id,
          consumerId: o.consumer._id,
          consumerName: o.consumer.name,
          items: o.items.map((i: any) => ({
            productId: i.product,
            productName: i.name,
            quantity: i.quantity,
            pricePerUnit: i.price,
            total: i.quantity * i.price
          })),
          totalAmount: o.totalAmount,
          status: o.status,
          deliveryAddress: o.shippingAddress?.address || 'N/A',
          contactPhone: 'N/A', // Schema separation
          createdAt: new Date(o.createdAt),
          updatedAt: new Date(o.updatedAt)
        })));
      }

      // Fetch Negotiations
      const negRes = await fetch('/api/negotiations', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const negData = await negRes.json();
      if (negRes.ok) {
        setNegotiations(negData);
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const payload = {
        ...newProduct,
        price: Number(newProduct.pricePerUnit),
        quantity: Number(newProduct.quantityAvailable)
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: "Product Added", description: "Your product is now live." });
        setIsAddProductOpen(false);
        fetchData(); // Refresh list
        setNewProduct({
          name: '', category: 'vegetables', unit: 'kg', pricePerUnit: '',
          quantityAvailable: '', harvestDate: '', description: '', isOrganic: false
        });
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  const handleEditProduct = (product: Product) => {
    setNewProduct({
      name: product.name,
      category: product.category as any,
      unit: product.unit,
      pricePerUnit: product.pricePerUnit.toString() as any,
      quantityAvailable: product.quantityAvailable.toString() as any,
      harvestDate: product.harvestDate ? new Date(product.harvestDate).toISOString().split('T')[0] : '',
      description: product.description || '',
      isOrganic: product.isOrganic || false
    });
    setEditingProductId(product.id);
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      if (res.ok) {
        toast({ title: 'Deleted', description: 'Product has been deleted.' });
        fetchData();
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast({ title: 'Status Updated', description: `Order marked as ${newStatus}` });
        fetchData();
        setSelectedOrder(null);
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleNegotiationUpdate = async (negId: string, status: string) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const res = await fetch(`/api/negotiations/${negId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast({ title: 'Negotiation Updated', description: `Marked as ${status}` });
        fetchData();
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update negotiation', variant: 'destructive' });
    }
  };

  const stats = [
    { label: 'Active Products', value: products.length, icon: Package, color: 'text-primary' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-accent' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-amber-500' },
    { label: 'Total Earnings', value: `₹${orders.reduce((acc, o) => acc + o.totalAmount, 0)}`, icon: TrendingUp, color: 'text-green-600' }, // Simple calculation
  ];

  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
                <p className="text-muted-foreground">Manage your produce and orders</p>
              </div>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingProductId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g., Fresh Tomatoes"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                          className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                          value={newProduct.category}
                          onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                        >
                          {categoriesList.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <select
                          className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                          value={newProduct.unit}
                          onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                        >
                          <option value="kg">Kilogram (kg)</option>
                          <option value="dozen">Dozen</option>
                          <option value="piece">Piece</option>
                          <option value="bunch">Bunch</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price per Unit (₹)</Label>
                        <Input
                          type="number"
                          value={newProduct.pricePerUnit}
                          onChange={e => setNewProduct({ ...newProduct, pricePerUnit: e.target.value })}
                          placeholder="40"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity Available</Label>
                        <Input
                          type="number"
                          value={newProduct.quantityAvailable}
                          onChange={e => setNewProduct({ ...newProduct, quantityAvailable: e.target.value })}
                          placeholder="100"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Harvest Date</Label>
                      <Input
                        type="date"
                        value={newProduct.harvestDate}
                        onChange={e => setNewProduct({ ...newProduct, harvestDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea
                        className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-input bg-background resize-none"
                        placeholder="Describe your product..."
                        value={newProduct.description}
                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="organic"
                        className="rounded"
                        checked={newProduct.isOrganic}
                        onChange={e => setNewProduct({ ...newProduct, isOrganic: e.target.checked })}
                      />
                      <Label htmlFor="organic" className="text-sm font-normal">This is an organic product</Label>
                    </div>
                    <Button type="submit" className="w-full">
                      {editingProductId ? 'Update Product' : 'Add Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-muted", stat.color)}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'products' ? 'default' : 'outline'}
              onClick={() => setActiveTab('products')}
            >
              <Package className="h-4 w-4 mr-2" />
              My Products
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </Button>
            <Button
              variant={activeTab === 'negotiations' ? 'default' : 'outline'}
              onClick={() => setActiveTab('negotiations')}
            >
              <Handshake className="h-4 w-4 mr-2" />
              Negotiations
              {negotiations.filter(n => n.status === 'PENDING').length > 0 && (
                <span className="ml-2 bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full text-xs">
                  {negotiations.filter(n => n.status === 'PENDING').length}
                </span>
              )}
            </Button>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4"
            >
              {products.length === 0 ? <p className="text-muted-foreground">No products found. Add one!</p> : products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-gram-green-50 flex items-center justify-center text-3xl">
                          {categoriesList.find(c => c.value === product.category)?.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-primary font-medium">₹{product.pricePerUnit}/{product.unit}</span>
                            <span className="text-sm text-muted-foreground">{product.quantityAvailable} {product.unit} available</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/products?search=${product.name}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4"
            >
              {orders.length === 0 ? <p className="text-muted-foreground">No orders yet.</p> : orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">Order #{order.id}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            order.status === 'Pending' && "bg-amber-100 text-amber-700",
                            order.status === 'Accepted' && "bg-blue-100 text-blue-700",
                            order.status === 'Packed' && "bg-purple-100 text-purple-700",
                            order.status === 'Shipped' && "bg-cyan-100 text-cyan-700",
                            order.status === 'Delivered' && "bg-green-100 text-green-700",
                            order.status === 'Rejected' && "bg-red-100 text-red-700",
                          )}>
                            {order.status}
                          </span>
                        </div>
                        <h3 className="font-semibold">{order.consumerName}</h3>
                        <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                        <div className="mt-2">
                          {order.items.map((item, i) => (
                            <span key={i} className="text-sm">
                              {item.quantity}x {item.productName}
                              {i < order.items.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xl font-bold text-primary">₹{order.totalAmount}</span>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {order.status === 'Pending' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusUpdate(order.id, 'Accepted')}>
                              <Check className="h-3 w-3 mr-1" /> Accept
                            </Button>
                          )}
                          {order.status === 'Accepted' && (
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleStatusUpdate(order.id, 'Packed')}>
                              📦 Pack
                            </Button>
                          )}
                          {order.status === 'Packed' && (
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => handleStatusUpdate(order.id, 'Shipped')}>
                              <Truck className="h-3 w-3 mr-1" /> Ship
                            </Button>
                          )}
                          {order.status === 'Shipped' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(order.id, 'Delivered')}>
                              <Check className="h-3 w-3 mr-1" /> Deliver
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>View Details</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Negotiations Tab */}
          {activeTab === 'negotiations' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4"
            >
              {negotiations.length === 0 ? <p className="text-muted-foreground">No negotiation requests yet.</p> : negotiations.map((neg) => (
                <Card key={neg._id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">Consumer: {neg.consumer?.name}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            neg.status === 'PENDING' && "bg-amber-100 text-amber-700",
                            neg.status === 'ACCEPTED' && "bg-green-100 text-green-700",
                            neg.status === 'REJECTED' && "bg-red-100 text-red-700",
                            neg.status === 'EXPIRED' && "bg-gray-100 text-gray-700"
                          )}>
                            {neg.status}
                          </span>
                        </div>
                        <h3 className="font-semibold">{neg.product?.name}</h3>
                        
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm bg-muted/50 p-3 rounded-lg">
                          <div>
                            <p className="text-muted-foreground">Requested Quantity</p>
                            <p className="font-medium">{neg.quantity} {neg.product?.unit}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Offered Price</p>
                            <p className="font-bold text-primary">₹{neg.requestedPrice}/{neg.product?.unit}</p>
                            <p className="text-xs text-muted-foreground line-through">Original: ₹{neg.product?.pricePerUnit}/{neg.product?.unit}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
                        <span className="text-xl font-bold text-primary">
                          Total: ₹{(neg.quantity * neg.requestedPrice).toLocaleString()}
                        </span>
                        
                        {neg.status === 'PENDING' && (
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="destructive" onClick={() => handleNegotiationUpdate(neg._id, 'REJECTED')}>
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleNegotiationUpdate(neg._id, 'Accepted')}>
                              <Check className="h-4 w-4 mr-1" /> Accept
                            </Button>
                          </div>
                        )}
                        {neg.status === 'ACCEPTED' && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Awaiting consumer checkout. Valid for 7 days.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Full details for this order</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order #{selectedOrder.id}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  selectedOrder.status === 'Pending' && "bg-amber-100 text-amber-700",
                  selectedOrder.status === 'Accepted' && "bg-blue-100 text-blue-700",
                  selectedOrder.status === 'Packed' && "bg-purple-100 text-purple-700",
                  selectedOrder.status === 'Shipped' && "bg-cyan-100 text-cyan-700",
                  selectedOrder.status === 'Delivered' && "bg-green-100 text-green-700",
                  selectedOrder.status === 'Rejected' && "bg-red-100 text-red-700",
                )}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedOrder.consumerName}</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{selectedOrder.deliveryAddress}</p>
                {selectedOrder.contactPhone && selectedOrder.contactPhone !== 'N/A' && (
                  <p className="text-sm text-muted-foreground ml-6">📞 {selectedOrder.contactPhone}</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Items Ordered</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 border rounded-lg bg-white">
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} × ₹{item.pricePerUnit}</p>
                      </div>
                      <span className="font-semibold text-sm">₹{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Total Amount</span>
                <span className="text-xl font-bold text-primary">₹{selectedOrder.totalAmount}</span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Ordered on {selectedOrder.createdAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default FarmerDashboard;
