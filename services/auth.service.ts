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
    CompleteProfileData,
    VerifyOtpData,
    ResendOtpData,
    VerifyOtpResponse,
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

        if (data.phone_number !== undefined) {
            formData.append("phone_number", data.phone_number || "");
        }

        if (data.country !== undefined) {
            formData.append("country", data.country);
        }

        if (data.province !== undefined) {
            formData.append("province", data.province || "");
        }

        if (data.city !== undefined) {
            formData.append("city", data.city || "");
        }

        if (data.district !== undefined) {
            formData.append("district", data.district || "");
        }

        if (data.postal_code !== undefined) {
            formData.append("postal_code", data.postal_code || "");
        }

        if (data.address !== undefined) {
            formData.append("address", data.address || "");
        }

        if (data.profile_image) {
            formData.append("profile_image", data.profile_image);
        }

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

    // Get Google OAuth URL
    static getGoogleAuthUrl(): string {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.kenbike.store';
        return `${apiUrl}/auth/google`;
    }

    // Complete profile (for Google OAuth users)
    static async completeProfile(data: CompleteProfileData): Promise<ApiResponse<User>> {
        const response = await apiClient.post<ApiResponse<User>>(
            "/auth/complete-profile",
            data
        );
        return response.data;
    }

    // Check profile completion status
    static async checkProfileStatus(): Promise<ApiResponse<{ is_profile_complete: boolean }>> {
        const response = await apiClient.get<ApiResponse<{ is_profile_complete: boolean }>>(
            "/auth/profile-status"
        );
        return response.data;
    }

    // ============================================
    // OTP / Email Verification
    // ============================================

    // Verify OTP
    static async verifyOtp(data: VerifyOtpData): Promise<ApiResponse<VerifyOtpResponse>> {
        const response = await apiClient.post<ApiResponse<VerifyOtpResponse>>(
            "/auth/verify-otp",
            data
        );
        return response.data;
    }

    // Resend OTP
    static async resendOtp(data: ResendOtpData): Promise<ApiResponse<{ email: string }>> {
        const response = await apiClient.post<ApiResponse<{ email: string }>>(
            "/auth/resend-otp",
            data
        );
        return response.data;
    }
}