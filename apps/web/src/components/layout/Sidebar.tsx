import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/transactions", label: "Transações", icon: "💸" },
  { to: "/accounts", label: "Contas", icon: "🏦" },
  { to: "/categories", label: "Categorias", icon: "🏷️" },
  { to: "/budgets", label: "Orçamento", icon: "📅" },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-blue-600">FinControl</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-700 truncate mb-2">{user?.name}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-red-600 hover:text-red-700 font-medium"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
