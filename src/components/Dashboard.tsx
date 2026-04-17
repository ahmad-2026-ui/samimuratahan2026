import { useStore } from '../store/useStore';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function Dashboard() {
  const { products, sales, customers, expenses, getPermissions } = useStore();
  const permissions = getPermissions();

  // محاسبات
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.date.startsWith(today));
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthSales = sales.filter((s) => s.date.startsWith(thisMonth));
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);

  const monthExpenses = expenses
    .filter((e) => e.date.startsWith(thisMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);

  const lowStockProducts = products.filter(
    (p) => p.quantity <= p.lowStockThreshold
  );

  // محاسبه سود
  const totalProfit = monthRevenue - monthExpenses;

  const stats = [
    {
      title: 'فروش امروز',
      value: `${todayRevenue.toLocaleString()} ؋`,
      icon: ShoppingCart,
      color: 'bg-green-500',
      change: `${todaySales.length} فاکتور`,
      trend: 'up',
    },
    {
      title: 'فروش این ماه',
      value: `${monthRevenue.toLocaleString()} ؋`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      change: `${monthSales.length} فاکتور`,
      trend: 'up',
    },
    {
      title: 'مجموع بدهی‌ها',
      value: `${totalDebt.toLocaleString()} ؋`,
      icon: CreditCard,
      color: 'bg-orange-500',
      change: `${customers.filter((c) => c.totalDebt > 0).length} مشتری`,
      trend: 'neutral',
    },
    {
      title: 'تعداد محصولات',
      value: products.length.toString(),
      icon: Package,
      color: 'bg-purple-500',
      change: `${products.reduce((s, p) => s + p.quantity, 0)} متر موجودی`,
      trend: 'neutral',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  {stat.trend === 'up' && (
                    <ArrowUpRight size={14} className="text-green-500" />
                  )}
                  {stat.trend === 'down' && (
                    <ArrowDownRight size={14} className="text-red-500" />
                  )}
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* سود و زیان */}
        {permissions.canViewFullReports && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-500" />
              سود و زیان این ماه
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">درآمد کل</span>
                <span className="font-bold text-green-600">
                  {monthRevenue.toLocaleString()} ؋
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-600">مصارف کل</span>
                <span className="font-bold text-red-600">
                  {monthExpenses.toLocaleString()} ؋
                </span>
              </div>
              <div
                className={`flex justify-between items-center p-3 rounded-lg ${
                  totalProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'
                }`}
              >
                <span className="text-gray-600">
                  {totalProfit >= 0 ? 'سود خالص' : 'زیان'}
                </span>
                <span
                  className={`font-bold ${
                    totalProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}
                >
                  {Math.abs(totalProfit).toLocaleString()} ؋
                </span>
              </div>
            </div>
          </div>
        )}

        {/* هشدار کمبود موجودی */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" />
            هشدار کمبود موجودی
          </h3>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={48} className="mx-auto mb-2 opacity-50" />
              <p>تمام محصولات موجودی کافی دارند</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.color}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-orange-600 font-bold">
                      {product.quantity} متر
                    </p>
                    <p className="text-xs text-gray-400">
                      حداقل: {product.lowStockThreshold} متر
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* فروش‌های اخیر */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingCart className="text-blue-500" />
          آخرین فروش‌ها
        </h3>
        {sales.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
            <p>هنوز فروشی ثبت نشده است</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    شماره
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    تاریخ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    مشتری
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    نوع پرداخت
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    مبلغ
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(-5).reverse().map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      #{sale.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(sale.date).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {sale.customerName || 'نقدی'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          sale.paymentType === 'cash'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {sale.paymentType === 'cash' ? 'نقد' : 'نسیه'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">
                      {sale.totalAmount.toLocaleString()} ؋
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* مشتریان با بدهی */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="text-purple-500" />
          مشتریان با بدهی
        </h3>
        {customers.filter((c) => c.totalDebt > 0).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users size={48} className="mx-auto mb-2 opacity-50" />
            <p>هیچ مشتری بدهکاری وجود ندارد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers
              .filter((c) => c.totalDebt > 0)
              .sort((a, b) => b.totalDebt - a.totalDebt)
              .slice(0, 6)
              .map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {customer.name}
                      </p>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-orange-600 font-bold">
                      بدهی: {customer.totalDebt.toLocaleString()} ؋
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
