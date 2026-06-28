import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js";
import { ThemeToggle } from "../shared/ThemeToggle.js";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/transactions", label: "Transações", icon: "💸" },
  { to: "/accounts", label: "Contas", icon: "🏦" },
  { to: "/categories", label: "Categorias", icon: "🏷️" },
  { to: "/budgets", label: "Orçamento", icon: "📅" },
  { to: "/goals", label: "Metas", icon: "🎯" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleNavClick() {
    onClose?.();
  }

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-56 bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col
        transition-transform duration-200
        md:static md:translate-x-0 md:shrink-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="px-5 py-5 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-lg font-bold text-[var(--color-brand)]">FinControl</span>
        <ThemeToggle />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-brand)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--border)]">
        <p className="text-xs font-medium text-[var(--text-primary)] truncate mb-2">{user?.name}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-[var(--danger)] hover:opacity-80 font-medium transition-opacity"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
