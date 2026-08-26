import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const API_URL = configuredApiUrl
  ? configuredApiUrl.endsWith("/api")
    ? configuredApiUrl
    : `${configuredApiUrl}/api`
  : "http://localhost:5000/api";

if (!configuredApiUrl) {
  console.error("[CONFIG ERROR] VITE_API_URL is not set in .env");
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30s timeout — prevents infinite hangs
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error / server down
      error.message = "Cannot connect to server. Please make sure the backend is running.";
    }
    return Promise.reject(error);
  }
);

export default api;
