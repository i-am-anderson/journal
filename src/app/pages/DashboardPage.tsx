import { useMemo } from "react";
import { Flame, AlertTriangle, ArrowRight } from "lucide-react";
import StatCard from "../components/StatCard";
import EquityChart from "../components/EquityChart";
import { fmtPnl, pnlColor } from "../helpers/utils";

import { DashboardPageProps } from "../types";
import { OVERTRADING_DAILY_THRESHOLD } from "../helpers/constants";

/* ══════════════════════════════════════════════════════════════════════
  PAGE — Dashboard
══════════════════════════════════════════════════════════════════════ */
function DashboardPage({
  trades,
  stats,
  equityData,
  setups,
  strategies,
  onViewAll,
  setView,
  days,
}: DashboardPageProps) {
  const recent = [...trades]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);
  const setupMap = Object.fromEntries(setups.map((s) => [s.id, s]));
  const strategyMap = Object.fromEntries(strategies.map((s) => [s.id, s]));

  // Cálculo dos Lucros por Dia da Semana (usado apenas para o destaque "Melhor Dia")
  const weekdayStats = useMemo(() => {
    const pnlMap: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };
    const countMap: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };

    trades.forEach((t) => {
      // Ajuste de fuso horário UTC seguro para o parse de data YYYY-MM-DD
      const day = new Date(t.date).getDay();
      pnlMap[day] += t.pnl;
      countMap[day] += 1;
    });

    // Ordenado de Segunda a Domingo
    return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      name: days[day],
      pnl: pnlMap[day],
      trades: countMap[day],
    }));
  }, [trades, days]);

  // Resumo de 1 linha (em vez do breakdown completo, que já vive na StatsPage)
  const bestWeekday = useMemo(() => {
    return weekdayStats.reduce(
      (best, current) => (current.pnl > best.pnl ? current : best),
      weekdayStats[0],
    );
  }, [weekdayStats]);

  // ─── PULSO RÁPIDO: P&L de hoje, posições abertas e sequência atual ───
  const quickStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTrades = trades.filter((t) => t.date.slice(0, 10) === todayStr);
    const todayPnl = todayTrades.reduce((sum, t) => sum + t.pnl, 0);

    const openPositions = trades.filter((t) => !t.exitDate).length;

    // Sequência atual = caminha do trade mais recente para trás até o sinal mudar
    const sorted = [...trades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    let winStreak = 0;
    let lossStreak = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      const pnl = sorted[i].pnl;
      if (pnl > 0) {
        if (lossStreak > 0) break;
        winStreak += 1;
      } else if (pnl < 0) {
        if (winStreak > 0) break;
        lossStreak += 1;
      } else {
        break;
      }
    }

    return {
      todayPnl,
      todayTradesCount: todayTrades.length,
      openPositions,
      winStreak,
      lossStreak,
    };
  }, [trades]);

  // ─── ALERTA DE DISCIPLINA: só aparece quando há algo a sinalizar ───
  const riskAlert = useMemo(() => {
    if (quickStats.lossStreak >= 3) {
      return {
        tone: "danger" as const,
        message: `Você está em ${quickStats.lossStreak} perdas consecutivas. Considere uma pausa antes do próximo trade.`,
      };
    }
    if (quickStats.todayTradesCount > OVERTRADING_DAILY_THRESHOLD) {
      return {
        tone: "warning" as const,
        message: `${quickStats.todayTradesCount} trades hoje — acima do seu limite de ${OVERTRADING_DAILY_THRESHOLD}. Vale revisar se ainda está operando por processo.`,
      };
    }
    if (quickStats.winStreak >= 5) {
      return {
        tone: "info" as const,
        message: `${quickStats.winStreak} vitórias consecutivas. Mantenha o mesmo risco de sempre — euforia é onde o overtrading costuma começar.`,
      };
    }
    return null;
  }, [quickStats]);

  return (
    <div className="space-y-5">
      {riskAlert && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            riskAlert.tone === "danger"
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : riskAlert.tone === "warning"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-sky-500/10 border-sky-500/30 text-sky-300"
          }`}
        >
          {riskAlert.tone === "info" ? (
            <Flame size={16} className="shrink-0" />
          ) : (
            <AlertTriangle size={16} className="shrink-0" />
          )}
          <p className="text-xs font-mono">{riskAlert.message}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total P&L"
          value={fmtPnl(stats.totalPnl)}
          tone={stats.totalPnl >= 0 ? "green" : "red"}
        />
        <StatCard
          label="P&L Hoje"
          value={fmtPnl(quickStats.todayPnl)}
          tone={quickStats.todayPnl >= 0 ? "green" : "red"}
          sub={`${quickStats.todayTradesCount} ${quickStats.todayTradesCount === 1 ? "trade" : "trades"} hoje`}
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          sub={`${stats.wins}W  ·  ${stats.losses}L`}
        />
        <StatCard
          label="Posições Abertas"
          value={`${quickStats.openPositions}`}
          sub={
            quickStats.openPositions === 0
              ? "nada em aberto"
              : "em andamento agora"
          }
        />
        <StatCard
          label="Sequência Atual"
          value={
            quickStats.lossStreak > 0
              ? `${quickStats.lossStreak} perdas`
              : quickStats.winStreak > 0
                ? `${quickStats.winStreak} vitórias`
                : "—"
          }
          tone={
            quickStats.lossStreak > 0
              ? "red"
              : quickStats.winStreak > 0
                ? "green"
                : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <EquityChart data={equityData} />
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Recent Trades
            </p>
            <button
              onClick={onViewAll}
              className="text-[10px] font-mono uppercase tracking-wide text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="space-y-0">
            {recent.map((t) => {
              const setup = setupMap[t.setupId];
              const strategy = strategyMap[t.strategyId];
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
                >
                  <span className="font-mono text-sm font-semibold w-20 shrink-0">
                    {t.symbol}
                  </span>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full border shrink-0 ${t.side === "long" ? "text-emerald-400 border-emerald-400/25 bg-emerald-400/10" : "text-red-400 border-red-400/25 bg-red-400/10"}`}
                  >
                    {t.side}
                  </span>
                  {!t.exitDate && (
                    <span className="flex items-center gap-1 bg-red-600 text-white text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 leading-none">
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                      Live
                    </span>
                  )}
                  {setup ? (
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border shrink-0"
                      style={{
                        color: setup?.color,
                        borderColor: setup?.color + "44",
                        backgroundColor: setup?.color + "18",
                      }}
                    >
                      {setup?.name}
                    </span>
                  ) : (
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-border bg-secondary text-muted-foreground truncate max-w-[80px]"
                      style={{
                        color: strategy?.color,
                        borderColor: strategy?.color + "44",
                        backgroundColor: strategy?.color + "18",
                      }}
                    >
                      {strategy?.name}
                    </span>
                  )}
                  <span
                    className={`font-mono text-sm font-semibold shrink-0 ml-auto ${pnlColor(t.pnl)}`}
                  >
                    {fmtPnl(t.pnl)}
                  </span>
                </div>
              );
            })}
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">
                No trades yet
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Best Trade"
          value={fmtPnl(stats.bestTrade)}
          tone="green"
        />
        <StatCard
          label="Worst Trade"
          value={fmtPnl(stats.worstTrade)}
          tone="red"
        />
        <StatCard
          label="Melhor Dia da Semana"
          value={bestWeekday?.name || "—"}
          sub={bestWeekday ? fmtPnl(bestWeekday.pnl) : undefined}
          tone={bestWeekday && bestWeekday.pnl >= 0 ? "green" : undefined}
        />
        <button
          onClick={() => setView("stats")}
          className="bg-card border border-border rounded-xl p-4 flex flex-col items-start justify-between text-left hover:border-emerald-400/40 hover:bg-secondary/20 transition-colors group"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-2">
            Quer ir mais a fundo?
          </span>
          <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
            Estatísticas completas
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </span>
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
