import { useQuery } from "@tanstack/react-query";
import type { TransactionResponseDto } from "@fincontrol/types";
import { getIconEmoji } from "./CategoriesPage.js";
import * as dashboardService from "../services/dashboard.service.js";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function RecentTransaction({ tx }: { tx: TransactionResponseDto }) {
  const sign = tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "−" : "↔";
  const color =
    tx.type === "INCOME"
      ? "text-green-600"
      : tx.type === "EXPENSE"
        ? "text-red-600"
        : "text-blue-600";

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-lg">{tx.category ? getIconEmoji(tx.category.icon) : "💸"}</span>
        <div>
          <p className="text-sm font-medium text-gray-900">{tx.description}</p>
          <p className="text-xs text-gray-500">
            {formatDate(tx.date)} · {tx.account.name}
          </p>
        </div>
      </div>
      <span className={`text-sm font-bold ${color}`}>
        {sign} {formatBRL(tx.amount)}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColor ?? "text-gray-900"}`}>{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <p className="text-gray-500 text-sm">Carregando...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <p className="text-red-500 text-sm">Erro ao carregar dados do dashboard.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Saldo total"
          value={formatBRL(data.totalBalance)}
          valueColor="text-blue-700"
        />
        <StatCard
          label="Receitas do mês"
          value={formatBRL(data.monthIncome)}
          valueColor="text-green-600"
        />
        <StatCard
          label="Despesas do mês"
          value={formatBRL(data.monthExpense)}
          valueColor="text-red-600"
        />
        <StatCard
          label="Saldo do mês"
          value={formatBRL(data.monthBalance)}
          valueColor={data.monthBalance >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Últimas transações</h2>
          {data.recentTransactions.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma transação ainda.</p>
          ) : (
            data.recentTransactions.map((tx) => <RecentTransaction key={tx.id} tx={tx} />)
          )}
        </div>

        {/* Accounts list */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Contas</h2>
          {data.accounts.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma conta cadastrada.</p>
          ) : (
            <div className="space-y-3">
              {data.accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{account.name}</p>
                    <p className="text-xs text-gray-500">{account.currency}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatBRL(account.balance)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
