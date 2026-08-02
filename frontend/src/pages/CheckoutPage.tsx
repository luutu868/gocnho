import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getOrder, confirmPayment, confirmCash } from "@/api/orders";
import { formatCurrency } from "@/lib/utils";
import type { OrderResponse } from "@/types/order";

export default function CheckoutPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "cash" | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        if (!orderCode) return;
        const data = await getOrder(orderCode);
        setOrder(data);
        if (data.status === "confirmed") {
          navigate(`/order-confirmed/${orderCode}`);
        }
      } catch (err) {
        setError("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderCode, navigate]);

  const handleConfirm = async () => {
    if (!orderCode || !paymentMethod) return;
    setIsConfirming(true);
    try {
      if (paymentMethod === "vietqr") {
        await confirmPayment(orderCode);
      } else {
        await confirmCash(orderCode);
      }
      navigate(`/order-confirmed/${orderCode}`);
    } catch (err) {
      alert("Đã xảy ra lỗi khi xác nhận thanh toán");
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi</h2>
        <p className="text-gray-600 mb-6">{error || "Không tìm thấy đơn hàng"}</p>
        <Link to="/" className="px-6 py-2 bg-amber-600 text-white rounded-lg">Về trang chủ</Link>
      </div>
    );
  }

  const itemCount = order.items.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto w-full">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-gray-900">Quay lại menu</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Thanh toán</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📋 Thông tin đơn hàng
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Mã đơn</span>
              <span className="font-bold text-gray-900">{order.order_code}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Bàn</span>
              <span className="font-semibold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 text-xs">
                {order.table_code || "?"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Số món</span>
              <span className="font-medium text-gray-900">{itemCount} món</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tổng tiền</span>
              <span className="text-xl font-bold text-amber-700">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod("vietqr")}
              className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-colors text-left ${
                paymentMethod === "vietqr" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">📱</div>
                <div>
                  <p className="font-semibold text-gray-900">Chuyển khoản (VietQR)</p>
                  <p className="text-sm text-gray-600">Quét mã QR để thanh toán</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "vietqr" ? "border-purple-500 bg-purple-500" : "border-gray-300"}`}>
                {paymentMethod === "vietqr" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("cash")}
              className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-colors text-left ${
                paymentMethod === "cash" ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">💵</div>
                <div>
                  <p className="font-semibold text-gray-900">Tiền mặt</p>
                  <p className="text-sm text-gray-600">Thanh toán khi nhận món</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "cash" ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
                {paymentMethod === "cash" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </button>
          </div>

          {/* Details for VietQR */}
          {paymentMethod === "vietqr" && order.qr_code_data && order.bank_info && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex flex-col items-center">
                <div className="bg-white p-2 rounded-xl border border-purple-200 mb-4 shadow-sm">
                  <img src={order.qr_code_data} alt="VietQR Code" className="w-48 h-48" />
                </div>
                <div className="text-sm text-center space-y-1 w-full">
                  <p><span className="text-gray-600">Ngân hàng:</span> <span className="font-medium">{order.bank_info.bank_bin}</span></p>
                  <p><span className="text-gray-600">STK:</span> <span className="font-medium">{order.bank_info.account_no}</span></p>
                  <p><span className="text-gray-600">Chủ TK:</span> <span className="font-medium">{order.bank_info.account_name}</span></p>
                  <p><span className="text-gray-600">Số tiền:</span> <span className="font-bold text-amber-700 text-lg">{formatCurrency(order.total_amount)}</span></p>
                  <p className="text-xs text-purple-700 mt-2 bg-white rounded-lg p-2 border border-purple-100">
                    💡 Nội dung CK: <span className="font-mono font-semibold">{order.order_code}</span>
                  </p>
                </div>
                <div className="mt-3 text-xs text-gray-600 bg-white rounded-lg p-3 border border-purple-100 w-full text-left">
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

          {/* Details for Cash */}
          {paymentMethod === "cash" && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <p className="text-green-800 text-sm">💵 Nhân viên sẽ thu tiền khi mang nước ra bàn của bạn</p>
            </div>
          )}

          {/* Confirm Button */}
          {paymentMethod && (
            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="w-full mt-4 min-h-[48px] bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md disabled:bg-gray-400"
            >
              {isConfirming
                ? "Đang xử lý..."
                : paymentMethod === "vietqr"
                ? "Tôi đã chuyển khoản"
                : "Xác nhận đặt món (tiền mặt)"}
            </button>
          )}

          {!paymentMethod && (
            <p className="text-gray-500 text-xs text-center mt-4">Vui lòng chọn phương thức thanh toán</p>
          )}
        </div>
      </main>
    </div>
  );
}
