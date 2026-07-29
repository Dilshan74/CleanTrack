import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import PageHeader from "../../../components/common/PageHeader";
import ConfidenceBar from "../../../components/ai/ConfidenceBar";
import {
  DETECTED_OBJECTS,
  PHI_REPORTS,
  RISK_TINT,
  STATUS_TINT,
} from "../../../utils/constants";

export default function ReportDetails() {
  const { id } = useParams();
  const report = PHI_REPORTS.find((item) => item.id === id);
  const [status, setStatus] = useState(report?.status);

  if (!report) {
    return (
      <EmptyState
        title="Report not found"
        description={`No report matches ${id}.`}
        action={
          <Button as={Link} to="/phi/reports" variant="outline">
            Back to reports
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title={`Report ${report.id}`}
        description={`${report.location} · submitted by ${report.name}`}
        action={
          <Button as={Link} to="/phi/reports" variant="outline">
            <ArrowLeft className="h-4 w-4" /> All reports
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="soft-shadow overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-muted to-muted/60 text-7xl">
            {report.image}
          </div>
          <div className="flex flex-wrap items-center gap-2 p-5">
            <Badge className={RISK_TINT[report.risk]}>{report.risk} risk</Badge>
            <Badge className={STATUS_TINT[status]}>{status}</Badge>
            <Badge>{report.date}</Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold">AI Detected Objects</h3>
            <div className="space-y-3">
              {DETECTED_OBJECTS.map((object) => (
                <ConfidenceBar key={object.label} label={object.label} value={object.conf} />
              ))}
            </div>
          </div>

          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold">Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setStatus("Accepted");
                  toast.success(`${report.id} accepted`);
                }}
              >
                <Check className="h-4 w-4" /> Accept
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setStatus("Rejected");
                  toast.error(`${report.id} rejected`);
                }}
              >
                <X className="h-4 w-4" /> Reject
              </Button>
              <Button as={Link} to="/phi/visits" variant="outline">
                <MapPin className="h-4 w-4" /> Plan visit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
