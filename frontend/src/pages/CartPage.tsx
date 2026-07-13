import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalAmount, itemCount, tableCode } = useCartStore();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto w-full">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
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
        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Thêm món vào giỏ hàng từ menu để tiếp tục</p>
            <Link to="/" className="inline-flex px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors">
              Xem menu
            </Link>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Bàn: <span className="font-semibold bg-amber-50 text-amber-900 px-2 py-1 rounded">{tableCode || "?"}</span>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600 p-1" aria-label="Xóa">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Size {item.variantSize}
                    {item.options.map((o) => ` · ${o.group_name} ${o.value}`).join("")}
                    {item.toppings.map((t) => ` · ${t.name}`).join("")}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">−</button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">+</button>
                    </div>
                    <span className="text-lg font-bold text-amber-700">{formatCurrency(item.totalPrice * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between mb-4">
                <span>Tổng cộng ({itemCount()} món):</span>
                <span className="text-2xl font-bold text-amber-700">{formatCurrency(totalAmount())}</span>
              </div>
              <button
                onClick={() => navigate("/checkout/placeholder")}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
              >
                Đặt món
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
