const PREFIX = "dg:";

function safeParse(raw) {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export const storage = {
  get(key) {
    if (typeof window === "undefined") return null;
    return safeParse(window.localStorage.getItem(PREFIX + key));
  },
  set(key, value) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },
  remove(key) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(PREFIX + key);
  },
};

export const STORAGE_KEYS = {
  token: "token",
  user: "user",
  theme: "theme",
};
