import apiClient from "@/lib/api-client";
import {
    CreateTagData,
    UpdateTagData,
    GetTagsParams,
    TagsResponse,
    TagResponse,
    TagActionResponse,
    BulkTagActionResponse,
    TagStatistics,
} from "@/types/tag";

export class TagService {
    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    /**
     * Get all tags (public)
     */
    static async getTags(params?: GetTagsParams): Promise<TagsResponse> {
        const response = await apiClient.get<TagsResponse>("/tags", { params });
        return response.data;
    }

    /**
     * Get tag by slug
     */
    static async getTagBySlug(slug: string): Promise<TagResponse> {
        const response = await apiClient.get<TagResponse>(`/tags/${slug}`);
        return response.data;
    }

    /**
     * Get popular tags
     */
    static async getPopularTags(limit: number = 10): Promise<TagsResponse> {
        const response = await apiClient.get<TagsResponse>("/tags/popular", {
            params: { limit },
        });
        return response.data;
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Get all tags (admin)
     */
    static async getAdminTags(params?: GetTagsParams): Promise<TagsResponse> {
        const response = await apiClient.get<TagsResponse>("/admin/tags", { params });
        return response.data;
    }

    /**
     * Get tag by ID (admin)
     */
    static async getTagById(id: string): Promise<TagResponse> {
        const response = await apiClient.get<TagResponse>(`/admin/tags/${id}`);
        return response.data;
    }

    /**
     * Get tag statistics
     */
    static async getTagStatistics(id: string): Promise<{ data: TagStatistics }> {
        const response = await apiClient.get<{ data: TagStatistics }>(
            `/admin/tags/${id}/statistics`
        );
        return response.data;
    }

    /**
     * Create tag
     */
    static async createTag(data: CreateTagData): Promise<TagResponse> {
        const response = await apiClient.post<TagResponse>("/admin/tags", data);
        return response.data;
    }

    /**
     * Update tag
     */
    static async updateTag(id: string, data: UpdateTagData): Promise<TagResponse> {
        const response = await apiClient.patch<TagResponse>(`/admin/tags/${id}`, data);
        return response.data;
    }

    /**
     * Soft delete tag
     */
    static async deleteTag(id: string): Promise<TagActionResponse> {
        const response = await apiClient.delete<TagActionResponse>(`/admin/tags/${id}`);
        return response.data;
    }

    /**
     * Restore deleted tag
     */
    static async restoreTag(id: string): Promise<TagResponse> {
        const response = await apiClient.post<TagResponse>(`/admin/tags/${id}/restore`);
        return response.data;
    }

    /**
     * Hard delete tag (permanent)
     */
    static async hardDeleteTag(id: string): Promise<TagActionResponse> {
        const response = await apiClient.delete<TagActionResponse>(`/admin/tags/${id}/permanent`);
        return response.data;
    }

    /**
     * Toggle tag active status
     */
    static async toggleTagActive(id: string): Promise<TagActionResponse> {
        const response = await apiClient.patch<TagActionResponse>(`/admin/tags/${id}/toggle-active`);
        return response.data;
    }

    /**
     * Bulk delete tags
     */
    static async bulkDeleteTags(ids: string[]): Promise<BulkTagActionResponse> {
        const response = await apiClient.post<BulkTagActionResponse>("/admin/tags/bulk-delete", {
            ids,
        });
        return response.data;
    }

    /**
     * Bulk restore tags
     */
    static async bulkRestoreTags(ids: string[]): Promise<BulkTagActionResponse> {
        const response = await apiClient.post<BulkTagActionResponse>("/admin/tags/bulk-restore", {
            ids,
        });
        return response.data;
    }
}