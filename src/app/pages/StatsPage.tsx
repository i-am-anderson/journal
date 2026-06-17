import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import StatCard from "../components/StatCard";
import { fmtPnl, pnlColor } from "../helpers/utils";

import { StatsPageProps, Trade } from "../types";
import { DAYS } from "../helpers/constants";
import useAdvancedStats from "../hooks/useAdvancedStats";

/* ══════════════════════════════════════════════════════════════════════
  PAGE — Statistics
══════════════════════════════════════════════════════════════════════ */
function StatsPage({ stats, strategyStats, trades }: StatsPageProps) {
  const advStats = useAdvancedStats(trades);

  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t: Trade) => {
      map[t.date] = (map[t.date] ?? 0) + t.pnl;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, pnl]: any) => ({
        date: date.slice(5),
        pnl: parseFloat(pnl.toFixed(2)),
      }));
  }, [trades]);

  const weekdayData = useMemo(() => {
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
      const day = new Date(t.date + "T12:00:00").getDay();
      pnlMap[day] += t.pnl;
      countMap[day] += 1;
    });

    return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      name: DAYS[day],
      pnl: parseFloat(pnlMap[day].toFixed(2)),
      trades: countMap[day],
    }));
  }, [trades]);

  function DailyTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    return (
      <div className="bg-[#1a1d27] border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
        <p className="text-muted-foreground mb-0.5">
          {payload[0].payload.date || payload[0].payload.name}
        </p>
        <span className={pnlColor(val)}>{fmtPnl(val)}</span>
      </div>
    );
  }

  function WeekdayTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    return (
      <div className="bg-[#1a1d27] border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
        <p className="text-muted-foreground mb-0.5">
          {payload[0].payload.name} ({payload[0].payload.trades} trades)
        </p>
        <span className={pnlColor(val)}>{fmtPnl(val)}</span>
      </div>
    );
  }

  const maxPnl = Math.max(...strategyStats.map((s) => Math.abs(s.pnl)), 1);

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Risk & Performance Metrics</h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total P&L"
            value={fmtPnl(stats.totalPnl)}
            sub={`across ${stats.total} trades`}
            tone={stats.totalPnl >= 0 ? "green" : "red"}
          />

          <StatCard
            label="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            sub={`${stats.wins}W · ${stats.losses}L`}
          />

          <StatCard
            label="Avg Win"
            value={fmtPnl(stats.avgWin)}
            sub="per winning trade"
            tone="green"
          />

          <StatCard
            label="Risk / Reward"
            value={stats.rr > 0 ? `${stats.rr.toFixed(2)}R` : "—"}
            sub="avg win ÷ avg loss"
          />

          <StatCard
            label="Profit Factor"
            value={advStats ? advStats.profitFactor.val.toFixed(2) : "—"}
            sub="Gross Profit ÷ Gross Loss"
            rating={
              advStats
                ? advStats.profitFactor.rating
                : { label: "N/A", color: "gray" }
            }
            tooltip="A proporção entre o lucro total e o prejuízo total. Acima de 1.5 é considerado um sistema sustentável. Acima de 2.0 é excelente."
          />

          <StatCard
            label="Expectancy"
            value={`${advStats ? "$" + advStats.expectancy.val.toFixed(2) : "—"}`}
            sub="Average return per trade"
            rating={
              advStats
                ? advStats.expectancy.rating
                : { label: "N/A", color: "gray" }
            }
            tooltip="O retorno matemático esperado para cada trade executado. Se você jogar uma moeda viciada 100 vezes, quanto você ganha em média por jogada."
          />

          <StatCard
            label="Sharpe Ratio"
            value={advStats ? advStats.sharpe.val.toFixed(2) : "—"}
            sub="Return vs Volatility"
            rating={
              advStats
                ? advStats.sharpe.rating
                : { label: "N/A", color: "gray" }
            }
            tooltip="Mede o retorno ajustado ao risco. Penaliza tanto a volatilidade de alta quanto a de baixa. Sharpe alto significa curvas de capital mais suaves."
          />

          <StatCard
            label="Sortino Ratio"
            value={advStats ? advStats.sortino.val.toFixed(2) : "—"}
            sub="Return vs Downside Risk"
            rating={
              advStats
                ? advStats.sortino.rating
                : { label: "N/A", color: "gray" }
            }
            tooltip="Similar ao Sharpe, mas só penaliza a volatilidade negativa (drawdowns). É geralmente considerado mais útil para traders do que o Sharpe."
          />

          <StatCard
            label="Max Drawdown"
            value={`${advStats ? "-$" + advStats.maxDrawdown.val.toFixed(2) : "—"}`}
            sub="Peak to trough drop"
            tone="red"
            tooltip="O maior declínio absoluto da sua curva de capital. Representa o máximo de dor financeira que você experimentou no pior cenário."
          />

          <StatCard
            label="Recovery Factor"
            value={advStats ? advStats.recoveryFactor.val.toFixed(2) : "—"}
            sub="Net Profit ÷ Max DD"
            rating={
              advStats
                ? advStats.recoveryFactor.rating
                : { label: "N/A", color: "gray" }
            }
            tooltip="Mostra quão bem o seu sistema se recupera de drawdowns. Um fator acima de 2 significa que o sistema já lucrou pelo menos o dobro da sua maior perda."
          />

          <StatCard
            label="Calmar Ratio"
            value={advStats ? advStats.calmar.val.toFixed(2) : "—"}
            sub="Ann. Return ÷ Max DD"
            rating={
              advStats
                ? advStats.calmar.rating
                : { label: "N/A", color: "gray" }
            }
            tooltip="Mede a rentabilidade anualizada em relação ao Risco Máximo (Max Drawdown). Um Calmar acima de 3 geralmente indica um sistema fantástico."
          />

          <StatCard
            label="Ulcer Index"
            value={advStats ? advStats.ulcerIndex.val.toFixed(2) : "—"}
            sub="Drawdown depth & duration"
            tooltip="Mede a profundidade E a duração dos drawdowns. Quanto maior o índice, maior o estresse (ou chance de ter úlcera) segurando essa estratégia."
          />
        </div>
      </div>

      {/* Gráficos em Duas Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico 1: P&L Diário */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">
            Daily P&L
          </p>
          {dailyData.length < 2 ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              Not enough data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={dailyData}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 10,
                    fill: "#5a6480",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip content={(props) => <DailyTooltip {...props} />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={32}>
                  {dailyData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={entry.pnl >= 0 ? "#34d399" : "#f87171"}
                      fillOpacity={0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">
            Day of Week P&L
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={weekdayData}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 10,
                  fill: "#5a6480",
                  fontFamily: "JetBrains Mono, monospace",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip content={(props) => <WeekdayTooltip {...props} />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={32}>
                {weekdayData.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={entry.pnl >= 0 ? "#34d399" : "#f87171"}
                    fillOpacity={0.75}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            By Strategy
          </p>
        </div>
        {strategyStats.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            No data yet
          </p>
        ) : (
          strategyStats.map((s) => (
            <div
              key={s.name}
              className="px-5 py-4 border-b border-border last:border-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {s.trades} {s.trades === 1 ? "trade" : "trades"} ·{" "}
                    {s.winRate.toFixed(0)}% WR
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
                  style={{ width: `${(Math.abs(s.pnl) / maxPnl) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
  );
}

export default StatsPage;
