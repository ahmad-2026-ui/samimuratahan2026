import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Plus,
  CreditCard,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  X,
} from 'lucide-react';

export default function Debts() {
  const { customers, debts, addPayment, deleteDebt, getPermissions } = useStore();
  const permissions = getPermissions();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDescription, setPaymentDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');

  const customersWithDebt = customers.filter((c) => c.totalDebt > 0);
  const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);

  let filteredDebts = debts;
  if (filterCustomer) {
    filteredDebts = debts.filter((d) => d.customerId === filterCustomer);
  }
  if (searchTerm) {
    filteredDebts = filteredDebts.filter(
      (d) =>
        d.customerName.includes(searchTerm) ||
        d.description.includes(searchTerm)
    );
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || paymentAmount <= 0) return;

    addPayment(selectedCustomerId, paymentAmount, paymentDescription || 'پرداخت بدهی');

    setShowPaymentModal(false);
    setSelectedCustomerId('');
    setPaymentAmount(0);
    setPaymentDescription('');
  };

  const handleDelete = (id: string) => {
    if (!permissions.canDeleteDebt) return;
    if (confirm('آیا مطمئن هستید؟')) {
      deleteDebt(id);
    }
  };

  const openPaymentModal = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">مجموع بدهی‌ها</p>
              <p className="text-2xl font-bold text-orange-600">
                {totalDebt.toLocaleString()} ؋
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowUpRight className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">مشتریان بدهکار</p>
              <p className="text-2xl font-bold text-red-600">
                {customersWithDebt.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowDownRight className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">پرداخت‌های امروز</p>
              <p className="text-2xl font-bold text-green-600">
                {debts
                  .filter(
                    (d) =>
                      d.type === 'payment' &&
                      d.date.startsWith(new Date().toISOString().split('T')[0])
                  )
                  .reduce((s, d) => s + d.amount, 0)
                  .toLocaleString()}{' '}
                ؋
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers with Debt */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          مشتریان بدهکار
        </h3>
        {customersWithDebt.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CreditCard size={48} className="mx-auto mb-2 opacity-50" />
            <p>هیچ مشتری بدهکاری وجود ندارد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customersWithDebt
              .sort((a, b) => b.totalDebt - a.totalDebt)
              .map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-700 font-bold text-lg">
                      {customer.totalDebt.toLocaleString()} ؋
                    </span>
                    {permissions.canAddDebt && (
                      <button
                        onClick={() => openPaymentModal(customer.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                        پرداخت
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Debt History */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            تاریخچه نسیه و پرداخت‌ها
          </h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            >
              <option value="">همه مشتریان</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredDebts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CreditCard size={48} className="mx-auto mb-2 opacity-50" />
            <p>هیچ رکوردی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    تاریخ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    مشتری
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    نوع
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    مبلغ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    توضیحات
                  </th>
                  {permissions.canDeleteDebt && (
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      عملیات
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredDebts
                  .slice()
                  .reverse()
                  .map((debt) => (
                    <tr
                      key={debt.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(debt.date).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">
                        {debt.customerName}
                      </td>
                      <td className="py-3 px-4">
                        {debt.type === 'debt' ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <ArrowUpRight size={16} />
                            بدهی
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600">
                            <ArrowDownRight size={16} />
                            پرداخت
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm font-medium ${
                          debt.type === 'debt' ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {debt.type === 'debt' ? '+' : '-'}
                        {debt.amount.toLocaleString()} ؋
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {debt.description}
                      </td>
                      {permissions.canDeleteDebt && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDelete(debt.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">ثبت پرداخت</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePayment} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مشتری
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">انتخاب مشتری</option>
                  {customersWithDebt.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - بدهی: {c.totalDebt.toLocaleString()} ؋
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomerId && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">بدهی فعلی:</p>
                  <p className="text-xl font-bold text-orange-600">
                    {customers
                      .find((c) => c.id === selectedCustomerId)
                      ?.totalDebt.toLocaleString()}{' '}
                    ؋
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مبلغ پرداخت
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  توضیحات (اختیاری)
                </label>
                <input
                  type="text"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="مثلاً: پرداخت نقدی"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                >
                  ثبت پرداخت
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
