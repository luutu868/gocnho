import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStaffStore } from "@/stores/useStaffStore";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, staffName, logout } = useStaffStore();
  const { orders, isLoading, error } = useRealtimeOrders({
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) navigate("/staff");
  }, [isAuthenticated, navigate]);

  const confirmed = orders.filter((o) => o.status === "confirmed");
  const preparing = orders.filter((o) => o.status === "preparing");
  const completed = orders.filter((o) => o.status === "completed" || o.status === "done");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard Nhân viên</h1>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Đang live
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:inline">{staffName}</span>
            <button onClick={() => { logout(); navigate("/staff"); }} className="text-sm text-gray-500 hover:text-red-600 px-2 py-1">
              Đăng xuất
            </button>
            <Link to="/" className="text-sm text-amber-600 hover:text-amber-700 font-medium">Menu</Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Đơn mới", count: confirmed.length, color: "text-blue-600" },
            { label: "Đang làm", count: preparing.length, color: "text-yellow-600" },
            { label: "Hoàn thành", count: completed.length, color: "text-green-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        {isLoading && orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4" />
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : (
          <p className="text-center py-20 text-gray-500">
            Dashboard đầy đủ sẽ được implement trong User Story NVI-01
          </p>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Tự động cập nhật mỗi 3 giây
          </span>
        </div>
      </main>
    </div>
  );
}
