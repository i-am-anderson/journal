import { Strategy, Trade } from "../types";

/* ══════════════════════════════════════════════════════════════════════
  CONSTANTS & SEED DATA
══════════════════════════════════════════════════════════════════════ */
export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const SEED_STRATEGIES: Strategy[] = [
  {
    id: "strat-breakout",
    name: "Breakout",
    description:
      "Captura movimentos direcionais explosivos quando o preço rompe níveis chave de suporte ou resistência com volume.",
    principles: [
      "Identificar consolidações claras de preço (caixas, triângulos, canais).",
      "Confirmar o rompimento com candle de força fechando fora da região.",
      "Volume financeiro deve estar acima da média móvel de 20 períodos.",
    ],
    color: "#34d399", // Emerald-400
  },
  {
    id: "strat-mean-reversion",
    name: "Mean Reversion",
    description:
      "Aposta que desvios extremos de preço em relação à média histórica tendem a retornar ao equilíbrio.",
    principles: [
      "Aguardar o preço atingir zonas extremas (RSI sobrecomprado/sobrevendido ou bandas de Bollinger).",
      "Buscar exaustão do movimento esticado antes de gatilhos de reversão.",
      "Alvos curtos e paradas técnicas logo atrás da máxima/mínima recente.",
    ],
    color: "#60a5fa", // Blue-400
  },
  {
    id: "strat-trend-follow",
    name: "Trend Follow",
    description:
      "Surfa a tendência macro dominante do mercado. Não tenta adivinhar topos ou fundos, apenas segue o fluxo do dinheiro.",
    principles: [
      "Operar estritamente a favor das médias móveis longas (ex: MMA 200).",
      "Entrar em pullbacks estruturais (correções saudáveis) a favor do movimento.",
      "Conduzir o stop de forma móvel (Trailing Stop) para maximizar os ganhos.",
    ],
    color: "#a78bfa", // Purple-400
  },
  {
    id: "strat-earnings-play",
    name: "Earnings Play",
    description:
      "Estratégia baseada em eventos corporativos, focando na volatilidade e reações pós-divulgação de balanços trimestrais.",
    principles: [
      "Analisar o histórico de reações e o gap esperado pelas opções.",
      "Gerenciar o tamanho da posição com rigor devido ao risco de gap extremo.",
      "Focar em empresas com alta liquidez institucional.",
    ],
    color: "#f59e0b", // Amber-500
  },
  {
    id: "strat-macro-hedge",
    name: "Macro Hedge",
    description:
      "Posições estruturais de longo prazo para proteção de portfólio baseadas em fundamentos macroeconômicos e correlação de ativos.",
    principles: [
      "Utilizar ativos correlacionados negativamente (ex: Ouro, Dólar, Puts).",
      "Dimensionamento baseado no risco do portfólio consolidado.",
      "Rebalanceamento periódico conforme mudanças de ciclos econômicos.",
    ],
    color: "#38bdf8", // Cyan-400
  },
  {
    id: "strat-scalp",
    name: "Scalp",
    description:
      "Operações ultrarrápidas de curtíssimo prazo no book de ofertas ou gráficos de micro-timeframes, buscando pequenas variações de preço.",
    principles: [
      "Focar em spreads curtos e alta frequência de execução.",
      "Disciplina rígida: stops minúsculos e execução mecânica.",
      "Evitar horários de baixa liquidez ou notícias de altíssimo impacto.",
    ],
    color: "#f43f5e", // Rose-500
  },
  {
    id: "strat-swing",
    name: "Swing",
    description:
      "Posicionamento técnico de médio prazo, segurando operações por dias ou semanas para capturar ciclos completos de oscilação.",
    principles: [
      "Análise baseada nos gráficos Diário (D1) e de 4 Horas (H4).",
      "Relação Risco x Retorno mínima inicial de 1:2 ou 1:3.",
      "Atenção ao risco de pernoite (overnight swap) e notícias semanais.",
    ],
    color: "#fb923c", // Orange-400
  },
  {
    id: "strat-other",
    name: "Other",
    description:
      "Categoria genérica para arquivar ideias experimentais, testes táticos ou abordagens fora do playbook principal.",
    principles: [
      "Documentar detalhadamente nas notas do trade o motivo da exceção.",
      "Utilizar tamanho de lote reduzido (mão leve) para testes.",
    ],
    color: "#94a3b8", // Slate-400
  },
];

export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "Daily", "Weekly"];

export const MARKETS = [
  "Stocks",
  "Crypto",
  "Forex",
  "Futures",
  "Options",
  "All",
];

export const SETUP_COLORS = [
  "#34d399",
  "#60a5fa",
  "#f59e0b",
  "#a78bfa",
  "#f87171",
  "#38bdf8",
  "#fb923c",
  "#e879f9",
];

export const SEED_SETUPS = [
  {
    id: "s1",
    name: "Bull Flag Breakout",
    description:
      "Buy the first pullback after a strong momentum move. Wait for consolidation and enter on breakout of the flag structure.",
    rules: [
      "Stock must have moved 5%+ on volume in prior session",
      "Consolidation of 2–5 candles on declining volume",
      "Enter on candle close above flag high",
      "Stop below flag low, target 1:2 R/R minimum",
    ],
    timeframe: "15m",
    markets: "Stocks",
    color: "#34d399",
  },
  {
    id: "s2",
    name: "HTF Support Bounce",
    description:
      "Fade to a key higher-timeframe support level and wait for a reversal candle confirmation before entering long.",
    rules: [
      "Level must be tested on daily or 4h chart",
      "Wait for bullish engulfing or hammer on lower TF",
      "Volume confirms at the level",
      "Risk to level low, target next HTF resistance",
    ],
    timeframe: "1h",
    markets: "All",
    color: "#60a5fa",
  },
  {
    id: "s3",
    name: "Macro Short Squeeze",
    description:
      "Use macro catalysts (CPI, FOMC) to position against crowded short trades near key resistance.",
    rules: [
      "High short interest >15% float",
      "Catalyst event expected within 48h",
      "Enter on pre-market strength above VWAP",
      "Tight stop below pre-market low",
    ],
    timeframe: "Daily",
    markets: "Stocks",
    color: "#f59e0b",
  },
];

export const SEED_TRADES: Trade[] = [
  {
    id: "t1",
    accountId: 1,
    date: "2026-06-01",
    symbol: "NVDA",
    side: "long",
    entry: 875.5,
    exit: 912.3,
    size: 10,
    stopLoss: 860,
    takeProfit: 920,
    pnl: 368,
    pnlPct: 4.2,
    strategy: "Breakout",
    setupId: "s1",
    status: "win",
    notes:
      "Strong earnings momentum. Broke key resistance at 880. Could have held longer — trail stop more aggressively next time.",
    images: [],
  },
  {
    id: "t2",
    accountId: 1,
    date: "2026-06-02",
    symbol: "AAPL",
    side: "short",
    entry: 189.2,
    exit: 192.8,
    size: 20,
    stopLoss: 193,
    takeProfit: 183,
    pnl: -72,
    pnlPct: -1.9,
    strategy: "Mean Reversion",
    setupId: "s2",
    status: "loss",
    notes:
      "Faded the gap up but buyers stepped in at 191 support. Setup was valid but market context was bullish on the day.",
    images: [],
  },
  {
    id: "t3",
    accountId: 1,
    date: "2026-06-03",
    symbol: "BTC/USD",
    side: "long",
    entry: 67450,
    exit: 71200,
    size: 0.5,
    stopLoss: 65000,
    takeProfit: 73000,
    pnl: 1875,
    pnlPct: 5.56,
    strategy: "Trend Follow",
    setupId: "s1",
    status: "win",
    notes:
      "ETF inflows driving momentum. Took partial at 70k, let runner go to target. Best trade of the month.",
    images: [],
  },
  {
    id: "t4",
    accountId: 1,
    date: "2026-06-04",
    symbol: "TSLA",
    side: "long",
    entry: 248.6,
    exit: 251.1,
    size: 15,
    pnl: 37.5,
    pnlPct: 1.0,
    strategy: "Scalp",
    setupId: "s1",
    status: "win",
    notes:
      "Quick intraday scalp on momentum breakout. Clean setup, clean exit.",
    images: [],
  },
  {
    id: "t5",
    accountId: 1,
    date: "2026-06-05",
    symbol: "SPY",
    side: "short",
    entry: 542.3,
    exit: 536.8,
    size: 5,
    stopLoss: 544,
    takeProfit: 535,
    pnl: 275,
    pnlPct: 1.01,
    strategy: "Macro Hedge",
    setupId: "s3",
    status: "win",
    notes:
      "CPI print above expectations. Shorted the dead cat bounce into resistance at 543. Textbook macro setup.",
    images: [],
  },
  {
    id: "t6",
    accountId: 1,
    date: "2026-06-06",
    symbol: "ETH/USD",
    side: "long",
    entry: 3280,
    exit: 3190,
    size: 2,
    stopLoss: 3150,
    takeProfit: 3500,
    pnl: -180,
    pnlPct: -2.74,
    strategy: "Trend Follow",
    setupId: "s2",
    status: "loss",
    notes:
      "Failed breakout above 3300 resistance. Should have waited for hourly close above the level. Lesson: patience over FOMO.",
    images: [],
  },
  {
    id: "t7",
    accountId: 1,
    date: "2026-06-09",
    symbol: "MSFT",
    side: "long",
    entry: 418.5,
    exit: 431.2,
    size: 8,
    stopLoss: 412,
    takeProfit: 435,
    pnl: 1016,
    pnlPct: 3.03,
    strategy: "Earnings Play",
    setupId: "s3",
    status: "win",
    notes:
      "AI product announcements post-Build conference. Partial at 425, let rest run to near target.",
    images: [],
  },
  {
    id: "t8",
    accountId: 1,
    date: "2026-06-10",
    symbol: "NVDA",
    side: "short",
    entry: 925.0,
    exit: 935.4,
    size: 5,
    stopLoss: 932,
    takeProfit: 905,
    pnl: -52,
    pnlPct: -1.12,
    strategy: "Mean Reversion",
    setupId: "s2",
    status: "loss",
    notes:
      "Tried to fade the extended move after 6% run. Momentum too strong. Stop hit quickly. Should respect the trend.",
    images: [],
  },
  {
    id: "t9",
    accountId: 1,
    date: "2026-06-11",
    symbol: "AAPL",
    side: "long",
    entry: 191.8,
    exit: 197.4,
    size: 25,
    stopLoss: 188,
    takeProfit: 200,
    pnl: 140,
    pnlPct: 2.92,
    strategy: "Breakout",
    setupId: "s1",
    status: "win",
    notes:
      "WWDC catalyst. Bought pre-announcement dip at support, sold into strength before close.",
    images: [],
  },
  {
    id: "t10",
    accountId: 2,
    date: "2026-06-12",
    symbol: "BTC/USD",
    side: "long",
    entry: 70100,
    exit: 72800,
    size: 0.3,
    stopLoss: 68000,
    takeProfit: 74000,
    pnl: 810,
    pnlPct: 3.85,
    strategy: "Trend Follow",
    setupId: "s1",
    status: "win",
    notes:
      "Continuation of bull trend. Added on retest of 70k breakout — perfect 3.5R.",
    images: [],
  },
];

export const SEED_ACCOUNTS = [
  { id: 1, name: "Daytrade (Futures)" },
  { id: 2, name: "Swing Trade (Stocks)" },
];
