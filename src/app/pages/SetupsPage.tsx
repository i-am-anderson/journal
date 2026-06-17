import { useMemo } from "react";
import SetupCard from "../components/SetupCard";
import { Plus, Layers } from "lucide-react";

import { SetupsPageProps, Trade } from "../types";

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {setups.length} {setups.length === 1 ? "setup" : "setups"} — click a
          card to view rules
        </p>
        <button
          onClick={onAddSetup}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-400/20 transition-colors border border-emerald-400/25"
        >
          <Plus size={14} />
          New Setup
        </button>
      </div>

      {setups.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
          <Layers size={28} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No setups yet</p>
          <p className="text-xs text-muted-foreground/60">
            Create your first setup to link trades to your playbook
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {setups.map((setup) => {
            const s = setupStats[setup.id] ?? { count: 0, wins: 0, pnl: 0 };
            return (
              <SetupCard
                key={setup.id}
                setup={setup}
                tradeCount={s.count}
                winRate={s.count > 0 ? (s.wins / s.count) * 100 : 0}
                pnl={s.pnl}
                onEdit={onEditSetup}
                onDelete={onDeleteSetup}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SetupsPage;
