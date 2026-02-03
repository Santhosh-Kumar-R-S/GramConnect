import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Plus, ShoppingBag, TrendingUp, Clock,
  Check, Truck, Edit, Trash2, Eye
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
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
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
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

      // Fetch Products - In a real app, this endpoint would filter by logged-in farmer
      // For MVP, assuming GET /api/products returns all, we might need a specific 'my-products' endpoint 
      // or filter on client if backend doesn't support it yet.
      // Actually, let's just fetch all and filter client side for now if needed, 
      // OR better, assuming the backend could easily have a /api/products/myproducts.
      // Given current backend implementation:
      // router.post('/', protect ...) for creation
      // router.get('/') for all
      // We'll use get all and filter by farmer ID from token (decoded) or user info.

      const productRes = await fetch('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const productData = await productRes.json();

      if (productRes.ok) {
        // Filter locally for now as the 'GET /' is public and returns all. 
        // Ideally backend should have 'my-products'
        const myProducts = productData.filter((p: any) => p.farmer._id === userInfo._id).map((p: any) => ({
          id: p._id,
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
          farmerId: p.farmer._id,
          farmerName: p.farmer.name,
          farmerVillage: p.farmer.village
        }));
        setProducts(myProducts);
      }

      // Fetch Orders
      const orderRes = await fetch('http://localhost:5000/api/orders/myorders', {
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
          deliveryAddress: o.shippingAddress.address,
          contactPhone: 'N/A', // Schema separation
          createdAt: new Date(o.createdAt),
          updatedAt: new Date(o.updatedAt)
        })));
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(newProduct)
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
                    <DialogTitle>Add New Product</DialogTitle>
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
                    <Button type="submit" className="w-full">Add Product</Button>
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
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
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
                            order.status === 'pending' && "bg-amber-100 text-amber-700",
                            order.status === 'accepted' && "bg-blue-100 text-blue-700",
                            order.status === 'delivered' && "bg-green-100 text-green-700",
                          )}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FarmerDashboard;
