import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { ApiResponse } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null, token: unknown = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        const skipRefreshEndpoints = [
            '/auth/login',
            '/auth/register',
            '/auth/refresh',
            '/auth/forgot-password',
            '/auth/reset-password'
        ];

        const isSkipRefreshEndpoint = skipRefreshEndpoints.some(endpoint =>
            originalRequest.url?.includes(endpoint)
        );

        if (error.response?.status === 401 && !originalRequest._retry && !isSkipRefreshEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log("🔄 Attempting to refresh token...");

                const response = await apiClient.post("/auth/refresh", {});

                const { access_token } = response.data.data;

                console.log("✅ Token refreshed successfully");

                // ✅ NOTE: access_token is set by backend via httpOnly cookie
                // No need to manually set it here

                processQueue(null, access_token);
                isRefreshing = false;

                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error("❌ Token refresh failed:", refreshError);
                processQueue(refreshError, null);
                isRefreshing = false;
                handleLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

function handleLogout() {
    console.log("🚪 Logging out user...");

    // ✅ CHANGED: Conditional cookie removal based on environment
    Cookies.remove("user", COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {});

    if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/login") &&
            !currentPath.startsWith("/register") &&
            !currentPath.startsWith("/forgot-password") &&
            !currentPath.startsWith("/reset-password")) {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
    }
}

export function handleApiError(error: unknown): { message: string; fieldErrors?: Record<string, string> } {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;
        let message = "An unexpected error occurred";
        const fieldErrors: Record<string, string> = {};

        if (axiosError.response?.data?.message) {
            message = axiosError.response.data.message;
        } else if (axiosError.message) {
            message = axiosError.message;
        }

        if (axiosError.response?.data?.errors && Array.isArray(axiosError.response.data.errors)) {
            axiosError.response.data.errors.forEach(err => {
                if (err.field && err.message) {
                    fieldErrors[err.field] = err.message;
                }
            });
        }

        return { message, fieldErrors };
    }

    return { message: "An unexpected error occurred" };
}

export default apiClient;