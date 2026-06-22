import { useEffect, useState, useMemo } from "react";
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
  CheckSquare,
} from "lucide-react";

import JournalPage from "./pages/JournalPage";
import DashboardPage from "./pages/DashboardPage";
import StatsPage from "./pages/StatsPage";
import SetupsPage from "./pages/SetupsPage";
import StrategiesPage from "./pages/StrategiesPage";
import TradingPlanPage from "./pages/TradingPlanPage";
import ConfigsPage from "./pages/ConfigsPage";
import ProcessGoalsPage from "./pages/ProcessGoalsPage";

import SetupModal from "./components/SetupModal";
import StrategyModal from "./components/StrategyModal";
import AddTradeModal from "./components/AddTradeModal";

import { fmtPnl, pnlColor, uid } from "./helpers/utils";
import { storageService } from "./services/storage";

// Tipagens do sistema
import {
  Trade,
  Setup,
  EquityPoint,
  Strategy,
  Account,
  TradesView,
  DailyProcess,
  View,
  NavItemsProps,
  isView,
  DefaultPlanProps,
} from "./types";
import { DEFAULT_TRADING_PLAN } from "./helpers/constants";

/* ══════════════════════════════════════════════════════════════════════
  ROOT APP
══════════════════════════════════════════════════════════════════════ */
export default function App() {
  // ─── ESTADO DE CARREGAMENTO (INIT) ──────────────────────────────────
  const [loading, setLoading] = useState(true);

  // ─── ESTADOS GERAIS DE DADOS ────────────────────────────────────────
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>(""); // "" = 'ALL'

  const [trades, setTrades] = useState<Trade[]>([]);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  const [processGoals, setProcessGoals] = useState<string[]>([]);
  const [dailyProcess, setDailyProcess] = useState<DailyProcess[]>([]);

  // ─── ESTADOS DE UI / NAVEGAÇÃO ──────────────────────────────────────
  const journal_page = localStorage.getItem("journal_page");
  const [view, setView] = useState<View>(
    journal_page && isView(journal_page) ? journal_page : "dashboard",
  );
  const [showAdd, setShowAdd] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");

  const [setupModal, setSetupModal] = useState<any>(null);
  const [strategyModal, setStrategyModal] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<any>(null);
  const [lightboxImg, setLightboxImg] = useState<any>(null);
  const [editingTrade, setEditingTrade] = useState<any | null>(null);

  // ─── ESTADOS DE FILTROS (Journal) ───────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSide, setFilterSide] = useState("all");
  const [filterStrategy, setFilterStrategy] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSetup, setFilterSetup] = useState("all");
  const [filterDay, setFilterDay] = useState("all");

  // ─── ESTADOS DE CONFIGURAÇÕES (Configs) ─────────────────────────────
  const [days, setDays] = useState<string[]>([]);
  const [timeframes, setTimeframes] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [errorTags, setErrorTags] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);

  const [displayMode, setDisplayMode] = useState<TradesView>("playbook");
  const [tradingPlan, setTradingPlan] =
    useState<DefaultPlanProps>(DEFAULT_TRADING_PLAN);

  /* ══════════════════════════════════════════════════════════════════════
    1. CARREGAMENTO INICIAL (MOCK DA API)
  ══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [
          loadedConfigs,
          loadedAccounts,
          loadedSetups,
          loadedStrategies,
          loadedTrades,
          loadedDailyProcess,
          loadedProcessGoals,
          loadedTradingPlan,
        ] = await Promise.all([
          storageService.getConfigs(),
          storageService.getAccounts(),
          storageService.getSetups(),
          storageService.getStrategies(),
          storageService.getTrades(),
          storageService.getDailyProcess(),
          storageService.getProcessGoals(),
          storageService.getTradingPlan(),
        ]);

        // Populando as configs (Garantindo um fallback para Arrays vazios)
        setDays(loadedConfigs.days || []);
        setTimeframes(loadedConfigs.timeframes || []);
        setMarkets(loadedConfigs.markets || []);
        setColors(loadedConfigs.colors || []);
        setErrorTags(loadedConfigs.errorTags || []);
        setEmotions(loadedConfigs.emotions || []);
        setDisplayMode(loadedConfigs.displayMode || "playbook");

        if (loadedConfigs.activeAccountId !== undefined) {
          setActiveAccountId(loadedConfigs.activeAccountId);
        }

        // Populando as listas principais
        setAccounts(loadedAccounts || []);
        setSetups(loadedSetups || []);
        setStrategies(loadedStrategies || []);
        setTrades(loadedTrades || []);
        setDailyProcess(loadedDailyProcess || []);
        setProcessGoals(loadedProcessGoals || []);
        setTradingPlan(loadedTradingPlan || DEFAULT_TRADING_PLAN);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      } finally {
        setLoading(false); // Libera a UI
      }
    }

    loadInitialData();
  }, []);

  /* ══════════════════════════════════════════════════════════════════════
    2. AUTO-SAVE DAS CONFIGURAÇÕES EM BACKGROUND
  ══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (loading) return; // Não salvar enquanto estiver no carregamento inicial

    storageService.saveConfigs({
      days,
      timeframes,
      markets,
      colors,
      errorTags,
      emotions,
      activeAccountId,
      theme: "dark", // Se quiser evoluir temas no futuro
      displayMode,
    });

    storageService.saveAccounts(accounts);

    storageService.saveSetups(setups);

    storageService.saveStrategies(strategies);

    storageService.saveDailyProcess(dailyProcess);

    storageService.saveProcessGoals(processGoals);

    storageService.saveTradingPlan(tradingPlan);
  }, [
    days,
    timeframes,
    markets,
    colors,
    errorTags,
    emotions,
    activeAccountId,
    loading,
    accounts,
    setups,
    strategies,
    displayMode,
    processGoals,
    dailyProcess,
    tradingPlan,
  ]);

  /* ══════════════════════════════════════════════════════════════════════
    3. SALVA A ÚLTIMA PÁGINA VISITADA
  ══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    localStorage.setItem("journal_page", view);
  }, [view]);

  /* ══════════════════════════════════════════════════════════════════════
    FILTRO DE CONTEXTO NUMÉRICO E MEMOS
  ══════════════════════════════════════════════════════════════════════ */
  const accountTrades = useMemo(() => {
    if (activeAccountId === "") return trades;
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
          if (!t.symbol.toLowerCase().includes(q) && !t.strategyId.includes(q))
            return false;
        }
        if (filterSide !== "all" && t.side !== filterSide) return false;
        if (filterStrategy !== "all" && t.strategyId !== filterStrategy)
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
      const key = t.strategyId || t.strategyId;
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

  /* ══════════════════════════════════════════════════════════════════════
    HANDLERS: ACCOUNTS E DADOS PRINCIPAIS (COM PERSISTÊNCIA)
  ══════════════════════════════════════════════════════════════════════ */
  async function handleCreateAccount() {
    if (!newAccountName.trim()) return;
    const newAcc: Account = { id: uid(), name: newAccountName.trim() };

    const updatedAccounts = [...accounts, newAcc];
    setAccounts(updatedAccounts);
    setActiveAccountId(newAcc.id);

    await storageService.saveAccounts(updatedAccounts); // Persiste

    setNewAccountName("");
    setShowAddAccount(false);
  }

  async function handleDeleteAccount() {
    if (activeAccountId === "") return;

    const accToDelete = accounts.find((a) => a.id === activeAccountId);
    if (!accToDelete) return;

    const confirmDelete = window.confirm(
      `ATENÇÃO: Você tem certeza que deseja excluir o ambiente "${accToDelete.name}"?\n\nIsso apagará PERMANENTEMENTE todos os trades vinculados a ele!`,
    );

    if (confirmDelete) {
      const updatedAccounts = accounts.filter((a) => a.id !== activeAccountId);
      const updatedTrades = trades.filter(
        (t) => t.accountId !== activeAccountId,
      );

      setAccounts(updatedAccounts);
      setTrades(updatedTrades);
      setActiveAccountId("");

      // Sincroniza exclusões em massa
      await Promise.all([
        storageService.saveAccounts(updatedAccounts),
        storageService.saveTrades(updatedTrades),
      ]);
    }
  }

  // ─── TELA DE CARREGAMENTO ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Activity size={32} className="text-emerald-400 animate-pulse" />
          <span className="font-mono text-sm text-muted-foreground tracking-widest uppercase">
            Initializing Vault...
          </span>
        </div>
      </div>
    );
  }

  const navItems: NavItemsProps[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={15} />,
    },
    { id: "journal", label: "Journal", icon: <BookOpen size={15} /> },
    { id: "stats", label: "Statistics", icon: <BarChart2 size={15} /> },
    { id: "setups", label: "Setups", icon: <Layers size={15} /> },
    { id: "strategies", label: "Strategies", icon: <Target size={15} /> },
    { id: "process", label: "Process Goals", icon: <CheckSquare size={15} /> },
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
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Coluna 1: Logo */}
            <div className="w-12 h-12 rounded-lg bg-emerald-400/15 flex items-center justify-center shrink-0">
              <img
                src="logo.png"
                alt="DearMarket Logo"
                title="DearMarket"
                className="rounded-lg"
              />
            </div>

            {/* Coluna 2: Nome + Slogan */}
            <div className="flex flex-col">
              <span className="font-mono text-xl font-bold tracking-tight">
                DearMarket
              </span>

              <span className="text-xs italic text-muted-foreground/75">
                Every trade tells a story
              </span>
            </div>
          </div>
        </div>

        {/* SELETOR DE AMBIENTES */}
        <div className="px-4 py-3.5 border-b border-border bg-secondary/10 space-y-1.5">
          <label className="block text-[9px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
            Active Environment
          </label>
          <div className="flex items-center gap-1.5">
            <select
              value={activeAccountId}
              onChange={(e) => setActiveAccountId(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400/40 cursor-pointer w-full min-w-0"
            >
              <option value="">All Accounts</option>
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

            {activeAccountId !== "" && (
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                view === item.id
                  ? "bg-emerald-400/10 text-emerald-400 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {item.icon}
              {item.label}
              {item.id === "setups" && (
                <span className="ml-auto text-[9px] font-mono bg-emerald-400 rounded-full px-1.5 py-0.5 text-background">
                  {setups.length}
                </span>
              )}
              {item.id === "strategies" && (
                <span className="ml-auto text-[9px] font-mono bg-emerald-400 rounded-full px-1.5 py-0.5 text-background">
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
                          : view === "process"
                            ? "Process Goals"
                            : "Trading Plan"}{" "}
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
              Scope:{" "}
              {activeAccountId === ""
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
                  setShowAddAccount(true);
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
              strategies={strategies}
              onViewAll={() => setView("journal")}
              days={days}
              setView={setView}
            />
          )}
          {view === "journal" && (
            <JournalPage
              trades={filteredTrades}
              setups={setups}
              strategies={strategies}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              onDelete={async (id) => {
                const updatedTrades = trades.filter((t) => t.id !== id);
                setTrades(updatedTrades);
                await storageService.saveTrades(updatedTrades); // Persiste Deleção
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
              setDisplayMode={setDisplayMode}
              displayMode={displayMode}
            />
          )}
          {view === "stats" && (
            <StatsPage
              stats={stats}
              strategyStats={strategyStats}
              trades={accountTrades}
              days={days}
              strategies={strategies}
              setups={setups}
            />
          )}
          {view === "setups" && (
            <SetupsPage
              setups={setups}
              trades={accountTrades}
              onAddSetup={() => setSetupModal("new")}
              onEditSetup={(setup) => setSetupModal(setup)}
              onDeleteSetup={async (id) => {
                const updatedSetups = setups.filter((s) => s.id !== id);
                setSetups(updatedSetups);
                await storageService.saveSetups(updatedSetups); // Persiste Deleção
              }}
            />
          )}
          {view === "strategies" && (
            <StrategiesPage
              strategies={strategies}
              trades={accountTrades}
              onAddStrategy={() => setStrategyModal("new")}
              onEditStrategy={(strat) => setStrategyModal(strat)}
              onDeleteStrategy={async (id) => {
                const updatedStrategies = strategies.filter((s) => s.id !== id);
                setStrategies(updatedStrategies);
                await storageService.saveStrategies(updatedStrategies); // Persiste Deleção
              }}
            />
          )}
          {view === "trading-plan" && <TradingPlanPage tradingPlan={tradingPlan} setTradingPlan={setTradingPlan} />}
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
              processGoals={processGoals}
              setProcessGoals={setProcessGoals}
            />
          )}
          {view === "process" && (
            <ProcessGoalsPage
              trades={accountTrades}
              processGoals={processGoals}
              dailyProcess={dailyProcess}
              onSaveDailyProcess={async (data) => {
                // Verifica se já existe, atualiza ou insere
                const exists = dailyProcess.findIndex(
                  (dp) => dp.date === data.date,
                );
                const updated = [...dailyProcess];
                if (exists >= 0) updated[exists] = data;
                else updated.push(data);

                setDailyProcess(updated);
                await storageService.saveDailyProcess(updated);
              }}
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

      {/* Modal: Adicionar/Editar Trade */}
      {showAdd && (
        <AddTradeModal
          accountId={activeAccountId === "" ? accounts[0].id : activeAccountId}
          availableErrorTags={errorTags}
          availableEmotions={emotions}
          availableTimeframes={timeframes}
          availableMarkets={markets}
          setups={setups}
          strategies={strategies}
          initialTrade={editingTrade}
          onClose={() => {
            setShowAdd(false);
            setEditingTrade(null);
          }}
          onSave={async (savedTrade) => {
            let updatedTrades;
            if (editingTrade) {
              updatedTrades = trades.map((t) =>
                t.id === savedTrade.id ? savedTrade : t,
              );
            } else {
              updatedTrades = [savedTrade, ...trades];
            }

            setTrades(updatedTrades);
            await storageService.saveTrades(updatedTrades); // Persiste Trade

            setShowAdd(false);
            setEditingTrade(null);
          }}
        />
      )}

      {/* Modal: Setup */}
      {setupModal && (
        <SetupModal
          initial={setupModal === "new" ? null : setupModal}
          onClose={() => setSetupModal(null)}
          onSave={async (setup) => {
            const exists = setups.find((s) => s.id === setup.id);
            const updatedSetups = exists
              ? setups.map((s) => (s.id === setup.id ? setup : s))
              : [...setups, setup];

            setSetups(updatedSetups);
            await storageService.saveSetups(updatedSetups); // Persiste Setup

            setSetupModal(null);
          }}
          markets={markets}
          colors={colors}
          timeframes={timeframes}
        />
      )}

      {/* Modal: Strategy */}
      {strategyModal && (
        <StrategyModal
          initial={strategyModal === "new" ? null : strategyModal}
          onClose={() => setStrategyModal(null)}
          onSave={async (strategy) => {
            const exists = strategies.find((s) => s.id === strategy.id);
            const updatedStrategies = exists
              ? strategies.map((s) => (s.id === strategy.id ? strategy : s))
              : [...strategies, strategy];

            setStrategies(updatedStrategies);
            await storageService.saveStrategies(updatedStrategies); // Persiste Strategy

            setStrategyModal(null);
          }}
          colors={colors}
        />
      )}

      {/* Lightbox Imagens */}
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
