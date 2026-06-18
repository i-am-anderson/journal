import { useMemo, useState } from "react";
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
import { Printer, Calendar } from "lucide-react"; // Importando ícones para o topo
import StatCard from "../components/StatCard";
import { fmtPnl, pnlColor } from "../helpers/utils";

import { StatsPageProps, Trade } from "../types";
import useAdvancedStats from "../hooks/useAdvancedStats";

const COLORS = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#60a5fa"];

/* ══════════════════════════════════════════════════════════════════════
   PAGE — Statistics
══════════════════════════════════════════════════════════════════════ */
function StatsPage({
  stats: initialStats,
  strategyStats: initialStrategyStats,
  trades,
  days,
}: StatsPageProps) {
  // Estados para o range de datas (formato YYYY-MM-DD do input nativo)
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 0. Filtragem dos Trades pelo Range de Data
  const filteredTrades = useMemo(() => {
    return trades.filter((t: Trade) => {
      const tradeDate = t.date.slice(0, 10); // Extrai "YYYY-MM-DD"
      if (startDate && tradeDate < startDate) return false;
      if (endDate && tradeDate > endDate) return false;
      return true;
    });
  }, [trades, startDate, endDate]);

  // Recalcula as estatísticas básicas locais baseadas nos trades filtrados
  const localStats = useMemo(() => {
    const total = filteredTrades.length;
    if (total === 0) {
      return {
        totalPnl: 0,
        total: 0,
        winRate: 0,
        wins: 0,
        losses: 0,
        avgWin: 0,
        rr: 0,
        bestTrade: 0,
        worstTrade: 0,
      };
    }
    const winsTrades = filteredTrades.filter((t) => t.pnl > 0);
    const lossTrades = filteredTrades.filter((t) => t.pnl < 0);

    const totalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = winsTrades.length;
    const losses = lossTrades.length;
    const winRate = (wins / total) * 100;

    const totalWinPnl = winsTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLossPnl = lossTrades.reduce((sum, t) => sum + t.pnl, 0);

    const avgWin = wins > 0 ? totalWinPnl / wins : 0;
    const avgLoss = losses > 0 ? Math.abs(totalLossPnl / losses) : 0;
    const rr = avgLoss > 0 ? avgWin / avgLoss : 0;

    const bestTrade = Math.max(...filteredTrades.map((t) => t.pnl));
    const worstTrade = Math.min(...filteredTrades.map((t) => t.pnl));

    return {
      totalPnl,
      total,
      winRate,
      wins,
      losses,
      avgWin,
      rr,
      bestTrade,
      worstTrade,
    };
  }, [filteredTrades]);

  // Recalcula a performance por estratégia localmente baseada nos trades filtrados
  const localStrategyStats = useMemo(() => {
    const map: Record<
      string,
      { name: string; trades: number; wins: number; pnl: number }
    > = {};

    filteredTrades.forEach((t) => {
      if (!map[t.strategy]) {
        map[t.strategy] = { name: t.strategy, trades: 0, wins: 0, pnl: 0 };
      }
      map[t.strategy].trades += 1;
      if (t.pnl > 0) map[t.strategy].wins += 1;
      map[t.strategy].pnl += t.pnl;
    });

    return Object.values(map)
      .map((s) => ({
        name: s.name,
        trades: s.trades,
        winRate: s.trades > 0 ? (s.wins / s.trades) * 100 : 0,
        pnl: s.pnl,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  // Hook avançado agora consome apenas a lista filtrada
  const advStats = useAdvancedStats(filteredTrades);

  // 1. Agrupamento Diário adaptado para ISO String
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTrades.forEach((t: Trade) => {
      const dateOnly = t.date.slice(0, 10);
      map[dateOnly] = (map[dateOnly] ?? 0) + t.pnl;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, pnl]: any) => ({
        date: date.slice(5), // Apenas "MM-DD" para o eixo X
        pnl: parseFloat(pnl.toFixed(2)),
      }));
  }, [filteredTrades]);

  // 2. Dia da Semana adaptado para ISO String
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

    filteredTrades.forEach((t) => {
      const day = new Date(t.date).getDay();
      pnlMap[day] += t.pnl;
      countMap[day] += 1;
    });

    return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      name: days[day],
      pnl: parseFloat(pnlMap[day].toFixed(2)),
      trades: countMap[day],
    }));
  }, [filteredTrades, days]);

  // 3. Agrupamento por Faixas de Horário
  const hourlyData = useMemo(() => {
    const ranges = [
      { label: "00:00 - 09:00", min: 0, max: 8, pnl: 0, trades: 0 },
      { label: "09:00 - 10:00", min: 9, max: 9, pnl: 0, trades: 0 },
      { label: "10:00 - 11:00", min: 10, max: 10, pnl: 0, trades: 0 },
      { label: "11:00 - 12:00", min: 11, max: 11, pnl: 0, trades: 0 },
      { label: "12:00 - 13:00", min: 12, max: 12, pnl: 0, trades: 0 },
      { label: "13:00 - 14:00", min: 13, max: 13, pnl: 0, trades: 0 },
      { label: "14:00 - 15:00", min: 14, max: 14, pnl: 0, trades: 0 },
      { label: "15:00 - 16:00", min: 15, max: 15, pnl: 0, trades: 0 },
      { label: "16:00 - 17:00", min: 16, max: 16, pnl: 0, trades: 0 },
      { label: "17:00 - 18:00", min: 17, max: 17, pnl: 0, trades: 0 },
      { label: "18:00 - 23:59", min: 18, max: 23, pnl: 0, trades: 0 },
    ];

    filteredTrades.forEach((t) => {
      const hour = new Date(t.date).getHours();
      const targetRange = ranges.find((r) => hour >= r.min && hour <= r.max);
      if (targetRange) {
        targetRange.pnl += t.pnl;
        targetRange.trades += 1;
      }
    });

    return ranges.map((r) => ({
      name: r.label,
      pnl: parseFloat(r.pnl.toFixed(2)),
      trades: r.trades,
    }));
  }, [filteredTrades]);

  // Função para disparar a impressão nativa
  const handlePrintReport = () => {
    window.print();
  };

  function DailyTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    return (
      <div className="bg-[#1a1d27] border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
        <p className="text-muted-foreground mb-0.5">
          {payload[0].payload.date}
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

  function HourlyTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    const volume = payload[0].payload.trades;
    return (
      <div className="bg-[#1a1d27] border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl space-y-0.5">
        <p className="text-muted-foreground">
          Faixa: {payload[0].payload.name}
        </p>
        <p className="text-foreground">
          Volume: {volume} {volume === 1 ? "trade" : "trades"}
        </p>
        <span className={pnlColor(val)}>{fmtPnl(val)}</span>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     COMPONENT — Error Performance
  ══════════════════════════════════════════════════════════════════════ */
  const ErrorPerformance = ({ tradesList }: { tradesList: Trade[] }) => {
    const data = useMemo(() => {
      const map: Record<string, number> = {};
      tradesList.forEach((trade) => {
        if (trade.pnl >= 0) return;
        const tags = trade.errorTags || (trade as any).errortags;
        if (!tags) return;

        tags.forEach((tag: string) => {
          map[tag] = (map[tag] || 0) + Math.abs(trade.pnl);
        });
      });

      return Object.entries(map)
        .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
        .sort((a, b) => b.value - a.value);
    }, [tradesList]);

    if (data.length === 0) {
      return (
        <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
          No error data yet
        </div>
      );
    }

    return (
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
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
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              formatter={(value: number) => `-$${value.toFixed(0)}`}
              contentStyle={{
                backgroundColor: "#1a1d27",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                fontSize: "11px",
                fontFamily: "JetBrains Mono, monospace",
              }}
              labelStyle={{ color: "#64748b", marginBottom: "2px" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const maxPnl = Math.max(...localStrategyStats.map((s) => Math.abs(s.pnl)), 1);

  return (
    <div className="space-y-5" id="print-stats-area">
      {/* ─── TRUQUE DE CSS PARA IMPRIMIR APENAS ESTA ÁREA ─── */}
      <style>{`
        @media print {
          /* Esconde absolutamente tudo no body */
          body * {
            visibility: hidden;
          }
          /* Mostra apenas a nossa área de stats e os filhos dela */
          #print-stats-area, #print-stats-area * {
            visibility: visible;
          }
          /* Força a área de stats a ocupar o topo e a largura total da folha */
          #print-stats-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
        }
      `}</style>

      {/* ─── FILTROS DE DATA E BOTÃO DE IMPRESSÃO (Escondidos ao Imprimir) ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border rounded-xl p-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Calendar size={14} className="text-emerald-400" />
            <span>Filter Period:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#1a1d27] border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
            />
            <span className="text-xs text-muted-foreground font-mono">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#1a1d27] border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-xs font-mono text-red-400 hover:underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-4 py-1.5 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-400 text-xs font-mono rounded-lg transition-colors"
        >
          <Printer size={13} />
          Print Performance Report
        </button>
      </div>

      {/* Cabeçalho exclusivo para o Modo de Impressão */}
      <div className="hidden print:block border-b border-border pb-4 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Trading Performance Report
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Period: {startDate ? startDate : "Beginning"} to{" "}
          {endDate ? endDate : "Present"} · Generated from{" "}
          {filteredTrades.length} trades
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Risk & Performance Metrics</h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total P&L"
            value={fmtPnl(localStats.totalPnl)}
            sub={`across ${localStats.total} trades`}
            tone={localStats.totalPnl >= 0 ? "green" : "red"}
          />
          <StatCard
            label="Win Rate"
            value={`${localStats.winRate.toFixed(1)}%`}
            sub={`${localStats.wins}W · ${localStats.losses}L`}
          />
          <StatCard
            label="Avg Win"
            value={fmtPnl(localStats.avgWin)}
            sub="per winning trade"
            tone="green"
          />
          <StatCard
            label="Risk / Reward"
            value={localStats.rr > 0 ? `${localStats.rr.toFixed(2)}R` : "—"}
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

      {/* Linha 1 de Gráficos: Histórico Diário */}
      <div className="bg-card border border-border rounded-xl p-5 break-inside-avoid">
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

      {/* Linha 2 de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 break-inside-avoid">
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

        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">
            Hourly Range Performance
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={hourlyData}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 9,
                  fill: "#5a6480",
                  fontFamily: "JetBrains Mono, monospace",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip content={(props) => <HourlyTooltip {...props} />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={32}>
                {hourlyData.map((entry, i) => (
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

      {/* Gráfico de Erros */}
      <div className="bg-card border border-border rounded-xl p-5 break-inside-avoid">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">
          Loss Accumulated by Error Tag
        </p>
        <ErrorPerformance tradesList={filteredTrades} />
      </div>

      {/* Tabela de Estratégias */}
      <div className="bg-card border border-border rounded-xl overflow-hidden break-inside-avoid">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            By Strategy
          </p>
        </div>
        {localStrategyStats.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            No data yet
          </p>
        ) : (
          localStrategyStats.map((s) => (
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

      <div className="grid grid-cols-2 gap-4 break-inside-avoid">
        <StatCard
          label="Best Trade"
          value={fmtPnl(localStats.bestTrade)}
          tone="green"
        />
        <StatCard
          label="Worst Trade"
          value={fmtPnl(localStats.worstTrade)}
          tone="red"
        />
      </div>
    </div>
  );
}

export default StatsPage;
