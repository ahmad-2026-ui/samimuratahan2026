import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Minus, Warehouse, History, Search } from 'lucide-react';

export default function Inventory() {
  const { products, inventoryLogs, addInventory, getPermissions } = useStore();
  const permissions = getPermissions();

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState<'add' | 'subtract'>('add');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.name.includes(searchTerm) ||
      p.color.includes(searchTerm) ||
      p.category.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    if (actionType === 'subtract' && product.quantity < quantity) {
      alert('موجودی کافی نیست!');
      return;
    }

    addInventory(
      selectedProduct,
      actionType === 'add' ? quantity : -quantity,
      reason
    );

    setSelectedProduct('');
    setQuantity(0);
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* فرم افزایش/کاهش موجودی */}
      {permissions.canManageInventory && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Warehouse className="text-indigo-500" />
            مدیریت موجودی
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setActionType('add')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                  actionType === 'add'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Plus size={20} />
                <span>افزایش موجودی</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType('subtract')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                  actionType === 'subtract'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Minus size={20} />
                <span>کاهش موجودی</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  انتخاب محصول
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.color} ({p.quantity} متر)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مقدار (متر)
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  دلیل
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    actionType === 'add' ? 'خرید جدید...' : 'ضایعات...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2 rounded-lg text-white transition-colors ${
                actionType === 'add'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {actionType === 'add' ? 'افزایش موجودی' : 'کاهش موجودی'}
            </button>
          </form>
        </div>
      )}

      {/* وضعیت موجودی */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Warehouse className="text-blue-500" />
            وضعیت موجودی انبار
          </h3>
          <div className="relative w-full sm:w-64">
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  نام محصول
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  رنگ
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  دسته‌بندی
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  موجودی
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  حداقل
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  وضعیت
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  ارزش
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">
                    {product.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {product.color}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {product.category}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">
                    {product.quantity} متر
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {product.lowStockThreshold} متر
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
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {(product.quantity * product.purchasePrice).toLocaleString()}{' '}
                    ؋
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-medium">
                <td colSpan={3} className="py-3 px-4 text-gray-700">
                  مجموع
                </td>
                <td className="py-3 px-4 text-gray-800">
                  {products.reduce((s, p) => s + p.quantity, 0)} متر
                </td>
                <td colSpan={2}></td>
                <td className="py-3 px-4 text-gray-800">
                  {products
                    .reduce((s, p) => s + p.quantity * p.purchasePrice, 0)
                    .toLocaleString()}{' '}
                  ؋
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* تاریخچه تغییرات */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <History className="text-purple-500" />
          تاریخچه تغییرات انبار
        </h3>

        {inventoryLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <History size={48} className="mx-auto mb-2 opacity-50" />
            <p>هنوز تغییری ثبت نشده است</p>
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
                    محصول
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    نوع
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    مقدار
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    دلیل
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryLogs
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(log.date).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">
                        {log.productName}
                      </td>
                      <td className="py-3 px-4">
                        {log.type === 'add' ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <Plus size={16} />
                            افزایش
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <Minus size={16} />
                            کاهش
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {log.quantity} متر
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {log.reason}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
