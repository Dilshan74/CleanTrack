import { Loader2 } from "lucide-react";
import { cn } from "../../utils/helpers";

export default function Loader({ label = "Loading…", className, fullscreen = false }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 text-sm text-muted-foreground",
        fullscreen ? "min-h-screen" : "py-10",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      {label}
    </div>
  );
}
