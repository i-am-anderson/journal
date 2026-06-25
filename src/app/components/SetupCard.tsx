import { fmtPnl, pnlColor } from "../helpers/utils";
import { Trash2, Edit2 } from "lucide-react";

import { SetupCardProps } from "../types";

/* ══════════════════════════════════════════════════════════════════════
  SHARED UI
══════════════════════════════════════════════════════════════════════ */
function SetupCard({
  setup,
  tradeCount,
  winRate,
  pnl,
  onEdit,
  onDelete,
}: SetupCardProps) {
  const timeframes = setup?.timeframe;
  const setupMarkets = setup?.markets;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="h-1" style={{ backgroundColor: setup?.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm leading-tight mb-1">
              {setup?.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {timeframes?.map((tf) => (
                <span
                  key={tf}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded border text-muted-foreground border-border"
                >
                  {tf}
                </span>
              ))}
              {setupMarkets.map((m) => (
                <span
                  key={m}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded border text-muted-foreground border-border"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(setup)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(setup.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {setup.description}
        </p>

        {setup.rules.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-2">
              Rules
            </p>
            <ul className="space-y-1.5">
              {setup.rules.slice(0, 2).map((rule, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-foreground/80"
                >
                  <span
                    className="mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[8px] font-bold"
                    style={{
                      backgroundColor: setup?.color + "28",
                      color: setup?.color,
                    }}
                  >
                    {i + 1}
                  </span>
                  {rule}
                </li>
              ))}
              {setup.rules.length > 2 && (
                <li className="text-[10px] font-mono text-muted-foreground/60 pl-4">
                  + {setup.rules.length - 2} more rules
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t border-border grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-0.5">
              Trades
            </p>
            <p className="font-mono text-sm font-semibold">{tradeCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-0.5">
              Win Rate
            </p>
            <p className="font-mono text-sm font-semibold">
              {tradeCount > 0 ? `${winRate.toFixed(0)}%` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-0.5">
              P&L
            </p>
            <p className={`font-mono text-sm font-semibold ${pnlColor(pnl)}`}>
              {tradeCount > 0 ? fmtPnl(pnl) : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupCard;
