import api from "./api";
import { STORAGE_KEYS, ROLES } from "../utils/constants";
import { delay } from "../utils/helpers";

function persist(token, user) {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function nameFromEmail(email) {
  const local = String(email).split("@")[0].replace(/[._-]+/g, " ");
  return local.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Log in. Attempts the real API first; on failure falls back to a mock login
 * that accepts any valid-looking credentials (handy without a backend).
 */
export async function login({ email, password, role = ROLES.USER }) {
  try {
    const { data } = await api.post("/auth/login", { email, password, role });
    persist(data.token, data.user);
    return data;
  } catch {
    await delay();
    const user = {
      id: `mock-${role}`,
      name: nameFromEmail(email),
      email,
      role,
    };
    const token = `mock.${role}.${Date.now()}`;
    persist(token, user);
    return { token, user };
  }
}

/** Register a new account. Mock mode signs the user straight in. */
export async function register({ name, email, password, role = ROLES.USER }) {
  try {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    persist(data.token, data.user);
    return data;
  } catch {
    await delay();
    const user = { id: `mock-${role}`, name, email, role };
    const token = `mock.${role}.${Date.now()}`;
    persist(token, user);
    return { token, user };
  }
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
