import { Link, useParams } from "react-router-dom";

export default function OrderConfirmed() {
  const { orderCode } = useParams<{ orderCode: string }>();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-white to-amber-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <svg className="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt món thành công!</h2>
          <p className="text-gray-600">Đơn hàng của bạn đã được gửi đến nhà bếp</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Chi tiết đơn hàng</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-600">Mã đơn</span><span className="font-bold text-lg">{orderCode}</span></div>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-900 text-center">Nhân viên sẽ mang nước ra bàn của bạn trong ít phút</p>
        </div>

        <Link to="/" className="block w-full text-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
