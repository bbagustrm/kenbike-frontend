// services/discussion.service.ts
import apiClient from "@/lib/api-client";
import {
    ProductDiscussionsResponse,
    DiscussionResponse,
    DiscussionReplyResponse,
    LikeResponse,
    DiscussionActionResponse,
    UserDiscussionsResponse,
    AdminDiscussionsResponse,
    CreateDiscussionData,
    UpdateDiscussionData,
    CreateDiscussionReplyData,
    UpdateDiscussionReplyData,
    QueryDiscussionsParams,
} from "@/types/discussion";

export class DiscussionService {
    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    /**
     * Get discussions for a product (public)
     */
    static async getProductDiscussions(
        slug: string,
        params?: QueryDiscussionsParams
    ): Promise<ProductDiscussionsResponse> {
        const response = await apiClient.get<ProductDiscussionsResponse>(
            `/discussions/product/${slug}`,
            { params }
        );
        return response.data;
    }

    /**
     * Get single discussion by ID
     */
    static async getDiscussionById(id: string): Promise<DiscussionResponse> {
        const response = await apiClient.get<DiscussionResponse>(`/discussions/${id}`);
        return response.data;
    }

    // ==========================================
    // USER ENDPOINTS
    // ==========================================

    /**
     * Get user's own questions
     */
    static async getMyQuestions(
        page: number = 1,
        limit: number = 10
    ): Promise<UserDiscussionsResponse> {
        const response = await apiClient.get<UserDiscussionsResponse>(
            "/discussions/user/my-questions",
            { params: { page, limit } }
        );
        return response.data;
    }

    /**
     * Create a discussion (ask question)
     */
    static async createDiscussion(data: CreateDiscussionData): Promise<DiscussionResponse> {
        const response = await apiClient.post<DiscussionResponse>("/discussions", data);
        return response.data;
    }

    /**
     * Update a discussion (own question only)
     */
    static async updateDiscussion(
        id: string,
        data: UpdateDiscussionData
    ): Promise<DiscussionResponse> {
        const response = await apiClient.patch<DiscussionResponse>(`/discussions/${id}`, data);
        return response.data;
    }

    /**
     * Delete a discussion (own question or admin)
     */
    static async deleteDiscussion(id: string): Promise<DiscussionActionResponse> {
        const response = await apiClient.delete<DiscussionActionResponse>(`/discussions/${id}`);
        return response.data;
    }

    /**
     * Reply to a discussion
     */
    static async createReply(
        discussionId: string,
        data: CreateDiscussionReplyData
    ): Promise<DiscussionReplyResponse> {
        const response = await apiClient.post<DiscussionReplyResponse>(
            `/discussions/${discussionId}/reply`,
            data
        );
        return response.data;
    }

    /**
     * Update a reply (own reply only)
     */
    static async updateReply(
        replyId: string,
        data: UpdateDiscussionReplyData
    ): Promise<DiscussionReplyResponse> {
        const response = await apiClient.patch<DiscussionReplyResponse>(
            `/discussions/replies/${replyId}`,
            data
        );
        return response.data;
    }

    /**
     * Delete a reply (own reply or admin)
     */
    static async deleteReply(replyId: string): Promise<DiscussionActionResponse> {
        const response = await apiClient.delete<DiscussionActionResponse>(
            `/discussions/replies/${replyId}`
        );
        return response.data;
    }

    /**
     * Toggle like on a discussion
     */
    static async toggleDiscussionLike(discussionId: string): Promise<LikeResponse> {
        const response = await apiClient.post<LikeResponse>(`/discussions/${discussionId}/like`);
        return response.data;
    }

    /**
     * Toggle like on a reply
     */
    static async toggleReplyLike(replyId: string): Promise<LikeResponse> {
        const response = await apiClient.post<LikeResponse>(`/discussions/replies/${replyId}/like`);
        return response.data;
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Get all discussions (admin)
     */
    static async getAdminDiscussions(params?: {
        page?: number;
        limit?: number;
        productId?: string;
        userId?: string;
        hasReplies?: boolean;
        search?: string;
        sortBy?: 'createdAt' | 'likesCount' | 'updatedAt';
        order?: 'asc' | 'desc';
    }): Promise<AdminDiscussionsResponse> {
        const response = await apiClient.get<AdminDiscussionsResponse>(
            "/admin/discussions",
            { params }
        );
        return response.data;
    }

    /**
     * Delete a discussion (admin - can delete any)
     */
    static async adminDeleteDiscussion(id: string): Promise<DiscussionActionResponse> {
        const response = await apiClient.delete<DiscussionActionResponse>(
            `/admin/discussions/${id}`
        );
        return response.data;
    }

    /**
     * Delete a reply (admin - can delete any)
     */
    static async adminDeleteReply(replyId: string): Promise<DiscussionActionResponse> {
        const response = await apiClient.delete<DiscussionActionResponse>(
            `/admin/discussions/replies/${replyId}`
        );
        return response.data;
    }
}