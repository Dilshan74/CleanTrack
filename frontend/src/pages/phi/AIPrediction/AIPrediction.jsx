import { CalendarClock, Check, Flame, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import ProgressBar from "../../../components/common/ProgressBar";
import { FormField, Input, Select, Textarea } from "../../../components/common/Field";
import ConfidenceBar from "../../../components/ai/ConfidenceBar";
import { DETECTED_OBJECTS } from "../../../utils/constants";

const REJECTION_REASONS = [
  "Duplicate report",
  "Insufficient evidence",
  "Not a breeding site",
  "Out of jurisdiction",
];

export default function AIPrediction() {
  return (
    <>
      <PageHeader
        title="AI Prediction Review"
        description="Report DG-1042 · Submitted by Nimal Perera"
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="soft-shadow overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--destructive)_15%,transparent),transparent_60%),linear-gradient(180deg,var(--muted),color-mix(in_oklab,var(--muted)_50%,transparent))]">
            <div className="absolute inset-0 grid place-items-center text-7xl">🪣</div>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_18px,color-mix(in_oklab,var(--destructive)_10%,transparent)_18px,color-mix(in_oklab,var(--destructive)_10%,transparent)_20px)]" />
            <div className="absolute left-6 top-6 flex items-center gap-2 rounded-xl bg-destructive/95 px-3 py-1.5 text-xs font-bold uppercase text-destructive-foreground shadow-lg">
              <Flame className="h-3.5 w-3.5" /> AI Heatmap
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-semibold">Breeding Site Detection</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              High density of stagnant water indicators detected in upper-left region.
              Inspection priority recommended:{" "}
              <strong className="text-destructive">Urgent</strong>.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Confidence Score
            </div>
            <div className="mt-2 text-4xl font-bold">92%</div>
            <ProgressBar value={92} className="mt-3" />
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="bg-destructive/15 text-destructive">High Risk</Badge>
              <Badge className="bg-warning/15 text-warning">Urgent</Badge>
              <Badge>Model v2.4.1</Badge>
            </div>
          </div>

          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
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
        <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 font-semibold">Accept Report</h3>
          <div className="space-y-4">
            <FormField label="Visit Date" htmlFor="visit-date">
              <Input id="visit-date" type="date" defaultValue="2026-07-26" />
            </FormField>
            <FormField label="Notes" htmlFor="accept-notes">
              <Textarea
                id="accept-notes"
                placeholder="Add notes for the citizen…"
                className="min-h-[100px]"
              />
            </FormField>
            <Button
              className="w-full"
              onClick={() => toast.success("Report accepted — visit scheduled")}
            >
              <Check className="h-4 w-4" /> Confirm Acceptance
            </Button>
          </div>
        </div>

        <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 font-semibold">Reject Report</h3>
          <div className="space-y-4">
            <FormField label="Reason" htmlFor="reject-reason">
              <Select id="reject-reason" options={REJECTION_REASONS} />
            </FormField>
            <FormField label="Comments" htmlFor="reject-comments">
              <Textarea id="reject-comments" placeholder="Add comments…" className="min-h-[100px]" />
            </FormField>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => toast.error("Report rejected — citizen notified")}
            >
              <X className="h-4 w-4" /> Reject &amp; Notify Citizen
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={() => toast("Reschedule requested")}>
          <CalendarClock className="h-4 w-4" /> Reschedule
        </Button>
      </div>
    </>
  );
}
