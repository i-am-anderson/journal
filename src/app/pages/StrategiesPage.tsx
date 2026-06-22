import { useState, useMemo } from "react";
import { Plus, Network, Search, AlertTriangle } from "lucide-react";
import { fmtPnl } from "../helpers/utils";
import StrategyCard from "../components/StrategyCard";
import StatCard from "../components/StatCard";

import { StrategiesPageProps, Trade, Strategy } from "../types";

type SortBy = "pnl" | "winRate" | "trades" | "name";

// Amostra mínima de trades para uma estratégia entrar no alerta de
// "underperforming". Abaixo disso, é cedo demais pra julgar.
const MIN_SAMPLE_FOR_WARNING = 5;

/* ══════════════════════════════════════════════════════════════════════
  PAGE — Strategies
══════════════════════════════════════════════════════════════════════ */
function StrategiesPage({
  strategies,
  trades,
  onAddStrategy,
  onEditStrategy,
  onDeleteStrategy,
}: StrategiesPageProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("pnl");

  // Calcula as estatísticas de cada estratégia baseando-se nos trades
  const strategyStats = useMemo(() => {
    const map: Record<string, { count: number; wins: number; pnl: number }> =
      {};

    trades.forEach((t: Trade) => {
      const stratKey = t.strategyId;
      if (!stratKey) return;

      if (!map[stratKey]) map[stratKey] = { count: 0, wins: 0, pnl: 0 };

      map[stratKey].count++;
      if (t.status === "win") map[stratKey].wins++;
      map[stratKey].pnl += t.pnl;
    });

    return map;
  }, [trades]);

  // Junta cada estratégia com suas estatísticas — preserva o fallback por
  // nome (trades legados que gravaram o nome em vez do id da estratégia)
  const enrichedStrategies = useMemo(() => {
    return strategies.map((strat: Strategy) => {
      const s = strategyStats[strat.id] ||
        strategyStats[strat.name] || { count: 0, wins: 0, pnl: 0 };
      return {
        strategy: strat,
        tradeCount: s.count,
        winRate: s.count > 0 ? (s.wins / s.count) * 100 : 0,
        pnl: s.pnl,
      };
    });
  }, [strategies, strategyStats]);

  // Aplica busca por nome + ordenação escolhida
  const visibleStrategies = useMemo(() => {
    const filtered = enrichedStrategies.filter((e) =>
      e.strategy.name.toLowerCase().includes(search.toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "pnl":
          return b.pnl - a.pnl;
        case "winRate":
          return b.winRate - a.winRate;
        case "trades":
          return b.tradeCount - a.tradeCount;
        case "name":
          return a.strategy.name.localeCompare(b.strategy.name);
        default:
          return 0;
      }
    });
  }, [enrichedStrategies, search, sortBy]);

  // Insights rápidos: melhor/pior/mais usada, e estratégias sangrando
  // dinheiro com amostra relevante (vale revisar ou descontinuar)
  const insights = useMemo(() => {
    const withTrades = enrichedStrategies.filter((e) => e.tradeCount > 0);
    if (withTrades.length === 0) return null;

    const best = withTrades.reduce((a, b) => (b.pnl > a.pnl ? b : a));
    const worst = withTrades.reduce((a, b) => (b.pnl < a.pnl ? b : a));
    const mostUsed = withTrades.reduce((a, b) =>
      b.tradeCount > a.tradeCount ? b : a,
    );
    const underperforming = withTrades
      .filter((e) => e.pnl < 0 && e.tradeCount >= MIN_SAMPLE_FOR_WARNING)
      .sort((a, b) => a.pnl - b.pnl);

    return { best, worst, mostUsed, underperforming };
  }, [enrichedStrategies]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {visibleStrategies.length}{" "}
          {visibleStrategies.length === 1 ? "strategy" : "strategies"}
          {search && ` de ${strategies.length}`} — Define your structural
          methods
        </p>
        <div className="flex items-center gap-2">
          {strategies.length > 0 && (
            <>
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search strategies..."
                  className="pl-7 pr-3 py-2 w-48 rounded-lg bg-card border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 rounded-lg bg-card border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
              >
                <option value="pnl">Sort: P&L</option>
                <option value="winRate">Sort: Win Rate</option>
                <option value="trades">Sort: Trade Count</option>
                <option value="name">Sort: Name</option>
              </select>
            </>
          )}
          <button
            onClick={onAddStrategy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-400/20 transition-colors border border-emerald-400/25"
          >
            <Plus size={14} />
            New Strategy
          </button>
        </div>
      </div>

      {insights && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Melhor Estratégia"
            value={insights.best.strategy.name}
            sub={`${fmtPnl(insights.best.pnl)} · ${insights.best.tradeCount} trades`}
            tone={insights.best.pnl >= 0 ? "green" : "red"}
          />
          <StatCard
            label="Pior Estratégia"
            value={insights.worst.strategy.name}
            sub={`${fmtPnl(insights.worst.pnl)} · ${insights.worst.tradeCount} trades`}
            tone={insights.worst.pnl >= 0 ? "green" : "red"}
          />
          <StatCard
            label="Mais Usada"
            value={insights.mostUsed.strategy.name}
            sub={`${insights.mostUsed.tradeCount} trades · ${insights.mostUsed.winRate.toFixed(0)}% WR`}
          />
        </div>
      )}

      {insights && insights.underperforming.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs font-mono text-amber-300 leading-relaxed">
            Estratégias no negativo com amostra relevante (≥{" "}
            {MIN_SAMPLE_FOR_WARNING} trades) — vale revisar a tese ou
            descontinuar:{" "}
            {insights.underperforming.map((e, i) => (
              <span key={e.strategy.id}>
                {i > 0 && ", "}
                <span className="font-semibold">{e.strategy.name}</span> (
                {fmtPnl(e.pnl)} em {e.tradeCount} trades)
              </span>
            ))}
          </p>
        </div>
      )}

      {strategies.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
          <Network size={28} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            No strategies yet
          </p>
          <p className="text-xs text-muted-foreground/60">
            Create your broad trading strategies (e.g., Trend Following, Mean
            Reversion).
          </p>
        </div>
      ) : visibleStrategies.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
          <Search size={28} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            No strategies match "{search}"
          </p>
          <p className="text-xs text-muted-foreground/60">
            Try a different search term
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleStrategies.map((e) => (
            <StrategyCard
              key={e.strategy.id}
              strategy={e.strategy}
              tradeCount={e.tradeCount}
              winRate={e.winRate}
              pnl={e.pnl}
              onEdit={onEditStrategy}
              onDelete={onDeleteStrategy}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default StrategiesPage;
