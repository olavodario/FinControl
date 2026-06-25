interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
}

export function ProgressBar({ percentage, showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(percentage, 100);
  const color =
    percentage > 100 ? "bg-red-500" : percentage >= 80 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span
          className={`text-xs font-bold w-10 text-right ${
            percentage > 100
              ? "text-red-600"
              : percentage >= 80
                ? "text-yellow-600"
                : "text-green-600"
          }`}
        >
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
