interface MonthYearPickerProps {
  value: { month: number; year: number };
  onChange: (value: { month: number; year: number }) => void;
}

const MONTH_NAMES = [
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

export function MonthYearPicker({ value, onChange }: MonthYearPickerProps) {
  function prev() {
    if (value.month === 1) {
      onChange({ month: 12, year: value.year - 1 });
    } else {
      onChange({ month: value.month - 1, year: value.year });
    }
  }

  function next() {
    if (value.month === 12) {
      onChange({ month: 1, year: value.year + 1 });
    } else {
      onChange({ month: value.month + 1, year: value.year });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-medium transition-colors"
        aria-label="Mês anterior"
      >
        ‹
      </button>
      <span className="text-sm font-semibold text-[var(--text-primary)] w-36 text-center">
        {MONTH_NAMES[value.month - 1]} {value.year}
      </span>
      <button
        onClick={next}
        className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-medium transition-colors"
        aria-label="Próximo mês"
      >
        ›
      </button>
    </div>
  );
}
