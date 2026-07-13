import { Link, useParams } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const { totalAmount, itemCount, tableCode } = useCartStore();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto w-full">
          <Link to="/cart" className="flex items-center gap-2 hover:opacity-80">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-gray-900">Quay lại</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Thanh toán</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Mã đơn</span><span className="font-bold">{orderCode}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Bàn</span><span className="font-semibold">{tableCode || "?"}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Số món</span><span>{itemCount()} món</span></div>
            <div className="flex justify-between pt-2 border-t"><span className="text-gray-600">Tổng tiền</span><span className="text-xl font-bold text-amber-700">{formatCurrency(totalAmount())}</span></div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
          <p className="text-gray-500 text-center py-8">
            Tính năng thanh toán sẽ được implement trong User Story THA-01
          </p>
        </div>
      </main>
    </div>
  );
}
