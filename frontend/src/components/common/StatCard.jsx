import { cn } from "../../utils/helpers";

const TINTS = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-success/15 text-success",
};

export default function StatCard({ label, value, delta, icon: Icon, tint = "primary" }) {
  return (
    <div className="soft-shadow rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 truncate text-3xl font-bold tracking-tight">{value}</div>
          {delta && <div className="mt-1 text-xs text-success">{delta}</div>}
        </div>
        {Icon && (
          <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", TINTS[tint])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
