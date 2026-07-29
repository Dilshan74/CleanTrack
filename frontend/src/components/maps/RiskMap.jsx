import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../utils/helpers";
import { AREAS, RISK_MARKER } from "../../utils/constants";
import mapService from "../../services/mapService";

/** Schematic risk map: area markers positioned by percentage coordinates. */
export default function RiskMap({ areas = AREAS, compact = false }) {
  const locate = async () => {
    try {
      const { lat, lng } = await mapService.currentPosition();
      toast.success(`Centred on ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } catch {
      toast.error("Could not access your location");
    }
  };

  return (
    <div
      className={cn(
        "soft-shadow relative overflow-hidden rounded-2xl border border-border",
        compact ? "h-72" : "h-[520px]",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_50%),radial-gradient(circle_at_70%_70%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_55%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="risk-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--border)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#risk-map-grid)" />
        <path
          d="M0,60 Q200,120 400,80 T900,100"
          stroke="var(--accent)"
          strokeOpacity="0.4"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0,240 Q220,180 440,220 T900,260"
          stroke="var(--primary)"
          strokeOpacity="0.4"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {areas.map((area) => (
        <div
          key={area.id}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${area.x}%`, top: `${area.y}%` }}
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 border-background shadow-lg transition-transform group-hover:scale-125",
              RISK_MARKER[area.risk],
            )}
          >
            <MapPin className="h-4 w-4" />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            <div className="font-semibold">{area.name}</div>
            <div className="text-muted-foreground">
              {area.reports} reports · {area.risk} risk
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-xl border border-border bg-background/85 p-2 text-xs backdrop-blur">
        {["High", "Medium", "Low"].map((risk) => (
          <div key={risk} className="flex items-center gap-1.5 px-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", RISK_MARKER[risk])} />
            <span className="font-medium">{risk}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={locate}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl border border-border bg-background/90 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur hover:bg-background"
      >
        <Navigation className="h-3.5 w-3.5" />
        My Location
      </button>
    </div>
  );
}
