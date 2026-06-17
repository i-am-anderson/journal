import { useMemo } from "react";
import StatCard from "../components/StatCard";
import useAdvancedStats from "../hooks/useAdvancedStats";
import EquityChart from "../components/EquityChart";
import { fmtPnl, pnlColor } from "../helpers/utils";

import { DashboardPageProps } from "../types";
import { DAYS } from "../helpers/constants";

/* ══════════════════════════════════════════════════════════════════════
  PAGE — Dashboard
══════════════════════════════════════════════════════════════════════ */
function DashboardPage({
  trades,
  stats,
  equityData,
  setups,
  onViewAll,
}: DashboardPageProps) {
  const advStats = useAdvancedStats(trades);

  const recent = [...trades]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);
  const setupMap = Object.fromEntries(setups.map((s) => [s.id, s]));

  // 2. Cálculo dos Lucros por Dia da Semana
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
      const day = new Date(t.date + "T12:00:00").getDay();
      pnlMap[day] += t.pnl;
      countMap[day] += 1;
    });

    // Ordenado de Segunda a Domingo
    return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      name: DAYS[day],
      pnl: pnlMap[day],
      trades: countMap[day],
    }));
  }, [trades]);

  const maxWeekdayPnl = useMemo(() => {
    return Math.max(...weekdayStats.map((d) => Math.abs(d.pnl)), 1);
  }, [weekdayStats]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total P&L"
          value={fmtPnl(stats.totalPnl)}
          tone={stats.totalPnl >= 0 ? "green" : "red"}
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          sub={`${stats.wins}W  ·  ${stats.losses}L`}
        />
        <StatCard
          label="Avg Win"
          value={fmtPnl(stats.avgWin)}
          tone="green"
          sub="per winning trade"
        />
        <StatCard
          label="Avg Loss"
          value={fmtPnl(stats.avgLoss)}
          tone="red"
          sub="per losing trade"
        />
        <StatCard
          label="Sharpe Ratio"
          value={advStats ? advStats.sharpe.val.toFixed(2) : "—"}
          sub="Return vs Volatility"
          rating={
            advStats ? advStats.sharpe.rating : { label: "N/A", color: "gray" }
          }
          tooltip="Mede o retorno ajustado ao risco. Penaliza tanto a volatilidade de alta quanto a de baixa. Sharpe alto significa curvas de capital mais suaves."
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
                  {setup ? (
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border shrink-0"
                      style={{
                        color: setup.color,
                        borderColor: setup.color + "44",
                        backgroundColor: setup.color + "18",
                      }}
                    >
                      {setup.name}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-border bg-secondary text-muted-foreground truncate max-w-[80px]">
                      {t.strategy}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">
            Day of Week P&L
          </p>
          <div className="space-y-2">
            {weekdayStats.map((s) => (
              <div
                key={s.name}
                className="py-1.5 border-b border-border last:border-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {s.trades} {s.trades === 1 ? "trade" : "trades"}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-sm font-semibold ${pnlColor(s.pnl)}`}
                  >
                    {fmtPnl(s.pnl)}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${s.pnl >= 0 ? "bg-emerald-400/60" : "bg-red-400/60"}`}
                    style={{
                      width: `${(Math.abs(s.pnl) / maxWeekdayPnl) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
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
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
