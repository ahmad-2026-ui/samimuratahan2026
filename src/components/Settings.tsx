import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings as SettingsIcon, RefreshCw, Download, Upload } from 'lucide-react';

export default function Settings() {
  const { products, customers, sales, expenses, debts, inventoryLogs } = useStore();
  const [currency] = useState('؋');
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportData = () => {
    const data = {
      products,
      customers,
      sales,
      expenses,
      debts,
      inventoryLogs,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloth-shop-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (
      confirm(
        'آیا مطمئن هستید؟ تمام داده‌ها حذف خواهند شد! این عملیات قابل بازگشت نیست.'
      )
    ) {
      localStorage.removeItem('cloth-shop-storage');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <SettingsIcon className="text-indigo-500" />
          تنظیمات عمومی
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">واحد پول</p>
              <p className="text-sm text-gray-500">واحد پول استفاده شده در سیستم</p>
            </div>
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-lg">
              {currency} افغانی
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">زبان سیستم</p>
              <p className="text-sm text-gray-500">زبان رابط کاربری</p>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
              فارسی / دری
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">نسخه سیستم</p>
              <p className="text-sm text-gray-500">نسخه فعلی برنامه</p>
            </div>
            <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium">
              1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">آمار داده‌ها</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{products.length}</p>
            <p className="text-sm text-gray-600">محصول</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{customers.length}</p>
            <p className="text-sm text-gray-600">مشتری</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{sales.length}</p>
            <p className="text-sm text-gray-600">فروش</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">{expenses.length}</p>
            <p className="text-sm text-gray-600">مصرف</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-orange-600">{debts.length}</p>
            <p className="text-sm text-gray-600">نسیه/پرداخت</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {inventoryLogs.length}
            </p>
            <p className="text-sm text-gray-600">تغییر انبار</p>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          پشتیبان‌گیری و بازیابی
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 transition-colors"
          >
            <Download size={20} />
            <span className="font-medium">دانلود پشتیبان</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 transition-colors"
          >
            <Upload size={20} />
            <span className="font-medium">بازیابی داده‌ها</span>
          </button>

          <button
            onClick={handleClearData}
            className="flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-700 transition-colors"
          >
            <RefreshCw size={20} />
            <span className="font-medium">پاک کردن همه داده‌ها</span>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🧵</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">سیستم مدیریت دوکان رخت‌فروشی</h3>
          <p className="text-indigo-100 mb-4">
            نسخه 1.0.0 - ساخته شده با ❤️
          </p>
          <div className="flex justify-center gap-4 text-sm text-indigo-200">
            <span>React + TypeScript</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Zustand</span>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              بازیابی داده‌ها
            </h3>
            <p className="text-gray-600 mb-4">
              این قابلیت به زودی اضافه خواهد شد. فعلاً می‌توانید با پاک کردن
              داده‌ها و ورود مجدد، سیستم را ریست کنید.
            </p>
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
