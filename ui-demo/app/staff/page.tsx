'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ── Mock data ──
interface StaffOrder {
  code: string;
  table: string;
  items: string[];
  total: number;
  status: 'confirmed' | 'preparing' | 'done';
  paymentMethod: 'vietqr' | 'cash';
  time: string;
  itemDetails: { name: string; size: string; sugar: string; ice: string; toppings: string[]; done: boolean }[];
}

interface StaffAccount {
  code: string;
  name: string;
  pin: string; // prototype: plain text demo
}

const MOCK_STAFF: StaffAccount[] = [
  { code: 'NV001', name: 'Tú', pin: '123456' },
  { code: 'NV002', name: 'Lan', pin: '654321' },
];

const mockOrders: StaffOrder[] = [
  { code: 'TC-20260712-0001', table: 'B01', items: ['Cà phê sữa', 'Trà đào'], total: 73000, status: 'confirmed', paymentMethod: 'vietqr', time: '14:52', itemDetails: [
    { name: 'Cà phê sữa', size: 'M', sugar: '70%', ice: 'Ít đá', toppings: [], done: false },
    { name: 'Trà đào', size: 'L', sugar: '100%', ice: 'Bình thường', toppings: [], done: false }
  ]},
  { code: 'TC-20260712-0002', table: 'B03', items: ['Sinh tố bơ', 'Bánh flan'], total: 55000, status: 'confirmed', paymentMethod: 'cash', time: '14:55', itemDetails: [
    { name: 'Sinh tố bơ', size: 'M', sugar: '', ice: '', toppings: [], done: false },
    { name: 'Bánh flan', size: '1 size', sugar: '', ice: '', toppings: [], done: false }
  ]},
  { code: 'TC-20260712-0003', table: 'B05', items: ['Cà phê đen'], total: 30000, status: 'confirmed', paymentMethod: 'vietqr', time: '14:57', itemDetails: [
    { name: 'Cà phê đen', size: 'M', sugar: '50%', ice: 'Bình thường', toppings: [], done: false }
  ]},
  { code: 'TC-20260712-0004', table: 'B02', items: ['Trà sữa ô long', 'Đá xay cà phê'], total: 80000, status: 'preparing', paymentMethod: 'cash', time: '14:48', itemDetails: [
    { name: 'Trà sữa ô long', size: 'M', sugar: '70%', ice: 'Ít đá', toppings: ['Trân châu đen'], done: true },
    { name: 'Đá xay cà phê', size: 'L', sugar: '100%', ice: '', toppings: [], done: false }
  ]},
  { code: 'TC-20260712-0005', table: 'B07', items: ['Trà sữa matcha'], total: 40000, status: 'preparing', paymentMethod: 'vietqr', time: '14:50', itemDetails: [
    { name: 'Trà sữa matcha', size: 'M', sugar: '50%', ice: 'Ít đá', toppings: ['Kem cheese'], done: false }
  ]},
  { code: 'TC-20260712-0008', table: 'B01', items: ['Tiramisu', 'Bánh mì nướng muối ớt'], total: 50000, status: 'done', paymentMethod: 'cash', time: '14:30', itemDetails: [
    { name: 'Tiramisu', size: '1 size', sugar: '', ice: '', toppings: [], done: true },
    { name: 'Bánh mì nướng muối ớt', size: '1 size', sugar: '', ice: '', toppings: [], done: true }
  ]},
  { code: 'TC-20260712-0009', table: 'B04', items: ['Nước ép cam tươi'], total: 35000, status: 'done', paymentMethod: 'vietqr', time: '14:25', itemDetails: [
    { name: 'Nước ép cam tươi', size: 'M', sugar: '', ice: 'Ít đá', toppings: [], done: true }
  ]},
];

// ── Component ──
export default function StaffDashboardPage() {
  // Auth state — khôi phục từ localStorage khi F5
  const [loggedIn, setLoggedIn] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffCodeInput, setStaffCodeInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number>(0);
  const [initialized, setInitialized] = useState(false);

  // Dashboard state
  const [orders, setOrders] = useState<StaffOrder[]>([]);

  // Khôi phục phiên đăng nhập từ localStorage (chống F5 mất session)
  useEffect(() => {
    const savedSession = localStorage.getItem('staff-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const expiresAt = session.expiresAt || 0;
        if (Date.now() < expiresAt) {
          setLoggedIn(true);
          setStaffName(session.name);
        } else {
          localStorage.removeItem('staff-session');
        }
      } catch { localStorage.removeItem('staff-session'); }
    }
    setInitialized(true);
  }, []);

  // Login handler
  const handleLogin = () => {
    const now = Date.now();
    if (now < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - now) / 1000 / 60);
      setLoginError(`Tài khoản tạm khóa, thử lại sau ${remaining} phút`);
      return;
    }

    const staff = MOCK_STAFF.find(s => s.code === staffCodeInput.toUpperCase().trim());
    if (!staff || staff.pin !== pinInput.trim()) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 15 * 60 * 1000); // lock 15 phút
        setLoginError('Tài khoản tạm khóa 15 phút do nhập sai PIN quá 5 lần');
      } else {
        setLoginError(`Sai mã nhân viên hoặc PIN. Còn ${5 - newAttempts} lần thử`);
      }
      return;
    }

    // Success — lưu session vào localStorage (PRD: session 8 tiếng)
    const session = {
      code: staff.code,
      name: staff.name,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 tiếng
    };
    localStorage.setItem('staff-session', JSON.stringify(session));
    setLoggedIn(true);
    setStaffName(staff.name);
    setLoginError('');
    setLoginAttempts(0);
  };

  // Simulate polling
  useEffect(() => {
    if (!loggedIn) return;
    setOrders(mockOrders);
    const interval = setInterval(() => {
      // In real app: GET /api/orders?status=confirmed,preparing
    }, 3000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  const updateStatus = useCallback((code: string, newStatus: 'preparing' | 'done') => {
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, status: newStatus } : o))
    );
  }, []);

  const toggleItemDone = useCallback((orderCode: string, itemIndex: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.code !== orderCode) return o;
        const newDetails = o.itemDetails.map((d, i) =>
          i === itemIndex ? { ...d, done: !d.done } : d
        );
        return { ...o, itemDetails: newDetails };
      })
    );
  }, []);

  const confirmed = orders.filter((o) => o.status === 'confirmed');
  const preparing = orders.filter((o) => o.status === 'preparing');
  const done = orders.filter((o) => o.status === 'done');

  const statusColors = {
    confirmed: { bg: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', label: 'Mới', btn: 'bg-blue-600 hover:bg-blue-700', btnText: 'Bắt đầu làm', dot: 'bg-blue-500' },
    preparing: { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', label: 'Đang làm', btn: 'bg-green-600 hover:bg-green-700', btnText: 'Hoàn thành', dot: 'bg-yellow-500' },
    done: { bg: 'bg-gray-50 border-gray-200', badge: 'bg-green-100 text-green-700', label: 'Xong', btn: '', btnText: '', dot: 'bg-green-500' },
  };

  // ── Login Screen ──
  if (!loggedIn) {
    // Chưa khởi tạo xong (đang đọc localStorage) → hiện loading để tránh flash login
    if (!initialized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Nhân viên đăng nhập</h1>
            <p className="text-sm text-gray-600 mt-1">Tiệm Cafe Góc Nhỏ</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label htmlFor="staffCode" className="block text-sm font-semibold text-gray-900 mb-1">Mã nhân viên</label>
              <input
                id="staffCode"
                type="text"
                value={staffCodeInput}
                onChange={(e) => setStaffCodeInput(e.target.value.toUpperCase())}
                placeholder="VD: NV001"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              />
            </div>
            <div>
              <label htmlFor="staffPin" className="block text-sm font-semibold text-gray-900 mb-1">PIN (6 chữ số)</label>
              <input
                id="staffPin"
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                maxLength={6}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base tracking-[0.5em] font-mono text-center focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              type="button"
              disabled={Date.now() < lockedUntil}
              className="w-full min-h-[48px] bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors shadow-md"
            >
              Đăng nhập
            </button>

            <div className="text-center text-xs text-gray-500">
              <p>Demo: NV001 / 123456 hoặc NV002 / 654321</p>
            </div>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-amber-600 hover:text-amber-700">← Về menu</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard Nhân viên</h1>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Đang live
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:inline">{staffName} (NV)</span>
            <button onClick={() => { localStorage.removeItem('staff-session'); setLoggedIn(false); }} type="button" className="text-sm text-gray-500 hover:text-red-600 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors">Đăng xuất</button>
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">Admin</Link>
            <Link href="/" className="text-sm text-amber-600 hover:text-amber-700 font-medium px-3 py-1 hover:bg-amber-50 rounded-lg transition-colors">Menu</Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-7xl mx-auto">
        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-3xl font-bold text-blue-600">{confirmed.length}</p>
            <p className="text-sm text-gray-600">Đơn mới</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-3xl font-bold text-yellow-600">{preparing.length}</p>
            <p className="text-sm text-gray-600">Đang làm</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-3xl font-bold text-green-600">{done.length}</p>
            <p className="text-sm text-gray-600">Hoàn thành</p>
          </div>
        </div>

        {/* ── Orders Grid - 3 columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['confirmed', 'preparing', 'done'] as const).map((status) => {
            const ordersList = status === 'confirmed' ? confirmed : status === 'preparing' ? preparing : done;
            const colors = statusColors[status];

            return (
              <div key={status}>
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${colors.dot}`}></span>
                  {colors.label} ({ordersList.length})
                </h2>
                <div className="space-y-3">
                  {ordersList.map((order) => (
                    <div key={order.code} className={`bg-white rounded-xl shadow-sm border ${colors.bg} p-4`}>
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">{order.code}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${order.paymentMethod === 'vietqr' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                            {order.paymentMethod === 'vietqr' ? 'CK' : 'Tiền mặt'}
                          </span>
                          <span className="text-xs text-gray-500">{order.time}</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">Bàn {order.table}</div>

                      {/* Item List with per-item done toggle */}
                      <div className="text-sm text-gray-700 mb-3 space-y-1">
                        {order.itemDetails.map((detail, i) => (
                          <button
                            key={i}
                            onClick={() => toggleItemDone(order.code, i)}
                            type="button"
                            className="flex items-start gap-2 w-full text-left hover:bg-gray-50 rounded p-0.5 transition-colors"
                          >
                            <span className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${detail.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                              {detail.done && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                            </span>
                            <span>
                              {detail.name} ({detail.size})
                              {detail.sugar && <span className="text-xs text-gray-500 ml-1">· {detail.sugar}</span>}
                              {detail.ice && <span className="text-xs text-gray-500 ml-1">· {detail.ice}</span>}
                              {detail.toppings.length > 0 && <span className="text-xs text-gray-500"> · {detail.toppings.join(', ')}</span>}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="text-sm font-bold text-amber-700 mb-3">
                        Tổng: {order.total.toLocaleString('vi-VN')}đ
                      </div>

                      {/* Action Button */}
                      {status !== 'done' && (
                        <button
                          onClick={() => updateStatus(order.code, status === 'confirmed' ? 'preparing' : 'done')}
                          type="button"
                          className={`w-full min-h-[44px] ${colors.btn} text-white font-medium rounded-lg transition-colors text-sm`}
                        >
                          {colors.btnText}
                        </button>
                      )}
                      {status === 'done' && (
                        <div className="text-center text-xs text-green-600 font-medium py-1">✓ Hoàn thành</div>
                      )}
                    </div>
                  ))}
                  {ordersList.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">Không có đơn nào</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Polling indicator */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Tự động cập nhật mỗi 3 giây
          </span>
        </div>
      </main>
    </>
  );
}
