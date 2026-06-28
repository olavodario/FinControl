import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type {
  CreateGoalRequestDto,
  DepositGoalRequestDto,
  GoalResponseDto,
} from "@fincontrol/types";
import { EmptyState } from "../components/shared/EmptyState.js";
import { Modal } from "../components/shared/Modal.js";
import { ProgressBar } from "../components/shared/ProgressBar.js";
import * as goalService from "../services/goal.service.js";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDeadline(iso: string | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("pt-BR");
}

const ICON_OPTIONS = [
  { value: "target", label: "🎯 Meta" },
  { value: "home", label: "🏠 Casa" },
  { value: "car", label: "🚗 Carro" },
  { value: "travel", label: "✈️ Viagem" },
  { value: "education", label: "📚 Educação" },
  { value: "health", label: "❤️ Saúde" },
  { value: "savings", label: "💰 Poupança" },
  { value: "gift", label: "🎁 Presente" },
];

const COLOR_OPTIONS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

function getIconEmoji(icon: string): string {
  return ICON_OPTIONS.find((o) => o.value === icon)?.label.split(" ")[0] ?? "🎯";
}

interface GoalFormProps {
  onSubmit: (dto: CreateGoalRequestDto) => void;
  loading: boolean;
  error: string | null;
}

function GoalForm({ onSubmit, loading, error }: GoalFormProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [icon, setIcon] = useState("target");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline || undefined,
      color,
      icon,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da meta</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Reserva de emergência"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor alvo (R$)</label>
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="0,00"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (opcional)</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
        <select
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ICON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                color === c ? "border-gray-900 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60 transition-colors"
      >
        {loading ? "Salvando..." : "Criar meta"}
      </button>
    </form>
  );
}

interface DepositFormProps {
  goal: GoalResponseDto;
  onSubmit: (dto: DepositGoalRequestDto) => void;
  loading: boolean;
  error: string | null;
}

function DepositForm({ goal, onSubmit, loading, error }: DepositFormProps) {
  const [amount, setAmount] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ amount: parseFloat(amount) });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
        <p>
          Progresso atual:{" "}
          <strong>
            {formatBRL(goal.currentAmount)} / {formatBRL(goal.targetAmount)}
          </strong>
        </p>
        <p>
          Faltam: <strong className="text-blue-600">{formatBRL(goal.remaining)}</strong>
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor do depósito (R$)
        </label>
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60 transition-colors"
      >
        {loading ? "Depositando..." : "Confirmar depósito"}
      </button>
    </form>
  );
}

interface GoalCardProps {
  goal: GoalResponseDto;
  onDeposit: (goal: GoalResponseDto) => void;
  onDelete: (goal: GoalResponseDto) => void;
}

function GoalCard({ goal, onDeposit, onDelete }: GoalCardProps) {
  const isCompleted = goal.status === "COMPLETED";
  const deadline = formatDeadline(goal.deadline);

  return (
    <div
      className={`bg-white rounded-xl border px-5 py-4 ${
        isCompleted ? "border-green-200 bg-green-50/30" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: goal.color + "20", color: goal.color }}
          >
            {getIconEmoji(goal.icon)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{goal.name}</p>
              {isCompleted && (
                <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                  Concluída
                </span>
              )}
            </div>
            {deadline && <p className="text-xs text-gray-500 mt-0.5">Prazo: {deadline}</p>}
          </div>
        </div>
        <button
          onClick={() => onDelete(goal)}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Excluir
        </button>
      </div>

      <ProgressBar
        percentage={goal.percentage}
        color={isCompleted ? "#10B981" : goal.color}
        className="mb-2"
      />

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {formatBRL(goal.currentAmount)} de {formatBRL(goal.targetAmount)}
        </span>
        <span className="font-medium" style={{ color: isCompleted ? "#10B981" : goal.color }}>
          {goal.percentage}%
        </span>
      </div>

      {!isCompleted && (
        <button
          onClick={() => onDeposit(goal)}
          className="mt-3 w-full text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
          style={{
            borderColor: goal.color,
            color: goal.color,
            backgroundColor: goal.color + "10",
          }}
        >
          Depositar
        </button>
      )}
    </div>
  );
}

export function GoalsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [depositTarget, setDepositTarget] = useState<GoalResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GoalResponseDto | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => goalService.getGoals(),
  });

  const createMutation = useMutation({
    mutationFn: goalService.createGoal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      setShowCreate(false);
      setCreateError(null);
    },
    onError: () => setCreateError("Erro ao criar meta."),
  });

  const depositMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: DepositGoalRequestDto }) =>
      goalService.depositToGoal(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      setDepositTarget(null);
      setDepositError(null);
    },
    onError: () => setDepositError("Erro ao realizar depósito."),
  });

  const deleteMutation = useMutation({
    mutationFn: goalService.deleteGoal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      setDeleteTarget(null);
    },
    onError: () => alert("Erro ao excluir meta."),
  });

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const cancelledGoals = goals.filter((g) => g.status === "CANCELLED");

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Metas</h1>
        <button
          onClick={() => {
            setCreateError(null);
            setShowCreate(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nova meta
        </button>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Carregando...</p>}

      {!isLoading && goals.length === 0 && (
        <EmptyState icon="🎯" message="Nenhuma meta criada ainda. Que tal começar?" />
      )}

      {activeGoals.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Em andamento
          </h2>
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDeposit={(g) => {
                  setDepositError(null);
                  setDepositTarget(g);
                }}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        </section>
      )}

      {completedGoals.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Concluídas
          </h2>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onDeposit={() => {}} onDelete={setDeleteTarget} />
            ))}
          </div>
        </section>
      )}

      {cancelledGoals.length > 0 && (
        <section>
          <button
            onClick={() => setShowCancelled((v) => !v)}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium mb-3 flex items-center gap-1"
          >
            {showCancelled ? "▲" : "▼"} Metas canceladas ({cancelledGoals.length})
          </button>
          {showCancelled && (
            <div className="space-y-3 opacity-60">
              {cancelledGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDeposit={() => {}}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {showCreate && (
        <Modal title="Nova meta" onClose={() => setShowCreate(false)}>
          <GoalForm
            onSubmit={(dto) => createMutation.mutate(dto)}
            loading={createMutation.isPending}
            error={createError}
          />
        </Modal>
      )}

      {depositTarget && (
        <Modal title={`Depositar — ${depositTarget.name}`} onClose={() => setDepositTarget(null)}>
          <DepositForm
            goal={depositTarget}
            onSubmit={(dto) => depositMutation.mutate({ id: depositTarget.id, dto })}
            loading={depositMutation.isPending}
            error={depositError}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Excluir meta" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Tem certeza que deseja excluir a meta{" "}
              <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>? Esta ação não pode ser desfeita.
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
          </div>
        </Modal>
      )}
    </div>
  );
}
