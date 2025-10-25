"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const isAuthenticated = !!user;

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    // Set up periodic token check (every 5 minutes)
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            checkTokenValidity();
        }, 5 * 60 * 1000); // Check every 5 minutes

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    async function checkTokenValidity() {
        const accessToken = Cookies.get("access_token");

        if (!accessToken) {
            console.log("⚠️ No access token found, logging out...");
            await logout();
            return;
        }

        try {
            // Try to decode and check expiry
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            const expiresAt = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();

            // If token expires in less than 2 minutes, try to refresh
            if (expiresAt - now < 2 * 60 * 1000) {
                console.log("⏰ Token expiring soon, will be auto-refreshed on next request");
            }
        } catch (error) {
            console.error("❌ Error checking token validity:", error);
        }
    }

    async function loadUser() {
        try {
            const accessToken = Cookies.get("access_token");
            const userCookie = Cookies.get("user");

            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            // First, try to load from cookie (faster)
            if (userCookie) {
                try {
                    const cachedUser = JSON.parse(userCookie);
                    setUser(cachedUser);
                } catch (error) {
                    console.error("Error parsing user cookie:", error);
                }
            }

            // Then, fetch fresh data from API
            const response = await AuthService.getCurrentUser();
            const freshUser = response.data;

            if (freshUser) {
                setUser(freshUser);

                // Update cookie with fresh data
                Cookies.set("user", JSON.stringify(freshUser), {
                    expires: 7,
                    sameSite: "lax",
                });
            }
        } catch (error) {
            console.error("Failed to load user:", error);

            // Clear invalid tokens
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            Cookies.remove("user");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function login(credentials: LoginCredentials) {
        try {
            const response = await AuthService.login(credentials);
            const { access_token, refresh_token, expires_in, user: userData } = response.data!;

            // Calculate expiry time in days (expires_in is in seconds)
            const accessTokenExpiryDays = expires_in / (60 * 60 * 24);

            // Save access token (15 minutes = 900 seconds = 0.0104 days)
            Cookies.set("access_token", access_token, {
                expires: accessTokenExpiryDays,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });

            // Save refresh token (7 days)
            Cookies.set("refresh_token", refresh_token, {
                expires: 7,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });

            // Save user data
            setUser(userData);
            Cookies.set("user", JSON.stringify(userData), {
                expires: 7,
                sameSite: "lax",
            });

            console.log("✅ Login successful");
            console.log("🔑 Access token expires in:", expires_in, "seconds");

            // Get redirect path from query params or default based on role
            const searchParams = new URLSearchParams(window.location.search);
            const redirect = searchParams.get("redirect");

            if (redirect) {
                router.push(redirect);
            } else if (userData.role === "ADMIN") {
                router.push("/admin/users");
            } else if (userData.role === "OWNER") {
                router.push("/owner/dashboard");
            } else {
                router.push("/");
            }
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }

    async function register(data: RegisterData) {
        try {
            await AuthService.register(data);
            router.push("/login?registered=true");
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }

    async function logout() {
        try {
            // Try to logout from backend (blacklist token)
            await AuthService.logout();
        } catch (error) {
            console.error("Logout error:", error);
            // Continue with logout even if API call fails
        } finally {
            // Clear cookies and state
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            Cookies.remove("user");
            setUser(null);

            console.log("👋 Logged out successfully");

            // Redirect to login with current path
            const currentPath = pathname || "/";
            if (!currentPath.startsWith("/login")) {
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            }
        }
    }

    async function updateProfile(data: UpdateProfileData) {
        try {
            const response = await AuthService.updateProfile(data);

            // Update user state with new data
            if (user && response.data) {
                const updatedUser = { ...user, ...response.data };
                setUser(updatedUser);
                Cookies.set("user", JSON.stringify(updatedUser), {
                    expires: 7,
                    sameSite: "lax",
                });
            }
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }

    async function updatePassword(data: UpdatePasswordData) {
        try {
            await AuthService.updatePassword(data);
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }

    async function deleteProfileImage() {
        try {
            await AuthService.deleteProfileImage();

            // Update user state
            if (user) {
                const updatedUser = { ...user, profile_image: undefined };
                setUser(updatedUser);
                Cookies.set("user", JSON.stringify(updatedUser), {
                    expires: 7,
                    sameSite: "lax",
                });
            }
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }

    async function refreshUser() {
        try {
            const response = await AuthService.getCurrentUser();
            const updatedUser = response.data;

            if (updatedUser) {
                setUser(updatedUser);
                Cookies.set("user", JSON.stringify(updatedUser), {
                    expires: 7,
                    sameSite: "lax",
                });
            }
        } catch (error) {
            throw new Error(handleApiError(error).message);
        }
    }

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