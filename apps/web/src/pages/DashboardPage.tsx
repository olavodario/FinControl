import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TransactionResponseDto } from "@fincontrol/types";
import { CurrencyDisplay } from "../components/shared/CurrencyDisplay.js";
import { EmptyState } from "../components/shared/EmptyState.js";
import { MonthYearPicker } from "../components/shared/MonthYearPicker.js";
import { ProgressBar } from "../components/shared/ProgressBar.js";
import { getIconEmoji } from "./CategoriesPage.js";
import * as dashboardService from "../services/dashboard.service.js";
import * as chartsService from "../services/charts.service.js";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

const MONTH_ABBR = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

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
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const navigate = useNavigate();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard", period.month, period.year],
    queryFn: () => dashboardService.getDashboard(period.month, period.year),
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ["dashboard-charts", period.month, period.year],
    queryFn: () => chartsService.getDashboardCharts(period.month, period.year),
  });

  const isLoading = summaryLoading || chartsLoading;

  if (isLoading) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <p className="text-gray-500 text-sm">Carregando...</p>
      </div>
    );
  }

  if (!summary || !charts) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <p className="text-red-500 text-sm">Erro ao carregar dados do dashboard.</p>
      </div>
    );
  }

  const barData = charts.monthlyEvolution.map((e) => ({
    name: MONTH_ABBR[e.month - 1],
    Receitas: e.income,
    Despesas: e.expense,
  }));

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <MonthYearPicker value={period} onChange={setPeriod} />
      </div>

      {/* Section 1 — Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Saldo total"
          value={formatBRL(summary.totalBalance)}
          valueColor="text-blue-700"
        />
        <StatCard
          label="Receitas do mês"
          value={formatBRL(summary.monthIncome)}
          valueColor="text-green-600"
        />
        <StatCard
          label="Despesas do mês"
          value={formatBRL(summary.monthExpense)}
          valueColor="text-red-600"
        />
        <StatCard
          label="Saldo do mês"
          value={formatBRL(summary.monthBalance)}
          valueColor={summary.monthBalance >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Section 2 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie chart — expenses by category */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Gastos por categoria</h2>
          {charts.expenseByCategory.length === 0 ? (
            <EmptyState icon="📊" message="Nenhuma despesa registrada neste mês" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={charts.expenseByCategory}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {charts.expenseByCategory.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatBRL(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1">
                {charts.expenseByCategory.map((entry) => (
                  <div key={entry.categoryId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-gray-700">{entry.categoryName}</span>
                    </div>
                    <span className="text-gray-500">
                      {formatBRL(entry.amount)} · {entry.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar chart — monthly evolution */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Evolução mensal</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(v) => formatBRL(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Receitas" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Despesas" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 3 — Budget alerts + recent transactions + accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget alerts */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Alertas de orçamento</h2>
          {charts.budgetAlerts.length === 0 ? (
            <EmptyState
              icon="📅"
              message="Nenhum orçamento definido para este mês"
              actionLabel="Definir orçamentos"
              onAction={() => navigate("/budgets")}
            />
          ) : (
            <div className="space-y-4">
              {charts.budgetAlerts.map((alert) => (
                <div key={alert.categoryId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: alert.color }}
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {alert.categoryName}
                      </span>
                      {alert.status === "over" && (
                        <span className="text-xs font-bold text-red-600">Acima do limite</span>
                      )}
                      {alert.status === "warning" && (
                        <span className="text-xs font-bold text-yellow-600">Atenção</span>
                      )}
                    </div>
                    <CurrencyDisplay value={alert.spent} className="text-xs text-gray-500" />
                  </div>
                  <ProgressBar percentage={alert.percentage} showLabel />
                  <p className="text-xs text-gray-400 mt-0.5">de {formatBRL(alert.budgeted)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions + accounts */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Últimas transações</h2>
            {summary.recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma transação ainda.</p>
            ) : (
              summary.recentTransactions.map((tx) => <RecentTransaction key={tx.id} tx={tx} />)
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Contas</h2>
            {summary.accounts.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma conta cadastrada.</p>
            ) : (
              <div className="space-y-3">
                {summary.accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.currency}</p>
                    </div>
                    <CurrencyDisplay
                      value={account.balance}
                      colorize
                      className="text-sm font-bold"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
