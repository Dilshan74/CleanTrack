import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants";

/**
 * Shared Axios instance. Attaches the stored bearer token and clears the
 * session on 401 responses.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
    }
    return Promise.reject(error);
  },
);

/**
 * Try a live API request; if the backend is unreachable (or errors), resolve
 * with mock data so the UI keeps working during development.
 */
export async function withFallback(request, fallback) {
  try {
    const { data } = await request();
    return data;
  } catch {
    return typeof fallback === "function" ? fallback() : fallback;
  }
}

export default api;
