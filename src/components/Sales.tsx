import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Plus,
  Trash2,
  ShoppingCart,
  X,
  Search,
  Eye,
  Printer,
} from 'lucide-react';
import { Sale, SaleItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

export default function Sales() {
  const {
    products,
    customers,
    sales,
    addSale,
    deleteSale,
    getPermissions,
    currentUser,
  } = useStore();
  const permissions = getPermissions();

  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // فرم فروش
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [meters, setMeters] = useState(0);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // فیلتر فروش‌ها
  let filteredSales = sales;

  // اگر کارمند باشد فقط فروش‌های امروز را ببیند
  if (!permissions.canViewAllSales) {
    const today = new Date().toISOString().split('T')[0];
    filteredSales = sales.filter((s) => s.date.startsWith(today));
  }

  if (dateFilter) {
    filteredSales = filteredSales.filter((s) => s.date.startsWith(dateFilter));
  }

  if (searchTerm) {
    filteredSales = filteredSales.filter(
      (s) =>
        s.id.includes(searchTerm) ||
        s.customerName?.includes(searchTerm) ||
        s.items.some((i) => i.productName.includes(searchTerm))
    );
  }

  const addItemToSale = () => {
    if (!selectedProduct || meters <= 0) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    if (product.quantity < meters) {
      alert(`موجودی کافی نیست! فقط ${product.quantity} متر موجود است.`);
      return;
    }

    // بررسی تکراری نبودن
    const existing = saleItems.find((i) => i.productId === selectedProduct);
    if (existing) {
      setSaleItems(
        saleItems.map((i) =>
          i.productId === selectedProduct
            ? {
                ...i,
                meters: i.meters + meters,
                total: (i.meters + meters) * i.pricePerMeter,
              }
            : i
        )
      );
    } else {
      const newItem: SaleItem = {
        id: uuidv4(),
        productId: product.id,
        productName: `${product.name} - ${product.color}`,
        meters,
        pricePerMeter: product.salePrice,
        total: meters * product.salePrice,
      };
      setSaleItems([...saleItems, newItem]);
    }

    setSelectedProduct('');
    setMeters(0);
  };

  const removeItemFromSale = (id: string) => {
    setSaleItems(saleItems.filter((i) => i.id !== id));
  };

  const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saleItems.length === 0) {
      alert('لطفاً حداقل یک محصول اضافه کنید');
      return;
    }

    if (paymentType === 'credit' && !selectedCustomer) {
      alert('برای فروش نسیه، انتخاب مشتری الزامی است');
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomer);

    addSale({
      date: new Date().toISOString(),
      items: saleItems,
      totalAmount,
      paymentType,
      customerId: selectedCustomer || undefined,
      customerName: customer?.name,
      createdBy: currentUser?.name || '',
    });

    setSaleItems([]);
    setSelectedProduct('');
    setMeters(0);
    setPaymentType('cash');
    setSelectedCustomer('');
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا مطمئن هستید؟ این عملیات قابل بازگشت نیست.')) {
      deleteSale(id);
    }
  };

  const printInvoice = (sale: Sale) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاکتور #${sale.id.slice(0, 8)}</title>
        <style>
          body { font-family: Tahoma, Arial; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: right; }
          th { background: #f0f0f0; }
          .total { text-align: left; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🧵 دوکان رخت‌فروشی</h1>
          <p>فاکتور فروش</p>
        </div>
        <div class="info">
          <div>
            <p><strong>شماره فاکتور:</strong> #${sale.id.slice(0, 8)}</p>
            <p><strong>تاریخ:</strong> ${new Date(sale.date).toLocaleDateString('fa-IR')}</p>
          </div>
          <div>
            <p><strong>مشتری:</strong> ${sale.customerName || 'نقدی'}</p>
            <p><strong>نوع پرداخت:</strong> ${sale.paymentType === 'cash' ? 'نقد' : 'نسیه'}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ردیف</th>
              <th>محصول</th>
              <th>متراژ</th>
              <th>قیمت هر متر</th>
              <th>مجموع</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items
              .map(
                (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.productName}</td>
                <td>${item.meters} متر</td>
                <td>${item.pricePerMeter.toLocaleString()} ؋</td>
                <td>${item.total.toLocaleString()} ؋</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <p class="total">مجموع کل: ${sale.totalAmount.toLocaleString()} افغانی</p>
        <div class="footer">
          <p>با تشکر از خرید شما</p>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
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
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        {permissions.canAddSale && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>فروش جدید</span>
          </button>
        )}
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">هیچ فروشی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
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
                    محصولات
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    نوع پرداخت
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
                {filteredSales
                  .slice()
                  .reverse()
                  .map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        #{sale.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(sale.date).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {sale.customerName || '---'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {sale.items.length} قلم
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
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowInvoice(sale)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="مشاهده"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => printInvoice(sale)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="چاپ"
                          >
                            <Printer size={18} />
                          </button>
                          {permissions.canDeleteSale && (
                            <button
                              onClick={() => handleDelete(sale.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="حذف"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal فروش جدید */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">فروش جدید</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSaleItems([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* افزودن محصول */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-700">افزودن محصول</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">انتخاب محصول</option>
                    {products
                      .filter((p) => p.quantity > 0)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {p.color} ({p.quantity}م) - {p.salePrice}؋
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    value={meters}
                    onChange={(e) => setMeters(Number(e.target.value))}
                    placeholder="متراژ"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    min="0.1"
                    step="0.1"
                  />
                  <button
                    type="button"
                    onClick={addItemToSale}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    افزودن
                  </button>
                </div>
              </div>

              {/* لیست محصولات */}
              {saleItems.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-right py-2 px-3 text-sm text-gray-600">
                          محصول
                        </th>
                        <th className="text-right py-2 px-3 text-sm text-gray-600">
                          متراژ
                        </th>
                        <th className="text-right py-2 px-3 text-sm text-gray-600">
                          قیمت/متر
                        </th>
                        <th className="text-right py-2 px-3 text-sm text-gray-600">
                          مجموع
                        </th>
                        <th className="py-2 px-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleItems.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 px-3 text-sm">
                            {item.productName}
                          </td>
                          <td className="py-2 px-3 text-sm">{item.meters}م</td>
                          <td className="py-2 px-3 text-sm">
                            {item.pricePerMeter.toLocaleString()}؋
                          </td>
                          <td className="py-2 px-3 text-sm font-medium">
                            {item.total.toLocaleString()}؋
                          </td>
                          <td className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => removeItemFromSale(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td
                          colSpan={3}
                          className="py-2 px-3 text-sm font-medium"
                        >
                          مجموع کل
                        </td>
                        <td
                          colSpan={2}
                          className="py-2 px-3 text-sm font-bold text-green-600"
                        >
                          {totalAmount.toLocaleString()} ؋
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* نوع پرداخت */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع پرداخت
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentType('cash')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        paymentType === 'cash'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      نقد
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType('credit')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        paymentType === 'credit'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      نسیه
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مشتری {paymentType === 'credit' && '(الزامی)'}
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required={paymentType === 'credit'}
                  >
                    <option value="">انتخاب مشتری</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors font-medium"
                >
                  ثبت فروش ({totalAmount.toLocaleString()} ؋)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSaleItems([]);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal مشاهده فاکتور */}
      {showInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                فاکتور #{showInvoice.id.slice(0, 8)}
              </h3>
              <button
                onClick={() => setShowInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">تاریخ:</span>
                <span>
                  {new Date(showInvoice.date).toLocaleDateString('fa-IR')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">مشتری:</span>
                <span>{showInvoice.customerName || 'نقدی'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">نوع پرداخت:</span>
                <span
                  className={
                    showInvoice.paymentType === 'cash'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }
                >
                  {showInvoice.paymentType === 'cash' ? 'نقد' : 'نسیه'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ثبت توسط:</span>
                <span>{showInvoice.createdBy}</span>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-right py-2 px-3 text-sm text-gray-600">
                        محصول
                      </th>
                      <th className="text-right py-2 px-3 text-sm text-gray-600">
                        متراژ
                      </th>
                      <th className="text-right py-2 px-3 text-sm text-gray-600">
                        قیمت/متر
                      </th>
                      <th className="text-right py-2 px-3 text-sm text-gray-600">
                        مجموع
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {showInvoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-3 text-sm">{item.productName}</td>
                        <td className="py-2 px-3 text-sm">{item.meters}م</td>
                        <td className="py-2 px-3 text-sm">
                          {item.pricePerMeter.toLocaleString()}؋
                        </td>
                        <td className="py-2 px-3 text-sm font-medium">
                          {item.total.toLocaleString()}؋
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-50">
                      <td colSpan={3} className="py-2 px-3 font-medium">
                        مجموع کل
                      </td>
                      <td className="py-2 px-3 font-bold text-green-600">
                        {showInvoice.totalAmount.toLocaleString()} ؋
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <button
                onClick={() => printInvoice(showInvoice)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
              >
                <Printer size={18} />
                چاپ فاکتور
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
