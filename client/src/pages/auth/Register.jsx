import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, User, Mail, Lock, Phone, MapPin, Hash, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { APP_NAME, ROLES, ROLE_HOME } from "../../utils/constants";
import { validateRegister, hasErrors } from "../../utils/helpers";
import { useJsApiLoader } from "@react-google-maps/api";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    postalCode: "",
    role: ROLES.USER,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [geocodeTimeout, setGeocodeTimeout] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setServerError("");
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleAddressChange(val) {
    update("address", val);
    
    if (geocodeTimeout) clearTimeout(geocodeTimeout);
    
    const timeout = setTimeout(() => {
      if (!val || val.length < 5) return;
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: val }, (results, status) => {
          if (status === "OK" && results[0]) {
            let pCode = "";
            for (const component of results[0].address_components) {
              if (component.types.includes("postal_code")) {
                pCode = component.long_name;
                break;
              }
            }
            if (pCode) {
              setForm((f) => ({ ...f, postalCode: pCode }));
            }
          }
        });
      }
    }, 800);
    setGeocodeTimeout(timeout);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateRegister(form);
    setErrors(validation);
    if (hasErrors(validation)) return;

    try {
      const user = await register(form);
      navigate(ROLE_HOME[user.role] || "/", { replace: true });
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary to-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold">{APP_NAME}</span>
        </Link>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join {APP_NAME} to track pickups and report issues.
          </p>

          {serverError && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Full name */}
            <label className="block text-sm">
              <span className="text-muted-foreground">Full name</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <User className="h-4 w-4 text-muted-foreground" />
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-transparent py-2 outline-none"
                />
              </div>
              {errors.name && <span className="mt-1 block text-xs text-destructive">{errors.name}</span>}
            </label>

            {/* Email */}
            <label className="block text-sm">
              <span className="text-muted-foreground">Email</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent py-2 outline-none"
                />
              </div>
              {errors.email && <span className="mt-1 block text-xs text-destructive">{errors.email}</span>}
            </label>

            {/* Phone */}
            <label className="block text-sm">
              <span className="text-muted-foreground">Phone number</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-transparent py-2 outline-none"
                />
              </div>
              {errors.phone && <span className="mt-1 block text-xs text-destructive">{errors.phone}</span>}
            </label>

            {/* Address */}
            <label className="block text-sm">
              <span className="text-muted-foreground">Address</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={form.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="142 Galle Road, Colombo 03"
                  className="w-full bg-transparent py-2 outline-none"
                />
              </div>
              {errors.address && <span className="mt-1 block text-xs text-destructive">{errors.address}</span>}
            </label>

            {/* Postal Code */}
            <label className="block text-sm">
              <span className="text-muted-foreground">Postal Code</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  placeholder="e.g. 80000"
                  className="w-full bg-transparent py-2 outline-none"
                />
              </div>
              <span className="mt-1 block text-xs text-muted-foreground">Used to match your area's collection schedule.</span>
            </label>

            {/* Password */}
            <label className="block text-sm">
              <span className="text-muted-foreground">Password</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent py-2 outline-none"
                />
              </div>
              {errors.password && <span className="mt-1 block text-xs text-destructive">{errors.password}</span>}
            </label>

            {/* Role is always 'user' for self-registration.
                Drivers are added by admins; admin accounts are pre-created. */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
