'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const { items, lastOrder, totalAmount, itemCount, tableNumber, setTableNumber, placeOrder, clearCart } = useCart();

  // Nguồn dữ liệu chính: lastOrder (từ cart placeOrder) hoặc fallback items (cart chưa clear)
  // Sau khi placeOrder từ cart, cart đã bị clear → items=[], lastOrder chứa dữ liệu
  const orderItems = lastOrder && lastOrder.code === orderId ? lastOrder.items : items;
  const orderTotal = lastOrder && lastOrder.code === orderId ? lastOrder.totalAmount : totalAmount;
  const orderItemCount = lastOrder && lastOrder.code === orderId
    ? lastOrder.items.reduce((s, i) => s + i.quantity, 0)
    : itemCount;
  const orderTable = lastOrder && lastOrder.code === orderId ? lastOrder.table : tableNumber;

  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'cash' | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [editTable, setEditTable] = useState(false);
  const [tableInput, setTableInput] = useState(orderTable);

  const handleConfirmPayment = () => {
    if (!paymentMethod) return;

    // PRD: confirm payment → cập nhật lastOrder với payment method
    if (lastOrder && lastOrder.code === orderId) {
      lastOrder.paymentMethod = paymentMethod;
    } else if (items.length > 0) {
      // Fallback: nếu đến thẳng checkout chưa qua cart (ít gặp), tạo order ngay
      placeOrder(paymentMethod);
    }
    setConfirmed(true);
  };

  const handleGoToConfirmed = () => {
    router.push(`/order-confirmed/${orderId}`);
  };

  // Redirect về menu nếu không có dữ liệu gì (cả lastOrder lẫn items đều trống)
  if (orderItems.length === 0 && !confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
        <p className="text-gray-600 mb-6">Đơn hàng có thể đã hết hạn hoặc không tồn tại</p>
        <Link href="/" className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md">
          Về menu
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <Link href="/cart" className="flex items-center gap-2 hover:opacity-80 transition">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-gray-900">Quay lại</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Thanh toán</h1>
          <div className="w-6"></div>
        </div>
      </div>

      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto">
        {/* ── Order Info ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Thông tin đơn hàng
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Mã đơn</span>
              <span className="font-bold text-gray-900">{orderId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Bàn</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 text-xs">{orderTable || '?'}</span>
                {editTable ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={tableInput}
                      onChange={(e) => setTableInput(e.target.value)}
                      className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs text-center focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { setTableNumber(tableInput); setEditTable(false); }
                        if (e.key === 'Escape') { setEditTable(false); }
                      }}
                    />
                    <button onClick={() => { setTableNumber(tableInput); setEditTable(false); }} type="button" className="text-xs text-green-600 font-medium">OK</button>
                    <button onClick={() => setEditTable(false)} type="button" className="text-xs text-red-500 font-medium">Hủy</button>
                  </div>
                ) : (
                  <button onClick={() => { setTableInput(orderTable); setEditTable(true); }} type="button" className="text-xs text-amber-600 hover:text-amber-700">Đổi</button>
                )}
              </div>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Số món</span>
              <span className="font-medium text-gray-900">{orderItemCount} món</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tổng tiền</span>
              <span className="text-xl font-bold text-amber-700">{orderTotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* ── Items list ── */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Danh sách món</h3>
            <div className="space-y-2">
              {orderItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.quantity}x {item.name} ({item.size})
                    {item.sugar && <span className="text-xs text-gray-500 ml-1">· {item.sugar}</span>}
                    {item.ice && <span className="text-xs text-gray-500 ml-1">· {item.ice}</span>}
                    {item.toppings.length > 0 && <span className="text-xs text-gray-500 ml-1">· {item.toppings.join(', ')}</span>}
                  </span>
                  <span className="font-medium text-gray-900">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Payment Methods ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>

          <div className="space-y-3">
            {/* VietQR */}
            <button onClick={() => setPaymentMethod('vietqr')} type="button"
              className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-colors text-left ${
                paymentMethod === 'vietqr' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl" aria-hidden="true">📱</div>
                <div>
                  <p className="font-semibold text-gray-900">Chuyển khoản (VietQR)</p>
                  <p className="text-sm text-gray-600">Quét mã QR để thanh toán</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'vietqr' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                {paymentMethod === 'vietqr' && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
              </div>
            </button>

            {/* Cash */}
            <button onClick={() => setPaymentMethod('cash')} type="button"
              className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-colors text-left ${
                paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl" aria-hidden="true">💵</div>
                <div>
                  <p className="font-semibold text-gray-900">Tiền mặt</p>
                  <p className="text-sm text-gray-600">Thanh toán khi nhận món</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'cash' ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                {paymentMethod === 'cash' && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
              </div>
            </button>
          </div>

          {/* ── VietQR Details ── */}
          {paymentMethod === 'vietqr' && !confirmed && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 bg-white rounded-xl border-2 border-purple-300 flex items-center justify-center mb-3 shadow-sm">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto text-purple-400" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor"/>
                      <rect x="14" y="2" width="8" height="8" rx="1" fill="currentColor"/>
                      <rect x="2" y="14" width="8" height="8" rx="1" fill="currentColor"/>
                      <rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor"/>
                      <rect x="19" y="14" width="3" height="3" rx="0.5" fill="currentColor"/>
                      <rect x="14" y="19" width="3" height="3" rx="0.5" fill="currentColor"/>
                      <rect x="19" y="19" width="3" height="3" rx="0.5" fill="currentColor"/>
                    </svg>
                    <p className="text-xs font-mono text-gray-400 mt-1">VietQR</p>
                  </div>
                </div>
                <div className="text-sm text-center space-y-1 w-full">
                  <p><span className="text-gray-600">Ngân hàng:</span> <span className="font-medium">VPBank</span></p>
                  <p><span className="text-gray-600">STK:</span> <span className="font-medium">680180598</span></p>
                  <p><span className="text-gray-600">Chủ TK:</span> <span className="font-medium">LUU VAN TU</span></p>
                  <p><span className="text-gray-600">Số tiền:</span> <span className="font-bold text-amber-700 text-lg">{orderTotal.toLocaleString('vi-VN')}đ</span></p>
                  <p className="text-xs text-purple-700 mt-2 bg-white rounded-lg p-2 border border-purple-100">
                    💡 Nội dung CK: <span className="font-mono font-semibold">{orderId}</span>
                  </p>
                </div>

                <div className="mt-3 text-xs text-gray-600 bg-white rounded-lg p-3 border border-purple-100 w-full">
                  <p className="font-semibold mb-1">📋 Hướng dẫn:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Mở app ngân hàng</li>
                    <li>Quét mã QR</li>
                    <li>Xác nhận chuyển khoản</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* ── Cash message ── */}
          {paymentMethod === 'cash' && !confirmed && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <p className="text-green-800 text-sm">💵 Nhân viên sẽ thu tiền khi mang nước ra bàn của bạn</p>
            </div>
          )}

          {/* ── Confirm Buttons ── */}
          {paymentMethod && !confirmed && (
            <button onClick={handleConfirmPayment} type="button"
              className="w-full mt-4 min-h-[48px] bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
              {paymentMethod === 'vietqr' ? 'Tôi đã chuyển khoản' : 'Xác nhận đặt món (tiền mặt)'}
            </button>
          )}

          {!paymentMethod && !confirmed && (
            <p className="text-gray-500 text-xs text-center mt-4">Vui lòng chọn phương thức thanh toán</p>
          )}

          {/* ── Success ── */}
          {confirmed && (
            <div className="mt-4 p-6 text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-600 mb-4">Đơn hàng của bạn đã được gửi đến nhà bếp</p>
              <button onClick={handleGoToConfirmed} type="button"
                className="inline-flex items-center justify-center px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md">
                Xem xác nhận đơn hàng
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-gray-500 space-x-3">
          <Link href="/" className="hover:text-amber-600 transition-colors">Về menu</Link>
          <span>·</span>
          <Link href="/staff" className="hover:text-amber-600 transition-colors">Dashboard NV (Demo)</Link>
        </div>
      </main>
    </>
  );
}
