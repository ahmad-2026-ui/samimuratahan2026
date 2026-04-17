import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit2, Trash2, Search, Package, X } from 'lucide-react';
import { Product } from '../types';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, getPermissions } =
    useStore();
  const permissions = getPermissions();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    color: '',
    purchasePrice: 0,
    salePrice: 0,
    quantity: 0,
    category: '',
    description: '',
    lowStockThreshold: 10,
  });

  const categories = ['کتان', 'لُنگی', 'واسکت', 'پیراهنی', 'شلواری', 'سایر'];

  const filteredProducts = products.filter(
    (p) =>
      p.name.includes(searchTerm) ||
      p.color.includes(searchTerm) ||
      p.category.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      color: '',
      purchasePrice: 0,
      salePrice: 0,
      quantity: 0,
      category: '',
      description: '',
      lowStockThreshold: 10,
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      color: product.color,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      quantity: product.quantity,
      category: product.category,
      description: product.description,
      lowStockThreshold: product.lowStockThreshold,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا مطمئن هستید؟')) {
      deleteProduct(id);
    }
  };

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
            placeholder="جستجوی محصول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
        {permissions.canAddProduct && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>محصول جدید</span>
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">هیچ محصولی یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <span
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor:
                      product.quantity <= product.lowStockThreshold
                        ? '#FEF3C7'
                        : '#D1FAE5',
                    color:
                      product.quantity <= product.lowStockThreshold
                        ? '#92400E'
                        : '#065F46',
                  }}
                >
                  {product.quantity <= product.lowStockThreshold
                    ? 'کمبود'
                    : 'موجود'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">رنگ:</span>
                  <span className="text-gray-800">{product.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">موجودی:</span>
                  <span className="text-gray-800 font-medium">
                    {product.quantity} متر
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">قیمت خرید:</span>
                  <span className="text-gray-800">
                    {product.purchasePrice.toLocaleString()} ؋/متر
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">قیمت فروش:</span>
                  <span className="text-green-600 font-medium">
                    {product.salePrice.toLocaleString()} ؋/متر
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">سود هر متر:</span>
                  <span className="text-blue-600 font-medium">
                    {(product.salePrice - product.purchasePrice).toLocaleString()}{' '}
                    ؋
                  </span>
                </div>
              </div>

              {product.description && (
                <p className="text-xs text-gray-400 mt-3 border-t pt-3">
                  {product.description}
                </p>
              )}

              <div className="flex gap-2 mt-4 pt-3 border-t">
                {permissions.canEditProduct && (
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} />
                    <span>ویرایش</span>
                  </button>
                )}
                {permissions.canDeleteProduct && (
                  <button
                    onClick={() => handleDelete(product.id)}
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
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {editingProduct ? 'ویرایش محصول' : 'محصول جدید'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نام پارچه
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
                    رنگ
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  دسته‌بندی
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    قیمت خرید (هر متر)
                  </label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchasePrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    قیمت فروش (هر متر)
                  </label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salePrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    موجودی (متر)
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    حداقل موجودی (هشدار)
                  </label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lowStockThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    min="0"
                  />
                </div>
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
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors"
                >
                  {editingProduct ? 'ذخیره تغییرات' : 'افزودن محصول'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
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
