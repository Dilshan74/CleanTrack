import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Eye, FileSearch, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import PageHeader from "../../../components/common/PageHeader";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import Table from "../../../components/common/Table";
import { Select } from "../../../components/common/Field";
import { PHI_REPORTS, RISK_TINT } from "../../../utils/constants";
import { matchesQuery, paginate, totalPages } from "../../../utils/helpers";

const PER_PAGE = 5;

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Reviewed", label: "Reviewed" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
];

const RISK_OPTIONS = [
  { value: "all", label: "All risks" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

export default function ViewReports() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      PHI_REPORTS.filter(
        (report) =>
          matchesQuery(report, query, ["id", "name", "location"]) &&
          (status === "all" || report.status === status) &&
          (risk === "all" || report.risk === risk),
      ),
    [query, status, risk],
  );

  const pageCount = totalPages(filtered.length, PER_PAGE);
  const currentPage = Math.min(page, pageCount);
  const rows = paginate(filtered, currentPage, PER_PAGE);

  const columns = [
    {
      key: "id",
      header: "Report",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-lg">
            {row.image}
          </div>
          <span className="font-semibold">{row.id}</span>
        </div>
      ),
    },
    { key: "name", header: "Citizen", className: "whitespace-nowrap" },
    { key: "location", header: "Location", className: "whitespace-nowrap" },
    {
      key: "risk",
      header: "Risk",
      render: (row) => <Badge className={RISK_TINT[row.risk]}>{row.risk}</Badge>,
    },
    { key: "date", header: "Date", className: "whitespace-nowrap text-muted-foreground" },
    { key: "status", header: "Status", className: "whitespace-nowrap" },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button as={Link} to={`/phi/reports/${row.id}`} size="sm" variant="ghost" aria-label={`View ${row.id}`}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-success"
            aria-label={`Accept ${row.id}`}
            onClick={() => toast.success(`${row.id} accepted`)}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            aria-label={`Reject ${row.id}`}
            onClick={() => toast.error(`${row.id} rejected`)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button as={Link} to="/phi/visits" size="sm" variant="ghost" aria-label={`Visit ${row.id}`}>
            <MapPin className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Incoming Reports"
        description="Review AI-classified citizen submissions and take action"
      />
      <div className="soft-shadow rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <SearchBar
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search reports…"
            className="flex-1 sm:max-w-sm"
          />
          <Select
            className="h-10 w-44"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
          <Select
            className="h-10 w-40"
            value={risk}
            onChange={(event) => {
              setRisk(event.target.value);
              setPage(1);
            }}
            options={RISK_OPTIONS}
          />
        </div>

        <Table
          columns={columns}
          rows={rows}
          empty={
            <EmptyState
              icon={FileSearch}
              title="No reports match your filters"
              className="m-4"
            />
          }
        />

        {filtered.length > 0 && (
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            total={filtered.length}
            perPage={PER_PAGE}
            onChange={setPage}
          />
        )}
      </div>
    </>
  );
}
