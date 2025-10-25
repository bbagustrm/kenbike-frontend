import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { ApiResponse } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: string | null) => void;
    reject: (reason?: Error) => void;
}> = [];

const processQueue = (error: Error | null = null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

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
            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = Cookies.get("refresh_token");

            if (!refreshToken) {
                // No refresh token, clear everything and redirect
                console.error("No refresh token available");
                handleLogout();
                processQueue(new Error("No refresh token"), null);
                isRefreshing = false;
                return Promise.reject(error);
            }

            try {
                console.log("🔄 Attempting to refresh token...");

                // Try to refresh the token
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {
                        refresh_token: refreshToken,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                const { access_token, expires_in } = response.data.data;

                console.log("✅ Token refreshed successfully");

                // Calculate expiry time in days (expires_in is in seconds)
                const expiresInDays = expires_in / (60 * 60 * 24);

                // Save new access token
                Cookies.set("access_token", access_token, {
                    expires: expiresInDays,
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production",
                });

                // Update authorization header for current request
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }

                // Process queued requests
                processQueue(null, access_token);
                isRefreshing = false;

                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error("❌ Token refresh failed:", refreshError);

                // Refresh failed, logout user
                processQueue(refreshError as Error, null); // Cast ke Error untuk kejelasan
                isRefreshing = false;
                handleLogout();

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Helper function to handle logout
function handleLogout() {
    console.log("🚪 Logging out user...");

    // Clear all auth cookies
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user");

    // Redirect to login if we're on client side
    if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        // Don't redirect if already on auth pages
        if (!currentPath.startsWith("/login") &&
            !currentPath.startsWith("/register") &&
            !currentPath.startsWith("/forgot-password") &&
            !currentPath.startsWith("/reset-password")) {

            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
    }
}

// Helper function to handle API errors
export function handleApiError(error: unknown): { message: string; fieldErrors?: Record<string, string> } {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;

        // Default message
        let message = "An unexpected error occurred";
        const fieldErrors: Record<string, string> = {};

        // Get general message
        if (axiosError.response?.data?.message) {
            message = axiosError.response.data.message;
        } else if (axiosError.message) {
            message = axiosError.message;
        }

        // Get field-specific errors
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