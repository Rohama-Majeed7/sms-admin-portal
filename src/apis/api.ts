import axios from "axios";
import { logout } from "./auth/auth.service";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const user = JSON.parse(localStorage.getItem("user") || "null");

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh token ke liye separate axios instance
const refreshApi = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const errorMessage = error.response?.data?.message;

    if (
      error.response?.status === 401 &&
      errorMessage === "Access token expired" &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await refreshApi.post("/auth/refresh-token");

        const newAccessToken = response.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        logout(user?.email);

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;