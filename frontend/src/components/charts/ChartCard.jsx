import { ResponsiveContainer } from "recharts";
import { cn } from "../../utils/helpers";

/** Card wrapper that gives a recharts chart a fixed, responsive height. */
export default function ChartCard({ title, description, height = "h-72", className, children }) {
  return (
    <div className={cn("soft-shadow rounded-2xl border border-border bg-card p-5", className)}>
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className={height}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  );
}
