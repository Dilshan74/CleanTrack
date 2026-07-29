import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, MapPin, ShieldCheck, User } from "lucide-react";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import PageHeader from "../../../components/common/PageHeader";
import ConfidenceBar from "../../../components/ai/ConfidenceBar";
import {
  CITIZEN_REPORTS,
  DETECTED_OBJECTS,
  RISK_TINT,
  STATUS_TINT,
} from "../../../utils/constants";

const TIMELINE = [
  { label: "Report submitted", detail: "Photo uploaded and queued for AI analysis." },
  { label: "AI analysis completed", detail: "Classified as a breeding site with 92% confidence." },
  { label: "Assigned to PHI", detail: "Routed to the inspector responsible for the ward." },
  { label: "Inspection", detail: "Site visit scheduled and findings recorded." },
];

export default function ComplaintDetails() {
  const { id } = useParams();
  const report = CITIZEN_REPORTS.find((item) => item.id === id);

  if (!report) {
    return (
      <EmptyState
        title="Complaint not found"
        description={`No report matches ${id}.`}
        action={
          <Button as={Link} to="/citizen/track" variant="outline">
            Back to complaints
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title={`Complaint ${report.id}`}
        description={`${report.location} · submitted ${report.date}`}
        action={
          <Button as={Link} to="/citizen/track" variant="outline">
            <ArrowLeft className="h-4 w-4" /> All complaints
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="soft-shadow overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-muted to-muted/60 text-7xl">
              {report.image}
            </div>
            <div className="flex flex-wrap items-center gap-2 p-5">
              <Badge className={STATUS_TINT[report.status]}>{report.status}</Badge>
              <Badge className={RISK_TINT[report.risk]}>{report.risk} risk</Badge>
              <Badge>Updated {report.updated}</Badge>
            </div>
          </div>

          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-semibold">Progress</h3>
            <ol className="space-y-4">
              {TIMELINE.map((step, index) => (
                <li key={step.label} className="flex gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{step.label}</div>
                    <p className="text-sm text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-semibold">Details</h3>
            <div className="grid gap-3">
              {[
                { icon: MapPin, label: "Location", value: report.location },
                { icon: User, label: "Assigned PHI", value: report.phi },
                { icon: CalendarClock, label: "Submitted", value: report.date },
                { icon: ShieldCheck, label: "Risk level", value: report.risk },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl bg-muted/30 p-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="truncate text-sm font-medium">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold">AI Detected Objects</h3>
            <div className="space-y-3">
              {DETECTED_OBJECTS.map((object) => (
                <ConfidenceBar key={object.label} label={object.label} value={object.conf} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
