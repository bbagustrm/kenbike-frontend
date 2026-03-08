"use client";

import {
    createContext, useContext, useState, useEffect,
    useCallback, ReactNode, useRef
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { AuthService } from "@/services/auth.service";
import { handleApiError } from "@/lib/api-client";
import {
    User, LoginCredentials, RegisterData,
    UpdateProfileData, UpdatePasswordData,
} from "@/types/auth";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isProfileComplete: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    updatePassword: (data: UpdatePasswordData) => Promise<void>;
    deleteProfileImage: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const isLoadingUser = useRef(false);
    const hasInitialized = useRef(false);

    const isAuthenticated = !!user;
    const isProfileComplete = user?.is_profile_complete ?? true;

    // ✅ Single logout function — used both internally and by api:logout event
    const logout = useCallback(async () => {
        try {
            await AuthService.logout();
        } catch {
            // ignore logout API error
        } finally {
            Cookies.remove("user", COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {});
            setUser(null);
            hasInitialized.current = false;
            console.log("👋 Logged out successfully");

            const currentPath = pathname || "/";
            if (!currentPath.startsWith("/login")) {
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            }
        }
    }, [pathname, router]);

    // ✅ Listen to auth:logout event dispatched by api-client interceptor
    // This way ONLY ONE logout happens — api-client fires event, auth-context handles it
    useEffect(() => {
        const handleForceLogout = () => {
            console.log("🔔 auth:logout event received");
            Cookies.remove("user", COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {});
            setUser(null);
            hasInitialized.current = false;

            const currentPath = window.location.pathname;
            if (!currentPath.startsWith("/login")) {
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            }
        };

        window.addEventListener("auth:logout", handleForceLogout);
        return () => window.removeEventListener("auth:logout", handleForceLogout);
    }, [router]);

    // ✅ Initial load — only runs once
    useEffect(() => {
        async function loadUser() {
            if (isLoadingUser.current || hasInitialized.current) return;
            isLoadingUser.current = true;

            try {
                const userCookie = Cookies.get("user");

                if (!userCookie) {
                    console.log("⚠️ No user cookie found");
                    return;
                }

                // Set from cookie immediately for fast UI
                try {
                    const cachedUser = JSON.parse(userCookie);
                    setUser(cachedUser);
                    console.log("✅ User loaded from cookie:", cachedUser.email);
                } catch {
                    console.error("Error parsing user cookie");
                    Cookies.remove("user", COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {});
                    return;
                }

                // Verify with API — interceptor handles refresh automatically
                // ✅ Do NOT catch 401 here — interceptor will:
                //    - Try refresh → if success, retries /auth/me → returns fresh user
                //    - If refresh fails → fires auth:logout event → handled above
                try {
                    const response = await AuthService.getCurrentUser();
                    const freshUser = response.data;
                    if (freshUser) {
                        setUser(freshUser);
                        Cookies.set("user", JSON.stringify(freshUser), {
                            expires: 7,
                            sameSite: "lax",
                            ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
                        });
                        console.log("✅ User verified from API:", freshUser.email);
                    }
                } catch (apiError) {
                    // ✅ Only non-401 errors land here (network error, 500, etc.)
                    // 401 is fully handled by interceptor + auth:logout event
                    console.error("API error verifying user (non-auth):", apiError);
                    // Keep user from cookie — don't force logout on network error
                }
            } finally {
                setIsLoading(false);
                hasInitialized.current = true;
                isLoadingUser.current = false;
            }
        }

        loadUser();
    }, []);

    // ✅ REMOVED: session check interval — completely unnecessary.
    // Every API request already goes through the interceptor which auto-refreshes.
    // The interval was causing extra /auth/me calls that triggered double logout.

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            const response = await AuthService.login(credentials);
            const { user: userData } = response.data!;

            setUser(userData);
            Cookies.set("user", JSON.stringify(userData), {
                expires: 7,
                sameSite: "lax",
                ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
            });

            console.log("✅ Login successful");
            hasInitialized.current = true;

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
        } catch (error: unknown) {
            const errorResponse = (error as { response?: { data?: { requires_verification?: boolean; email?: string } } })?.response?.data;
            if (errorResponse?.requires_verification && errorResponse?.email) {
                router.push(`/verify-email?email=${encodeURIComponent(errorResponse.email)}`);
                throw new Error("Please verify your email first");
            }
            const apiError = handleApiError(error);
            const errorWithFields = new Error(apiError.message) as Error & { fieldErrors?: Record<string, string> };
            errorWithFields.fieldErrors = apiError.fieldErrors;
            throw errorWithFields;
        }
    }, [router]);

    const register = useCallback(async (data: RegisterData) => {
        try {
            const response = await AuthService.register(data);
            if (response.data?.requires_verification || response.data?.email) {
                router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
            } else {
                router.push("/login?registered=true");
            }
        } catch (error) {
            const apiError = handleApiError(error);
            const errorWithFields = new Error(apiError.message) as Error & { fieldErrors?: Record<string, string> };
            errorWithFields.fieldErrors = apiError.fieldErrors;
            throw errorWithFields;
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
                    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
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
                    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
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
                    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
                });
            }
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user, isLoading, isAuthenticated, isProfileComplete,
                login, register, logout,
                updateProfile, updatePassword, deleteProfileImage, refreshUser,
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