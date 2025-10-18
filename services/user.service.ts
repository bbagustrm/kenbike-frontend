// services/user.service.ts
import apiClient from "@/lib/api-client";
import {
    User,
    GetUsersParams,
    CreateUserData,
    UpdateUserData,
    ChangeUserRoleData,
    ChangeUserStatusData,
    ApiResponse,
    PaginatedResponse,
} from "@/types/auth";

export class UserService {
    // Get all users with pagination and filters
    static async getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
        const response = await apiClient.get<PaginatedResponse<User>>("/admin/users", {
            params,
        });
        return response.data;
    }

    // Get user detail by ID
    static async getUserById(id: string): Promise<ApiResponse<User>> {
        const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
        return response.data;
    }

    // Create new user (admin only)
    static async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
        const response = await apiClient.post<ApiResponse<User>>("/admin/users", data);
        return response.data;
    }

    // Update user
    static async updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<User>> {
        const response = await apiClient.patch<ApiResponse<User>>(
            `/admin/users/${id}`,
            data
        );
        return response.data;
    }

    // Change user role
    static async changeUserRole(
        id: string,
        data: ChangeUserRoleData
    ): Promise<ApiResponse<Partial<User>>> {
        const response = await apiClient.patch<ApiResponse<Partial<User>>>(
            `/admin/users/${id}/role`,
            data
        );
        return response.data;
    }

    // Change user status (suspend/activate)
    static async changeUserStatus(
        id: string,
        data: ChangeUserStatusData
    ): Promise<ApiResponse<Partial<User>>> {
        const response = await apiClient.patch<ApiResponse<Partial<User>>>(
            `/admin/users/${id}/status`,
            data
        );
        return response.data;
    }

    // Delete user
    static async deleteUser(id: string, permanent: boolean = false): Promise<ApiResponse> {
        const response = await apiClient.delete<ApiResponse>(`/admin/users/${id}`, {
            params: { permanent },
        });
        return response.data;
    }

    // Force logout user
    static async forceLogoutUser(id: string): Promise<ApiResponse> {
        const response = await apiClient.post<ApiResponse>(`/admin/users/${id}/force-logout`);
        return response.data;
    }
}