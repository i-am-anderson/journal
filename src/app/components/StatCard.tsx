import { Info } from "lucide-react";

import { StatCardProps } from "../types";

/* ══════════════════════════════════════════════════════════════════════
  SHARED UI
══════════════════════════════════════════════════════════════════════ */
function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
  tooltip,
  rating,
}: StatCardProps) {
  const colorClass =
    tone === "green"
      ? "text-emerald-400"
      : tone === "red"
        ? "text-red-400"
        : "text-foreground";

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1.5 relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 cursor-help">
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
          {tooltip && (
            <Info
              size={12}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            />
          )}
        </div>

        {rating && (
          <span
            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${rating.color}`}
          >
            {rating.label}
          </span>
        )}
      </div>

      <span
        className={`text-2xl font-mono font-semibold leading-none mt-1 ${colorClass}`}
      >
        {value}
      </span>

      {sub && (
        <span className="text-xs text-muted-foreground mt-0.5">{sub}</span>
      )}

      {/* Tooltip Popover (aparece no hover) */}
      {tooltip && (
        <div className="absolute left-0 -top-2 -translate-y-full w-64 bg-[#1a1d27] border border-border rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl pointer-events-none">
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {tooltip}
          </p>
          <div className="absolute -bottom-1.5 left-5 w-3 h-3 bg-[#1a1d27] border-b border-r border-border rotate-45" />
        </div>
      )}
    </div>
  );
}

export default StatCard;
