<<<<<<< HEAD
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
=======
/**
 * Re-export the configured Axios instance from the services layer.
 * Import from here or directly from "../services/api" — both work.
 */
export { default } from "../services/api";
>>>>>>> origin/dev-dilshan
