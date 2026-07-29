import { useMemo, useState } from "react";
import { Plus, Power, Trash2, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import Modal from "../../../components/common/Modal";
import PageHeader from "../../../components/common/PageHeader";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import Table from "../../../components/common/Table";
import { FormField, Input, Select } from "../../../components/common/Field";
import { USERS } from "../../../utils/constants";
import { matchesQuery, paginate, totalPages } from "../../../utils/helpers";

const PER_PAGE = 5;

export default function ManageUsers() {
  const [users, setUsers] = useState(USERS);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(
    () => users.filter((user) => matchesQuery(user, query, ["id", "name", "email", "area"])),
    [users, query],
  );

  const pageCount = totalPages(filtered.length, PER_PAGE);
  const currentPage = Math.min(page, pageCount);
  const rows = paginate(filtered, currentPage, PER_PAGE);

  const toggleStatus = (id) =>
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
          : user,
      ),
    );

  const removeUser = (id) => {
    setUsers((current) => current.filter((user) => user.id !== id));
    toast.success(`${id} removed`);
  };

  const columns = [
    { key: "id", header: "ID", className: "font-mono text-xs" },
    { key: "name", header: "Name", className: "font-semibold" },
    { key: "email", header: "Email", className: "whitespace-nowrap text-muted-foreground" },
    { key: "role", header: "Role" },
    { key: "area", header: "Area" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          className={
            row.status === "Active"
              ? "bg-success/15 text-success"
              : "bg-muted text-muted-foreground"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    { key: "joined", header: "Joined", className: "whitespace-nowrap text-muted-foreground" },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Toggle status for ${row.name}`}
            onClick={() => toggleStatus(row.id)}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            aria-label={`Delete ${row.name}`}
            onClick={() => removeUser(row.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Manage Users"
        description={`${users.length} users`}
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add User
          </Button>
        }
      />
      <div className="soft-shadow rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <SearchBar
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search users…"
            className="max-w-sm"
          />
        </div>

        <Table
          columns={columns}
          rows={rows}
          empty={<EmptyState icon={UsersIcon} title="No users found" className="m-4" />}
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

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add user"
        description="Invite a citizen or staff member to the platform."
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddOpen(false);
                toast.success("Invitation sent");
              }}
            >
              Send invite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Full name" htmlFor="new-user-name">
            <Input id="new-user-name" placeholder="Nimal Perera" />
          </FormField>
          <FormField label="Email" htmlFor="new-user-email">
            <Input id="new-user-email" type="email" placeholder="you@example.com" />
          </FormField>
          <FormField label="Role" htmlFor="new-user-role">
            <Select id="new-user-role" options={["Citizen", "PHI", "Admin"]} />
          </FormField>
        </div>
      </Modal>
    </>
  );
}
