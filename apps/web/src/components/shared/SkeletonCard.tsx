interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div
      className={`bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-5 py-4 animate-pulse ${className}`}
    >
      <div className="h-3 bg-[var(--bg-secondary)] rounded w-1/3 mb-3" />
      <div className="h-7 bg-[var(--bg-secondary)] rounded w-2/3" />
    </div>
  );
}
