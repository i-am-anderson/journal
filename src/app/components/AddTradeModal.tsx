import { useState, useRef, useMemo } from "react";
import { AddTradeModalProps, Side } from "../types";
import { uid, pnlColor, fmtPnl } from "../helpers/utils";
import { X, Upload, Check } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════
  SHARED UI
══════════════════════════════════════════════════════════════════════ */
function AddTradeModal({
  accountId,
  setups,
  strategies,
  onClose,
  onSave,
  availableErrorTags,
  availableEmotions,
  initialTrade,
}: AddTradeModalProps) {
  // Calcula a data atual formatada para <input type="datetime-local">
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const defaultDateTime = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"

  // Se houver initialTrade (modo edição), converte o ISO salvo de volta para o formato do input local
  let initDateTime = defaultDateTime;
  if (initialTrade && initialTrade.date) {
    const d = new Date(initialTrade.date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    initDateTime = d.toISOString().slice(0, 16);
  }

  // Preenche o formulário com dados em branco (novo trade) ou dados do trade existente
  const [form, setForm] = useState({
    date: initDateTime,
    symbol: initialTrade?.symbol || "",
    side: initialTrade?.side || "long",
    entry: initialTrade?.entry || "",
    exit: initialTrade?.exit || "",
    size: initialTrade?.size || "",
    stopLoss: initialTrade?.stopLoss || "",
    takeProfit: initialTrade?.takeProfit || "",
    strategy: initialTrade?.strategy || strategies[0]?.name || "None",
    setupId: initialTrade?.setupId || setups[0]?.id || "",
    notes: initialTrade?.notes || "",
    errorTags: initialTrade?.errorTags || [],
    emotion: initialTrade?.emotion || "",
    images: initialTrade?.images || [],
  });

  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set(key: string, val: any) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  const livePnl = useMemo(() => {
    const e = parseFloat(form.entry as string),
      x = parseFloat(form.exit as string),
      s = parseFloat(form.size as string);
    if (!e || !x || !s || isNaN(e) || isNaN(x) || isNaN(s)) return null;
    const dir = form.side === "long" ? 1 : -1;
    return { val: (x - e) * s * dir, pct: ((x - e) / e) * 100 * dir };
  }, [form.entry, form.exit, form.size, form.side]);

  function readImages(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) =>
        setForm((prev: any) => ({
          ...prev,
          images: [...prev.images, ev.target?.result],
        }));
      reader.readAsDataURL(file);
    });
  }

  function submit() {
    const entry = parseFloat(form.entry as string),
      exit = parseFloat(form.exit as string),
      size = parseFloat(form.size as string);

    if (
      !form.symbol ||
      isNaN(entry) ||
      isNaN(exit) ||
      isNaN(size) ||
      !form.date
    )
      return;

    const dir = form.side === "long" ? 1 : -1;
    const pnl = parseFloat(((exit - entry) * size * dir).toFixed(2));
    const pnlPct = parseFloat(
      (((exit - entry) / entry) * 100 * dir).toFixed(2),
    );

    const finalIsoDate = new Date(form.date).toISOString();

    onSave({
      id: initialTrade?.id || uid(), // Se é edição mantém o ID, senão cria um novo!
      accountId: initialTrade?.accountId || accountId, // Mantém a conta original se for edição
      date: finalIsoDate,
      symbol: form.symbol.trim().toUpperCase(),
      side: form.side as Side,
      entry,
      exit,
      size,
      stopLoss: form.stopLoss ? parseFloat(form.stopLoss as string) : undefined,
      takeProfit: form.takeProfit
        ? parseFloat(form.takeProfit as string)
        : undefined,
      pnl,
      pnlPct,
      strategy: form.strategy,
      setupId: form.setupId,
      notes: form.notes.trim(),
      images: form.images,
      errorTags: form.errorTags,
      emotion: form.emotion,
      status: pnl > 0 ? "win" : pnl < 0 ? "loss" : "breakeven",
    });
  }

  const isValid =
    form.symbol.trim() &&
    form.entry &&
    !isNaN(parseFloat(form.entry as string)) &&
    form.exit &&
    !isNaN(parseFloat(form.exit as string)) &&
    form.size &&
    !isNaN(parseFloat(form.size as string)) &&
    form.date;

  const inputCls =
    "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40 transition-colors";

  // Textos dinâmicos dependendo se estamos criando ou editando
  const isEditing = !!initialTrade;
  const modalTitle = isEditing ? "Edit Trade" : "New Trade";
  const submitText = isEditing ? "Update Trade" : "Save Trade";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-sm tracking-tight">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className={`${inputCls} date-input`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Symbol
              </label>
              <input
                type="text"
                value={form.symbol}
                onChange={(e) => set("symbol", e.target.value)}
                placeholder="AAPL, BTC/USD…"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Direction
            </label>
            <div className="flex rounded-lg border border-border overflow-hidden w-fit">
              <button
                onClick={() => set("side", "long")}
                className={`px-8 py-2.5 text-sm font-mono font-medium transition-colors ${form.side === "long" ? "bg-emerald-400/15 text-emerald-400" : "bg-background text-muted-foreground hover:text-foreground"}`}
              >
                Long
              </button>
              <button
                onClick={() => set("side", "short")}
                className={`px-8 py-2.5 text-sm font-mono font-medium transition-colors ${form.side === "short" ? "bg-red-400/15 text-red-400" : "bg-background text-muted-foreground hover:text-foreground"}`}
              >
                Short
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Entry
              </label>
              <input
                type="number"
                value={form.entry}
                onChange={(e) => set("entry", e.target.value)}
                placeholder="0.00"
                step="any"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Exit
              </label>
              <input
                type="number"
                value={form.exit}
                onChange={(e) => set("exit", e.target.value)}
                placeholder="0.00"
                step="any"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                value={form.size}
                onChange={(e) => set("size", e.target.value)}
                placeholder="0"
                step="any"
                className={inputCls}
              />
            </div>
          </div>

          {livePnl !== null && (
            <div
              className={`rounded-xl border px-5 py-3.5 flex items-center justify-between ${livePnl.val >= 0 ? "border-emerald-400/20 bg-emerald-400/5" : "border-red-400/20 bg-red-400/5"}`}
            >
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
                Estimated P&L
              </span>
              <div className="text-right">
                <span
                  className={`font-mono text-lg font-semibold ${pnlColor(livePnl.val)}`}
                >
                  {fmtPnl(livePnl.val)}
                </span>
                <span
                  className={`block text-[10px] font-mono ${pnlColor(livePnl.pct)}`}
                >
                  {livePnl.pct >= 0 ? "+" : ""}
                  {livePnl.pct.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Stop Loss <span className="normal-case opacity-50">(opt.)</span>
              </label>
              <input
                type="number"
                value={form.stopLoss}
                onChange={(e) => set("stopLoss", e.target.value)}
                placeholder="0.00"
                step="any"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Take Profit{" "}
                <span className="normal-case opacity-50">(opt.)</span>
              </label>
              <input
                type="number"
                value={form.takeProfit}
                onChange={(e) => set("takeProfit", e.target.value)}
                placeholder="0.00"
                step="any"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Setup Playbook
            </label>
            {setups.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No setups defined yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                {setups.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set("setupId", s.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${form.setupId === s.id ? "border-current bg-opacity-10" : "border-border hover:border-border/80"}`}
                    style={
                      form.setupId === s.id
                        ? {
                            borderColor: s.color,
                            backgroundColor: s.color + "18",
                          }
                        : {}
                    }
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {s.timeframe} · {s.markets}
                    </span>
                    {form.setupId === s.id && (
                      <Check size={12} style={{ color: s.color }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Strategy Category
            </label>
            <select
              value={form.strategy}
              onChange={(e) => set("strategy", e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              {strategies.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* BLOCO: EMOCIONAL */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-2">
              Sentiment
            </label>
            <div className="flex flex-wrap gap-2">
              {availableEmotions.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => set("emotion", e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.emotion === e
                      ? "bg-emerald-400/10 border-emerald-400 text-emerald-400"
                      : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* BLOCO: TAGS DE ERRO */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-2">
              Error Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableErrorTags.map((tag: string) => {
                const isSelected = (form.errorTags as string[])?.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const current = form.errorTags || [];
                      const next = isSelected
                        ? current.filter((t: string) => t !== tag)
                        : [...current, tag];
                      set("errorTags", next);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-red-400/10 border-red-400 text-red-400"
                        : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Setup rationale, execution notes, lessons learned…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Chart Screenshots
            </label>
            <div
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                readImages(e.dataTransfer.files);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${dragOver ? "border-emerald-400/60 bg-emerald-400/5" : "border-border hover:border-emerald-400/40 hover:bg-secondary/40"}`}
            >
              <Upload size={18} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-center">
                Drop chart screenshots here or{" "}
                <span className="text-emerald-400">browse files</span>
              </p>
              <p className="text-[10px] text-muted-foreground/50">
                PNG, JPG, WebP — multiple files supported
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => readImages(e.target.files)}
            />
            {form.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.images.map((src, i) => (
                  <div
                    key={i}
                    className="relative group w-24 h-16 rounded-lg overflow-hidden border border-border"
                  >
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm((p: any) => ({
                          ...p,
                          images: p.images.filter(
                            (_: any, idx: number) => idx !== i,
                          ),
                        }));
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!isValid}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-400 text-black hover:bg-emerald-300 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddTradeModal;
