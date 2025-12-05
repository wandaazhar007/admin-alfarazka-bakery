// src/lib/apiClient.ts
import axios, { type InternalAxiosRequestConfig } from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5011/api";

const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

// Interceptor untuk inject Authorization header kalau ada token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("alfarazka_admin_token");

  if (token) {
    // Set Authorization header directly
    if (config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return config;
});

export default apiClient;