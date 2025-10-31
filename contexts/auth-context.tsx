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

const COOKIE_DOMAIN = '.kenbike.store'; // ✅ Leading dot work di HTTPS

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // ✅ PERBAIKAN: Prevent multiple loadUser calls
    const isLoadingUser = useRef(false);
    const hasInitialized = useRef(false);

    const isAuthenticated = !!user;

    // Wrap logout in useCallback
    const logout = useCallback(async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear cookies and state
            Cookies.remove("access_token", { domain: COOKIE_DOMAIN });
            Cookies.remove("refresh_token", { domain: COOKIE_DOMAIN });
            Cookies.remove("user", { domain: COOKIE_DOMAIN });
            setUser(null);
            hasInitialized.current = false;

            console.log("👋 Logged out successfully");

            // Redirect to login
            const currentPath = pathname || "/";
            if (!currentPath.startsWith("/login")) {
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            }
        }
    }, [pathname, router]);

    // ✅ PERBAIKAN: Load user dengan protection
    useEffect(() => {
        async function loadUser() {
            // Prevent concurrent calls
            if (isLoadingUser.current || hasInitialized.current) {
                return;
            }

            isLoadingUser.current = true;

            try {
                const accessToken = Cookies.get("access_token");
                const userCookie = Cookies.get("user");

                console.log("🔍 Loading user...", {
                    hasToken: !!accessToken,
                    hasCookie: !!userCookie
                });

                if (!accessToken) {
                    console.log("⚠️ No access token found");
                    setIsLoading(false);
                    hasInitialized.current = true;
                    isLoadingUser.current = false;
                    return;
                }

                // Load from cookie first (instant)
                if (userCookie) {
                    try {
                        const cachedUser = JSON.parse(userCookie);
                        setUser(cachedUser);
                        console.log("✅ User loaded from cookie:", cachedUser.email);
                    } catch (error) {
                        console.error("Error parsing user cookie:", error);
                    }
                }

                // ✅ PERBAIKAN: Fetch dari API dengan error handling yang lebih baik
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

                        console.log("✅ User refreshed from API:", freshUser.email);
                    }
                } catch (apiError: any) {
                    console.error("Failed to fetch user from API:", apiError);

                    // ✅ CRITICAL: Jangan clear cookie jika error 401 dan user cookie masih valid
                    if (apiError?.response?.status === 401) {
                        console.log("⚠️ Token expired, but keeping user data for now");
                        // Biarkan refresh token interceptor yang handle
                    } else {
                        // Error lain, clear everything
                        console.log("❌ Clearing invalid session");
                        Cookies.remove("access_token", { domain: COOKIE_DOMAIN });
                        Cookies.remove("refresh_token", { domain: COOKIE_DOMAIN });
                        Cookies.remove("user", { domain: COOKIE_DOMAIN });
                        setUser(null);
                    }
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
    }, []); // ✅ Empty dependency array - run once

    // ✅ PERBAIKAN: Periodic token check yang lebih aman
    useEffect(() => {
        if (!isAuthenticated || !hasInitialized.current) return;

        async function checkTokenValidity() {
            const accessToken = Cookies.get("access_token");

            if (!accessToken) {
                console.log("⚠️ No access token found during check");
                // Jangan langsung logout, cek dulu refresh token
                const refreshToken = Cookies.get("refresh_token");
                if (!refreshToken) {
                    console.log("⚠️ No refresh token, logging out...");
                    await logout();
                }
                return;
            }

            try {
                const payload = JSON.parse(atob(accessToken.split(".")[1]));
                const expiresAt = payload.exp * 1000;
                const now = Date.now();

                if (expiresAt - now < 2 * 60 * 1000) {
                    console.log("⏰ Token expiring soon, will be auto-refreshed");
                }
            } catch (error) {
                console.error("❌ Error checking token validity:", error);
            }
        }

        const interval = setInterval(() => {
            checkTokenValidity();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [isAuthenticated, logout]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            const response = await AuthService.login(credentials);
            const { access_token, refresh_token, expires_in, user: userData } = response.data!;

            const accessTokenExpiryDays = expires_in / (60 * 60 * 24);

            // Save tokens
            Cookies.set("access_token", access_token, {
                expires: accessTokenExpiryDays,
                sameSite: "lax",
                secure: true,
                domain: COOKIE_DOMAIN,
            });

            Cookies.set("refresh_token", refresh_token, {
                expires: 7,
                sameSite: "lax",
                secure: true,
                domain: COOKIE_DOMAIN,
            });

            // Save user data
            setUser(userData);
            Cookies.set("user", JSON.stringify(userData), {
                expires: 7,
                sameSite: "lax",
                domain: COOKIE_DOMAIN,
            });

            console.log("✅ Login successful");
            console.log("🔑 Access token expires in:", expires_in, "seconds");

            // ✅ PERBAIKAN: Force set initialized flag
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