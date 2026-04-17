import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Product,
  Customer,
  Sale,
  Debt,
  Expense,
  InventoryLog,
  Permissions,
  ADMIN_PERMISSIONS,
  STAFF_PERMISSIONS,
  PasswordResetRequest,
} from '../types';

interface StoreState {
  // وضعیت اولیه‌سازی
  isInitialized: boolean;
  
  // کاربران
  users: User[];
  currentUser: User | null;
  
  // درخواست‌های بازیابی رمز
  passwordResetRequests: PasswordResetRequest[];
  
  // محصولات
  products: Product[];
  
  // مشتریان
  customers: Customer[];
  
  // فروش
  sales: Sale[];
  
  // نسیه
  debts: Debt[];
  
  // مصارف
  expenses: Expense[];
  
  // لاگ انبار
  inventoryLogs: InventoryLog[];
  
  // توابع کاربران
  login: (username: string, password: string) => User | null;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'isOnline' | 'lastActivity'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  changePassword: (userId: string, newPassword: string) => void;
  updateActivity: () => void;
  
  // توابع بازیابی رمز
  requestPasswordReset: (username: string) => boolean;
  approvePasswordReset: (requestId: string) => void;
  rejectPasswordReset: (requestId: string) => void;
  deletePasswordResetRequest: (requestId: string) => void;
  
  // توابع محصولات
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // توابع انبار
  addInventory: (productId: string, quantity: number, reason: string) => void;
  
  // توابع مشتریان
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalDebt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // توابع فروش
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  
  // توابع نسیه
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  addPayment: (customerId: string, amount: number, description: string) => void;
  deleteDebt: (id: string) => void;
  
  // توابع مصارف
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // گرفتن صلاحیت‌ها
  getPermissions: () => Permissions;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      users: [],
      currentUser: null,
      passwordResetRequests: [],
      products: [],
      customers: [],
      sales: [],
      debts: [],
      expenses: [],
      inventoryLogs: [],

      // کاربران
      login: (username, password) => {
        let users = get().users;
        
        // اگر هیچ کاربری نیست، کاربر پیش‌فرض ادمین بساز
        if (users.length === 0) {
          const defaultAdmin: User = {
            id: uuidv4(),
            username: 'admin',
            password: 'admin123',
            name: 'مدیر سیستم',
            role: 'admin',
            isOnline: false,
            lastActivity: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
          users = [defaultAdmin];
          set({ users, isInitialized: true });
        }
        
        const user = users.find(
          (u) => u.username === username && u.password === password
        );
        if (user) {
          const updatedUser = { ...user, isOnline: true, lastActivity: new Date().toISOString() };
          set((state) => ({
            currentUser: updatedUser,
            users: state.users.map((u) =>
              u.id === user.id ? updatedUser : u
            ),
          }));
          return updatedUser;
        }
        return null;
      },

      logout: () => {
        const currentUser = get().currentUser;
        if (currentUser) {
          set((state) => ({
            currentUser: null,
            users: state.users.map((u) =>
              u.id === currentUser.id ? { ...u, isOnline: false } : u
            ),
          }));
        } else {
          set({ currentUser: null });
        }
      },

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: uuidv4(),
          isOnline: false,
          lastActivity: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ users: [...state.users, newUser] }));
      },

      updateUser: (id, userData) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...userData } : u
          ),
        }));
      },

      deleteUser: (id) => {
        // جلوگیری از حذف تنها ادمین
        const admins = get().users.filter(u => u.role === 'admin');
        const userToDelete = get().users.find(u => u.id === id);
        
        if (userToDelete?.role === 'admin' && admins.length <= 1) {
          alert('نمی‌توانید تنها ادمین سیستم را حذف کنید!');
          return;
        }
        
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      changePassword: (userId, newPassword) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, password: newPassword } : u
          ),
        }));
      },

      updateActivity: () => {
        const currentUser = get().currentUser;
        if (currentUser) {
          const now = new Date().toISOString();
          set((state) => ({
            currentUser: { ...currentUser, lastActivity: now },
            users: state.users.map((u) =>
              u.id === currentUser.id ? { ...u, lastActivity: now } : u
            ),
          }));
        }
      },

      // درخواست بازیابی رمز
      requestPasswordReset: (username) => {
        const user = get().users.find(u => u.username === username);
        if (!user) return false;
        
        // بررسی اینکه آیا درخواست قبلی در انتظار دارد
        const existingRequest = get().passwordResetRequests.find(
          r => r.userId === user.id && r.status === 'pending'
        );
        if (existingRequest) return true; // درخواست قبلی وجود دارد
        
        const request: PasswordResetRequest = {
          id: uuidv4(),
          userId: user.id,
          username: user.username,
          userName: user.name,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          passwordResetRequests: [...state.passwordResetRequests, request],
        }));
        
        return true;
      },

      approvePasswordReset: (requestId) => {
        const request = get().passwordResetRequests.find(r => r.id === requestId);
        if (!request) return;
        
        const user = get().users.find(u => u.id === request.userId);
        if (!user) return;
        
        // رمز را به رمز اولیه (نام کاربری + 123) برگردان
        const defaultPassword = user.username + '123';
        
        set((state) => ({
          users: state.users.map(u =>
            u.id === request.userId ? { ...u, password: defaultPassword } : u
          ),
          passwordResetRequests: state.passwordResetRequests.map(r =>
            r.id === requestId ? { ...r, status: 'approved', resolvedAt: new Date().toISOString() } : r
          ),
        }));
      },

      rejectPasswordReset: (requestId) => {
        set((state) => ({
          passwordResetRequests: state.passwordResetRequests.map(r =>
            r.id === requestId ? { ...r, status: 'rejected', resolvedAt: new Date().toISOString() } : r
          ),
        }));
      },

      deletePasswordResetRequest: (requestId) => {
        set((state) => ({
          passwordResetRequests: state.passwordResetRequests.filter(r => r.id !== requestId),
        }));
      },

      // محصولات
      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ products: [...state.products, newProduct] }));
      },

      updateProduct: (id, productData) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...productData } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      // انبار
      addInventory: (productId, quantity, reason) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) return;

        const log: InventoryLog = {
          id: uuidv4(),
          productId,
          productName: product.name,
          type: quantity > 0 ? 'add' : 'subtract',
          quantity: Math.abs(quantity),
          reason,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, quantity: p.quantity + quantity } : p
          ),
          inventoryLogs: [...state.inventoryLogs, log],
        }));
      },

      // مشتریان
      addCustomer: (customerData) => {
        const newCustomer: Customer = {
          ...customerData,
          id: uuidv4(),
          totalDebt: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ customers: [...state.customers, newCustomer] }));
      },

      updateCustomer: (id, customerData) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...customerData } : c
          ),
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },

      // فروش
      addSale: (saleData) => {
        const newSale: Sale = {
          ...saleData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };

        // کاهش موجودی انبار
        const updatedProducts = get().products.map((product) => {
          const saleItem = saleData.items.find(
            (item) => item.productId === product.id
          );
          if (saleItem) {
            return { ...product, quantity: product.quantity - saleItem.meters };
          }
          return product;
        });

        // اگر نسیه باشد، بدهی مشتری را اضافه کن
        let updatedCustomers = get().customers;
        const newDebts = [...get().debts];

        if (saleData.paymentType === 'credit' && saleData.customerId) {
          updatedCustomers = get().customers.map((c) =>
            c.id === saleData.customerId
              ? { ...c, totalDebt: c.totalDebt + saleData.totalAmount }
              : c
          );

          const customer = get().customers.find(
            (c) => c.id === saleData.customerId
          );
          if (customer) {
            newDebts.push({
              id: uuidv4(),
              customerId: saleData.customerId,
              customerName: customer.name,
              saleId: newSale.id,
              amount: saleData.totalAmount,
              type: 'debt',
              description: `فاکتور فروش #${newSale.id.slice(0, 8)}`,
              date: saleData.date,
              createdAt: new Date().toISOString(),
            });
          }
        }

        set({
          sales: [...get().sales, newSale],
          products: updatedProducts,
          customers: updatedCustomers,
          debts: newDebts,
        });
      },

      updateSale: (id, saleData) => {
        set((state) => ({
          sales: state.sales.map((s) =>
            s.id === id ? { ...s, ...saleData } : s
          ),
        }));
      },

      deleteSale: (id) => {
        set((state) => ({
          sales: state.sales.filter((s) => s.id !== id),
        }));
      },

      // نسیه
      addDebt: (debtData) => {
        const newDebt: Debt = {
          ...debtData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };

        // به‌روزرسانی بدهی مشتری
        set((state) => ({
          debts: [...state.debts, newDebt],
          customers: state.customers.map((c) =>
            c.id === debtData.customerId
              ? {
                  ...c,
                  totalDebt:
                    debtData.type === 'debt'
                      ? c.totalDebt + debtData.amount
                      : c.totalDebt - debtData.amount,
                }
              : c
          ),
        }));
      },

      addPayment: (customerId, amount, description) => {
        const customer = get().customers.find((c) => c.id === customerId);
        if (!customer) return;

        const payment: Debt = {
          id: uuidv4(),
          customerId,
          customerName: customer.name,
          amount,
          type: 'payment',
          description,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          debts: [...state.debts, payment],
          customers: state.customers.map((c) =>
            c.id === customerId
              ? { ...c, totalDebt: Math.max(0, c.totalDebt - amount) }
              : c
          ),
        }));
      },

      deleteDebt: (id) => {
        const debt = get().debts.find((d) => d.id === id);
        if (!debt) return;

        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
          customers: state.customers.map((c) =>
            c.id === debt.customerId
              ? {
                  ...c,
                  totalDebt:
                    debt.type === 'debt'
                      ? c.totalDebt - debt.amount
                      : c.totalDebt + debt.amount,
                }
              : c
          ),
        }));
      },

      // مصارف
      addExpense: (expenseData) => {
        const newExpense: Expense = {
          ...expenseData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ expenses: [...state.expenses, newExpense] }));
      },

      updateExpense: (id, expenseData) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...expenseData } : e
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      // گرفتن صلاحیت‌ها
      getPermissions: () => {
        const user = get().currentUser;
        if (!user) return STAFF_PERMISSIONS;
        return user.role === 'admin' ? ADMIN_PERMISSIONS : STAFF_PERMISSIONS;
      },
    }),
    {
      name: 'cloth-shop-storage',
    }
  )
);
