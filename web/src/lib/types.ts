export type Role = "ADMIN" | "WAITER" | "KITCHEN";
export type TableStatus = "FREE" | "OCCUPIED";
export type OrderStatus = "OPEN" | "PREPARING" | "READY" | "CLOSED" | "CANCELED";
export type ItemStatus = "PENDING" | "PREPARING" | "READY" | "CANCELED";

export interface Session {
  id: string;
  name: string;
  email: string;
  role: Role;
  token: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  active: boolean;
  categoryId: string;
  category?: Category;
}

export interface Table {
  id: string;
  number: number;
  name: string | null;
  status: TableStatus;
  active: boolean;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  notes: string | null;
  status: ItemStatus;
  changed: boolean;
  paidQuantity: number;
  product: { id: string; name: string; description: string; price: string };
}

export interface Order {
  id: string;
  status: OrderStatus;
  notes: string | null;
  customerName: string | null;
  created_at: string;
  table: { id: string; number: number; name: string | null };
  waiter: { id: string; name: string };
  items: OrderItem[];
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Summary {
  ordersToday: number;
  openOrders: number;
  occupiedTables: number;
  revenueToday: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  price: string | null;
  totalSold: number;
}
