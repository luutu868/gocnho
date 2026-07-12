'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Types ──
const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'categories', label: 'Danh mục', icon: '📂' },
  { id: 'items', label: 'Món', icon: '🍽️' },
  { id: 'toppings', label: 'Topping', icon: '🧃' },
  { id: 'staff', label: 'Nhân viên', icon: '👥' },
  { id: 'tables', label: 'Bàn & QR', icon: '🪑' },
  { id: 'orders', label: 'Đơn hàng', icon: '📦' },
  { id: 'settings', label: 'Cấu hình', icon: '⚙️' },
];

// ── Mock admin account ──
const MOCK_ADMIN = { username: 'admin', password: 'admin123' };

// ── Login Screen ──
function LoginScreen({
  onLogin,
  loginError,
}: {
  onLogin: (username: string, password: string) => void;
  loginError: string;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Quản trị viên</h1>
          <p className="text-sm text-gray-600 mt-1">Tiệm Cafe Góc Nhỏ</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="adminUser" className="block text-sm font-semibold text-gray-900 mb-1">Tên đăng nhập</label>
            <input
              id="adminUser"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') onLogin(username, password); }}
            />
          </div>
          <div>
            <label htmlFor="adminPass" className="block text-sm font-semibold text-gray-900 mb-1">Mật khẩu</label>
            <input
              id="adminPass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              onKeyDown={(e) => { if (e.key === 'Enter') onLogin(username, password); }}
            />
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
              {loginError}
            </div>
          )}

          <button
            onClick={() => onLogin(username, password)}
            type="button"
            className="w-full min-h-[48px] bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md"
          >
            Đăng nhập
          </button>

          <div className="text-center text-xs text-gray-500">
            <p>Demo: admin / admin123</p>
            <p className="mt-1">Lần đầu đăng nhập sẽ yêu cầu đổi mật khẩu</p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-amber-600 hover:text-amber-700">← Về menu</Link>
        </div>
      </div>
    </div>
  );
}

// ── Change Password Screen (first-time) ──
function ChangePasswordScreen({ onChanged }: { onChanged: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleChange = () => {
    // Validate: min 8 ký tự, 1 hoa + 1 thường + 1 số
    if (newPassword.length < 8 || newPassword.length > 128) {
      setError('Mật khẩu tối thiểu 8 ký tự');
      return;
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Mật khẩu phải bao gồm chữ hoa, chữ thường và số');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    onChanged();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h1>
          <p className="text-sm text-gray-600 mt-1">Lần đầu đăng nhập — vui lòng đổi mật khẩu mặc định</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="newPass" className="block text-sm font-semibold text-gray-900 mb-1">Mật khẩu mới</label>
            <input
              id="newPass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleChange(); }}
            />
            <p className="text-xs text-gray-500 mt-1">Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số</p>
          </div>
          <div>
            <label htmlFor="confirmPass" className="block text-sm font-semibold text-gray-900 mb-1">Xác nhận mật khẩu</label>
            <input
              id="confirmPass"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              onKeyDown={(e) => { if (e.key === 'Enter') handleChange(); }}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <button
            onClick={handleChange}
            type="button"
            className="w-full min-h-[48px] bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ──
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Tables Mock Data ──
  const tables = ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09', 'B10', 'VIP-1', 'VIP-2'];
  const [selectedQRTable, setSelectedQRTable] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-bold text-gray-900">Tiệm Cafe</h2>
            <p className="text-xs text-gray-500">Trang quản trị</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} type="button" className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }} type="button"
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-3 ${activeSection === item.id ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-gray-700 hover:bg-gray-50'}`}>
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <button onClick={onLogout} type="button" className="w-full text-left px-4 py-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
            <span aria-hidden="true">🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} type="button" className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{sidebarItems.find(i => i.id === activeSection)?.label || 'Dashboard'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/staff" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">Staff</Link>
              <Link href="/" className="text-sm text-amber-600 hover:text-amber-700 font-medium px-3 py-2 hover:bg-amber-50 rounded-lg transition-colors">Về Menu</Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {/* ── Dashboard ── */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Đơn hàng hôm nay', value: '24', change: '↑ 12%', color: 'text-blue-600' },
                  { label: 'Doanh thu', value: '1,580,000đ', change: '↑ 8%', color: 'text-green-600' },
                  { label: 'Món trong menu', value: '22', change: '7 danh mục', color: 'text-amber-600' },
                  { label: 'Nhân viên active', value: '2', change: 'NV001, NV002', color: 'text-purple-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Đơn hàng gần đây</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Mã đơn</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Bàn</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Món</th>
                        <th className="text-right py-3 px-4 text-gray-600 font-medium">Tổng tiền</th>
                        <th className="text-center py-3 px-4 text-gray-600 font-medium">Trạng thái</th>
                        <th className="text-right py-3 px-4 text-gray-600 font-medium">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { code: 'TC-20260712-0001', table: 'B01', items: 'Cà phê sữa, Trà đào', amount: '73,000đ', status: 'Xong', time: '14:52' },
                        { code: 'TC-20260712-0002', table: 'B03', items: 'Sinh tố bơ, Bánh flan', amount: '55,000đ', status: 'Đang làm', time: '14:55' },
                        { code: 'TC-20260712-0003', table: 'B05', items: 'Cà phê đen', amount: '30,000đ', status: 'Mới', time: '14:57' },
                        { code: 'TC-20260712-0004', table: 'B02', items: 'Trà sữa ô long, Đá xay', amount: '80,000đ', status: 'Đang làm', time: '14:48' },
                        { code: 'TC-20260712-0005', table: 'B07', items: 'Trà sữa matcha', amount: '40,000đ', status: 'Mới', time: '14:50' },
                      ].map((order, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">{order.code}</td>
                          <td className="py-3 px-4 text-gray-700">{order.table}</td>
                          <td className="py-3 px-4 text-gray-700">{order.items}</td>
                          <td className="py-3 px-4 text-right font-semibold text-amber-700">{order.amount}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'Xong' ? 'bg-green-100 text-green-700' :
                              order.status === 'Đang làm' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>{order.status}</span>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-500">{order.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Tables & QR ── */}
          {activeSection === 'tables' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quản lý bàn & QR Code</h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  <button type="button" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">+ Thêm bàn</button>
                  <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">📥 Tải tất cả QR (ZIP)</button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {tables.map((table) => (
                    <div key={table} className="border border-gray-200 rounded-xl p-3 text-center hover:border-amber-300 transition-colors">
                      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" opacity="0.3"/>
                          <rect x="14" y="2" width="8" height="8" rx="1" fill="currentColor" opacity="0.5"/>
                          <rect x="2" y="14" width="8" height="8" rx="1" fill="currentColor" opacity="0.5"/>
                          <rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor"/>
                          <rect x="19" y="14" width="3" height="3" rx="0.5" fill="currentColor"/>
                          <rect x="14" y="19" width="3" height="3" rx="0.5" fill="currentColor"/>
                          <rect x="19" y="19" width="3" height="3" rx="0.5" fill="currentColor"/>
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{table}</p>
                      <div className="flex gap-1 mt-2 justify-center">
                        <button
                          onClick={() => setSelectedQRTable(selectedQRTable === table ? null : table)}
                          type="button"
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium px-2 py-1 hover:bg-amber-50 rounded transition-colors"
                        >
                          {selectedQRTable === table ? 'Ẩn QR' : 'Xem QR'}
                        </button>
                        <button type="button" className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 hover:bg-gray-100 rounded transition-colors">📥</button>
                      </div>
                      {selectedQRTable === table && (
                        <div className="mt-2 p-2 bg-white border border-amber-200 rounded-lg">
                          <div className="w-full aspect-square bg-purple-50 rounded-lg flex items-center justify-center mb-1">
                            <span className="text-xs text-gray-500 font-mono">QR: /?table={table}</span>
                          </div>
                          <button type="button" className="w-full text-xs text-white bg-amber-600 hover:bg-amber-700 rounded py-1 transition-colors">
                            📥 Tải PNG
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Settings ── */}
          {activeSection === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin quán</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên quán</label>
                    <input defaultValue="Tiệm Cafe Góc Nhỏ" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-600 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input defaultValue="0912345678" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-600 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-600 focus:border-transparent" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin ngân hàng (VietQR)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngân hàng</label>
                    <input defaultValue="VPBank" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-600 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã BIN ngân hàng (6 chữ số)</label>
                    <input defaultValue="970432" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-600 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
                    <input defaultValue="680180598" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-600 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ tài khoản (IN HOA)</label>
                    <input defaultValue="LUU VAN TU" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-amber-600 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh / Tỉnh thành</label>
                    <input defaultValue="Hà Nội" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-600 focus:border-transparent" />
                  </div>
                  <button type="button" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors text-sm">Lưu cấu hình</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Placeholder for other sections ── */}
          {!['dashboard', 'tables', 'settings'].includes(activeSection) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-5xl mb-4">{sidebarItems.find(i => i.id === activeSection)?.icon}</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{sidebarItems.find(i => i.id === activeSection)?.label}</h2>
              <p className="text-gray-600">Tính năng này sẽ được phát triển trong giai đoạn tiếp theo</p>
              <div className="mt-6 inline-flex gap-3">
                <Link href="/staff" className="px-6 py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors">Về Staff Dashboard</Link>
                <Link href="/" className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md">Về Menu</Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Root Admin Page ──
export default function AdminPage() {
  // Auth states: 'login' | 'changePassword' | 'dashboard'
  const [authState, setAuthState] = useState<'login' | 'changePassword' | 'dashboard'>('login');
  const [loginError, setLoginError] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Khôi phục phiên admin từ localStorage (chống F5 mất session)
  useEffect(() => {
    const savedSession = localStorage.getItem('admin-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (Date.now() < session.expiresAt) {
          if (session.passwordChanged) {
            setAuthState('dashboard');
          }
        } else {
          localStorage.removeItem('admin-session');
        }
      } catch { localStorage.removeItem('admin-session'); }
    }
    setInitialized(true);
  }, []);

  const handleLogin = (username: string, password: string) => {
    if (username === MOCK_ADMIN.username && password === MOCK_ADMIN.password) {
      // Simulate: password_changed_at is NULL → first login
      setAuthState('changePassword');
      setLoginError('');
    } else {
      setLoginError('Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  const handlePasswordChanged = () => {
    // Lưu session admin (PRD: JWT session, prototype dùng localStorage)
    const session = {
      username: MOCK_ADMIN.username,
      passwordChanged: true,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 tiếng
    };
    localStorage.setItem('admin-session', JSON.stringify(session));
    setAuthState('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-session');
    setAuthState('login');
    setLoginError('');
  };

  // Chưa khởi tạo → loading để tránh flash login
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (authState === 'login') {
    return <LoginScreen onLogin={handleLogin} loginError={loginError} />;
  }

  if (authState === 'changePassword') {
    return <ChangePasswordScreen onChanged={handlePasswordChanged} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
