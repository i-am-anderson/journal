import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Plus,
  X,
  Activity,
  Layers,
  Target,
  FileSignature,
  Trash2,
  Settings,
} from "lucide-react";

import JournalPage from "./pages/JournalPage";
import DashboardPage from "./pages/DashboardPage";
import StatsPage from "./pages/StatsPage";
import SetupsPage from "./pages/SetupsPage";
import StrategiesPage from "./pages/StrategiesPage";
import TradingPlanPage from "./pages/TradingPlanPage";
import ConfigsPage from "./pages/ConfigsPage";
import SetupModal from "./components/SetupModal";
import StrategyModal from "./components/StrategyModal";
import AddTradeModal from "./components/AddTradeModal";

import { fmtPnl, pnlColor } from "./helpers/utils";
import {
  DAYS,
  TIMEFRAMES,
  MARKETS,
  SETUP_COLORS,
  ERROR_TAGS,
  EMOTIONS,
  SEED_TRADES,
  SEED_SETUPS,
  SEED_STRATEGIES,
} from "./helpers/constants";

// 1. APENAS PARA REFERÊNCIA VISUAL DA MUDANÇA DE TIPO
import { Trade, Setup, EquityPoint, Strategy, Account } from "./types";

const SEED_ACCOUNTS_NUMERIC: Account[] = [
  { id: 1, name: "Daytrade (Futures)" },
  { id: 2, name: "Swing Trade (Stocks)" },
];

/* ══════════════════════════════════════════════════════════════════════
  ROOT APP
══════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS_NUMERIC);
  const [activeAccountId, setActiveAccountId] = useState<number>(-1); // -1 REPRESENTA 'ALL'

  const [trades, setTrades] = useState<Trade[]>(SEED_TRADES);

  const [setups, setSetups] = useState<Setup[]>(SEED_SETUPS);
  const [strategies, setStrategies] = useState<Strategy[]>(SEED_STRATEGIES);

  const [view, setView] = useState("dashboard");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");

  const [setupModal, setSetupModal] = useState<any>(null);
  const [strategyModal, setStrategyModal] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<any>(null);
  const [lightboxImg, setLightboxImg] = useState<any>(null);

  // Filtros do Journal
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSide, setFilterSide] = useState("all");
  const [filterStrategy, setFilterStrategy] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSetup, setFilterSetup] = useState("all");
  const [filterDay, setFilterDay] = useState("all");

  // Filtros de Configs
  const [days, setDays] = useState<string[]>(DAYS);
  const [timeframes, setTimeframes] = useState<string[]>(TIMEFRAMES);
  const [markets, setMarkets] = useState<string[]>(MARKETS);
  const [colors, setColors] = useState<string[]>(SETUP_COLORS);
  const [errorTags, setErrorTags] = useState<string[]>(ERROR_TAGS);
  const [emotions, setEmotions] = useState<string[]>(EMOTIONS);

  const [editingTrade, setEditingTrade] = useState<any | null>(null);

  // ══════════════════════════════════════════════════════════════════════
  //  FILTRO DE CONTEXTO NUMÉRICO
  // ══════════════════════════════════════════════════════════════════════
  const accountTrades = useMemo(() => {
    if (activeAccountId === -1) return trades; // Se for -1, retorna tudo
    return trades.filter((t) => t.accountId === activeAccountId);
  }, [trades, activeAccountId]);

  const stats = useMemo(() => {
    const wins = accountTrades.filter((t) => t.status === "win");
    const losses = accountTrades.filter((t) => t.status === "loss");
    const totalPnl = accountTrades.reduce((s, t) => s + t.pnl, 0);
    const winRate = accountTrades.length
      ? (wins.length / accountTrades.length) * 100
      : 0;
    const avgWin = wins.length
      ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length
      : 0;
    const avgLoss = losses.length
      ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length
      : 0;
    const rr = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
    const pnls = accountTrades.map((t) => t.pnl);

    return {
      total: accountTrades.length,
      wins: wins.length,
      losses: losses.length,
      totalPnl: parseFloat(totalPnl.toFixed(2)),
      winRate,
      avgWin: parseFloat(avgWin.toFixed(2)),
      avgLoss: parseFloat(avgLoss.toFixed(2)),
      rr: parseFloat(rr.toFixed(2)),
      bestTrade: pnls.length ? Math.max(...pnls) : 0,
      worstTrade: pnls.length ? Math.min(...pnls) : 0,
    };
  }, [accountTrades]);

  const equityData: EquityPoint[] = useMemo(() => {
    let running = 0;
    return [...accountTrades]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((t) => {
        running += t.pnl;
        return { date: t.date.slice(5), pnl: parseFloat(running.toFixed(2)) };
      });
  }, [accountTrades]);

  const filteredTrades = useMemo(() => {
    return accountTrades
      .filter((t) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (
            !t.symbol.toLowerCase().includes(q) &&
            !t.strategy.toLowerCase().includes(q)
          )
            return false;
        }
        if (filterSide !== "all" && t.side !== filterSide) return false;
        if (filterStrategy !== "all" && t.strategy !== filterStrategy)
          return false;
        if (filterStatus !== "all" && t.status !== filterStatus) return false;
        if (filterSetup !== "all" && t.setupId !== filterSetup) return false;
        if (filterDay !== "all") {
          const day = new Date(t.date).getDay();
          if (day.toString() !== filterDay) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [
    accountTrades,
    searchQuery,
    filterSide,
    filterStatus,
    filterStrategy,
    filterSetup,
    filterDay,
  ]);

  const strategyStats = useMemo(() => {
    const map: {
      [key: string]: { trades: number; wins: number; pnl: number };
    } = {};
    accountTrades.forEach((t) => {
      const key = t.strategy || t.strategy;
      if (!key) return;
      if (!map[key]) map[key] = { trades: 0, wins: 0, pnl: 0 };
      map[key].trades++;
      if (t.status === "win") map[key].wins++;
      map[key].pnl += t.pnl;
    });

    return Object.entries(map)
      .map(([key, s]: any) => {
        const matchingStrat = strategies.find(
          (st) => st.id === key || st.name === key,
        );

        return {
          name: matchingStrat ? matchingStrat.name : key,
          trades: s.trades,
          wins: s.wins,
          pnl: parseFloat(s.pnl.toFixed(2)),
          winRate: (s.wins / s.trades) * 100,
        };
      })
      .sort((a, b) => b.pnl - a.pnl);
  }, [accountTrades, strategies]);

  // GERAÇÃO DE ID AUTO-INCREMENTAL SEGURO
  function handleCreateAccount() {
    if (!newAccountName.trim()) return;
    const maxId = accounts.reduce(
      (max, acc) => (acc.id > max ? acc.id : max),
      0,
    );
    const newAcc: Account = {
      id: maxId + 1, // Garante id >= 0 sempre auto-incrementado
      name: newAccountName.trim(),
    };
    setAccounts((prev) => [...prev, newAcc]);
    setActiveAccountId(newAcc.id);
    setNewAccountName("");
    setShowAddAccount(false);
  }

  function handleDeleteAccount() {
    if (activeAccountId === -1) return; // Proteção: não deletar a visão 'all'

    const accToDelete = accounts.find((a) => a.id === activeAccountId);
    if (!accToDelete) return;

    // Confirmação de segurança nativa do navegador
    const confirmDelete = window.confirm(
      `ATENÇÃO: Você tem certeza que deseja excluir o ambiente "${accToDelete.name}"?\n\nIsso apagará PERMANENTEMENTE todos os trades vinculados a ele!`,
    );

    if (confirmDelete) {
      // 1. Remove a conta da lista
      setAccounts((prev) => prev.filter((a) => a.id !== activeAccountId));
      // 2. Apaga todos os trades daquela conta (evita trades fantasmas)
      setTrades((prev) => prev.filter((t) => t.accountId !== activeAccountId));
      // 3. Retorna a visualização para "All Accounts"
      setActiveAccountId(-1);
    }
  }

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={15} />,
    },
    { id: "journal", label: "Journal", icon: <BookOpen size={15} /> },
    { id: "stats", label: "Statistics", icon: <BarChart2 size={15} /> },
    { id: "setups", label: "Setups", icon: <Layers size={15} /> },
    { id: "strategies", label: "Strategies", icon: <Target size={15} /> },
    {
      id: "trading-plan",
      label: "Trading Plan",
      icon: <FileSignature size={15} />,
    },
    { id: "configs", label: "Settings", icon: <Settings size={15} /> },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-65 shrink-0 flex flex-col border-r border-border">
        <div className="px-5 py-5 border-b border-border flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-400/15 flex items-center justify-center">
            <Activity size={14} className="text-emerald-400" />
          </div>
          <span className="font-mono text-sm font-bold tracking-tight">
            TradeLog
          </span>
        </div>

        {/* SELETOR DE AMBIENTES ATUALIZADO */}
        <div className="px-4 py-3.5 border-b border-border bg-secondary/10 space-y-1.5">
          <label className="block text-[9px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
            Active Environment
          </label>
          <div className="flex items-center gap-1.5">
            <select
              value={activeAccountId}
              onChange={(e) => setActiveAccountId(Number(e.target.value))}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40 cursor-pointer w-full min-w-0"
            >
              <option value={-1}>All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAddAccount(true)}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
              title="Create new environment"
            >
              <Plus size={13} />
            </button>

            {/* O botão de apagar só aparece se houver uma conta selecionada (diferente de -1) */}
            {activeAccountId !== -1 && (
              <button
                onClick={handleDeleteAccount}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Delete current environment"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${view === item.id ? "bg-emerald-400/10 text-emerald-400 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              {item.icon}
              {item.label}
              {item.id === "setups" && (
                <span className="ml-auto text-[10px] font-mono bg-secondary rounded-full px-1.5 py-0.5 text-muted-foreground">
                  {setups.length}
                </span>
              )}
              {item.id === "strategies" && (
                <span className="ml-auto text-[10px] font-mono bg-secondary rounded-full px-1.5 py-0.5 text-muted-foreground">
                  {strategies.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2.5 bg-card/40">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Context P&L</span>
            <span
              className={`text-xs font-mono font-semibold ${pnlColor(stats.totalPnl)}`}
            >
              {fmtPnl(stats.totalPnl)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Win Rate</span>
            <span className="text-xs font-mono font-semibold">
              {stats.winRate.toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Trades</span>
            <span className="text-xs font-mono font-semibold">
              {stats.total}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4 border-b border-border shrink-0">
          <div>
            <h1 className="font-semibold text-base capitalize leading-tight">
              {view === "dashboard"
                ? "Dashboard"
                : view === "journal"
                  ? "Journal"
                  : view === "stats"
                    ? "Statistics"
                    : view === "setups"
                      ? "Setups Playbook"
                      : view === "strategies"
                        ? "Strategies Playbook"
                        : view === "configs"
                          ? "Settings"
                          : "Trading Plan"}{" "}
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
              Scope:{" "}
              {activeAccountId === -1
                ? "Consolidated"
                : accounts.find((a) => a.id === activeAccountId)?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (accounts.length === 0) {
                  alert(
                    "⚠️ Você não possui nenhum ambiente ativo! Crie uma conta antes de registrar seus trades.",
                  );
                  setShowAddAccount(true); // Abre automaticamente o modal de criar conta
                  return;
                }
                setShowAdd(true);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                accounts.length === 0
                  ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
                  : "bg-emerald-400 text-black hover:bg-emerald-300"
              }`}
            >
              <Plus size={14} />
              New Trade
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {view === "dashboard" && (
            <DashboardPage
              trades={accountTrades}
              stats={stats}
              equityData={equityData}
              setups={setups}
              onViewAll={() => setView("journal")}
              days={days}
            />
          )}
          {view === "journal" && (
            <JournalPage
              trades={filteredTrades}
              setups={setups}
              strategies={strategies}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              onDelete={(id) => {
                setTrades((prev) => prev.filter((t) => t.id !== id));
                if (expandedId === id) setExpandedId(null);
              }}
              onEditRequest={(trade) => {
                setEditingTrade(trade);
                setShowAdd(true);
              }}
              onLightbox={setLightboxImg}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterSide={filterSide}
              setFilterSide={setFilterSide}
              filterStrategy={filterStrategy}
              setFilterStrategy={setFilterStrategy}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterSetup={filterSetup}
              setFilterSetup={setFilterSetup}
              filterDay={filterDay}
              setFilterDay={setFilterDay}
              days={days}
            />
          )}
          {view === "stats" && (
            <StatsPage
              stats={stats}
              strategyStats={strategyStats}
              trades={accountTrades}
              days={days}
            />
          )}
          {view === "setups" && (
            <SetupsPage
              setups={setups}
              trades={accountTrades}
              onAddSetup={() => setSetupModal("new")}
              onEditSetup={(setup) => setSetupModal(setup)}
              onDeleteSetup={(id) =>
                setSetups((prev) => prev.filter((s) => s.id !== id))
              }
            />
          )}
          {view === "strategies" && (
            <StrategiesPage
              strategies={strategies}
              trades={accountTrades}
              onAddStrategy={() => setStrategyModal("new")}
              onEditStrategy={(strat) => setStrategyModal(strat)}
              onDeleteStrategy={(id) =>
                setStrategies((prev) => prev.filter((s) => s.id !== id))
              }
            />
          )}
          {view === "trading-plan" && <TradingPlanPage />}
          {view === "configs" && (
            <ConfigsPage
              days={days}
              setDays={setDays}
              timeframes={timeframes}
              setTimeframes={setTimeframes}
              markets={markets}
              setMarkets={setMarkets}
              colors={colors}
              setColors={setColors}
              errorTags={errorTags}
              setErrorTags={setErrorTags}
              emotions={emotions}
              setEmotions={setEmotions}
            />
          )}
        </div>
      </main>

      {/* Modal Adicionar Conta */}
      {showAddAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="font-semibold text-sm">
                Create New Trading Environment
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Isolate tactical logs like Scalping, Options, Core Wallet etc.
              </p>
            </div>
            <input
              type="text"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="e.g., Proprietary Firm PropX..."
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
              onKeyDown={(e) => e.key === "Enter" && handleCreateAccount()}
            />
            <div className="flex justify-end gap-2 text-xs font-semibold pt-1">
              <button
                onClick={() => setShowAddAccount(false)}
                className="px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                disabled={!newAccountName.trim()}
                className="px-4 py-2 bg-emerald-400 text-black rounded-lg disabled:opacity-40 hover:bg-emerald-300"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outros Modals */}
      {showAdd && (
        <AddTradeModal
          accountId={activeAccountId === -1 ? accounts[0].id : activeAccountId}
          availableErrorTags={errorTags}
          availableEmotions={emotions}
          setups={setups}
          strategies={strategies}
          initialTrade={editingTrade} // <-- Injeta os dados se for edição, ou null se for novo
          onClose={() => {
            setShowAdd(false);
            setEditingTrade(null); // Limpa o estado ao fechar
          }}
          onSave={(savedTrade) => {
            if (editingTrade) {
              // MODO EDIÇÃO: Atualiza o trade existente no array
              setTrades((prev) =>
                prev.map((t) => (t.id === savedTrade.id ? savedTrade : t)),
              );
            } else {
              // MODO CRIAÇÃO: Adiciona o novo trade no início do array
              setTrades((prev) => [savedTrade, ...prev]);
            }

            setShowAdd(false);
            setEditingTrade(null); // Limpa o estado após salvar
          }}
        />
      )}

      {setupModal && (
        <SetupModal
          initial={setupModal === "new" ? null : setupModal}
          onClose={() => setSetupModal(null)}
          onSave={(setup) => {
            setSetups((prev) => {
              const exists = prev.find((s) => s.id === setup.id);
              return exists
                ? prev.map((s) => (s.id === setup.id ? setup : s))
                : [...prev, setup];
            });
            setSetupModal(null);
          }}
          markets={markets}
          colors={colors}
          timeframes={timeframes}
        />
      )}

      {strategyModal && (
        <StrategyModal
          initial={strategyModal === "new" ? null : strategyModal}
          onClose={() => setStrategyModal(null)}
          onSave={(strategy) => {
            setStrategies((prev) => {
              const exists = prev.find((s) => s.id === strategy.id);
              return exists
                ? prev.map((s) => (s.id === strategy.id ? strategy : s))
                : [...prev, strategy];
            });
            setStrategyModal(null);
          }}
          colors={colors}
        />
      )}

      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-8 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white"
            onClick={() => setLightboxImg(null)}
          >
            <X size={18} />
          </button>
          <img
            src={lightboxImg}
            alt="Chart"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
