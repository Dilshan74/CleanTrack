import { MapPin, Navigation, Gauge, RefreshCw } from "lucide-react";
import { useLocation } from "../../hooks/useLocation";

function fmt(n, digits = 5) {
  return typeof n === "number" ? n.toFixed(digits) : "—";
}

export default function LiveLocation() {
  const { position, tracking, simulated, start, stop } = useLocation();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Location</h1>
          <p className="text-muted-foreground">
            Share your position so dispatch can track the route in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${tracking ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
            <span className={`h-2 w-2 rounded-full ${tracking ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
            {tracking ? "Tracking" : "Paused"}
          </span>
          <button onClick={tracking ? stop : start} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            <RefreshCw className="h-4 w-4" /> {tracking ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
          <div className="relative h-80 bg-gradient-to-br from-secondary to-accent/30 flex items-center justify-center">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="relative flex flex-col items-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Navigation className="h-6 w-6" />
              </span>
              <span className="mt-2 rounded-full bg-card px-3 py-1 text-xs shadow">
                TRK-07 · Route A
              </span>
            </div>
          </div>
          <div className="p-4 text-xs text-muted-foreground">
            {simulated
              ? "Simulated position (browser location unavailable or denied)."
              : "Live position from your device GPS."}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Current position</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <div className="text-muted-foreground text-xs">Coordinates</div>
                <div className="font-medium">{fmt(position?.lat)}, {fmt(position?.lng)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gauge className="h-4 w-4 text-primary" />
              <div>
                <div className="text-muted-foreground text-xs">Speed</div>
                <div className="font-medium">{position ? `${Math.round(position.speed)} km/h` : "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Navigation className="h-4 w-4 text-primary" />
              <div>
                <div className="text-muted-foreground text-xs">Heading</div>
                <div className="font-medium">{position ? `${Math.round(position.heading)}°` : "—"}</div>
              </div>
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              Updated: {position ? new Date(position.updatedAt).toLocaleTimeString() : "waiting…"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
