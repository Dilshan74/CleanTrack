import { AlertTriangle, Sparkles } from "lucide-react";
import Badge from "../common/Badge";
import ProgressBar from "../common/ProgressBar";
import { RISK_TINT } from "../../utils/constants";
import { cn } from "../../utils/helpers";

export default function PredictionCard({
  title = "Mosquito Breeding Site Detected",
  confidence = 0,
  risk = "High",
  priority = "Urgent",
  model,
}) {
  return (
    <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" /> AI Prediction
      </div>
      <h3 className="mt-2 text-2xl font-bold">{title}</h3>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-semibold text-primary">{confidence}%</span>
        </div>
        <ProgressBar value={confidence} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge className={cn(RISK_TINT[risk])}>
          <AlertTriangle className="h-3 w-3" /> {risk} Risk
        </Badge>
        <Badge className="bg-warning/15 text-warning">Priority: {priority}</Badge>
        {model && <Badge>Model {model}</Badge>}
      </div>
    </div>
  );
}
