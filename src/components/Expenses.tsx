import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit2, Trash2, Search, Receipt, X } from 'lucide-react';
import { Expense } from '../types';

const expenseCategories = [
  { id: 'rent', label: 'کرایه دوکان', icon: '🏠' },
  { id: 'electricity', label: 'برق', icon: '💡' },
  { id: 'salary', label: 'معاش کارگر', icon: '👷' },
  { id: 'other', label: 'سایر', icon: '📦' },
];

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense, getPermissions } =
    useStore();
  const permissions = getPermissions();

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [formData, setFormData] = useState({
    category: 'other' as Expense['category'],
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  let filteredExpenses = expenses;

  if (filterCategory) {
    filteredExpenses = filteredExpenses.filter(
      (e) => e.category === filterCategory
    );
  }

  if (filterMonth) {
    filteredExpenses = filteredExpenses.filter((e) =>
      e.date.startsWith(filterMonth)
    );
  }

  if (searchTerm) {
    filteredExpenses = filteredExpenses.filter((e) =>
      e.description.includes(searchTerm)
    );
  }

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = expenses
    .filter((e) => e.date.startsWith(thisMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      updateExpense(editingExpense.id, formData);
    } else {
      addExpense(formData);
    }
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      category: 'other',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: expense.date.split('T')[0],
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا مطمئن هستید؟')) {
      deleteExpense(id);
    }
  };

  const getCategoryInfo = (category: string) => {
    return (
      expenseCategories.find((c) => c.id === category) || {
        label: category,
        icon: '📦',
      }
    );
  };

  // خلاصه بر اساس دسته‌بندی
  const categoryTotals = expenseCategories.map((cat) => ({
    ...cat,
    total: expenses
      .filter((e) => e.category === cat.id && e.date.startsWith(thisMonth))
      .reduce((sum, e) => sum + e.amount, 0),
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="col-span-2 lg:col-span-1 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">مصارف این ماه</p>
          <p className="text-2xl font-bold text-red-600">
            {thisMonthExpenses.toLocaleString()} ؋
          </p>
        </div>
        {categoryTotals.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{cat.icon}</span>
              <span className="text-sm text-gray-500">{cat.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {cat.total.toLocaleString()} ؋
            </p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
          <div className="relative flex-1">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">همه دسته‌ها</option>
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        {permissions.canAddExpense && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>مصرف جدید</span>
          </button>
        )}
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">هیچ مصرفی یافت نشد</p>
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
                    دسته‌بندی
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    توضیحات
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    مبلغ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses
                  .slice()
                  .reverse()
                  .map((expense) => {
                    const catInfo = getCategoryInfo(expense.category);
                    return (
                      <tr
                        key={expense.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(expense.date).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{catInfo.icon}</span>
                            <span className="text-sm text-gray-800">
                              {catInfo.label}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {expense.description || '---'}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-red-600">
                          {expense.amount.toLocaleString()} ؋
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {permissions.canEditExpense && (
                              <button
                                onClick={() => handleEdit(expense)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {permissions.canDeleteExpense && (
                              <button
                                onClick={() => handleDelete(expense.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {editingExpense ? 'ویرایش مصرف' : 'مصرف جدید'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingExpense(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دسته‌بندی
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {expenseCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          category: cat.id as Expense['category'],
                        })
                      }
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        formData.category === cat.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مبلغ
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاریخ
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  توضیحات
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                >
                  {editingExpense ? 'ذخیره تغییرات' : 'ثبت مصرف'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpense(null);
                  }}
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
