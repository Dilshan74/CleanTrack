import { useState } from "react";
import { ClipboardCheck, MapPin, Navigation, Phone, User } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import { Checkbox, Label, Select, Textarea } from "../../../components/common/Field";
import RiskMap from "../../../components/maps/RiskMap";
import { REPORT_STATUSES, VISIT_CHECKLIST } from "../../../utils/constants";

const CITIZEN_DETAILS = [
  { icon: User, label: "Name", value: "Nimal Perera" },
  { icon: Phone, label: "Mobile", value: "+94 77 123 4567" },
  { icon: MapPin, label: "Address", value: "No 12, Temple Rd, Nugegoda" },
  { icon: Navigation, label: "GPS", value: "6.8712° N, 79.8890° E" },
];

export default function VisitLocations() {
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(VISIT_CHECKLIST.map((item, index) => [item, index < 2])),
  );

  return (
    <>
      <PageHeader
        title="Visit Location — DG-1042"
        description="Nugegoda, Ward 12 · Citizen: Nimal Perera"
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <RiskMap compact />
          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-semibold">Citizen Details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {CITIZEN_DETAILS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl bg-muted/30 p-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="truncate text-sm font-medium">{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              as="a"
              href="https://www.google.com/maps/search/?api=1&query=6.8712,79.8890"
              target="_blank"
              rel="noreferrer"
              className="mt-4"
            >
              <Navigation className="h-4 w-4" /> Open in Maps
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Visit Checklist
            </h3>
            <div className="space-y-3">
              {VISIT_CHECKLIST.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <Checkbox
                    id={item}
                    checked={checked[item]}
                    onChange={(event) =>
                      setChecked((current) => ({ ...current, [item]: event.target.checked }))
                    }
                  />
                  <Label htmlFor={item} className="flex-1 cursor-pointer font-normal">
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-semibold">Update Status</h3>
            <div className="space-y-3">
              <Select defaultValue="Inspection Completed" options={REPORT_STATUSES} />
              <Textarea placeholder="Comments…" className="min-h-[90px]" />
              <Button className="w-full" onClick={() => toast.success("Status updated")}>
                Save Update
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
