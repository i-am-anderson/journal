import { useState } from "react";
import {
  Plus,
  X,
  Calendar,
  Clock,
  Globe,
  Palette,
  Heart,
  Flag,
  CheckSquare,
} from "lucide-react";

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
  processGoals,
  setProcessGoals,
}: ConfigsPageProps & {
  processGoals: string[];
  setProcessGoals: (g: string[]) => void;
}) {
  const [newTimeframe, setNewTimeframe] = useState("");
  const [newMarket, setNewMarket] = useState("");
  const [newColor, setNewColor] = useState("#ffffff");
  const [newErrorTag, setNewErrorTag] = useState("");
  const [newEmotion, setNewEmotion] = useState("");
  const [newProcessGoal, setNewProcessGoal] = useState(""); // 👇 Novo estado local

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
    if (!trimmed) return;
    // Dedup case-insensitive: sem isso, "Ganancioso" e "ganancioso" entram
    // como duas emoções diferentes e fragmentam os dados nos relatórios.
    const isDuplicate = list.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) return;
    setter([...list, trimmed]);
    reset();
  };

  // minCount evita zerar listas das quais outras telas dependem ter pelo
  // menos 1 opção (ex: o modal de Setup usa colors[0] como cor padrão).
  const handleRemove = (
    val: string,
    list: string[],
    setter: (l: string[]) => void,
    minCount: number = 0,
  ) => {
    if (list.length <= minCount) return;
    setter(list.filter((item) => item !== val));
  };

  const isValidHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(newColor.trim());

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
          your DearMarket.
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
            Rename or translate the days of the week. O índice segue o padrão JS
            (0 = domingo) — usado internamente pelos gráficos.
          </p>
          <div className="space-y-2">
            {days.map((day, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground w-4">
                  {idx}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground/40 w-8">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][idx]}
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
                  onClick={() => handleRemove(tf, timeframes, setTimeframes, 1)}
                  disabled={timeframes.length <= 1}
                  title={
                    timeframes.length <= 1
                      ? "Mantenha pelo menos 1 timeframe"
                      : undefined
                  }
                  className="text-muted-foreground hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
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
                  onClick={() => handleRemove(m, markets, setMarkets, 1)}
                  disabled={markets.length <= 1}
                  title={
                    markets.length <= 1
                      ? "Mantenha pelo menos 1 mercado"
                      : undefined
                  }
                  className="text-muted-foreground hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
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
              Setup & Strategy Colors
            </h3>
          </div>
          <div className="flex gap-2 mb-1">
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
                isValidHex &&
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
              disabled={!isValidHex}
              className={btnClasses}
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {newColor && !isValidHex && (
            <p className="text-[10px] text-red-400 mb-3">
              Formato inválido — use #RRGGBB ou #RGB
            </p>
          )}
          <div className={`flex flex-wrap gap-3 ${!isValidHex ? "mt-3" : ""}`}>
            {colors.map((c) => (
              <div key={c} className="relative group">
                <div
                  className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                  style={{ backgroundColor: c }}
                  title={c}
                />
                <button
                  onClick={() => handleRemove(c, colors, setColors, 1)}
                  disabled={colors.length <= 1}
                  title={
                    colors.length <= 1 ? "Mantenha pelo menos 1 cor" : undefined
                  }
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:pointer-events-none"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ERROR TAGS */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-red-400">
            <Flag size={18} />
            <h3 className="font-semibold text-sm text-foreground">
              Error Tags
            </h3>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Marcadores de erro registrados em cada trade — usados na Journal e
              na Stats para identificar padrões.
            </p>
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
        </div>

        {/* EMOTIONS */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Heart size={18} />
            <h3 className="font-semibold text-sm text-foreground">Emotions</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Estado emocional registrado em cada trade — cruzado com P&L na Stats
            pra ver o que custa caro.
          </p>
          <div>
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

        {/* 👇 NOVO BLOCO: PROCESS GOALS */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <CheckSquare size={18} />
            <h3 className="font-semibold text-sm text-foreground">
              Process Goals
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Defina as regras inegociáveis do seu operacional para avaliar no
            Diário. (ex: Max 3 stops no dia).
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newProcessGoal}
              onChange={(e) => setNewProcessGoal(e.target.value)}
              placeholder="Nova regra de processo..."
              className={inputClasses}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleAdd(newProcessGoal, processGoals, setProcessGoals, () =>
                  setNewProcessGoal(""),
                )
              }
            />
            <button
              onClick={() =>
                handleAdd(newProcessGoal, processGoals, setProcessGoals, () =>
                  setNewProcessGoal(""),
                )
              }
              disabled={!newProcessGoal.trim()}
              className={btnClasses}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {processGoals.map((goal) => (
              <span
                key={goal}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs border border-emerald-500/20"
              >
                <span className="font-medium truncate">{goal}</span>
                <button
                  onClick={() =>
                    handleRemove(goal, processGoals, setProcessGoals)
                  }
                  className="text-emerald-400 hover:text-red-400 shrink-0"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}