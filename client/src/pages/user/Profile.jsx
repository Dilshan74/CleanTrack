import { useEffect, useState } from "react";
import Loader from "../../components/common/Loader";
import userService from "../../services/userService";
import { initials } from "../../utils/helpers";

const fields = [
  ["name", "Full name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["nationalId", "National ID"],
  ["address", "Address"],
  ["zone", "Zone"],
];

export default function Profile() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    userService.getProfile().then(setForm);
  }, []);

  if (!form) return <Loader label="Loading profile…" />;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await userService.updateProfile(form);
    setSaved(true);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal and address details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
            {initials(form.name)}
          </div>
          <div className="mt-3 font-semibold">{form.name}</div>
          <div className="text-sm text-muted-foreground">Resident · {form.zone}</div>
          <button className="mt-4 rounded-lg border px-3 py-2 text-sm hover:bg-muted">Change photo</button>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-xl border bg-card p-6 grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label]) => (
            <label key={key} className="text-sm">
              <span className="text-muted-foreground">{label}</span>
              <input
                value={form[key] ?? ""}
                onChange={(e) => update(key, e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          ))}
          <div className="sm:col-span-2 flex items-center justify-end gap-2">
            {saved && <span className="text-sm text-success mr-auto">Saved!</span>}
            <button type="button" className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
