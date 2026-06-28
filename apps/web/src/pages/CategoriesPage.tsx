import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type {
  CategoryResponseDto,
  CategoryType,
  CreateCategoryRequestDto,
} from "@fincontrol/types";
import { Modal } from "../components/shared/Modal.js";
import * as categoryService from "../services/category.service.js";

const PRESET_ICONS = [
  { name: "food", label: "Alimentação", emoji: "🍕" },
  { name: "car", label: "Transporte", emoji: "🚗" },
  { name: "home", label: "Moradia", emoji: "🏠" },
  { name: "health", label: "Saúde", emoji: "❤️" },
  { name: "entertainment", label: "Lazer", emoji: "🎮" },
  { name: "education", label: "Educação", emoji: "📚" },
  { name: "salary", label: "Salário", emoji: "💼" },
  { name: "freelance", label: "Freelance", emoji: "💻" },
  { name: "investment", label: "Investimentos", emoji: "📈" },
  { name: "shopping", label: "Compras", emoji: "🛒" },
  { name: "travel", label: "Viagem", emoji: "✈️" },
  { name: "other", label: "Outros", emoji: "📦" },
];

export function getIconEmoji(name: string) {
  return PRESET_ICONS.find((i) => i.name === name)?.emoji ?? "📦";
}

interface CategoryFormProps {
  initial?: Partial<CategoryResponseDto>;
  onSubmit: (data: CreateCategoryRequestDto) => void;
  loading: boolean;
  error: string | null;
  submitLabel: string;
}

function CategoryForm({ initial, onSubmit, loading, error, submitLabel }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? "#3B82F6");
  const [icon, setIcon] = useState(initial?.icon ?? "other");
  const [type, setType] = useState<CategoryType>(initial?.type ?? "EXPENSE");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, color, icon, type });
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
          placeholder="Nome da categoria"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          >
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Cor</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-16 rounded-lg border border-[var(--border)] cursor-pointer p-0.5"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Ícone</label>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_ICONS.map((ic) => (
            <button
              key={ic.name}
              type="button"
              title={ic.label}
              onClick={() => setIcon(ic.name)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-lg transition-colors ${
                icon === ic.name
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10"
                  : "border-[var(--border)] hover:border-[var(--border)]"
              }`}
            >
              {ic.emoji}
            </button>
          ))}
        </div>
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

export function CategoriesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<CategoryResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponseDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setShowCreate(false);
      setFormError(null);
    },
    onError: () => setFormError("Erro ao criar categoria."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateCategoryRequestDto> }) =>
      categoryService.updateCategory(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setEditing(null);
      setFormError(null);
    },
    onError: () => setFormError("Erro ao atualizar categoria."),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setDeleteTarget(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { code?: string } } })?.response?.data?.code ===
        "CATEGORY_HAS_TRANSACTIONS"
          ? "Não é possível excluir uma categoria com transações."
          : "Erro ao excluir categoria.";
      alert(msg);
    },
  });

  const expenses = categories.filter((c) => c.type === "EXPENSE");
  const incomes = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categorias</h1>
        <button
          onClick={() => {
            setFormError(null);
            setShowCreate(true);
          }}
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nova categoria
        </button>
      </div>

      {isLoading && <p className="text-[var(--text-secondary)] text-sm">Carregando...</p>}

      {[
        { label: "Despesas", items: expenses },
        { label: "Receitas", items: incomes },
      ].map(({ label, items }) => (
        <div key={label} className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            {label}
          </h2>
          {items.length === 0 && (
            <p className="text-sm text-[var(--text-secondary)]">Nenhuma categoria cadastrada.</p>
          )}
          <div className="space-y-2">
            {items.map((cat) => (
              <div
                key={cat.id}
                className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                    style={{ backgroundColor: cat.color + "22" }}
                  >
                    {getIconEmoji(cat.icon)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{cat.name}</p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        cat.type === "INCOME"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cat.type === "INCOME" ? "Receita" : "Despesa"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormError(null);
                      setEditing(cat);
                    }}
                    className="text-xs text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="text-xs text-[var(--danger)] hover:text-red-700 font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showCreate && (
        <Modal title="Nova categoria" onClose={() => setShowCreate(false)}>
          <CategoryForm
            onSubmit={(dto) => createMutation.mutate(dto)}
            loading={createMutation.isPending}
            error={formError}
            submitLabel="Criar categoria"
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar categoria" onClose={() => setEditing(null)}>
          <CategoryForm
            initial={editing}
            onSubmit={(dto) => updateMutation.mutate({ id: editing.id, dto })}
            loading={updateMutation.isPending}
            error={formError}
            submitLabel="Salvar alterações"
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Excluir categoria" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Tem certeza que deseja excluir a categoria{" "}
            <strong>&quot;{deleteTarget.name}&quot;</strong>?
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
