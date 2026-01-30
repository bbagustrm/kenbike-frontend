// types/auth.ts

import { CountryCode } from "@/lib/countries";

export type UserRole = "USER" | "ADMIN" | "OWNER";

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone_number?: string;
    country?: string; // 2-char ISO code (ID, US, GB, etc.)
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    address?: string;
    profile_image?: string;
    role: UserRole;
    is_active?: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: User;
}

export interface RegisterData {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone_number?: string;
    country?: string; // 2-char ISO code (ID, US, GB, etc.)
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    password: string;
    address?: string;
}

export interface RegisterResponse {
    id: string;
    email: string;
    username: string;
    role: UserRole;
}

export interface UpdateProfileData {
    phone_number?: string;
    address?: string;
    country?: string; // 2-char ISO code (ID, US, GB, etc.)
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    profile_image?: File;
}

export interface UpdatePasswordData {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    new_password: string;
    confirm_password: string;
}

export interface ApiResponse<T = unknown> {
    status: "success" | "error";
    code: number;
    message: string;
    data?: T;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: PaginationMeta;
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    sort_by?: string;
    order?: "asc" | "desc";
    includeDeleted?: boolean;
    onlyDeleted?: boolean;
}

export interface CreateUserData extends RegisterData {
    role: UserRole;
}

export interface UpdateUserData {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    country?: string; // 2-char ISO code (ID, US, GB, etc.)
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
}

export interface ChangeUserRoleData {
    role: UserRole;
}

export interface ChangeUserStatusData {
    is_active: boolean;
    reason?: string;
}

// Extended interface for create user with password
export interface CreateUserPayload extends RegisterData {
    role: UserRole;
}

// Extended interface for update profile with file
export interface UpdateProfilePayload {
    phone_number?: string;
    address?: string;
    country?: string; // 2-char ISO code (ID, US, GB, etc.)
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    profile_image?: File;
}