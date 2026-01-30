// services/review.service.ts
import apiClient from "@/lib/api-client";
import {
    ProductReviewsResponse,
    ReviewResponse,
    PendingReviewsResponse,
    ReviewActionResponse,
    CreateReviewData,
    UpdateReviewData,
    QueryReviewsParams,
    AdminReviewsResponse,
} from "@/types/review";

export class ReviewService {
    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    /**
     * Get reviews for a product (public)
     */
    static async getProductReviews(
        slug: string,
        params?: QueryReviewsParams
    ): Promise<ProductReviewsResponse> {
        const response = await apiClient.get<ProductReviewsResponse>(
            `/reviews/product/${slug}`,
            { params }
        );
        return response.data;
    }

    /**
     * Get single review by ID
     */
    static async getReviewById(id: string): Promise<ReviewResponse> {
        const response = await apiClient.get<ReviewResponse>(`/reviews/${id}`);
        return response.data;
    }

    // ==========================================
    // USER ENDPOINTS
    // ==========================================

    /**
     * Get orders eligible for review (pending reviews)
     */
    static async getPendingReviews(): Promise<PendingReviewsResponse> {
        const response = await apiClient.get<PendingReviewsResponse>("/reviews/user/pending");
        return response.data;
    }

    /**
     * Get user's own reviews
     */
    static async getMyReviews(
        page: number = 1,
        limit: number = 10
    ): Promise<ProductReviewsResponse> {
        const response = await apiClient.get<ProductReviewsResponse>("/reviews/user/my-reviews", {
            params: { page, limit },
        });
        return response.data;
    }

    /**
     * Create a review
     */
    static async createReview(data: CreateReviewData): Promise<ReviewResponse> {
        const response = await apiClient.post<ReviewResponse>("/reviews", data);
        return response.data;
    }

    /**
     * Update a review (own review only)
     */
    static async updateReview(id: string, data: UpdateReviewData): Promise<ReviewResponse> {
        const response = await apiClient.patch<ReviewResponse>(`/reviews/${id}`, data);
        return response.data;
    }

    /**
     * Delete a review (own review only)
     */
    static async deleteReview(id: string): Promise<ReviewActionResponse> {
        const response = await apiClient.delete<ReviewActionResponse>(`/reviews/${id}`);
        return response.data;
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Get all reviews (admin)
     */
    static async getAdminReviews(params?: {
        page?: number;
        limit?: number;
        productId?: string;
        userId?: string;
        rating?: number;
        hasReply?: boolean;
        search?: string;
        sortBy?: 'createdAt' | 'rating' | 'updatedAt';
        order?: 'asc' | 'desc';
    }): Promise<AdminReviewsResponse> {
        const response = await apiClient.get<AdminReviewsResponse>("/admin/reviews", { params });
        return response.data;
    }

    /**
     * Reply to a review (admin)
     */
    static async replyToReview(
        reviewId: string,
        content: string
    ): Promise<ReviewResponse> {
        const response = await apiClient.post<ReviewResponse>(
            `/admin/reviews/${reviewId}/reply`,
            { content }
        );
        return response.data;
    }

    /**
     * Update a reply (admin)
     */
    static async updateReply(
        replyId: string,
        content: string
    ): Promise<ReviewResponse> {
        const response = await apiClient.patch<ReviewResponse>(
            `/admin/reviews/replies/${replyId}`,
            { content }
        );
        return response.data;
    }

    /**
     * Delete a reply (admin)
     */
    static async deleteReply(replyId: string): Promise<ReviewActionResponse> {
        const response = await apiClient.delete<ReviewActionResponse>(
            `/admin/reviews/replies/${replyId}`
        );
        return response.data;
    }

    /**
     * Delete a review (admin - can delete any)
     */
    static async adminDeleteReview(id: string): Promise<ReviewActionResponse> {
        const response = await apiClient.delete<ReviewActionResponse>(`/admin/reviews/${id}`);
        return response.data;
    }
}