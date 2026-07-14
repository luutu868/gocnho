import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "@/api/orders";
import type { OrderResponse } from "@/types/order";

export default function OrderConfirmedPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        if (!orderCode) return;
        const data = await getOrder(orderCode);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderCode]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">Không tìm thấy đơn hàng</p>
        <Link to="/" className="px-6 py-2 bg-amber-600 text-white rounded-lg">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center animate-fadeIn">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
        <p className="text-gray-600 mb-8">
          Đơn hàng <span className="font-semibold text-gray-900">{order.order_code}</span> của bạn đã được gửi đến quầy pha chế.
        </p>

        <div className="bg-amber-50 rounded-xl p-4 mb-8 text-left border border-amber-100">
          <p className="text-amber-800 font-medium mb-1">
            📍 Bàn của bạn: <span className="font-bold">{order.table_code || "Chưa có"}</span>
          </p>
          <p className="text-amber-700 text-sm">
            Nhân viên sẽ mang đồ uống ra tận bàn trong ít phút. Vui lòng giữ vị trí nhé!
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md"
        >
          Trở về Menu
        </Link>
      </div>
    </div>
  );
}
