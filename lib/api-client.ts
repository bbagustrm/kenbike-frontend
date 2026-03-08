// lib/api-client.ts

import axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { ApiResponse } from "@/types/auth";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

let isRefreshing = false;
let isLoggingOut = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null, token: unknown = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => config,
    (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        const skipRefreshEndpoints = [
            "/auth/login", "/auth/register", "/auth/refresh",
            "/auth/forgot-password", "/auth/reset-password", "/auth/logout",
        ];

        const isSkipRefreshEndpoint = skipRefreshEndpoints.some((ep) =>
            originalRequest.url?.includes(ep)
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
                processQueue(null, access_token);
                isRefreshing = false;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error("❌ Token refresh failed:", refreshError);
                processQueue(refreshError, null);
                isRefreshing = false;

                // ✅ Fire event — auth-context handles the actual logout & redirect
                // This prevents double logout (api-client redirect + auth-context logout)
                if (!isLoggingOut) {
                    isLoggingOut = true;
                    console.log("🚪 Firing auth:logout event...");
                    Cookies.remove("user", COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {});
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("auth:logout"));
                    }
                    setTimeout(() => { isLoggingOut = false; }, 3000);
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ============================================
// Error Handler
// ============================================

export interface ApiError extends Error {
    message: string;
    fieldErrors?: Record<string, string>;
    isAborted?: boolean;
}

export function handleApiError(error: unknown): ApiError {
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
// Request Management Utilities
// ============================================

const activeRequests = new Map<string, AbortController>();

export function createCancellableRequest(key: string): AbortSignal {
    cancelRequest(key);
    const controller = new AbortController();
    activeRequests.set(key, controller);
    return controller.signal;
}

export function cancelRequest(key: string): void {
    const controller = activeRequests.get(key);
    if (controller) {
        controller.abort();
        activeRequests.delete(key);
    }
}

export function cancelAllRequests(): void {
    activeRequests.forEach((controller) => controller.abort());
    activeRequests.clear();
}

export function isRequestActive(key: string): boolean {
    return activeRequests.has(key);
}

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

export interface RequestWithSignalConfig extends Omit<AxiosRequestConfig, "signal"> {
    signal?: AbortSignal;
}

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