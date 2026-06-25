// ─── Primitivos e utilitários ────────────────────────────────────────────────

export type Side = "long" | "short";
export type Status = "win" | "loss" | "breakeven";
export type Tone = "green" | "red" | "neutral";
export type TradesView = "playbook" | "compact";
export const views = [
  "dashboard",
  "journal",
  "stats",
  "setups",
  "strategies",
  "process",
  "trading-plan",
  "configs",
] as const;

export type View = (typeof views)[number];

export const isView = (value: string): value is View =>
  views.includes(value as View);

/** Handler genérico para setters simples — elimina repetição nos Props abaixo */
type Setter<T> = (value: T) => void;

// ─── Entidades de domínio ─────────────────────────────────────────────────────

export type Trade = {
  id: string;
  accountId: string;
  date: string;
  symbol: string;
  side: Side;
  entry: number;
  exit: number;
  size: number;
  pnl: number;
  pnlPct: number;
  strategyId: string;
  setupId: string;
  status: Status;
  timeframe: string;
  market: string;
  exitDate?: string;
  stopLoss?: number;
  takeProfit?: number;
  notes?: string;
  images?: string[];
  emotion?: string;
  errorTags?: string[];
};

export type Setup = {
  id: string;
  name: string;
  color: string;
  description: string;
  rules: string[];
  timeframe: string[];
  markets: string[];
};

export type Strategy = {
  id: string;
  name: string;
  description: string;
  principles: string[];
  color: string;
};

export type Account = {
  id: string;
  name: string;
};

// ─── Agregados / derivados ────────────────────────────────────────────────────

export type Stats = {
  total: number;
  wins: number;
  losses: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  winRate: number;
  rr: number;
  bestTrade: number;
  worstTrade: number;
};

export type EquityPoint = {
  date: string;
  pnl: number;
};

export type StrategyStats = {
  name: string;
  trades: number;
  pnl: number;
  winRate: number;
};

export type DailyProcess = {
  date: string;
  checklist: Record<string, boolean>;
  notes: string;
  closed: boolean;
};

// ─── Props de páginas ─────────────────────────────────────────────────────────

/** Filtros do Journal — isolados para reaproveitamento */
export type JournalFilters = {
  searchQuery: string;
  setSearchQuery: Setter<string>;
  filterSide: string;
  setFilterSide: Setter<string>;
  filterStrategy: string;
  setFilterStrategy: Setter<string>;
  filterStatus: string;
  setFilterStatus: Setter<string>;
  filterSetup: string;
  setFilterSetup: Setter<string>;
  filterDay: string;
  setFilterDay: Setter<string>;
};

export type JournalPageProps = JournalFilters & {
  trades: Trade[];
  setups: Setup[];
  strategies: Strategy[];
  expandedId: string | null;
  setExpandedId: Setter<string | null>;
  onDelete: Setter<string>;
  onEditRequest: Setter<Trade>;
  onLightbox: Setter<string>;
  days: string[];
  displayMode: TradesView;
  setDisplayMode: Setter<TradesView>;
};

export type DashboardPageProps = {
  trades: Trade[];
  stats: Stats;
  equityData: EquityPoint[];
  setups: Setup[];
  strategies: Strategy[];
  onViewAll: () => void;
  days: string[];
  setView: Setter<View>;
};

export type StatsPageProps = {
  stats: Stats;
  strategyStats: StrategyStats[];
  trades: Trade[];
  days: string[];
  strategies: Strategy[];
  setups: Setup[];
};

export type SetupsPageProps = {
  setups: Setup[];
  trades: Trade[];
  onAddSetup: () => void;
  onEditSetup: Setter<Setup>;
  onDeleteSetup: Setter<string>;
};

export type StrategiesPageProps = {
  strategies: Strategy[];
  trades: Trade[];
  onAddStrategy: () => void;
  onEditStrategy: Setter<Strategy>;
  onDeleteStrategy: Setter<string>;
};

export type ProcessGoalsPageProps = {
  trades: Trade[];
  processGoals: string[];
  dailyProcess: DailyProcess[];
  onSaveDailyProcess: (data: DailyProcess) => void;
};

/** Cada par chave/setter gerado automaticamente por `ConfigsPageProps` */
type ConfigEntry<K extends string, T> = { [P in K]: T } & {
  [P in `set${Capitalize<K>}`]: Setter<T>;
};

export type ConfigsPageProps = ConfigEntry<"days", string[]> &
  ConfigEntry<"timeframes", string[]> &
  ConfigEntry<"markets", string[]> &
  ConfigEntry<"colors", string[]> &
  ConfigEntry<"errorTags", string[]> &
  ConfigEntry<"emotions", string[]> &
  ConfigEntry<"processGoals", string[]>;

// ─── Props de componentes ─────────────────────────────────────────────────────

export type SetupCardProps = {
  setup: Setup;
  tradeCount: number;
  winRate: number;
  pnl: number;
  onEdit: Setter<Setup>;
  onDelete: Setter<string>;
};

export type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  tone?: Tone;
  tooltip?: string;
  rating?: { label: string; color: string };
};

// ─── Props de modais ──────────────────────────────────────────────────────────

export type AddTradeModalProps = {
  initialTrade?: Partial<Trade>;
  accountId: string;
  setups: Setup[];
  strategies: Strategy[];
  onClose: () => void;
  onSave: (trade: Trade) => void;
  availableErrorTags: string[];
  availableEmotions: string[];
  availableTimeframes?: string[];
  availableMarkets?: string[];
};

export type SetupModalProps = {
  initial?: Partial<Setup>;
  onClose: () => void;
  onSave: Setter<Setup>;
  markets: string[];
  colors: string[];
  timeframes: string[];
};

export type StrategyModalProps = {
  initial?: Strategy | null;
  onClose: () => void;
  onSave: Setter<Strategy>;
  colors: string[];
};

export type AppConfigs = {
  days: string[];
  timeframes: string[];
  markets: string[];
  colors: string[];
  errorTags: string[];
  emotions: string[];
  activeAccountId: string;
  theme: "dark" | "light";
  displayMode: TradesView;
};

export type DailyProcessModalProps = {
  date: string;
  trades: Trade[];
  processGoals: string[];
  initialData: DailyProcess | null;
  onClose: () => void;
  onSave: (data: DailyProcess) => void;
};

export type JournalEntry = {
  date: string;
  dayGoals?: { text: string; checked: boolean }[];
  checkedGoals?: string[];
};

export type MonthlyProcessProgressProps = {
  entries: DailyProcess[];
  currentMonth: Date;
  currentGlobalGoalsCount: number;
};

export type NavItemsProps = {
  id: View;
  label: string;
  icon: React.JSX.Element;
};

export type StrategyCardProps = {
  strategy: Strategy;
  tradeCount: number;
  winRate: number;
  pnl: number;
  onEdit: Setter<Strategy>;
  onDelete: Setter<string>;
};

export type DefaultPlanProps = {
  name: string;
  startDate: string;
  market: string;
  timeframe: string;
  time: string;
  metaGain: string;
  dailyStop: string;
  totalCapital: string;
  operationRisk: string;
  maxLossPerTrade: string;
  riskReward: string;
  context: string;
  setup: string;
  volume: string;
  entryPoint: string;
  stopLoss: string;
  takeProfit: string;
  breakEven: string;
};

export type TradingPlanPageProps = {
  tradingPlan: DefaultPlanProps;
  setTradingPlan: React.Dispatch<React.SetStateAction<DefaultPlanProps>>;
};

export type MultiSelectComboboxProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};