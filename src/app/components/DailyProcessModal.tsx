import { useState, useMemo } from "react";
import { X, CheckCircle, AlertTriangle, Lock, BarChart2 } from "lucide-react";
import { Trade, DailyProcess, DailyProcessModalProps } from "../types";
import { fmtPnl, pnlColor } from "../helpers/utils";

/* ══════════════════════════════════════════════════════════════════════
  SHARED UI
══════════════════════════════════════════════════════════════════════ */
export default function DailyProcessModal({
  date,
  trades,
  processGoals,
  initialData,
  onClose,
  onSave,
}: DailyProcessModalProps) {
  // Filtra os trades apenas deste dia específico
  const dayTrades = useMemo(() => {
    return trades.filter((t) => t.date.startsWith(date));
  }, [trades, date]);

  // Calcula estatísticas do dia
  const stats = useMemo(() => {
    const wins = dayTrades.filter((t) => t.status === "win");
    const totalPnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
    const winRate = dayTrades.length
      ? (wins.length / dayTrades.length) * 100
      : 0;
    return { total: dayTrades.length, wins: wins.length, totalPnl, winRate };
  }, [dayTrades]);

  // Estados locais
  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    initialData?.checklist || {},
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isClosed, setIsClosed] = useState(initialData?.closed || false);

  const handleToggle = (goal: string) => {
    if (isClosed) return;
    setChecklist((prev) => ({ ...prev, [goal]: !prev[goal] }));
  };

  const handleCloseDay = () => {
    if (
      window.confirm(
        "Tem certeza que deseja encerrar este dia? Você não poderá mais alterar o checklist.",
      )
    ) {
      setIsClosed(true);
      onSave({ date, checklist, notes, closed: true });
    }
  };

  const handleSaveDraft = () => {
    onSave({ date, checklist, notes, closed: isClosed });
  };

  const displayDate = new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold capitalize">{displayDate}</h2>
            {isClosed ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium">
                <Lock size={12} /> Dia Encerrado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-amber-400 mt-1 font-medium">
                <AlertTriangle size={12} /> Pregão em Andamento
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Resumo Financeiro do Dia */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-secondary/20">
              <span className="text-xs text-muted-foreground font-mono">
                P&L do Dia
              </span>
              <p
                className={`text-xl font-bold mt-1 ${pnlColor(stats.totalPnl)}`}
              >
                {fmtPnl(stats.totalPnl)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-secondary/20">
              <span className="text-xs text-muted-foreground font-mono">
                Total Trades
              </span>
              <p className="text-xl font-bold mt-1 text-foreground">
                {stats.total}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-secondary/20">
              <span className="text-xs text-muted-foreground font-mono">
                Win Rate
              </span>
              <p className="text-xl font-bold mt-1 text-foreground">
                {stats.winRate.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Checklist de Metas */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400" />
              Checklist de Disciplina
            </h3>
            {processGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Nenhuma meta cadastrada em Configurações.
              </p>
            ) : (
              <div className="space-y-2">
                {processGoals.map((goal) => (
                  <label
                    key={goal}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      checklist[goal]
                        ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-100"
                        : "bg-secondary/30 border-border text-foreground hover:bg-secondary/50"
                    } ${isClosed ? "cursor-not-allowed opacity-80" : "cursor-pointer"} transition-colors`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checklist[goal]}
                      onChange={() => handleToggle(goal)}
                      disabled={isClosed}
                      className="w-4 h-4 rounded bg-background border-border text-emerald-400 focus:ring-emerald-400/40"
                    />
                    <span className="text-sm font-medium">{goal}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Diário de Fechamento */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 size={16} className="text-blue-400" />
              Notas de Fechamento (Diário)
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isClosed}
              placeholder="Descreva como foi sua disciplina mental, erros operacionais ou observações de mercado hoje..."
              className="w-full h-32 px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400/40 resize-none disabled:opacity-70"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex justify-between bg-secondary/10">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Salvar Rascunho
          </button>

          {!isClosed && (
            <button
              onClick={handleCloseDay}
              className="px-6 py-2 bg-emerald-400 text-black text-sm font-bold rounded-lg hover:bg-emerald-300 transition-colors"
            >
              Encerrar Dia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
