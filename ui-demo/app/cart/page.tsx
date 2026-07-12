'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalAmount, itemCount, tableNumber, setTableNumber, placeOrder } = useCart();
  const [editTable, setEditTable] = useState(false);
  const [tableInput, setTableInput] = useState(tableNumber);
  // Nếu chưa có table → hiện popup chọn bàn
  const [showTablePopup, setShowTablePopup] = useState(!tableNumber);

  const handlePlaceOrder = () => {
    // Bắt buộc có bàn trước khi đặt
    if (!tableNumber) {
      setShowTablePopup(true);
      return;
    }
    // PRD: "Đặt món" từ giỏ → tạo order (pending_payment) → lưu lastOrder + xoá giỏ → redirect checkout
    // placeOrder trả về order có code, checkout sẽ đọc từ lastOrder
    const order = placeOrder('vietqr');
    router.push(`/checkout/${order.code}`);
  };

  const handleTableConfirm = (table: string) => {
    if (table.trim()) {
      setTableNumber(table.trim().toUpperCase());
      setShowTablePopup(false);
    }
  };

  return (
    <>
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white shadow-sm" role="banner">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-gray-900">Quay lại</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Giỏ hàng</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto">
        {/* ── Table info ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-gray-500">Bàn:</span>
            {tableNumber ? (
              <span className="font-semibold bg-amber-50 text-amber-900 px-3 py-1 rounded-lg border border-amber-200">
                {tableNumber}
              </span>
            ) : (
              <span className="text-red-500 font-medium">Chưa chọn bàn</span>
            )}
          </div>
          {editTable ? (
            <div className="flex items-center gap-1">
              <input
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { setTableNumber(tableInput); setEditTable(false); }
                  if (e.key === 'Escape') { setEditTable(false); }
                }}
                placeholder="VD: B01"
              />
              <button onClick={() => { setTableNumber(tableInput); setEditTable(false); }} type="button"
                className="text-xs text-green-600 hover:text-green-700 font-medium px-1">OK</button>
              <button onClick={() => setEditTable(false)} type="button"
                className="text-xs text-red-500 hover:text-red-600 font-medium px-1">Hủy</button>
            </div>
          ) : (
            <button onClick={() => { setTableInput(tableNumber); setEditTable(true); }} type="button"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium min-h-[44px] flex items-center">
              Đổi bàn
            </button>
          )}
        </div>

        {/* ── Empty state ── */}
        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4" aria-hidden="true">🛒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Thêm món vào giỏ hàng từ menu để tiếp tục</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
            >
              Xem menu
            </Link>
          </div>
        ) : (
          <>
            {/* ── Cart items ── */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Size {item.size}
                        {item.sugar && <> · Đường {item.sugar}</>}
                        {item.ice && <> · Đá {item.ice}</>}
                        {item.toppings.length > 0 && (
                          <> · {item.toppings.join(', ')}</>
                        )}
                      </p>
                      {item.note && (
                        <p className="text-xs text-gray-500 mt-1 italic">📝 {item.note}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      type="button"
                      className="ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Xóa ${item.name}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        type="button"
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        type="button"
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-lg font-bold text-amber-700">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Total & Order button ── */}
            <div className="sticky bottom-0 mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Tổng cộng ({itemCount} món):</span>
                <span className="text-2xl font-bold text-amber-700">
                  {totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={items.length === 0}
                type="button"
                className={`block w-full text-center px-6 py-3 font-semibold rounded-lg transition-colors ${
                  items.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                Đặt món
              </button>
              {!tableNumber && (
                <p className="text-red-500 text-xs text-center mt-2">Vui lòng chọn bàn trước khi đặt món</p>
              )}
            </div>
          </>
        )}

        {/* ── Table popup (nếu chưa có bàn) ── */}
        {showTablePopup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Chọn bàn">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bạn ngồi bàn số mấy?</h3>
              <p className="text-sm text-gray-600 mb-4">Vui lòng nhập số bàn để nhân viên mang nước ra đúng bàn của bạn.</p>
              <div className="space-y-3">
                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2">
                  {['B01','B02','B03','B04','B05','B06','B07','B08','B09','B10'].map(b => (
                    <button key={b} onClick={() => handleTableConfirm(b)} type="button"
                      className="px-3 py-2 bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-700 rounded-lg text-sm font-medium transition-colors border border-gray-200 hover:border-amber-300">
                      {b}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tableInput}
                    onChange={(e) => setTableInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    placeholder="Nhập số bàn (VD: B01)"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleTableConfirm(tableInput); }}
                  />
                  <button onClick={() => handleTableConfirm(tableInput)} type="button"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700 transition-colors">
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
