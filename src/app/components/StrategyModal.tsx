import { useState } from "react";
import { Check, X } from "lucide-react";
import { uid } from "../helpers/utils";
import { StrategyModalProps } from "../types";

/* ══════════════════════════════════════════════════════════════════════
  SHARED UI
══════════════════════════════════════════════════════════════════════ */
function StrategyModal({
  initial,
  onClose,
  onSave,
  colors,
}: StrategyModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [principles, setPrinciples] = useState(initial?.principles ?? [""]);
  const [color, setColor] = useState(initial?.color ?? colors[0]);

  function addPrinciple() {
    setPrinciples((p) => [...p, ""]);
  }
  function updatePrinciple(i: number, val: string) {
    setPrinciples((p) => p.map((x, idx) => (idx === i ? val : x)));
  }
  function removePrinciple(i: number) {
    setPrinciples((p) => p.filter((_, idx) => idx !== i));
  }

  function submit() {
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? uid(),
      name: name.trim(),
      description: description.trim(),
      principles: principles.map((p) => p.trim()).filter(Boolean),
      color,
    });
  }

  const inputCls =
    "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40 transition-colors";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-sm">
            {initial ? "Edit Strategy" : "New Strategy"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Strategy Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Trend Following, Mean Reversion…"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Color Identifier
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "#fff" : "transparent",
                  }}
                >
                  {color === c && (
                    <Check size={12} className="text-black mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Description / Core Thesis
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the broad methodology and logic behind this strategy…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40 transition-colors resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                Core Principles
              </label>
              <button
                onClick={addPrinciple}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                + Add principle
              </button>
            </div>
            <div className="space-y-2">
              {principles.map((principle, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ backgroundColor: color + "28", color }}
                  >
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={principle}
                    onChange={(e) => updatePrinciple(i, e.target.value)}
                    placeholder={`Principle ${i + 1}…`}
                    className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40 transition-colors"
                  />
                  {principles.length > 1 && (
                    <button
                      onClick={() => removePrinciple(i)}
                      className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
            style={{ backgroundColor: color, color: "#000" }}
          >
            {initial ? "Save Changes" : "Create Strategy"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StrategyModal;
