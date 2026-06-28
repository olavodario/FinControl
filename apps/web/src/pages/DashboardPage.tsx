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
        : "text-[var(--color-brand)]";

  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-lg">{tx.category ? getIconEmoji(tx.category.icon) : "💸"}</span>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{tx.description}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {formatDate(tx.date)} &middot; {tx.account.name}
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
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4">
      <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${valueColor ?? "text-[var(--text-primary)]"}`}>{value}</p>
    </div>
  );
}

async function exportDashboardPDF(
  summary: Awaited<ReturnType<typeof dashboardService.getDashboard>>,
  charts: Awaited<ReturnType<typeof chartsService.getDashboardCharts>>,
  projection: Awaited<ReturnType<typeof dashboardService.getProjection>>,
  period: { month: number; year: number },
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const monthName = MONTH_ABBR[period.month - 1] ?? String(period.month);
  const title = `FinControl - Relatorio ${monthName}/${period.year}`;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 27);
  doc.setTextColor(0);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo do mes", 14, 38);

  autoTable(doc, {
    startY: 42,
    head: [["Saldo total", "Receitas", "Despesas", "Saldo do mes"]],
    body: [
      [
        formatBRL(summary.totalBalance),
        formatBRL(summary.monthIncome),
        formatBRL(summary.monthExpense),
        formatBRL(summary.monthBalance),
      ],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 163, 74] },
  });

  if (charts.budgetAlerts.length > 0) {
    const afterSummary = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Alertas de orcamento", 14, afterSummary + 10);

    autoTable(doc, {
      startY: afterSummary + 14,
      head: [["Categoria", "Orcado", "Gasto", "%", "Status"]],
      body: charts.budgetAlerts.map((a) => [
        a.categoryName,
        formatBRL(a.budgeted),
        formatBRL(a.spent),
        `${a.percentage}%`,
        a.status === "over" ? "Acima do limite" : a.status === "warning" ? "Atencao" : "OK",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 163, 74] },
    });
  }

  const afterBudget = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Projecao - proximos 3 meses", 14, afterBudget + 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Media (ultimos 3 meses): Receita ${formatBRL(projection.averageIncome)} / Despesa ${formatBRL(projection.averageExpense)}`,
    14,
    afterBudget + 17,
  );

  autoTable(doc, {
    startY: afterBudget + 21,
    head: [["Mes", "Receita prevista", "Despesa prevista", "Saldo previsto"]],
    body: projection.projection.map((p) => [
      `${MONTH_ABBR[p.month - 1] ?? p.month}/${p.year}`,
      formatBRL(p.projectedIncome),
      formatBRL(p.projectedExpense),
      formatBRL(p.projectedBalance),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 163, 74] },
  });

  doc.save(`fincontrol-${monthName.toLowerCase()}-${period.year}.pdf`);
}

export function DashboardPage() {
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard", period.month, period.year],
    queryFn: () => dashboardService.getDashboard(period.month, period.year),
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ["dashboard-charts", period.month, period.year],
    queryFn: () => chartsService.getDashboardCharts(period.month, period.year),
  });

  const { data: projection, isLoading: projectionLoading } = useQuery({
    queryKey: ["dashboard-projection"],
    queryFn: () => dashboardService.getProjection(3),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = summaryLoading || chartsLoading;

  async function handleExportPDF() {
    if (!summary || !charts || !projection) return;
    setExporting(true);
    try {
      await exportDashboardPDF(summary, charts, projection, period);
    } finally {
      setExporting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-6 md:py-8 max-w-5xl mx-auto">
        <p className="text-[var(--text-secondary)] text-sm">Carregando...</p>
      </div>
    );
  }

  if (!summary || !charts) {
    return (
      <div className="px-4 py-6 md:px-6 md:py-8 max-w-5xl mx-auto">
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
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <div className="flex items-center gap-3">
          <MonthYearPicker value={period} onChange={setPeriod} />
          <button
            onClick={() => void handleExportPDF()}
            disabled={exporting || !projection}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting ? "Gerando..." : "📄 Exportar PDF"}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Saldo total"
          value={formatBRL(summary.totalBalance)}
          valueColor="text-[var(--color-brand)]"
        />
        <StatCard
          label="Receitas do mes"
          value={formatBRL(summary.monthIncome)}
          valueColor="text-green-600"
        />
        <StatCard
          label="Despesas do mes"
          value={formatBRL(summary.monthExpense)}
          valueColor="text-red-600"
        />
        <StatCard
          label="Saldo do mes"
          value={formatBRL(summary.monthBalance)}
          valueColor={summary.monthBalance >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
            Gastos por categoria
          </h2>
          {charts.expenseByCategory.length === 0 ? (
            <EmptyState icon="📊" message="Nenhuma despesa registrada neste mes" />
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
                      <span className="text-[var(--text-secondary)]">{entry.categoryName}</span>
                    </div>
                    <span className="text-[var(--text-secondary)]">
                      {formatBRL(entry.amount)} &middot; {entry.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
            Evolucao mensal
          </h2>
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

      {/* Projection */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4 mb-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-1">
          Projecao financeira
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Baseada na media dos ultimos 3 meses
        </p>
        {projectionLoading || !projection ? (
          <p className="text-sm text-[var(--text-secondary)]">Calculando projecao...</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Receita media</p>
                <p className="text-base font-bold text-green-600">
                  {formatBRL(projection.averageIncome)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Despesa media</p>
                <p className="text-base font-bold text-red-600">
                  {formatBRL(projection.averageExpense)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Saldo medio</p>
                <p
                  className={`text-base font-bold ${projection.averageBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatBRL(projection.averageBalance)}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left text-xs font-medium text-[var(--text-secondary)] pb-2">
                      Mes
                    </th>
                    <th className="text-right text-xs font-medium text-[var(--text-secondary)] pb-2">
                      Receita prevista
                    </th>
                    <th className="text-right text-xs font-medium text-[var(--text-secondary)] pb-2">
                      Despesa prevista
                    </th>
                    <th className="text-right text-xs font-medium text-[var(--text-secondary)] pb-2">
                      Saldo previsto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projection.projection.map((p) => (
                    <tr key={`${p.month}-${p.year}`} className="border-b border-[var(--border)]">
                      <td className="py-2 font-medium text-[var(--text-primary)]">
                        {MONTH_ABBR[p.month - 1]}/{p.year}
                      </td>
                      <td className="py-2 text-right text-green-600">
                        {formatBRL(p.projectedIncome)}
                      </td>
                      <td className="py-2 text-right text-red-600">
                        {formatBRL(p.projectedExpense)}
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${p.projectedBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatBRL(p.projectedBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Budget alerts + recent transactions + accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
            Alertas de orcamento
          </h2>
          {charts.budgetAlerts.length === 0 ? (
            <EmptyState
              icon="📅"
              message="Nenhum orcamento definido para este mes"
              actionLabel="Definir orcamentos"
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
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {alert.categoryName}
                      </span>
                      {alert.status === "over" && (
                        <span className="text-xs font-bold text-red-600">Acima do limite</span>
                      )}
                      {alert.status === "warning" && (
                        <span className="text-xs font-bold text-yellow-600">Atencao</span>
                      )}
                    </div>
                    <CurrencyDisplay
                      value={alert.spent}
                      className="text-xs text-[var(--text-secondary)]"
                    />
                  </div>
                  <ProgressBar percentage={alert.percentage} showLabel />
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    de {formatBRL(alert.budgeted)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
              Ultimas transacoes
            </h2>
            {summary.recentTransactions.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Nenhuma transacao ainda.</p>
            ) : (
              summary.recentTransactions.map((tx) => <RecentTransaction key={tx.id} tx={tx} />)
            )}
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Contas</h2>
            {summary.accounts.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Nenhuma conta cadastrada.</p>
            ) : (
              <div className="space-y-3">
                {summary.accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {account.name}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">{account.currency}</p>
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
