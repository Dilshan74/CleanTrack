import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";

const PROFILE = {
  name: "Nimal Perera",
  email: "nimal@example.lk",
  mobile: "+94 77 123 4567",
  nic: "962541234V",
  address: "No 12, Temple Road, Nugegoda, Ward 12",
};

const STATS = [
  { label: "Reports", value: 12, className: "" },
  { label: "Approved", value: 7, className: "text-success" },
  { label: "Pending", value: 3, className: "text-warning" },
];

export default function Profile() {
  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your personal information and reporting history"
        action={
          <Button as={Link} to="/citizen/profile/edit">
            <Pencil className="h-4 w-4" /> Edit profile
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="soft-shadow rounded-2xl border border-border bg-card p-6 text-center">
          <Avatar name={PROFILE.name} className="mx-auto h-24 w-24 border-4" textClassName="text-2xl" />
          <h3 className="mt-4 text-lg font-semibold">{PROFILE.name}</h3>
          <p className="text-sm text-muted-foreground">{PROFILE.email}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className={`text-lg font-bold ${stat.className}`}>{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Personal details</h3>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Full Name", PROFILE.name],
              ["Email", PROFILE.email],
              ["Mobile", PROFILE.mobile],
              ["NIC", PROFILE.nic],
              ["Address", PROFILE.address],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-muted/30 p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </>
  );
}
