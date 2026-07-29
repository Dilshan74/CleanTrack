import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import theme from "../../theme/theme";

export default function TrendLineChart({
  data,
  title,
  xKey = "name",
  dataKey = "value",
  color = "var(--primary)",
  domain,
  height,
  className,
}) {
  return (
    <ChartCard title={title} height={height} className={className}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis domain={domain} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={theme.tooltipStyle} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          dot={{ r: 5, fill: color }}
        />
      </LineChart>
    </ChartCard>
  );
}
