import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { ApiResponse } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

const COOKIE_DOMAIN = '.kenbike.store'; // ✅ HTTPS

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

// Create axios instance
// >>> PERUBAHAN KRUSIAL: Tambahkan withCredentials: true <<<
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
    withCredentials: true, // Ini akan mengirim cookie ke api.kenbike.store
});

// Request interceptor - TIDAK PERLU lagi menambahkan token manual
// karena cookie akan dikirim otomatis oleh axios
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Kita tidak lagi perlu membaca token dan menyetel header Authorization
        // karena backend akan membacanya dari cookie.
        // Baris di bawah ini dihapus atau dikomentari.
        // const token = Cookies.get("access_token");
        // if (token && config.headers) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
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

        if (error.response?.status === 401 && !originalRequest._retry) {
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

                // >>> PERUBAHAN: Gunakan apiClient untuk refresh, karena ia sudah denganCredentials <<<
                const response = await apiClient.post("/auth/refresh", {
                    // Kita tidak perlu mengirim refresh_token di body,
                    // karena cookie-nya akan dikirim otomatis.
                });

                const { access_token, expires_in } = response.data.data;

                console.log("✅ Token refreshed successfully");

                const expiresInDays = expires_in / (60 * 60 * 24);

                Cookies.set("access_token", access_token, {
                    expires: expiresInDays,
                    sameSite: "lax",
                    secure: true,
                    domain: COOKIE_DOMAIN,
                });

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

// Helper function to handle logout
function handleLogout() {
    console.log("🚪 Logging out user...");

    // >>> PERUBAHAN: Hapus cookie dengan domain yang benar <<<
    Cookies.remove("access_token", { domain: COOKIE_DOMAIN });
    Cookies.remove("refresh_token", { domain: COOKIE_DOMAIN });
    Cookies.remove("user", { domain: COOKIE_DOMAIN });

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

// Helper function to handle API errors
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