// contexts/auth-context.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
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

    const isAuthenticated = !!user;

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {
        try {
            const accessToken = Cookies.get("access_token");

            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            const response = await AuthService.getCurrentUser();
            setUser(response.data || null);
        } catch (error) {
            console.error("Failed to load user:", error);
            // Clear invalid tokens
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            Cookies.remove("user");
        } finally {
            setIsLoading(false);
        }
    }

    async function login(credentials: LoginCredentials) {
        try {
            const response = await AuthService.login(credentials);
            const { access_token, refresh_token, user: userData } = response.data!;

            // Save tokens in cookies
            Cookies.set("access_token", access_token, {
                expires: 1/96, // 15 minutes
                sameSite: "lax",
            });

            Cookies.set("refresh_token", refresh_token, {
                expires: 7, // 7 days
                sameSite: "lax",
            });

            // Save user data
            setUser(userData);
            Cookies.set("user", JSON.stringify(userData), {
                expires: 7,
                sameSite: "lax",
            });

            // Redirect based on role
            if (userData.role === "ADMIN") {
                router.push("/admin/dashboard");
            } else if (userData.role === "OWNER") {
                router.push("/owner/dashboard");
            } else {
                router.push("/");
            }
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    async function register(data: RegisterData) {
        try {
            await AuthService.register(data);
            router.push("/login?registered=true");
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    async function logout() {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear cookies and state
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            Cookies.remove("user");
            setUser(null);
            router.push("/login");
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
            throw new Error(handleApiError(error));
        }
    }

    async function updatePassword(data: UpdatePasswordData) {
        try {
            await AuthService.updatePassword(data);
        } catch (error) {
            throw new Error(handleApiError(error));
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
            throw new Error(handleApiError(error));
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
            throw new Error(handleApiError(error));
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