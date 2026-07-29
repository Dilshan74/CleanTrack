import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import theme from "../../theme/theme";

export default function MonthlyAreaChart({ data, title = "Monthly Statistics" }) {
  return (
    <ChartCard title={title}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="reportsGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="resolvedGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.6} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={theme.tooltipStyle} />
        <Area
          type="monotone"
          dataKey="reports"
          stroke="var(--primary)"
          fill="url(#reportsGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="resolved"
          stroke="var(--accent)"
          fill="url(#resolvedGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartCard>
  );
}
