// ─── Primitivos e utilitários ────────────────────────────────────────────────

export type Side = "long" | "short";
export type Status = "win" | "loss" | "breakeven";
export type Tone = "green" | "red" | "neutral";

/** Handler genérico para setters simples — elimina repetição nos Props abaixo */
type Setter<T> = (value: T) => void;

// ─── Entidades de domínio ─────────────────────────────────────────────────────

export type Trade = {
  id: string;
  accountId: number;
  date: string;
  symbol: string;
  side: Side;
  entry: number;
  exit: number;
  size: number;
  pnl: number;
  pnlPct: number;
  strategy: string;
  setupId: string;
  status: Status;
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
  timeframe: string;
  markets: string;
};

export type Strategy = {
  id: string;
  name: string;
  description: string;
  principles: string[];
  color: string;
};

export type Account = {
  id: number;
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
};

export type DashboardPageProps = {
  trades: Trade[];
  stats: Stats;
  equityData: EquityPoint[];
  setups: Setup[];
  onViewAll: () => void;
  days: string[];
};

export type StatsPageProps = {
  stats: Stats;
  strategyStats: StrategyStats[];
  trades: Trade[];
  days: string[];
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

/** Cada par chave/setter gerado automaticamente por `ConfigsPageProps` */
type ConfigEntry<K extends string, T> = { [P in K]: T } & {
  [P in `set${Capitalize<K>}`]: Setter<T>;
};

export type ConfigsPageProps = ConfigEntry<"days", string[]> &
  ConfigEntry<"timeframes", string[]> &
  ConfigEntry<"markets", string[]> &
  ConfigEntry<"colors", string[]> &
  ConfigEntry<"errorTags", string[]> &
  ConfigEntry<"emotions", string[]>;

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
  accountId: number;
  setups: Setup[];
  strategies: Strategy[];
  onClose: () => void;
  onSave: (trade: Trade) => void;
  availableErrorTags: string[];
  availableEmotions: string[];
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
