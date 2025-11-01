"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { AuthService } from "@/services/auth.service";
import { handleApiError } from "@/lib/api-client";
import {
    User,
    LoginCredentials,
    RegisterData,
    UpdateProfileData,
    UpdatePasswordData,
} from "@/types/auth";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    updatePassword: (data: UpdatePasswordData) => Promise<void>;
    deleteProfileImage: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_DOMAIN = '.kenbike.store';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const isLoadingUser = useRef(false);
    const hasInitialized = useRef(false);

    const isAuthenticated = !!user;

    const logout = useCallback(async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // ✅ PERBAIKAN: Hanya hapus user cookie (yang bisa diakses JS)
            // access_token dan refresh_token akan di-clear oleh backend
            Cookies.remove("user", { domain: COOKIE_DOMAIN });
            setUser(null);
            hasInitialized.current = false;

            console.log("👋 Logged out successfully");

            const currentPath = pathname || "/";
            if (!currentPath.startsWith("/login")) {
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            }
        }
    }, [pathname, router]);

    // ✅ CRITICAL FIX: Jangan cek access_token (HttpOnly tidak bisa diakses JS)
    useEffect(() => {
        async function loadUser() {
            if (isLoadingUser.current || hasInitialized.current) {
                return;
            }

            isLoadingUser.current = true;

            try {
                // ✅ HANYA CEK USER COOKIE (yang bisa diakses JS)
                const userCookie = Cookies.get("user");

                console.log("🔍 Loading user...", {
                    hasCookie: !!userCookie
                });

                // ✅ Jika tidak ada user cookie, anggap belum login
                if (!userCookie) {
                    console.log("⚠️ No user cookie found");
                    setIsLoading(false);
                    hasInitialized.current = true;
                    isLoadingUser.current = false;
                    return;
                }

                // ✅ Load dari cookie (instant)
                try {
                    const cachedUser = JSON.parse(userCookie);
                    setUser(cachedUser);
                    console.log("✅ User loaded from cookie:", cachedUser.email);
                } catch (error) {
                    console.error("Error parsing user cookie:", error);
                }

                // ✅ Verify dengan backend (token ada di cookie, dikirim otomatis)
                try {
                    const response = await AuthService.getCurrentUser();
                    const freshUser = response.data;

                    if (freshUser) {
                        setUser(freshUser);

                        // Update cookie
                        Cookies.set("user", JSON.stringify(freshUser), {
                            expires: 7,
                            sameSite: "lax",
                            domain: COOKIE_DOMAIN,
                        });

                        console.log("✅ User verified from API:", freshUser.email);
                    }
                } catch (apiError) {
                    console.error("Failed to verify user from API:", apiError);

                    // ✅ CRITICAL: Jika 401, token invalid → logout
                    if (
                        apiError &&
                        typeof apiError === 'object' &&
                        'response' in apiError &&
                        apiError.response &&
                        typeof apiError.response === 'object' &&
                        'status' in apiError.response &&
                        apiError.response.status === 401
                    ) {
                        console.log("⚠️ Token invalid, logging out...");
                        Cookies.remove("user", { domain: COOKIE_DOMAIN });
                        setUser(null);
                    }
                    // Error lain (network, server down) → biarkan user cookie tetap ada
                    // User masih bisa navigate, tapi API call akan fail
                }
            } catch (error) {
                console.error("Failed to load user:", error);
            } finally {
                setIsLoading(false);
                hasInitialized.current = true;
                isLoadingUser.current = false;
            }
        }

        loadUser();
    }, []);

    // ✅ PERBAIKAN: Periodic check yang lebih aman
    useEffect(() => {
        if (!isAuthenticated || !hasInitialized.current) return;

        async function checkUserSession() {
            try {
                // Coba fetch user untuk verify session masih valid
                await AuthService.getCurrentUser();
            } catch (error) {
                if (
                    error &&
                    typeof error === 'object' &&
                    'response' in error &&
                    error.response &&
                    typeof error.response === 'object' &&
                    'status' in error.response &&
                    error.response.status === 401
                ) {
                    console.log("⚠️ Session expired, logging out...");
                    await logout();
                }
            }
        }

        // Check setiap 10 menit
        const interval = setInterval(() => {
            checkUserSession();
        }, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, [isAuthenticated, logout]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            const response = await AuthService.login(credentials);
            const { user: userData } = response.data!;

            // ✅ HANYA SIMPAN USER DATA (backend sudah set httpOnly cookies)
            setUser(userData);
            Cookies.set("user", JSON.stringify(userData), {
                expires: 7,
                sameSite: "lax",
                domain: COOKIE_DOMAIN,
            });

            console.log("✅ Login successful");

            hasInitialized.current = true;

            // Get redirect path
            const searchParams = new URLSearchParams(window.location.search);
            const redirect = searchParams.get("redirect");

            if (redirect) {
                router.push(redirect);
            } else if (userData.role === "ADMIN") {
                router.push("/admin/dashboard");
            } else if (userData.role === "OWNER") {
                router.push("/owner/dashboard");
            } else {
                router.push("/");
            }
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }, [router]);

    const register = useCallback(async (data: RegisterData) => {
        try {
            await AuthService.register(data);
            router.push("/login?registered=true");
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }, [router]);

    const updateProfile = useCallback(async (data: UpdateProfileData) => {
        try {
            const response = await AuthService.updateProfile(data);

            setUser((prevUser) => {
                if (!prevUser || !response.data) return prevUser;

                const updatedUser = { ...prevUser, ...response.data };
                Cookies.set("user", JSON.stringify(updatedUser), {
                    expires: 7,
                    sameSite: "lax",
                    domain: COOKIE_DOMAIN,
                });
                return updatedUser;
            });
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }, []);

    const updatePassword = useCallback(async (data: UpdatePasswordData) => {
        try {
            await AuthService.updatePassword(data);
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }, []);

    const deleteProfileImage = useCallback(async () => {
        try {
            await AuthService.deleteProfileImage();

            setUser((prevUser) => {
                if (!prevUser) return prevUser;

                const updatedUser = { ...prevUser, profile_image: undefined };
                Cookies.set("user", JSON.stringify(updatedUser), {
                    expires: 7,
                    sameSite: "lax",
                    domain: COOKIE_DOMAIN,
                });
                return updatedUser;
            });
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const response = await AuthService.getCurrentUser();
            const updatedUser = response.data;

            if (updatedUser) {
                setUser(updatedUser);
                Cookies.set("user", JSON.stringify(updatedUser), {
                    expires: 7,
                    sameSite: "lax",
                    domain: COOKIE_DOMAIN,
                });
            }
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                register,
                logout,
                updateProfile,
                updatePassword,
                deleteProfileImage,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
