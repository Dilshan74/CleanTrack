import axios from "axios";
import { storage, STORAGE_KEYS } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = storage.get(STORAGE_KEYS.token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.remove(STORAGE_KEYS.token);
      storage.remove(STORAGE_KEYS.user);
    }
    return Promise.reject(error);
  },
);

/** Unwrap `data` so services return payloads instead of axios responses. */
export const request = async (config) => (await api(config)).data;

export default api;
