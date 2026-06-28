import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useThemeStore } from "../../stores/theme.store.js";
import { Sidebar } from "./Sidebar.js";

export function AppLayout() {
  const theme = useThemeStore((s) => s.theme);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header with hamburger */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border)] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Abrir menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="2" rx="1" />
              <rect y="9" width="20" height="2" rx="1" />
              <rect y="15" width="20" height="2" rx="1" />
            </svg>
          </button>
          <span className="text-base font-bold text-[var(--color-brand)]">FinControl</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
