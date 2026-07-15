import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, error, isAuthenticated, mustChangePassword } = useAuthStore();

  // Use uncontrolled refs so browser automation (key events) work correctly
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(mustChangePassword ? "/admin/change-password" : "/admin/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, mustChangePassword, navigate]);

  const handleLogin = () => {
    const username = usernameRef.current?.value ?? "";
    const password = passwordRef.current?.value ?? "";
    login(username, password);
  };

  // Tránh việc nhấp nháy giao diện form login trước khi redirect
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Quản trị viên</h1>
          <p className="text-sm text-gray-600 mt-1">Tiệm Cafe Góc Nhỏ</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Tên đăng nhập</label>
            <input
              id="admin-username"
              type="text"
              ref={usernameRef}
              defaultValue=""
              placeholder="admin"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Mật khẩu</label>
            <input
              id="admin-password"
              type="password"
              ref={passwordRef}
              defaultValue=""
              placeholder="••••••••"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <button
            id="admin-login-btn"
            onClick={handleLogin}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-md"
          >
            Đăng nhập
          </button>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-amber-600 hover:text-amber-700">← Về menu</Link>
        </div>
      </div>
    </div>
  );
}
