// types/auth.ts
export type UserRole = "USER" | "ADMIN" | "OWNER";

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone_number?: string;
    country?: string;
    address?: string;
    profile_image?: string;
    role: UserRole;
    is_active?: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
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
    country?: string;
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
    country?: string;
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

export interface ApiResponse<T = any> {
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
    role?: UserRole;
    search?: string;
    sort_by?: string;
    order?: "asc" | "desc";
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
    country?: string;
}

export interface ChangeUserRoleData {
    role: UserRole;
}

export interface ChangeUserStatusData {
    is_active: boolean;
    reason?: string;
}