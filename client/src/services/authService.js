import api from "./api";
import { STORAGE_KEYS, ROLES } from "../utils/constants";

function persist(token, user) {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function nameFromEmail(email) {
  const local = String(email).split("@")[0].replace(/[._-]+/g, " ");
  return local.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Log in with real credentials. Throws on failure so the UI can show the error.
 */
export async function login({ email, password }) {
  // Note: role is NOT sent — the server returns the user's actual DB role.
  const { data } = await api.post("/auth/login", { email, password });
  // Backend returns user.fullName — normalize to `name` for consistent frontend use
  const user = {
    ...data.user,
    name: data.user.fullName || data.user.name || nameFromEmail(email),
  };
  persist(data.token, user);
  return { ...data, user };
}

/** Register a new resident account. Throws on failure (e.g. email already taken). */
export async function register({ name, email, password, phone, address, role = ROLES.USER }) {
  // Backend destructures `fullName`, `phone`, `address` — send with the correct keys
  const { data } = await api.post("/auth/register", {
    fullName: name,
    email,
    password,
    phone,
    address,
    role,
  });
  // Normalize the response user object (fullName → name)
  const user = {
    ...data.user,
    name: data.user?.fullName || data.user?.name || name,
  };
  persist(data.token, user);
  return { ...data, user };
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export default { login, register, logout, getStoredUser, getToken };
