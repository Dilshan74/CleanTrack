import { useEffect, useState } from "react";
import Loader from "../../components/common/Loader";
import userService from "../../services/userService";
import { COMPLAINT_CATEGORIES } from "../../utils/constants";

export default function ReportComplaint() {
  const [complaints, setComplaints] = useState(null);
  const [form, setForm] = useState({
    category: COMPLAINT_CATEGORIES[0],
    location: "42 Maple Ave, Elm District",
    description: "",
  });
  const [error, setError] = useState("");
  const [ref, setRef] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userService.getComplaints().then(setComplaints);
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.description.trim().length < 10) {
      setError("Please describe the issue (at least 10 characters).");
      return;
    }
    setError("");
    setSaving(true);
    const created = await userService.submitComplaint(form);
    setSaving(false);
    setRef(created.id);
    setComplaints((prev) => [
      { id: created.id, summary: form.description, status: "Reviewing" },
      ...(prev || []),
    ]);
    setForm((f) => ({ ...f, description: "" }));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Report a Complaint</h1>
        <p className="text-muted-foreground">Missed pickups, spilled waste, damaged bins — we&apos;ll get on it.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
          <label className="block text-sm">
            <span className="text-muted-foreground">Category</span>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            >
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-muted-foreground">Location</span>
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="block text-sm">
            <span className="text-muted-foreground">Description</span>
            <textarea
              rows={5}
              placeholder="Describe the issue…"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
          </label>

          <label className="block text-sm">
            <span className="text-muted-foreground">Attach photo (optional)</span>
            <input type="file" className="mt-1 block text-sm" />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, description: "" }))}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Submitting…" : "Submit complaint"}
            </button>
          </div>

          {ref && (
            <div className="rounded-lg bg-success/15 text-success p-3 text-sm">
              Complaint submitted. Reference #{ref}.
            </div>
          )}
        </form>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-3">Your recent complaints</h3>
          {!complaints ? (
            <Loader label="Loading…" />
          ) : (
            <ul className="space-y-3 text-sm">
              {complaints.map((c) => (
                <li key={c.id} className="rounded-lg bg-muted p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">#{c.id}</span>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${c.status === "Resolved" ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">{c.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
