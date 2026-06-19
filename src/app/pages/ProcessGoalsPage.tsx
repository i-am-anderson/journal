import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, Target } from "lucide-react";
import { DailyProcess, ProcessGoalsPageProps } from "../types";
import DailyProcessModal from "../components/DailyProcessModal";
import MonthlyProcessProgress from "../components/MonthlyProcessProgress";

/* ══════════════════════════════════════════════════════════════════════
  PAGE — Process Goals
══════════════════════════════════════════════════════════════════════ */
export default function ProcessGoalsPage({
  trades,
  processGoals,
  dailyProcess,
  onSaveDailyProcess,
}: ProcessGoalsPageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Geração de Dias do Mês
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    // Preenche espaços vazios antes do dia 1
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    // Preenche os dias do mês
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push(dateStr);
    }
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1),
    );
  };

  // Auxiliares para dados do calendário
  const getDayData = (dateStr: string) =>
    dailyProcess.find((dp) => dp.date === dateStr) || null;

  // 🔥 CORREÇÃO DO BUG: Calcula o score usando apenas as metas salvas na estrutura daquele dia
  const getDisciplineScore = (dp: DailyProcess | null) => {
    if (!dp) return null;
    
    const savedGoalsKeys = Object.keys(dp.checklist || {});
    // Se o dia já foi salvo, usamos a quantidade de metas que ele tinha gravado
    const totalGoalsCount = savedGoalsKeys.length > 0 ? savedGoalsKeys.length : processGoals.length;
    
    if (totalGoalsCount === 0) return null;
    
    const checkedCount = Object.values(dp.checklist || {}).filter(Boolean).length;
    return (checkedCount / totalGoalsCount) * 100;
  };

  const getDayPnl = (dateStr: string) => {
    const dayTrades = trades.filter((t) => t.date.startsWith(dateStr));
    if (dayTrades.length === 0) return null;
    return dayTrades.reduce((acc, t) => acc + t.pnl, 0);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 👇 BARRA DE PROGRESSO INTEGRADA (Conectada ao mês do calendário) */}
      <MonthlyProcessProgress
        entries={dailyProcess}
        currentMonth={currentMonth}
        currentGlobalGoalsCount={processGoals.length}
      />

      {/* Header do Calendário */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
            <Target className="text-emerald-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Monitor de Disciplina</h2>
            <p className="text-sm text-muted-foreground">
              Avalie seu cumprimento de regras diárias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-secondary rounded-lg"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-mono text-sm font-semibold min-w-[120px] text-center capitalize">
            {currentMonth.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-secondary rounded-lg"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-mono font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[100px]">
          {calendarDays.map((dateStr, idx) => {
            if (!dateStr)
              return (
                <div
                  key={`empty-${idx}`}
                  className="border-r border-b border-border/50 bg-secondary/10"
                />
              );

            const dp = getDayData(dateStr);
            const score = getDisciplineScore(dp);
            const pnl = getDayPnl(dateStr);
            const dayNum = parseInt(dateStr.split("-")[2]);

            // Define cor da borda baseado na pontuação
            let ringColor = "border-transparent";
            if (score !== null) {
              if (score === 100) ringColor = "border-emerald-500/50";
              else if (score >= 50) ringColor = "border-amber-500/50";
              else ringColor = "border-red-500/50";
            }

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`border-r border-b border-border/50 p-2 cursor-pointer hover:bg-secondary/40 transition-colors flex flex-col justify-between border-l-4 ${ringColor}`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-mono font-medium text-muted-foreground">
                    {dayNum}
                  </span>
                  {dp?.closed && (
                    <Lock size={10} className="text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-1">
                  {pnl !== null && (
                    <div
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${pnl >= 0 ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}
                    >
                      {pnl >= 0 ? "+" : ""}
                      {pnl.toFixed(2)}
                    </div>
                  )}
                  {score !== null && (
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Score: {score.toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <DailyProcessModal
          date={selectedDate}
          trades={trades}
          processGoals={processGoals}
          initialData={getDayData(selectedDate)}
          onClose={() => setSelectedDate(null)}
          onSave={(data) => {
            onSaveDailyProcess(data);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
}