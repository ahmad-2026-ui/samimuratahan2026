import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Warehouse,
  UserCog,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout, getPermissions } = useStore();
  const permissions = getPermissions();

  const menuItems = [
    { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard, show: true },
    { id: 'products', label: 'محصولات', icon: Package, show: permissions.canViewProducts },
    { id: 'inventory', label: 'انبار', icon: Warehouse, show: permissions.canViewInventory },
    { id: 'sales', label: 'فروش', icon: ShoppingCart, show: permissions.canViewDailySales || permissions.canViewAllSales },
    { id: 'customers', label: 'مشتریان', icon: Users, show: permissions.canViewCustomers },
    { id: 'debts', label: 'نسیه / قرض', icon: CreditCard, show: permissions.canViewDebts },
    { id: 'expenses', label: 'مصارف', icon: Receipt, show: permissions.canViewExpenses },
    { id: 'reports', label: 'گزارش‌ها', icon: BarChart3, show: permissions.canViewBasicReports || permissions.canViewFullReports },
    { id: 'users', label: 'کاربران', icon: UserCog, show: permissions.canManageUsers },
    { id: 'settings', label: 'تنظیمات', icon: Settings, show: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-gradient-to-b from-indigo-800 to-indigo-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          <h1 className="text-xl font-bold text-white">🧵 دوکان رخت</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-indigo-700 p-2 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 px-2">
          {menuItems
            .filter((item) => item.show)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                  currentPage === item.id
                    ? 'bg-white text-indigo-800 shadow-lg'
                    : 'text-indigo-100 hover:bg-indigo-700'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700">
          <div className="flex items-center gap-3 text-white mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              {currentUser?.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-xs text-indigo-300">
                {currentUser?.role === 'admin' ? 'مدیر' : 'کارمند'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:bg-gray-100 p-2 rounded"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {menuItems.find((item) => item.id === currentPage)?.label}
          </h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('fa-IR')}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
