import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import { FormField, Select } from "../../../components/common/Field";

const FILTERS = [
  { label: "Month", options: ["January", "February", "July"] },
  { label: "Year", options: ["2024", "2025", "2026"] },
  { label: "District", options: ["All", "Colombo", "Gampaha", "Kandy"] },
  { label: "PHI", options: ["All", "I. Perera", "S. Fernando"] },
  { label: "Status", options: ["All", "Resolved", "Pending"] },
];

const PREVIEW = [
  ["Total reports", "1,204"],
  ["Resolved", "982"],
  ["Avg AI accuracy", "93.4%"],
  ["High risk zones", "12"],
];

export default function MonthlyReports() {
  return (
    <>
      <PageHeader
        title="Generate Monthly Reports"
        description="Filter and export system reports"
      />
      <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FILTERS.map((filter) => (
            <FormField key={filter.label} label={filter.label}>
              <Select options={filter.options} />
            </FormField>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => toast.success("PDF exported")}>
            <FileDown className="h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" onClick={() => toast.success("Excel exported")}>
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
          <Button variant="outline" onClick={() => toast.success("CSV exported")}>
            <FileText className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="soft-shadow mt-6 rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Preview — July 2026</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          {PREVIEW.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-muted/40 p-4">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-1 text-xl font-bold">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
