// services/auth.service.ts
import apiClient from "@/lib/api-client";
import {
    LoginCredentials,
    LoginResponse,
    RegisterData,
    RegisterResponse,
    User,
    UpdateProfileData,
    UpdatePasswordData,
    ForgotPasswordData,
    ResetPasswordData,
    ApiResponse,
} from "@/types/auth";

export class AuthService {
    // Register new user
    static async register(data: RegisterData): Promise<ApiResponse<RegisterResponse>> {
        const response = await apiClient.post<ApiResponse<RegisterResponse>>(
            "/auth/register",
            data
        );
        return response.data;
    }

    // Login
    static async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
        const response = await apiClient.post<ApiResponse<LoginResponse>>(
            "/auth/login",
            credentials
        );
        return response.data;
    }

    // Refresh token
    static async refreshToken(refreshToken: string): Promise<ApiResponse<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>> {
        const response = await apiClient.post("/auth/refresh", {
            refresh_token: refreshToken,
        });
        return response.data;
    }

    // Get current user profile
    static async getCurrentUser(): Promise<ApiResponse<User>> {
        const response = await apiClient.get<ApiResponse<User>>("/auth/me");
        return response.data;
    }

    // Update profile
    static async updateProfile(data: UpdateProfileData): Promise<ApiResponse<Partial<User>>> {
        const formData = new FormData();

        // Phone number
        if (data.phone_number !== undefined) {
            formData.append("phone_number", data.phone_number || "");
        }

        // Country (2-char ISO code: ID, US, GB, etc.)
        if (data.country !== undefined) {
            formData.append("country", data.country);
        }

        // Province
        if (data.province !== undefined) {
            formData.append("province", data.province || "");
        }

        // City
        if (data.city !== undefined) {
            formData.append("city", data.city || "");
        }

        // District
        if (data.district !== undefined) {
            formData.append("district", data.district || "");
        }

        // Postal code
        if (data.postal_code !== undefined) {
            formData.append("postal_code", data.postal_code || "");
        }

        // Address
        if (data.address !== undefined) {
            formData.append("address", data.address || "");
        }

        // Profile image
        if (data.profile_image) {
            formData.append("profile_image", data.profile_image);
        }

        // Debug log
        console.log("📤 FormData entries:");
        formData.forEach((value, key) => {
            console.log(`  ${key}:`, value);
        });

        const response = await apiClient.patch<ApiResponse<Partial<User>>>(
            "/auth/profile",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    }

    // Update password
    static async updatePassword(data: UpdatePasswordData): Promise<ApiResponse> {
        const response = await apiClient.patch<ApiResponse>("/auth/password", data);
        return response.data;
    }

    // Delete profile image
    static async deleteProfileImage(): Promise<ApiResponse> {
        const response = await apiClient.delete<ApiResponse>("/auth/profile-image");
        return response.data;
    }

    // Forgot password
    static async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
        const response = await apiClient.post<ApiResponse>("/auth/forgot-password", data);
        return response.data;
    }

    // Reset password
    static async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
        const response = await apiClient.post<ApiResponse>("/auth/reset-password", data);
        return response.data;
    }

    // Logout
    static async logout(): Promise<ApiResponse> {
        const response = await apiClient.post<ApiResponse>("/auth/logout");
        return response.data;
    }
}