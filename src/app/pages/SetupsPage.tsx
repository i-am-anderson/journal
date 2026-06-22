import { useState, useMemo } from "react";
import SetupCard from "../components/SetupCard";
import StatCard from "../components/StatCard";
import { Plus, Layers, Search, AlertTriangle } from "lucide-react";
import { fmtPnl } from "../helpers/utils";

import { SetupsPageProps, Trade } from "../types";

type SortBy = "pnl" | "winRate" | "trades" | "name";

// Amostra mínima de trades para um setup entrar no alerta de "underperforming".
// Abaixo disso, é cedo demais pra julgar se o setup não funciona.
const MIN_SAMPLE_FOR_WARNING = 5;

/* ══════════════════════════════════════════════════════════════════════
   PAGE — Setups
══════════════════════════════════════════════════════════════════════ */
function SetupsPage({
  setups,
  trades,
  onAddSetup,
  onEditSetup,
  onDeleteSetup,
}: SetupsPageProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("pnl");

  const setupStats = useMemo(() => {
    const map: Record<string, { count: number; wins: number; pnl: number }> =
      {};
    trades.forEach((t: Trade) => {
      if (!t.setupId) return;
      if (!map[t.setupId]) map[t.setupId] = { count: 0, wins: 0, pnl: 0 };
      map[t.setupId].count++;
      if (t.status === "win") map[t.setupId].wins++;
      map[t.setupId].pnl += t.pnl;
    });
    return map;
  }, [trades]);

  // Junta cada setup com suas estatísticas — base para busca, ordenação e insights
  const enrichedSetups = useMemo(() => {
    return setups.map((setup) => {
      const s = setupStats[setup.id] ?? { count: 0, wins: 0, pnl: 0 };
      return {
        setup,
        tradeCount: s.count,
        winRate: s.count > 0 ? (s.wins / s.count) * 100 : 0,
        pnl: s.pnl,
      };
    });
  }, [setups, setupStats]);

  // Aplica busca por nome + ordenação escolhida
  const visibleSetups = useMemo(() => {
    const filtered = enrichedSetups.filter((e) =>
      e.setup.name.toLowerCase().includes(search.toLowerCase()),
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
          return a.setup.name.localeCompare(b.setup.name);
        default:
          return 0;
      }
    });
  }, [enrichedSetups, search, sortBy]);

  // Insights rápidos: melhor/pior/mais usado, e setups sangrando dinheiro
  // com amostra relevante (vale revisar ou descontinuar)
  const insights = useMemo(() => {
    const withTrades = enrichedSetups.filter((e) => e.tradeCount > 0);
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
  }, [enrichedSetups]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {visibleSetups.length}{" "}
          {visibleSetups.length === 1 ? "setup" : "setups"}
          {search && ` de ${setups.length}`} — click a card to view rules
        </p>
        <div className="flex items-center gap-2">
          {setups.length > 0 && (
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
                  placeholder="Search setups..."
                  className="pl-7 pr-3 py-2 w-44 rounded-lg bg-card border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
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
            onClick={onAddSetup}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-400/20 transition-colors border border-emerald-400/25"
          >
            <Plus size={14} />
            New Setup
          </button>
        </div>
      </div>

      {insights && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Melhor Setup"
            value={insights.best.setup.name}
            sub={`${fmtPnl(insights.best.pnl)} · ${insights.best.tradeCount} trades`}
            tone={insights.best.pnl >= 0 ? "green" : "red"}
          />
          <StatCard
            label="Pior Setup"
            value={insights.worst.setup.name}
            sub={`${fmtPnl(insights.worst.pnl)} · ${insights.worst.tradeCount} trades`}
            tone={insights.worst.pnl >= 0 ? "green" : "red"}
          />
          <StatCard
            label="Mais Usado"
            value={insights.mostUsed.setup.name}
            sub={`${insights.mostUsed.tradeCount} trades · ${insights.mostUsed.winRate.toFixed(0)}% WR`}
          />
        </div>
      )}

      {insights && insights.underperforming.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs font-mono text-amber-300 leading-relaxed">
            Setups no negativo com amostra relevante (≥ {MIN_SAMPLE_FOR_WARNING}{" "}
            trades) — vale revisar as regras ou descontinuar:{" "}
            {insights.underperforming.map((e, i) => (
              <span key={e.setup.id}>
                {i > 0 && ", "}
                <span className="font-semibold">{e.setup.name}</span> (
                {fmtPnl(e.pnl)} em {e.tradeCount} trades)
              </span>
            ))}
          </p>
        </div>
      )}

      {setups.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
          <Layers size={28} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No setups yet</p>
          <p className="text-xs text-muted-foreground/60">
            Create your first setup to link trades to your playbook
          </p>
        </div>
      ) : visibleSetups.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
          <Search size={28} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            No setups match "{search}"
          </p>
          <p className="text-xs text-muted-foreground/60">
            Try a different search term
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleSetups.map((e) => (
            <SetupCard
              key={e.setup.id}
              setup={e.setup}
              tradeCount={e.tradeCount}
              winRate={e.winRate}
              pnl={e.pnl}
              onEdit={onEditSetup}
              onDelete={onDeleteSetup}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SetupsPage;
