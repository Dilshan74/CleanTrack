import { Search } from "lucide-react";
import { cn } from "../../utils/helpers";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  className,
  inputClassName,
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm",
          "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          inputClassName,
        )}
      />
    </div>
  );
}
