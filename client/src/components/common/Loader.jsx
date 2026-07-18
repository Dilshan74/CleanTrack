import { Loader2 } from "lucide-react";
import { cn } from "../../utils/helpers";

/**
 * Spinner. Use inline (default) or full-screen.
 *   <Loader label="Loading…" />
 *   <Loader fullscreen />
 */
export default function Loader({ label = "Loading…", fullscreen = false }) {
  const content = (
    <div className="flex items-center gap-3 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullscreen ? "min-h-screen" : "py-16",
      )}
    >
      {content}
    </div>
  );
}
