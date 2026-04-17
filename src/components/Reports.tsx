import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Calendar,
} from 'lucide-react';

export default function Reports() {
  const { products, sales, expenses, getPermissions } = useStore();
  const permissions = getPermissions();

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('monthly');

  // فیلتر بر اساس ماه انتخابی
  const monthSales = sales.filter((s) => s.date.startsWith(selectedMonth));
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));

  // محاسبات کلی
  const totalRevenue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  // محاسبه سود ساده (برای استفاده در آینده)
const _netProfit = totalRevenue - totalExpenses;
void _netProfit;

  // تعداد فروش‌ها
  const cashSales = monthSales.filter((s) => s.paymentType === 'cash');
  const creditSales = monthSales.filter((s) => s.paymentType === 'credit');

  // محاسبه سود خالص (با احتساب قیمت خرید)
  const calculateGrossProfit = () => {
    let profit = 0;
    monthSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          profit += item.meters * (item.pricePerMeter - product.purchasePrice);
        }
      });
    });
    return profit;
  };

  const grossProfit = calculateGrossProfit();
  const realProfit = grossProfit - totalExpenses;

  // گروه‌بندی فروش روزانه
  const getDailySales = () => {
    const dailyData: { [key: string]: number } = {};
    monthSales.forEach((sale) => {
      const day = sale.date.split('T')[0];
      dailyData[day] = (dailyData[day] || 0) + sale.totalAmount;
    });
    return Object.entries(dailyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({
        date,
        amount,
        formattedDate: new Date(date).toLocaleDateString('fa-IR', {
          day: 'numeric',
          month: 'short',
        }),
      }));
  };

  const dailySales = getDailySales();
  const maxDailySale = Math.max(...dailySales.map((d) => d.amount), 1);

  // پرفروش‌ترین محصولات
  const getTopProducts = () => {
    const productSales: { [key: string]: { name: string; meters: number; revenue: number } } = {};
    monthSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            meters: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].meters += item.meters;
        productSales[item.productId].revenue += item.total;
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();

  // گزارش مصارف بر اساس دسته‌بندی
  const expensesByCategory = [
    {
      category: 'کرایه دوکان',
      icon: '🏠',
      amount: monthExpenses
        .filter((e) => e.category === 'rent')
        .reduce((s, e) => s + e.amount, 0),
    },
    {
      category: 'برق',
      icon: '💡',
      amount: monthExpenses
        .filter((e) => e.category === 'electricity')
        .reduce((s, e) => s + e.amount, 0),
    },
    {
      category: 'معاش کارگر',
      icon: '👷',
      amount: monthExpenses
        .filter((e) => e.category === 'salary')
        .reduce((s, e) => s + e.amount, 0),
    },
    {
      category: 'سایر',
      icon: '📦',
      amount: monthExpenses
        .filter((e) => e.category === 'other')
        .reduce((s, e) => s + e.amount, 0),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-500" size={20} />
            <span className="font-medium text-gray-700">انتخاب دوره:</span>
          </div>
          <div className="flex gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setReportType('daily')}
                className={`px-4 py-1 rounded-lg text-sm transition-colors ${
                  reportType === 'daily'
                    ? 'bg-white shadow text-indigo-600'
                    : 'text-gray-600'
                }`}
              >
                روزانه
              </button>
              <button
                onClick={() => setReportType('monthly')}
                className={`px-4 py-1 rounded-lg text-sm transition-colors ${
                  reportType === 'monthly'
                    ? 'bg-white shadow text-indigo-600'
                    : 'text-gray-600'
                }`}
              >
                ماهانه
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">درآمد کل</p>
              <p className="text-xl font-bold text-green-600">
                {totalRevenue.toLocaleString()} ؋
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">مصارف کل</p>
              <p className="text-xl font-bold text-red-600">
                {totalExpenses.toLocaleString()} ؋
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">سود ناخالص</p>
              <p className="text-xl font-bold text-blue-600">
                {grossProfit.toLocaleString()} ؋
              </p>
            </div>
          </div>
        </div>

        {permissions.canViewFullReports && (
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${
                  realProfit >= 0 ? 'bg-purple-100' : 'bg-orange-100'
                }`}
              >
                <DollarSign
                  className={realProfit >= 0 ? 'text-purple-600' : 'text-orange-600'}
                  size={24}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {realProfit >= 0 ? 'سود خالص' : 'زیان'}
                </p>
                <p
                  className={`text-xl font-bold ${
                    realProfit >= 0 ? 'text-purple-600' : 'text-orange-600'
                  }`}
                >
                  {Math.abs(realProfit).toLocaleString()} ؋
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* فروش‌ها */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="text-indigo-500" />
            آمار فروش
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">تعداد کل فروش‌ها</span>
              <span className="font-bold text-gray-800">{monthSales.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-600">فروش نقدی</span>
              <div className="text-left">
                <span className="font-bold text-green-600">
                  {cashSales.reduce((s, sale) => s + sale.totalAmount, 0).toLocaleString()} ؋
                </span>
                <span className="text-sm text-gray-500 mr-2">
                  ({cashSales.length} فاکتور)
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-600">فروش نسیه</span>
              <div className="text-left">
                <span className="font-bold text-orange-600">
                  {creditSales.reduce((s, sale) => s + sale.totalAmount, 0).toLocaleString()} ؋
                </span>
                <span className="text-sm text-gray-500 mr-2">
                  ({creditSales.length} فاکتور)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* مصارف */}
        {permissions.canViewFullReports && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="text-red-500" />
              مصارف بر اساس دسته‌بندی
            </h3>
            <div className="space-y-3">
              {expensesByCategory.map((exp) => (
                <div key={exp.category} className="flex items-center gap-3">
                  <span className="text-xl">{exp.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{exp.category}</span>
                      <span className="font-medium text-gray-800">
                        {exp.amount.toLocaleString()} ؋
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{
                          width: `${totalExpenses > 0 ? (exp.amount / totalExpenses) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Daily Chart */}
      {reportType === 'daily' && dailySales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-500" />
            نمودار فروش روزانه
          </h3>
          <div className="flex items-end gap-2 h-48 overflow-x-auto pb-4">
            {dailySales.map((day) => (
              <div
                key={day.date}
                className="flex flex-col items-center min-w-[60px]"
              >
                <div
                  className="w-10 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t hover:from-indigo-600 hover:to-indigo-500 transition-all cursor-pointer"
                  style={{
                    height: `${(day.amount / maxDailySale) * 150}px`,
                    minHeight: '8px',
                  }}
                  title={`${day.amount.toLocaleString()} ؋`}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {day.formattedDate}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="text-purple-500" />
          پرفروش‌ترین محصولات
        </h3>
        {topProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package size={48} className="mx-auto mb-2 opacity-50" />
            <p>هنوز فروشی ثبت نشده است</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    رتبه
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    محصول
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    متراژ فروخته
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    درآمد
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr
                    key={product.name}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                            ? 'bg-gray-200 text-gray-700'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {product.meters} متر
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-green-600">
                      {product.revenue.toLocaleString()} ؋
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory Report */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="text-blue-500" />
          وضعیت موجودی انبار
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">تعداد محصولات</p>
            <p className="text-2xl font-bold text-blue-600">{products.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">موجودی کل</p>
            <p className="text-2xl font-bold text-green-600">
              {products.reduce((s, p) => s + p.quantity, 0)} متر
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">ارزش انبار</p>
            <p className="text-2xl font-bold text-purple-600">
              {products
                .reduce((s, p) => s + p.quantity * p.purchasePrice, 0)
                .toLocaleString()}{' '}
              ؋
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  محصول
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  موجودی
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  قیمت خرید
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  قیمت فروش
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  ارزش
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  وضعیت
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">
                    {product.name} - {product.color}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {product.quantity} متر
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {product.purchasePrice.toLocaleString()} ؋
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {product.salePrice.toLocaleString()} ؋
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {(product.quantity * product.purchasePrice).toLocaleString()} ؋
                  </td>
                  <td className="py-3 px-4">
                    {product.quantity <= product.lowStockThreshold ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                        کمبود
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        کافی
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
