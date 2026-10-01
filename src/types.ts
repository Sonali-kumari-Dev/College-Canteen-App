export type Role = 'STUDENT' | 'ADMIN' | 'KITCHEN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  organizationName: string;
  phone?: string;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Food {
  _id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  isAvailable: boolean;
  imageUrl?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  food: Food;
  quantity: number;
}

export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  foodId: string;
  foodName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  organizationId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'Cash at Counter';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  _id: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  organizationId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSales: number;
}

export interface DailyReport {
  date: string;
  orders: number;
  sales: number;
}

export interface PopularFoodItem {
  foodId: string;
  name: string;
  count: number;
  revenue: number;
}

export interface ReportsData {
  totalOrders: number;
  completedOrders: number;
  totalSales: number;
  dailyOrders: DailyReport[];
  popularFoodItems: PopularFoodItem[];
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(Number(amount || 0) * 100) / 100;
  return `₹${rounded.toLocaleString('en-IN', {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
