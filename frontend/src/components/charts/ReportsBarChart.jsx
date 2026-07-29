import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import theme from "../../theme/theme";

export default function ReportsBarChart({
  data,
  title = "Reports by Area",
  dataKey = "value",
  color = "var(--primary)",
  className,
}) {
  return (
    <ChartCard title={title} className={className}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={theme.tooltipStyle} />
        <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}
