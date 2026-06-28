interface EmptyStateProps {
  icon: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm text-[var(--text-secondary)]">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-sm text-[var(--color-brand)] hover:opacity-80 font-medium hover:underline transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
