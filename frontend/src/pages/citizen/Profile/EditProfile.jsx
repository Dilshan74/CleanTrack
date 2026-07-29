import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import { FormField, Input, Textarea } from "../../../components/common/Field";
import { rules, validate } from "../../../utils/validators";

const INITIAL = {
  name: "Nimal Perera",
  email: "nimal@example.lk",
  mobile: "+94 77 123 4567",
  nic: "962541234V",
  address: "No 12, Temple Road, Nugegoda, Ward 12",
};

export default function EditProfile() {
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const onChange = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values, {
      name: [rules.required()],
      email: [rules.required(), rules.email()],
      mobile: [rules.required(), rules.mobile()],
      address: [rules.required()],
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    toast.success("Profile updated");
    navigate("/citizen/profile");
  };

  return (
    <>
      <PageHeader title="Edit Profile" description="Update your personal information" />
      <form
        onSubmit={submit}
        className="soft-shadow rounded-2xl border border-border bg-card p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full Name" htmlFor="name" error={errors.name}>
            <Input id="name" value={values.name} onChange={onChange("name")} error={errors.name} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" value={values.email} onChange={onChange("email")} error={errors.email} />
          </FormField>
          <FormField label="Mobile" htmlFor="mobile" error={errors.mobile}>
            <Input id="mobile" value={values.mobile} onChange={onChange("mobile")} error={errors.mobile} />
          </FormField>
          <FormField label="NIC" htmlFor="nic">
            <Input id="nic" value={values.nic} onChange={onChange("nic")} />
          </FormField>
          <FormField label="Address" htmlFor="address" error={errors.address} className="sm:col-span-2">
            <Textarea
              id="address"
              className="min-h-[80px]"
              value={values.address}
              onChange={onChange("address")}
              error={errors.address}
            />
          </FormField>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => navigate("/citizen/profile")}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </>
  );
}
