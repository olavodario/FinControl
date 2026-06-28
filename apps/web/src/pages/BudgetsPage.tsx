import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { BudgetResponseDto, CategoryResponseDto } from "@fincontrol/types";
import { EmptyState } from "../components/shared/EmptyState.js";
import { Modal } from "../components/shared/Modal.js";
import { MonthYearPicker } from "../components/shared/MonthYearPicker.js";
import { ProgressBar } from "../components/shared/ProgressBar.js";
import { getIconEmoji } from "./CategoriesPage.js";
import * as categoryService from "../services/category.service.js";
import * as budgetService from "../services/budget.service.js";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface BudgetFormProps {
  categories: CategoryResponseDto[];
  existing?: BudgetResponseDto;
  month: number;
  year: number;
  onSubmit: (categoryId: string, amount: number) => void;
  loading: boolean;
  error: string | null;
}

function BudgetForm({
  categories,
  existing,
  month,
  year,
  onSubmit,
  loading,
  error,
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(categoryId, parseFloat(amount));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!existing && (
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Categoria
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          >
            <option value="">Selecione uma categoria</option>
            {categories
              .filter((c) => c.type === "EXPENSE")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Valor planejado para {month}/{year} (R$)
        </label>
        <input
          required
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          placeholder="0,00"
        />
      </div>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60 transition-colors"
      >
        {loading ? "Salvando..." : "Salvar orçamento"}
      </button>
    </form>
  );
}

function DonutCenter({ percentage }: { percentage: number }) {
  const color =
    percentage > 100 ? "text-red-600" : percentage >= 80 ? "text-yellow-600" : "text-green-600";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className={`text-xl font-bold ${color}`}>{percentage.toFixed(0)}%</span>
      <span className="text-xs text-[var(--text-secondary)]">gasto</span>
    </div>
  );
}

export function BudgetsPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<BudgetResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetResponseDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets", period.month, period.year],
    queryFn: () => budgetService.getBudgets(period.month, period.year),
  });

  const sortedBudgets = [...budgets].sort((a, b) => b.percentage - a.percentage);

  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const remaining = Math.max(totalBudgeted - totalSpent, 0);

  const donutData =
    totalBudgeted > 0
      ? [
          { name: "Gasto", value: Math.min(totalSpent, totalBudgeted), fill: "#ef4444" },
          { name: "Disponível", value: remaining, fill: "#22c55e" },
        ]
      : [{ name: "Sem orçamento", value: 1, fill: "#e5e7eb" }];

  const upsertMutation = useMutation({
    mutationFn: ({ categoryId, amount }: { categoryId: string; amount: number }) =>
      budgetService.upsertBudget({ categoryId, amount, month: period.month, year: period.year }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets", period.month, period.year] });
      qc.invalidateQueries({ queryKey: ["dashboard-charts"] });
      setShowCreate(false);
      setEditing(null);
      setFormError(null);
    },
    onError: () => setFormError("Erro ao salvar orçamento."),
  });

  const deleteMutation = useMutation({
    mutationFn: budgetService.deleteBudget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets", period.month, period.year] });
      qc.invalidateQueries({ queryKey: ["dashboard-charts"] });
      setDeleteTarget(null);
    },
    onError: () => alert("Erro ao excluir orçamento."),
  });

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Orçamento</h1>
        <button
          onClick={() => {
            setFormError(null);
            setShowCreate(true);
          }}
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Definir orçamento
        </button>
      </div>

      {/* Month selector */}
      <div className="mb-6">
        <MonthYearPicker value={period} onChange={setPeriod} />
      </div>

      {/* Donut chart summary */}
      {budgets.length > 0 && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4 mb-6 flex items-center gap-8">
          <div className="relative w-36 h-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={66}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <DonutCenter percentage={overallPercentage} />
          </div>
          <div className="space-y-1.5 text-sm">
            <p className="text-[var(--text-secondary)]">
              Total planejado:{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {formatBRL(totalBudgeted)}
              </span>
            </p>
            <p className="text-[var(--text-secondary)]">
              Total gasto:{" "}
              <span className="font-semibold text-red-600">{formatBRL(totalSpent)}</span>
            </p>
            <p className="text-[var(--text-secondary)]">
              Disponível:{" "}
              <span className="font-semibold text-green-600">{formatBRL(remaining)}</span>
            </p>
          </div>
        </div>
      )}

      {isLoading && <p className="text-[var(--text-secondary)] text-sm">Carregando...</p>}
      {!isLoading && budgets.length === 0 && (
        <EmptyState icon="📅" message="Nenhum orçamento definido para este mês." />
      )}

      <div className="space-y-3">
        {sortedBudgets.map((budget) => {
          const isOver = budget.percentage > 100;
          const remaining = Math.max(Number(budget.amount) - budget.spent, 0);
          return (
            <div
              key={budget.id}
              className={`bg-[var(--bg-card)] rounded-xl border px-5 py-4 ${
                isOver ? "border-red-300" : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getIconEmoji(budget.category.icon)}</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {budget.category.name}
                  </span>
                  {isOver && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      Acima do limite
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setFormError(null);
                      setEditing(budget);
                    }}
                    className="text-xs text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteTarget(budget)}
                    className="text-xs text-[var(--danger)] hover:text-red-700 font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <ProgressBar percentage={budget.percentage} showLabel />
              <div className="flex justify-between mt-1 text-xs text-[var(--text-secondary)]">
                <span>
                  {formatBRL(budget.spent)} de {formatBRL(Number(budget.amount))}
                </span>
                <span className={isOver ? "text-red-600 font-medium" : ""}>
                  {isOver
                    ? `R$ ${(budget.spent - Number(budget.amount)).toFixed(2)} acima`
                    : `${formatBRL(remaining)} restante`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <Modal title="Definir orçamento" onClose={() => setShowCreate(false)}>
          <BudgetForm
            categories={categories}
            month={period.month}
            year={period.year}
            onSubmit={(categoryId, amount) => upsertMutation.mutate({ categoryId, amount })}
            loading={upsertMutation.isPending}
            error={formError}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar orçamento" onClose={() => setEditing(null)}>
          <BudgetForm
            categories={categories}
            existing={editing}
            month={period.month}
            year={period.year}
            onSubmit={(categoryId, amount) => upsertMutation.mutate({ categoryId, amount })}
            loading={upsertMutation.isPending}
            error={formError}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Excluir orçamento" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Tem certeza que deseja excluir o orçamento de{" "}
            <strong>&quot;{deleteTarget.category.name}&quot;</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium py-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-60 transition-colors"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
