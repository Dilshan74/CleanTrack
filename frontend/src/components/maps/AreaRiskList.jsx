import { cn } from "../../utils/helpers";
import { RISK_TINT } from "../../utils/constants";

export default function AreaRiskList({ areas, actions, className }) {
  return (
    <div className={cn("grid gap-3", className)}>
      {areas.map((area) => (
        <div
          key={area.id}
          className="soft-shadow flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{area.name}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  RISK_TINT[area.risk],
                )}
              >
                {area.risk}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {area.reports} reports · PHI {area.phi}
            </div>
          </div>
          {actions?.(area)}
        </div>
      ))}
    </div>
  );
}
