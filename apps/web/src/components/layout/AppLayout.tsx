import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useThemeStore } from "../../stores/theme.store.js";
import { Sidebar } from "./Sidebar.js";

export function AppLayout() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
