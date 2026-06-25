import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { BudgetResponseDto, CategoryResponseDto } from "@fincontrol/types";
import { Modal } from "../components/shared/Modal.js";
import { getIconEmoji } from "./CategoriesPage.js";
import * as categoryService from "../services/category.service.js";
import * as budgetService from "../services/budget.service.js";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ProgressBar({ percentage }: { percentage: number }) {
  const clamped = Math.min(percentage, 100);
  const color =
    percentage > 100 ? "bg-red-500" : percentage >= 80 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor planejado para {month}/{year} (R$)
        </label>
        <input
          required
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0,00"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60 transition-colors"
      >
        {loading ? "Salvando..." : "Salvar orçamento"}
      </button>
    </form>
  );
}

export function BudgetsPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<BudgetResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetResponseDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets", month, year],
    queryFn: () => budgetService.getBudgets(month, year),
  });

  const upsertMutation = useMutation({
    mutationFn: ({ categoryId, amount }: { categoryId: string; amount: number }) =>
      budgetService.upsertBudget({ categoryId, amount, month, year }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets", month, year] });
      setShowCreate(false);
      setEditing(null);
      setFormError(null);
    },
    onError: () => setFormError("Erro ao salvar orçamento."),
  });

  const deleteMutation = useMutation({
    mutationFn: budgetService.deleteBudget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets", month, year] });
      setDeleteTarget(null);
    },
    onError: () => alert("Erro ao excluir orçamento."),
  });

  const MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orçamento</h1>
        <button
          onClick={() => {
            setFormError(null);
            setShowCreate(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Definir orçamento
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          ‹
        </button>
        <span className="text-base font-semibold text-gray-800 w-36 text-center">
          {MONTHS[(month - 1) % 12]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          ›
        </button>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Carregando...</p>}
      {!isLoading && budgets.length === 0 && (
        <p className="text-gray-500 text-sm">Nenhum orçamento definido para este mês.</p>
      )}

      <div className="space-y-3">
        {budgets.map((budget) => (
          <div key={budget.id} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getIconEmoji(budget.category.icon)}</span>
                <span className="text-sm font-semibold text-gray-900">{budget.category.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {formatBRL(budget.spent)} / {formatBRL(budget.amount)}
                </span>
                <span
                  className={`text-xs font-bold ${
                    budget.percentage > 100
                      ? "text-red-600"
                      : budget.percentage >= 80
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {budget.percentage.toFixed(0)}%
                </span>
                <button
                  onClick={() => {
                    setFormError(null);
                    setEditing(budget);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeleteTarget(budget)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
            <ProgressBar percentage={budget.percentage} />
          </div>
        ))}
      </div>

      {showCreate && (
        <Modal title="Definir orçamento" onClose={() => setShowCreate(false)}>
          <BudgetForm
            categories={categories}
            month={month}
            year={year}
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
            month={month}
            year={year}
            onSubmit={(categoryId, amount) => upsertMutation.mutate({ categoryId, amount })}
            loading={upsertMutation.isPending}
            error={formError}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Excluir orçamento" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600 mb-4">
            Tem certeza que deseja excluir o orçamento de{" "}
            <strong>&quot;{deleteTarget.category.name}&quot;</strong> para{" "}
            {MONTHS[(month - 1) % 12]}/{year}?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
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
