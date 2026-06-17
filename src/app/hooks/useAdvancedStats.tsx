import { useMemo } from "react";

function useAdvancedStats(trades: any[]) {
  return useMemo(() => {
    if (!trades || trades.length === 0) return null;

    // Garante que os trades estejam em ordem cronológica
    const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));

    // Totais Básicos
    const pnls = sorted.map((t) => t.pnl);
    const totalPnl = pnls.reduce((sum, val) => sum + val, 0);
    const grossProfit = pnls
      .filter((v) => v > 0)
      .reduce((sum, v) => sum + v, 0);
    const grossLoss = Math.abs(
      pnls.filter((v) => v < 0).reduce((sum, v) => sum + v, 0),
    );
    const avgPnl = totalPnl / pnls.length;

    // Drawdown e Equity Curve
    let peak = 0;
    let running = 0;
    let maxDrawdown = 0;
    let ulcerSum = 0;

    // Variância para Sharpe e Sortino
    let varianceSum = 0;
    let downsideVarianceSum = 0;

    sorted.forEach((t) => {
      // Equity & Drawdown
      running += t.pnl;
      if (running > peak) peak = running;
      const drawdown = peak - running; // Absolute dollar drawdown
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      ulcerSum += drawdown * drawdown;

      // Desvio Padrão
      varianceSum += Math.pow(t.pnl - avgPnl, 2);
      if (t.pnl < 0) {
        downsideVarianceSum += Math.pow(t.pnl, 2); // Penaliza apenas retornos negativos
      }
    });

    // Cálculos Finais
    const stdDev = Math.sqrt(varianceSum / pnls.length);
    const downsideDev = Math.sqrt(downsideVarianceSum / pnls.length);

    const sharpe = stdDev === 0 ? 0 : avgPnl / stdDev;
    const sortino = downsideDev === 0 ? 0 : avgPnl / downsideDev;
    const profitFactor =
      grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
    const expectancy = totalPnl / pnls.length; // Expectativa matemática por trade ($)
    const recoveryFactor =
      maxDrawdown === 0 ? totalPnl : totalPnl / maxDrawdown;
    const ulcerIndex = Math.sqrt(ulcerSum / pnls.length);

    // Calmar Ratio (Anualizado)
    let calmar = 0;
    if (sorted.length > 1) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const start = new Date(sorted[0].date).getTime();
      const end = new Date(sorted[sorted.length - 1].date).getTime();
      const days = Math.max((end - start) / msPerDay, 1);
      const years = days / 365.25;
      const annReturn = totalPnl / years;
      calmar = maxDrawdown === 0 ? annReturn : annReturn / maxDrawdown;
    }

    // --- FUNÇÕES DE CLASSIFICAÇÃO AUTOMÁTICA ---
    const getRating = (
      val: number,
      good: number,
      excellent: number,
      invert = false,
    ) => {
      const isExcellent = invert ? val <= excellent : val >= excellent;
      const isGood = invert ? val <= good : val >= good;

      if (isExcellent)
        return {
          label: "Excelente",
          color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/10",
        };
      if (isGood)
        return {
          label: "Bom",
          color: "text-blue-400 border-blue-400/20 bg-blue-400/10",
        };
      return {
        label: "Atenção",
        color: "text-amber-400 border-amber-400/20 bg-amber-400/10",
      };
    };

    return {
      sharpe: { val: sharpe, rating: getRating(sharpe, 0.5, 1.0) }, // Ajustado para PnL por trade
      sortino: { val: sortino, rating: getRating(sortino, 1.0, 2.0) },
      profitFactor: {
        val: profitFactor,
        rating: getRating(profitFactor, 1.5, 2.0),
      },
      expectancy: {
        val: expectancy,
        rating: getRating(expectancy, 0, avgPnl * 1.5),
      },
      maxDrawdown: { val: maxDrawdown }, // Drawdown em Dólar é relativo, não recebe rating fixo
      calmar: { val: calmar, rating: getRating(calmar, 1.0, 3.0) },
      recoveryFactor: {
        val: recoveryFactor,
        rating: getRating(recoveryFactor, 2.0, 5.0),
      },
      ulcerIndex: { val: ulcerIndex },
    };
  }, [trades]);
}

export default useAdvancedStats;
