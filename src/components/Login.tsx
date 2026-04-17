import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  
  const login = useStore((state) => state.login);
  const requestPasswordReset = useStore((state) => state.requestPasswordReset);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و رمز عبور را وارد کنید');
      return;
    }
    
    const user = login(username.trim(), password);
    if (!user) {
      setError('نام کاربری یا رمز عبور اشتباه است');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    
    if (!forgotUsername.trim()) {
      setForgotMessage('لطفاً نام کاربری خود را وارد کنید');
      setForgotSuccess(false);
      return;
    }
    
    const success = requestPasswordReset(forgotUsername.trim());
    if (success) {
      setForgotMessage('درخواست شما ثبت شد. منتظر تأیید مدیر سیستم باشید.');
      setForgotSuccess(true);
      setForgotUsername('');
    } else {
      setForgotMessage('نام کاربری یافت نشد');
      setForgotSuccess(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🔑</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">فراموشی رمز عبور</h1>
            <p className="text-gray-500 mt-2">نام کاربری خود را وارد کنید</p>
          </div>
          
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام کاربری
              </label>
              <input
                type="text"
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="نام کاربری خود را وارد کنید"
                dir="ltr"
              />
            </div>
            
            {forgotMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                forgotSuccess 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {forgotSuccess ? '✅' : '❌'} {forgotMessage}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
            >
              ارسال درخواست
            </button>
            
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotMessage('');
                setForgotUsername('');
              }}
              className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm"
            >
              ← بازگشت به صفحه ورود
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>توجه:</strong> بعد از تأیید درخواست توسط مدیر، رمز عبور شما به رمز پیش‌فرض (نام کاربری + 123) تغییر می‌کند.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🧵</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">سیستم مدیریت دوکان</h1>
          <p className="text-gray-500 mt-2">رخت‌فروشی</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نام کاربری
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="نام کاربری"
              dir="ltr"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="رمز عبور"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            ورود به سیستم
          </button>
          
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="w-full text-blue-600 hover:text-blue-800 py-2 text-sm"
          >
            🔑 رمز عبور را فراموش کرده‌ام
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            اولین ورود؟ از مدیر سیستم نام کاربری و رمز بگیرید
          </p>
        </div>
      </div>
    </div>
  );
};
