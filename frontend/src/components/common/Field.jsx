import { cn } from "../../utils/helpers";

export function Label({ className, children, ...props }) {
  return (
    <label className={cn("text-sm font-medium", className)} {...props}>
      {children}
    </label>
  );
}

export function Input({ className, icon: Icon, error, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <input
        className={cn(
          "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm",
          "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          Icon && "pl-10",
          error && "border-destructive",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-input bg-background p-3 text-sm",
        "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        error && "border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, options = [], children, ...props }) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children ??
        options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
    </select>
  );
}

export function Checkbox({ className, ...props }) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 rounded border-input accent-primary",
        className,
      )}
      {...props}
    />
  );
}

export function Switch({ checked, onChange, label, className, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-input",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform",
          checked ? "translate-x-5.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function FormField({ label, htmlFor, error, hint, className, children }) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
