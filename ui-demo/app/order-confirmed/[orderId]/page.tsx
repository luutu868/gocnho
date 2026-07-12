'use client';

import { use } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function OrderConfirmedPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { lastOrder, tableNumber } = useCart();

  // Dùng lastOrder nếu có, không thì fallback với thông tin từ URL
  const order = lastOrder && lastOrder.code === orderId ? lastOrder : null;
  const displayTable = order?.table || tableNumber || '?';
  const displayItems = order?.items || [];
  const displayTotal = order?.totalAmount || displayItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const paymentLabel = order?.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản (VietQR)';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-white to-amber-50">
      <div className="w-full max-w-md">
        {/* ── Success Icon ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <svg className="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt món thành công!</h2>
          <p className="text-gray-600">Đơn hàng của bạn đã được gửi đến nhà bếp</p>
        </div>

        {/* ── Order Details ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Chi tiết đơn hàng
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-600">Mã đơn</span>
              <span className="font-bold text-lg text-gray-900">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-600">Bàn</span>
              <span className="font-semibold bg-amber-50 text-amber-900 px-3 py-1 rounded-lg border border-amber-200">{displayTable}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-600">Phương thức</span>
              <span className="font-medium text-gray-900">{paymentLabel}</span>
            </div>

            <div className="pt-2">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Món đã đặt:</h4>
              <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                {displayItems.length > 0 ? (
                  <>
                    {displayItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.name} ({item.size})
                          {item.sugar && <span className="text-xs text-gray-500 ml-1">· {item.sugar}</span>}
                          {item.ice && <span className="text-xs text-gray-500 ml-1">· {item.ice}</span>}
                          {item.toppings.length > 0 && <span className="text-xs text-gray-500"> · {item.toppings.join(', ')}</span>}
                        </span>
                        <span className="text-gray-900">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 flex justify-between">
                      <span className="font-semibold text-gray-900">Tổng cộng</span>
                      <span className="font-bold text-amber-700">{displayTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">Đơn hàng đã được xác nhận</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Message ── */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-900 text-center">
            Nhân viên sẽ mang nước ra bàn của bạn trong ít phút
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="space-y-3">
          <Link href="/" className="block w-full text-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md">
            Về trang chủ
          </Link>
          <Link href="/staff" className="block w-full text-center px-6 py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors">
            Xem Dashboard nhân viên (Demo)
          </Link>
        </div>
      </div>
    </div>
  );
}
