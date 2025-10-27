import apiClient from "@/lib/api-client";
import {
    CreatePromotionData,
    UpdatePromotionData,
    GetPromotionsParams,
    PromotionsResponse,
    PromotionResponse,
    PromotionDetailResponse,
    PromotionActionResponse,
    PromotionStatistics,
    AssignProductResponse,
} from "@/types/promotion";

export class PromotionService {
    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    /**
     * Get active promotions (public)
     */
    static async getActivePromotions(): Promise<PromotionsResponse> {
        const response = await apiClient.get<PromotionsResponse>("/promotions/active");
        return response.data;
    }

    /**
     * Get promotion by ID (public)
     */
    static async getPromotionById(id: string): Promise<PromotionResponse> {
        const response = await apiClient.get<PromotionResponse>(`/promotions/${id}`);
        return response.data;
    }

    // ==========================================
    // ADMIN ENDPOINTS (Owner Only)
    // ==========================================

    /**
     * Get all promotions (admin)
     */
    static async getAdminPromotions(params?: GetPromotionsParams): Promise<PromotionsResponse> {
        const response = await apiClient.get<PromotionsResponse>("/admin/promotions", { params });
        return response.data;
    }

    /**
     * Get promotion detail by ID (admin)
     */
    static async getAdminPromotionById(id: string): Promise<PromotionResponse> {
        const response = await apiClient.get<PromotionResponse>(`/admin/promotions/${id}`);
        return response.data;
    }

    /**
     * Get promotion detail with products
     */
    static async getPromotionDetailWithProducts(id: string): Promise<PromotionDetailResponse> {
        const response = await apiClient.get<PromotionDetailResponse>(
            `/admin/promotions/${id}/details`
        );
        return response.data;
    }

    /**
     * Get promotion statistics
     */
    static async getPromotionStatistics(id: string): Promise<{ data: PromotionStatistics }> {
        const response = await apiClient.get<{ data: PromotionStatistics }>(
            `/admin/promotions/${id}/statistics`
        );
        return response.data;
    }

    /**
     * Create promotion
     */
    static async createPromotion(data: CreatePromotionData): Promise<PromotionResponse> {
        const response = await apiClient.post<PromotionResponse>("/admin/promotions", data);
        return response.data;
    }

    /**
     * Update promotion
     */
    static async updatePromotion(
        id: string,
        data: UpdatePromotionData
    ): Promise<PromotionResponse> {
        const response = await apiClient.patch<PromotionResponse>(`/admin/promotions/${id}`, data);
        return response.data;
    }

    /**
     * Soft delete promotion
     */
    static async deletePromotion(id: string): Promise<PromotionActionResponse> {
        const response = await apiClient.delete<PromotionActionResponse>(`/admin/promotions/${id}`);
        return response.data;
    }

    /**
     * Restore deleted promotion
     */
    static async restorePromotion(id: string): Promise<PromotionResponse> {
        const response = await apiClient.post<PromotionResponse>(`/admin/promotions/${id}/restore`);
        return response.data;
    }

    /**
     * Hard delete promotion (permanent)
     */
    static async hardDeletePromotion(id: string): Promise<PromotionActionResponse> {
        const response = await apiClient.delete<PromotionActionResponse>(
            `/admin/promotions/${id}/permanent`
        );
        return response.data;
    }

    /**
     * Toggle promotion active status
     */
    static async togglePromotionActive(id: string): Promise<PromotionActionResponse> {
        const response = await apiClient.patch<PromotionActionResponse>(
            `/admin/promotions/${id}/toggle-active`
        );
        return response.data;
    }

    /**
     * Assign product to promotion
     */
    static async assignProductToPromotion(
        promotionId: string,
        productId: string
    ): Promise<AssignProductResponse> {
        const response = await apiClient.post<AssignProductResponse>(
            `/admin/promotions/${promotionId}/products/${productId}`
        );
        return response.data;
    }

    /**
     * Remove product from promotion
     */
    static async removeProductFromPromotion(
        promotionId: string,
        productId: string
    ): Promise<PromotionActionResponse> {
        const response = await apiClient.delete<PromotionActionResponse>(
            `/admin/promotions/${promotionId}/products/${productId}`
        );
        return response.data;
    }

    /**
     * Bulk assign products to promotion
     */
    static async bulkAssignProducts(
        promotionId: string,
        productIds: string[]
    ): Promise<PromotionActionResponse> {
        const response = await apiClient.post<PromotionActionResponse>(
            `/admin/promotions/${promotionId}/products/bulk`,
            { productIds }
        );
        return response.data;
    }

    /**
     * Manually trigger auto update promotion status
     */
    static async manualAutoUpdate(): Promise<PromotionActionResponse> {
        const response = await apiClient.post<PromotionActionResponse>(
            "/admin/promotions/auto-update"
        );
        return response.data;
    }
}