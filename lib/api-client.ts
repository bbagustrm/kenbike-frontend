// lib/api-client.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { ApiResponse } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

// Request interceptor - Add token to every request
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get("access_token");

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get("refresh_token");

                if (!refreshToken) {
                    // No refresh token, redirect to login
                    handleLogout();
                    return Promise.reject(error);
                }

                // Try to refresh the token
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const { access_token } = response.data.data;

                // Save new access token
                Cookies.set("access_token", access_token, {
                    expires: 1/96, // 15 minutes
                    sameSite: "lax",
                });

                // Retry the original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }

                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                handleLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Helper function to handle logout
function handleLogout() {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user");

    // Redirect to login if we're on client side
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}

// Helper function to handle API errors
export function handleApiError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;

        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }

        if (axiosError.response?.data?.errors && axiosError.response.data.errors.length > 0) {
            return axiosError.response.data.errors.map(err => err.message).join(", ");
        }

        if (axiosError.message) {
            return axiosError.message;
        }
    }

    return "An unexpected error occurred";
}

export default apiClient;