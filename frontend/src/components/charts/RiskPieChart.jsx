import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import ChartCard from "./ChartCard";
import theme from "../../theme/theme";

export default function RiskPieChart({ data, title = "Risk Levels" }) {
  return (
    <ChartCard title={title}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={4}>
          {data.map((slice) => (
            <Cell key={slice.name} fill={slice.color} />
          ))}
        </Pie>
        <Legend />
        <Tooltip contentStyle={theme.tooltipStyle} />
      </PieChart>
    </ChartCard>
  );
}
