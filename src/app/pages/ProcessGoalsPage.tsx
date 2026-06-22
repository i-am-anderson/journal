import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, Target, Moon } from "lucide-react";
import { DailyProcess, ProcessGoalsPageProps } from "../types";
import DailyProcessModal from "../components/DailyProcessModal";
import MonthlyProcessProgress from "../components/MonthlyProcessProgress";
import StatCard from "../components/StatCard";
import { fmtPnl } from "../helpers/utils";

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
    const totalGoalsCount =
      savedGoalsKeys.length > 0 ? savedGoalsKeys.length : processGoals.length;

    if (totalGoalsCount === 0) return null;

    const checkedCount = Object.values(dp.checklist || {}).filter(
      Boolean,
    ).length;
    return (checkedCount / totalGoalsCount) * 100;
  };

  const getDayPnl = (dateStr: string) => {
    const dayTrades = trades.filter((t) => t.date.startsWith(dateStr));
    if (dayTrades.length === 0) return null;
    return dayTrades.reduce((acc, t) => acc + t.pnl, 0);
  };

  // Data de "hoje" em componentes locais — consistente com a geração do
  // calendário acima (evita desalinhar ~3h à noite em fusos como o do Brasil,
  // que aconteceria se usássemos toISOString() aqui).
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // ─── SEQUÊNCIA DE DISCIPLINA: dias consecutivos com 100% do checklist ───
  const disciplineStreak = useMemo(() => {
    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      const dp = getDayData(dateStr);
      if (i === 0 && !dp) {
        // Hoje ainda não foi registrado — não conta, mas também não quebra
        // a sequência (o dia ainda não terminou).
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      const score = getDisciplineScore(dp);
      if (score === 100) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [dailyProcess, processGoals]);

  // ─── CORRELAÇÃO: P&L médio em dias disciplinados vs indisciplinados ───
  const disciplineVsPnl = useMemo(() => {
    const rows = dailyProcess
      .map((dp) => ({
        score: getDisciplineScore(dp),
        pnl: getDayPnl(dp.date),
      }))
      .filter((r) => r.score !== null && r.pnl !== null) as {
      score: number;
      pnl: number;
    }[];

    const high = rows.filter((r) => r.score >= 80);
    const low = rows.filter((r) => r.score < 50);

    const avg = (list: typeof rows) =>
      list.length > 0
        ? list.reduce((s, r) => s + r.pnl, 0) / list.length
        : null;

    return {
      avgHigh: avg(high),
      avgLow: avg(low),
      highCount: high.length,
      lowCount: low.length,
    };
  }, [dailyProcess, trades, processGoals]);

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

      {/* Insights de Disciplina */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Sequência de Disciplina"
          value={
            disciplineStreak > 0
              ? `${disciplineStreak} ${disciplineStreak === 1 ? "dia" : "dias"}`
              : "—"
          }
          sub="dias seguidos com 100% do checklist"
          tone={disciplineStreak > 0 ? "green" : undefined}
        />
        <StatCard
          label="P&L · Dias Disciplinados"
          value={
            disciplineVsPnl.avgHigh !== null
              ? fmtPnl(disciplineVsPnl.avgHigh)
              : "—"
          }
          sub={`score ≥ 80% · ${disciplineVsPnl.highCount} ${disciplineVsPnl.highCount === 1 ? "dia" : "dias"}`}
          tone={
            disciplineVsPnl.avgHigh !== null
              ? disciplineVsPnl.avgHigh >= 0
                ? "green"
                : "red"
              : undefined
          }
        />
        <StatCard
          label="P&L · Dias Indisciplinados"
          value={
            disciplineVsPnl.avgLow !== null
              ? fmtPnl(disciplineVsPnl.avgLow)
              : "—"
          }
          sub={`score < 50% · ${disciplineVsPnl.lowCount} ${disciplineVsPnl.lowCount === 1 ? "dia" : "dias"}`}
          tone={
            disciplineVsPnl.avgLow !== null
              ? disciplineVsPnl.avgLow >= 0
                ? "green"
                : "red"
              : undefined
          }
        />
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
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;

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
                onClick={() => {
                  // Qualquer dia pode ser registrado, mesmo sem trades —
                  // não operar também é uma decisão de disciplina.
                  if (isFuture) return;
                  setSelectedDate(dateStr);
                }}
                className={`border-r border-b border-border/50 p-2 transition-colors flex flex-col justify-between border-l-4 ${ringColor} ${
                  isFuture
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer hover:bg-secondary/40"
                } ${isToday ? "ring-1 ring-inset ring-sky-400/50" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-sm font-mono font-medium ${isToday ? "text-sky-400" : "text-muted-foreground"}`}
                  >
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
                  {pnl === null && dp && (
                    <div className="flex items-center gap-1 text-[9px] font-mono text-sky-400/80">
                      <Moon size={9} />
                      Sem trades
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

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-muted-foreground px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border-l-4 border-emerald-500/50 bg-secondary/30" />
          100% do checklist
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border-l-4 border-amber-500/50 bg-secondary/30" />
          50–99%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border-l-4 border-red-500/50 bg-secondary/30" />
          Abaixo de 50%
        </span>
        <span className="flex items-center gap-1.5">
          <Moon size={11} className="text-sky-400/80" />
          Dia sem trades, registrado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm ring-1 ring-inset ring-sky-400/50 bg-secondary/30" />
          Hoje
        </span>
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
