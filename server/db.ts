import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

export interface IOrganization {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'ADMIN' | 'KITCHEN';
  organizationId: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFood {
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

export interface IOrderItem {
  foodId: string;
  foodName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface IOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  organizationId: string;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: 'Cash at Counter';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IFeedback {
  _id: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  organizationId: string;
  createdAt: string;
}

export interface IDatabaseSchema {
  organizations: IOrganization[];
  users: IUser[];
  categories: ICategory[];
  foods: IFood[];
  orders: IOrder[];
  feedbacks: IFeedback[];
}

function generateId(): string {
  // Generates 24-character hexadecimal ObjectId compatible string
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomPart = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return timestamp + randomPart;
}

class DatabaseEngine {
  private dbPath: string;
  private data: IDatabaseSchema;
  private isMongoConnected = false;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, 'canteenx.json');

    // Default empty production schema - NO PREDEFINED / FAKE DATA
    const emptySchema: IDatabaseSchema = {
      organizations: [],
      users: [],
      categories: [],
      foods: [],
      orders: [],
      feedbacks: [],
    };

    if (fs.existsSync(this.dbPath)) {
      try {
        const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure all collections exist
        this.data.organizations = this.data.organizations || [];
        this.data.users = this.data.users || [];
        this.data.categories = this.data.categories || [];
        this.data.foods = this.data.foods || [];
        this.data.orders = this.data.orders || [];
        this.data.feedbacks = this.data.feedbacks || [];
      } catch (err) {
        console.warn('Could not parse existing database file, starting clean:', err);
        this.data = emptySchema;
        this.persist();
      }
    } else {
      this.data = emptySchema;
      this.persist();
    }

    this.initMongoIfConfigured();
  }

  private persist() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private async initMongoIfConfigured() {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri.trim().length > 0) {
      try {
        await mongoose.connect(mongoUri);
        this.isMongoConnected = true;
        console.log('MongoDB connected successfully via MONGODB_URI.');
      } catch (err) {
        console.warn('Failed to connect to MONGODB_URI. Operating with persistent local document store:', err);
      }
    } else {
      console.log('Using persistent document database (data/canteenx.json). Database is ready.');
    }
  }

  // --- Organizations ---
  findOrganizationByName(name: string): IOrganization | undefined {
    const normalized = name.trim().toLowerCase();
    return this.data.organizations.find(
      (org) => org.name.trim().toLowerCase() === normalized
    );
  }

  findOrganizationById(id: string): IOrganization | undefined {
    return this.data.organizations.find((org) => org._id === id);
  }

  createOrganization(name: string): IOrganization {
    const now = new Date().toISOString();
    const org: IOrganization = {
      _id: generateId(),
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
    };
    this.data.organizations.push(org);
    this.persist();
    return org;
  }

  // --- Users ---
  findUserByEmail(email: string): IUser | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.trim().toLowerCase() === normalized);
  }

  findUserById(id: string): IUser | undefined {
    return this.data.users.find((u) => u._id === id);
  }

  createUser(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): IUser {
    const now = new Date().toISOString();
    const user: IUser = {
      _id: generateId(),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      role: userData.role,
      organizationId: userData.organizationId,
      phone: userData.phone ? userData.phone.trim() : undefined,
      createdAt: now,
      updatedAt: now,
    };
    this.data.users.push(user);
    this.persist();
    return user;
  }

  updateUser(id: string, updates: Partial<Pick<IUser, 'name' | 'phone'>>): IUser | null {
    const index = this.data.users.findIndex((u) => u._id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    const user = this.data.users[index];
    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    user.updatedAt = now;
    this.persist();
    return user;
  }

  getUsersByOrganization(organizationId: string): IUser[] {
    return this.data.users.filter((u) => u.organizationId === organizationId);
  }

  // --- Categories ---
  getCategories(organizationId: string): ICategory[] {
    return this.data.categories
      .filter((c) => c.organizationId === organizationId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  findCategoryById(id: string, organizationId: string): ICategory | undefined {
    return this.data.categories.find(
      (c) => c._id === id && c.organizationId === organizationId
    );
  }

  findCategoryByName(name: string, organizationId: string): ICategory | undefined {
    const normalized = name.trim().toLowerCase();
    return this.data.categories.find(
      (c) => c.organizationId === organizationId && c.name.trim().toLowerCase() === normalized
    );
  }

  createCategory(name: string, organizationId: string): ICategory {
    const now = new Date().toISOString();
    const category: ICategory = {
      _id: generateId(),
      name: name.trim(),
      organizationId,
      createdAt: now,
      updatedAt: now,
    };
    this.data.categories.push(category);
    this.persist();
    return category;
  }

  updateCategory(id: string, name: string, organizationId: string): ICategory | null {
    const cat = this.findCategoryById(id, organizationId);
    if (!cat) return null;
    cat.name = name.trim();
    cat.updatedAt = new Date().toISOString();
    this.persist();
    return cat;
  }

  deleteCategory(id: string, organizationId: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(
      (c) => !(c._id === id && c.organizationId === organizationId)
    );
    const deleted = this.data.categories.length < initialLen;
    if (deleted) {
      this.persist();
    }
    return deleted;
  }

  // --- Foods ---
  getFoods(
    organizationId: string,
    filters?: { categoryId?: string; search?: string; availableOnly?: boolean }
  ): IFood[] {
    let list = this.data.foods.filter((f) => f.organizationId === organizationId);

    if (filters?.categoryId) {
      list = list.filter((f) => f.categoryId === filters.categoryId);
    }

    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    if (filters?.availableOnly) {
      list = list.filter((f) => f.isAvailable);
    }

    // Attach category names dynamically
    return list.map((food) => {
      const cat = this.data.categories.find((c) => c._id === food.categoryId);
      return {
        ...food,
        categoryName: cat ? cat.name : 'Uncategorized',
      };
    });
  }

  findFoodById(id: string, organizationId: string): IFood | undefined {
    const food = this.data.foods.find(
      (f) => f._id === id && f.organizationId === organizationId
    );
    if (!food) return undefined;
    const cat = this.data.categories.find((c) => c._id === food.categoryId);
    return {
      ...food,
      categoryName: cat ? cat.name : 'Uncategorized',
    };
  }

  createFood(foodData: Omit<IFood, '_id' | 'createdAt' | 'updatedAt' | 'categoryName'>): IFood {
    const now = new Date().toISOString();
    const food: IFood = {
      _id: generateId(),
      name: foodData.name.trim(),
      description: foodData.description ? foodData.description.trim() : '',
      price: Number(foodData.price),
      categoryId: foodData.categoryId,
      isAvailable: foodData.isAvailable ?? true,
      imageUrl: foodData.imageUrl?.trim() || '',
      organizationId: foodData.organizationId,
      createdAt: now,
      updatedAt: now,
    };
    this.data.foods.push(food);
    this.persist();

    const cat = this.data.categories.find((c) => c._id === food.categoryId);
    return {
      ...food,
      categoryName: cat ? cat.name : 'Uncategorized',
    };
  }

  updateFood(
    id: string,
    updates: Partial<Omit<IFood, '_id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'categoryName'>>,
    organizationId: string
  ): IFood | null {
    const index = this.data.foods.findIndex(
      (f) => f._id === id && f.organizationId === organizationId
    );
    if (index === -1) return null;

    const food = this.data.foods[index];
    if (updates.name !== undefined) food.name = updates.name.trim();
    if (updates.description !== undefined) food.description = updates.description.trim();
    if (updates.price !== undefined) food.price = Number(updates.price);
    if (updates.categoryId !== undefined) food.categoryId = updates.categoryId;
    if (updates.isAvailable !== undefined) food.isAvailable = Boolean(updates.isAvailable);
    if (updates.imageUrl !== undefined) food.imageUrl = updates.imageUrl.trim();
    food.updatedAt = new Date().toISOString();

    this.persist();

    const cat = this.data.categories.find((c) => c._id === food.categoryId);
    return {
      ...food,
      categoryName: cat ? cat.name : 'Uncategorized',
    };
  }

  deleteFood(id: string, organizationId: string): boolean {
    const initialLen = this.data.foods.length;
    this.data.foods = this.data.foods.filter(
      (f) => !(f._id === id && f.organizationId === organizationId)
    );
    const deleted = this.data.foods.length < initialLen;
    if (deleted) {
      this.persist();
    }
    return deleted;
  }

  // --- Orders ---
  getOrders(
    organizationId: string,
    filters?: { userId?: string; status?: OrderStatus }
  ): IOrder[] {
    let list = this.data.orders.filter((o) => o.organizationId === organizationId);
    if (filters?.userId) {
      list = list.filter((o) => o.userId === filters.userId);
    }
    if (filters?.status) {
      list = list.filter((o) => o.status === filters.status);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  findOrderById(id: string, organizationId: string): IOrder | undefined {
    return this.data.orders.find(
      (o) => o._id === id && o.organizationId === organizationId
    );
  }

  createOrder(orderData: {
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    organizationId: string;
    items: IOrderItem[];
    totalAmount: number;
  }): IOrder {
    const now = new Date().toISOString();
    // Count existing orders for this org to generate incremental sequence number
    const count = this.data.orders.filter((o) => o.organizationId === orderData.organizationId).length + 1;
    const orderNumber = `CX-${count.toString().padStart(4, '0')}`;

    const order: IOrder = {
      _id: generateId(),
      orderNumber,
      userId: orderData.userId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      organizationId: orderData.organizationId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      paymentMethod: 'Cash at Counter',
      status: 'PLACED',
      createdAt: now,
      updatedAt: now,
    };
    this.data.orders.push(order);
    this.persist();
    return order;
  }

  updateOrderStatus(
    id: string,
    status: OrderStatus,
    organizationId: string
  ): IOrder | null {
    const order = this.findOrderById(id, organizationId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.persist();
    return order;
  }

  // --- Feedback ---
  getFeedbacks(organizationId: string): IFeedback[] {
    return this.data.feedbacks
      .filter((fb) => fb.organizationId === organizationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findFeedbackByOrderId(orderId: string, organizationId: string): IFeedback | undefined {
    return this.data.feedbacks.find(
      (fb) => fb.orderId === orderId && fb.organizationId === organizationId
    );
  }

  createFeedback(feedbackData: {
    orderId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    organizationId: string;
  }): IFeedback {
    const now = new Date().toISOString();
    const fb: IFeedback = {
      _id: generateId(),
      orderId: feedbackData.orderId,
      userId: feedbackData.userId,
      userName: feedbackData.userName,
      rating: feedbackData.rating,
      comment: feedbackData.comment.trim(),
      organizationId: feedbackData.organizationId,
      createdAt: now,
    };
    this.data.feedbacks.push(fb);
    this.persist();
    return fb;
  }

  // --- Statistics & Reports ---
  getDashboardStats(organizationId: string) {
    const orders = this.data.orders.filter((o) => o.organizationId === organizationId);
    const todayStr = new Date().toISOString().slice(0, 10);

    const todayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === todayStr);
    const pendingOrders = orders.filter(
      (o) => o.status === 'PLACED' || o.status === 'ACCEPTED' || o.status === 'PREPARING'
    );
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

    // Total sales from completed orders (or placed/accepted/completed non-cancelled orders)
    const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const totalSales = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      pendingOrders: pendingOrders.length,
      completedOrders: completedOrders.length,
      totalSales: Math.round(totalSales * 100) / 100,
    };
  }

  getReports(organizationId: string) {
    const orders = this.data.orders.filter((o) => o.organizationId === organizationId);

    // Group orders by date (last 7 days or all active dates)
    const dateMap: Record<string, { date: string; orders: number; sales: number }> = {};
    const popularItemsMap: Record<string, { foodId: string; name: string; count: number; revenue: number }> = {};

    let totalSales = 0;
    let completedCount = 0;

    for (const order of orders) {
      if (order.status === 'COMPLETED') completedCount++;
      if (order.status !== 'CANCELLED') {
        totalSales += order.totalAmount || 0;
        const d = order.createdAt.slice(0, 10);
        if (!dateMap[d]) {
          dateMap[d] = { date: d, orders: 0, sales: 0 };
        }
        dateMap[d].orders += 1;
        dateMap[d].sales += order.totalAmount || 0;

        // Count items
        for (const item of order.items) {
          if (!popularItemsMap[item.foodId]) {
            popularItemsMap[item.foodId] = {
              foodId: item.foodId,
              name: item.foodName,
              count: 0,
              revenue: 0,
            };
          }
          popularItemsMap[item.foodId].count += item.quantity;
          popularItemsMap[item.foodId].revenue += item.subtotal;
        }
      }
    }

    const dailyOrders = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
    const popularFoodItems = Object.values(popularItemsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalOrders: orders.length,
      completedOrders: completedCount,
      totalSales: Math.round(totalSales * 100) / 100,
      dailyOrders,
      popularFoodItems,
    };
  }
}

export const db = new DatabaseEngine();
