// User Types
export type UserRole = 'farmer' | 'consumer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  isApproved: boolean;
}

export interface Farmer extends User {
  role: 'farmer';
  village: string;
  district: string;
  state: string;
  cropsGrown: string[];
  farmSize?: string;
  bio?: string;
  profileImage?: string;
}

export interface Consumer extends User {
  role: 'consumer';
  address?: string;
  city?: string;
  pincode?: string;
}

// Product Types
export type ProductCategory =
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'pulses'
  | 'spices'
  | 'dairy'
  | 'other';

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  name: string;
  category: ProductCategory;
  description?: string;
  pricePerUnit: number;
  unit: string;
  quantityAvailable: number;
  harvestDate: Date;
  images: string[];
  isOrganic: boolean;
  isAvailable: boolean;
  createdAt: Date;
}

// Order Types
export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Rejected';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

export interface Order {
  id: string;
  consumerId: string;
  consumerName: string;
  farmerId: string;
  farmerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: string;
  contactPhone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Analytics Types
export interface AdminAnalytics {
  totalFarmers: number;
  totalConsumers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  recentOrders: Order[];
}
