import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ─── Lazy-loaded pages (code splitting) ───
const MenuPage = lazy(() => import("@/pages/MenuPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const OrderConfirmed = lazy(() => import("@/pages/OrderConfirmedPage"));
const StaffLogin = lazy(() => import("@/pages/staff/StaffLogin"));
const StaffDashboard = lazy(() => import("@/pages/staff/StaffDashboard"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));

// ─── Loading fallback ───
function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4" />
        <p className="text-gray-500">Đang tải...</p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* Public — Customer */}
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout/:orderCode" element={<CheckoutPage />} />
          <Route path="/order-confirmed/:orderCode" element={<OrderConfirmed />} />

          {/* Staff */}
          <Route path="/staff" element={<StaffLogin />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* 404 Fallback */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-500 mb-6">Trang bạn tìm kiếm không tồn tại.</p>
              <a href="/" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Về trang chủ</a>
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
