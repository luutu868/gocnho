import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { createOrder } from "@/api/orders";
import { EditCartItemModal } from "@/components/cart";
import type { CartItem } from "@/types/order";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    removeItem,
    updateQuantity,
    totalAmount,
    itemCount,
    tableCode,
    setTableCode,
    clearCart,
  } = useCartStore();

  const [editTable, setEditTable] = useState(false);
  const [tableInput, setTableInput] = useState(tableCode || "");
  const [showTablePopup, setShowTablePopup] = useState(false);

  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTableConfirm = (table: string) => {
    if (table.trim()) {
      setTableCode(table.trim().toUpperCase());
      setShowTablePopup(false);
      setEditTable(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!tableCode) {
      setShowTablePopup(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        table_code: tableCode,
        payment_method: "vietqr" as const,
        items: items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          options: item.options.map((o) => ({ option_id: o.option_id })),
          toppings: item.toppings.map((t) => ({
            topping_id: t.id,
            quantity: t.quantity,
          })),
          note: item.note || undefined,
        })),
      };

      const res = await createOrder(payload);
      clearCart();
      navigate(`/checkout/${res.order_code}`);
    } catch (err) {
      console.error("Lỗi đặt món:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi đặt món. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm" role="banner">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto w-full">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-gray-900">Quay lại</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Giỏ hàng</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        {/* Table info */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-gray-500">Bàn:</span>
            {tableCode ? (
              <span className="font-semibold bg-amber-50 text-amber-900 px-3 py-1 rounded-lg border border-amber-200">
                {tableCode}
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
                  if (e.key === "Enter") handleTableConfirm(tableInput);
                  if (e.key === "Escape") setEditTable(false);
                }}
                placeholder="VD: B01"
              />
              <button
                onClick={() => handleTableConfirm(tableInput)}
                type="button"
                className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1"
              >
                OK
              </button>
              <button
                onClick={() => setEditTable(false)}
                type="button"
                className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTableInput(tableCode || "");
                setEditTable(true);
              }}
              type="button"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium min-h-[44px] flex items-center"
            >
              Đổi bàn
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl mb-4">
            {errorMessage}
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4" aria-hidden="true">🛒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Thêm món vào giỏ hàng từ menu để tiếp tục</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
            >
              Xem menu
            </Link>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-gray-900 truncate">{item.productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Size {item.variantSize}
                        {item.options.map((o) => ` · ${o.group_name} ${o.value}`).join("")}
                        {item.toppings.map((t) => ` · ${t.name}`).join("")}
                      </p>
                      {item.note && (
                        <p className="text-xs text-gray-500 mt-1 italic">📝 {item.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingItem(item)}
                        type="button"
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium px-2 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        type="button"
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Xóa ${item.productName}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        type="button"
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        type="button"
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-lg font-bold text-amber-700">
                      {formatCurrency(item.totalPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Order button */}
            <div className="sticky bottom-0 mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Tổng cộng ({itemCount()} món):</span>
                <span className="text-2xl font-bold text-amber-700">
                  {formatCurrency(totalAmount())}
                </span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={items.length === 0 || isSubmitting}
                type="button"
                className={`w-full py-3.5 font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base ${
                  items.length === 0 || isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Đang tạo đơn...</span>
                  </>
                ) : (
                  <span>Đặt món</span>
                )}
              </button>
              {!tableCode && (
                <p className="text-red-500 text-xs text-center mt-2">
                  Vui lòng chọn bàn trước khi đặt món
                </p>
              )}
            </div>
          </>
        )}

        {/* Table popup if missing tableCode */}
        {showTablePopup && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Chọn bàn"
          >
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bạn ngồi bàn số mấy?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng chọn số bàn để nhân viên mang nước ra đúng bàn của bạn.
              </p>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10"].map((b) => (
                    <button
                      key={b}
                      onClick={() => handleTableConfirm(b)}
                      type="button"
                      className="px-3.5 py-2 bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-700 rounded-lg text-sm font-medium transition-colors border border-gray-200 hover:border-amber-300"
                    >
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTableConfirm(tableInput);
                    }}
                  />
                  <button
                    onClick={() => handleTableConfirm(tableInput)}
                    type="button"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700 transition-colors"
                  >
                    OK
                  </button>
                </div>
                <button
                  onClick={() => setShowTablePopup(false)}
                  type="button"
                  className="w-full text-center text-xs text-gray-400 hover:text-gray-600 pt-1"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit cart item modal */}
        <EditCartItemModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      </main>
    </div>
  );
}
