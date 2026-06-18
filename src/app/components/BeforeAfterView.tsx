import { useMemo } from "react";
import { Calendar, ArrowRight, Eye, ImageOff } from "lucide-react";
import { Trade, Strategy, Setup } from "../types";
import { fmtPnl, pnlColor } from "../helpers/utils";

/* ══════════════════════════════════════════════════════════════════════
  SHARED UI
══════════════════════════════════════════════════════════════════════ */
interface BeforeAfterViewProps {
  trades: Trade[];
  strategies: Strategy[];
  setups: Setup[];
  onLightbox: (img: string) => void;
}

export default function BeforeAfterView({
  trades,
  strategies,
  setups,
  onLightbox,
}: BeforeAfterViewProps) {
  // Ordena os trades do mais recente para o mais antigo
  const chronologicalTrades = useMemo(() => {
    return [...trades].sort((a, b) => b.date.localeCompare(a.date));
  }, [trades]);

  if (chronologicalTrades.length === 0) {
    return (
      <div className="h-60 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-card/20 p-6 text-center">
        <ImageOff size={24} className="text-muted-foreground/60 mb-2" />
        <p className="text-sm text-muted-foreground">
          No trades found for this view.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {chronologicalTrades.map((trade) => {
        const beforeImg = trade.images?.[0];
        const afterImg = trade.images?.[1];

        // Formatação amigável de data local
        const dateObj = new Date(trade.date);
        const formattedDate = dateObj.toLocaleDateString(undefined, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const formattedTime = dateObj.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Encontra metadados (Setup e Cor)
        const matchingSetup = setups.find((s) => s.id === trade.setupId);

        return (
          <div
            key={trade.id}
            className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:border-border/80 transition-all"
          >
            {/* Header Técnico do Trade */}
            <div className="px-5 py-3.5 bg-secondary/20 border-b border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Ativo e Direção */}
                <span className="font-mono text-sm font-bold tracking-tight bg-background border border-border px-2.5 py-1 rounded-md">
                  {trade.symbol}
                </span>
                <span
                  className={`text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                    trade.side === "long"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-red-400/10 text-red-400"
                  }`}
                >
                  {trade.side}
                </span>

                {/* Tag do Setup Playbook */}
                {matchingSetup && (
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1.5"
                    style={{
                      backgroundColor: matchingSetup.color + "15",
                      color: matchingSetup.color,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: matchingSetup.color }}
                    />
                    {matchingSetup.name}
                  </span>
                )}
              </div>

              {/* Data e Resultado Financeiro */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Calendar size={13} />
                  <span>
                    {formattedDate} às {formattedTime}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono text-sm font-bold ${pnlColor(trade.pnl)}`}
                  >
                    {fmtPnl(trade.pnl)}
                  </span>
                  <span
                    className={`block text-[10px] font-mono text-right leading-none mt-0.5 ${pnlColor(trade.pnlPct)}`}
                  >
                    {trade.pnlPct >= 0 ? "+" : ""}
                    {trade.pnlPct.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Canvas de Comparação "Antes e Depois" */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-border bg-background/40">
              {/* LADO ESQUERDO: ANTES (ENTRADA) */}
              <div className="p-4 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-border relative">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1">
                  Step 1: Entry Setup (Antes)
                </span>

                {beforeImg ? (
                  <div
                    onClick={() => onLightbox(beforeImg)}
                    className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border bg-black/20 cursor-zoom-in group/img"
                  >
                    <img
                      src={beforeImg}
                      alt="Entry Setup"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-medium transition-opacity">
                      <Eye size={14} /> Zoom Chart
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[16/9] rounded-lg border border-dashed border-border flex flex-col items-center justify-center bg-secondary/10 text-muted-foreground/40 p-4">
                    <ImageOff size={20} className="mb-1" />
                    <span className="text-xs font-mono">
                      No entry chart uploaded
                    </span>
                  </div>
                )}

                {/* Dados da Entrada */}
                <div className="mt-1 flex items-center gap-4 text-xs font-mono text-muted-foreground">
                  <span>
                    Price:{" "}
                    <strong className="text-foreground">${trade.entry}</strong>
                  </span>
                  <span>
                    Size:{" "}
                    <strong className="text-foreground">{trade.size}</strong>
                  </span>
                </div>
              </div>

              {/* LADO DIREITO: DEPOIS (DESFECHO) */}
              <div className="p-4 flex flex-col gap-2 relative bg-emerald-400/[0.01]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1">
                  Step 2: Exit Outcome (Depois)
                </span>

                {afterImg ? (
                  <div
                    onClick={() => onLightbox(afterImg)}
                    className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border bg-black/20 cursor-zoom-in group/img"
                  >
                    <img
                      src={afterImg}
                      alt="Exit Outcome"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-medium transition-opacity">
                      <Eye size={14} /> Zoom Chart
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[16/9] rounded-lg border border-dashed border-border flex flex-col items-center justify-center bg-secondary/10 text-muted-foreground/40 p-4">
                    <ImageOff size={20} className="mb-1" />
                    <span className="text-xs font-mono">
                      No exit chart uploaded
                    </span>
                  </div>
                )}

                {/* Dados da Saída */}
                <div className="mt-1 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>
                      Exit:{" "}
                      <strong className="text-foreground">${trade.exit}</strong>
                    </span>
                    {trade.stopLoss && (
                      <span className="opacity-60">SL: ${trade.stopLoss}</span>
                    )}
                    {trade.takeProfit && (
                      <span className="opacity-60">
                        TP: ${trade.takeProfit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé: Notas de Execução e Tags Psicológicas/Erros */}
            {(trade.notes ||
              trade.emotion ||
              (trade.errorTags && trade.errorTags.length > 0)) && (
              <div className="px-5 py-4 bg-card space-y-3">
                {trade.notes && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50 block mb-0.5">
                      Execution Rationale & Lessons
                    </span>
                    {trade.notes}
                  </p>
                )}

                {/* Emocional & Erros Cometidos */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {trade.emotion && (
                    <span className="text-[10px] font-mono font-medium px-2 py-1 rounded bg-secondary border border-border text-foreground">
                      🧠 Sntmt: {trade.emotion}
                    </span>
                  )}
                  {trade.errorTags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono font-medium px-2 py-1 rounded bg-red-400/10 border border-red-400/20 text-red-400"
                    >
                      ⚠️ Error: {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
