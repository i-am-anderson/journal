import { Account, AppConfigs, Setup, Strategy, Trade } from "../types";
import { uid } from "./utils";

/* ══════════════════════════════════════════════════════════════════════
  CONFIGS
══════════════════════════════════════════════════════════════════════ */
export const DAYS = [
  "Domingo",
  "Segunda-Feira",
  "Terça-Feira",
  "Quarta-Feira",
  "Quinta-Feira",
  "Sexta-Feira",
  "Sábado",
];

export const TIMEFRAMES = ["1m", "5m", "10m", "15m", "1h", "4h", "D", "S", "M"];

export const MARKETS = [
  "Ações",
  "Cripto",
  "Forex",
  "Futuros",
  "Opções",
  "Todas",
];

export const COLORS = [
  "#34d399",
  "#60a5fa",
  "#f59e0b",
  "#a78bfa",
  "#f87171",
  "#38bdf8",
  "#fb923c",
  "#e879f9",
  "#94a3b8",
];

export const ERROR_TAGS = [
  // Emocionais / Disciplina
  "Antecipação", // Entrar antes do fechamento do candle de 10M
  "Fora do Setup", // Operar padrão não listado (ex: rompimento aleatório)
  "Mover Stop", // Violar a regra de não mover o stop contra a tendência
  "Overtrading", // Passar do limite de 3 trades no loss diário
  "Violou Limite Diário", // Continuar operando após atingir R$ 400 de loss

  // Execução / Técnica
  "Stop Curto", // Posicionar o stop sem critério técnico (ex: colado na mínima)
  "Gain Curto", // Alfacear (sair antes do alvo técnico ou da relação 2:1)
  "Contra a Nuvem", // Comprar abaixo ou vender acima da Nuvem de Kumo (sem alinhamento)
  "Troca de Timeframe", // Mudar o tempo gráfico para caçar entrada ou gerenciar trade
  "Sinal Fraco", // Entrar em um PFR ou 1,2,3 sem confluência com as linhas do Ichimoku
];

export const EMOTIONS = [
  // Estados Produtivos
  "Calmo", // Execução fria e dentro do plano
  "Focado", // Atenção plena aos fechamentos dos 10 minutos
  "Disciplinado", // Aceitou o stop ou o alvo sem interferência

  // Estados de Risco
  "Ansioso", // Vontade de clicar antes do candle fechar
  "Vingativo", // Desejo de recuperar um loss anterior (Risco de quebrar a regra de 3 trades)
  "Desatento", // Perdeu o fechamento do candle e entrou atrasado
  "Ganancioso", // Não realizou no alvo esperando um movimento milagroso
  "Hesitante", // Viu o setup perfeito (ex: PFR na Kijun), mas teve medo e não entrou
  "Frustrado", // Operando sob o impacto de um stop recente
];

/* ══════════════════════════════════════════════════════════════════════
  DEFAULT DATA
══════════════════════════════════════════════════════════════════════ */
export const DEFAULT_STRATEGIES: Strategy[] = [
  {
    id: "mqji7wmds41r1jg0rq8",
    name: "Ichimoku Price Action Fusion (IPAF 10M)",
    description:
      "Combina o rastreamento de tendência e o equilíbrio de mercado do Ichimoku Kinko Hyo com o timing preciso de gatilhos de Price Action no gráfico de 10 minutos.",
    principles: [
      "Alinhamento com a Nuvem (Kumo): Operar compras apenas se o preço estiver acima da nuvem e vendas apenas se o preço estiver abaixo da nuvem.",
      "Confluência com Linhas de Equilíbrio: O gatilho de Price Action deve ocorrer testando ou rejeitando a Kijun-sen (linha de 26 períodos) ou a Tenkan-sen (linha de 9 períodos).",
      "Gatilhos de Compra Homologados: Executar ordens exclusivamente através de 1,2,3 de compra, Inside Bar, 2 Bars Reversal ou Preço de Fechamento de Reversão (PFR) de alta.",
      "Gatilhos de Venda Homologados: Executar ordens exclusivamente através de 1,2,3 de venda, Inside Bar, 2 Bars Reversal ou Preço de Fechamento de Reversão (PFR) de baixa.",
      "Confirmação pelo Fechamento: A entrada só é válida após o fechamento completo do candle de 10 minutos que confirmou o padrão de reversão.",
      "Relação Risco x Retorno Mínima: Projetar alvos técnicos que ofereçam uma proporção de no mínimo 2:1 em relação ao tamanho do Stop Loss inicial.",
      "Filtro Espacial (Chikou Span): Validar se a linha Lagging Span (Chikou) está livre de obstáculos (preços passados) para confirmar o espaço livre para o movimento.",
    ],
    color: "#34d399", // Emerald-400
  },
  {
    id: "mqji7wmds41r1gj0rq8",
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

export const DEFAULT_SETUPS: Setup[] = [
  {
    id: "mqji7xr2q415enqfs01",
    name: "1,2,3 de Compra",
    description:
      "Padrão de fundo formado por 3 candles consecutivos onde o candle 2 possui a menor mínima, e a entrada ocorre no rompimento da máxima do candle 3, validado por suporte no Ichimoku.",
    rules: [
      "Identificar o candle 2 (mínima menor que a do candle 1 e do candle 3).",
      "O padrão deve se formar testando a Kijun-sen, Tenkan-sen ou a Nuvem (Kumo) como suporte.",
      "Entrada na violação da máxima do candle 3 (ou no seu fechamento).",
      "Stop Loss abaixo da mínima do candle 2 e Alvo mínimo de 2:1.",
    ],
    timeframe: "10m",
    markets: "Índice / Dólar / Ações",
    color: "#34d399",
  },
  {
    id: "mqji7xr2q415enqfs02",
    name: "1,2,3 de Venda",
    description:
      "Padrão de topo formado por 3 candles consecutivos onde o candle 2 possui a maior máxima, e a entrada ocorre no rompimento da mínima do candle 3, validado por resistência no Ichimoku.",
    rules: [
      "Identificar o candle 2 (máxima maior que a do candle 1 e do candle 3).",
      "O padrão deve se formar testando a Kijun-sen, Tenkan-sen ou a Nuvem (Kumo) como resistência.",
      "Entrada na violação da mínima do candle 3 (ou no seu fechamento).",
      "Stop Loss acima da máxima do candle 2 e Alvo mínimo de 2:1.",
    ],
    timeframe: "10m",
    markets: "Índice / Dólar / Ações",
    color: "#60a5fa",
  },
  {
    id: "mqji7xr2q415enqfs03",
    name: "Preço de Fechamento de Reversão - Compra",
    description:
      "Candle de sinal que faz uma mínima menor que as duas anteriores, mas fecha com corpo positivo e acima do fechamento do candle anterior, indicando exaustão da venda em zona de suporte.",
    rules: [
      "A mínima do candle atual deve ser estritamente menor do que a mínima dos dois candles anteriores.",
      "O fechamento atual deve ser maior do que o fechamento do candle anterior.",
      "O candle de sinal obrigatoriamente precisa ter corpo positivo (fechamento > abertura).",
      "O teste de mínima deve ocorrer sobre uma zona de suporte relevante do Ichimoku.",
      "Entrada no fechamento deste candle ou 1 tick acima de sua máxima, com stop abaixo de sua mínima.",
    ],
    timeframe: "10m",
    markets: "Índice / Dólar / Ações",
    color: "#f59e0b",
  },
  {
    id: "mqji7xr2q415enqfs04",
    name: "Preço de Fechamento de Reversão - Venda",
    description:
      "Candle de sinal que faz uma máxima maior que as duas anteriores, mas fecha com corpo negativo e abaixo do fechamento do candle anterior, indicando exaustão da compra em zona de resistência.",
    rules: [
      "A máxima do candle atual deve ser estritamente maior do que a máxima dos dois candles anteriores.",
      "O fechamento atual deve ser menor do que o fechamento do candle anterior.",
      "O candle de sinal obrigatoriamente precisa ter corpo negativo (fechamento < abertura).",
      "O teste de máxima deve ocorrer sobre uma zona de resistência relevante do Ichimoku.",
      "Entrada no fechamento deste candle ou 1 tick abaixo de sua mínima, com stop acima de sua máxima.",
    ],
    timeframe: "10m",
    markets: "Índice / Dólar / Ações",
    color: "#a78bfa",
  },
  {
    id: "mqji7xr2q415enqfs05",
    name: "Inside Bar",
    description:
      "Padrão de contração de volatilidade onde o candle atual (barra interna) está completamente contido dentro da máxima e mínima do candle anterior (barra mãe), operado a favor do viés do Ichimoku.",
    rules: [
      "A máxima do candle atual deve ser menor que a máxima anterior E a mínima atual deve ser maior que a mínima anterior.",
      "O preço deve estar nitidamente em tendência (acima ou abaixo da Nuvem de Kumo).",
      "Entrada no rompimento da barra mãe na direção da tendência principal ditada pelo Ichimoku.",
      "Stop do lado oposto da barra mãe (mais seguro) ou da barra interna (mais agressivo). Alvo de 2:1.",
    ],
    timeframe: "10m",
    markets: "Índice / Dólar / Ações",
    color: "#f87171",
  },
  {
    id: "mqji7xr2q415enqfs06",
    name: "2 Bars Reversal",
    description:
      "Padrão de forte rejeição composto por dois candles de tamanhos semelhantes e sentidos opostos, mostrando uma virada abrupta do mercado em zonas do Ichimoku.",
    rules: [
      "O primeiro candle é a favor do movimento prévio; o segundo candle abre e anula o movimento anterior quase por completo (fechando perto do extremo oposto).",
      "O ponto de inflexão/reversão deve cravar em uma linha de equilíbrio (preferencialmente Kijun-sen).",
      "Entrada no fechamento do segundo candle.",
      "Stop posicionado acima/abaixo do extremo da estrutura de duas barras. Alvo mínimo de 2:1.",
    ],
    timeframe: "10m",
    markets: "Índice / Dólar / Ações",
    color: "#38bdf8",
  },
];

export const DEFAULT_ACCOUNTS: Account[] = [{ id: uid(), name: "Default" }];

export const DEFAULT_CONFIGS: AppConfigs = {
  days: DAYS,
  timeframes: TIMEFRAMES,
  markets: MARKETS,
  colors: COLORS,
  errorTags: ERROR_TAGS,
  emotions: EMOTIONS,
  theme: "dark",
  activeAccountId: "", // All
  displayMode: "playbook",
};

export const DEFAULT_GOALS = [
  "Stop Loss Intocável", // É terminantemente proibido mover o Stop Loss contra a tendência ou aumentá-lo após a entrada na operação.
  "Fidelidade ao Tempo Gráfico", // Não alterar o timeframe especificado (10 minutos) para "procurar" entradas ou justificar operações fora do plano.
  "Limite Financeiro Diário", // Parar imediatamente o operacional ao atingir o Loss máximo diário de R$ 400.
  "Limite de Operações Perdedoras", // Não ultrapassar o limite estrito de 3 trades no loss diário (atingindo o terceiro loss consecutivo ou alternado, a plataforma deve ser fechada).
  "Execução Pró-Ativa", // Só boletar se o padrão de candle (ex: PFR ou Inside Bar) estiver perfeitamente desenhado e fechado; não antecipar violações.
];

/* ══════════════════════════════════════════════════════════════════════
  SEED DATA (Deprecated)
══════════════════════════════════════════════════════════════════════ */
// export const SEED_TRADES: Trade[] = [
//   {
//     id: "mqji7vhitgv74im5bc8",
//     accountId: "mqji7w533yuvsn9hd9u",
//     date: "2026-06-01T10:25:00.000",
//     symbol: "NVDA",
//     side: "long",
//     entry: 875.5,
//     exit: 912.3,
//     size: 10,
//     stopLoss: 860,
//     takeProfit: 920,
//     pnl: 368,
//     pnlPct: 4.2,
//     strategyId: "mqji7wmds41r1jg0rq8",
//     setupId: "mqji7xr2q415enqfsxr",
//     status: "win",
//     notes:
//       "Strong earnings momentum. Broke key resistance at 880. Could have held longer — trail stop more aggressively next time.",
//     images: [],
//   },
// ];
/* ══════════════════════════════════════════════════════════════════════
  SETUPS EXAMPLE
══════════════════════════════════════════════════════════════════════ */
// {
//   id: "mqji7xr2q415enqfsxr",
//   name: "Rompimento de Bandeira de Alta (15m)",
//   description:
//     "Compre o primeiro recuo após um forte movimento de impulso. Aguarde a consolidação e entre no rompimento da estrutura da bandeira.",
//   rules: [
//     "O ativo deve ter subido mais de 5% com volume na sessão anterior",
//     "Consolidação de 2 a 5 candles com volume decrescente",
//     "Entrar no fechamento do candle acima da máxima da bandeira",
//     "Stop abaixo da mínima da bandeira, alvo mínimo de 1:2 risco/retorno",
//   ],
//   timeframe: "15m",
//   markets: "Ações",
//   color: "#34d399",
// },
// {
//   id: "mqji7xr2q415enqfsxx",
//   name: "Repique em Suporte de Timeframe Superior (1h)",
//   description:
//     "Aguarde o preço atingir um nível-chave de suporte em um timeframe maior e espere a confirmação de um candle de reversão antes de entrar comprado.",
//   rules: [
//     "O nível deve ter sido testado no gráfico diário ou de 4h",
//     "Aguardar um engolfo de alta ou martelo em um timeframe menor",
//     "O volume deve confirmar a reação no nível",
//     "Risco até a mínima do suporte, alvo na próxima resistência de timeframe superior",
//   ],
//   timeframe: "1h",
//   markets: "Todos",
//   color: "#60a5fa",
// },
// {
//   id: "mqji7xr2q415enqfxxx",
//   name: "Short Squeeze Macroeconômico (1D)",
//   description:
//     "Utilize catalisadores macroeconômicos (CPI, FOMC) para se posicionar contra operações vendidas muito congestionadas próximas a resistências importantes.",
//   rules: [
//     "Alto interesse em posições vendidas (>15% do free float)",
//     "Evento catalisador previsto para as próximas 48h",
//     "Entrar com força no pré-market acima da VWAP",
//     "Stop curto abaixo da mínima do pré-market",
//   ],
//   timeframe: "Diário",
//   markets: "Ações",
//   color: "#f59e0b",
// },

/* ══════════════════════════════════════════════════════════════════════
  STRATEGIES EXAMPLE
══════════════════════════════════════════════════════════════════════ */
// {
//   id: "mqji7wmds41r1jg0rq8",
//   name: "Breakout",
//   description:
//     "Captura movimentos direcionais explosivos quando o preço rompe níveis chave de suporte ou resistência com volume.",
//   principles: [
//     "Identificar consolidações claras de preço (caixas, triângulos, canais).",
//     "Confirmar o rompimento com candle de força fechando fora da região.",
//     "Volume financeiro deve estar acima da média móvel de 20 períodos.",
//   ],
//   color: "#34d399", // Emerald-400
// },
// {
//   id: "mqji7jmds41r1jg0rq8",
//   name: "Mean Reversion",
//   description:
//     "Aposta que desvios extremos de preço em relação à média histórica tendem a retornar ao equilíbrio.",
//   principles: [
//     "Aguardar o preço atingir zonas extremas (RSI sobrecomprado/sobrevendido ou bandas de Bollinger).",
//     "Buscar exaustão do movimento esticado antes de gatilhos de reversão.",
//     "Alvos curtos e paradas técnicas logo atrás da máxima/mínima recente.",
//   ],
//   color: "#60a5fa", // Blue-400
// },
// {
//   id: "mqji7wmds41r1jg0rq3",
//   name: "Trend Follow",
//   description:
//     "Surfa a tendência macro dominante do mercado. Não tenta adivinhar topos ou fundos, apenas segue o fluxo do dinheiro.",
//   principles: [
//     "Operar estritamente a favor das médias móveis longas (ex: MMA 200).",
//     "Entrar em pullbacks estruturais (correções saudáveis) a favor do movimento.",
//     "Conduzir o stop de forma móvel (Trailing Stop) para maximizar os ganhos.",
//   ],
//   color: "#a78bfa", // Purple-400
// },
// {
//   id: "mqji7wmds00r1jg0rq8",
//   name: "Earnings Play",
//   description:
//     "Estratégia baseada em eventos corporativos, focando na volatilidade e reações pós-divulgação de balanços trimestrais.",
//   principles: [
//     "Analisar o histórico de reações e o gap esperado pelas opções.",
//     "Gerenciar o tamanho da posição com rigor devido ao risco de gap extremo.",
//     "Focar em empresas com alta liquidez institucional.",
//   ],
//   color: "#f59e0b", // Amber-500
// },
// {
//   id: "mqji7wmds41r1lg0rq8",
//   name: "Macro Hedge",
//   description:
//     "Posições estruturais de longo prazo para proteção de portfólio baseadas em fundamentos macroeconômicos e correlação de ativos.",
//   principles: [
//     "Utilizar ativos correlacionados negativamente (ex: Ouro, Dólar, Puts).",
//     "Dimensionamento baseado no risco do portfólio consolidado.",
//     "Rebalanceamento periódico conforme mudanças de ciclos econômicos.",
//   ],
//   color: "#38bdf8", // Cyan-400
// },
// {
//   id: "mqji7wmds41r1jg0rw0",
//   name: "Scalp",
//   description:
//     "Operações ultrarrápidas de curtíssimo prazo no book de ofertas ou gráficos de micro-timeframes, buscando pequenas variações de preço.",
//   principles: [
//     "Focar em spreads curtos e alta frequência de execução.",
//     "Disciplina rígida: stops minúsculos e execução mecânica.",
//     "Evitar horários de baixa liquidez ou notícias de altíssimo impacto.",
//   ],
//   color: "#f43f5e", // Rose-500
// },
// {
//   id: "mqji7wmds77r1jg0rq8",
//   name: "Swing",
//   description:
//     "Posicionamento técnico de médio prazo, segurando operações por dias ou semanas para capturar ciclos completos de oscilação.",
//   principles: [
//     "Análise baseada nos gráficos Diário (D1) e de 4 Horas (H4).",
//     "Relação Risco x Retorno mínima inicial de 1:2 ou 1:3.",
//     "Atenção ao risco de pernoite (overnight swap) e notícias semanais.",
//   ],
//   color: "#fb923c", // Orange-400
// },
