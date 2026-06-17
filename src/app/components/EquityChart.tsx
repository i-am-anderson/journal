import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { fmtPnl, pnlColor } from "../helpers/utils";

/* ══════════════════════════════════════════════════════════════════════
  SHARED UI
══════════════════════════════════════════════════════════════════════ */
function EquityChart({ data }: { data: any[] }) {
  const lastVal = data.length > 0 ? data[data.length - 1].pnl : 0;
  const lineColor = lastVal >= 0 ? "#34d399" : "#f87171";

  function CustomTooltip({
    active,
    payload,
  }: {
    active: boolean;
    payload: any[];
  }) {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    return (
      <div className="bg-[#1a1d27] border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
        <span className={pnlColor(val)}>{fmtPnl(val)}</span>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">
        Equity Curve
      </p>
      {data.length < 2 ? (
        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
          Log more trades to see your equity curve
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <XAxis dataKey="date" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
            <ReferenceLine
              y={0}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 3"
            />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default EquityChart;
