import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type {
  AccountResponseDto,
  CategoryResponseDto,
  CreateTransactionRequestDto,
  TransactionResponseDto,
  TransactionType,
} from "@fincontrol/types";
import { Modal } from "../components/shared/Modal.js";
import { getIconEmoji } from "./CategoriesPage.js";
import * as accountService from "../services/account.service.js";
import * as categoryService from "../services/category.service.js";
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
  TRANSFER: "text-blue-600",
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
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
                      : "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
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
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <input
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Supermercado, Salário..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {type === "TRANSFER" ? "Conta de origem" : "Conta"}
        </label>
        <select
          required
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Conta de destino</label>
          <select
            required
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <span className="text-sm text-gray-700">Transação recorrente</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60 transition-colors"
      >
        {loading ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

export function TransactionsPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filterAccountId, setFilterAccountId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TransactionResponseDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setShowCreate(false);
      setFormError(null);
    },
    onError: () => setFormError("Erro ao registrar transação."),
  });

  const deleteMutation = useMutation({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteTarget(null);
    },
    onError: () => alert("Erro ao excluir transação."),
  });

  const transactions = txData?.items ?? [];
  const totalPages = txData?.pages ?? 1;

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

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
        <button
          onClick={() => {
            setFormError(null);
            setShowCreate(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nova transação
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 mb-5 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => {
              setMonth(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setPage(1);
            }}
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterAccountId}
          onChange={(e) => {
            setFilterAccountId(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          onChange={(e) => {
            setFilterCategoryId(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Carregando...</p>}

      {!isLoading && transactions.length === 0 && (
        <p className="text-gray-500 text-sm">Nenhuma transação neste período.</p>
      )}

      <div className="space-y-2">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {tx.category && <span className="text-xl">{getIconEmoji(tx.category.icon)}</span>}
              <div>
                <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                <p className="text-xs text-gray-500">
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
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Próxima
          </button>
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
          <p className="text-sm text-gray-600 mb-4">
            Tem certeza que deseja excluir a transação{" "}
            <strong>&quot;{deleteTarget.description}&quot;</strong>?
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
