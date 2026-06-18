import { useState } from "react";
import { Plus, X, Calendar, Clock, Globe, Palette, Heart } from "lucide-react";

import { ConfigsPageProps } from "../types";

/* ══════════════════════════════════════════════════════════════════════
  PAGE — Configs
══════════════════════════════════════════════════════════════════════ */
export default function ConfigsPage({
  days,
  setDays,
  timeframes,
  setTimeframes,
  markets,
  setMarkets,
  colors,
  setColors,
  errorTags,
  setErrorTags,
  emotions,
  setEmotions,
}: ConfigsPageProps) {
  const [newTimeframe, setNewTimeframe] = useState("");
  const [newMarket, setNewMarket] = useState("");
  const [newColor, setNewColor] = useState("#ffffff");
  const [newErrorTag, setNewErrorTag] = useState("");
  const [newEmotion, setNewEmotion] = useState("");

  // Handlers para Dias (tradução/edição direta)
  const handleUpdateDay = (index: number, val: string) => {
    const updated = [...days];
    updated[index] = val;
    setDays(updated);
  };

  // Handlers genéricos para listas
  const handleAdd = (
    val: string,
    list: string[],
    setter: (l: string[]) => void,
    reset: () => void,
  ) => {
    const trimmed = val.trim();
    if (!trimmed || list.includes(trimmed)) return;
    setter([...list, trimmed]);
    reset();
  };

  const handleRemove = (
    val: string,
    list: string[],
    setter: (l: string[]) => void,
  ) => {
    setter(list.filter((item) => item !== val));
  };

  const inputClasses =
    "flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40";
  const btnClasses =
    "px-4 py-2 bg-emerald-400 text-black text-sm font-semibold rounded-lg hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5";

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          System Configuration
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Customize global parameters, labels, and visual identities used across
          your TradeLog.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DIAS DA SEMANA */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Calendar size={18} />
            <h3 className="font-semibold text-sm text-foreground">
              Days of the Week
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Rename or translate the days of the week.
          </p>
          <div className="space-y-2">
            {days.map((day, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground w-4">
                  {idx}
                </span>
                <input
                  type="text"
                  value={day}
                  onChange={(e) => handleUpdateDay(idx, e.target.value)}
                  className={inputClasses}
                />
              </div>
            ))}
          </div>
        </div>

        {/* TIMEFRAMES */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Clock size={18} />
            <h3 className="font-semibold text-sm text-foreground">
              Timeframes
            </h3>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTimeframe}
              onChange={(e) => setNewTimeframe(e.target.value)}
              placeholder="e.g. 2h, M15..."
              className={inputClasses}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleAdd(newTimeframe, timeframes, setTimeframes, () =>
                  setNewTimeframe(""),
                )
              }
            />
            <button
              onClick={() =>
                handleAdd(newTimeframe, timeframes, setTimeframes, () =>
                  setNewTimeframe(""),
                )
              }
              disabled={!newTimeframe.trim()}
              className={btnClasses}
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeframes.map((tf) => (
              <span
                key={tf}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs font-mono border border-border"
              >
                {tf}
                <button
                  onClick={() => handleRemove(tf, timeframes, setTimeframes)}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* MARKETS */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-purple-400">
            <Globe size={18} />
            <h3 className="font-semibold text-sm text-foreground">Markets</h3>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newMarket}
              onChange={(e) => setNewMarket(e.target.value)}
              placeholder="e.g. B3, Nasdaq..."
              className={inputClasses}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleAdd(newMarket, markets, setMarkets, () =>
                  setNewMarket(""),
                )
              }
            />
            <button
              onClick={() =>
                handleAdd(newMarket, markets, setMarkets, () =>
                  setNewMarket(""),
                )
              }
              disabled={!newMarket.trim()}
              className={btnClasses}
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {markets.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs font-mono border border-border"
              >
                {m}
                <button
                  onClick={() => handleRemove(m, markets, setMarkets)}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* CORES */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-amber-400">
            <Palette size={18} />
            <h3 className="font-semibold text-sm text-foreground">
              Setup Colors
            </h3>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-9 w-12 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className={inputClasses}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleAdd(newColor, colors, setColors, () =>
                  setNewColor("#ffffff"),
                )
              }
            />
            <button
              onClick={() =>
                handleAdd(newColor, colors, setColors, () =>
                  setNewColor("#ffffff"),
                )
              }
              className={btnClasses}
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <div key={c} className="relative group">
                <div
                  className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                  style={{ backgroundColor: c }}
                  title={c}
                />
                <button
                  onClick={() => handleRemove(c, colors, setColors)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ERROS E EMOÇÕES */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-red-400">
            <Heart size={18} />
            <h3 className="font-semibold text-sm text-foreground">
              Trading Tags & Sentiment
            </h3>
          </div>

          {/* Error Tags */}
          <div className="mb-6">
            <label className="text-xs text-muted-foreground block mb-2">
              Error Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newErrorTag}
                onChange={(e) => setNewErrorTag(e.target.value)}
                placeholder="Add tag..."
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleAdd(newErrorTag, errorTags, setErrorTags, () =>
                    setNewErrorTag(""),
                  )
                }
                className={inputClasses}
              />
              <button
                onClick={() =>
                  handleAdd(newErrorTag, errorTags, setErrorTags, () =>
                    setNewErrorTag(""),
                  )
                }
                className={btnClasses}
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {errorTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs border border-red-500/20"
                >
                  {tag}
                  <button
                    onClick={() => handleRemove(tag, errorTags, setErrorTags)}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Emotions (Gerenciamento da lista) */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">
              Emotions
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newEmotion}
                onChange={(e) => setNewEmotion(e.target.value)}
                placeholder="Add emotion..."
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleAdd(newEmotion, emotions, setEmotions, () =>
                    setNewEmotion(""),
                  )
                }
                className={inputClasses}
              />
              <button
                onClick={() =>
                  handleAdd(newEmotion, emotions, setEmotions, () =>
                    setNewEmotion(""),
                  )
                }
                className={btnClasses}
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {emotions.map((e) => (
                <span
                  key={e}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20"
                >
                  {e}
                  <button
                    onClick={() => handleRemove(e, emotions, setEmotions)}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
