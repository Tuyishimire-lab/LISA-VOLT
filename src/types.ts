/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryID = 'lighting' | 'cctv' | 'electrical';

export interface ProductCategory {
  id: CategoryID;
  name: string;
  description: string;
  image: string;
  iconName: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  fullSpecs?: string[];
  price: number; // in RWF (Rwandan Franc)
  originalPrice?: number; // for showing discount
  rating: number; // e.g. 4.8
  reviewsCount: number;
  image: string;
  category: CategoryID;
  brand: string;
  isHot?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  inStock: boolean;
  specs?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  district: string; // e.g. Nyarugenge, Gasabo, Kicukiro
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string | 'guest';
  email: string;
  items: OrderItem[];
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  stripeSessionId?: string;
  status: 'received' | 'processing' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}
