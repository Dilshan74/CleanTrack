/** App-wide constants for CleanTrack. */

export const APP_NAME = import.meta.env.VITE_APP_NAME || "CleanTrack";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/** localStorage keys. */
export const STORAGE_KEYS = {
  token: "cleantrack_token",
  user: "cleantrack_user",
};

/** User roles supported by the app. */
export const ROLES = {
  USER: "user",
  DRIVER: "driver",
  ADMIN: "admin",
};

/** Default landing route per role. */
export const ROLE_HOME = {
  [ROLES.USER]: "/user",
  [ROLES.DRIVER]: "/driver",
  [ROLES.ADMIN]: "/admin",
};

export const WASTE_TYPES = [
  "Recyclables",
  "Organic waste",
  "General waste",
  "Bulk pickup",
];

export const COMPLAINT_CATEGORIES = [
  "Missed pickup",
  "Overflowing bin",
  "Damaged bin",
  "Driver behavior",
  "Other",
];
