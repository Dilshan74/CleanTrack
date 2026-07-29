import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import { FormField, Input, Select } from "../../../components/common/Field";

const FILTERS = [
  { label: "Area", options: ["All areas", "Nugegoda", "Kotte", "Dehiwala"] },
  { label: "Status", options: ["All statuses", "Completed", "Scheduled", "Resolved"] },
  { label: "Risk level", options: ["All levels", "High", "Medium", "Low"] },
];

export default function GenerateReports() {
  return (
    <>
      <PageHeader title="Generate Reports" description="Filter and export inspection data" />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Filters</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="From date" htmlFor="from-date">
              <Input id="from-date" type="date" defaultValue="2026-07-01" />
            </FormField>
            <FormField label="To date" htmlFor="to-date">
              <Input id="to-date" type="date" defaultValue="2026-07-28" />
            </FormField>
            {FILTERS.map((filter) => (
              <FormField key={filter.label} label={filter.label}>
                <Select options={filter.options} />
              </FormField>
            ))}
          </div>
        </div>

        <div className="soft-shadow rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-6">
          <h3 className="font-semibold">Export</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose an export format. The report will include all filtered records with
            charts.
          </p>
          <div className="mt-6 space-y-3">
            <Button
              className="w-full justify-start"
              onClick={() => toast.success("PDF report generated")}
            >
              <FileDown className="h-4 w-4" /> Download PDF
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.success("Excel exported")}
            >
              <FileSpreadsheet className="h-4 w-4" /> Download Excel
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" /> Print Report
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
