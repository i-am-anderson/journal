import {
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  ZoomIn,
  Printer,
  Pencil,
} from "lucide-react";
import { fmtDate, fmtPnl, fmtTime, pnlColor } from "../helpers/utils";

import { JournalPageProps, TradesView } from "../types";
import { useState } from "react";

/* ══════════════════════════════════════════════════════════════════════
  PAGE — Journal
══════════════════════════════════════════════════════════════════════ */
function JournalPage({
  trades,
  setups,
  strategies,
  expandedId,
  setExpandedId,
  onDelete,
  onEditRequest,
  onLightbox,
  searchQuery,
  setSearchQuery,
  filterSide,
  setFilterSide,
  filterStrategy,
  setFilterStrategy,
  filterStatus,
  setFilterStatus,
  filterSetup,
  setFilterSetup,
  filterDay,
  setFilterDay,
  days,
  displayMode,
  setDisplayMode,
}: JournalPageProps) {
  const setupMap = Object.fromEntries(setups.map((s) => [s.id, s]));
  const strategyMap = Object.fromEntries(strategies.map((s) => [s.id, s]));

  // Função dedicada para gerar e imprimir o relatório do trade de forma limpa
  const handlePrint = (trade: any) => {
    const setup = setupMap[trade.setupId];
    const strategy = strategyMap[trade.strategyId];
    const plannedRR =
      trade.stopLoss && trade.takeProfit && trade.entry
        ? (
            Math.abs(trade.takeProfit - trade.entry) /
            Math.abs(trade.entry - trade.stopLoss)
          ).toFixed(2)
        : "N/A";

    const printWindow = window.open("", "_blank", "width=850,height=700");
    if (!printWindow) {
      alert(
        "Por favor, permita pop-ups para conseguir imprimir o relatório do trade.",
      );
      return;
    }

    // Estrutura as imagens para o HTML de impressão
    const imagesHtml =
      trade.images && trade.images.length > 0
        ? `
        <div class="section">
          <h3>Chart Screenshots</h3>
          <div class="image-container">
            ${trade.images
              .map(
                (src: string, idx: number) => `
              <div class="image-wrapper">
                <p class="img-label">Screenshot #${idx + 1}</p>
                <img src="${src}" alt="Chart Screenshot ${idx + 1}" />
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `
        : "";

    // Injeta um HTML com estilo otimizado para papel (fundo claro, fontes nítidas)
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trade Report - ${trade.symbol} (${trade.date})</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #18181b;
              background-color: #ffffff;
              line-height: 1.5;
              padding: 30px;
              margin: 0;
            }
            .header {
              border-bottom: 2px solid #e4e4e7;
              padding-bottom: 16px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .header-main h1 {
              margin: 0;
              font-size: 26px;
              font-weight: 700;
              letter-spacing: -0.02em;
            }
            .header-meta {
              display: flex;
              gap: 8px;
              margin-top: 8px;
            }
            .date-badge {
              font-family: monospace;
              color: #71717a;
              font-size: 14px;
              font-weight: 600;
            }
            .badge {
              display: inline-block;
              padding: 3px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              border: 1px solid #e4e4e7;
              font-family: monospace;
            }
            .badge.long { color: #10b981; border-color: #a7f3d0; background-color: #ecfdf5; }
            .badge.short { color: #ef4444; border-color: #fca5a5; background-color: #fef2f2; }
            .badge.win { color: #10b981; border-color: #a7f3d0; background-color: #ecfdf5; }
            .badge.loss { color: #ef4444; border-color: #fca5a5; background-color: #fef2f2; }
            
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin-bottom: 24px;
            }
            .grid-item {
              border: 1px solid #e4e4e7;
              padding: 12px 14px;
              border-radius: 8px;
              background-color: #fafafa;
            }
            .grid-item .label {
              font-size: 10px;
              text-transform: uppercase;
              vertical-align: middle;
              letter-spacing: 0.05em;
              color: #71717a;
              margin-bottom: 4px;
              font-family: monospace;
            }
            .grid-item .value {
              font-size: 15px;
              font-weight: 700;
              font-family: monospace;
            }
            .pnl-win { color: #10b981; }
            .pnl-loss { color: #ef4444; }
            
            .section {
              margin-bottom: 24px;
              page-break-inside: avoid;
            }
            .section h3 {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #71717a;
              border-bottom: 1px solid #e4e4e7;
              padding-bottom: 6px;
              margin-bottom: 10px;
              font-family: monospace;
            }
            .notes-content {
              background: #f4f4f5;
              border-left: 4px solid #a1a1aa;
              padding: 12px 16px;
              border-radius: 0 8px 8px 0;
              font-size: 13px;
              color: #27272a;
              white-space: pre-wrap;
            }
            .image-container {
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            .image-wrapper {
              page-break-inside: avoid;
              margin-bottom: 10px;
            }
            .img-label {
              font-size: 11px;
              font-family: monospace;
              color: #71717a;
              margin: 0 0 6px 0;
            }
            .image-container img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              border: 1px solid #e4e4e7;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-main">
              <h1>${trade.symbol} <span class="badge ${trade.side}">${trade.side}</span></h1>
              <div class="header-meta">
                <span class="badge ${trade.status}">${trade.status}</span>
                ${setup ? `<span class="badge" style="color: ${setup?.color}; border-color: ${setup?.color}55; background-color: ${setup?.color}10;">Setup: ${setup?.name}</span>` : ""}
                <span class="badge" style="color: ${strategy?.color}; border-color: ${strategy?.color}55; background-color: ${strategy?.color}10;">Strategy: ${trade.strategyId ? strategy?.name : trade.strategy}</span>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="date-badge">In: ${fmtDate(trade.date)} ${fmtTime(trade.date)}</div>
              ${trade.exitDate ? `<div class="date-badge" style="margin-top: 4px;">Out: ${fmtDate(trade.exitDate)} ${fmtTime(trade.exitDate)}</div>` : ""}
            </div>
          </div>

          <div class="grid">
            <div class="grid-item">
              <div class="label">Entry Price</div>
              <div class="value">$${trade.entry.toFixed(2)}</div>
            </div>
            <div class="grid-item">
              <div class="label">Exit Price</div>
              <div class="value">$${trade.exit.toFixed(2)}</div>
            </div>
            <div class="grid-item">
              <div class="label">P&L (% / $)</div>
              <div class="value ${trade.pnl >= 0 ? "pnl-win" : "pnl-loss"}">
                ${trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)} (${trade.pnlPct >= 0 ? "+" : ""}${trade.pnlPct.toFixed(2)}%)
              </div>
            </div>
            <div class="grid-item">
              <div class="label">Stop Loss</div>
              <div class="value" style="color: #ef4444;">${trade.stopLoss ? `$${trade.stopLoss.toFixed(2)}` : "N/A"}</div>
            </div>
            <div class="grid-item">
              <div class="label">Take Profit</div>
              <div class="value" style="color: #10b981;">${trade.takeProfit ? `$${trade.takeProfit.toFixed(2)}` : "N/A"}</div>
            </div>
            <div class="grid-item">
              <div class="label">Planned R/R</div>
              <div class="value">${plannedRR}R</div>
            </div>
            <div class="grid-item">
              <div class="label">Market</div>
              <div class="value">${trade.market || "N/A"}</div>
            </div>
            <div class="grid-item">
              <div class="label">Timeframe</div>
              <div class="value">${trade.timeframe || "N/A"}</div>
            </div>
          </div>

          ${
            trade.notes
              ? `
            <div class="section">
              <h3>Notes / Log</h3>
              <div class="notes-content">${trade.notes}</div>
            </div>
          `
              : ""
          }

          ${imagesHtml}

          <script>
            // Força a janela a aguardar o carregamento completo de mídias/imagens antes de abrir o print dialog
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Symbol or strategy…"
            className="pl-8 pr-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40 w-48"
          />
        </div>

        {/* Filtro: Side */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {["all", "long", "short"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSide(s)}
              className={`px-3 py-2 text-xs font-mono capitalize transition-colors ${filterSide === s ? "bg-emerald-400/15 text-emerald-400" : "bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Filtro: Status */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {["all", "win", "loss"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-mono capitalize transition-colors ${filterStatus === s ? (s === "loss" ? "bg-red-400/15 text-red-400" : "bg-emerald-400/15 text-emerald-400") : "bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={filterStrategy}
          onChange={(e) => setFilterStrategy(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
        >
          <option value="all">All Strategies</option>
          {strategies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={filterSetup}
          onChange={(e) => setFilterSetup(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
        >
          <option value="all">All Setups</option>
          {setups.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
        >
          <option value="all">Every day</option>
          {days.map((day, index) => (
            <option key={index} value={index}>
              {day}
            </option>
          ))}
        </select>

        {/* ─── AQUI ENTRA O SEU DISPLAY MODE COMPACT / PLAYBOOK ─── */}
        <div className="flex rounded-lg border border-border overflow-hidden ml-auto">
          <button
            onClick={() => setDisplayMode("compact")}
            className={`px-3 py-2 text-xs font-mono transition-colors ${displayMode === "compact" ? "bg-emerald-400/15 text-emerald-400" : "bg-card text-muted-foreground hover:text-foreground"}`}
          >
            Compact
          </button>
          <button
            onClick={() => setDisplayMode("playbook")}
            className={`px-3 py-2 text-xs font-mono transition-colors ${displayMode === "playbook" ? "bg-emerald-400/15 text-emerald-400" : "bg-card text-muted-foreground hover:text-foreground"}`}
          >
            Playbook
          </button>
        </div>

        <span className="text-xs font-mono text-muted-foreground ml-2">
          {trades.length} {trades.length === 1 ? "trade" : "trades"}
        </span>
      </div>

      {trades.length === 0 && (
        <div className="bg-card border border-border rounded-xl py-16 text-center text-sm text-muted-foreground">
          No trades match your filters
        </div>
      )}

      {/* ─── CONDICIONAL DE RENDERIZAÇÃO BASEADA NO DISPLAYMODE ─── */}
      {trades.length > 0 && displayMode === "compact" ? (
        /* MODO COMPACT: Tabela clássica em lista */
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-3 border-b border-border">
            <span className="w-28 shrink-0 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
              Date
            </span>
            <span className="w-28 shrink-0 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
              Time
            </span>
            <span className="w-20 shrink-0 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
              Symbol
            </span>
            <span className="w-14 shrink-0 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
              Side
            </span>
            <span className="w-24 shrink-0 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
              Entry
            </span>
            <span className="w-24 shrink-0 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
              Exit
            </span>
            <span className="flex-1 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
              Setup / Strategy
            </span>
            <span className="w-28 shrink-0 text-right text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
              P&L
            </span>
            <span className="w-8 shrink-0"></span>
          </div>

          {trades.map((trade) => {
            const setup = setupMap[trade.setupId];
            const strategy = strategyMap[trade.strategyId];
            return (
              <div key={trade.id}>
                <div
                  className="flex items-center gap-4 px-5 py-3.5 border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() =>
                    setExpandedId(expandedId === trade.id ? null : trade.id)
                  }
                >
                  <span className="w-28 shrink-0 text-xs font-mono text-muted-foreground">
                    {fmtDate(trade.date)}
                  </span>
                  <span className="w-28 shrink-0 text-xs font-mono text-muted-foreground">
                    {fmtTime(trade.date)}
                  </span>
                  <span className="w-20 shrink-0 font-mono text-sm font-semibold">
                    {trade.symbol}
                  </span>
                  <div className="w-14 shrink-0">
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full border ${trade.side === "long" ? "text-emerald-400 border-emerald-400/25 bg-emerald-400/10" : "text-red-400 border-red-400/25 bg-red-400/10"}`}
                    >
                      {trade.side}
                    </span>
                  </div>
                  <span className="w-24 shrink-0 font-mono text-sm">
                    ${trade.entry.toFixed(2)}
                  </span>
                  <span className="w-24 shrink-0 font-mono text-sm">
                    ${trade.exit.toFixed(2)}
                  </span>
                  <div className="flex-1 min-w-0 flex gap-2 items-center">
                    {setup && (
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                        style={{
                          color: setup?.color,
                          borderColor: setup?.color + "44",
                          backgroundColor: setup?.color + "18",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: setup?.color }}
                        />
                        {setup?.name}
                      </span>
                    )}
                    <span
                      className="text-xs text-muted-foreground font-mono bg-secondary/40 px-2 py-0.5 rounded border border-border"
                      style={{
                        color: strategy?.color,
                        borderColor: strategy?.color + "44",
                        backgroundColor: strategy?.color + "18",
                      }}
                    >
                      {strategy?.name || trade.strategyId || "No Strategy"}
                    </span>
                  </div>
                  <div className="w-28 shrink-0 text-right">
                    <span
                      className={`font-mono text-sm font-semibold block ${pnlColor(trade.pnl)}`}
                    >
                      {fmtPnl(trade.pnl)}
                    </span>
                    <span
                      className={`font-mono text-[10px] ${pnlColor(trade.pnlPct)}`}
                    >
                      {trade.pnlPct >= 0 ? "+" : ""}
                      {trade.pnlPct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-8 shrink-0 flex justify-end text-muted-foreground">
                    {expandedId === trade.id ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </div>
                </div>

                {expandedId === trade.id && (
                  <div className="px-5 pb-5 pt-4 bg-secondary/20 border-b border-border">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-5 mb-4">
                      {trade.stopLoss && (
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                            Stop Loss
                          </p>
                          <p className="font-mono text-sm text-red-400">
                            ${trade.stopLoss.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {trade.takeProfit && (
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                            Take Profit
                          </p>
                          <p className="font-mono text-sm text-emerald-400">
                            ${trade.takeProfit.toFixed(2)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                          Status
                        </p>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${trade.status === "win" ? "text-emerald-400 border-emerald-400/25 bg-emerald-400/10" : trade.status === "loss" ? "text-red-400 border-red-400/25 bg-red-400/10" : "text-zinc-400 border-zinc-600/25 bg-zinc-700/10"}`}
                        >
                          {trade.status}
                        </span>
                      </div>

                      {/* EXIT DATE */}
                      {trade.exitDate && (
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                            Exit Date
                          </p>
                          <p className="text-sm font-mono text-foreground font-semibold">
                            {fmtDate(trade.exitDate)}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              {fmtTime(trade.exitDate)}
                            </span>
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                          Strategy Focus
                        </p>
                        <p className="text-sm font-mono text-foreground font-semibold">
                          {trade.strategyId
                            ? strategyMap[trade.strategyId]?.name ||
                              "Unknown Strategy"
                            : "No Strategy"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                          Setup
                        </p>
                        <p className="text-sm font-mono text-foreground font-semibold">
                          {trade.setupId
                            ? setupMap[trade.setupId]?.name || "Unknown Setup"
                            : "No Setup"}
                        </p>
                      </div>

                      {/* NOVOS CAMPOS: MARKET E TIMEFRAME */}
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                          Market
                        </p>
                        <p className="text-sm font-mono text-foreground font-semibold">
                          {trade.market || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                          Timeframe
                        </p>
                        <p className="text-sm font-mono text-foreground font-semibold">
                          {trade.timeframe || "N/A"}
                        </p>
                      </div>

                      {trade.stopLoss && trade.takeProfit && trade.entry && (
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                            Planned R/R
                          </p>
                          <p className="font-mono text-sm">
                            {(
                              Math.abs(trade.takeProfit - trade.entry) /
                              Math.abs(trade.entry - trade.stopLoss)
                            ).toFixed(2)}
                            R
                          </p>
                        </div>
                      )}
                    </div>

                    {trade.notes && (
                      <div className="mb-4">
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1.5">
                          Notes
                        </p>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {trade.notes}
                        </p>
                      </div>
                    )}

                    {trade.images && trade.images.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-2">
                          Chart Screenshots
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {trade.images.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => onLightbox(src)}
                              className="relative group w-28 h-20 rounded-lg overflow-hidden border border-border hover:border-emerald-400/40 transition-colors"
                            >
                              <img
                                src={src}
                                alt={`Chart ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn size={16} className="text-white" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end items-center gap-4 pt-1">
                      <button
                        onClick={() => onEditRequest(trade)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-400 transition-colors"
                      >
                        <Pencil size={12} />
                        Edit Trade
                      </button>
                      <button
                        onClick={() => handlePrint(trade)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-400 transition-colors"
                      >
                        <Printer size={12} />
                        Print Trade
                      </button>
                      <button
                        onClick={() => onDelete(trade.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                        Delete Trade
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* MODO PLAYBOOK: Grade de Cards Visuais focados nos Gráficos/Notas */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trades.map((trade) => {
            const setup = setupMap[trade.setupId];
            const strategy = strategyMap[trade.strategyId];
            return (
              <div
                key={trade.id}
                className="bg-card border border-border rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Imagem de Capa do Card se houver screenshot */}
                  {trade.images && trade.images.length > 0 ? (
                    <div
                      className="w-full h-48 relative border-b border-border cursor-pointer group overflow-hidden bg-secondary/30"
                      onClick={() =>
                        trade.images?.[0] && onLightbox(trade.images[0])
                      }
                    >
                      <img
                        src={trade.images?.[0]}
                        alt="Primary Chart"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-muted-foreground">
                        +{trade.images?.length || 0} view
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-secondary/10 border-b border-border">
                      <img
                        src={"logo.png"}
                        alt="Primary Chart"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Detalhes Principais */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-mono font-bold tracking-tight">
                            {trade.symbol}
                          </h4>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${trade.side === "long" ? "text-emerald-400 border-emerald-400/25 bg-emerald-400/10" : "text-red-400 border-red-400/25 bg-red-400/10"}`}
                          >
                            {trade.side}
                          </span>
                        </div>

                        {/* EXIT DATE NO PLAYBOOK */}
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">
                          In: {fmtDate(trade.date)} {fmtTime(trade.date)}
                          {trade.exitDate && (
                            <span className="block opacity-75">
                              Out: {fmtDate(trade.exitDate)}{" "}
                              {fmtTime(trade.exitDate)}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono text-base font-bold block ${pnlColor(trade.pnl)}`}
                        >
                          {fmtPnl(trade.pnl)}
                        </span>
                        <span
                          className={`font-mono text-xs ${pnlColor(trade.pnlPct)}`}
                        >
                          {trade.pnlPct >= 0 ? "+" : ""}
                          {trade.pnlPct.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {trade.market && (
                        <span className="text-[10px] text-muted-foreground font-mono bg-secondary/20 px-2 py-0.5 rounded border border-border">
                          {trade.market}
                        </span>
                      )}
                      {trade.timeframe && (
                        <span className="text-[10px] text-muted-foreground font-mono bg-secondary/20 px-2 py-0.5 rounded border border-border">
                          {trade.timeframe}
                        </span>
                      )}
                      {setup && (
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                          style={{
                            color: setup?.color,
                            borderColor: setup?.color + "44",
                            backgroundColor: setup?.color + "18",
                          }}
                        >
                          {setup?.name}
                        </span>
                      )}
                      <span
                        className="text-[10px] text-muted-foreground font-mono bg-secondary/40 px-2 py-0.5 rounded border border-border"
                        style={{
                          color: strategy?.color,
                          borderColor: strategy?.color + "44",
                          backgroundColor: strategy?.color + "18",
                        }}
                      >
                        {strategy?.name || trade.strategyId || "No Strategy"}
                      </span>
                    </div>

                    {/* Notas Rápidas */}
                    {trade.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-3 bg-secondary/10 p-2.5 rounded border border-border/50">
                        {trade.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ações inferiores do Card */}
                <div className="p-4 flex justify-between items-center border-t border-border/40 mt-2">
                  <div className="text-[11px] font-mono text-muted-foreground">
                    In:{" "}
                    <span className="text-foreground">
                      ${trade.entry.toFixed(2)}
                    </span>{" "}
                    · Out:{" "}
                    <span className="text-foreground">
                      ${trade.exit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onEditRequest(trade)}
                      className="text-muted-foreground hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handlePrint(trade)}
                      className="text-muted-foreground hover:text-emerald-400 transition-colors"
                      title="Print"
                    >
                      <Printer size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(trade.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JournalPage;
