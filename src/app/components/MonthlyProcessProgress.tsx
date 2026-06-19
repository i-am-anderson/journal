import { CheckSquare, TrendingUp } from "lucide-react";
import { DailyProcess, MonthlyProcessProgressProps } from "../types";

/* ══════════════════════════════════════════════════════════════════════
  SHARED UI
══════════════════════════════════════════════════════════════════════ */
function MonthlyProcessProgress({
  entries,
  currentMonth,
  currentGlobalGoalsCount,
}: MonthlyProcessProgressProps) {
  // Filtrar dados do mês selecionado no calendário
  const year = currentMonth.getFullYear();
  const monthStr = String(currentMonth.getMonth() + 1).padStart(2, "0");
  const targetYearMonth = `${year}-${monthStr}`; // Ex: "2026-06"

  const filteredEntries = entries.filter((entry) =>
    entry.date.startsWith(targetYearMonth),
  );

  let totalPossibleGoals = 0;
  let totalCompletedGoals = 0;

  filteredEntries.forEach((entry) => {
    const savedGoalsKeys = Object.keys(entry.checklist || {});

    // Se o dia foi registrado, usamos o número de metas que existia nele (evita o bug)
    // Se estiver vazio mas o dia foi fechado, assume o global corrente
    const goalsInDay =
      savedGoalsKeys.length > 0
        ? savedGoalsKeys.length
        : currentGlobalGoalsCount;

    totalPossibleGoals += goalsInDay;
    totalCompletedGoals += Object.values(entry.checklist || {}).filter(
      Boolean,
    ).length;
  });

  const percentage =
    totalPossibleGoals > 0
      ? Math.round((totalCompletedGoals / totalPossibleGoals) * 100)
      : 0;

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return "bg-emerald-400";
    if (pct >= 50) return "bg-blue-400";
    return "bg-amber-400";
  };

  const getTextColor = (pct: number) => {
    if (pct >= 80) return "text-emerald-400";
    if (pct >= 50) return "text-blue-400";
    return "text-amber-400";
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg bg-secondary ${getTextColor(percentage)}`}
          >
            <CheckSquare size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">
              Performance Operacional do Mês
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Porcentagem de cumprimento das suas regras de processo neste mês.
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 self-end sm:self-auto">
          <span
            className={`text-2xl font-bold font-mono tracking-tight ${getTextColor(percentage)}`}
          >
            {percentage}%
          </span>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            Cumprido
          </span>
        </div>
      </div>

      <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden border border-border/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} />
          <span>
            {totalCompletedGoals} de {totalPossibleGoals} metas cumpridas
          </span>
        </div>
        <span>{filteredEntries.length} dias avaliados no mês</span>
      </div>
    </div>
  );
}

export default MonthlyProcessProgress;
