import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit2, Trash2, Search, Users, X, Phone, MapPin } from 'lucide-react';
import { Customer } from '../types';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, getPermissions } =
    useStore();
  const permissions = getPermissions();

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.includes(searchTerm) ||
      c.phone.includes(searchTerm) ||
      c.address?.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', address: '' });
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (customer && customer.totalDebt > 0) {
      alert('این مشتری بدهی دارد و قابل حذف نیست!');
      return;
    }
    if (confirm('آیا مطمئن هستید؟')) {
      deleteCustomer(id);
    }
  };

  const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="جستجوی مشتری..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        {permissions.canAddCustomer && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>مشتری جدید</span>
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">تعداد مشتریان</p>
          <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">مشتریان بدهکار</p>
          <p className="text-2xl font-bold text-orange-600">
            {customers.filter((c) => c.totalDebt > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">مجموع بدهی‌ها</p>
          <p className="text-2xl font-bold text-red-600">
            {totalDebt.toLocaleString()} ؋
          </p>
        </div>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Users size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">هیچ مشتری یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{customer.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone size={14} />
                      {customer.phone}
                    </p>
                  </div>
                </div>
              </div>

              {customer.address && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                  <MapPin size={14} />
                  {customer.address}
                </p>
              )}

              <div
                className={`p-3 rounded-lg ${
                  customer.totalDebt > 0 ? 'bg-orange-50' : 'bg-green-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">بدهی:</span>
                  <span
                    className={`font-bold ${
                      customer.totalDebt > 0 ? 'text-orange-600' : 'text-green-600'
                    }`}
                  >
                    {customer.totalDebt.toLocaleString()} ؋
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t">
                {permissions.canEditCustomer && (
                  <button
                    onClick={() => handleEdit(customer)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} />
                    <span>ویرایش</span>
                  </button>
                )}
                {permissions.canDeleteCustomer && (
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>حذف</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {editingCustomer ? 'ویرایش مشتری' : 'مشتری جدید'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCustomer(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نام مشتری
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  شماره تماس
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  آدرس (اختیاری)
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors"
                >
                  {editingCustomer ? 'ذخیره تغییرات' : 'افزودن مشتری'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCustomer(null);
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
