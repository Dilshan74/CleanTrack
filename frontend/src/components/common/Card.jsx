import { cn } from "../../utils/helpers";

/** Surface container used across every dashboard page. */
export default function Card({ title, description, action, className, bodyClassName, children }) {
  return (
    <div
      className={cn(
        "soft-shadow rounded-2xl border border-border bg-card",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </div>
  );
}
