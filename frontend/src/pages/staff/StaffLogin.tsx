import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStaffStore } from "@/stores/useStaffStore";

export default function StaffLogin() {
  const navigate = useNavigate();
  const { login, error, lockedUntil, isAuthenticated } = useStaffStore();
  const [staffCode, setStaffCode] = useState("");
  const [pin, setPin] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/staff/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const ok = await login(staffCode, pin);
    setIsLoggingIn(false);
    if (ok) navigate("/staff/dashboard", { replace: true });
  };

  // Tránh việc nhấp nháy giao diện form login trước khi redirect
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nhân viên đăng nhập</h1>
          <p className="text-sm text-gray-600 mt-1">Tiệm Cafe Góc Nhỏ</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Mã nhân viên</label>
            <input
              type="text"
              value={staffCode}
              onChange={(e) => setStaffCode(e.target.value.toUpperCase())}
              placeholder="VD: NV01"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">PIN (6 chữ số)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              maxLength={6}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base tracking-[0.5em] font-mono text-center focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={Date.now() < lockedUntil || isLoggingIn}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors shadow-md"
          >
            {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-amber-600 hover:text-amber-700">← Về menu</Link>
        </div>
      </div>
    </div>
  );
}
