interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  color?: string;
  className?: string;
}

export function ProgressBar({ percentage, showLabel = false, color, className }: ProgressBarProps) {
  const clamped = Math.min(percentage, 100);
  const defaultColor =
    percentage > 100 ? "bg-red-500" : percentage >= 80 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={
            color
              ? "h-full rounded-full transition-all"
              : `h-full rounded-full transition-all ${defaultColor}`
          }
          style={{ width: `${clamped}%`, ...(color ? { backgroundColor: color } : {}) }}
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
