// انواع داده‌ها

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  isOnline: boolean;
  lastActivity: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  color: string;
  purchasePrice: number; // قیمت خرید هر متر
  salePrice: number; // قیمت فروش هر متر
  quantity: number; // موجودی به متر
  category: string;
  description: string;
  lowStockThreshold: number; // هشدار کمبود
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalDebt: number; // مجموع بدهی
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  meters: number; // تعداد متر فروخته شده
  pricePerMeter: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  paymentType: 'cash' | 'credit'; // نقد / نسیه
  customerId?: string;
  customerName?: string;
  createdBy: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  customerId: string;
  customerName: string;
  saleId?: string;
  amount: number;
  type: 'debt' | 'payment'; // بدهی یا پرداخت
  description: string;
  date: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: 'rent' | 'electricity' | 'salary' | 'other';
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: 'add' | 'subtract';
  quantity: number;
  reason: string;
  date: string;
  createdAt: string;
}

// درخواست بازیابی رمز عبور
export interface PasswordResetRequest {
  id: string;
  userId: string;
  username: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  resolvedAt?: string;
}

// صلاحیت‌ها
export interface Permissions {
  // محصولات
  canAddProduct: boolean;
  canEditProduct: boolean;
  canDeleteProduct: boolean;
  canViewProducts: boolean;
  // انبار
  canManageInventory: boolean;
  canViewInventory: boolean;
  // فروش
  canAddSale: boolean;
  canEditSale: boolean;
  canDeleteSale: boolean;
  canViewAllSales: boolean;
  canViewDailySales: boolean;
  // مشتریان
  canAddCustomer: boolean;
  canEditCustomer: boolean;
  canDeleteCustomer: boolean;
  canViewCustomers: boolean;
  // نسیه
  canAddDebt: boolean;
  canEditDebt: boolean;
  canDeleteDebt: boolean;
  canViewDebts: boolean;
  // مصارف
  canAddExpense: boolean;
  canEditExpense: boolean;
  canDeleteExpense: boolean;
  canViewExpenses: boolean;
  // گزارش‌ها
  canViewFullReports: boolean;
  canViewBasicReports: boolean;
  // کاربران
  canManageUsers: boolean;
}

export const ADMIN_PERMISSIONS: Permissions = {
  canAddProduct: true,
  canEditProduct: true,
  canDeleteProduct: true,
  canViewProducts: true,
  canManageInventory: true,
  canViewInventory: true,
  canAddSale: true,
  canEditSale: true,
  canDeleteSale: true,
  canViewAllSales: true,
  canViewDailySales: true,
  canAddCustomer: true,
  canEditCustomer: true,
  canDeleteCustomer: true,
  canViewCustomers: true,
  canAddDebt: true,
  canEditDebt: true,
  canDeleteDebt: true,
  canViewDebts: true,
  canAddExpense: true,
  canEditExpense: true,
  canDeleteExpense: true,
  canViewExpenses: true,
  canViewFullReports: true,
  canViewBasicReports: true,
  canManageUsers: true,
};

export const STAFF_PERMISSIONS: Permissions = {
  canAddProduct: false,
  canEditProduct: false,
  canDeleteProduct: false,
  canViewProducts: true,
  canManageInventory: false,
  canViewInventory: true,
  canAddSale: true,
  canEditSale: false,
  canDeleteSale: false,
  canViewAllSales: false,
  canViewDailySales: true,
  canAddCustomer: true,
  canEditCustomer: false,
  canDeleteCustomer: false,
  canViewCustomers: true,
  canAddDebt: true,
  canEditDebt: false,
  canDeleteDebt: false,
  canViewDebts: true,
  canAddExpense: false,
  canEditExpense: false,
  canDeleteExpense: false,
  canViewExpenses: false,
  canViewFullReports: false,
  canViewBasicReports: true,
  canManageUsers: false,
};
