import { useState } from "react";
import { Check, X } from "lucide-react";
import { uid } from "../helpers/utils";
import { SetupModalProps } from "../types";
import { MARKETS, SETUP_COLORS, TIMEFRAMES } from "../helpers/constants";

/* ══════════════════════════════════════════════════════════════════════
  SHARED UI
══════════════════════════════════════════════════════════════════════ */
function SetupModal({ initial, onClose, onSave }: SetupModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [rules, setRules] = useState(initial?.rules ?? [""]);
  const [timeframe, setTimeframe] = useState(initial?.timeframe ?? "Daily");
  const [markets, setMarkets] = useState(initial?.markets ?? "All");
  const [color, setColor] = useState(initial?.color ?? SETUP_COLORS[0]);

  function addRule() {
    setRules((r) => [...r, ""]);
  }
  function updateRule(i: number, val: string) {
    setRules((r) => r.map((x, idx) => (idx === i ? val : x)));
  }
  function removeRule(i: number) {
    setRules((r) => r.filter((_, idx) => idx !== i));
  }

  function submit() {
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? uid(),
      name: name.trim(),
      description: description.trim(),
      rules: rules.map((r) => r.trim()).filter(Boolean),
      timeframe,
      markets,
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
            {initial ? "Edit Setup" : "New Setup"}
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
              Setup Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bull Flag Breakout…"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {SETUP_COLORS.map((c) => (
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                {TIMEFRAMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Markets
              </label>
              <select
                value={markets}
                onChange={(e) => setMarkets(e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                {MARKETS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the setup concept and ideal conditions…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40 transition-colors resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                Entry Rules
              </label>
              <button
                onClick={addRule}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                + Add rule
              </button>
            </div>
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ backgroundColor: color + "28", color }}
                  >
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => updateRule(i, e.target.value)}
                    placeholder={`Rule ${i + 1}…`}
                    className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40 transition-colors"
                  />
                  {rules.length > 1 && (
                    <button
                      onClick={() => removeRule(i)}
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
            {initial ? "Save Changes" : "Create Setup"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetupModal;
