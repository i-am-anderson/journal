import { useMemo } from "react";
import { Plus, Network, Edit3, Trash2 } from "lucide-react";
import { fmtPnl, pnlColor } from "../helpers/utils";

import { StrategiesPageProps, Trade, Strategy } from "../types";

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {strategies.length}{" "}
          {strategies.length === 1 ? "strategy" : "strategies"} — Define your
          structural methods
        </p>
        <button
          onClick={onAddStrategy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-400/20 transition-colors border border-emerald-400/25"
        >
          <Plus size={14} />
          New Strategy
        </button>
      </div>

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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {strategies.map((strat: Strategy) => {
            // Busca estatísticas pelo ID ou pelo nome da estratégia (caso sejam trades legados)
            const stats = strategyStats[strat.id] ||
              strategyStats[strat.name] || { count: 0, wins: 0, pnl: 0 };
            const winRate =
              stats.count > 0 ? (stats.wins / stats.count) * 100 : 0;

            return (
              <div
                key={strat.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-border/80 transition-colors flex flex-col group relative"
              >
                {/* Header do Card */}
                <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: strat.color }}
                      />
                      <h3 className="font-semibold text-sm leading-tight">
                        {strat.name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {strat.description || "No description provided."}
                    </p>
                  </div>

                  {/* Ações Visíveis no Hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => onEditStrategy(strat)}
                      className="p-1.5 text-muted-foreground hover:text-emerald-400 transition-colors rounded-md hover:bg-emerald-400/10"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteStrategy(strat.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors rounded-md hover:bg-red-400/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Métricas */}
                <div className="px-5 py-3 bg-secondary/30 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-0.5">
                      Trades
                    </p>
                    <p className="font-mono text-sm font-medium">
                      {stats.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-0.5">
                      Win Rate
                    </p>
                    <p className="font-mono text-sm font-medium">
                      {winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-0.5">
                      Net P&L
                    </p>
                    <p
                      className={`font-mono text-sm font-medium ${pnlColor(stats.pnl)}`}
                    >
                      {fmtPnl(stats.pnl)}
                    </p>
                  </div>
                </div>

                {/* Princípios (Opcional: mostra até 2 para não alongar muito o card) */}
                {strat.principles && strat.principles.length > 0 && (
                  <div className="px-5 py-4 border-t border-border flex-1">
                    <ul className="space-y-2">
                      {strat.principles.slice(0, 2).map((principle, idx) => (
                        <li
                          key={idx}
                          className="flex gap-2 text-xs text-muted-foreground"
                        >
                          <span
                            className="text-[10px] font-mono pt-0.5"
                            style={{ color: strat.color }}
                          >
                            {idx + 1}.
                          </span>
                          <span className="leading-relaxed truncate">
                            {principle}
                          </span>
                        </li>
                      ))}
                      {strat.principles.length > 2 && (
                        <li className="text-[10px] font-mono text-muted-foreground/60 pl-4">
                          + {strat.principles.length - 2} more principles
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StrategiesPage;
