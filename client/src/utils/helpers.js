/** Small, reusable helpers: class merging, formatting, and form validation. */

/** Merge conditional class names (tiny clsx-style helper). */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/** Initials from a name for avatar fallbacks. */
export function initials(name = "") {
  const parts = String(name).trim().split(/\s+/);
  if (!parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Format a Date (or ISO string) as e.g. "Wed, Jul 15". */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Generate a short reference id, e.g. "C-204". */
export function makeRef(prefix = "C") {
  return `${prefix}-${Math.floor(Math.random() * 900 + 100)}`;
}

/** Simulate network latency for mock services. */
export function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/* Lightweight form validation                                         */
/* ------------------------------------------------------------------ */

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isRequired(value) {
  return String(value ?? "").trim() !== "";
}

export function minLength(value, length) {
  return String(value || "").trim().length >= length;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (!minLength(password, 6))
    errors.password = "Password must be at least 6 characters.";
  return errors;
}

export function validateRegister({ name, email, password }) {
  const errors = {};
  if (!isRequired(name)) errors.name = "Name is required.";
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (!minLength(password, 6))
    errors.password = "Password must be at least 6 characters.";
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors || {}).length > 0;
}
