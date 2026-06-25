interface CurrencyDisplayProps {
  value: number;
  colorize?: boolean;
  className?: string;
}

function formatBRL(value: number) {
  return Math.abs(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CurrencyDisplay({ value, colorize = false, className = "" }: CurrencyDisplayProps) {
  const color = colorize ? (value >= 0 ? "text-green-600" : "text-red-600") : "";

  return (
    <span className={`${color} ${className}`.trim()}>
      {value < 0 ? "−" : ""}
      {formatBRL(value)}
    </span>
  );
}
