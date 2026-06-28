import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type {
  AccountResponseDto,
  CategoryResponseDto,
  CreateTransactionRequestDto,
  TransactionResponseDto,
  TransactionType,
} from "@fincontrol/types";
import { EmptyState } from "../components/shared/EmptyState.js";
import { Modal } from "../components/shared/Modal.js";
import { MonthYearPicker } from "../components/shared/MonthYearPicker.js";
import { getIconEmoji } from "./CategoriesPage.js";
import * as accountService from "../services/account.service.js";
import * as categoryService from "../services/category.service.js";
import * as chartsService from "../services/charts.service.js";
import * as transactionService from "../services/transaction.service.js";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

const TYPE_COLORS: Record<TransactionType, string> = {
  INCOME: "text-green-600",
  EXPENSE: "text-red-600",
  TRANSFER: "text-[var(--color-brand)]",
};

const TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
  TRANSFER: "Transferência",
};

interface TransactionFormProps {
  accounts: AccountResponseDto[];
  categories: CategoryResponseDto[];
  onSubmit: (data: CreateTransactionRequestDto) => void;
  loading: boolean;
  error: string | null;
  submitLabel: string;
}

function TransactionForm({
  accounts,
  categories,
  onSubmit,
  loading,
  error,
  submitLabel,
}: TransactionFormProps) {
  const today = new Date().toISOString().split("T")[0] ?? "";
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [recurring, setRecurring] = useState(false);

  const filteredCategories = categories.filter((c) =>
    type === "INCOME" ? c.type === "INCOME" : c.type === "EXPENSE",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      type,
      amount: parseFloat(amount),
      description,
      date,
      accountId,
      toAccountId: type === "TRANSFER" ? toAccountId : undefined,
      categoryId: categoryId || undefined,
      recurring,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Tipo</label>
        <div className="flex gap-2">
          {(["EXPENSE", "INCOME", "TRANSFER"] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                type === t
                  ? t === "INCOME"
                    ? "bg-green-600 text-white border-green-600"
                    : t === "EXPENSE"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Valor (R$)
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
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Data</label>
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Descrição
        </label>
        <input
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          placeholder="Ex: Supermercado, Salário..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          {type === "TRANSFER" ? "Conta de origem" : "Conta"}
        </label>
        <select
          required
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        >
          <option value="">Selecione uma conta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {type === "TRANSFER" && (
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Conta de destino
          </label>
          <select
            required
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          >
            <option value="">Selecione uma conta</option>
            {accounts
              .filter((a) => a.id !== accountId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {type !== "TRANSFER" && (
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Categoria
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          >
            <option value="">Sem categoria</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm text-[var(--text-primary)]">Transação recorrente</span>
      </label>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60 transition-colors"
      >
        {loading ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

function SummaryPieChart({
  title,
  month,
  year,
  type,
}: {
  title: string;
  month: number;
  year: number;
  type: "INCOME" | "EXPENSE";
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["tx-summary", type, month, year],
    queryFn: () => chartsService.getTransactionSummary(month, year, type),
  });

  if (isLoading) return <p className="text-sm text-[var(--text-secondary)] py-4">Carregando...</p>;

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      {!data || data.items.length === 0 ? (
        <EmptyState
          icon={type === "EXPENSE" ? "📉" : "📈"}
          message={`Nenhuma ${type === "EXPENSE" ? "despesa" : "receita"} neste mês`}
        />
      ) : (
        <>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Total: {formatBRL(data.total)}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.items}
                dataKey="amount"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={70}
              >
                {data.items.map((entry) => (
                  <Cell key={entry.categoryId} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatBRL(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {data.items.map((item) => (
              <div key={item.categoryId} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[var(--text-primary)]">{item.categoryName}</span>
                  <span className="text-[var(--text-secondary)]">({item.count}x)</span>
                </div>
                <span className="text-[var(--text-secondary)]">
                  {formatBRL(item.amount)} · {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function TransactionsPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [searchParams, setSearchParams] = useSearchParams();

  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
  const filterAccountId = searchParams.get("accountId") ?? "";
  const filterCategoryId = searchParams.get("categoryId") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");

  const [activeTab, setActiveTab] = useState<"list" | "summary">("list");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TransactionResponseDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  async function handleExportCSV() {
    setExportLoading(true);
    try {
      await transactionService.downloadTransactionsCSV({
        month,
        year,
        accountId: filterAccountId || undefined,
        categoryId: filterCategoryId || undefined,
      });
    } finally {
      setExportLoading(false);
    }
  }

  function updateParams(updates: Record<string, string | undefined>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === "") {
          next.delete(k);
        } else {
          next.set(k, v);
        }
      }
      return next;
    });
  }

  function clearFilters() {
    setSearchParams({
      month: String(now.getMonth() + 1),
      year: String(now.getFullYear()),
    });
  }

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.getAccounts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const { data: txData, isLoading } = useQuery({
    queryKey: ["transactions", { month, year, filterAccountId, filterCategoryId, page }],
    queryFn: () =>
      transactionService.getTransactions({
        month,
        year,
        accountId: filterAccountId || undefined,
        categoryId: filterCategoryId || undefined,
        page,
        limit: 20,
      }),
  });

  const createMutation = useMutation({
    mutationFn: transactionService.createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["tx-summary"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["dashboard-charts"] });
      setShowCreate(false);
      setFormError(null);
    },
    onError: () => setFormError("Erro ao registrar transação."),
  });

  const deleteMutation = useMutation({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["tx-summary"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["dashboard-charts"] });
      setDeleteTarget(null);
    },
    onError: () => alert("Erro ao excluir transação."),
  });

  const transactions = txData?.items ?? [];
  const totalPages = txData?.pages ?? 1;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transações</h1>
        <button
          onClick={() => {
            setFormError(null);
            setShowCreate(true);
          }}
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nova transação
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[var(--bg-secondary)] p-1 rounded-lg w-fit">
        {(["list", "summary"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab === "list" ? "Lista" : "Resumo"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4 mb-5 flex flex-wrap items-center gap-4">
        <MonthYearPicker
          value={{ month, year }}
          onChange={(v) =>
            updateParams({ month: String(v.month), year: String(v.year), page: "1" })
          }
        />
        <select
          value={filterAccountId}
          onChange={(e) => updateParams({ accountId: e.target.value, page: "1" })}
          className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        >
          <option value="">Todas as contas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          value={filterCategoryId}
          onChange={(e) => updateParams({ categoryId: e.target.value, page: "1" })}
          className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={clearFilters}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium underline"
        >
          Limpar filtros
        </button>
        <button
          onClick={handleExportCSV}
          disabled={exportLoading}
          className="ml-auto text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] disabled:opacity-60 transition-colors"
        >
          {exportLoading ? "Exportando..." : "Exportar CSV"}
        </button>
      </div>

      {/* Tab: Lista */}
      {activeTab === "list" && (
        <>
          {isLoading && <p className="text-[var(--text-secondary)] text-sm">Carregando...</p>}
          {!isLoading && transactions.length === 0 && (
            <EmptyState icon="💸" message="Nenhuma transação neste período." />
          )}
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {tx.category && <span className="text-xl">{getIconEmoji(tx.category.icon)}</span>}
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {tx.description}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formatDate(tx.date)} · {tx.account.name}
                      {tx.category && ` · ${tx.category.name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${TYPE_COLORS[tx.type]}`}>
                    {tx.type === "EXPENSE" ? "−" : tx.type === "INCOME" ? "+" : "↔"}{" "}
                    {formatBRL(tx.amount)}
                  </span>
                  <button
                    onClick={() => setDeleteTarget(tx)}
                    className="text-xs text-[var(--danger)] hover:text-red-700 font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => updateParams({ page: String(page - 1) })}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-[var(--text-secondary)]">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {/* Tab: Resumo */}
      {activeTab === "summary" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SummaryPieChart
            title="Despesas por categoria"
            month={month}
            year={year}
            type="EXPENSE"
          />
          <SummaryPieChart title="Receitas por categoria" month={month} year={year} type="INCOME" />
        </div>
      )}

      {showCreate && (
        <Modal title="Nova transação" onClose={() => setShowCreate(false)}>
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSubmit={(dto) => createMutation.mutate(dto)}
            loading={createMutation.isPending}
            error={formError}
            submitLabel="Registrar transação"
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Excluir transação" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Tem certeza que deseja excluir a transação{" "}
            <strong>&quot;{deleteTarget.description}&quot;</strong>?
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
