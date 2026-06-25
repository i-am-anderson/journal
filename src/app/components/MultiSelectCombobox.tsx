import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { MultiSelectComboboxProps } from "../types";

/* ══════════════════════════════════════════════════════════════════════
  SHARED UI
══════════════════════════════════════════════════════════════════════ */
function MultiSelectCombobox({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select...",
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[42px] px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-1 focus:ring-emerald-400/40 transition-colors"
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selected.length === 0 ? (
            <span className="text-muted-foreground font-mono text-sm px-0.5">
              {placeholder}
            </span>
          ) : (
            selected.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400 text-xs font-mono border border-emerald-400/25"
              >
                {s}
                <X
                  size={11}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(s);
                  }}
                  className="hover:text-red-400 transition-colors"
                />
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-card border border-border rounded-lg shadow-2xl shadow-black/50 max-h-56 overflow-hidden flex flex-col">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar..."
            autoFocus
            className="px-3 py-2 text-sm bg-transparent border-b border-border focus:outline-none placeholder:text-muted-foreground text-foreground"
          />
          <div className="overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground text-center">
                Nenhuma opção encontrada
              </p>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggle(opt)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-secondary transition-colors text-left text-foreground"
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-emerald-400 border-emerald-400"
                          : "border-border"
                      }`}
                    >
                      {isSelected && <Check size={11} className="text-black" />}
                    </span>
                    {opt}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelectCombobox;