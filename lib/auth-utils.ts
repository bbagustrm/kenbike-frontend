import Cookies from "js-cookie";
import { User, UserRole } from "@/types/auth";

/**
 * Get the current user from cookies
 */
export function getCurrentUser(): User | null {
    try {
        const userCookie = Cookies.get("user");
        if (!userCookie) return null;
        return JSON.parse(userCookie);
    } catch (error) {
        console.error("Error parsing user cookie:", error);
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    const accessToken = Cookies.get("access_token");
    return !!accessToken;
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: UserRole): boolean {
    const user = getCurrentUser();
    return user?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: UserRole[]): boolean {
    const user = getCurrentUser();
    return user ? roles.includes(user.role) : false;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
    return hasRole("ADMIN");
}

/**
 * Check if user is owner
 */
export function isOwner(): boolean {
    return hasRole("OWNER");
}

/**
 * Check if user is regular user
 */
export function isUser(): boolean {
    return hasRole("USER");
}

/**
 * Get user initials from name
 */
export function getUserInitials(user: User | null | undefined): string {
    if (!user) {
        return ""; // Bisa juga "?" atau "U" sebagai fallback
    }

    const firstInitial = user.first_name?.[0] ?? '';
    const lastInitial = user.last_name?.[0] ?? '';

    return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Get user full name
 */
export function getUserFullName(user: User): string {
    return `${user.first_name} ${user.last_name}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * Format date and time to readable string
 */
export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Validate password meets requirements
 */
export function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push("Password must contain at least one special character (!@#$%^&*)");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate username format (alphanumeric + underscore)
 */
export function validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
}

/**
 * Validate phone number format (international)
 */
export function validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: never[]) => never>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        return false;
    }
}

/**
 * Generate random string (for temporary passwords, etc.)
 */
export function generateRandomString(length: number = 16): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}