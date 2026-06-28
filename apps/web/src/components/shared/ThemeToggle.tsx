import { useThemeStore } from "../../stores/theme.store.js";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      title={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-base transition-colors hover:bg-[var(--bg-secondary)]"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
