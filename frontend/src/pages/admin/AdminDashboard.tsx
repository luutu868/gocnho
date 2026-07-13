import { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "categories", label: "Danh mục", icon: "📂" },
  { id: "products", label: "Món", icon: "🍽️" },
  { id: "toppings", label: "Topping", icon: "🧃" },
  { id: "staff", label: "Nhân viên", icon: "👥" },
  { id: "tables", label: "Bàn & QR", icon: "🪑" },
  { id: "orders", label: "Đơn hàng", icon: "📦" },
  { id: "settings", label: "Cấu hình", icon: "⚙️" },
];

// Placeholder component for admin sections
function PlaceholderSection({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">Tính năng này sẽ được implement trong User Story QLY-01</p>
    </div>
  );
}

function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Đơn hàng hôm nay", value: "—", color: "text-blue-600" },
          { label: "Doanh thu", value: "—", color: "text-green-600" },
          { label: "Món trong menu", value: "22", color: "text-amber-600" },
          { label: "Nhân viên active", value: "—", color: "text-purple-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <PlaceholderSection title="Dashboard" icon="📊" />
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const currentSection = location.pathname.split("/")[2] || "dashboard";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-bold text-gray-900">Tiệm Cafe</h2>
            <p className="text-xs text-gray-500">Trang quản trị</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              to={item.id === "dashboard" ? "/admin" : `/admin/${item.id}`}
              onClick={() => setSidebarOpen(false)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-3 ${
                currentSection === item.id ? "bg-amber-50 text-amber-900 border border-amber-200" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <button onClick={() => { logout(); navigate("/admin"); }} className="w-full text-left px-4 py-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{sidebarItems.find((i) => i.id === currentSection)?.label || "Dashboard"}</h1>
            </div>
            <Link to="/" className="text-sm text-amber-600 hover:text-amber-700 font-medium px-3 py-2">Về Menu</Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="categories" element={<PlaceholderSection title="Danh mục" icon="📂" />} />
            <Route path="products" element={<PlaceholderSection title="Món" icon="🍽️" />} />
            <Route path="toppings" element={<PlaceholderSection title="Topping" icon="🧃" />} />
            <Route path="staff" element={<PlaceholderSection title="Nhân viên" icon="👥" />} />
            <Route path="tables" element={<PlaceholderSection title="Bàn & QR" icon="🪑" />} />
            <Route path="orders" element={<PlaceholderSection title="Đơn hàng" icon="📦" />} />
            <Route path="settings" element={<PlaceholderSection title="Cấu hình" icon="⚙️" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
