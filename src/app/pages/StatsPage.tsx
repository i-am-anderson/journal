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
  AreaChart,
  Area,
} from "recharts";
import {
  Printer,
  Calendar,
  Clock,
  BarChart3,
  Wallet,
  Flame,
  AlertTriangle,
  Target,
  Repeat,
  Activity,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { fmtPnl, pnlColor, uid } from "../helpers/utils";

import { StatsPageProps, Trade } from "../types";
import useAdvancedStats from "../hooks/useAdvancedStats";

const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#fb923c", "#f87171"];

// Limite de trades/dia a partir do qual consideramos "possível overtrading".
// Ajuste esse número para o que fizer sentido para o seu estilo operacional.
const OVERTRADING_DAILY_THRESHOLD = 5;

/* ══════════════════════════════════════════════════════════════════════
    HELPERS FOR DURATION FORMATTING
══════════════════════════════════════════════════════════════════════ */
const fmtDuration = (ms: number): string => {
  if (!ms || ms <= 0) return "—";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};

/* ══════════════════════════════════════════════════════════════════════
    PAGE — Statistics
══════════════════════════════════════════════════════════════════════ */
function StatsPage({
  stats: initialStats,
  strategyStats: initialStrategyStats,
  trades,
  days,
  strategies,
  setups = [],
}: StatsPageProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const strategyMap = Object.fromEntries(strategies.map((s) => [s.id, s]));
  const setupMap = Object.fromEntries(setups.map((s) => [s.id, s]));

  // 0. Filtragem dos Trades pelo Range de Data
  const filteredTrades = useMemo(() => {
    return trades.filter((t: Trade) => {
      const tradeDate = t.date.slice(0, 10);
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
        globalAvgDuration: 0,
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

    // Cálculo do Tempo Médio Global dos Trades
    let durationSum = 0;
    let durationCount = 0;
    filteredTrades.forEach((t) => {
      if (t.exitDate) {
        const diff =
          new Date(t.exitDate).getTime() - new Date(t.date).getTime();
        if (diff > 0) {
          durationSum += diff;
          durationCount += 1;
        }
      }
    });
    const globalAvgDuration =
      durationCount > 0 ? durationSum / durationCount : 0;

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
      globalAvgDuration,
    };
  }, [filteredTrades]);

  // Performance por estratégia local baseada nos trades filtrados
  const localStrategyStats = useMemo(() => {
    const map: Record<
      string,
      { name: string; trades: number; wins: number; pnl: number }
    > = {};
    filteredTrades.forEach((t) => {
      const strategy = strategyMap[t.strategyId];

      if (!map[t.strategyId]) {
        map[t.strategyId] = {
          name: strategy?.name || "Unknown Strategy",
          trades: 0,
          wins: 0,
          pnl: 0,
        };
      }
      map[t.strategyId].trades += 1;
      if (t.pnl > 0) map[t.strategyId].wins += 1;
      map[t.strategyId].pnl += t.pnl;
    });

    return Object.values(map)
      .map((s) => ({
        name: s.name,
        trades: s.trades,
        winRate: s.trades > 0 ? (s.wins / s.trades) * 100 : 0,
        pnl: s.pnl,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades, strategyMap]);

  // Estatísticas por Ativo (Symbol) incluindo Tempo Médio
  const assetStats = useMemo(() => {
    const map: Record<
      string,
      {
        symbol: string;
        trades: number;
        wins: number;
        pnl: number;
        durationSum: number;
        durationCount: number;
      }
    > = {};

    filteredTrades.forEach((t) => {
      if (!map[t.symbol]) {
        map[t.symbol] = {
          symbol: t.symbol,
          trades: 0,
          wins: 0,
          pnl: 0,
          durationSum: 0,
          durationCount: 0,
        };
      }
      const current = map[t.symbol];
      current.trades += 1;
      if (t.pnl > 0) current.wins += 1;
      current.pnl += t.pnl;

      if (t.exitDate) {
        const diff =
          new Date(t.exitDate).getTime() - new Date(t.date).getTime();
        if (diff > 0) {
          current.durationSum += diff;
          current.durationCount += 1;
        }
      }
    });

    return Object.values(map)
      .map((a) => ({
        symbol: a.symbol,
        trades: a.trades,
        winRate: a.trades > 0 ? (a.wins / a.trades) * 100 : 0,
        pnl: a.pnl,
        avgDuration: a.durationCount > 0 ? a.durationSum / a.durationCount : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  // Performance por Setup (separado de Strategy) — usa o prop opcional `setups`
  const setupStats = useMemo(() => {
    const map: Record<
      string,
      { name: string; trades: number; wins: number; pnl: number }
    > = {};
    filteredTrades.forEach((t) => {
      const key = t.setupId || "none";
      const setup = setupMap[t.setupId];
      if (!map[key]) {
        map[key] = {
          name:
            setup?.name ||
            (t.setupId ? `Setup ${t.setupId.slice(0, 6)}` : "No Setup"),
          trades: 0,
          wins: 0,
          pnl: 0,
        };
      }
      map[key].trades += 1;
      if (t.pnl > 0) map[key].wins += 1;
      map[key].pnl += t.pnl;
    });

    return Object.values(map)
      .map((s) => ({
        name: s.name,
        trades: s.trades,
        winRate: s.trades > 0 ? (s.wins / s.trades) * 100 : 0,
        pnl: s.pnl,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades, setupMap]);

  // Performance Long vs Short — revela viés direcional
  const sideStats = useMemo(() => {
    const sides: Array<"long" | "short"> = ["long", "short"];
    return sides.map((side) => {
      const list = filteredTrades.filter((t) => t.side === side);
      const wins = list.filter((t) => t.pnl > 0).length;
      const pnl = list.reduce((sum, t) => sum + t.pnl, 0);
      return {
        side,
        trades: list.length,
        winRate: list.length > 0 ? (wins / list.length) * 100 : 0,
        pnl,
      };
    });
  }, [filteredTrades]);

  // Hook avançado consome apenas a lista filtrada
  const advStats = useAdvancedStats(filteredTrades);

  // ─── DISCIPLINA: streaks, frequência diária e "revenge trading" ───
  const disciplineStats = useMemo(() => {
    const sorted = [...filteredTrades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Sequências de vitórias/perdas consecutivas
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let runningWin = 0;
    let runningLoss = 0;

    sorted.forEach((t) => {
      if (t.pnl > 0) {
        runningWin += 1;
        runningLoss = 0;
      } else if (t.pnl < 0) {
        runningLoss += 1;
        runningWin = 0;
      } else {
        runningWin = 0;
        runningLoss = 0;
      }
      maxWinStreak = Math.max(maxWinStreak, runningWin);
      maxLossStreak = Math.max(maxLossStreak, runningLoss);
    });
    // Streak "atual" = a sequência no final da série filtrada (mais recente)
    const curWinStreak = runningWin;
    const curLossStreak = runningLoss;

    // Frequência diária de trades
    const perDay: Record<string, number> = {};
    sorted.forEach((t) => {
      const day = t.date.slice(0, 10);
      perDay[day] = (perDay[day] ?? 0) + 1;
    });
    const dayEntries = Object.entries(perDay);
    const avgTradesPerDay =
      dayEntries.length > 0
        ? dayEntries.reduce((sum, [, c]) => sum + c, 0) / dayEntries.length
        : 0;
    const maxTradesDayEntry = dayEntries.reduce(
      (best, entry) => (entry[1] > (best?.[1] ?? 0) ? entry : best),
      null as [string, number] | null,
    );
    const overtradingDays = dayEntries.filter(
      ([, c]) => c > OVERTRADING_DAILY_THRESHOLD,
    ).length;

    // P&L médio em dias de overtrading vs dias normais — prova (ou não) se
    // operar demais está custando dinheiro
    let overtradingPnl = 0;
    let overtradingCount = 0;
    let normalPnl = 0;
    let normalCount = 0;
    Object.entries(perDay).forEach(([day, count]) => {
      const dayPnl = sorted
        .filter((t) => t.date.slice(0, 10) === day)
        .reduce((sum, t) => sum + t.pnl, 0);
      if (count > OVERTRADING_DAILY_THRESHOLD) {
        overtradingPnl += dayPnl;
        overtradingCount += 1;
      } else {
        normalPnl += dayPnl;
        normalCount += 1;
      }
    });

    // Tempo médio entre o fechamento de um trade perdedor e a abertura do
    // próximo trade — gap curto e recorrente é sinal de revenge trading
    const gaps: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.pnl < 0 && current.exitDate) {
        const gap =
          new Date(next.date).getTime() - new Date(current.exitDate).getTime();
        if (gap >= 0) gaps.push(gap);
      }
    }
    const avgGapAfterLoss =
      gaps.length > 0 ? gaps.reduce((s, g) => s + g, 0) / gaps.length : 0;

    return {
      curWinStreak,
      curLossStreak,
      maxWinStreak,
      maxLossStreak,
      avgTradesPerDay,
      maxTradesDay: maxTradesDayEntry
        ? { date: maxTradesDayEntry[0], count: maxTradesDayEntry[1] }
        : null,
      overtradingDays,
      avgPnlOvertradingDay:
        overtradingCount > 0 ? overtradingPnl / overtradingCount : null,
      avgPnlNormalDay: normalCount > 0 ? normalPnl / normalCount : null,
      avgGapAfterLoss,
    };
  }, [filteredTrades]);

  // ─── RISCO: R Realizado vs R Planejado ───
  const riskStats = useMemo(() => {
    const withRisk = filteredTrades.filter(
      (t) => t.stopLoss && t.entry && t.size,
    );

    let plannedSum = 0;
    let plannedCount = 0;
    let realizedSum = 0;
    let realizedCount = 0;

    withRisk.forEach((t) => {
      const riskPerUnit = Math.abs(t.entry - (t.stopLoss as number));
      if (riskPerUnit <= 0) return;
      const riskAmount = riskPerUnit * (t.size || 1);

      if (t.takeProfit) {
        const rewardPerUnit = Math.abs((t.takeProfit as number) - t.entry);
        plannedSum += rewardPerUnit / riskPerUnit;
        plannedCount += 1;
      }

      realizedSum += t.pnl / riskAmount;
      realizedCount += 1;
    });

    return {
      avgPlannedR: plannedCount > 0 ? plannedSum / plannedCount : 0,
      avgRealizedR: realizedCount > 0 ? realizedSum / realizedCount : 0,
      sampleSize: realizedCount,
    };
  }, [filteredTrades]);

  // ─── CONSISTÊNCIA: curva de capital acumulada e duração do drawdown ───
  const equityStats = useMemo(() => {
    const sorted = [...filteredTrades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let running = 0;
    let peak = 0;
    let peakIndex = 0;
    let maxDrawdownLen = 0; // em nº de trades, do pico até a recuperação
    const curve: { index: number; date: string; equity: number }[] = [];

    sorted.forEach((t, i) => {
      running += t.pnl;
      curve.push({
        index: i,
        date: t.exitDate || t.date,
        equity: parseFloat(running.toFixed(2)),
      });

      if (running >= peak) {
        // Novo pico: fecha o drawdown anterior, se houver
        const drawdownLen = i - peakIndex;
        maxDrawdownLen = Math.max(maxDrawdownLen, drawdownLen);
        peak = running;
        peakIndex = i;
      }
    });
    // Caso ainda esteja em drawdown no último trade (ainda não recuperou)
    const stillInDrawdown = running < peak;
    const currentDrawdownLen = stillInDrawdown
      ? sorted.length - 1 - peakIndex
      : 0;

    // Desvio padrão do P&L diário (volatilidade dos resultados)
    const perDayPnl: Record<string, number> = {};
    sorted.forEach((t) => {
      const day = t.date.slice(0, 10);
      perDayPnl[day] = (perDayPnl[day] ?? 0) + t.pnl;
    });
    const dayValues = Object.values(perDayPnl);
    const meanDaily =
      dayValues.length > 0
        ? dayValues.reduce((s, v) => s + v, 0) / dayValues.length
        : 0;
    const variance =
      dayValues.length > 0
        ? dayValues.reduce((s, v) => s + (v - meanDaily) ** 2, 0) /
          dayValues.length
        : 0;
    const dailyStdDev = Math.sqrt(variance);

    return {
      curve,
      maxDrawdownLenTrades: Math.max(maxDrawdownLen, currentDrawdownLen),
      stillInDrawdown,
      dailyStdDev,
    };
  }, [filteredTrades]);

  // ─── PADRÕES EMOCIONAIS: performance agrupada por `emotion` ───
  const emotionStats = useMemo(() => {
    const map: Record<string, { trades: number; wins: number; pnl: number }> =
      {};
    filteredTrades.forEach((t) => {
      const tag = (t as any).emotion;
      if (!tag) return;
      if (!map[tag]) map[tag] = { trades: 0, wins: 0, pnl: 0 };
      map[tag].trades += 1;
      if (t.pnl > 0) map[tag].wins += 1;
      map[tag].pnl += t.pnl;
    });

    return Object.entries(map)
      .map(([emotion, v]) => ({
        emotion,
        trades: v.trades,
        winRate: v.trades > 0 ? (v.wins / v.trades) * 100 : 0,
        pnl: v.pnl,
      }))
      .sort((a, b) => a.pnl - b.pnl);
  }, [filteredTrades]);

  // ─── ERROS RECORRENTES: contagem + perda média por ocorrência ───
  const errorTagStats = useMemo(() => {
    const map: Record<string, { count: number; totalLoss: number }> = {};
    filteredTrades.forEach((trade) => {
      if (trade.pnl >= 0) return;
      const tags = trade.errorTags || (trade as any).errortags;
      if (!tags) return;
      tags.forEach((tag: string) => {
        if (!map[tag]) map[tag] = { count: 0, totalLoss: 0 };
        map[tag].count += 1;
        map[tag].totalLoss += Math.abs(trade.pnl);
      });
    });

    return Object.entries(map)
      .map(([tag, v]) => ({
        tag,
        count: v.count,
        totalLoss: v.totalLoss,
        avgLoss: v.count > 0 ? v.totalLoss / v.count : 0,
      }))
      .sort((a, b) => b.totalLoss - a.totalLoss);
  }, [filteredTrades]);

  // 1. Agrupamento Diário adaptado para ISO String (agora com contagem de trades)
  const dailyData = useMemo(() => {
    const map: Record<string, { pnl: number; trades: number }> = {};
    filteredTrades.forEach((t: Trade) => {
      const dateOnly = t.date.slice(0, 10);
      if (!map[dateOnly]) map[dateOnly] = { pnl: 0, trades: 0 };
      map[dateOnly].pnl += t.pnl;
      map[dateOnly].trades += 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date: date.slice(5),
        pnl: parseFloat(v.pnl.toFixed(2)),
        trades: v.trades,
      }));
  }, [filteredTrades]);

  // 2. Dia da Semana com cálculo do Tempo Médio embutido
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
    const durationSumMap: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };
    const durationCountMap: Record<number, number> = {
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

      if (t.exitDate) {
        const diff =
          new Date(t.exitDate).getTime() - new Date(t.date).getTime();
        if (diff > 0) {
          durationSumMap[day] += diff;
          durationCountMap[day] += 1;
        }
      }
    });

    return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      name: days[day],
      pnl: parseFloat(pnlMap[day].toFixed(2)),
      trades: countMap[day],
      avgDuration:
        durationCountMap[day] > 0
          ? durationSumMap[day] / durationCountMap[day]
          : 0,
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

  const handlePrintReport = () => {
    window.print();
  };

  /* ══════════════════════════════════════════════════════════════════════
      TOOLTIPS DENTRO DOS GRÁFICOS
  ══════════════════════════════════════════════════════════════════════ */
  function DailyTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    const tradeCount = payload[0].payload.trades;
    const isOvertrading = tradeCount > OVERTRADING_DAILY_THRESHOLD;
    return (
      <div className="bg-[#1a1d27] border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl space-y-1">
        <p className="text-muted-foreground mb-0.5">
          {payload[0].payload.date}
        </p>
        <span className={pnlColor(val)}>{fmtPnl(val)}</span>
        <div
          className={`flex items-center gap-1 ${isOvertrading ? "text-amber-400" : "text-muted-foreground"}`}
        >
          {isOvertrading && <AlertTriangle size={11} />}
          <span>
            {tradeCount} {tradeCount === 1 ? "trade" : "trades"}
            {isOvertrading ? " · overtrading?" : ""}
          </span>
        </div>
      </div>
    );
  }

  function WeekdayTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    const avgDur = payload[0].payload.avgDuration;
    return (
      <div className="bg-[#1a1d27] border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl space-y-1">
        <p className="text-muted-foreground font-medium border-b border-border/40 pb-1 mb-1">
          {payload[0].payload.name} ({payload[0].payload.trades} trades)
        </p>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">P&L Total:</span>
          <span className={pnlColor(val)}>{fmtPnl(val)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Tempo Médio:</span>
          <span className="text-sky-400 font-semibold">
            {fmtDuration(avgDur)}
          </span>
        </div>
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

  function EquityCurveTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    const date = payload[0].payload.date;
    return (
      <div className="bg-[#1a1d27] border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
        <p className="text-muted-foreground mb-0.5">
          {date ? new Date(date).toLocaleDateString() : ""}
        </p>
        <span className={pnlColor(val)}>{fmtPnl(val)}</span>
      </div>
    );
  }

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

  const maxStrategyPnl = Math.max(
    ...localStrategyStats.map((s) => Math.abs(s.pnl)),
    1,
  );
  const maxAssetPnl = Math.max(...assetStats.map((a) => Math.abs(a.pnl)), 1);
  const maxSetupPnl = Math.max(...setupStats.map((s) => Math.abs(s.pnl)), 1);
  const maxEmotionPnl = Math.max(
    ...emotionStats.map((e) => Math.abs(e.pnl)),
    1,
  );
  const longSide = sideStats.find((s) => s.side === "long") ?? {
    side: "long" as const,
    trades: 0,
    winRate: 0,
    pnl: 0,
  };
  const shortSide = sideStats.find((s) => s.side === "short") ?? {
    side: "short" as const,
    trades: 0,
    winRate: 0,
    pnl: 0,
  };

  return (
    <div className="space-y-5" id="print-stats-area">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-stats-area, #print-stats-area * { visibility: visible; }
          #print-stats-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; }
        }
      `}</style>

      {/* ─── FILTROS DE DATA E IMPRESSÃO ─── */}
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

      {/* Cabeçalho de Impressão */}
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

      {/* ─── CARDS ORIGINAIS INALTERADOS ─── */}
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
            tooltip="A proporção entre o lucro total e o prejuízo total."
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
            tooltip="O retorno matemático esperado por trade."
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
            tooltip="Mede o retorno ajustado ao risco."
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
            tooltip="Similar ao Sharpe, mas só penaliza a volatilidade negativa."
          />
          <StatCard
            label="Max Drawdown"
            value={`${advStats ? "-$" + advStats.maxDrawdown.val.toFixed(2) : "—"}`}
            sub="Peak to trough drop"
            tone="red"
            tooltip="O maior declínio absoluto da sua curva de capital."
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
            tooltip="Mostra quão bem o seu sistema se recupera de drawdowns."
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
            tooltip="Mede a rentabilidade anualizada em relação ao Risco Máximo."
          />
          <StatCard
            label="Ulcer Index"
            value={advStats ? advStats.ulcerIndex.val.toFixed(2) : "—"}
            sub="Drawdown depth & duration"
            tooltip="Mede a profundidade E a duração dos drawdowns."
          />
        </div>
      </div>

      {/* ─── NOVA SEÇÃO: TIME & TIMING PERFORMANCE INFO CARDS ─── */}
      <div className="bg-[#141722] border border-border/60 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 break-inside-avoid">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Tempo Médio Global
            </p>
            <p className="text-base font-semibold font-mono text-sky-400 mt-0.5">
              {fmtDuration(localStats.globalAvgDuration)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 border-t md:border-t-0 md:border-x border-border/40 py-2 md:py-0">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <BarChart3 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Dia Mais Eficiente
            </p>
            <p className="text-base font-semibold text-foreground mt-0.5">
              {weekdayData.reduce(
                (prev, current) => (current.pnl > prev.pnl ? current : prev),
                weekdayData[0],
              )?.name || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Ativo Mais Lucrativo
            </p>
            <p className="text-base font-semibold text-foreground mt-0.5 font-mono">
              {assetStats[0]?.symbol || "—"}{" "}
              <span className="text-xs text-emerald-400 font-normal">
                ({fmtPnl(assetStats[0]?.pnl || 0)})
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── NOVA SEÇÃO: DISCIPLINA & RISCO DE RUÍNA ─── */}
      <div className="bg-[#141722] border border-border/60 rounded-xl p-4 break-inside-avoid">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Flame size={14} className="text-orange-400" />
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Disciplina & Risco de Ruína
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 px-2">
            <div
              className={`p-2.5 rounded-lg ${
                disciplineStats.curLossStreak >= 3
                  ? "bg-red-500/10 text-red-400"
                  : disciplineStats.curWinStreak >= 3
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-secondary/40 text-muted-foreground"
              }`}
            >
              <Flame size={18} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Sequência Atual
              </p>
              <p
                className={`text-base font-semibold font-mono mt-0.5 ${
                  disciplineStats.curLossStreak > 0
                    ? "text-red-400"
                    : disciplineStats.curWinStreak > 0
                      ? "text-emerald-400"
                      : "text-foreground"
                }`}
              >
                {disciplineStats.curLossStreak > 0
                  ? `${disciplineStats.curLossStreak} perdas`
                  : disciplineStats.curWinStreak > 0
                    ? `${disciplineStats.curWinStreak} vitórias`
                    : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 border-t md:border-t-0 md:border-l border-border/40 pt-3 md:pt-0 md:pl-4">
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Maior Sequência de Perdas
              </p>
              <p className="text-base font-semibold font-mono text-red-400 mt-0.5">
                {disciplineStats.maxLossStreak}{" "}
                {disciplineStats.maxLossStreak === 1 ? "perda" : "perdas"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 border-t md:border-t-0 md:border-l border-border/40 pt-3 md:pt-0 md:pl-4">
            <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Target size={18} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                R Realizado / Planejado
              </p>
              <p className="text-base font-semibold font-mono mt-0.5">
                {riskStats.sampleSize > 0 ? (
                  <>
                    <span
                      className={
                        riskStats.avgRealizedR >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {riskStats.avgRealizedR.toFixed(2)}R
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {" "}
                      / {riskStats.avgPlannedR.toFixed(2)}R
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 border-t md:border-t-0 md:border-l border-border/40 pt-3 md:pt-0 md:pl-4">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Repeat size={18} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Gap Médio Pós-Perda
              </p>
              <p className="text-base font-semibold font-mono text-amber-400 mt-0.5">
                {disciplineStats.avgGapAfterLoss > 0
                  ? fmtDuration(disciplineStats.avgGapAfterLoss)
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-2 text-[11px] font-mono text-muted-foreground">
          <span>
            Média:{" "}
            <span className="text-foreground">
              {disciplineStats.avgTradesPerDay.toFixed(1)} trades/dia
            </span>
          </span>
          {disciplineStats.maxTradesDay && (
            <span>
              Pico:{" "}
              <span className="text-foreground">
                {disciplineStats.maxTradesDay.count} trades
              </span>{" "}
              em {disciplineStats.maxTradesDay.date}
            </span>
          )}
          {disciplineStats.overtradingDays > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <AlertTriangle size={12} />
              {disciplineStats.overtradingDays}{" "}
              {disciplineStats.overtradingDays === 1 ? "dia" : "dias"} acima de{" "}
              {OVERTRADING_DAILY_THRESHOLD} trades/dia
            </span>
          )}
          {disciplineStats.avgPnlOvertradingDay !== null &&
            disciplineStats.avgPnlNormalDay !== null && (
              <span>
                P&L médio nesses dias:{" "}
                <span
                  className={pnlColor(disciplineStats.avgPnlOvertradingDay)}
                >
                  {fmtPnl(disciplineStats.avgPnlOvertradingDay)}
                </span>{" "}
                vs dias normais:{" "}
                <span className={pnlColor(disciplineStats.avgPnlNormalDay)}>
                  {fmtPnl(disciplineStats.avgPnlNormalDay)}
                </span>
              </span>
            )}
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

      {/* Curva de Capital Acumulada — consistência e duração do drawdown */}
      <div className="bg-card border border-border rounded-xl p-5 break-inside-avoid">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Equity Curve (Capital Acumulado)
          </p>
          {equityStats.stillInDrawdown &&
            equityStats.maxDrawdownLenTrades > 0 && (
              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                <Activity size={11} />
                {equityStats.maxDrawdownLenTrades} trades em drawdown
              </span>
            )}
        </div>
        {equityStats.curve.length < 2 ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            Not enough data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={equityStats.curve}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={
                      equityStats.curve[equityStats.curve.length - 1].equity >=
                      0
                        ? "#34d399"
                        : "#f87171"
                    }
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={
                      equityStats.curve[equityStats.curve.length - 1].equity >=
                      0
                        ? "#34d399"
                        : "#f87171"
                    }
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis dataKey="index" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip content={(props) => <EquityCurveTooltip {...props} />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
              <Area
                type="monotone"
                dataKey="equity"
                stroke={
                  equityStats.curve[equityStats.curve.length - 1].equity >= 0
                    ? "#34d399"
                    : "#f87171"
                }
                strokeWidth={2}
                fill="url(#equityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        <p className="text-[10px] font-mono text-muted-foreground mt-3">
          Desvio padrão do P&L diário:{" "}
          <span className="text-foreground">
            {fmtPnl(equityStats.dailyStdDev)}
          </span>{" "}
          — quanto menor, mais consistentes os seus resultados dia a dia.
        </p>
      </div>

      {/* Linha 2 de Gráficos: Dia da Semana e Horários (Enriquecidos com dados de tempo no Tooltip) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 break-inside-avoid">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Day of Week P&L & Hold Time
            </p>
          </div>
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

      {/* ─── NOVA SEÇÃO MODIFICADA: TABELA COMPACTA DE ANÁLISE POR ATIVO (P&L + TEMPO MÉDIO) ─── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden break-inside-avoid">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Performance & Hold Time by Asset
          </p>
          <span className="text-[10px] font-mono text-muted-foreground">
            Sorted by Net P&L
          </span>
        </div>
        {assetStats.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            No data yet
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {assetStats.map((a) => (
              <div
                key={a.symbol}
                className="px-5 py-3.5 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold font-mono text-foreground tracking-wide w-16">
                      {a.symbol}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                      <span>
                        {a.trades} {a.trades === 1 ? "trade" : "trades"}
                      </span>
                      <span>·</span>
                      <span
                        className={
                          a.winRate >= 50
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }
                      >
                        {a.winRate.toFixed(0)}% WR
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-sky-400 bg-sky-500/5 px-1.5 py-0.5 rounded">
                        <Clock size={11} />{" "}
                        {fmtDuration(a.avgDuration) === "—"
                          ? "Live"
                          : fmtDuration(a.avgDuration) + " avg"}{" "}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${pnlColor(a.pnl)}`}
                  >
                    {fmtPnl(a.pnl)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${a.pnl >= 0 ? "bg-emerald-400/70" : "bg-red-400/70"}`}
                    style={{
                      width: `${(Math.abs(a.pnl) / maxAssetPnl) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance por Emoção — revela padrões comportamentais (campo `emotion`) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden break-inside-avoid">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Performance by Emotion
          </p>
          <span className="text-[10px] font-mono text-muted-foreground">
            Costliest first
          </span>
        </div>
        {emotionStats.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            No emotion data yet
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {emotionStats.map((e) => (
              <div
                key={e.emotion}
                className="px-5 py-3.5 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-foreground w-28 truncate">
                      {e.emotion}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                      <span>
                        {e.trades} {e.trades === 1 ? "trade" : "trades"}
                      </span>
                      <span>·</span>
                      <span
                        className={
                          e.winRate >= 50
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }
                      >
                        {e.winRate.toFixed(0)}% WR
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${pnlColor(e.pnl)}`}
                  >
                    {fmtPnl(e.pnl)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${e.pnl >= 0 ? "bg-emerald-400/70" : "bg-red-400/70"}`}
                    style={{
                      width: `${(Math.abs(e.pnl) / maxEmotionPnl) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gráfico de Erros */}
      <div className="bg-card border border-border rounded-xl p-5 break-inside-avoid">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">
          Loss Accumulated by Error Tag
        </p>
        <ErrorPerformance tradesList={filteredTrades} />
        {errorTagStats.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
            {errorTagStats.map((e) => (
              <div
                key={e.tag}
                className="flex items-center justify-between text-[11px] font-mono"
              >
                <span className="text-muted-foreground truncate max-w-[45%]">
                  {e.tag}
                </span>
                <div className="flex items-center gap-3 text-right shrink-0">
                  <span className="text-muted-foreground">{e.count}x</span>
                  <span className="text-amber-400/80">
                    -${e.avgLoss.toFixed(2)} méd.
                  </span>
                  <span className="text-red-400 font-semibold w-20 text-right">
                    -${e.totalLoss.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
              key={s?.name || uid()}
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
                  style={{
                    width: `${(Math.abs(s.pnl) / maxStrategyPnl) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabela de Setups — granularidade abaixo da Strategy */}
      <div className="bg-card border border-border rounded-xl overflow-hidden break-inside-avoid">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            By Setup
          </p>
        </div>
        {setupStats.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            No data yet
          </p>
        ) : (
          setupStats.map((s) => (
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
                  style={{
                    width: `${(Math.abs(s.pnl) / maxSetupPnl) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 break-inside-avoid">
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
        <StatCard
          label="Long P&L"
          value={fmtPnl(longSide.pnl)}
          sub={`${longSide.trades} trades · ${longSide.winRate.toFixed(0)}% WR`}
          tone={longSide.pnl >= 0 ? "green" : "red"}
        />
        <StatCard
          label="Short P&L"
          value={fmtPnl(shortSide.pnl)}
          sub={`${shortSide.trades} trades · ${shortSide.winRate.toFixed(0)}% WR`}
          tone={shortSide.pnl >= 0 ? "green" : "red"}
        />
      </div>
    </div>
  );
}

export default StatsPage;
