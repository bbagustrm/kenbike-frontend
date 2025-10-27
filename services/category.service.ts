import apiClient from "@/lib/api-client";
import {
    CreateCategoryData,
    UpdateCategoryData,
    GetCategoriesParams,
    CategoriesResponse,
    CategoryResponse,
    CategoryActionResponse,
    BulkCategoryActionResponse,
    CategoryStatistics,
} from "@/types/category";

export class CategoryService {
    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    /**
     * Get all categories (public)
     */
    static async getCategories(params?: GetCategoriesParams): Promise<CategoriesResponse> {
        const response = await apiClient.get<CategoriesResponse>("/categories", { params });
        return response.data;
    }

    /**
     * Get categories by slug
     */
    static async getCategoryBySlug(slug: string): Promise<CategoryResponse> {
        const response = await apiClient.get<CategoryResponse>(`/categories/${slug}`);
        return response.data;
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Get all categories (admin)
     */
    static async getAdminCategories(params?: GetCategoriesParams & { onlyDeleted?: boolean }): Promise<CategoriesResponse> {
        const response = await apiClient.get<CategoriesResponse>("/admin/categories", { params });
        return response.data;
    }

    /**
     * Get categories by ID (admin)
     */
    static async getCategoryById(id: string): Promise<CategoryResponse> {
        const response = await apiClient.get<CategoryResponse>(`/admin/categories/${id}`);
        return response.data;
    }

    /**
     * Get categories statistics
     */
    static async getCategoryStatistics(id: string): Promise<{ data: CategoryStatistics }> {
        const response = await apiClient.get<{ data: CategoryStatistics }>(
            `/admin/categories/${id}/statistics`
        );
        return response.data;
    }

    /**
     * Create categories
     */
    static async createCategory(data: CreateCategoryData): Promise<CategoryResponse> {
        const response = await apiClient.post<CategoryResponse>("/admin/categories", data);
        return response.data;
    }

    /**
     * Update categories
     */
    static async updateCategory(id: string, data: UpdateCategoryData): Promise<CategoryResponse> {
        const response = await apiClient.patch<CategoryResponse>(`/admin/categories/${id}`, data);
        return response.data;
    }

    /**
     * Soft delete categories
     */
    static async deleteCategory(id: string): Promise<CategoryActionResponse> {
        const response = await apiClient.delete<CategoryActionResponse>(`/admin/categories/${id}`);
        return response.data;
    }

    /**
     * Restore deleted categories
     */
    static async restoreCategory(id: string): Promise<CategoryResponse> {
        const response = await apiClient.post<CategoryResponse>(`/admin/categories/${id}/restore`);
        return response.data;
    }

    /**
     * Hard delete categories (permanent)
     */
    static async hardDeleteCategory(id: string): Promise<CategoryActionResponse> {
        const response = await apiClient.delete<CategoryActionResponse>(
            `/admin/categories/${id}/permanent`
        );
        return response.data;
    }

    /**
     * Toggle categories active status
     */
    static async toggleCategoryActive(id: string): Promise<CategoryActionResponse> {
        const response = await apiClient.patch<CategoryActionResponse>(
            `/admin/categories/${id}/toggle-active`
        );
        return response.data;
    }

    /**
     * Bulk delete categories
     */
    static async bulkDeleteCategories(ids: string[]): Promise<BulkCategoryActionResponse> {
        const response = await apiClient.post<BulkCategoryActionResponse>(
            "/admin/categories/bulk-delete",
            { ids }
        );
        return response.data;
    }

    /**
     * Bulk restore categories
     */
    static async bulkRestoreCategories(ids: string[]): Promise<BulkCategoryActionResponse> {
        const response = await apiClient.post<BulkCategoryActionResponse>(
            "/admin/categories/bulk-restore",
            { ids }
        );
        return response.data;
    }
}