
import axios from "axios";
import { store } from "../app/store";
import { logout } from "../features/auth/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isCredentialSubmission =
      requestUrl.endsWith("/api/auth/login") ||
      requestUrl.endsWith("/api/auth/register");

    if (error.response?.status === 401 && !isCredentialSubmission) {
      store.dispatch(logout());
    }

    return Promise.reject(error);
  }
);

export default api;
