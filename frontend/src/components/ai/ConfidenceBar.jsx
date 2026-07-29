import ProgressBar from "../common/ProgressBar";
import { cn } from "../../utils/helpers";

export default function ConfidenceBar({ label, value, className, barClassName }) {
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-xs font-semibold text-muted-foreground">{value}%</span>
      </div>
      <ProgressBar value={value} className={cn("h-1.5", barClassName)} />
    </div>
  );
}
