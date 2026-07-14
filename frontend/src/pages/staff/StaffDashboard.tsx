import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStaffStore } from "@/stores/useStaffStore";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { updateOrderStatus, updateItemStatus } from "@/api/staff";
import type { StaffOrder } from "@/types/staff";

interface OrderCardProps {
  order: StaffOrder;
  onUpdateOrderStatus: (id: string, status: string) => void;
  onUpdateItemStatus: (id: string, status: string) => void;
}

function OrderCard({ order, onUpdateOrderStatus, onUpdateItemStatus }: OrderCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="font-bold text-lg text-gray-900">
            {order.table_code ? `Bàn ${order.table_code}` : "Mang đi"}
          </span>
          <p className="text-xs text-gray-500 mt-0.5">#{order.order_code}</p>
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            order.payment_method === "vietqr"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}>
            {order.payment_method === "vietqr" ? "Chuyển khoản" : "Tiền mặt"}
          </span>
          <p className="text-sm font-semibold mt-1">{order.total_amount.toLocaleString()}đ</p>
        </div>
      </div>

      {/* Note */}
      {order.note && (
        <div className="bg-yellow-50 p-2 rounded text-sm text-yellow-800 border border-yellow-200">
          <strong>Ghi chú:</strong> {order.note}
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3 border-t pt-3">
        {order.items.map((item) => {
          const isDone = item.status === "done";
          const isPreparing = order.status === "preparing";
          return (
            <div key={item.id} className="flex items-start gap-2.5">
              {isPreparing ? (
                <button
                  onClick={() => onUpdateItemStatus(item.id, isDone ? "preparing" : "done")}
                  type="button"
                  className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  {isDone && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ) : (
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDone ? "bg-gray-400" : "bg-amber-500"}`} />
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
                  {item.quantity}x {item.product_name}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.variant && (
                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                      Size {item.variant.size}
                    </span>
                  )}
                  {item.options.map((opt, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                      {opt.value}
                    </span>
                  ))}
                  {item.toppings.map((top, i) => (
                    <span key={i} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                      +{top.name}
                    </span>
                  ))}
                </div>
                {item.note && (
                  <p className="text-xs text-gray-500 italic mt-1">- {item.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="pt-3 border-t flex gap-2">
        {order.status === "confirmed" && (
          <button
            onClick={() => onUpdateOrderStatus(order.id, "preparing")}
            className="flex-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Bắt đầu làm
          </button>
        )}
        {order.status === "preparing" && (
          <button
            onClick={() => onUpdateOrderStatus(order.id, "completed")}
            className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Hoàn thành đơn
          </button>
        )}
        {(order.status === "completed" || order.status === "done") && (
          <div className="flex-1 text-center text-xs text-green-600 font-medium py-2">✓ Đã xong</div>
        )}
      </div>
    </div>
  );
}

// ─── Column component ───
interface KanbanColumnProps {
  title: string;
  count: number;
  borderColor: string;
  badgeClass: string;
  emptyText: string;
  orders: StaffOrder[];
  onUpdateOrderStatus: (id: string, status: string) => void;
  onUpdateItemStatus: (id: string, status: string) => void;
  opacity?: string;
}

function KanbanColumn({
  title, count, borderColor, badgeClass, emptyText, orders,
  onUpdateOrderStatus, onUpdateItemStatus, opacity = "",
}: KanbanColumnProps) {
  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between border-b-2 ${borderColor} pb-2`}>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeClass}`}>{count}</span>
      </div>
      <div className={`space-y-4 ${opacity}`}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onUpdateItemStatus={onUpdateItemStatus}
          />
        ))}
        {orders.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed rounded-xl">
            {emptyText}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───
export default function StaffDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, staffName, logout } = useStaffStore();

  const { orders, error } = useRealtimeOrders({
    enabled: isAuthenticated,
    statuses: ["confirmed", "preparing", "completed"],
  });

  // Redirect unauthenticated users — must be in useEffect, NOT in render
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/staff");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
    } catch (err) {
      console.error("updateOrderStatus error:", err);
    }
  };

  const handleUpdateItemStatus = async (itemId: string, status: string) => {
    try {
      await updateItemStatus(itemId, status);
    } catch (err) {
      console.error("updateItemStatus error:", err);
    }
  };

  const confirmed = orders.filter((o) => o.status === "confirmed");
  const preparing = orders.filter((o) => o.status === "preparing");
  const completed = orders.filter((o) => o.status === "completed" || o.status === "done");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard Nhân viên</h1>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
              Live
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              👤 {staffName}
            </span>
            <button
              onClick={() => { logout(); navigate("/staff"); }}
              className="text-sm text-gray-500 hover:text-red-600 px-2 py-1 rounded transition-colors"
            >
              Đăng xuất
            </button>
            <Link to="/" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Về menu
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KanbanColumn
            title="Mới nhận"
            count={confirmed.length}
            borderColor="border-blue-500"
            badgeClass="bg-blue-100 text-blue-700"
            emptyText="Chưa có đơn mới"
            orders={confirmed}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateItemStatus={handleUpdateItemStatus}
          />
          <KanbanColumn
            title="Đang pha chế"
            count={preparing.length}
            borderColor="border-yellow-500"
            badgeClass="bg-yellow-100 text-yellow-700"
            emptyText="Chưa có đơn đang làm"
            orders={preparing}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateItemStatus={handleUpdateItemStatus}
          />
          <KanbanColumn
            title="Đã xong"
            count={completed.length}
            borderColor="border-green-500"
            badgeClass="bg-green-100 text-green-700"
            emptyText="Trống"
            orders={completed.slice(0, 10)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateItemStatus={handleUpdateItemStatus}
            opacity="opacity-75"
          />
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Tự động cập nhật mỗi 3 giây
          </span>
        </div>
      </main>
    </div>
  );
}
