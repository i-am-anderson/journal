export type Side = "long" | "short";

export type Status = "win" | "loss" | "open";

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

export type JournalPageProps = {
  trades: Trade[];
  setups: Setup[];
  strategies: Strategy[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onLightbox: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterSide: string;
  setFilterSide: (side: string) => void;
  filterStrategy: string;
  setFilterStrategy: (strategy: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterSetup: string;
  setFilterSetup: (setup: string) => void;
  filterDay: string;
  setFilterDay: (day: string) => void;
};

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

export type DashboardPageProps = {
  trades: Trade[];
  stats: Stats;
  equityData: EquityPoint[];
  setups: Setup[];
  onViewAll: () => void;
};

export type StrategyStats = {
  name: string;
  trades: number;
  pnl: number;
  winRate: number;
};

export type StatsPageProps = {
  stats: Stats;
  strategyStats: StrategyStats[];
  trades: Trade[];
};

export type SetupCardProps = {
  setup: Setup;
  tradeCount: number;
  winRate: number;
  pnl: number;
  onEdit: (setup: Setup) => void;
  onDelete: (id: string) => void;
};

export type SetupsPageProps = {
  setups: Setup[];
  trades: Trade[];
  onAddSetup: () => void;
  onEditSetup: (setup: Setup) => void;
  onDeleteSetup: (id: string) => void;
};

export type AddTradeModalProps = {
  setups: Setup[];
  strategies: Strategy[];
  onClose: () => void;
  onSave: (trade: any) => void;
};

export type SetupModalProps = {
  initial?: Partial<Setup>;
  onClose: () => void;
  onSave: (setup: Setup) => void;
};

export type Strategy = {
  id: string;
  name: string;
  description: string;
  principles: string[];
  color: string;
};

export type StrategyModalProps = {
  initial?: Strategy | null;
  onClose: () => void;
  onSave: (strategy: Strategy) => void;
};

export type StrategiesPageProps = {
  strategies: Strategy[];
  trades: Trade[];
  onAddStrategy: () => void;
  onEditStrategy: (strategy: Strategy) => void;
  onDeleteStrategy: (id: string) => void;
};

export type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "green" | "red" | "neutral";
  tooltip?: string;
  rating?: { label: string; color: string };
};

export type Account = {
  id: number;
  name: string;
}