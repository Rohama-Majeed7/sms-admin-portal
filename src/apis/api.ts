import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

// Request Interceptor: Attach Authorization Token & Log Requests
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} -> ${config.url}`);
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Global Errors & Log Responses
api.interceptors.response.use(
    (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.status} <- ${response.config.url}`);
        }
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                console.warn('[API Auth Error] Unauthorized - 401');
            } else if (status === 403) {
                console.warn('[API Auth Error] Forbidden - 403');
            } else if (status >= 500) {
                console.error('[API Server Error]', status);
            }
        } else if (error.request) {
            console.error('[API Network Error] No response received');
        }

        return Promise.reject(error);
    }
);

export default api;
