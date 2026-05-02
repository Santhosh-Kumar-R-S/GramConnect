import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, ShoppingBag, Package, TrendingUp,
  CheckCircle, XCircle, Clock, Eye, UserCheck, UserX, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { ProductCategory } from '@/types';

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

const stats = [
  { label: 'Total Farmers', value: 156, icon: Users, color: 'bg-primary/10 text-primary', change: '+12%' },
  { label: 'Total Consumers', value: 1420, icon: Users, color: 'bg-accent/10 text-accent', change: '+8%' },
  { label: 'Total Orders', value: 342, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600', change: '+15%' },
  { label: 'Total Revenue', value: '₹4.2L', icon: TrendingUp, color: 'bg-green-100 text-green-600', change: '+22%' },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'orders' | 'users' | 'certifications'>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [consumers, setConsumers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    totalFarmers: 0,
    totalConsumers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [viewingActivity, setViewingActivity] = useState(false);

  const fetchPendingApprovals = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!userInfo.token) return;
      const res = await fetch('/api/admin/users?role=farmer&status=pending', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      if (res.ok) setPendingApprovals(await res.json());
    } catch (err) {
      console.error("Failed to fetch pending approvals", err);
    }
  };

  const fetchCertifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!userInfo.token) return;
      const res = await fetch('/api/certifications/pending', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      if (res.ok) setCertifications(await res.json());
    } catch (err) {
      console.error("Failed to fetch certifications", err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const response = await fetch(`/api/admin/farmers/${id}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchData(); // Refresh all data
        fetchPendingApprovals(); // Refresh pending list specifically
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleVerifyCert = async (id: string, status: string) => {
    const reason = status === 'rejected' ? prompt("Enter rejection reason:") : "";
    if (status === 'rejected' && !reason) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const res = await fetch(`/api/certifications/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      if (res.ok) fetchCertifications();
    } catch (error) {
      console.error('Error verifying cert:', error);
    }
  };

  const fetchData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo.token;
      if (!token) return;

      // Pending Approvals (Keep existing)
      fetchPendingApprovals();
      fetchCertifications();

      // Fetch All Orders
      const orderRes = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData.map((o: any) => ({
          id: o._id,
          consumerId: o.consumer?._id,
          consumerName: o.consumer?.name || 'Unknown',
          totalAmount: o.totalAmount,
          status: o.status,
          createdAt: o.createdAt,
          items: o.items || []
        })));
      }

      // Fetch All Products (for Farmer activity)
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        setProducts(await productsRes.json());
      }

      // Fetch All Users (to filter active farmers/consumers) - Need an endpoint or reuse user search
      // Assuming /api/admin/users returns all if no specific query or we can filter by role
      // Let's use two calls for simplicity if backend supports query params filters which it does
      const farmersRes = await fetch('/api/admin/users?role=farmer&status=approved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (farmersRes.ok) setFarmers(await farmersRes.json());

      const consumersRes = await fetch('/api/admin/users?role=consumer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (consumersRes.ok) setConsumers(await consumersRes.json());


    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setStatsData({
      totalFarmers: farmers.length,
      totalConsumers: consumers.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((acc, o) => acc + o.totalAmount, 0)
    });
  }, [farmers, consumers, orders]);

  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </div>
                <p className="text-muted-foreground">Manage GramConnect platform</p>
                <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                  &larr; Back to Home
                </Link>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm">
                <Clock className="h-4 w-4" />
                <span>{pendingApprovals.length} farmers awaiting approval</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Farmers', value: statsData.totalFarmers, icon: Users, color: 'bg-primary/10 text-primary' },
              { label: 'Total Consumers', value: statsData.totalConsumers, icon: Users, color: 'bg-accent/10 text-accent' },
              { label: 'Total Orders', value: statsData.totalOrders, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
              { label: 'Total Revenue', value: `₹${statsData.totalRevenue}`, icon: TrendingUp, color: 'bg-green-100 text-green-600' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className={cn("p-2 rounded-lg", stat.color)}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'approvals', label: 'Approvals', icon: UserCheck },
              { id: 'certifications', label: 'Certifications', icon: ShieldCheck },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'users', label: 'Users', icon: Users },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="shrink-0"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{order.consumerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} items from {order.farmerName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{order.totalAmount}</p>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            order.status === 'pending' && "bg-amber-100 text-amber-700",
                            order.status === 'accepted' && "bg-blue-100 text-blue-700",
                            order.status === 'delivered' && "bg-green-100 text-green-700",
                          )}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Products by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.length > 0 ? categories.slice(0, 5).map((cat) => {
                      const categoryCount = orders.reduce((acc, order) => {
                        const count = order.items?.filter((i: any) => i.product?.category === cat.value).length || 0;
                        return acc + count;
                      }, 0);
                      const totalItems = orders.reduce((acc, order) => acc + (order.items?.length || 0), 0);
                      const percentage = totalItems > 0 ? Math.round((categoryCount / totalItems) * 100) : 0;

                      if (percentage === 0) return null;

                      return (
                        <div key={cat.value}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-2 text-sm">
                              {cat.icon} {cat.label}
                            </span>
                            <span className="text-sm font-medium">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.1, duration: 0.5 }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No order data available.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Farmer Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingApprovals.length > 0 ? (
                    <div className="space-y-4">
                      {pendingApprovals.map((farmer: any) => (
                        <div
                          key={farmer._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-xl"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gram-green-100 flex items-center justify-center text-xl">
                              👨‍🌾
                            </div>
                            <div>
                              <h3 className="font-semibold">{farmer.name}</h3>
                              <p className="text-sm text-muted-foreground">{farmer.email}</p>
                              <div className="flex flex-col gap-1 mt-1">
                                <span className="text-xs text-muted-foreground">{farmer.village || 'No Village'}, {farmer.state || 'No State'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground mr-2">
                              {new Date(farmer.createdAt).toLocaleDateString('en-IN')}
                            </span>
                            <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={() => updateStatus(farmer._id, 'rejected')}>
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => updateStatus(farmer._id, 'approved')}>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h3 className="font-semibold mb-1">All caught up!</h3>
                      <p className="text-muted-foreground">No pending approvals at the moment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approved Farmers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approved Farmers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {farmers.map((farmer) => (
                      <div
                        key={farmer.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gram-green-100 flex items-center justify-center">
                            👨‍🌾
                          </div>
                          <div>
                            <p className="font-medium">{farmer.name}</p>
                            <p className="text-sm text-muted-foreground">{farmer.village}, {farmer.state}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Active
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedFarmer(farmer)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Consumer</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? <tr><td colSpan={5} className="text-center py-4">No orders found</td></tr> : orders.map((order) => (
                          <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">#{order.id.substring(0, 6)}...</td>
                            <td className="py-3 px-4">{order.consumerName}</td>
                            <td className="py-3 px-4 font-medium">₹{order.totalAmount}</td>
                            <td className="py-3 px-4">
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full font-medium",
                                order.status === 'pending' && "bg-amber-100 text-amber-700",
                                order.status === 'accepted' && "bg-blue-100 text-blue-700",
                                order.status === 'delivered' && "bg-green-100 text-green-700",
                              )}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-sm">
                              {new Date(order.createdAt).toLocaleDateString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Farmers ({farmers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {farmers.map((farmer) => (
                      <div
                        key={farmer.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gram-green-100 flex items-center justify-center">
                            👨‍🌾
                          </div>
                          <div>
                            <p className="font-medium">{farmer.name}</p>
                            <p className="text-sm text-muted-foreground">{farmer.village}</p>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => { console.log('Farmer clicked:', farmer); setSelectedFarmer(farmer); }}>View</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consumers ({consumers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {consumers.map((consumer, i) => (
                      <div
                        key={consumer._id || i}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                            🛒
                          </div>
                          <div>
                            <p className="font-medium">{consumer.name}</p>
                            <p className="text-sm text-muted-foreground">Consumer</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { console.log('Consumer clicked:', consumer); setSelectedFarmer(consumer); }}>View</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Pending Certifications</h2>
                  <p className="text-muted-foreground">Verify farmer organic and safety certificates</p>
                </div>
              </div>

              {certifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No pending certifications to review.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {certifications.map((cert) => (
                    <Card key={cert._id}>
                      <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 text-primary rounded-lg">
                            <ShieldCheck className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{cert.type} Certificate</h3>
                            <p className="text-sm text-muted-foreground">Farmer: {cert.farmer?.name} ({cert.farmer?.village})</p>
                            <p className="text-xs text-muted-foreground mt-1">Submitted: {new Date(cert.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" /> View Document
                            </Button>
                          </a>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleVerifyCert(cert._id, 'approved')}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleVerifyCert(cert._id, 'rejected')}>
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>

      <Dialog open={!!selectedFarmer} onOpenChange={(open) => {
        if (!open) {
          setSelectedFarmer(null);
          setViewingActivity(false);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingActivity ? (selectedFarmer?.role === 'consumer' ? 'User Orders' : 'Farmer Crops') : 'User Details'}</DialogTitle>
            <DialogDescription>
              {viewingActivity ? `Activity for ${selectedFarmer?.name}` : 'Information about the selected account.'}
            </DialogDescription>
          </DialogHeader>

          {selectedFarmer && !viewingActivity && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-3xl ${selectedFarmer.role === 'consumer' ? 'bg-accent/20' : 'bg-gram-green-100'}`}>
                  {selectedFarmer.role === 'consumer' ? '🛒' : '👨‍🌾'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedFarmer.name}</h3>
                  <p className="text-muted-foreground">{selectedFarmer.email}</p>
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    {selectedFarmer.role || 'Farmer'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div>
                  <p className="font-medium text-muted-foreground">Phone</p>
                  <p>{selectedFarmer.phone || 'Not Available'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <p className="capitalize text-green-600 font-medium">{selectedFarmer.status || 'Approved'}</p>
                </div>
                {(selectedFarmer.role !== 'consumer') && (
                  <>
                    <div>
                      <p className="font-medium text-muted-foreground">Village</p>
                      <p>{selectedFarmer.village || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">State</p>
                      <p>{selectedFarmer.state || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <p className="font-medium text-muted-foreground">Joined On</p>
                  <p>{new Date(selectedFarmer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                onClick={() => setViewingActivity(true)}
              >
                {selectedFarmer.role === 'consumer' ? 'View Orders' : 'View Crops'}
              </Button>
            </div>
          )}

          {selectedFarmer && viewingActivity && (
            <div className="space-y-4">
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {selectedFarmer.role === 'consumer' ? (
                  orders.filter(o => o.consumerId === selectedFarmer._id).length > 0 ? (
                    orders.filter(o => o.consumerId === selectedFarmer._id).map((order) => (
                      <div key={order.id} className="p-3 border rounded-lg bg-muted/30">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Order #{order.id.slice(-6)}</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{order.status}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.items.length} items: {order.items.map((i: any) => i.product?.name || 'Item').join(', ')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No orders found.</p>
                  )
                ) : (
                  products.filter(p => p.farmer?._id === selectedFarmer._id || p.farmer === selectedFarmer._id).length > 0 ? (
                    products.filter(p => p.farmer?._id === selectedFarmer._id || p.farmer === selectedFarmer._id).map((product: any) => (
                      <div key={product._id} className="flex gap-3 p-3 border rounded-lg bg-muted/30">
                        <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          {product.image && product.image !== '/placeholder.svg' ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-medium truncate">{product.name}</h4>
                            <span className="text-sm font-semibold whitespace-nowrap">₹{product.pricePerUnit}/{product.unit}</span>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{product.category} • {product.quantityAvailable} {product.unit} avail.</p>
                          <div className="flex gap-1 mt-1">
                            {product.isOrganic && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">Organic</span>
                            )}
                            {product.isAvailable ? (
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">In Stock</span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No crops listed.</p>
                  )
                )}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setViewingActivity(false)}
              >
                Back to Details
              </Button>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </Layout >
  );
};

export default AdminDashboard;
