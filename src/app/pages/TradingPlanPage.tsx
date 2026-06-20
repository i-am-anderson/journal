import { useState } from "react";
import { 
  Printer, 
  Clock, 
  ShieldAlert, 
  Zap, 
  LogOut, 
  CheckSquare, 
  FileSignature, 
  Award,
  Lock
} from "lucide-react";

function TradingPlanPage() {
  // Estados para tornar o plano preenchível antes de imprimir/salvar
  const [plan, setPlan] = useState({
    nome: "",
    dataInicio: "16/06/2026",
    mercado: "Mini Índice / Mini Dólar / Cripto",
    tempoGrafico: "5 min / 15 min",
    horario: "09:00 às 12:00",
    metaGain: "R$ 500,00",
    stopDiario: "R$ 250,00",
    capitalTotal: "R$ 10.000,00",
    riscoOperacao: "1%",
    prejuizoMaxTrade: "R$ 100,00",
    rrMinimo: "1:2",
    contexto: "Tendência macro a favor + VWAP e Médias Móveis",
    padrao: "Pivô de alta / Rejeição em região de suporte",
    volume: "Acima da média histórica no candle de gatilho",
    pontoEntrada: "Rompimento do candle gatilho com proteção na mínima",
    stopLoss: "Abaixo da mínima do padrão estrutural",
    takeProfit: "Duas vezes o risco projetado para cima",
    breakEven: "Proteger no zero a zero ao atingir 1R de ganho"
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      
      {/* Botão de Impressão (Ocultado no Print automático) */}
      <div className="flex items-center justify-between bg-secondary/20 p-4 rounded-xl border border-border print:hidden">
        <div>
          <h2 className="text-sm font-semibold">Plano de Trading Interativo</h2>
          <p className="text-xs text-muted-foreground">Preencha os seus parâmetros operacionais e clique em imprimir para gerar o PDF físico.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black rounded-lg text-sm font-semibold transition-colors shadow-lg"
        >
          <Printer size={16} />
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* ═══════════════ CORPO DO PLANO (FORMATADO PARA IMPRESSÃO) ═══════════════ */}
      <div className="bg-card border-2 border-border rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 print:border-0 print:shadow-none print:p-0">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-3 pb-4 border-b border-border">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-xs font-mono font-bold tracking-wider uppercase">
            <Award size={14} /> Disciplina Imbatível
          </div>
          <h1 className="text-3xl font-black tracking-tight font-mono uppercase text-foreground print:text-black">
            Meu Plano de Trading <span className="text-emerald-400 print:text-black">(Versão 2026)</span>
          </h1>
          
          {/* Regra de Ouro */}
          <div className="max-w-3xl mx-auto bg-secondary/50 border border-border/80 px-4 py-2.5 rounded-xl font-mono text-xs italic text-muted-foreground print:bg-gray-100 print:text-black print:border-gray-300">
            <span className="font-bold text-foreground print:text-black">Regra de Ouro:</span> “Se não está no plano, eu não faço. O mercado pune severamente a improvisação.”
          </div>
        </div>

        {/* Grid de Conteúdo Operacional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
          
          {/* COLUNA ESQUERDA */}
          <div className="space-y-6">
            
            {/* Bloco 1: Perfil Operacional e Rotina */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold font-mono tracking-wide uppercase text-emerald-400 border-b border-border pb-1 print:text-black print:border-black">
                <Clock size={16} /> 1. Perfil Operacional e Rotina
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">Mercado / Ativos:</span>
                  <input type="text" value={plan.mercado} onChange={e => setPlan({...plan, mercado: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">Tempo Gráfico:</span>
                  <input type="text" value={plan.tempoGrafico} onChange={e => setPlan({...plan, tempoGrafico: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">Horário de Operação:</span>
                  <input type="text" value={plan.horario} onChange={e => setPlan({...plan, horario: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">Meta de Parada Diária (Gain):</span>
                  <input type="text" value={plan.metaGain} onChange={e => setPlan({...plan, metaGain: e.target.value})} className="w-24 text-center bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-emerald-400 font-bold print:text-black print:border-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">Limite de Perda Diária (Stop):</span>
                  <input type="text" value={plan.stopDiario} onChange={e => setPlan({...plan, stopDiario: e.target.value})} className="w-24 text-center bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-red-400 font-bold print:text-black print:border-gray-400" />
                  <span className="text-[10px] text-muted-foreground italic">(Atingiu o limite? Desliga a tela)</span>
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
                  <span className="text-muted-foreground whitespace-nowrap">Capital Total da Conta:</span>
                  <input type="text" value={plan.capitalTotal} onChange={e => setPlan({...plan, capitalTotal: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">Risco Máximo por Operação:</span>
                  <input type="text" value={plan.riscoOperacao} onChange={e => setPlan({...plan, riscoOperacao: e.target.value})} className="w-20 text-center bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">Prejuízo Máximo por Trade:</span>
                  <input type="text" value={plan.prejuizoMaxTrade} onChange={e => setPlan({...plan, prejuizoMaxTrade: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">Relação Risco/Ganho Mínima (R:R):</span>
                  <input type="text" value={plan.rrMinimo} onChange={e => setPlan({...plan, rrMinimo: e.target.value})} className="w-20 text-center bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
              </div>
            </div>

            {/* Bloco 3: Regras de Entrada (O Gatilho) */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold font-mono tracking-wide uppercase text-emerald-400 border-b border-border pb-1 print:text-black print:border-black">
                <Zap size={16} /> 3. Regras de Entrada (O Gatilho)
              </h3>
              <p className="text-[11px] italic text-muted-foreground">Eu só abrirei uma ordem se o mercado apresentar todas as seguintes condições:</p>
              <div className="space-y-2 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">• Contexto do Mercado:</span>
                  <input type="text" value={plan.contexto} onChange={e => setPlan({...plan, contexto: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">• O Padrão Gráfico / Operacional:</span>
                  <input type="text" value={plan.padrao} onChange={e => setPlan({...plan, padrao: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">• Confirmação de Volume / Indicadores:</span>
                  <input type="text" value={plan.volume} onChange={e => setPlan({...plan, volume: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">• Ponto de Entrada Exato:</span>
                  <input type="text" value={plan.pontoEntrada} onChange={e => setPlan({...plan, pontoEntrada: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA */}
          <div className="space-y-6">
            
            {/* Bloco 4: Regras de Saída e Gestão */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold font-mono tracking-wide uppercase text-emerald-400 border-b border-border pb-1 print:text-black print:border-black">
                <LogOut size={16} /> 4. Regras de Saída (Gestão da Ordem)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-semibold">🛡️ Onde fica o Stop Loss estrutural?</span>
                  <input type="text" value={plan.stopLoss} onChange={e => setPlan({...plan, stopLoss: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-semibold">🎯 Onde fica o Alvo (Take Profit)?</span>
                  <input type="text" value={plan.takeProfit} onChange={e => setPlan({...plan, takeProfit: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-semibold">⚙️ Regra de Proteção Ativa (Break-even / Trailing):</span>
                  <input type="text" value={plan.breakEven} onChange={e => setPlan({...plan, breakEven: e.target.value})} className="w-full bg-transparent border-b border-border/60 py-0.5 focus:outline-none focus:border-emerald-400 font-mono text-foreground print:text-black print:border-gray-400" />
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
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded accent-emerald-400" />
                  <span>Tirar um print do gráfico e registrar o trade salvando o contexto completo.</span>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded accent-emerald-400" />
                  <span>Preencher o DearMarket informando o erro técnico ou execução perfeita.</span>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded accent-emerald-400" />
                  <span>Responder com sinceridade: <span className="text-foreground font-bold print:text-black">"Eu segui 100% das regras estipuladas neste plano?"</span></span>
                </div>
              </div>
            </div>

            {/* Bloco 6: Assinatura de Compromisso */}
            <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border border-border/80 print:bg-transparent print:border-black print:p-0">
              <h3 className="flex items-center gap-2 text-sm font-bold font-mono tracking-wide uppercase text-foreground print:text-black">
                <FileSignature size={16} /> Assinatura de Compromisso
              </h3>
              <p className="text-[11px] leading-relaxed text-muted-foreground font-mono print:text-black">
                Eu, <input type="text" placeholder="[Seu Nome Completo]" value={plan.nome} onChange={e => setPlan({...plan, nome: e.target.value})} className="px-2 w-44 text-center bg-transparent border-b border-border font-bold text-foreground focus:outline-none focus:border-emerald-400 print:text-black print:border-black" />, 
                declaro formalmente que este plano operacional é a minha lei soberana dentro do mercado financeiro. Comprometo-me a segui-lo cegamente, agindo com a frieza de um executor técnico e blindando-me contra as tentações emocionais da ganância e do medo.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 text-[11px] font-mono">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Data de início:</span>
                  <input type="text" value={plan.dataInicio} onChange={e => setPlan({...plan, dataInicio: e.target.value})} className="bg-transparent border-b border-border/60 py-0.5 focus:outline-none text-foreground print:text-black print:border-black" />
                </div>
                <div className="flex flex-col justify-end border-b border-border/60 pb-0.5 print:border-black">
                  <span className="text-[9px] text-muted-foreground tracking-widest text-center uppercase italic">(Assinatura do Operador)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Rodapé Interno do Documento */}
        <div className="pt-4 border-t border-border flex justify-between items-center text-[9px] font-mono text-muted-foreground print:text-black print:border-black">
          <span>TRADING DISCIPLINADO — AMBIENTE PROFISSIONAL</span>
          <span className="flex items-center gap-1"><Lock size={10} /> PROTEJA SEU CAPITAL</span>
        </div>

      </div>

      {/* CSS Injetado específico para a impressão perfeita */}
      <style>{`
        @media print {
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