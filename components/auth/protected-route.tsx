"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/types/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = "/login",
}: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            // If not authenticated, redirect to login
            if (!isAuthenticated) {
                router.push(redirectTo);
                return;
            }

            // If authenticated but role not allowed, redirect to unauthorized
            if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                router.push("/unauthorized");
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // If not authenticated or role not allowed, don't render children
    if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
        return null;
    }

    return <>{children}</>;
}