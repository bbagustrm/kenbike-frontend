// lib/api-client.ts

import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { ApiResponse } from "@/types/auth";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

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
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        const skipRefreshEndpoints = [
            "/auth/login",
            "/auth/register",
            "/auth/refresh",
            "/auth/forgot-password",
            "/auth/reset-password",
        ];

        const isSkipRefreshEndpoint = skipRefreshEndpoints.some((endpoint) =>
            originalRequest.url?.includes(endpoint)
        );

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isSkipRefreshEndpoint
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch((err: AxiosError) => Promise.reject(err));
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
        if (
            !currentPath.startsWith("/login") &&
            !currentPath.startsWith("/register") &&
            !currentPath.startsWith("/forgot-password") &&
            !currentPath.startsWith("/reset-password")
        ) {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
    }
}

/**
 * Extended Error type with API-specific fields
 */
export interface ApiError extends Error {
    message: string;
    fieldErrors?: Record<string, string>;
    isAborted?: boolean;
}

/**
 * ✅ ENHANCED: Handle API errors with better typing
 */
export function handleApiError(error: unknown): ApiError {
    // Check if request was aborted
    if (axios.isCancel(error)) {
        const abortError = new Error("Request was cancelled") as ApiError;
        abortError.isAborted = true;
        return abortError;
    }

    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;
        let message = "An unexpected error occurred";
        const fieldErrors: Record<string, string> = {};

        if (axiosError.response?.data?.message) {
            message = axiosError.response.data.message;
        } else if (axiosError.message) {
            message = axiosError.message;
        }

        if (
            axiosError.response?.data?.errors &&
            Array.isArray(axiosError.response.data.errors)
        ) {
            axiosError.response.data.errors.forEach((err: { field?: string; message?: string }) => {
                if (err.field && err.message) {
                    fieldErrors[err.field] = err.message;
                }
            });
        }

        const apiError = new Error(message) as ApiError;
        apiError.fieldErrors = Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
        apiError.isAborted = false;
        return apiError;
    }

    const genericError = new Error("An unexpected error occurred") as ApiError;
    genericError.isAborted = false;
    return genericError;
}

// ============================================
// ✅ NEW: Request Management Utilities
// ============================================

/**
 * Store for active AbortControllers by request key
 */
const activeRequests = new Map<string, AbortController>();

/**
 * Create a cancellable request
 * Automatically cancels previous request with the same key
 *
 * @param key - Unique identifier for this request (e.g., "shipping-calculate")
 * @returns AbortSignal to pass to axios config
 *
 * @example
 * const signal = createCancellableRequest("shipping-calculate");
 * const response = await apiClient.post('/shipping', data, { signal });
 */
export function createCancellableRequest(key: string): AbortSignal {
    // Cancel previous request with same key
    cancelRequest(key);

    // Create new abort controller
    const controller = new AbortController();
    activeRequests.set(key, controller);

    return controller.signal;
}

/**
 * Cancel a specific request by key
 *
 * @param key - The request key to cancel
 */
export function cancelRequest(key: string): void {
    const controller = activeRequests.get(key);
    if (controller) {
        controller.abort();
        activeRequests.delete(key);
    }
}

/**
 * Cancel all active requests
 * Useful for cleanup on page navigation
 */
export function cancelAllRequests(): void {
    activeRequests.forEach((controller) => {
        controller.abort();
    });
    activeRequests.clear();
}

/**
 * Check if a specific request is active
 *
 * @param key - The request key to check
 */
export function isRequestActive(key: string): boolean {
    return activeRequests.has(key);
}

/**
 * Make a cancellable API request
 * Convenience wrapper that handles signal and cleanup
 *
 * @param key - Unique identifier for this request
 * @param requestFn - Function that makes the actual request
 * @returns Promise with the response
 *
 * @example
 * const data = await makeCancellableRequest(
 *   "shipping-calculate",
 *   (signal) => apiClient.post('/shipping', payload, { signal })
 * );
 */
export async function makeCancellableRequest<T>(
    key: string,
    requestFn: (signal: AbortSignal) => Promise<T>
): Promise<T> {
    const signal = createCancellableRequest(key);

    try {
        const result = await requestFn(signal);
        activeRequests.delete(key);
        return result;
    } catch (error) {
        activeRequests.delete(key);
        throw error;
    }
}

// ============================================
// ✅ NEW: Request with Signal Helper
// ============================================

export interface RequestWithSignalConfig extends Omit<AxiosRequestConfig, "signal"> {
    signal?: AbortSignal;
}

/**
 * Enhanced API client methods with built-in signal support
 */
export const api = {
    get: <T>(url: string, config?: RequestWithSignalConfig) =>
        apiClient.get<T>(url, config),

    post: <T, D = unknown>(url: string, data?: D, config?: RequestWithSignalConfig) =>
        apiClient.post<T>(url, data, config),

    put: <T, D = unknown>(url: string, data?: D, config?: RequestWithSignalConfig) =>
        apiClient.put<T>(url, data, config),

    patch: <T, D = unknown>(url: string, data?: D, config?: RequestWithSignalConfig) =>
        apiClient.patch<T>(url, data, config),

    delete: <T>(url: string, config?: RequestWithSignalConfig) =>
        apiClient.delete<T>(url, config),
};

export default apiClient;