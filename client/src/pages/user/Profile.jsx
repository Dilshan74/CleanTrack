import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import Loader from "../../components/common/Loader";
import userService from "../../services/userService";
import { initials } from "../../utils/helpers";

const fields = [
  ["name", "Full name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["nationalId", "National ID"],
  ["postalCode", "Postal Code"],
];

export default function Profile() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    userService.getProfile().then(setForm);
  }, []);

  if (!form) return <Loader label="Loading profile..." />;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await userService.updateProfile(form);
    setSaved(true);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image must be under 2MB.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const result = await userService.uploadProfilePicture(file);
      if (result?.profilePicture) {
        setForm((f) => ({ ...f, profilePicture: result.profilePicture }));
      }
    } catch (err) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 flex flex-col items-center text-center gap-3">

          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {form.profilePicture ? (
              <img
                src={form.profilePicture}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold ring-4 ring-primary/20">
                {initials(form.name)}
              </div>
            )}

            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {uploading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div>
            <div className="font-semibold">{form.name}</div>
            <div className="text-sm text-muted-foreground">Resident - {form.postalCode || "No postal code"}</div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            {uploading ? "Uploading..." : "Change photo"}
          </button>

          {uploadError && (
            <p className="text-xs text-destructive">{uploadError}</p>
          )}

          <p className="text-xs text-muted-foreground">JPG, PNG, WebP - Max 2MB</p>
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
