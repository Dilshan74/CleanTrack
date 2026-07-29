import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, FileSearch } from "lucide-react";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import PageHeader from "../../../components/common/PageHeader";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import Table from "../../../components/common/Table";
import { Select } from "../../../components/common/Field";
import { CITIZEN_REPORTS, STATUS_TINT } from "../../../utils/constants";
import { matchesQuery, paginate, totalPages } from "../../../utils/helpers";

const PER_PAGE = 5;

export default function TrackComplaint() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      CITIZEN_REPORTS.filter(
        (report) =>
          matchesQuery(report, query, ["id", "location", "phi"]) &&
          (status === "all" || report.status === status),
      ),
    [query, status],
  );

  const pageCount = totalPages(filtered.length, PER_PAGE);
  const currentPage = Math.min(page, pageCount);
  const rows = paginate(filtered, currentPage, PER_PAGE);

  const columns = [
    { key: "id", header: "ID", className: "font-semibold" },
    {
      key: "image",
      header: "Image",
      render: (row) => (
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-lg">
          {row.image}
        </div>
      ),
    },
    { key: "date", header: "Date", className: "whitespace-nowrap text-muted-foreground" },
    { key: "location", header: "Location", className: "whitespace-nowrap" },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge className={STATUS_TINT[row.status]}>{row.status}</Badge>,
    },
    { key: "phi", header: "Assigned PHI", className: "whitespace-nowrap" },
    { key: "updated", header: "Last Updated", className: "whitespace-nowrap text-muted-foreground" },
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <Button as={Link} to={`/citizen/track/${row.id}`} size="sm" variant="ghost">
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Track your complaints"
        description="Every report you've submitted, in one place."
      />
      <div className="soft-shadow rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <SearchBar
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search by ID or location…"
            className="flex-1 sm:max-w-sm"
          />
          <Select
            className="h-10 w-48"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All statuses" },
              ...[...new Set(CITIZEN_REPORTS.map((report) => report.status))].map((value) => ({
                value,
                label: value,
              })),
            ]}
          />
        </div>

        <Table
          columns={columns}
          rows={rows}
          empty={
            <EmptyState
              icon={FileSearch}
              title="No complaints found"
              description="Try a different search term or status filter."
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
