import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] px-4">
      <p className="text-7xl mb-4">💸</p>
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">404</h1>
      <p className="text-[var(--text-secondary)] mb-6">Página não encontrada</p>
      <Link
        to="/dashboard"
        className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
      >
        Voltar ao dashboard
      </Link>
    </div>
  );
}
