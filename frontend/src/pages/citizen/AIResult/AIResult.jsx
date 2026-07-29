import { Droplets, Eye, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import ConfidenceBar from "../../../components/ai/ConfidenceBar";
import PredictionCard from "../../../components/ai/PredictionCard";
import { DETECTED_OBJECTS } from "../../../utils/constants";

const SUGGESTED_ACTIONS = [
  "Empty the container immediately",
  "Turn it upside down or dispose",
  "Apply larvicide to nearby areas",
  "Educate neighbours in the vicinity",
];

export default function AIResult() {
  return (
    <>
      <PageHeader title="AI Analysis Result" description="Report DG-1042 · Analysed in 2.3s" />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="soft-shadow overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/60">
            <div className="absolute inset-0 grid place-items-center text-6xl">🪣</div>
            <div className="absolute left-6 top-6 rounded-full border-2 border-destructive bg-destructive/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-destructive backdrop-blur">
              High Risk
            </div>
            <div className="absolute right-6 top-6 rounded-xl bg-background/85 px-3 py-1.5 text-xs font-medium backdrop-blur">
              🎯 Bounding boxes detected: 3
            </div>
            <div className="absolute inset-x-6 bottom-6 rounded-xl border border-border bg-background/85 p-3 text-xs backdrop-blur">
              <div className="font-semibold">AI Overlay</div>
              <p className="text-muted-foreground">
                Highlighted regions show suspected breeding indicators.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <PredictionCard confidence={92} risk="High" priority="Urgent" />
          <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-3 font-semibold">Detected Objects</h3>
            <div className="space-y-3">
              {DETECTED_OBJECTS.map((object) => (
                <ConfidenceBar key={object.label} label={object.label} value={object.conf} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Recommendation</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Immediate inspection recommended. Empty and dispose of the container within 24
            hours. Notify your local PHI office for follow-up.
          </p>
        </div>
        <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-info" />
            <h3 className="font-semibold">Suggested Actions</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {SUGGESTED_ACTIONS.map((action) => (
              <li key={action} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => toast.success("Sent to PHI for review")}>
          <Eye className="h-4 w-4" /> Send to PHI for Review
        </Button>
        <Button variant="outline" onClick={() => toast.success("Report downloaded")}>
          Download Report
        </Button>
      </div>
    </>
  );
}
