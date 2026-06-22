import { useState, useEffect } from "react";
import {
  Printer,
  Clock,
  ShieldAlert,
  Zap,
  LogOut,
  CheckSquare,
  FileSignature,
  Award,
  Lock,
  Save,
  RotateCcw,
} from "lucide-react";
import { TradingPlanPageProps } from "../types";
import { DEFAULT_TRADING_PLAN } from "../helpers/constants";

function TradingPlanPage({
  tradingPlan,
  setTradingPlan,
}: TradingPlanPageProps) {
  const [justSaved, setJustSaved] = useState(false);

  // Autosave: cada alteração é persistida localmente
  useEffect(() => {
    try {
      setJustSaved(true);
      const timeout = setTimeout(() => setJustSaved(false), 1500);
      return () => clearTimeout(timeout);
    } catch {
      // Armazenamento indisponível (ex: modo privado) — segue sem persistir
    }
  }, [tradingPlan]);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Restaurar o plano para os valores padrão? Isso substitui tudo o que você preencheu.",
      )
    ) {
      setTradingPlan(DEFAULT_TRADING_PLAN);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Botão de Impressão (Ocultado no Print automático) */}
      <div className="flex items-center justify-between bg-secondary/20 p-4 rounded-xl border border-border print:hidden">
        <div>
          <h2 className="text-sm font-semibold">Plano de Trading Interativo</h2>
          <p className="text-xs text-muted-foreground">
            Preencha os seus parâmetros operacionais e clique em imprimir para
            gerar o PDF físico (formato paisagem).
          </p>
          <p
            className={`text-[10px] font-mono mt-1 flex items-center gap-1 transition-opacity ${justSaved ? "opacity-100 text-emerald-400" : "opacity-0"}`}
          >
            <Save size={10} /> Salvo automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground border border-border rounded-lg text-xs font-semibold transition-colors"
            title="Restaurar valores padrão"
          >
            <RotateCcw size={14} />
            Resetar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black rounded-lg text-sm font-semibold transition-colors shadow-lg"
          >
            <Printer size={16} />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* ═══════════════ CORPO DO PLANO (FORMATADO PARA IMPRESSÃO) ═══════════════ */}
      <div className="bg-card border-2 border-border rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 print:border-0 print:shadow-none print:p-0">
        {/* Cabeçalho */}
        <div className="text-center space-y-3 pb-4 border-b border-border">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-xs font-mono font-bold tracking-wider uppercase">
            <Award size={14} /> Disciplina Imbatível
          </div>
          <h1 className="text-3xl font-black tracking-tight font-mono uppercase text-foreground print:text-black">
            Meu Plano de Trading{" "}
            <span className="text-emerald-400 print:text-black">
              (Versão 2026)
            </span>
          </h1>

          {/* Regra de Ouro */}
          <div className="max-w-3xl mx-auto bg-secondary/50 border border-border/80 px-4 py-2.5 rounded-xl font-mono text-xs italic text-muted-foreground print:bg-gray-100 print:text-black print:border-gray-300">
            <span className="font-bold text-foreground print:text-black">
              Regra de Ouro:
            </span>{" "}
            “Se não está no plano, eu não faço. O market pune severamente a
            improvisação.”
          </div>
        </div>

        {/* Grid de Conteúdo Operacional — 2 colunas na tela (esquerda/direita
            empilhadas como antes via grid-flow-col), 3 colunas na impressão
            em paisagem (lê-se em 2 linhas: "antes do trade" / "depois do trade") */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:grid-rows-3 md:grid-flow-col print:grid-cols-3 print:grid-rows-2 print:grid-flow-row print:gap-x-6 print:gap-y-5">
          {/* Bloco 1: Perfil Operacional e Rotina */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold font-mono tracking-wide uppercase text-emerald-400 border-b border-border pb-1 print:text-black print:border-black">
              <Clock size={16} /> 1. Perfil Operacional e Rotina
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">
                  Mercado / Ativos:
                </span>
                <input
                  type="text"
                  value={tradingPlan.market}
                  onChange={(e) =>
                    setTradingPlan({ ...tradingPlan, market: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">
                  Tempo Gráfico:
                </span>
                <input
                  type="text"
                  value={tradingPlan.timeframe}
                  onChange={(e) =>
                    setTradingPlan({
                      ...tradingPlan,
                      timeframe: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">
                  Horário de Operação:
                </span>
                <input
                  type="text"
                  value={tradingPlan.time}
                  onChange={(e) =>
                    setTradingPlan({ ...tradingPlan, time: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">
                  Meta de Parada Diária (Gain):
                </span>
                <input
                  type="text"
                  value={tradingPlan.metaGain}
                  onChange={(e) =>
                    setTradingPlan({ ...tradingPlan, metaGain: e.target.value })
                  }
                  className="w-24 text-center bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-emerald-400 font-bold print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">
                  Limite de Perda Diária (Stop):
                </span>
                <input
                  type="text"
                  value={tradingPlan.dailyStop}
                  onChange={(e) =>
                    setTradingPlan({
                      ...tradingPlan,
                      dailyStop: e.target.value,
                    })
                  }
                  className="w-24 text-center bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-red-400 font-bold print:text-black print:border-gray-400"
                />
                <span className="text-[10px] text-muted-foreground italic">
                  (Atingiu o limite? Desliga a tela)
                </span>
              </div>
            </div>
          </div>

          {/* Bloco 2: Gerenciamento de Capital e Risco */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold font-mono tracking-wide uppercase text-emerald-400 border-b border-border pb-1 print:text-black print:border-black">
              <ShieldAlert size={16} /> 2. Gerenciamento de Capital e Risco
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">
                  Capital Total da Conta:
                </span>
                <input
                  type="text"
                  value={tradingPlan.totalCapital}
                  onChange={(e) =>
                    setTradingPlan({
                      ...tradingPlan,
                      totalCapital: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">
                  Risco Máximo por Operação:
                </span>
                <input
                  type="text"
                  value={tradingPlan.riskReward}
                  onChange={(e) =>
                    setTradingPlan({
                      ...tradingPlan,
                      riskReward: e.target.value,
                    })
                  }
                  className="w-20 text-center bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">
                  Prejuízo Máximo por Trade:
                </span>
                <input
                  type="text"
                  value={tradingPlan.maxLossPerTrade}
                  onChange={(e) =>
                    setTradingPlan({
                      ...tradingPlan,
                      maxLossPerTrade: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">
                  Relação Risco/Ganho Mínima (R:R):
                </span>
                <input
                  type="text"
                  value={tradingPlan.riskReward}
                  onChange={(e) =>
                    setTradingPlan({
                      ...tradingPlan,
                      riskReward: e.target.value,
                    })
                  }
                  className="w-20 text-center bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Bloco 3: Regras de Entrada (O Gatilho) */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold font-mono tracking-wide uppercase text-emerald-400 border-b border-border pb-1 print:text-black print:border-black">
              <Zap size={16} /> 3. Regras de Entrada (O Gatilho)
            </h3>
            <p className="text-[11px] italic text-muted-foreground">
              Eu só abrirei uma ordem se o market apresentar todas as seguintes
              condições:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">
                  • Contexto do Mercado:
                </span>
                <input
                  type="text"
                  value={tradingPlan.context}
                  onChange={(e) =>
                    setTradingPlan({ ...tradingPlan, context: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">
                  • O Padrão Gráfico / Operacional:
                </span>
                <input
                  type="text"
                  value={tradingPlan.setup}
                  onChange={(e) =>
                    setTradingPlan({ ...tradingPlan, setup: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">
                  • Confirmação de Volume / Indicadores:
                </span>
                <input
                  type="text"
                  value={tradingPlan.volume}
                  onChange={(e) =>
                    setTradingPlan({ ...tradingPlan, volume: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">
                  • Ponto de Entrada Exato:
                </span>
                <input
                  type="text"
                  value={tradingPlan.entryPoint}
                  onChange={(e) =>
                    setTradingPlan({
                      ...tradingPlan,
                      entryPoint: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Bloco 4: Regras de Saída e Gestão */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold font-mono tracking-wide uppercase text-emerald-400 border-b border-border pb-1 print:text-black print:border-black">
              <LogOut size={16} /> 4. Regras de Saída (Gestão da Ordem)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-semibold">
                  🛡️ Onde fica o Stop Loss estrutural?
                </span>
                <input
                  type="text"
                  value={tradingPlan.stopLoss}
                  onChange={(e) =>
                    setTradingPlan({ ...tradingPlan, stopLoss: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-semibold">
                  🎯 Onde fica o Alvo (Take Profit)?
                </span>
                <input
                  type="text"
                  value={tradingPlan.takeProfit}
                  onChange={(e) =>
                    setTradingPlan({
                      ...tradingPlan,
                      takeProfit: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-semibold">
                  ⚙️ Regra de Proteção Ativa (Break-even / Trailing):
                </span>
                <input
                  type="text"
                  value={tradingPlan.breakEven}
                  onChange={(e) =>
                    setTradingPlan({
                      ...tradingPlan,
                      breakEven: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Bloco 5: Rotina Pós-Mercado */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold font-mono tracking-wide uppercase text-emerald-400 border-b border-border pb-1 print:text-black print:border-black">
              <CheckSquare size={16} /> 5. Rotina Pós-Mercado (O Diário)
            </h3>
            <div className="space-y-2 text-xs font-mono text-muted-foreground print:text-black">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 rounded accent-emerald-400"
                />
                <span>
                  Tirar um print do gráfico e registrar o trade salvando o
                  context completo.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 rounded accent-emerald-400"
                />
                <span>
                  Preencher o DearMarket informando o erro técnico ou execução
                  perfeita.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 rounded accent-emerald-400"
                />
                <span>
                  Responder com sinceridade:{" "}
                  <span className="text-foreground font-bold print:text-black">
                    "Eu segui 100% das regras estipuladas neste plano?"
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Bloco 6: Assinatura de Compromisso */}
          <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border border-border/80 print:bg-transparent print:border-black print:p-0">
            <h3 className="flex items-center gap-2 text-sm font-bold font-mono tracking-wide uppercase text-foreground print:text-black">
              <FileSignature size={16} /> Assinatura de Compromisso
            </h3>
            <p className="text-[11px] leading-relaxed text-muted-foreground font-mono print:text-black">
              Eu,{" "}
              <input
                type="text"
                placeholder="[Seu Nome Completo]"
                value={tradingPlan.name}
                onChange={(e) =>
                  setTradingPlan({ ...tradingPlan, name: e.target.value })
                }
                className="px-2 w-44 text-center bg-transparent border-b border-border font-bold text-foreground focus:outline-none focus:border-emerald-400 print:text-black print:border-black"
              />
              , declaro formalmente que este plano operacional é a minha lei
              soberana dentro do market financeiro. Comprometo-me a segui-lo
              cegamente, agindo com a frieza de um executor técnico e
              blindando-me contra as tentações emocionais da ganância e do medo.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 text-[11px] font-mono">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Data de início:</span>
                <input
                  type="text"
                  value={tradingPlan.startDate}
                  onChange={(e) =>
                    setTradingPlan({
                      ...tradingPlan,
                      startDate: e.target.value,
                    })
                  }
                  className="bg-transparent border-b border-border/60 py-0.5 focus:outline-none text-foreground print:text-black print:border-black"
                />
              </div>
              <div className="flex flex-col justify-end border-b border-border/60 pb-0.5 print:border-black">
                <span className="text-[9px] text-muted-foreground tracking-widest text-center uppercase italic">
                  (Assinatura do Operador)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Interno do Documento */}
        <div className="pt-4 border-t border-border flex justify-between items-center text-[9px] font-mono text-muted-foreground print:text-black print:border-black">
          <span>TRADING DISCIPLINADO — AMBIENTE PROFISSIONAL</span>
          <span>
            Gerado em {new Date().toLocaleDateString("pt-BR")} às{" "}
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Lock size={10} /> PROTEJA SEU CAPITAL
          </span>
        </div>
      </div>

      {/* CSS Injetado específico para a impressão perfeita */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          /* Oculta tudo que não faz parte do documento físico */
          header, aside, .print\\:hidden, button, nav {
            display: none !important;
          }
          main, .max-w-5xl {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          input {
            border-bottom: 1px solid #000 !important;
            color: #000 !important;
          }
          input[type="checkbox"] {
            border: 1px solid #000 !important;
            accent-color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default TradingPlanPage;
