import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { User, UserRole } from '../types';

export const Users: React.FC = () => {
  const { 
    users, 
    currentUser, 
    addUser, 
    deleteUser, 
    changePassword,
    passwordResetRequests,
    approvePasswordReset,
    rejectPasswordReset,
    deletePasswordResetRequest,
    getPermissions 
  } = useStore();
  
  const permissions = getPermissions();
  const [showForm, setShowForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [, setForceUpdate] = useState(0);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'staff' as UserRole,
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // به‌روزرسانی هر 30 ثانیه برای نمایش وضعیت آنلاین
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!permissions.canManageUsers) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          ⛔ شما اجازه دسترسی به این بخش را ندارید
        </div>
      </div>
    );
  }

  // بررسی آنلاین بودن کاربر (2 دقیقه اخیر فعال بوده)
  const isUserOnline = (user: User) => {
    const lastActivity = new Date(user.lastActivity).getTime();
    const now = new Date().getTime();
    const twoMinutes = 2 * 60 * 1000;
    return user.isOnline && (now - lastActivity) < twoMinutes;
  };

  // محاسبه زمان آخرین فعالیت
  const getLastActivityText = (user: User) => {
    const lastActivity = new Date(user.lastActivity);
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'همین الان';
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    return `${diffDays} روز پیش`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.name) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    // بررسی یکتا بودن نام کاربری
    const existingUser = users.find(u => u.username === formData.username);
    if (existingUser) {
      alert('این نام کاربری قبلاً استفاده شده است');
      return;
    }
    
    addUser(formData);
    setFormData({ username: '', password: '', name: '', role: 'staff' });
    setShowForm(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('رمز عبور جدید و تکرار آن مطابقت ندارند');
      return;
    }
    
    if (passwordData.newPassword.length < 4) {
      alert('رمز عبور باید حداقل 4 کاراکتر باشد');
      return;
    }
    
    if (selectedUser) {
      changePassword(selectedUser.id, passwordData.newPassword);
      setShowPasswordModal(false);
      setSelectedUser(null);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      alert('رمز عبور با موفقیت تغییر کرد');
    }
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('نمی‌توانید خودتان را حذف کنید!');
      return;
    }
    
    if (confirm(`آیا از حذف کاربر "${user.name}" مطمئن هستید؟`)) {
      deleteUser(user.id);
    }
  };

  const toggleShowPassword = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const pendingRequests = passwordResetRequests.filter(r => r.status === 'pending');
  const resolvedRequests = passwordResetRequests.filter(r => r.status !== 'pending');
  const onlineUsers = users.filter(isUserOnline);
  const offlineUsers = users.filter(u => !isUserOnline(u));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 مدیریت کاربران</h1>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-green-600">🟢 آنلاین: {onlineUsers.length}</span>
            <span className="text-gray-500">⚫ آفلاین: {offlineUsers.length}</span>
            {pendingRequests.length > 0 && (
              <span className="text-orange-600 animate-pulse">
                🔔 درخواست فراموشی رمز: {pendingRequests.length}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          کاربر جدید
        </button>
      </div>

      {/* تب‌ها */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'users' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          👥 کاربران ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg transition-colors relative ${
            activeTab === 'requests' 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🔑 درخواست‌های فراموشی رمز
          {pendingRequests.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">وضعیت</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">نام</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">نام کاربری</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">رمز عبور</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">نقش</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">آخرین فعالیت</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${user.id === currentUser?.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${isUserOnline(user) ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      <span className="text-sm text-gray-500">
                        {isUserOnline(user) ? 'آنلاین' : 'آفلاین'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{user.name}</span>
                      {user.id === currentUser?.id && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">شما</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono" dir="ltr">{user.username}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-600" dir="ltr">
                        {showPasswords[user.id] ? user.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => toggleShowPassword(user.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title={showPasswords[user.id] ? 'پنهان کردن' : 'نمایش رمز'}
                      >
                        {showPasswords[user.id] ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role === 'admin' ? '👑 ادمین' : '👷 کارمند'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getLastActivityText(user)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowPasswordModal(true);
                        }}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="تغییر رمز عبور"
                      >
                        🔑
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="حذف"
                        >
                          🗑️
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

      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* درخواست‌های در انتظار */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-orange-500">⏳</span>
              درخواست‌های در انتظار
            </h2>
            
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">هیچ درخواستی در انتظار نیست</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium text-gray-800">{request.userName}</p>
                      <p className="text-sm text-gray-500">نام کاربری: {request.username}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(request.requestedAt).toLocaleDateString('fa-IR')} - {new Date(request.requestedAt).toLocaleTimeString('fa-IR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (confirm(`آیا رمز عبور "${request.userName}" را به "${request.username}123" بازنشانی می‌کنید؟`)) {
                            approvePasswordReset(request.id);
                            alert(`رمز عبور به "${request.username}123" تغییر کرد`);
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ✅ تأیید
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('آیا این درخواست را رد می‌کنید؟')) {
                            rejectPasswordReset(request.id);
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        ❌ رد
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* درخواست‌های قبلی */}
          {resolvedRequests.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-gray-500">📋</span>
                تاریخچه درخواست‌ها
              </h2>
              <div className="space-y-2">
                {resolvedRequests.slice(-10).reverse().map((request) => (
                  <div key={request.id} className={`flex items-center justify-between p-3 rounded-lg ${
                    request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span>{request.status === 'approved' ? '✅' : '❌'}</span>
                      <div>
                        <p className="font-medium text-gray-800">{request.userName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.resolvedAt || request.requestedAt).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePasswordResetRequest(request.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* فرم افزودن کاربر */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">➕ کاربر جدید</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام کامل</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: احمد محمدی"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: ahmad"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="حداقل 4 کاراکتر"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نقش</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">👷 کارمند</option>
                  <option value="admin">👑 ادمین</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ذخیره
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ username: '', password: '', name: '', role: 'staff' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تغییر رمز عبور */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🔑 تغییر رمز عبور: {selectedUser.name}
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رمز عبور فعلی
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600 font-mono" dir="ltr">
                  {selectedUser.password}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رمز عبور جدید
                </label>
                <input
                  type="text"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="حداقل 4 کاراکتر"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تکرار رمز عبور جدید
                </label>
                <input
                  type="text"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="تکرار رمز جدید"
                  dir="ltr"
                />
              </div>
              {passwordData.newPassword && passwordData.confirmPassword && 
               passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-red-500 text-sm">❌ رمز عبور و تکرار آن مطابقت ندارند</p>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  تغییر رمز
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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
};
