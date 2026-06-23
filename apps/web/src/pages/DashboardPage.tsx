import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store.js";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">FinControl</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Olá, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-500">
          Bem-vindo de volta, {user?.name}! Sua área financeira está sendo preparada.
        </p>
      </main>
    </div>
  );
}
