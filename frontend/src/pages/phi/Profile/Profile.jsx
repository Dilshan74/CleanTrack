import { useState } from "react";
import { toast } from "sonner";
import Avatar from "../../../components/common/Avatar";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import { FormField, Input } from "../../../components/common/Field";

const INITIAL = {
  name: "I. Perera",
  email: "i.perera@moh.lk",
  mobile: "+94 71 234 5678",
  area: "Nugegoda, Ward 12",
  employeeId: "PHI-201",
  region: "Colombo District",
};

const STATS = [
  { label: "Visits", value: "128", className: "" },
  { label: "Resolved", value: "92%", className: "text-success" },
  { label: "Rating", value: "4.8", className: "" },
];

export default function Profile() {
  const [values, setValues] = useState(INITIAL);

  const onChange = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    toast.success("Profile saved");
  };

  return (
    <>
      <PageHeader title="PHI Profile" description="Your inspector credentials and area assignment" />
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="soft-shadow rounded-2xl border border-border bg-card p-6 text-center">
          <Avatar name={values.name} className="mx-auto h-24 w-24 border-4" textClassName="text-2xl" />
          <h3 className="mt-4 text-lg font-semibold">Inspector {values.name}</h3>
          <p className="text-sm text-muted-foreground">
            {values.employeeId} · {values.area.split(",")[0]}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className={`text-lg font-bold ${stat.className}`}>{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="soft-shadow rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="name">
              <Input id="name" value={values.name} onChange={onChange("name")} />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <Input id="email" type="email" value={values.email} onChange={onChange("email")} />
            </FormField>
            <FormField label="Mobile" htmlFor="mobile">
              <Input id="mobile" value={values.mobile} onChange={onChange("mobile")} />
            </FormField>
            <FormField label="Assigned Area" htmlFor="area">
              <Input id="area" value={values.area} onChange={onChange("area")} />
            </FormField>
            <FormField label="Employee ID" htmlFor="employeeId">
              <Input id="employeeId" value={values.employeeId} onChange={onChange("employeeId")} />
            </FormField>
            <FormField label="Region" htmlFor="region">
              <Input id="region" value={values.region} onChange={onChange("region")} />
            </FormField>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </>
  );
}
