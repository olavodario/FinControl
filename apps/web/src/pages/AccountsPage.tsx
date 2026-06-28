import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { AccountResponseDto, AccountType, CreateAccountRequestDto } from "@fincontrol/types";
import { Modal } from "../components/shared/Modal.js";
import * as accountService from "../services/account.service.js";
import toast from "react-hot-toast";

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: "Conta Corrente",
  SAVINGS: "Poupança",
  CREDIT: "Cartão de Crédito",
  INVESTMENT: "Investimento",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface AccountFormProps {
  initial?: Partial<AccountResponseDto>;
  onSubmit: (data: CreateAccountRequestDto) => void;
  loading: boolean;
  error: string | null;
  submitLabel: string;
}

function AccountForm({ initial, onSubmit, loading, error, submitLabel }: AccountFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<AccountType>(initial?.type ?? "CHECKING");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, type });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          placeholder="Ex: Nubank, Bradesco..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        >
          {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((t) => (
            <option key={t} value={t}>
              {ACCOUNT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
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

export function AccountsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AccountResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccountResponseDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.getAccounts,
  });

  const createMutation = useMutation({
    mutationFn: accountService.createAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      setShowCreate(false);
      setFormError(null);
    },
    onError: () => setFormError("Erro ao criar conta."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CreateAccountRequestDto }) =>
      accountService.updateAccount(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      setEditing(null);
      setFormError(null);
    },
    onError: () => setFormError("Erro ao atualizar conta."),
  });

  const deleteMutation = useMutation({
    mutationFn: accountService.deleteAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      setDeleteTarget(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { code?: string } } })?.response?.data?.code ===
        "ACCOUNT_HAS_TRANSACTIONS"
          ? "Não é possível excluir uma conta com transações."
          : "Erro ao excluir conta.";
      toast.error(msg);
    },
  });

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Contas</h1>
        <button
          onClick={() => {
            setFormError(null);
            setShowCreate(true);
          }}
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nova conta
        </button>
      </div>

      {isLoading && <p className="text-[var(--text-secondary)] text-sm">Carregando...</p>}

      {!isLoading && accounts.length === 0 && (
        <p className="text-[var(--text-secondary)] text-sm">Nenhuma conta cadastrada.</p>
      )}

      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{account.name}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {ACCOUNT_TYPE_LABELS[account.type]} · {account.currency}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-lg font-bold ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatBRL(account.balance)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormError(null);
                    setEditing(account);
                  }}
                  className="text-xs text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeleteTarget(account)}
                  className="text-xs text-[var(--danger)] hover:text-red-700 font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <Modal title="Nova conta" onClose={() => setShowCreate(false)}>
          <AccountForm
            onSubmit={(dto) => createMutation.mutate(dto)}
            loading={createMutation.isPending}
            error={formError}
            submitLabel="Criar conta"
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar conta" onClose={() => setEditing(null)}>
          <AccountForm
            initial={editing}
            onSubmit={(dto) => updateMutation.mutate({ id: editing.id, dto })}
            loading={updateMutation.isPending}
            error={formError}
            submitLabel="Salvar alterações"
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Excluir conta" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Tem certeza que deseja excluir a conta <strong>&quot;{deleteTarget.name}&quot;</strong>?
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
